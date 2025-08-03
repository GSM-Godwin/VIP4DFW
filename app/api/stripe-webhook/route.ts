import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache" // Import revalidatePath

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
  console.error("VIP4DFW_WEBHOOK_DEBUG_START: Function entered.")
  const buf = await req.text() // Read the raw body as text
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    console.error("VIP4DFW_WEBHOOK_DEBUG: No Stripe signature header found.")
    return NextResponse.json({ error: "No Stripe signature header" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    console.error(`VIP4DFW_WEBHOOK_DEBUG: Event type: ${event.type}`)
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

      console.error(`VIP4DFW_WEBHOOK_DEBUG: Raw metadata: ${JSON.stringify(session.metadata)}`)
      console.error(`VIP4DFW_WEBHOOK_DEBUG: Extracted bookingId: '${bookingId}' (Type: ${typeof bookingId})`)

      if (bookingId) {
        // --- DIAGNOSTIC STEP: Try to SELECT the booking first ---
        console.error(`VIP4DFW_WEBHOOK_DEBUG: Attempting to SELECT booking with ID: ${bookingId}`)
        const { data: existingBooking, error: selectError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .single() // Use .single() to expect one row

        if (selectError) {
          console.error("VIP4DFW_WEBHOOK_DEBUG: Error selecting booking:", selectError.message)
          // If the error is 'PGRST116' (no rows found), it means the ID wasn't matched
          if (selectError.code === "PGRST116") {
            console.error("VIP4DFW_WEBHOOK_DEBUG: SELECT failed: No booking found with this ID.")
          }
          // Do not return here, proceed to update attempt to see its behavior
        } else if (!existingBooking) {
          console.error("VIP4DFW_WEBHOOK_DEBUG: SELECT returned null/undefined booking.")
        } else {
          console.error("VIP4DFW_WEBHOOK_DEBUG: SELECT successful. Existing booking:", existingBooking)
        }
        // --- END DIAGNOSTIC STEP ---

        console.error(`VIP4DFW_WEBHOOK_DEBUG: Attempting to UPDATE booking ID: ${bookingId}`)
        const { data, error } = await supabase
          .from("bookings")
          .update({ payment_status: "paid" })
          .eq("id", bookingId)
          .select() // Add .select() to return the updated data

        if (error) {
          console.error("VIP4DFW_WEBHOOK_DEBUG: Error updating booking payment status:", error.message)
          return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
        }
        console.error("VIP4DFW_WEBHOOK_DEBUG: Booking payment status updated to 'paid'.", data)

        revalidatePath("/dashboard")
        console.error("VIP4DFW_WEBHOOK_DEBUG: Revalidated /dashboard path.")
      } else {
        console.warn("VIP4DFW_WEBHOOK_DEBUG: Checkout session completed, but no booking_id found in metadata.")
      }
      break
    // Add other event types you want to handle here
    default:
      console.error(`VIP4DFW_WEBHOOK_DEBUG: Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
