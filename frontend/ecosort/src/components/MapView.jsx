import React from 'react';
import { Map as MapIcon, MapPin, Navigation } from 'lucide-react';

const MapView = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">
          🗺️ Waste Bin Locator
        </h1>
        <p className="text-eco-light text-lg">
          Find nearby waste disposal bins and recycling centers
        </p>
      </div>

      {/* Coming Soon Message */}
      <div className="card text-center py-12">
        <MapIcon className="mx-auto text-eco-blue mb-4" size={64} />
        <h2 className="text-2xl font-bold text-eco-dark mb-4">
          Interactive Map Coming Soon! 🗺️
        </h2>
        <p className="text-eco-light mb-6 max-w-2xl mx-auto">
          We're building an interactive map powered by React Leaflet and OpenStreetMap 
          to help you find the nearest waste disposal bins, recycling centers, and 
          e-waste collection points in your area.
        </p>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
          <div className="card bg-eco-green bg-opacity-5">
            <MapPin className="mx-auto text-eco-green mb-3" size={32} />
            <h3 className="font-semibold text-eco-dark mb-2">Pin Locations</h3>
            <p className="text-eco-light text-sm">
              Green pins for available bins, red for full bins, blue for e-waste centers
            </p>
          </div>
          
          <div className="card bg-eco-blue bg-opacity-5">
            <Navigation className="mx-auto text-eco-blue mb-3" size={32} />
            <h3 className="font-semibold text-eco-dark mb-2">Smart Navigation</h3>
            <p className="text-eco-light text-sm">
              Get directions to the nearest appropriate bin for your waste type
            </p>
          </div>
          
          <div className="card bg-eco-yellow bg-opacity-5">
            <MapIcon className="mx-auto text-eco-yellow mb-3" size={32} />
            <h3 className="font-semibold text-eco-dark mb-2">Real-time Status</h3>
            <p className="text-eco-light text-sm">
              Live updates on bin capacity and availability
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-eco-light text-sm">
            In the meantime, use our Waste Guide to learn about proper disposal methods!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
