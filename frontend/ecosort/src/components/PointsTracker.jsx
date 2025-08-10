import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Trash2, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PointsTracker = () => {
  const { user, refreshUser } = useAuth();
  const [wasteItems, setWasteItems] = useState([]);
  const [selectedWasteItem, setSelectedWasteItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWasteItems();
  }, []);

  const fetchWasteItems = async () => {
    try {
      const response = await api.get('/waste-items?limit=100');
      if (response.data.success) {
        setWasteItems(response.data.data.wasteItems);
      }
    } catch (error) {
      console.error('Error fetching waste items:', error);
    }
  };

  const filteredWasteItems = wasteItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const logWaste = async () => {
    if (!selectedWasteItem) {
      toast.error('Please select a waste item');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/waste-logs', {
        wasteItemId: selectedWasteItem,
        quantity
      });

      if (response.data.success) {
        const { message } = response.data.data;
        toast.success(message);
        
        // Update user points in context
        refreshUser();
        
        // Reset form
        setSelectedWasteItem('');
        setQuantity(1);
        setSearchTerm('');
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error logging waste:', error);
      toast.error(error.response?.data?.error || 'Failed to log waste');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedItem = wasteItems.find(item => item.id === selectedWasteItem);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      {/* Header with current points */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Points Tracker</h2>
          <div className="flex items-center gap-2 text-green-600">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">{user?.points || 0} Points</span>
          </div>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <Trash2 className="w-6 h-6 text-green-600" />
        </div>
      </div>

      {/* Waste Item Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Waste Type
        </label>
        <div className="relative">
          <button
            type="button"
            className="w-full px-4 py-3 text-left bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex items-center justify-between">
              <span className={selectedItem ? 'text-gray-900' : 'text-gray-500'}>
                {selectedItem ? selectedItem.name : 'Choose waste item...'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </div>
            {selectedItem && (
              <div className="mt-1 text-xs text-gray-500">
                {selectedItem.category} • +{selectedItem.points} points
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {/* Search input */}
              <div className="p-3 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Search waste items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              {/* Waste items list */}
              <div className="py-1">
                {filteredWasteItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50"
                    onClick={() => {
                      setSelectedWasteItem(item.id);
                      setShowDropdown(false);
                      setSearchTerm('');
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.category} • {item.binType} bin
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        +{item.points}
                      </span>
                    </div>
                  </button>
                ))}
                {filteredWasteItems.length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    No items found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quantity Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 px-3 py-2 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            min="1"
          />
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Expected Points Display */}
      {selectedItem && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600">Expected reward:</div>
          <div className="text-lg font-bold text-green-600">
            +{selectedItem.points * quantity} points
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={logWaste}
        disabled={!selectedWasteItem || isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          selectedWasteItem && !isLoading
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Logging...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Log Waste Disposal
          </div>
        )}
      </button>

      {/* Disposal Instructions */}
      {selectedItem && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Disposal Instructions:
          </div>
          <div className="text-sm text-blue-700">
            {selectedItem.disposalInstructions}
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsTracker;
