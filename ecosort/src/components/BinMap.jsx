import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Navigation, AlertTriangle, CheckCircle } from 'lucide-react';
import L from 'leaflet';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

// Custom bin icons
const createBinIcon = (type, isFull) => {
  const colors = {
    WET: '#10b981', // green
    DRY: '#3b82f6', // blue
    E_WASTE: '#f59e0b', // amber
    HAZARDOUS: '#ef4444', // red
    RECYCLABLE: '#8b5cf6' // purple
  };

  const color = isFull ? '#ef4444' : colors[type] || '#6b7280';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">
          ${isFull ? '!' : type.charAt(0)}
        </div>
      </div>
    `,
    className: 'custom-bin-icon',
    iconSize: [25, 25],
    iconAnchor: [12, 24]
  });
};

// User location icon
const userIcon = L.divIcon({
  html: `
    <div style="
      background-color: #dc2626;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  className: 'user-location-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Utility function for bin type colors
const getBinTypeColor = (type) => {
  const colors = {
    WET: 'text-green-600 bg-green-100',
    DRY: 'text-blue-600 bg-blue-100',
    E_WASTE: 'text-amber-600 bg-amber-100',
    HAZARDOUS: 'text-red-600 bg-red-100',
    RECYCLABLE: 'text-purple-600 bg-purple-100'
  };
  return colors[type] || 'text-gray-600 bg-gray-100';
};

// Map wrapper component to handle initialization properly
const MapWrapper = ({ center, zoom, userLocation, bins, user, reportingBin, setReportingBin, setBins }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      zoomControl={false}
      key={`map-${center[0]}-${center[1]}-${zoom}`}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* User location marker */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
        >
          <Popup>
            <div className="text-center">
              <div className="font-medium text-gray-800 mb-1">Your Location</div>
              <div className="text-sm text-gray-600">
                Lat: {userLocation.lat.toFixed(4)}<br/>
                Lng: {userLocation.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Bin markers */}
      {bins.map((bin) => (
        <Marker
          key={bin.id}
          position={[bin.latitude, bin.longitude]}
          icon={createBinIcon(bin.type, bin.isFull)}
        >
          <Popup>
            <div className="min-w-64">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-800">{bin.name}</h4>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBinTypeColor(bin.type)}`}>
                    {bin.type.replace('_', '-')}
                  </span>
                </div>
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
              </div>

              <div className="flex items-center gap-2 mb-3">
                {bin.isFull ? (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Full</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Available</span>
                  </div>
                )}
                <span className="text-sm text-gray-600">
                  Capacity: {bin.capacity}L
                </span>
              </div>

              {!bin.isFull && user && (
                <BinReportButton 
                  bin={bin}
                  reportingBin={reportingBin}
                  setReportingBin={setReportingBin}
                  setBins={setBins}
                />
              )}

              <div className="mt-2 text-xs text-gray-500">
                {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

// Separate component for bin report button to avoid re-renders
const BinReportButton = ({ bin, reportingBin, setReportingBin, setBins }) => {
  const reportBinFull = async (binId) => {
    setReportingBin(binId);
    
    try {
      const response = await api.patch(`/bins/${binId}/report-full`);
      if (response.data.success) {
        toast.success(response.data.message);
        // Update local state
        setBins(prevBins => 
          prevBins.map(b => 
            b.id === binId ? { ...b, isFull: true } : b
          )
        );
      }
    } catch (error) {
      console.error('Error reporting bin:', error);
      toast.error(error.response?.data?.error || 'Failed to report bin');
    } finally {
      setReportingBin(null);
    }
  };

  return (
    <button
      onClick={() => reportBinFull(bin.id)}
      disabled={reportingBin === bin.id}
      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        reportingBin === bin.id
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-red-600 hover:bg-red-700 text-white'
      }`}
    >
      {reportingBin === bin.id ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Reporting...
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Report Full
        </div>
      )}
    </button>
  );
};

const BinMap = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [reportingBin, setReportingBin] = useState(null);

  useEffect(() => {
    fetchBins();
  }, []);

  // Force re-render map when location changes to avoid initialization conflicts
  useEffect(() => {
    if (userLocation) {
      // Trigger re-render by updating bins
      fetchBins();
    }
  }, [userLocation]);

  const fetchBins = async () => {
    try {
      const response = await api.get('/bins');
      if (response.data.success) {
        setBins(response.data.data.bins);
      }
    } catch (error) {
      console.error('Error fetching bins:', error);
      toast.error('Failed to load bin locations');
    }
  };

  const getUserLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLoadingLocation(false);
        toast.success('Location updated!');
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get your location');
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const defaultCenter = [12.9716, 77.5946]; // Default to Bangalore coordinates
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;
  const mapZoom = userLocation ? 15 : 13;

  return (
    <div className="h-full w-full relative">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold text-gray-800 mb-3">Smart Bin Locator</h3>
        
        <button
          onClick={getUserLocation}
          disabled={isLoadingLocation}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isLoadingLocation
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoadingLocation ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Getting Location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Find My Location
            </>
          )}
        </button>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
            Bin Types
          </h4>
          <div className="space-y-1">
            {['WET', 'DRY', 'E_WASTE', 'HAZARDOUS', 'RECYCLABLE'].map(type => (
              <div key={type} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded-full ${getBinTypeColor(type).split(' ')[1]}`}></div>
                <span className="text-gray-600">
                  {type.replace('_', '-')}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t border-gray-100">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Full bin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapWrapper
        center={mapCenter}
        zoom={mapZoom}
        userLocation={userLocation}
        bins={bins}
        user={user}
        reportingBin={reportingBin}
        setReportingBin={setReportingBin}
        setBins={setBins}
      />

      {/* Stats overlay */}
      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <div className="text-sm font-medium text-gray-800 mb-2">Bin Status</div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Available: {bins.filter(b => !b.isFull).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Full: {bins.filter(b => b.isFull).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinMap;
