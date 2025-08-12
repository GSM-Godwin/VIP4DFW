"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useActionState } from "react"
import { toggleReviewPublication } from "@/app/bookings/actions"
import { toast } from "sonner"

interface AdminReviewManagerProps {
  bookingId: string
  reviewRating: number
  reviewMessage: string
  contactName: string
  isPublished: boolean
}

export function AdminReviewManager({
  bookingId,
  reviewRating,
  reviewMessage,
  contactName,
  isPublished: initialIsPublished,
}: AdminReviewManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPublished, setIsPublished] = useState(initialIsPublished)

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await toggleReviewPublication(bookingId)
      if (result.success) {
        setIsPublished(result.isPublished || false)
        toast.success(result.message)
        setIsDialogOpen(false)
      } else {
        toast.error("Failed to update review publication.", {
          description: result.message,
        })
      }
      return result
    },
    { success: false, message: "" },
  )

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1 ${
            isPublished
              ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              : "border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
          } bg-transparent`}
        >
          {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {isPublished ? "Published" : "Unpublished"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 text-white border-vipo-DEFAULT">
        <DialogHeader>
          <DialogTitle className="text-vipo-DEFAULT">Manage Review Publication</DialogTitle>
          <DialogDescription className="text-gray-300">
            Review from {contactName} for booking {bookingId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${reviewRating > i ? "text-vipo-DEFAULT fill-vipo-DEFAULT" : "text-gray-400"}`}
                />
              ))}
            </div>
            <p className="text-gray-200 italic">"{reviewMessage}"</p>
            <p className="text-sm text-gray-400 mt-2">– {contactName}</p>
          </div>

          <div className="text-sm text-gray-300">
            <p>
              <strong>Current Status:</strong> {isPublished ? "Published on homepage" : "Not published"}
            </p>
            <p className="mt-2">
              {isPublished
                ? "This review is currently visible to visitors on your homepage."
                : "This review is not visible to visitors. Click 'Publish' to make it visible on your homepage."}
            </p>
          </div>
        </div>

        {state?.message && (
          <div className={`text-center ${state.success ? "text-green-500" : "text-red-500"}`}>{state.message}</div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isPending}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <form action={formAction}>
            <Button
              type="submit"
              disabled={isPending}
              className={`${
                isPublished ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              {isPending ? "Updating..." : isPublished ? "Unpublish Review" : "Publish Review"}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}