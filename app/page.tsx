import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, Star, Phone, Mail } from 'lucide-react'
import { getServerSession } from "next-auth"
import { BookingForm } from "@/components/booking-form"
import { Card } from "@/components/ui/card"
export default async function HomePage() {
  const session = await getServerSession()
  const user = session?.user || null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative w-full py-3 md:py-6 lg:py-12 flex flex-col items-center justify-center text-center px-4 space-y-8">
        <Image src="/images/vip4dfw-logo-orange.png" alt="VIP4DFW Logo" width={300} height={300} className="mb-8" />
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-vipo-DEFAULT">
          Your VIP Ride to DFW & Dallas Love Field Starts Here
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 max-w-3xl">
          Luxury SUVs • Professional Chauffeurs • 24/7 On-Time Service
        </p>
        <p className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-vipo-DEFAULT">Flat rate $85</p>
        <div className="text-lg md:text-xl text-gray-200 max-w-3xl">
          <p className="font-semibold text-vipo-DEFAULT">Cities included are:</p>
          <p>Dallas, Richardson, Plano, Allen, Wylie, McKinney, Frisco, Colony, Garland, Rowlett, Rockwall, Irving, Carrollton, Addison, Farmers Branch.</p>
          <p className="mt-2 text-sm text-gray-400">If your city is NOT mentioned, please contact us for your price.</p>
        </div>
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

      {/* Quick Booking Form - now a separate client component */}
      <BookingForm user={user} />

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
        <div className="container flex flex-col mx-auto text-center space-y-8">
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
          <Button className="bg-vipo-DEFAULT w-fit self-center hover:bg-vipo-dark text-black font-bold py-3 px-8 rounded-full text-lg flex items-center gap-2 mt-8">
            <Phone className="w-5 h-5" /> Book <span className="hidden md:flex">Your Airport Transfer</span> Now
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
            {/* NEW TESTIMONIALS */}
            <Card className="bg-gray-800 text-white border-vipo-DEFAULT p-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-vipo-DEFAULT fill-vipo-DEFAULT" />
                ))}
              </div>
              <p className="text-lg italic mb-4">
                “Always my go-to for DFW airport. Punctual, comfortable, and the drivers are always courteous.”
              </p>
              <p className="font-semibold text-gray-300">– Jessica L.</p>
            </Card>
            <Card className="bg-gray-800 text-white border-vipo-DEFAULT p-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-vipo-DEFAULT fill-vipo-DEFAULT" />
                ))}
              </div>
              <p className="text-lg italic mb-4">
                “Used VIP4DFW for a corporate event. The service was impeccable, and the vehicle was spotless.”
              </p>
              <p className="font-semibold text-gray-300">– Robert K.</p>
            </Card>
            <Card className="bg-gray-800 text-white border-vipo-DEFAULT p-6">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-vipo-DEFAULT fill-vipo-DEFAULT" />
                ))}
              </div>
              <p className="text-lg italic mb-4">
                “Reliable and luxurious. VIP4DFW makes traveling stress-free. Highly recommend their airport service.”
              </p>
              <p className="font-semibold text-gray-300">– Emily R.</p>
            </Card>
          </div>
          <Button className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black font-bold py-3 px-8 rounded-full text-lg mt-8">
            <span className="hidden md:flex">✨ Experience the VIP difference – </span>Book Your Ride Now!
          </Button>
        </div>
      </section>

      {/* Footer / Contact Section */}
      {/* <footer className="w-full py-12 md:py-16 bg-gray-900 text-gray-300 px-4">
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
      </footer> */}
    </div>
  )
}
