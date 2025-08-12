import { getServerSession } from "next-auth"
import { getPublishedReviews } from "@/app/bookings/actions"
import HomePage from "./page"

export default async function PageWrapper() {
  const session = await getServerSession()
  const user = session?.user || null

  // Fetch published reviews
  const { reviews: publishedReviews } = await getPublishedReviews()

  return <HomePage user={user} publishedReviews={publishedReviews} />
}
