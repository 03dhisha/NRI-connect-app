import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const highlightIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [35, 51],
  iconAnchor: [17, 51],
  popupAnchor: [1, -34],
  shadowSize: [51, 51],
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Listing {
  id: string;
  title: string;
  location: string;
  rent_amount: number;
  latitude: number | null;
  longitude: number | null;
}

interface HousingMapProps {
  listings: Listing[];
  selectedListingId: string | null;
  onMarkerClick: (id: string) => void;
}

function FlyToSelected({ listings, selectedId }: { listings: Listing[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const listing = listings.find((l) => l.id === selectedId);
    if (listing?.latitude && listing?.longitude) {
      map.flyTo([listing.latitude, listing.longitude], 15, { duration: 0.8 });
    }
  }, [selectedId, listings, map]);
  return null;
}

const HousingMap = ({ listings, selectedListingId, onMarkerClick }: HousingMapProps) => {
  const mappableListings = listings.filter((l) => l.latitude && l.longitude);

  const center: [number, number] = mappableListings.length > 0
    ? [mappableListings[0].latitude!, mappableListings[0].longitude!]
    : [12.9716, 77.5946];

  return (
    <div className="w-full h-48 rounded-2xl overflow-hidden shadow-card">
      <MapContainer
        center={center}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FlyToSelected listings={listings} selectedId={selectedListingId} />
        {mappableListings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude!, listing.longitude!]}
            icon={listing.id === selectedListingId ? highlightIcon : defaultIcon}
            eventHandlers={{ click: () => onMarkerClick(listing.id) }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{listing.title}</p>
                <p>₹{listing.rent_amount.toLocaleString()}/month</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default HousingMap;
