"use client"

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useMemo } from 'react';

interface GoogleMapComponentProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem', // Matches the Card's border-radius
};

export function GoogleMapComponent({ latitude, longitude, zoom = 15 }: GoogleMapComponentProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    // You can add other libraries here if needed, e.g., libraries: ['places']
  });

  const center = useMemo(() => ({
    lat: latitude,
    lng: longitude,
  }), [latitude, longitude]);

  if (loadError) {
    return <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center text-red-400 text-center p-4">
      Error loading Google Maps: {loadError.message}. Please check your API key and network connection.
    </div>;
  }

  if (!isLoaded) {
    return <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-xl">
      Loading map...
    </div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={{
        disableDefaultUI: true, // Disable default UI controls
        zoomControl: true, // Enable zoom control
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        rotateControl: false,
        scaleControl: false,
        scrollwheel: true,
        draggable: true,
        keyboardShortcuts: false,
      }}
    >
      <Marker
        position={center}
        // You can customize the marker icon here if you have a car SVG/PNG
        // icon={{
        //   url: "/path/to/car-icon.png", // Example custom icon
        //   scaledSize: new window.google.maps.Size(40, 40),
        // }}
      />
    </GoogleMap>
  );
}