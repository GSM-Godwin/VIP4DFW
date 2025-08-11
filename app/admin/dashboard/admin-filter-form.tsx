"use client"

import { DialogDescription } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Filter } from "lucide-react"

interface AdminFilterFormProps {
  initialSearch: string
  initialStatuses: string[]
}

const ALL_STATUSES = ["pending", "confirmed", "declined", "completed", "cancelled"]

export default function AdminFilterForm({ initialSearch, initialStatuses }: AdminFilterFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialStatuses)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  // Sync internal state with URL params on initial load or URL change
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "")
    const statusesFromUrl = searchParams.getAll("status")
    setSelectedStatuses(statusesFromUrl.length > 0 ? statusesFromUrl : [])
  }, [searchParams])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    applyFilters()
  }

  const handleStatusChange = (status: string, checked: boolean) => {
    setSelectedStatuses((prev) => (checked ? [...prev, status] : prev.filter((s) => s !== status)))
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Set search query
    if (searchQuery) {
      params.set("search", searchQuery)
    } else {
      params.delete("search")
    }

    // Set statuses
    params.delete("status") // Clear existing status params
    selectedStatuses.forEach((status) => {
      params.append("status", status)
    })

    router.push(`/admin/dashboard?${params.toString()}`)
    setIsFilterDialogOpen(false) // Close dialog after applying filters
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedStatuses([])
    const params = new URLSearchParams() // Start with empty params
    router.push(`/admin/dashboard?${params.toString()}`)
    setIsFilterDialogOpen(false)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search by ID, name, location..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="bg-gray-700 border-gray-600 text-white flex-1"
        />
        <Button type="submit" className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black">
          <Search className="w-5 h-5" />
          <span className="sr-only">Search</span>
        </Button>
      </form>

      {/* Filter Button and Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="border-vipo-DEFAULT text-vipo-DEFAULT hover:bg-vipo-DEFAULT hover:text-black bg-transparent flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filter
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-800 text-white border-vipo-DEFAULT">
          <DialogHeader>
            <DialogTitle className="text-vipo-DEFAULT">Filter Bookings</DialogTitle>
            <DialogDescription className="text-gray-300">Select the statuses you want to view.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {ALL_STATUSES.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                  className="border-vipo-DEFAULT data-[state=checked]:bg-vipo-DEFAULT data-[state=checked]:text-black"
                />
                <Label htmlFor={`status-${status}`} className="text-gray-300 capitalize">
                  {status.replace(/_/g, " ")}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
            >
              Clear Filters
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFilterDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button type="button" onClick={applyFilters} className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black">
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
