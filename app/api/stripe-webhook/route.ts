import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { updateBookingPaymentStatus } from "@/app/bookings/actions" // Import the new action

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
})

export async function POST(req: Request) {
  const body = await req.text()
  const incomingHeaders = await headers()
  const signature = incomingHeaders.get("stripe-signature")

  if (!signature) {
    return new NextResponse("No stripe-signature header found", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      const bookingId = checkoutSession.metadata?.bookingId
      const checkoutSessionId = checkoutSession.id

      if (bookingId && checkoutSessionId) {
        console.log(`Stripe Checkout Session Completed for Booking ID: ${bookingId}, Session ID: ${checkoutSessionId}`)
        // Update your booking in the database to 'paid'
        const result = await updateBookingPaymentStatus(checkoutSessionId, "paid")
        if (!result.success) {
          console.error(`Failed to update booking payment status for ${bookingId}: ${result.message}`)
          return new NextResponse(`Failed to update booking payment status: ${result.message}`, { status: 500 })
        }
      } else {
        console.warn("Checkout session completed event missing bookingId or session ID in metadata.")
      }
      break
    // Add other event types you want to handle (e.g., payment_intent.succeeded, payment_intent.payment_failed)
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  // Return a 200 response to acknowledge receipt of the event
  return new NextResponse("Received", { status: 200 })
}
