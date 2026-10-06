import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { CAMPUS_LOCATIONS } from '../../data/constants';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 18); }, [center, map]);
  return null;
}

export default function LocationSelector({
  location, setLocation,
  customLocation, setCustomLocation,
  gpsCoords, setGpsCoords
}) {
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  useEffect(() => {
    if (!gpsCoords) {
      requestPreciseLocation();
    }
  }, []);

  const requestPreciseLocation = () => {
    setIsLocating(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsLocating(false);
      },
      (error) => {
        setGpsError('Could not fetch precise GPS location. Please ensure location permissions are enabled.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="sos-location" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-red-400" />
          General Area
        </label>
        <span className="text-[11px] text-red-400">*Required</span>
      </div>

      <select
        id="sos-location"
        required
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 focus:border-red-500 rounded-xl p-3.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors appearance-none"
      >
        <option value="" disabled>Select nearest landmark...</option>
        {CAMPUS_LOCATIONS.map((loc) => (
          <option key={loc} value={loc} className="capitalize">{loc}</option>
        ))}
      </select>

      {location === 'Other' && (
        <input
          type="text"
          value={customLocation}
          onChange={(e) => setCustomLocation(e.target.value)}
          placeholder="Please specify your exact location..."
          className="w-full bg-slate-900 border border-slate-700 focus:border-red-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 mt-2 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
      )}

      {/* Real-world Map & GPS Integration ONLY */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-400" />
            Precise GPS Coordinates
          </span>
          <button
            type="button"
            onClick={requestPreciseLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Locating...' : 'Refresh GPS'}
          </button>
        </div>

        {gpsError && (
          <div className="text-xs text-amber-400 flex items-center gap-1 mb-2">
            <AlertCircle className="w-3.5 h-3.5" /> {gpsError}
          </div>
        )}

        {gpsCoords ? (
          <div className="h-40 w-full rounded-lg overflow-hidden border border-slate-700 relative z-0">
            <MapContainer center={[gpsCoords.lat, gpsCoords.lng]} zoom={18} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[gpsCoords.lat, gpsCoords.lng]}>
                <Popup>You are within {Math.round(gpsCoords.accuracy)} meters of this point.</Popup>
              </Marker>
              <MapUpdater center={[gpsCoords.lat, gpsCoords.lng]} />
            </MapContainer>
          </div>
        ) : (
          <div className="h-32 w-full rounded-lg border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
            <Navigation className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-300">Awaiting GPS Signal</p>
            <p className="text-xs mt-1">Please allow location access to pinpoint your exact coordinates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
