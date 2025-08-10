import React, { useState, useEffect } from 'react';
import { Search, Star, Gem, TrendingUp } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const ValuableGuide = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValueLevel, setSelectedValueLevel] = useState('ALL');

  useEffect(() => {
    const fetchValuableMaterials = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/valuable-materials');
        if (response.data.success) {
          setMaterials(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching valuable materials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchValuableMaterials();
  }, []);

  useEffect(() => {
    const filterMaterials = () => {
      let filtered = materials;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(material =>
          material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by value level
      if (selectedValueLevel !== 'ALL') {
        filtered = filtered.filter(material => material.valueLevel === selectedValueLevel);
      }

      setFilteredMaterials(filtered);
    };

    filterMaterials();
  }, [materials, searchTerm, selectedValueLevel]);

  const getValueLevelIcon = (level) => {
    switch (level) {
      case 'HIGH':
        return <Gem className="w-5 h-5 text-purple-500" />;
      case 'MEDIUM':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'LOW':
        return <Star className="w-5 h-5 text-green-500" />;
      default:
        return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  const getValueLevelColor = (level) => {
    switch (level) {
      case 'HIGH':
        return 'text-purple-600 bg-purple-100';
      case 'MEDIUM':
        return 'text-blue-600 bg-blue-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const valueLevels = [
    { value: 'ALL', label: 'All Materials' },
    { value: 'HIGH', label: 'High Value' },
    { value: 'MEDIUM', label: 'Medium Value' },
    { value: 'LOW', label: 'Low Value' }
  ];

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Valuable Materials Guide</h2>
        <p className="text-gray-600">
          Discover valuable materials that can earn you money when recycled properly.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Value Level Filter */}
        <div className="flex flex-wrap gap-2">
          {valueLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => setSelectedValueLevel(level.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedValueLevel === level.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              {material.imageUrl ? (
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <Gem className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Value Level Badge */}
              <div className="absolute top-3 right-3">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getValueLevelColor(material.valueLevel)}`}>
                  {getValueLevelIcon(material.valueLevel)}
                  {material.valueLevel}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {material.name}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {material.description}
              </p>

              {/* Value Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getValueLevelIcon(material.valueLevel)}
                  <span className="text-sm font-medium text-gray-700">
                    {material.valueLevel} Value
                  </span>
                </div>
                
                <div className="text-xs text-gray-500">
                  ID: {material.id.slice(-8)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-12">
          <Gem className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No materials found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 p-4 bg-green-50 rounded-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {materials.length}
            </div>
            <div className="text-sm text-gray-600">Total Materials</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {materials.filter(m => m.valueLevel === 'HIGH').length}
            </div>
            <div className="text-sm text-gray-600">High Value</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {materials.filter(m => m.valueLevel === 'MEDIUM').length}
            </div>
            <div className="text-sm text-gray-600">Medium Value</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {materials.filter(m => m.valueLevel === 'LOW').length}
            </div>
            <div className="text-sm text-gray-600">Low Value</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuableGuide;
