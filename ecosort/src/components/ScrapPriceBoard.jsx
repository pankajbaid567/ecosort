import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Edit3, Check, X, IndianRupee } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const ScrapPriceBoard = () => {
  const { user } = useAuth();
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchScrapPrices();
  }, []);

  const fetchScrapPrices = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/scrap-prices');
      if (response.data.success) {
        setPrices(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching scrap prices:', error);
      toast.error('Failed to load scrap prices');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (price) => {
    setEditingPrice(price.id);
    setEditValue(price.pricePerKg.toString());
  };

  const cancelEditing = () => {
    setEditingPrice(null);
    setEditValue('');
  };

  const updatePrice = async (priceId) => {
    if (!editValue || isNaN(parseFloat(editValue)) || parseFloat(editValue) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await api.patch(`/scrap-prices/${priceId}`, {
        pricePerKg: parseFloat(editValue)
      });

      if (response.data.success) {
        toast.success('Price updated successfully!');
        setPrices(prevPrices => 
          prevPrices.map(price => 
            price.id === priceId 
              ? { ...price, pricePerKg: parseFloat(editValue), updatedAt: new Date().toISOString() }
              : price
          )
        );
        setEditingPrice(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error(error.response?.data?.error || 'Failed to update price');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatLastUpdated = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPriceTrendIcon = (updatedAt) => {
    const updateDate = new Date(updatedAt);
    const now = new Date();
    const diffInDays = Math.floor((now - updateDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 1) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (diffInDays <= 7) {
      return <TrendingDown className="w-4 h-4 text-yellow-500" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Live Scrap Prices</h2>
          <p className="text-gray-600">
            Current market rates for recyclable materials (per kg)
          </p>
        </div>
        <button
          onClick={fetchScrapPrices}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Last Updated Info */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <TrendingUp className="w-4 h-4" />
          <span>Last updated: {lastUpdated.toLocaleString()}</span>
        </div>
      </div>

      {/* Price Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-800">Material</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-800">Price/kg</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-800">Trend</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-800">Updated</th>
              {user && (
                <th className="text-center py-3 px-4 font-semibold text-gray-800">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {prices.map((price, index) => (
              <tr
                key={price.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {/* Material Name */}
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-800">
                    {price.materialName}
                  </div>
                </td>

                {/* Price */}
                <td className="py-4 px-4 text-right">
                  {editingPrice === price.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <IndianRupee className="w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                        min="0"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(price.pricePerKg)}
                    </div>
                  )}
                </td>

                {/* Trend */}
                <td className="py-4 px-4 text-center">
                  {getPriceTrendIcon(price.updatedAt)}
                </td>

                {/* Last Updated */}
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-gray-600">
                    {formatLastUpdated(price.updatedAt)}
                  </span>
                </td>

                {/* Actions */}
                {user && (
                  <td className="py-4 px-4 text-center">
                    {editingPrice === price.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updatePrice(price.id)}
                          disabled={isUpdating}
                          className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={isUpdating}
                          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(price)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit price"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium mb-1">Highest Value</div>
          <div className="text-lg font-bold text-green-700">
            {prices.length > 0 && formatPrice(Math.max(...prices.map(p => p.pricePerKg)))}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {prices.length > 0 && prices.find(p => p.pricePerKg === Math.max(...prices.map(pr => pr.pricePerKg)))?.materialName}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium mb-1">Average Price</div>
          <div className="text-lg font-bold text-blue-700">
            {prices.length > 0 && formatPrice(prices.reduce((sum, p) => sum + p.pricePerKg, 0) / prices.length)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Across {prices.length} materials
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600 font-medium mb-1">Total Materials</div>
          <div className="text-lg font-bold text-purple-700">
            {prices.length}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Tracked materials
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> Prices may vary by location, quality, and market conditions. 
          These rates are for reference only. Always verify with local scrap dealers before transactions.
        </div>
      </div>
    </div>
  );
};

export default ScrapPriceBoard;
