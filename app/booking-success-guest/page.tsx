import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, MapPin } from "lucide-react"

export default function BookingSuccessGuestPage({
  searchParams,
}: {
  searchParams: { booking_id?: string; payment_status?: string }
}) {
  const bookingId = searchParams.booking_id
  const paymentStatus = searchParams.payment_status || "unpaid"

  // With the new payment flow, all bookings start as "unpaid" and payment happens after ride completion
  const title = "Booking Confirmed!"
  const icon = <CheckCircle className="w-8 h-8" />
  const message = "Your VIP4DFW booking has been successfully placed and is pending confirmation."

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white border-vipo-DEFAULT text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT flex items-center justify-center gap-2">
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

          {/* Payment Information */}
          <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-vipo-DEFAULT mb-2">Payment Information</h3>
            <p className="text-gray-300 text-sm">
              <strong>No upfront payment required!</strong>
              <br />
              You'll pay at the end of your completed ride. We'll send you a secure payment link when your trip is
              finished.
            </p>
          </div>

          {/* Next Steps */}
          <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-vipo-DEFAULT mb-2">What Happens Next?</h3>
            <div className="text-left text-gray-300 text-sm space-y-1">
              <p>1. We'll review and confirm your booking</p>
              <p>2. You'll receive a confirmation email</p>
              <p>3. Track your driver on the day of your trip</p>
              <p>4. Pay securely after your ride is complete</p>
            </div>
          </div>

          {/* Tracking Link */}
          {bookingId && (
            <Link href={`/track/${bookingId}`}>
              <Button
                variant="outline"
                className="w-full border-vipo-DEFAULT text-vipo-DEFAULT hover:bg-vipo-DEFAULT hover:text-black font-bold py-3 text-lg bg-transparent flex items-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Track Your Booking
              </Button>
            </Link>
          )}

          <div className="border-t border-gray-600 pt-4">
            <p className="text-xl font-semibold text-vipo-DEFAULT mb-4">
              Want to manage your bookings and save your details for next time?
            </p>
            <div className="flex flex-col gap-4">
              <Link href="/login">
                <Button className="w-full bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 text-lg">
                  Login to Your Account
                </Button>
              </Link>
              <Link href="/login">
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
