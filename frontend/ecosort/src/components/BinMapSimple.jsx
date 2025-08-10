import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const BinMapSimple = () => {
  const { user } = useAuth();
  const [bins, setBins] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [reportingBin, setReportingBin] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);

  useEffect(() => {
    fetchBins();
  }, []);

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

  const reportBinFull = async (binId) => {
    if (!user) {
      toast.error('Please log in to report bins');
      return;
    }

    setReportingBin(binId);
    
    try {
      const response = await api.patch(`/bins/${binId}/report-full`);
      if (response.data.success) {
        toast.success(response.data.message);
        setBins(prevBins => 
          prevBins.map(bin => 
            bin.id === binId ? { ...bin, isFull: true } : bin
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

  const getBinTypeColor = (type) => {
    const colors = {
      WET: 'text-green-600 bg-green-100 border-green-300',
      DRY: 'text-blue-600 bg-blue-100 border-blue-300',
      E_WASTE: 'text-amber-600 bg-amber-100 border-amber-300',
      HAZARDOUS: 'text-red-600 bg-red-100 border-red-300',
      RECYCLABLE: 'text-purple-600 bg-purple-100 border-purple-300'
    };
    return colors[type] || 'text-gray-600 bg-gray-100 border-gray-300';
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const sortedBins = userLocation 
    ? bins.sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return distA - distB;
      })
    : bins;

  return (
    <div className="h-full w-full p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Bin Locator</h1>
          <p className="text-gray-600">Find the nearest waste disposal bins and report their status</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Location</h2>
            <button
              onClick={getUserLocation}
              disabled={isLoadingLocation}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                  Get My Location
                </>
              )}
            </button>
          </div>

          {userLocation ? (
            <div className="text-sm text-gray-600">
              📍 Current location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              📍 Location not set - Enable location to find nearby bins
            </div>
          )}

          {/* Bin Type Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Bin Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['WET', 'DRY', 'E_WASTE', 'HAZARDOUS', 'RECYCLABLE'].map(type => (
                <div key={type} className={`px-2 py-1 rounded-full text-xs font-medium border ${getBinTypeColor(type)}`}>
                  {type.replace('_', '-')}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Available Bins</h3>
                <p className="text-2xl font-bold text-gray-900">{bins.filter(b => !b.isFull).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Full Bins</h3>
                <p className="text-2xl font-bold text-gray-900">{bins.filter(b => b.isFull).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Bins</h3>
                <p className="text-2xl font-bold text-gray-900">{bins.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bins List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              {userLocation ? 'Nearby Bins' : 'All Bins'}
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {sortedBins.map((bin) => {
              const distance = userLocation 
                ? calculateDistance(userLocation.lat, userLocation.lng, bin.latitude, bin.longitude)
                : null;

              return (
                <div
                  key={bin.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedBin?.id === bin.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedBin(selectedBin?.id === bin.id ? null : bin)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{bin.name}</h3>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getBinTypeColor(bin.type)}`}>
                          {bin.type.replace('_', '-')}
                        </span>
                        {bin.isFull ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100 border border-red-300">
                            <AlertTriangle className="w-3 h-3" />
                            Full
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100 border border-green-300">
                            <CheckCircle className="w-3 h-3" />
                            Available
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>📍 {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}</span>
                        <span>📦 {bin.capacity}L capacity</span>
                        {distance && (
                          <span className="font-medium text-blue-600">
                            📍 {distance.toFixed(1)}km away
                          </span>
                        )}
                      </div>

                      {selectedBin?.id === bin.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-700 mb-3">
                            <strong>Bin Details:</strong>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Type:</span>
                              <span className="ml-2 font-medium">{bin.type.replace('_', ' ')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Capacity:</span>
                              <span className="ml-2 font-medium">{bin.capacity}L</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <span className={`ml-2 font-medium ${bin.isFull ? 'text-red-600' : 'text-green-600'}`}>
                                {bin.isFull ? 'Full' : 'Available'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Location:</span>
                              <span className="ml-2 font-medium">{bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {distance && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">{distance.toFixed(1)}km</div>
                          <div className="text-xs text-gray-500">away</div>
                        </div>
                      )}
                      
                      {!bin.isFull && user && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            reportBinFull(bin.id);
                          }}
                          disabled={reportingBin === bin.id}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            reportingBin === bin.id
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {reportingBin === bin.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Reporting...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Report Full
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinMapSimple;
