import { NextResponse } from "next/server"
import Stripe from "stripe"
import prisma from "@/lib/prisma" // Import Prisma client
import { revalidatePath } from "next/cache"

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
        const existingBooking = await prisma.booking.findUnique({
          where: { id: bookingId },
        })

        if (!existingBooking) {
          console.error("VIP4DFW_WEBHOOK_DEBUG: SELECT returned no bookings.")
        } else {
          console.error(`VIP4DFW_WEBHOOK_DEBUG: SELECT successful. Found booking:`, existingBooking)
        }
        // --- END DIAGNOSTIC STEP ---

        console.error(`VIP4DFW_WEBHOOK_DEBUG: Attempting to UPDATE booking ID: ${bookingId}`)
        try {
          const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { paymentStatus: "paid" },
          })
          console.error("VIP4DFW_WEBHOOK_DEBUG: Booking payment status updated to 'paid'.", updatedBooking)
          revalidatePath("/dashboard")
          console.error("VIP4DFW_WEBHOOK_DEBUG: Revalidated /dashboard path.")
        } catch (updateError: any) {
          console.error(
            "VIP4DFW_WEBHOOK_DEBUG: Error updating booking payment status with Prisma:",
            updateError.message,
          )
          return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 })
        }
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
