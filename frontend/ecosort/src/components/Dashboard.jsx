import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Trophy, Trash2, MapPin, Users, TrendingUp, Clock, 
  AlertTriangle, CheckCircle, RefreshCw, Calendar
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [binStatus, setBinStatus] = useState([]);
  const [wasteFeed, setWasteFeed] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user stats (always available)
        const userStatsResponse = await api.get('/users/me/stats');
        if (userStatsResponse.data.success) {
          setUserStats(userStatsResponse.data.data);
        }

        // Fetch admin data if user is logged in (treating all logged users as admin for now)
        if (user) {
          const [metricsResponse, binStatusResponse, wasteFeedResponse] = await Promise.all([
            api.get('/dashboard/metrics'),
            api.get('/dashboard/bin-status'),
            api.get('/dashboard/waste-feed?limit=20')
          ]);

          if (metricsResponse.data.success) {
            setMetrics(metricsResponse.data.data);
          }

          if (binStatusResponse.data.success) {
            setBinStatus(binStatusResponse.data.data);
          }

          if (wasteFeedResponse.data.success) {
            setWasteFeed(wasteFeedResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const COLORS = {
    WET: '#10b981',
    DRY: '#3b82f6', 
    E_WASTE: '#f59e0b',
    HAZARDOUS: '#ef4444',
    RECYCLABLE: '#8b5cf6'
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const refreshData = () => {
    // Re-trigger the useEffect by forcing a re-render
    setIsLoading(true);
    const refetch = async () => {
      try {
        // Fetch user stats (always available)
        const userStatsResponse = await api.get('/users/me/stats');
        if (userStatsResponse.data.success) {
          setUserStats(userStatsResponse.data.data);
        }

        // Fetch admin data if user is logged in
        if (user) {
          const [metricsResponse, binStatusResponse, wasteFeedResponse] = await Promise.all([
            api.get('/dashboard/metrics'),
            api.get('/dashboard/bin-status'),
            api.get('/dashboard/waste-feed?limit=20')
          ]);

          if (metricsResponse.data.success) {
            setMetrics(metricsResponse.data.data);
          }

          if (binStatusResponse.data.success) {
            setBinStatus(binStatusResponse.data.data);
          }

          if (wasteFeedResponse.data.success) {
            setWasteFeed(wasteFeedResponse.data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    refetch();
    toast.success('Dashboard refreshed!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {user ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user ? 'Monitor system performance and user activity' : 'Track your waste disposal progress'}
          </p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* User Stats Cards (Always visible) */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Points</p>
                <p className="text-3xl font-bold">{userStats.totalPoints}</p>
              </div>
              <Trophy className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Waste Logs</p>
                <p className="text-3xl font-bold">{userStats.totalWasteLogs}</p>
              </div>
              <Trash2 className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold">
                  {Object.values(userStats.thisMonthByCategory).reduce((sum, cat) => sum + cat.count, 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>
      )}

      {/* Admin Dashboard (Only if user is logged in) */}
      {user && metrics && (
        <>
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart },
              { key: 'bins', label: 'Bin Status', icon: MapPin },
              { key: 'activity', label: 'Live Activity', icon: Clock }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Admin Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Today's Logs</p>
                      <p className="text-2xl font-bold text-gray-800">{metrics.wasteLogsToday}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <Trash2 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Full Bins</p>
                      <p className="text-2xl font-bold text-gray-800">{metrics.fullBins}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Users</p>
                      <p className="text-2xl font-bold text-gray-800">{metrics.totalUsers}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Points Today</p>
                      <p className="text-2xl font-bold text-gray-800">{metrics.pointsToday}</p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <TrendingUp className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Waste Types Chart */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Waste by Type</h3>
                  {metrics.wasteTypeStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={metrics.wasteTypeStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="category" 
                          tick={{ fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey="count" 
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No waste logged today
                    </div>
                  )}
                </div>

                {/* User Category Breakdown */}
                {userStats && Object.keys(userStats.thisMonthByCategory).length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Monthly Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(userStats.thisMonthByCategory).map(([category, data]) => ({
                            name: category,
                            value: data.count,
                            points: data.points
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {Object.keys(userStats.thisMonthByCategory).map((category, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[category] || '#6b7280'} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Bin Status Tab */}
          {activeTab === 'bins' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bin Status Overview</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Bin Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Type</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-800">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800">Location</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-800">Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {binStatus.map((bin) => (
                      <tr key={bin.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{bin.name}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            bin.type === 'WET' ? 'bg-green-100 text-green-800' :
                            bin.type === 'DRY' ? 'bg-blue-100 text-blue-800' :
                            bin.type === 'E_WASTE' ? 'bg-yellow-100 text-yellow-800' :
                            bin.type === 'HAZARDOUS' ? 'bg-red-100 text-red-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {bin.type.replace('_', '-')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {bin.isFull ? (
                            <div className="flex items-center justify-center gap-1 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-medium">Full</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Available</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">
                          {bin.capacity}L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activity Feed Tab */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Waste Activity Feed</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {wasteFeed.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      log.category === 'WET' ? 'bg-green-100' :
                      log.category === 'DRY' ? 'bg-blue-100' :
                      log.category === 'E_WASTE' ? 'bg-yellow-100' :
                      log.category === 'HAZARDOUS' ? 'bg-red-100' :
                      'bg-purple-100'
                    }`}>
                      <Trash2 className={`w-5 h-5 ${
                        log.category === 'WET' ? 'text-green-600' :
                        log.category === 'DRY' ? 'text-blue-600' :
                        log.category === 'E_WASTE' ? 'text-yellow-600' :
                        log.category === 'HAZARDOUS' ? 'text-red-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        <span className="text-green-600">{log.userName}</span> logged {log.quantity}x{' '}
                        <span className="font-semibold">{log.wasteItemName}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.area} • +{log.points} points • {formatTimeAgo(log.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        log.category === 'WET' ? 'bg-green-100 text-green-800' :
                        log.category === 'DRY' ? 'bg-blue-100 text-blue-800' :
                        log.category === 'E_WASTE' ? 'bg-yellow-100 text-yellow-800' :
                        log.category === 'HAZARDOUS' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {log.category.replace('_', '-')}
                      </span>
                    </div>
                  </div>
                ))}
                {wasteFeed.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Login prompt for non-authenticated users */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Unlock Full Dashboard Features
          </h3>
          <p className="text-blue-600 mb-4">
            Log in to access admin dashboard, bin status monitoring, and live activity feeds.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
