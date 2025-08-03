import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createSupabaseServerClient } from "@/lib/supabase/server"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
})

// IMPORTANT: Remember to uncomment this block after debugging if you removed it.
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

export async function POST(req: Request) {
  console.error("VIP4DFW_WEBHOOK_DEBUG: Webhook POST request received.") // Use console.error for higher visibility
  const buf = await req.text() // Read the raw body as text
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    console.error("VIP4DFW_WEBHOOK_DEBUG: No Stripe signature header found.")
    return NextResponse.json({ error: "No Stripe signature header" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    console.error(`VIP4DFW_WEBHOOK_DEBUG: Event type: ${event.type}`) // Log event type
  } catch (err: any) {
    console.error(`VIP4DFW_WEBHOOK_DEBUG: Webhook Error: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.booking_id

      if (bookingId) {
        console.error(`VIP4DFW_WEBHOOK_DEBUG: Checkout session completed for booking ID: ${bookingId}`)
        // Update your booking in Supabase
        const { data, error } = await supabase.from("bookings").update({ payment_status: "paid" }).eq("id", bookingId)

        if (error) {
          console.error("VIP4DFW_WEBHOOK_DEBUG: Error updating booking payment status:", error.message)
          return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
        }
        console.error("VIP4DFW_WEBHOOK_DEBUG: Booking payment status updated to 'paid'.", data)
      } else {
        console.warn("VIP4DFW_WEBHOOK_DEBUG: Checkout session completed, but no booking_id found in metadata.")
      }
      break
    // Add other event types you want to handle here
    default:
      console.error(`VIP4DFW_WEBHOOK_DEBUG: Unhandled event type ${event.type}`)
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true }, { status: 200 })
}
