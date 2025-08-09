import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, XCircle } from "lucide-react" // NEW: Import XCircle for cancelled payments

export default function BookingSuccessGuestPage({
  searchParams,
}: {
  searchParams: { booking_id?: string; payment_status?: string } // NEW: payment_status search param
}) {
  const bookingId = searchParams.booking_id
  const paymentStatus = searchParams.payment_status || "unknown" // Default to 'unknown'

  const isPaid = paymentStatus === "paid"
  const isCash = paymentStatus === "pending_cash"
  const isCancelled = paymentStatus === "cancelled"

  let title = "Booking Confirmed!"
  let icon = <CheckCircle className="w-8 h-8" />
  let message = "Your booking has been successfully placed."
  let paymentInfo = ""

  if (isPaid) {
    title = "Payment Successful!"
    message = "Your booking has been successfully placed and payment received."
    paymentInfo = "Your payment has been processed."
  } else if (isCash) {
    paymentInfo = "For cash payments, please pay your driver upon arrival."
  } else if (isCancelled) {
    title = "Payment Cancelled"
    icon = <XCircle className="w-8 h-8 text-red-500" />
    message = "Your payment was cancelled or failed. Your booking may not be confirmed."
    paymentInfo = "Please try booking again or contact us for assistance."
  } else {
    title = "Booking Status Unknown"
    icon = <XCircle className="w-8 h-8 text-yellow-500" />
    message = "We could not determine the status of your booking. Please contact us."
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white border-vipo-DEFAULT text-center">
        <CardHeader>
          <CardTitle
            className={`text-3xl font-bold ${isPaid ? "text-green-500" : isCancelled ? "text-red-500" : "text-vipo-DEFAULT"} flex items-center justify-center gap-2`}
          >
            {icon} {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-300">
            {message}
            {bookingId && (
              <span className="block mt-2">
                Booking ID: <span className="font-semibold text-vipo-DEFAULT">{bookingId}</span>
              </span>
            )}
          </p>
          <p className="text-gray-300">{paymentInfo}</p>
          <p className="text-xl font-semibold text-vipo-DEFAULT">
            Want to manage your bookings and save your details for next time?
          </p>
          <div className="flex flex-col gap-4">
            <Link href="/login">
              <Button className="w-full bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 text-lg">
                Login to Your Account
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                className="w-full border-vipo-DEFAULT text-vipo-DEFAULT hover:bg-vipo-DEFAULT hover:text-black font-bold py-3 text-lg bg-transparent"
              >
                Create a New Account
              </Button>
            </Link>
            <Link href="/">
              <Button variant="link" className="text-gray-400 hover:underline">
                Continue as Guest
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
