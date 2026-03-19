import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { X, RotateCcw } from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number | null, lng: number | null) => void;
  searchLocation?: string;
}

function ClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function GeoSearch({ query }: { query: string }) {
  const map = useMap();
  useEffect(() => {
    if (!query || query.length < 3) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          map.setView([parseFloat(lat), parseFloat(lon)], 14);
        }
      } catch {}
    }, 800);
    return () => clearTimeout(timeout);
  }, [query, map]);
  return null;
}

const LocationPicker = ({ latitude, longitude, onLocationChange, searchLocation }: LocationPickerProps) => {
  const defaultLat = latitude || 12.9716;
  const defaultLng = longitude || 77.5946;

  const handleClear = () => {
    onLocationChange(null, null);
  };

  return (
    <div className="space-y-2">
      <div className="w-full h-48 rounded-xl overflow-hidden border border-border relative" style={{ zIndex: 0 }}>
        <MapContainer
          center={[defaultLat, defaultLng]}
          zoom={13}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onLocationChange={(lat, lng) => onLocationChange(lat, lng)} />
          {searchLocation && <GeoSearch query={searchLocation} />}
          {latitude && longitude && (
            <>
              <Marker position={[latitude, longitude]} />
              <MapCenter lat={latitude} lng={longitude} />
            </>
          )}
        </MapContainer>
      </div>
      {latitude && longitude && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground flex-1">📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
          <Button type="button" variant="outline" size="sm" onClick={handleClear} className="h-7 text-xs gap-1">
            <X className="w-3 h-3" /> Clear Marker
          </Button>
        </div>
      )}
      {!latitude && !longitude && (
        <p className="text-xs text-muted-foreground">Tap on the map to place a marker (optional)</p>
      )}
    </div>
  );
};

export default LocationPicker;
