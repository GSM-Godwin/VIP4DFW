import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <Card className="w-full max-w-3xl bg-gray-800 text-white border-vipo-DEFAULT mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-vipo-DEFAULT">About VIP4DFW</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <Image
            src="/placeholder.svg?height=300&width=500"
            alt="Luxury Limo Interior"
            width={500}
            height={300}
            className="rounded-lg mx-auto"
          />
          <p className="text-lg text-gray-300">
            At VIP4DFW, we are dedicated to providing the premier luxury transportation experience in the Dallas-Fort Worth Metroplex.
            Founded on the principles of punctuality, professionalism, and unparalleled comfort, we strive to make every journey
            with us a VIP experience.
          </p>
          <p className="text-lg text-gray-300">
            Our fleet consists of meticulously maintained, high-end SUVs, ensuring a smooth and stylish ride. Our chauffeurs are
            highly trained, discreet, and committed to your safety and satisfaction. Whether it's an airport transfer, a corporate
            event, or a special night out, VIP4DFW is your trusted partner for reliable and luxurious ground transportation.
          </p>
          <p className="text-lg text-gray-300 font-semibold">
            Your comfort, safety, and satisfaction are our top priorities.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
