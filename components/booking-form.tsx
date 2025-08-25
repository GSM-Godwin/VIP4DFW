"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useActionState, useState, useEffect } from "react"
import { createBooking } from "@/app/bookings/actions"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface BookingFormProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
  } | null
}

export function BookingForm({ user }: BookingFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createBooking, { success: false, message: "" })
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash")
  const [userTimezone, setUserTimezone] = useState<string>("")

  // NEW: Detect user's timezone on component mount
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    setUserTimezone(timezone)
    console.log("User timezone detected:", timezone)
  }, [])

  // Handle redirect after action completes - UPDATED: Remove Stripe checkout redirect
  useEffect(() => {
    if (state.success && state.redirectUrl) {
      // Only handle internal Next.js redirects now (no more Stripe checkout URLs)
      router.push(state.redirectUrl)
    }
  }, [state, router])

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 flex flex-col items-center justify-center px-4">
      {/* Display cars visually above the form */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-vipo-DEFAULT mb-6">Our Luxury Fleet</h2>
        <div className="flex flex-col sm:flex-row justify-baseline md:items-end items-center gap-8">
          <div className="flex flex-col items-center">
            <Image
              src="/images/cadillac.png"
              alt="2019 Cadillac Escalade"
              width={300}
              height={120}
              className="rounded-lg shadow-lg bg-gray-800 mb-2"
            />
            <p className="text-xl font-semibold text-gray-200">Cadillac Escalade</p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="/images/suburban2.png"
              alt="2020 Chevy Suburban"
              width={360}
              height={120}
              className="rounded-lg shadow-lg bg-gray-800 mb-2 mt-2"
            />
            <p className="text-xl font-semibold text-gray-200">Chevy Suburban</p>
          </div>
        </div>
        <p className="text-md text-gray-400 mt-4">We will assign an available luxury SUV for your trip.</p>
      </div>

      <Card className="w-full max-w-lg bg-gray-800 text-white border-vipo-DEFAULT">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT">Book Your VIP Ride Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* NEW: Add notice about payment timing */}
          <div className="text-center p-3 bg-gray-700 rounded-lg border border-gray-600">
            <p className="text-sm text-gray-300">
              <strong className="text-vipo-DEFAULT">No upfront payment required!</strong>
              <br />
              Reserve your ride now and pay at the end of your trip.
            </p>
          </div>

          <form action={formAction} className="space-y-4">
            {/* NEW: Hidden input to send user's timezone to server */}
            <input type="hidden" name="user-timezone" value={userTimezone} />

            <div className="space-y-2">
              <Label htmlFor="pickup-location" className="text-gray-300">
                Pickup Location
              </Label>
              <Input
                id="pickup-location"
                name="pickup-location"
                placeholder="Enter pickup location (e.g., DFW Airport, 123 Main St)"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff-location" className="text-gray-300">
                Drop-off Location
              </Label>
              <Input
                id="dropoff-location"
                name="dropoff-location"
                placeholder="Enter drop-off location (e.g., Dallas Love Field, 456 Oak Ave)"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-time" className="text-gray-300">
                  Date & Time {/* NEW: Show timezone info to user */}
                  {userTimezone && (
                    <span className="text-xs text-gray-400 block mt-1">Your timezone: {userTimezone}</span>
                  )}
                </Label>
                <Input
                  id="date-time"
                  name="date-time"
                  type="datetime-local"
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2 md:mt-[22px]">
                <Label htmlFor="passengers" className="text-gray-300">
                  Number of Passengers
                </Label>
                <Input
                  id="passengers"
                  name="passengers"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            {/* Separated Contact Info Fields - now with default values from user prop */}
            <div className="space-y-2">
              <Label htmlFor="contact-name" className="text-gray-300">
                Contact Name
              </Label>
              <Input
                id="contact-name"
                name="contact-name"
                type="text"
                placeholder="Your Name"
                required
                defaultValue={user?.name || ""} // Pre-fill if user is logged in
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email" className="text-gray-300">
                Contact Email
              </Label>
              <Input
                id="contact-email"
                name="contact-email"
                type="email"
                placeholder="your@email.com"
                required
                defaultValue={user?.email || ""} // Pre-fill if user is logged in
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone" className="text-gray-300">
                Contact Phone
              </Label>
              <Input
                id="contact-phone"
                name="contact-phone"
                type="tel"
                placeholder="+1234567890"
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Custom Message Textarea */}
            <div className="space-y-2">
              <Label htmlFor="custom-message" className="text-gray-300">
                Special Message / Notes (Optional)
              </Label>
              <Textarea
                id="custom-message"
                name="custom-message"
                placeholder="e.g., 'Need a child seat', 'Flight number AA123', 'Picking up a guest'"
                rows={3}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Payment Method Selection - UPDATED: New labels and description */}
            <div className="space-y-2">
              <Label className="text-gray-300">Payment Method</Label>
              <RadioGroup
                defaultValue="cash"
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
                className="flex flex-col sm:flex-row gap-4"
                name="payment-method"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="payment-cash" />
                  <Label htmlFor="payment-cash" className="text-gray-300">
                    Cash or Card on Arrival
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="payment-card" />
                  <Label htmlFor="payment-card" className="text-gray-300">
                    Pay by Card After Ride
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-gray-400 mt-2">
                All payments are processed at the end of your completed ride. Card payments include the option to add a
                tip.
              </p>
            </div>

            {/* UPDATED: Simplified button text */}
            <Button
              type="submit"
              className="w-full bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 text-lg"
              disabled={isPending}
            >
              {isPending ? "Processing..." : "Reserve Now"}
            </Button>
          </form>
          {state?.message && !state.redirectUrl && (
            <div className={`mt-4 text-center ${state.success ? "text-green-500" : "text-red-500"}`}>
              {state.message}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
