import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <Card className="w-full max-w-3xl bg-gray-800 text-white border-vipo-DEFAULT mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT">Our Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-left">
          <h3 className="text-xl font-semibold text-vipo-DEFAULT">1. Booking and Cancellation Policy</h3>
          <p className="text-gray-300">
            All bookings require a confirmed reservation. Cancellations must be made at least 24 hours in advance
            to avoid a cancellation fee equal to the full fare of the booked service. No-shows will be charged the
            full fare.
          </p>

          <h3 className="text-xl font-semibold text-vipo-DEFAULT">2. Payment Policy</h3>
          <p className="text-gray-300">
            We accept cash payments upon arrival. For corporate accounts or special arrangements,
            alternative payment methods may be available upon request. All prices are flat rates for airport transfers
            to/from DFW and Dallas Love Field, with no hidden fees. Other services may be quoted hourly or by distance.
          </p>

          <h3 className="text-xl font-semibold text-vipo-DEFAULT">3. Privacy Policy</h3>
          <p className="text-gray-300">
            VIP4DFW is committed to protecting your privacy. We collect personal information only for the purpose of
            providing our services and improving your experience. Your data will not be shared with third parties
            without your explicit consent, except as required by law.
          </p>

          <h3 className="text-xl font-semibold text-vipo-DEFAULT">4. Lost and Found</h3>
          <p className="text-gray-300">
            VIP4DFW is not responsible for items left in our vehicles. However, we will make every effort to return
            lost items to their rightful owners. Please contact us as soon as possible if you believe you have left
            an item behind.
          </p>

          <h3 className="text-xl font-semibold text-vipo-DEFAULT">5. Passenger Conduct</h3>
          <p className="text-gray-300">
            Passengers are expected to conduct themselves in a respectful manner. Any behavior deemed inappropriate
            or unsafe by the chauffeur may result in the termination of service without refund. Smoking and illegal
            activities are strictly prohibited in all vehicles.
          </p>
          <p className="font-bold text-red-400">
            Any alcoholic beverage drinks are also prohibited in our vehicles.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
