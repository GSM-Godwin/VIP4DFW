"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { getUser } from "@/app/auth/actions"
import Stripe from "stripe"
import { headers } from "next/headers"
import { format } from "date-fns"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
})

export async function createBooking(
  prevState: { success: boolean; message: string; booking?: any; redirectUrl?: string },
  formData: FormData,
) {
  const user = await getUser()
  if (!user) {
    return { success: false, message: "You must be logged in to create a booking." }
  }

  const pickupLocation = formData.get("pickup-location") as string
  const dropoffLocation = formData.get("dropoff-location") as string
  const pickupTimeStr = formData.get("date-time") as string
  const numPassengers = Number.parseInt(formData.get("passengers") as string)
  const contactName = formData.get("contact-name") as string
  const contactEmail = formData.get("contact-email") as string
  const contactPhone = formData.get("contact-phone") as string
  const paymentMethod = formData.get("payment-method") as string // New: Get payment method

  if (
    !pickupLocation ||
    !dropoffLocation ||
    !pickupTimeStr ||
    isNaN(numPassengers) ||
    numPassengers < 1 ||
    !contactName ||
    !contactEmail ||
    !contactPhone ||
    !paymentMethod
  ) {
    return { success: false, message: "All booking fields and payment method are required." }
  }

  const pickupTime = new Date(pickupTimeStr)
  if (isNaN(pickupTime.getTime())) {
    return { success: false, message: "Invalid date and time." }
  }

  const supabase = await createSupabaseServerClient()

  let serviceType = "city_ride"
  let flatRateAmount: number | null = null
  let totalPrice = 0

  const isDFW = (loc: string) => loc.toLowerCase().includes("dfw")
  const isDAL = (loc: string) => loc.toLowerCase().includes("dallas love field")

  const isAirportTransfer =
    (isDFW(pickupLocation) && !isDFW(dropoffLocation)) ||
    (!isDFW(pickupLocation) && isDFW(dropoffLocation)) ||
    (isDAL(pickupLocation) && !isDAL(dropoffLocation)) ||
    (!isDAL(pickupLocation) && isDAL(dropoffLocation))

  if (isAirportTransfer) {
    serviceType = "airport_transfer"
    flatRateAmount = 85.0
    totalPrice = flatRateAmount
  } else {
    totalPrice = 100.0 // Placeholder price for non-airport rides
  }

  // Determine initial payment status based on method
  const paymentStatus = paymentMethod === "cash" ? "pending_cash" : "unpaid"

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      pickup_time: pickupTime.toISOString(),
      num_passengers: numPassengers,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      service_type: serviceType,
      flat_rate_amount: flatRateAmount,
      total_price: totalPrice,
      status: "pending",
      payment_status: paymentStatus, // Use determined payment status
    })
    .select()
    .single()

  if (bookingError) {
    console.error("Error creating booking:", bookingError.message)
    return { success: false, message: `Failed to create booking: ${bookingError.message}` }
  }

  if (paymentMethod === "card") {
    console.log("Booking ID before Stripe session creation:", booking.id)
    try {
      const origin = (await headers()).get("origin") // Await the headers() call

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${serviceType.replace(/_/g, " ")} from ${pickupLocation} to ${dropoffLocation}`,
                description: `For ${numPassengers} passengers on ${format(pickupTime, "PPP p")}`,
              },
              unit_amount: Math.round(totalPrice * 100), // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/dashboard?payment_success=true&booking_id=${booking.id}`, // Redirect to dashboard on success
        cancel_url: `${origin}/dashboard?payment_cancelled=true&booking_id=${booking.id}`, // Redirect to dashboard on cancel
        metadata: {
          booking_id: booking.id, // Pass booking ID to Stripe for webhook processing
          user_id: user.id,
        },
        customer_email: contactEmail, // Pre-fill customer email
      })

      if (session.url) {
        return { success: true, message: "Redirecting to payment...", redirectUrl: session.url }
      } else {
        return { success: false, message: "Failed to create Stripe checkout session." }
      }
    } catch (stripeError: any) {
      console.error("Stripe error:", stripeError.message)
      // Optionally update booking status to 'payment_failed' here
      await supabase.from("bookings").update({ payment_status: "failed" }).eq("id", booking.id)
      return { success: false, message: `Payment processing error: ${stripeError.message}` }
    }
  } else {
    // Cash payment
    return { success: true, message: "Booking confirmed! Cash payment due upon arrival.", booking: booking }
  }
}

export async function getUserBookings() {
  const user = await getUser()
  if (!user) {
    return { success: false, message: "You must be logged in to view bookings.", bookings: [] }
  }

  const supabase = await createSupabaseServerClient()
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("pickup_time", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error.message)
    return { success: false, message: `Failed to fetch bookings: ${error.message}`, bookings: [] }
  }

  return { success: true, message: "Bookings fetched successfully.", bookings: bookings }
}
