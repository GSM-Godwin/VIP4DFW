import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserBookings } from "@/app/bookings/actions"
import { format } from "date-fns"
import { getServerSession } from "next-auth" // Import getServerSession directly

export default async function DashboardPage() {
  const session = await getServerSession() // Get session directly
  const user = session?.user // Extract user from session

  if (!user) {
    redirect("/login")
  }

  const { bookings, message, success } = await getUserBookings()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <Card className="w-full max-w-3xl bg-gray-800 text-white border-vipo-DEFAULT mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT">Welcome to your Dashboard!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-lg text-gray-300">Hello, {user.name || user.email}!</p>
          <p className="text-xl font-semibold text-vipo-DEFAULT">Your email: {user.email}</p>
          <form action="/api/auth/signout" method="post"> {/* Use the standard NextAuth.js signout API route */}
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
                  <p className="text-gray-300">Date & Time: {format(new Date(booking.pickupTime), "PPP p")}</p>
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
                    Payment: {booking.paymentStatus.replace(/_/g, " ")}
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
