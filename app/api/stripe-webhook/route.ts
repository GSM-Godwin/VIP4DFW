import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { confirmTipPayment } from "@/app/bookings/actions"
import prisma from "@/lib/prisma"

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
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const bookingId = paymentIntent.metadata?.bookingId
      const paymentType = paymentIntent.metadata?.type

      if (bookingId && paymentType === "tip") {
        console.log(`Payment Intent Succeeded for Booking ID: ${bookingId}, Payment Intent ID: ${paymentIntent.id}`)

        // Confirm the tip payment in our database
        const result = await confirmTipPayment(bookingId, paymentIntent.id)
        if (!result.success) {
          console.error(`Failed to confirm tip payment for ${bookingId}: ${result.message}`)
          return new NextResponse(`Failed to confirm tip payment: ${result.message}`, { status: 500 })
        }

        console.log(`Successfully confirmed tip payment for booking ${bookingId}`)
      } else {
        console.warn("Payment intent succeeded event missing bookingId or type metadata.")
      }
      break

    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
      const failedBookingId = failedPaymentIntent.metadata?.bookingId
      const failedPaymentType = failedPaymentIntent.metadata?.type

      if (failedBookingId && failedPaymentType === "tip") {
        console.log(
          `Payment Intent Failed for Booking ID: ${failedBookingId}, Payment Intent ID: ${failedPaymentIntent.id}`,
        )

        try {
          // Update the booking to reflect failed payment
          await prisma.booking.update({
            where: { id: failedBookingId },
            data: {
              tipStatus: "failed",
            },
          })
          console.log(`Updated booking ${failedBookingId} tip status to failed`)
        } catch (error: any) {
          console.error(`Failed to update booking ${failedBookingId} tip status to failed: ${error.message}`)
          return new NextResponse(`Failed to update booking tip status: ${error.message}`, { status: 500 })
        }
      } else {
        console.warn("Payment intent failed event missing bookingId or type metadata.")
      }
      break

    // Keep the old checkout.session.completed handler for backward compatibility (if needed)
    case "checkout.session.completed":
      const checkoutSession = event.data.object as Stripe.Checkout.Session
      const checkoutBookingId = checkoutSession.metadata?.bookingId
      const checkoutSessionId = checkoutSession.id

      if (checkoutBookingId && checkoutSessionId) {
        console.log(
          `Legacy Checkout Session Completed for Booking ID: ${checkoutBookingId}, Session ID: ${checkoutSessionId}`,
        )
        console.warn("Received checkout.session.completed event - this should not happen with the new payment flow")
      } else {
        console.warn("Checkout session completed event missing bookingId or session ID in metadata.")
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  // Return a 200 response to acknowledge receipt of the event
  return new NextResponse("Received", { status: 200 })
}
