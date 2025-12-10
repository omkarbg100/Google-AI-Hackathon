import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Provider } from '../types';

// Fix for default Leaflet marker icons in React
// Using CDN URLs directly to avoid bundler import issues with image assets in this environment
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  providers: Provider[];
  userLocation: { lat: number; lng: number } | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ providers, userLocation }) => {
  // Default to SF if no location
  const centerPosition: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [37.7749, -122.4194]; 

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-md border border-gray-200 z-0 relative">
      <MapContainer 
        center={centerPosition} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Marker */}
        {userLocation && (
           <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              You are here
            </Popup>
          </Marker>
        )}

        {/* Provider Markers */}
        {providers.map((p) => (
          <Marker key={p.id} position={[p.location.lat, p.location.lng]}>
            <Popup>
              <div className="font-bold">{p.name}</div>
              <div className="text-sm">{p.type}</div>
              <div className="text-xs text-gray-600">{p.phone}</div>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${p.location.lat},${p.location.lng}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 text-xs underline mt-1 block"
              >
                Get Directions
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;