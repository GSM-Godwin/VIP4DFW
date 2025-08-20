"use client"

import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserBookings } from "@/app/bookings/actions"
import { formatInTimeZone } from "date-fns-tz"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const [userTimezone, setUserTimezone] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  // Detect user's timezone
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(timezone)
  }, [])

  // Fetch bookings when session is available
  useEffect(() => {
    async function fetchBookings() {
      if (status === "authenticated") {
        const result = await getUserBookings()
        setBookings(result.bookings)
        setMessage(result.message)
        setSuccess(result.success)
        setIsLoading(false)
      } else if (status === "unauthenticated") {
        redirect("/login")
      }
    }

    fetchBookings()
  }, [status])

  // Helper function to format time with timezone
  const formatTimeWithTimezone = (date: Date) => {
    if (!userTimezone) return formatInTimeZone(date, "UTC", "PPP p")
    const formattedTime = formatInTimeZone(date, userTimezone, "PPP p")
    const abbreviation = formatInTimeZone(date, userTimezone, "zzz")
    return `${formattedTime} ${abbreviation}`
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-vipo-DEFAULT text-xl">Loading...</p>
      </div>
    )
  }

  if (!session?.user) {
    redirect("/login")
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <Card className="w-full max-w-3xl bg-gray-800 text-white border-vipo-DEFAULT mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT">Welcome to your Dashboard!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-lg text-gray-300">Hello, {user.name || user.email}!</p>
          <p className="text-xl font-semibold text-vipo-DEFAULT">Your email: {user.email}</p>
          <form action="/api/auth/signout" method="post">
            <Button
              type="submit"
              className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-2 px-6 rounded-full text-lg"
            >
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-3xl bg-gray-800 text-white border-vipo-DEFAULT">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-vipo-DEFAULT">Your Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {!success && <p className="text-red-500 text-center">{message}</p>}
          {success && bookings.length === 0 && <p className="text-gray-300 text-center">You have no bookings yet.</p>}
          {success && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="bg-gray-700 border-gray-600 p-4">
                  <p className="text-lg font-semibold text-vipo-DEFAULT">
                    {booking.pickupLocation} to {booking.dropoffLocation}
                  </p>
                  <p className="text-gray-300">Date & Time: {formatTimeWithTimezone(new Date(booking.pickupTime))}</p>
                  <p className="text-gray-300">Passengers: {booking.numPassengers}</p>
                  <p className="text-gray-300">Service Type: {booking.serviceType.replace(/_/g, " ")}</p>
                  <p className="text-gray-300">Total Price: ${booking.totalPrice.toFixed(2)}</p>
                  <p className={`font-medium ${booking.status === "pending" ? "text-yellow-400" : "text-green-400"}`}>
                    Status: {booking.status}
                  </p>
                  <p
                    className={`font-medium ${
                      booking.paymentStatus === "unpaid" || booking.paymentStatus === "pending_cash"
                        ? "text-yellow-400"
                        : booking.paymentStatus === "paid"
                          ? "text-green-400"
                          : "text-red-400"
                    }`}
                  >
                    Payment: {booking.paymentStatus?.replace(/_/g, " ")}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
