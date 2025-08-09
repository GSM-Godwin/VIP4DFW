"use server"
import { format } from "date-fns"
import prisma from "@/lib/prisma" // Import Prisma client
import { getServerSession } from "next-auth" // Import getServerSession directly from next-auth
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email" // Import email utility
import Stripe from "stripe" // NEW: Import Stripe

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil", // Use a recent API version
})

export async function createBooking(
  prevState: { success: boolean; message: string; booking?: any; redirectUrl?: string },
  formData: FormData,
) {
  const session = await getServerSession() // Get session on the server

  console.error(`BOOKING_DEBUG: Full session object: ${JSON.stringify(session, null, 2)}`)
  const userId = session?.user?.id || null // Get user ID from session, or null for guests
  console.error(`BOOKING_DEBUG: Extracted user ID: ${userId}`)

  const pickupLocation = formData.get("pickup-location") as string
  const dropoffLocation = formData.get("dropoff-location") as string
  const pickupTimeStr = formData.get("date-time") as string
  const numPassengers = Number.parseInt(formData.get("passengers") as string)
  const contactName = formData.get("contact-name") as string
  const contactEmail = formData.get("contact-email") as string
  const contactPhone = formData.get("contact-phone") as string
  const carType = formData.get("car-type") as string
  const paymentMethod = formData.get("payment-method") as string // NEW: Get payment method

  if (
    !pickupLocation ||
    !dropoffLocation ||
    !pickupTimeStr ||
    isNaN(numPassengers) ||
    numPassengers < 1 ||
    !contactName ||
    !contactEmail ||
    !contactPhone ||
    !carType ||
    !paymentMethod
  ) {
    return { success: false, message: "All booking fields, car type, and payment method are required." }
  }

  const pickupTime = new Date(pickupTimeStr)
  if (isNaN(pickupTime.getTime())) {
    return { success: false, message: "Invalid date and time." }
  }

  let serviceType = "city_ride"
  let flatRateAmount: number | null = null
  let totalPrice = 0

  const isDFW = (loc: string) => loc.toLowerCase().includes("dfw")
  const isDAL = (loc: string) => loc.toLowerCase().includes("dallas love field")

  const isAirportTransfer =
    (isDFW(pickupLocation) && !isDFW(dropoffLocation)) ||
    (!isDFW(pickupLocation) && isDFW(dropoffLocation)) ||
    (isDAL(pickupLocation) && !isDAL(dropoffLocation)) ||
    (isDAL(pickupLocation) && isDAL(dropoffLocation)) // Consider DAL to DAL as airport transfer if needed

  if (isAirportTransfer) {
    serviceType = "airport_transfer"
    flatRateAmount = 85.0
    totalPrice = flatRateAmount
  } else {
    totalPrice = 100.0 // Placeholder price for non-airport rides
  }

  let booking
  let checkoutSessionUrl: string | null = null
  const initialPaymentStatus: string = paymentMethod === "cash" ? "pending_cash" : "unpaid" // 'unpaid' for card until webhook confirms

  try {
    // Create booking first, potentially without checkoutSessionId if cash
    booking = await prisma.booking.create({
      data: {
        userId: userId,
        pickupLocation: pickupLocation,
        dropoffLocation: dropoffLocation,
        pickupTime: pickupTime,
        numPassengers: numPassengers,
        contactName: contactName,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
        serviceType: serviceType,
        flatRateAmount: totalPrice,
        totalPrice: totalPrice,
        status: "pending",
        paymentStatus: initialPaymentStatus,
        carType: carType,
      },
    })

    if (paymentMethod === "card") {
      if (!process.env.NEXTAUTH_URL) {
        throw new Error("NEXTAUTH_URL is not defined in environment variables.")
      }
      const successUrl = `${process.env.NEXTAUTH_URL}/booking-success-guest?booking_id=${booking.id}&payment_status=paid`
      const cancelUrl = `${process.env.NEXTAUTH_URL}/booking-success-guest?booking_id=${booking.id}&payment_status=cancelled`

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `VIP4DFW Ride: ${pickupLocation} to ${dropoffLocation}`,
                description: `Booking ID: ${booking.id} - ${carType} for ${numPassengers} passengers on ${format(pickupTime, "PPP p")}`,
              },
              unit_amount: Math.round(totalPrice * 100), // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          bookingId: booking.id, // Pass booking ID to webhook
        },
        customer_email: contactEmail, // Pre-fill customer email
      })

      if (session.url) {
        checkoutSessionUrl = session.url
        // Update booking with checkoutSessionId
        await prisma.booking.update({
          where: { id: booking.id },
          data: { checkoutSessionId: session.id },
        })
      } else {
        throw new Error("Failed to create Stripe Checkout session URL.")
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      const adminDashboardUrl = `${process.env.NEXTAUTH_URL}/admin/dashboard?bookingId=${booking.id}`
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New VIP4DFW Booking Alert!</title>
            <style>
                body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
                .container { background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { color: #ff8c00; font-size: 28px; font-weight: bold; text-align: center; margin: 30px 0; }
                .paragraph { color: #525f7f; font-size: 16px; line-height: 24px; text-align: left; padding: 0 30px; }
                .heading { color: #333; font-size: 18px; font-weight: bold; margin-bottom: 10px; padding: 0 30px; }
                .button { background-color: #ff8c00; border-radius: 5px; color: #000; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: block; width: 210px; padding: 14px 7px; margin: 20px auto; }
                .hr { border-color: #e6ebf1; margin: 20px 0; }
                .section { padding: 0 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="header">New VIP4DFW Booking Alert!</h1>
                <p class="paragraph">A new booking has been placed on VIP4DFW.</p>
                <hr class="hr" />
                <div class="section">
                    <p class="heading">Booking Details:</p>
                    <p class="paragraph"><strong>Booking ID:</strong> ${booking.id}</p>
                    <p class="paragraph"><strong>Pickup:</strong> ${booking.pickupLocation}</p>
                    <p class="paragraph"><strong>Drop-off:</strong> ${booking.dropoffLocation}</p>
                    <p class="paragraph"><strong>Pickup Time:</strong> ${format(booking.pickupTime, "PPP p")}</p>
                    <p class="paragraph"><strong>Car Type:</strong> ${booking.carType}</p>
                    <p class="paragraph"><strong>Total Price:</strong> $${booking.totalPrice.toFixed(2)}</p>
                    <p class="paragraph"><strong>Payment Method:</strong> ${paymentMethod === "cash" ? "Cash on Arrival" : "Credit Card (via Stripe)"}</p>
                    <p class="paragraph"><strong>Payment Status:</strong> ${initialPaymentStatus}</p>
                </div>
                <hr class="hr" />
                <div class="section">
                    <p class="heading">Client Contact Info:</p>
                    <p class="paragraph"><strong>Name:</strong> ${booking.contactName}</p>
                    <p class="paragraph"><strong>Email:</strong> ${booking.contactEmail}</p>
                    <p class="paragraph"><strong>Phone:</strong> ${booking.contactPhone}</p>
                </div>
                <hr class="hr" />
                <p class="paragraph">
                    Please review this booking and take action in the admin dashboard:
                </p>
                <a href="${adminDashboardUrl}" class="button">
                    Go to Admin Dashboard
                </a>
                <p class="paragraph">
                    Thank you,<br />The VIP4DFW Team
                </p>
            </div>
        </body>
        </html>
      `
      await sendEmail({
        to: adminEmail,
        subject: `New VIP4DFW Booking: ${booking.id}`,
        html: emailHtml,
      })
    } else {
      console.warn("ADMIN_EMAIL environment variable is not set. Admin notification email skipped.")
    }
  } catch (error: any) {
    console.error("Error creating booking or Stripe session:", error.message)
    return { success: false, message: `Failed to create booking: ${error.message}` }
  }

  if (checkoutSessionUrl) {
    return { success: true, message: "Redirecting to payment...", redirectUrl: checkoutSessionUrl }
  } else {
    // For cash bookings
    if (!userId) {
      return {
        success: true,
        message: "Booking confirmed! Redirecting to guest success page...",
        redirectUrl: `/booking-success-guest?booking_id=${booking.id}&payment_status=pending_cash`,
      }
    }
    return { success: true, message: "Booking confirmed! Cash payment due upon arrival.", booking: booking }
  }
}

export async function getUserBookings() {
  const session = await getServerSession()
  const userId = session?.user?.id

  console.error(`DASHBOARD_BOOKINGS_DEBUG: Session user ID in getUserBookings: ${userId}`)

  if (!userId) {
    return { success: false, message: "You must be logged in to view bookings.", bookings: [] }
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: userId },
      orderBy: { pickupTime: "desc" },
    })

    const serializedBookings = bookings.map((booking) => ({
      ...booking,
      totalPrice: Number(booking.totalPrice),
      flatRateAmount: booking.flatRateAmount ? Number(booking.flatRateAmount) : null,
      hourlyRate: booking.hourlyRate ? Number(booking.hourlyRate) : null,
    }))

    return { success: true, message: "Bookings fetched successfully.", bookings: serializedBookings }
  } catch (error: any) {
    console.error("Error fetching bookings with Prisma:", error.message)
    return { success: false, message: `Failed to fetch bookings: ${error.message}`, bookings: [] }
  }
}

// --- NEW: Admin Booking Actions ---

interface BookingFilter {
  status?: "all" | "pending" | "confirmed" | "declined" | "completed" | "cancelled"
}

export async function getAdminBookings(filter: BookingFilter = {}) {
  const session = await getServerSession()
  // Check if user is admin
  // if (!session || (session.user as any).role !== "admin") {
  //   return { success: false, message: "Unauthorized: You must be an admin to view all bookings.", bookings: [] }
  // }

  try {
    const whereClause: any = {}
    if (filter.status && filter.status !== "all") {
      whereClause.status = filter.status
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }, // Order by creation time for admin view
    })

    const serializedBookings = bookings.map((booking) => ({
      ...booking,
      totalPrice: Number(booking.totalPrice),
      flatRateAmount: booking.flatRateAmount ? Number(booking.flatRateAmount) : null,
      hourlyRate: booking.hourlyRate ? Number(booking.hourlyRate) : null,
      // Ensure driverLatitude and driverLongitude are serialized
      driverLatitude: booking.driverLatitude ? Number(booking.driverLatitude) : null,
      driverLongitude: booking.driverLongitude ? Number(booking.driverLongitude) : null,
    }))

    return { success: true, message: "Admin bookings fetched successfully.", bookings: serializedBookings }
  } catch (error: any) {
    console.error("Error fetching admin bookings with Prisma:", error.message)
    return { success: false, message: `Failed to fetch admin bookings: ${error.message}`, bookings: [] }
  }
}

export async function updateBookingStatus(bookingId: string, newStatus: "confirmed" | "declined") {
  const session = await getServerSession()
  // if (!session || (session.user as any).role !== "admin") {
  //   return { success: false, message: "Unauthorized: Only admins can update booking status." }
  // }

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    })

    // Send email to user based on status
    const userEmail = updatedBooking.contactEmail
    const subject =
      newStatus === "confirmed" ? "Your VIP4DFW Booking is Confirmed!" : "Update Regarding Your VIP4DFW Booking"
    let emailHtml = ""

    if (newStatus === "confirmed") {
      const trackingLink = `${process.env.NEXTAUTH_URL}/track/${bookingId}`
      emailHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Your VIP4DFW Booking is Confirmed!</title>
              <style>
                  body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
                  .container { background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                  .header { color: #ff8c00; font-size: 28px; font-weight: bold; text-align: center; margin: 30px 0; }
                  .paragraph { color: #525f7f; font-size: 16px; line-height: 24px; text-align: left; padding: 0 30px; }
                  .button { background-color: #ff8c00; border-radius: 5px; color: #000; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: block; width: 210px; padding: 14px 7px; margin: 20px auto; }
                  .hr { border-color: #e6ebf1; margin: 20px 0; }
                  .section { padding: 0 30px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1 class="header">Your Booking is Confirmed!</h1>
                  <p class="paragraph">Dear ${updatedBooking.contactName},</p>
                  <p class="paragraph">Good news! Your VIP4DFW booking (ID: <strong>${updatedBooking.id}</strong>) for <strong>${format(updatedBooking.pickupTime, "PPP p")}</strong> from <strong>${updatedBooking.pickupLocation}</strong> to <strong>${updatedBooking.dropoffLocation}</strong> has been confirmed.</p>
                  <p class="paragraph">Your chosen vehicle is a <strong>${updatedBooking.carType}</strong>.</p>
                  <p class="paragraph">The total price for your trip is: <strong>$${updatedBooking.totalPrice.toFixed(2)}</strong>.</p>
                  <p class="paragraph">You can track your driver's live location once the trip begins:</p>
                  <a href="${trackingLink}" class="button">
                      Track Your Ride
                  </a>
                  <p class="paragraph">
                      Thank you for choosing VIP4DFW!
                      <br />The VIP4DFW Team
                  </p>
              </div>
          </body>
          </html>
        `
    } else if (newStatus === "declined") {
      emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Update Regarding Your VIP4DFW Booking</title>
            <style>
                body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
                .container { background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; margin-bottom: 64px; max-width: 600px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { color: #ff8c00; font-size: 28px; font-weight: bold; text-align: center; margin: 30px 0; }
                .paragraph { color: #525f7f; font-size: 16px; line-height: 24px; text-align: left; padding: 0 30px; }
                .button { background-color: #ff8c00; border-radius: 5px; color: #000; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; display: block; width: 210px; padding: 14px 7px; margin: 20px auto; }
                .hr { border-color: #e6ebf1; margin: 20px 0; }
                .section { padding: 0 30px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="header">Update Regarding Your VIP4DFW Booking</h1>
                <p class="paragraph">Dear ${updatedBooking.contactName},</p>
                <p class="paragraph">We regret to inform you that your VIP4DFW booking (ID: <strong>${updatedBooking.id}</strong>) for <strong>${format(updatedBooking.pickupTime, "PPP p")}</strong> from <strong>${updatedBooking.pickupLocation}</strong> to <strong>${updatedBooking.dropoffLocation}</strong> has been declined.</p>
                <p class="paragraph">The total price for your trip was: <strong>$${updatedBooking.totalPrice.toFixed(2)}</strong>.</p>
                <p class="paragraph">This may be due to unavailability of vehicles or drivers at the requested time. We apologize for any inconvenience this may cause.</p>
                <p class="paragraph">Please feel free to contact us if you have any questions or would like to try booking for a different time.</p>
                <p class="paragraph">
                    Thank you,<br />The VIP4DFW Team
                </p>
            </div>
        </body>
        </html>
      `
    }

    if (userEmail && emailHtml) {
      await sendEmail({
        to: userEmail,
        subject: subject,
        html: emailHtml,
      })
    } else {
      console.warn(`User email or email HTML missing for booking ${bookingId}. User notification skipped.`)
    }

    revalidatePath("/admin/dashboard") // Revalidate admin dashboard to show updated status
    revalidatePath("/dashboard") // Revalidate user dashboard if they have this booking

    return { success: true, message: `Booking ${bookingId} status updated to ${newStatus}.` }
  } catch (error: any) {
    console.error("Error updating booking status:", error.message)
    return { success: false, message: `Failed to update booking status: ${error.message}` }
  }
}

// Server Action to update driver location
export async function updateDriverLocation(bookingId: string, latitude: number, longitude: number) {
  const session = await getServerSession()
  // Ensure only admins can update driver location
  // if (!session || (session.user as any).role !== "admin") {
  //   return { success: false, message: "Unauthorized: Only admins can update driver location." }
  // }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        driverLatitude: latitude,
        driverLongitude: longitude,
      },
    })
    revalidatePath(`/track/${bookingId}`) // Revalidate the tracking page to show new location
    return { success: true, message: "Driver location updated successfully." }
  } catch (error: any) {
    console.error("Error updating driver location:", error.message)
    return { success: false, message: `Failed to update driver location: ${error.message}` }
  }
}

// NEW: Server Action to get a single booking by ID
export async function getBookingById(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return { success: false, message: "Booking not found.", booking: null }
    }

    // Serialize Decimal types to Number for client-side consumption
    const serializedBooking = {
      ...booking,
      totalPrice: Number(booking.totalPrice),
      flatRateAmount: booking.flatRateAmount ? Number(booking.flatRateAmount) : null,
      hourlyRate: booking.hourlyRate ? Number(booking.hourlyRate) : null,
      driverLatitude: booking.driverLatitude ? Number(booking.driverLatitude) : null,
      driverLongitude: booking.driverLongitude ? Number(booking.driverLongitude) : null,
    }

    return { success: true, message: "Booking fetched successfully.", booking: serializedBooking }
  } catch (error: any) {
    console.error("Error fetching single booking:", error.message)
    return { success: false, message: `Failed to fetch booking: ${error.message}`, booking: null }
  }
}

// NEW: Server Action to update booking payment status (for webhooks)
export async function updateBookingPaymentStatus(checkoutSessionId: string, newPaymentStatus: string) {
  try {
    const booking = await prisma.booking.update({
      where: { checkoutSessionId: checkoutSessionId },
      data: { paymentStatus: newPaymentStatus },
    })
    revalidatePath("/admin/dashboard") // Revalidate admin dashboard
    revalidatePath("/dashboard") // Revalidate user dashboard
    return { success: true, message: `Booking ${booking.id} payment status updated to ${newPaymentStatus}.` }
  } catch (error: any) {
    console.error("Error updating booking payment status via webhook:", error.message)
    return { success: false, message: `Failed to update payment status: ${error.message}` }
  }
}
