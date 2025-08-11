"use client"

import { useActionState, useState } from "react" // NEW: Import useState
import { Button } from "@/components/ui/button"
import { updateBookingStatus, endTrip } from "@/app/bookings/actions" // NEW: Import endTrip
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter, // NEW: Import DialogFooter
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog" // NEW: Import Dialog components
import { Label } from "@/components/ui/label" // NEW: Import Label
import { Textarea } from "@/components/ui/textarea" // NEW: Import Textarea

interface AdminBookingActionsProps {
  bookingId: string
  currentStatus: string
}

export function AdminBookingActions({ bookingId, currentStatus }: AdminBookingActionsProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false) // NEW: State for dialog open/close

  // Action for confirming a booking
  const [confirmState, confirmAction, isConfirmPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await updateBookingStatus(bookingId, "confirmed")
      if (result.success) {
        toast.success(`Booking ${bookingId} has been confirmed.`, {
          description: "Email notification sent to the client.",
        })
      } else {
        toast.error(`Failed to confirm booking ${bookingId}.`, {
          description: result.message,
        })
      }
      return result
    },
    { success: false, message: "" },
  )

  // Action for declining a booking
  const [declineState, declineAction, isDeclinePending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await updateBookingStatus(bookingId, "declined")
      if (result.success) {
        toast.info(`Booking ${bookingId} has been declined.`, {
          description: "Email notification sent to the client.",
        })
      } else {
        toast.error(`Failed to decline booking ${bookingId}.`, {
          description: result.message,
        })
      }
      return result
    },
    { success: false, message: "" },
  )

  // NEW: Action for cancelling a booking
  const [cancelState, cancelAction, isCancelPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const reason = formData.get("cancellation-reason") as string
      const result = await updateBookingStatus(bookingId, "cancelled", reason)
      if (result.success) {
        toast.info(`Booking ${bookingId} has been cancelled.`, {
          description: "Email notification sent to the client.",
        })
        setIsCancelDialogOpen(false) // Close dialog on success
      } else {
        toast.error(`Failed to cancel booking ${bookingId}.`, {
          description: result.message,
        })
      }
      return result
    },
    { success: false, message: "" },
  )

  // NEW: Action for ending a trip
  const [endTripState, endTripAction, isEndTripPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await endTrip(bookingId)
      if (result.success) {
        toast.success(`Trip for booking ${bookingId} marked as completed.`, {
          description: "Invoice email sent to the client.",
        })
      } else {
        toast.error(`Failed to end trip for booking ${bookingId}.`, {
          description: result.message,
        })
      }
      return result
    },
    { success: false, message: "" },
  )

  const isAnyPending = isConfirmPending || isDeclinePending || isCancelPending || isEndTripPending

  return (
    <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
      {currentStatus === "pending" && (
        <>
          <form action={confirmAction}>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isAnyPending}>
              {isConfirmPending ? "Confirming..." : "Accept"}
            </Button>
          </form>
          <form action={declineAction}>
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isAnyPending}>
              {isDeclinePending ? "Declining..." : "Decline"}
            </Button>
          </form>
        </>
      )}

      {/* NEW: Cancel Trip Button (for confirmed bookings) */}
      {currentStatus === "confirmed" && (
        <>
          <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                disabled={isAnyPending}
              >
                Cancel Trip
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 text-white border-vipo-DEFAULT">
              <DialogHeader>
                <DialogTitle className="text-vipo-DEFAULT">Cancel Booking {bookingId}</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Please provide a reason for cancelling this booking. This reason will be sent to the client.
                </DialogDescription>
              </DialogHeader>
              <form action={cancelAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cancellation-reason" className="text-gray-300">
                    Reason for Cancellation
                  </Label>
                  <Textarea
                    id="cancellation-reason"
                    name="cancellation-reason"
                    placeholder="e.g., Driver unavailable, Vehicle maintenance, Client request"
                    required
                    rows={4}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                {cancelState?.message && (
                  <div className={`mt-2 text-center ${cancelState.success ? "text-green-500" : "text-red-500"}`}>
                    {cancelState.message}
                  </div>
                )}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCancelDialogOpen(false)}
                    disabled={isCancelPending}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Close
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isCancelPending}>
                    {isCancelPending ? "Cancelling..." : "Confirm Cancellation"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* NEW: End Trip Button (for confirmed bookings) */}
          <form action={endTripAction}>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isAnyPending}>
              {isEndTripPending ? "Ending Trip..." : "End Trip"}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
