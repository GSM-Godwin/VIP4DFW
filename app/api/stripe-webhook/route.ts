import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createSupabaseServerClient } from "@/lib/supabase/server"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
})

// This is important for Next.js to parse the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request) {
  const buf = await req.text() // Read the raw body as text
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "No Stripe signature header" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.booking_id

      if (bookingId) {
        console.log(`Checkout session completed for booking ID: ${bookingId}`)
        // Update your booking in Supabase
        const { data, error } = await supabase.from("bookings").update({ payment_status: "paid" }).eq("id", bookingId)

        if (error) {
          console.error("Error updating booking payment status:", error.message)
          return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
        }
        console.log("Booking payment status updated to 'paid'.", data)
      } else {
        console.warn("Checkout session completed, but no booking_id found in metadata.")
      }
      break
    // Add other event types you want to handle here
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true }, { status: 200 })
}
