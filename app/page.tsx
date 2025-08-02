"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Phone, Mail } from "lucide-react"
import { useActionState, useState, useEffect } from "react"
import { createBooking } from "@/app/bookings/actions"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" 
import { useRouter } from "next/navigation" 

export default function HomePage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(createBooking, { success: false, message: "" })

  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setContactEmail(user.email || "")
        const { data: profile, error } = await supabase.from("profiles").select("name").eq("id", user.id).single()
        if (profile) {
          setContactName(profile.name || "")
        }
      }
    }
    fetchUserData()
  }, [])

  // Handle redirect after action completes
  useEffect(() => {
    if (state.success && state.redirectUrl) {
      router.push(state.redirectUrl)
    }
  }, [state, router])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 flex flex-col items-center justify-center text-center px-4 space-y-8">
        <Image src="/images/vip4dfw-logo-orange.png" alt="VIP4DFW Logo" width={300} height={300} className="mb-8" />
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-vipo-DEFAULT">
          🚖 Your VIP Ride to DFW & Dallas Love Field Starts Here
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 max-w-3xl">
          Luxury SUVs • Professional Chauffeurs • 24/7 On-Time Service
        </p>
        <p className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-vipo-DEFAULT">flat rate $85</p>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2">
            <Check className="w-5 h-5" /> Book Now
          </Button>
          <Button
            variant="outline"
            className="border-vipo-DEFAULT text-vipo-DEFAULT hover:bg-vipo-DEFAULT hover:text-black font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2 bg-transparent"
          >
            <Phone className="w-5 h-5" /> Call/Text Us Anytime
          </Button>
        </div>
      </section>

      {/* Quick Booking Form */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-lg bg-gray-800 text-white border-vipo-DEFAULT">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-vipo-DEFAULT">Book Your VIP Ride Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={formAction} className="space-y-4">
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
                    Date & Time
                  </Label>
                  <Input
                    id="date-time"
                    name="date-time"
                    type="datetime-local"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
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
              {/* Separated Contact Info Fields */}
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
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
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
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
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
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label className="text-gray-300">Payment Method</Label>
                <RadioGroup
                  defaultValue="card"
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="flex gap-4"
                  name="payment-method" // Name for form data
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="payment-card" />
                    <Label htmlFor="payment-card" className="text-gray-300">
                      Card Payment
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="payment-cash" />
                    <Label htmlFor="payment-cash" className="text-gray-300">
                      Cash Payment
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 text-lg"
                disabled={isPending}
              >
                {isPending ? "Processing..." : "Get Instant Quote / Reserve Now"}
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

      {/* Why Choose VIP4DFW Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-black text-white px-4">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-vipo-DEFAULT">Why Choose VIP4DFW?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <Check className="w-8 h-8 text-vipo-DEFAULT" />
              <h3 className="text-xl font-semibold">Luxury SUV Experience</h3>
              <p className="text-gray-300">Ride in comfort with WiFi, bottled water, and premium service.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <Check className="w-8 h-8 text-vipo-DEFAULT" />
              <h3 className="text-xl font-semibold">Professional Chauffeurs</h3>
              <p className="text-gray-300">Punctual, discreet, and highly trained drivers.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <Check className="w-8 h-8 text-vipo-DEFAULT" />
              <h3 className="text-xl font-semibold">Flat Rates – No Hidden Fees</h3>
              <p className="text-gray-300">Transparent pricing for every trip.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <Check className="w-8 h-8 text-vipo-DEFAULT" />
              <h3 className="text-xl font-semibold">Available 24/7</h3>
              <p className="text-gray-300">Always on time, day or night.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Airport Transfers Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 text-white px-4">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-vipo-DEFAULT">
            ✈️ Premium Airport Transfers to DFW & Dallas Love Field ONLY $85
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Whether you’re flying for business or leisure, VIP4DFW provides reliable, luxury airport transfers. We track
            your flight for delays or early arrivals to ensure your driver is always ready.
          </p>
          <ul className="list-none space-y-2 text-lg md:text-xl text-gray-200">
            <li className="flex items-center justify-center gap-2">
              <Check className="w-6 h-6 text-vipo-DEFAULT" /> Flat-rate pricing to airports (DAL or DFW $85) – no
              surprises
            </li>
            <li className="flex items-center justify-center gap-2">
              <Check className="w-6 h-6 text-vipo-DEFAULT" /> On-time guarantee, every time
            </li>
          </ul>
          <Button className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2 mt-8">
            <Phone className="w-5 h-5" /> Book Your Airport Transfer Now
          </Button>
        </div>
      </section>

      {/* City Rides Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-black text-white px-4">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-vipo-DEFAULT">
            🚘 Luxury Rides for Your Dallas Experience
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Enjoy the convenience of hourly chauffeur service for business meetings, special events, or a night out in
            Dallas. Let us handle the driving while you focus on what matters.
          </p>
          <Button className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 px-8 rounded-full text-lg mt-8">
            Book Your City Ride Today
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 text-white px-4">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-vipo-DEFAULT">Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gray-800 text-white border-vipo-DEFAULT p-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-vipo-DEFAULT fill-vipo-DEFAULT" />
                ))}
              </div>
              <p className="text-lg italic mb-4">
                “VIP4DFW was on time, professional, and made our airport transfer seamless. Highly recommend!”
              </p>
              <p className="font-semibold text-gray-300">– Sarah W.</p>
            </Card>
            <Card className="bg-gray-800 text-white border-vipo-DEFAULT p-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-vipo-DEFAULT fill-vipo-DEFAULT" />
                ))}
              </div>
              <p className="text-lg italic mb-4">
                “Best black car service in Dallas! Clean SUV, friendly driver, and easy booking process.”
              </p>
              <p className="font-semibold text-gray-300">– David M.</p>
            </Card>
          </div>
          <Button className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 px-8 rounded-full text-lg mt-8">
            ✨ Experience the VIP difference – Book Your Ride Now!
          </Button>
        </div>
      </section>

      {/* About Us Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-black text-white px-4">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-vipo-DEFAULT">
            Your Trusted VIP Ride in Dallas-Fort Worth
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            At VIP4DFW, we believe that every ride should be as enjoyable as the destination. Our mission is to provide
            safe, on-time, luxury transportation with exceptional service 24/7. Whether it’s an early morning airport
            transfer or a late-night pickup, we’re always ready to get you there in comfort and style.
          </p>
          <Button className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2 mt-8">
            🚖 Book Your Ride Today
          </Button>
        </div>
      </section>

      {/* Footer / Contact Section */}
      <footer className="w-full py-12 md:py-16 bg-gray-900 text-gray-300 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-vipo-DEFAULT" />
            <span className="text-lg">Call/Text 24/7: (Your Number)</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-vipo-DEFAULT" />
            <span className="text-lg">Email: info@vip4dfw.com</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">📍 Dallas–Fort Worth, Texas</span>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} VIP4DFW. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
