"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { updateDriverLocation } from "@/app/bookings/actions"
import { toast } from "sonner"
import { MapPin, PauseCircle, PlayCircle } from 'lucide-react'

interface AdminLocationTrackerProps {
  bookingId: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
}

export function AdminLocationTracker({ bookingId, initialLatitude, initialLongitude }: AdminLocationTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(initialLatitude || null);
  const [longitude, setLongitude] = useState<number | null>(initialLongitude || null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    toast.info("Requesting geolocation permission...");
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const newLat = position.coords.latitude;
        const newLon = position.coords.longitude;
        setLatitude(newLat);
        setLongitude(newLon);

        // Send location to server
        const result = await updateDriverLocation(bookingId, newLat, newLon);
        if (result.success) {
          // console.log("Location updated:", newLat, newLon);
        } else {
          toast.error("Failed to update location on server.", { description: result.message });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Geolocation error.", { description: error.message });
        stopTracking(); // Stop tracking on error
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0, // No cached position
        timeout: 5000, // 5 seconds timeout
      }
    );

    setIsTracking(true);
    toast.success("Live tracking started!", { description: "Your location is now being shared for this booking." });
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
    toast.info("Live tracking stopped.");
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-700 rounded-lg border border-gray-600">
      <h4 className="text-lg font-semibold text-vipo-DEFAULT flex items-center gap-2">
        <MapPin className="w-5 h-5" /> Driver Location Tracking
      </h4>
      <p className="text-gray-300 text-sm">
        {isTracking ? "Sharing live location..." : "Not sharing location."}
      </p>
      {latitude !== null && longitude !== null && (
        <p className="text-gray-300 text-sm">
          Lat: {latitude.toFixed(5)}, Lon: {longitude.toFixed(5)}
        </p>
      )}
      <div className="flex gap-2">
        {!isTracking ? (
          <Button onClick={startTracking} className="bg-vipo-DEFAULT hover:bg-vipo-dark text-black flex items-center gap-1">
            <PlayCircle className="w-4 h-4" /> Start Tracking
          </Button>
        ) : (
          <Button onClick={stopTracking} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1">
            <PauseCircle className="w-4 h-4" /> Stop Tracking
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Note: This uses your browser's geolocation. It may not work reliably in the background and will consume battery.
      </p>
    </div>
  );
}
