"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useParams } from "next/navigation"
import { MapPin, Star } from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"
import { getBookingById } from "@/app/bookings/actions"
import { GoogleMapComponent } from "@/components/google-map-component"
import { ReviewForm } from "@/components/review-form"
import { TipForm } from "@/components/tip-form"

interface BookingData {
  id: string
  pickupLocation: string
  dropoffLocation: string
  pickupTime: Date
  driverLatitude: number | null
  driverLongitude: number | null
  status: string
  reviewRating: number | null
  reviewMessage: string | null
  tipAmount: number | null
  tipStatus: string | null
}

export default function TrackBookingPage() {
  const params = useParams()
  const bookingId = params.bookingId as string
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchBookingData = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        setInitialLoad(true)
      }
      setError(null)

      const result = await getBookingById(bookingId)
      if (result.success && result.booking) {
        const bookingData = result.booking as BookingData
        bookingData.pickupTime = new Date(bookingData.pickupTime)
        setBooking(bookingData)
      } else {
        setError(result.message || "Failed to load booking details.")
        console.error("TRACKING_ERROR: Failed to fetch booking data:", result.message)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
      if (isInitial) {
        setInitialLoad(false)
      }
    },
    [bookingId],
  ) // bookingId is a dependency for useCallback

  useEffect(() => {
    fetchBookingData(true)

    // Set up polling for location updates
    intervalRef.current = setInterval(() => fetchBookingData(false), 5000)

    // Cleanup on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [bookingId, fetchBookingData]) // fetchBookingData is now a dependency

  if (initialLoad) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <p className="text-vipo-DEFAULT text-xl">Loading tracking data...</p>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 text-white border-vipo-DEFAULT text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-red-500 flex items-center justify-center gap-2">
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-gray-300">{error || "Booking not found or an unknown error occurred."}</p>
            <p className="text-sm text-gray-400">
              Please ensure the booking ID is correct and you have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show tip form for completed trips (regardless of review status)
  const showTipForm = booking.status === "completed" && booking.tipStatus !== "paid"
  const showReviewForm = booking.status === "completed" && booking.reviewRating === null
  const showSubmittedReview = booking.status === "completed" && booking.reviewRating !== null

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 text-white border-vipo-DEFAULT text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT flex items-center justify-center gap-2">
            <MapPin className="w-8 h-8" /> Live Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-300">
            Tracking for Booking ID: <span className="font-semibold text-vipo-DEFAULT">{bookingId}</span>
          </p>
          <div className="space-y-2 text-gray-200">
            <p>
              <strong>From:</strong> {booking.pickupLocation}
            </p>
            <p>
              <strong>To:</strong> {booking.dropoffLocation}
            </p>
            <p>
              <strong>Status:</strong> {booking.status}
            </p>
            <p>
              <strong>Pickup Time:</strong> {booking.pickupTime.toLocaleString()}
            </p>
          </div>

          {/* NEW: Tip Form Section */}
          {showTipForm && (
            <TipForm
              bookingId={booking.id}
              driverName="Your Driver" // You can make this dynamic if you have driver info
              currentTipAmount={booking.tipAmount}
              currentTipStatus={booking.tipStatus}
              onTipCompleted={() => fetchBookingData(false)}
            />
          )}

          {!showReviewForm && !showSubmittedReview && !showTipForm && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              {booking.driverLatitude !== null && booking.driverLongitude !== null && booking.status === "confirmed" ? (
                <GoogleMapComponent latitude={booking.driverLatitude} longitude={booking.driverLongitude} />
              ) : (
                <div className="w-full h-full bg-gray-700 flex flex-col items-center justify-center text-gray-400 text-xl p-4">
                  <MapPin className="w-12 h-12" />
                  <p className="mt-2">Driver location not available yet.</p>
                  <p className="text-sm text-gray-500">Tracking will begin once the driver starts the trip.</p>
                </div>
              )}
            </div>
          )}

          {/* NEW: Conditional Review Section */}
          {showReviewForm && <ReviewForm bookingId={booking.id} onReviewSubmitted={() => fetchBookingData(false)} />}

          {showSubmittedReview && (
            <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 space-y-2">
              <h3 className="text-xl font-bold text-vipo-DEFAULT">Your Review</h3>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      (booking.reviewRating || 0) > i ? "text-vipo-DEFAULT fill-vipo-DEFAULT" : "text-gray-400"
                    }`}
                  />
                ))}
              </div>
              {booking.reviewMessage && <p className="text-gray-300 italic">"{booking.reviewMessage}"</p>}
              <p className="text-sm text-gray-400">Thank you for your feedback!</p>
            </div>
          )}

          <p className="text-sm text-gray-400 mt-2">
            Note: This is a simulated tracking feature. For a real production system, a dedicated driver app and a
            robust real-time backend (e.g., WebSockets) would be used.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
