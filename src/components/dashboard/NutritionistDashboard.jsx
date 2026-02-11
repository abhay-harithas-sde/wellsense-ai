import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Target, 
  Activity,
  Bell,
  Search,
  Filter,
  Download,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Apple,
  Scale,
  Heart
} from 'lucide-react';
import ClientOverview from './ClientOverview';
import ClientDetails from './ClientDetails';
import NutritionAnalytics from './NutritionAnalytics';
import AppointmentScheduler from './AppointmentScheduler';

const NutritionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockClients = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          age: 28,
          status: 'active',
          lastCheckIn: '2024-01-10',
          currentWeight: 68.5,
          targetWeight: 65,
          progress: 75,
          riskLevel: 'low',
          nextAppointment: '2024-01-15',
          goals: ['weight_loss', 'muscle_gain'],
          avatar: '/api/placeholder/40/40'
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael@example.com',
          age: 35,
          status: 'needs_attention',
          lastCheckIn: '2024-01-05',
          currentWeight: 82.3,
          targetWeight: 78,
          progress: 45,
          riskLevel: 'medium',
          nextAppointment: '2024-01-12',
          goals: ['weight_loss', 'diabetes_management'],
          avatar: '/api/placeholder/40/40'
        },
        {
          id: '3',
          name: 'Emma Davis',
          email: 'emma@example.com',
          age: 42,
          status: 'on_track',
          lastCheckIn: '2024-01-09',
          currentWeight: 59.2,
          targetWeight: 60,
          progress: 90,
          riskLevel: 'low',
          nextAppointment: '2024-01-18',
          goals: ['muscle_gain', 'energy_boost'],
          avatar: '/api/placeholder/40/40'
        }
      ];
      
      setClients(mockClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const dashboardStats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    needsAttention: clients.filter(c => c.status === 'needs_attention').length,
    onTrack: clients.filter(c => c.status === 'on_track').length,
    avgProgress: Math.round(clients.reduce((sum, c) => sum + c.progress, 0) / clients.length)
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'on_track': return 'text-green-600 bg-green-100';
      case 'needs_attention': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nutritionist Dashboard</h1>
              <p className="text-gray-600">Manage your clients and track their progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalClients}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">On Track</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.onTrack}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Needs Attention</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.needsAttention}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.avgProgress}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeClients}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Client Overview', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'appointments', label: 'Appointments', icon: Calendar },
                { id: 'messages', label: 'Messages', icon: MessageCircle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="on_track">On Track</option>
                      <option value="needs_attention">Needs Attention</option>
                    </select>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Client List */}
                <div className="space-y-4">
                  {filteredClients.map((client, index) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={client.avatar}
                            alt={client.name}
                            className="h-12 w-12 rounded-full bg-gray-300"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                            <p className="text-gray-600">{client.email}</p>
                            <div className="flex items-center mt-1 space-x-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                                {client.status.replace('_', ' ')}
                              </span>
                              <span className={`text-sm font-medium ${getRiskColor(client.riskLevel)}`}>
                                {client.riskLevel} risk
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-8">
                          <div className="text-center">
                            <div className="flex items-center text-gray-600">
                              <Scale className="h-4 w-4 mr-1" />
                              <span className="text-sm">Weight</span>
                            </div>
                            <p className="text-lg font-semibold">{client.currentWeight}kg</p>
                            <p className="text-sm text-gray-500">Target: {client.targetWeight}kg</p>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center text-gray-600">
                              <Target className="h-4 w-4 mr-1" />
                              <span className="text-sm">Progress</span>
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${client.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-sm font-semibold mt-1">{client.progress}%</p>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="text-sm">Next Visit</span>
                            </div>
                            <p className="text-sm font-semibold">{client.nextAppointment}</p>
                            <p className="text-xs text-gray-500">Last: {client.lastCheckIn}</p>
                          </div>

                          <div className="flex space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                              <Activity className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Goals */}
                      <div className="mt-4 flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Goals:</span>
                        {client.goals.map(goal => (
                          <span
                            key={goal}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {goal.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <NutritionAnalytics clients={clients} />
            )}

            {activeTab === 'appointments' && (
              <AppointmentScheduler clients={clients} />
            )}

            {activeTab === 'messages' && (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Messages</h3>
                <p className="text-gray-600">Client messaging system coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client Details Modal */}
      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

export default NutritionistDashboard;