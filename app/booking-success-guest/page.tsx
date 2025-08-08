import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle } from 'lucide-react'

export default function BookingSuccessGuestPage({
  searchParams,
}: {
  searchParams: { booking_id?: string }
}) {
  const bookingId = searchParams.booking_id

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white border-vipo-DEFAULT text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT flex items-center justify-center gap-2">
            <CheckCircle className="w-8 h-8" /> Booking Confirmed!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-300">
            Your booking has been successfully placed.
            {bookingId && (
              <span className="block mt-2">
                Booking ID: <span className="font-semibold text-vipo-DEFAULT">{bookingId}</span>
              </span>
            )}
          </p>
          <p className="text-gray-300">
            For cash payments, please pay your driver upon arrival.
          </p>
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
              <Button variant="outline" className="w-full border-vipo-DEFAULT text-vipo-DEFAULT hover:bg-vipo-DEFAULT hover:text-black font-bold py-3 text-lg bg-transparent">
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
