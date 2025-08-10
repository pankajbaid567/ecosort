import React, { useState, useEffect } from 'react';
import { Search, Trash2, MapPin, Award, X, Filter } from 'lucide-react';
import { wasteItemAPI, wasteLogAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const WasteGuide = () => {
  const { isAuthenticated } = useAuth();
  const [wasteItems, setWasteItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: '', label: 'All Categories', color: 'bg-gray-100 text-gray-700' },
    { value: 'WET', label: 'Wet Waste', color: 'badge-wet' },
    { value: 'DRY', label: 'Dry Waste', color: 'badge-dry' },
    { value: 'RECYCLABLE', label: 'Recyclable', color: 'badge-recyclable' },
    { value: 'E_WASTE', label: 'E-Waste', color: 'badge-ewaste' },
    { value: 'HAZARDOUS', label: 'Hazardous', color: 'badge-hazardous' },
  ];

  // Fetch waste items
  const fetchWasteItems = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: 20,
        search: searchQuery.trim(),
        category: selectedCategory,
      };

      const response = await wasteItemAPI.getAll(params);
      
      if (response.success) {
        setWasteItems(response.data.wasteItems);
        setPagination({
          page: response.data.pagination.page,
          totalPages: response.data.pagination.totalPages,
          totalCount: response.data.pagination.totalCount
        });
      }
    } catch (error) {
      console.error('Failed to fetch waste items:', error);
      toast.error('Failed to load waste guide');
    } finally {
      setIsLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWasteItems(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory]);

  // Initial load
  useEffect(() => {
    fetchWasteItems();
  }, []);

  // Handle item click
  const handleItemClick = async (item) => {
    try {
      const response = await wasteItemAPI.getById(item.id);
      if (response.success) {
        setSelectedItem(response.data.wasteItem);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch item details:', error);
      toast.error('Failed to load item details');
    }
  };

  // Handle waste log creation
  const handleLogWaste = async (quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to log waste disposal');
      return;
    }

    try {
      const response = await wasteLogAPI.create({
        wasteItemId: selectedItem.id,
        quantity
      });

      if (response.success) {
        toast.success(response.data.message);
        setShowModal(false);
        // Optionally refresh user points or other data
      }
    } catch (error) {
      console.error('Failed to log waste:', error);
      toast.error('Failed to log waste disposal');
    }
  };

  // Get category badge class
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'WET': return 'badge-wet';
      case 'DRY': return 'badge-dry';
      case 'RECYCLABLE': return 'badge-recyclable';
      case 'E_WASTE': return 'badge-ewaste';
      case 'HAZARDOUS': return 'badge-hazardous';
      default: return 'badge bg-gray-100 text-gray-700';
    }
  };

  // Get bin type color
  const getBinTypeColor = (binType) => {
    switch (binType) {
      case 'WET': return 'text-eco-green bg-eco-green bg-opacity-10';
      case 'DRY': return 'text-eco-blue bg-eco-blue bg-opacity-10';
      case 'E_WASTE': return 'text-eco-yellow bg-eco-yellow bg-opacity-10';
      case 'HAZARDOUS': return 'text-eco-red bg-eco-red bg-opacity-10';
      case 'RECYCLABLE': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-eco-dark mb-2">
          🗂️ Waste Guide
        </h1>
        <p className="text-eco-light text-lg">
          Learn how to properly dispose of different waste items
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-eco-light" size={20} />
            <input
              type="text"
              placeholder="Search waste items (e.g., plastic bottle, banana peel...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline lg:hidden flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Category Filters */}
        <div className={`mt-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`${
                  selectedCategory === category.value
                    ? 'bg-eco-green text-white'
                    : category.color
                } badge cursor-pointer hover:shadow-md transition-all duration-200`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mt-4 text-eco-light">
            Found {pagination.totalCount} items
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
          </div>
        )}
      </div>

      {/* Waste Items Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading-spinner text-eco-green"></div>
          <span className="ml-2 text-eco-light">Loading waste guide...</span>
        </div>
      ) : wasteItems.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="mx-auto text-eco-light mb-4" size={64} />
          <h3 className="text-xl font-semibold text-eco-dark mb-2">
            No items found
          </h3>
          <p className="text-eco-light">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {wasteItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="card cursor-pointer hover:scale-105 transition-all duration-200 border border-gray-100 hover:border-eco-green"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-eco-dark text-lg leading-tight">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1 text-eco-yellow">
                  <Award size={16} />
                  <span className="text-sm font-medium">{item.points}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`${getCategoryBadgeClass(item.category)}`}>
                    {item.category.replace('_', '-')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-eco-light" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBinTypeColor(item.binType)}`}>
                    {item.binType.replace('_', '-')} Bin
                  </span>
                </div>
                
                <p className="text-eco-light text-sm line-clamp-2">
                  {item.disposalInstructions}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => fetchWasteItems(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-eco-light">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => fetchWasteItems(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Item Details Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-eco-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-eco-dark mb-2">
                  {selectedItem.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span className={`${getCategoryBadgeClass(selectedItem.category)}`}>
                    {selectedItem.category.replace('_', '-')}
                  </span>
                  <div className="flex items-center gap-1 text-eco-yellow">
                    <Award size={16} />
                    <span className="font-medium">{selectedItem.points} points</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-eco-light hover:text-eco-dark transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Disposal Bin */}
              <div className="mb-6">
                <h3 className="font-semibold text-eco-dark mb-2 flex items-center gap-2">
                  <MapPin size={18} />
                  Disposal Bin
                </h3>
                <div className={`p-3 rounded-eco ${getBinTypeColor(selectedItem.binType)}`}>
                  <span className="font-medium">
                    {selectedItem.binType.replace('_', '-')} Waste Bin
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="font-semibold text-eco-dark mb-3">
                  Disposal Instructions
                </h3>
                <p className="text-eco-light leading-relaxed">
                  {selectedItem.disposalInstructions}
                </p>
              </div>

              {/* Stats */}
              {selectedItem.totalLogged !== undefined && (
                <div className="mb-6">
                  <p className="text-sm text-eco-light">
                    This item has been properly disposed of{' '}
                    <span className="font-semibold text-eco-green">
                      {selectedItem.totalLogged} times
                    </span>{' '}
                    by our community! 🌱
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {isAuthenticated && (
              <div className="border-t p-6">
                <button
                  onClick={() => handleLogWaste(1)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Award size={20} />
                  I Disposed This Item (+{selectedItem.points} points)
                </button>
                <p className="text-xs text-eco-light text-center mt-2">
                  Click to log that you properly disposed of this item
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteGuide;
