import { DialogTrigger } from "@/components/ui/dialog"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { getAdminBookings } from "@/app/bookings/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AdminBookingActions } from "@/components/admin-booking-actions"
import { AdminLocationTracker } from "@/components/admin-location-tracker"
import { Star } from "lucide-react"
import { Suspense } from "react"

import AdminFilterForm from "./admin-filter-form"
import { AdminReviewManager } from "@/components/admin-review-manager"

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[]
    search?: string
  }>
}) {
  const session = await getServerSession()

  // if (!session || (session.user as any).role !== "admin") {
  //   redirect("/login?error=unauthorized")
  // }

  // Await searchParams since it's now a Promise in Next.js 15
  const params = await searchParams

  // Process the status parameter correctly
  const statuses = Array.isArray(params.status) ? params.status : params.status ? [params.status] : []
  const searchQuery = params.search || ""

  const { bookings, message, success } = await getAdminBookings({
    statuses: statuses,
    searchQuery,
  })

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <Card className="w-full max-w-5xl bg-gray-800 text-white border-vipo-DEFAULT mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {/* <p className="text-lg text-gray-300">Welcome, {session.user.name || session.user.email}!</p> */}
          <p className="text-xl font-semibold text-vipo-DEFAULT">Manage all VIP4DFW bookings here.</p>
        </CardContent>
      </Card>

      <Card className="w-full max-w-5xl bg-gray-800 text-white border-vipo-DEFAULT">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-vipo-DEFAULT">All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense>
            <AdminFilterForm initialSearch={searchQuery} initialStatuses={statuses} />
          </Suspense>

          <div className="mt-6">
            {!success && <p className="text-red-500 text-center">{message}</p>}
            {success && bookings.length === 0 && (
              <p className="text-gray-300 text-center">No bookings found for the current filters.</p>
            )}
            {success && bookings.length > 0 && (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="bg-gray-700 border-gray-600 p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-vipo-DEFAULT">
                          {booking.pickupLocation} to {booking.dropoffLocation}
                        </p>
                        <p className="text-gray-300 text-sm">Booking ID: {booking.id}</p>
                        <p className="text-gray-300">Date & Time: {format(new Date(booking.pickupTime), "PPP p")}</p>
                        <p className="text-gray-300">Passengers: {booking.numPassengers}</p>
                        <p className="text-gray-300">
                          Contact: {booking.contactName} ({booking.contactEmail}, {booking.contactPhone})
                        </p>
                        <p className="text-gray-300">Total Price: ${booking.totalPrice.toFixed(2)}</p>
                        {booking.customMessage && (
                          <p className="text-gray-300 text-sm">Notes: {booking.customMessage}</p>
                        )}
                        <p
                          className={`font-medium ${
                            booking.status === "pending"
                              ? "text-yellow-400"
                              : booking.status === "confirmed"
                                ? "text-green-400"
                                : booking.status === "completed"
                                  ? "text-blue-400"
                                  : "text-red-400"
                          }`}
                        >
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
                          Payment: {(() => {
                            if (booking.paymentStatus === "pending_cash") {
                              return "Cash on Arrival"
                            }
                            if (booking.paymentStatus === "paid") {
                              return "Credit Card (Paid)"
                            }
                            return booking.paymentStatus ? booking.paymentStatus.replace(/_/g, " ") : "N/A"
                          })()}
                        </p>
                        {booking.cancellationReason && (
                          <p className="text-red-300 text-sm">Cancellation Reason: {booking.cancellationReason}</p>
                        )}
                        {booking.reviewRating !== null && (
                          <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <span>Review:</span>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  (booking.reviewRating || 0) > i
                                    ? "text-vipo-DEFAULT fill-vipo-DEFAULT"
                                    : "text-gray-400"
                                }`}
                              />
                            ))}
                            {booking.reviewMessage && <span className="ml-2 italic">"{booking.reviewMessage}"</span>}
                            <AdminReviewManager
                              bookingId={booking.id}
                              reviewRating={booking.reviewRating}
                              reviewMessage={booking.reviewMessage || ""}
                              contactName={booking.contactName}
                              isPublished={booking.reviewIsPublished || false}
                            />
                          </div>
                        )}
                      </div>
                      <AdminBookingActions bookingId={booking.id} currentStatus={booking.status || "pending"} />
                      {booking.status === "confirmed" && (
                        <AdminLocationTracker
                          bookingId={booking.id}
                          initialLatitude={booking.driverLatitude}
                          initialLongitude={booking.driverLongitude}
                        />
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="border-vipo-DEFAULT text-vipo-DEFAULT hover:bg-vipo-DEFAULT hover:text-black bg-transparent"
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 text-white border-vipo-DEFAULT">
                          <DialogHeader>
                            <DialogTitle className="text-vipo-DEFAULT">Booking Details: {booking.id}</DialogTitle>
                            <DialogDescription className="text-gray-300">
                              Full information for this booking.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2 text-gray-200">
                            <p>
                              <strong>Pickup:</strong> {booking.pickupLocation}
                            </p>
                            <p>
                              <strong>Drop-off:</strong> {booking.dropoffLocation}
                            </p>
                            <p>
                              <strong>Time:</strong> {format(new Date(booking.pickupTime), "PPP p")}
                            </p>
                            <p>
                              <strong>Passengers:</strong> {booking.numPassengers}
                            </p>
                            <p>
                              <strong>Service Type:</strong> {booking.serviceType.replace(/_/g, " ")}
                            </p>
                            <p>
                              <strong>Contact Name:</strong> {booking.contactName}
                            </p>
                            <p>
                              <strong>Contact Email:</strong> {booking.contactEmail}
                            </p>
                            <p>
                              <strong>Contact Phone:</strong> {booking.contactPhone}
                            </p>
                            <p>
                              <strong>Total Price:</strong> ${booking.totalPrice.toFixed(2)}
                            </p>
                            {booking.customMessage && (
                              <p>
                                <strong>Custom Message:</strong> {booking.customMessage}
                              </p>
                            )}
                            <p>
                              <strong>Status:</strong> {booking.status}
                            </p>
                            <p>
                              <strong>Payment Status:</strong> {(() => {
                                if (booking.paymentStatus === "pending_cash") {
                                  return "Cash on Arrival"
                                }
                                if (booking.paymentStatus === "paid") {
                                  return "Credit Card (Paid)"
                                }
                                return booking.paymentStatus ? booking.paymentStatus.replace(/_/g, " ") : "N/A"
                              })()}
                            </p>
                            {booking.cancellationReason && (
                              <p>
                                <strong>Cancellation Reason:</strong> {booking.cancellationReason}
                              </p>
                            )}
                            {booking.reviewRating !== null && (
                              <p>
                                <strong>Review:</strong> {booking.reviewRating} Stars
                                {booking.reviewMessage && `: "${booking.reviewMessage}"`}
                              </p>
                            )}
                            <p>
                              <strong>Booked At:</strong> {format(new Date(booking.createdAt), "PPP p")}
                            </p>
                            {booking.driverLatitude && booking.driverLongitude && (
                              <p>
                                <strong>Driver Location:</strong> Lat: {booking.driverLatitude.toFixed(5)}, Lon:{" "}
                                {booking.driverLongitude.toFixed(5)}
                              </p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
