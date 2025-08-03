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
        // --- DIAGNOSTIC STEP: Try to SELECT the booking first without .single() ---
        console.error(`VIP4DFW_WEBHOOK_DEBUG: Attempting to SELECT booking with ID: ${bookingId} (without .single())`)
        const { data: existingBookings, error: selectError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
        // Removed .single() to see the raw array result

        if (selectError) {
          console.error("VIP4DFW_WEBHOOK_DEBUG: Error selecting booking (raw):", selectError.message)
        } else if (!existingBookings || existingBookings.length === 0) {
          console.error("VIP4DFW_WEBHOOK_DEBUG: SELECT returned no bookings.")
        } else {
          console.error(
            `VIP4DFW_WEBHOOK_DEBUG: SELECT successful. Found ${existingBookings.length} booking(s). First booking:`,
            existingBookings[0],
          )
        }
        // --- END DIAGNOSTIC STEP ---

        console.error(`VIP4DFW_WEBHOOK_DEBUG: Attempting to UPDATE booking ID: ${bookingId}`)
        const { data, error } = await supabase
          .from("bookings")
          .update({ payment_status: "paid" })
          .eq("id", bookingId)
          .limit(1) // Add limit(1) as a defensive measure
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
