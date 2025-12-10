import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Provider, User, Review } from '../types';
import { db } from '../services/db';
import { IconStar } from './Icons';

// Fix for Leaflet icons
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

// Custom Car Icon (Uber style)
const CarIcon = L.divIcon({
    html: '<div style="font-size: 32px; filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3)); transform: rotateY(180deg);">🚑</div>',
    className: 'custom-car-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

// Component to handle map bounds
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
  }, [center, map]);
  return null;
};

interface TripViewProps {
  provider: Provider;
  currentUser: User | null;
  onComplete: () => void;
}

const TripView: React.FC<TripViewProps> = ({ provider, currentUser, onComplete }) => {
  const [status, setStatus] = useState<'SEARCHING' | 'ON_THE_WAY' | 'ARRIVED' | 'REVIEW'>('SEARCHING');
  
  const [driver] = useState({
      name: 'Rajesh Kumar',
      vehicle: 'Toyota Innova (Ambulance)',
      plate: 'KA-05-MR-5555',
      phone: '+91-9876543210',
      rating: 4.8
  });

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  
  // Locations
  const userLoc = { lat: 37.7649, lng: -122.4294 }; // Start
  const destLoc = { lat: provider.location.lat, lng: provider.location.lng }; // End

  // Animation State
  const [driverPosition, setDriverPosition] = useState<[number, number]>([userLoc.lat, userLoc.lng]);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(12); // Minutes

  // Simulation Logic
  useEffect(() => {
      let animationFrame: number;
      let startTime: number;
      const DURATION = 15000; // 15 seconds to simulate the trip for demo

      if (status === 'SEARCHING') {
          const timer = setTimeout(() => {
              setStatus('ON_THE_WAY');
          }, 3000);
          return () => clearTimeout(timer);
      }

      if (status === 'ON_THE_WAY') {
          const animate = (timestamp: number) => {
              if (!startTime) startTime = timestamp;
              const runtime = timestamp - startTime;
              const relativeProgress = Math.min(runtime / DURATION, 1);

              // Linear Interpolation (Lerp) for coordinates
              const lat = userLoc.lat + (destLoc.lat - userLoc.lat) * relativeProgress;
              const lng = userLoc.lng + (destLoc.lng - userLoc.lng) * relativeProgress;

              setDriverPosition([lat, lng]);
              setProgress(relativeProgress);
              
              // Update ETA dynamically
              setEta(Math.ceil(12 * (1 - relativeProgress)));

              if (relativeProgress < 1) {
                  animationFrame = requestAnimationFrame(animate);
              } else {
                  setStatus('ARRIVED');
                  setEta(0);
              }
          };

          animationFrame = requestAnimationFrame(animate);
          return () => cancelAnimationFrame(animationFrame);
      }
  }, [status]);

  const handleSubmitReview = () => {
    if (!currentUser) {
        alert("Please login to submit a review.");
        onComplete();
        return;
    }
    
    const newReview: Review = {
        id: Date.now().toString(),
        userName: currentUser.name,
        rating: reviewRating || 5,
        comment: reviewComment || "No comment provided.",
        date: new Date().toLocaleDateString()
    };
    
    db.addReview(provider.id, newReview);
    alert("Review Submitted! Thank you.");
    onComplete();
  };

  const polylinePositions = [
      [userLoc.lat, userLoc.lng],
      [destLoc.lat, destLoc.lng]
  ] as [number, number][];

  return (
    <div className="h-[calc(100vh-64px)] relative flex flex-col bg-gray-100">
      {/* Top Floating Status Bar (Mobile style) */}
      <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-4 flex items-center justify-between border border-white/50">
           <div>
             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Destination</p>
             <p className="font-bold text-slate-900 truncate">{provider.name}</p>
           </div>
           {status === 'ON_THE_WAY' && (
             <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-mono font-bold text-sm shadow-blue-200">
               {eta} min
             </div>
           )}
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-grow relative z-0">
          <MapContainer 
            center={[userLoc.lat, userLoc.lng]} 
            zoom={14} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Start Point */}
            <Marker position={[userLoc.lat, userLoc.lng]}>
                <Popup>Your Location</Popup>
            </Marker>
            
            {/* End Point */}
            <Marker position={[destLoc.lat, destLoc.lng]}>
                <Popup>{provider.name}</Popup>
            </Marker>

            {/* Simulated Route Line */}
            {status !== 'SEARCHING' && (
                <>
                    <Polyline 
                        positions={polylinePositions} 
                        color="#6366f1" 
                        weight={5} 
                        opacity={0.6}
                        dashArray="1, 10" 
                    />
                    {/* The "Route Taken" solid line */}
                    <Polyline 
                        positions={[
                            [userLoc.lat, userLoc.lng],
                            driverPosition
                        ] as [number, number][]} 
                        color="#3b82f6" 
                        weight={5} 
                    />

                    {/* Animated Car Marker */}
                    <Marker 
                        position={driverPosition} 
                        icon={CarIcon}
                        zIndexOffset={1000} 
                    />
                    
                    {/* Camera Follow Logic */}
                    {status === 'ON_THE_WAY' && <MapUpdater center={driverPosition} />}
                </>
            )}
          </MapContainer>
      </div>

      {/* Bottom Floating Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] pointer-events-auto overflow-hidden animate-fade-in border border-gray-100">
            
            {/* SEARCHING STATE */}
            {status === 'SEARCHING' && (
                <div className="p-8 text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Connecting to Driver...</h3>
                    <p className="text-slate-500 mt-2 text-sm">Finding the nearest ambulance for you.</p>
                </div>
            )}

            {/* ON TRIP STATE */}
            {(status === 'ON_THE_WAY' || status === 'ARRIVED') && (
                <div className="p-0">
                    {/* Status Header */}
                    <div className={`px-6 py-3 text-white font-bold text-center text-sm tracking-wide ${status === 'ARRIVED' ? 'bg-green-600' : 'bg-slate-900'}`}>
                        {status === 'ARRIVED' ? 'DRIVER HAS ARRIVED' : 'EN ROUTE TO DESTINATION'}
                    </div>

                    <div className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm">
                                👨🏽‍✈️
                            </div>
                            <div className="flex-grow">
                                <div className="font-bold text-slate-900 text-lg">{driver.name}</div>
                                <div className="text-sm text-slate-500">{driver.vehicle}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-slate-700 font-mono text-xs font-bold border border-gray-200">{driver.plate}</span>
                                    <div className="flex items-center text-xs">
                                        <IconStar className="w-3 h-3 text-yellow-400" fill />
                                        <span className="ml-1 font-bold text-slate-700">{driver.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <a 
                                href={`tel:${driver.phone}`}
                                className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition shadow-sm border border-green-100"
                            >
                                <span className="text-xl">📞</span>
                            </a>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-6 mb-2">
                             <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                                <span>Start</span>
                                <span>Destination</span>
                             </div>
                             <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 transition-all duration-300 ease-linear"
                                    style={{ width: `${progress * 100}%` }}
                                ></div>
                             </div>
                        </div>

                        {status === 'ON_THE_WAY' ? (
                            <button 
                                onClick={() => { setStatus('REVIEW'); setEta(0); }}
                                className="w-full mt-4 bg-gray-50 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-100 transition text-sm border border-gray-200"
                            >
                                Skip Simulation
                            </button>
                        ) : (
                             <button 
                                onClick={() => setStatus('REVIEW')}
                                className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 animate-pulse"
                            >
                                Complete & Rate
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* REVIEW STATE */}
            {status === 'REVIEW' && (
                <div className="p-6 text-center">
                     <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        ✓
                     </div>
                     <h3 className="text-2xl font-bold text-slate-900 mb-2">Trip Completed</h3>
                     <p className="text-slate-500 text-sm mb-6">How was your experience with {provider.name}?</p>
                     
                     <div className="flex justify-center gap-3 mb-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className="transition transform hover:scale-125 focus:outline-none"
                            >
                                <IconStar 
                                    className={`w-10 h-10 ${star <= reviewRating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}`} 
                                    fill={star <= reviewRating} 
                                />
                            </button>
                        ))}
                     </div>

                     <textarea 
                        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 mb-4 text-sm"
                        rows={3}
                        placeholder="Write a review (optional)..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                     />

                     <button 
                        onClick={handleSubmitReview}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-xl"
                     >
                        Submit Feedback
                     </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TripView;