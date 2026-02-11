import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

const NutritionAnalytics = ({ clients }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('weight_loss');
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    generateAnalyticsData();
  }, [clients, timeRange]);

  const generateAnalyticsData = () => {
    // Mock analytics data - replace with actual API calls
    const mockData = {
      overview: {
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === 'active').length,
        avgWeightLoss: 2.3,
        successRate: 78,
        avgProgress: Math.round(clients.reduce((sum, c) => sum + c.progress, 0) / clients.length)
      },
      weightTrends: [
        { week: 'Week 1', avgLoss: 0.8, clients: 12 },
        { week: 'Week 2', avgLoss: 1.2, clients: 15 },
        { week: 'Week 3', avgLoss: 1.8, clients: 18 },
        { week: 'Week 4', avgLoss: 2.1, clients: 20 },
        { week: 'Week 5', avgLoss: 2.5, clients: 22 },
        { week: 'Week 6', avgLoss: 2.8, clients: 25 }
      ],
      goalDistribution: [
        { name: 'Weight Loss', value: 45, color: '#3B82F6' },
        { name: 'Muscle Gain', value: 25, color: '#10B981' },
        { name: 'Maintenance', value: 20, color: '#F59E0B' },
        { name: 'Health Improvement', value: 10, color: '#8B5CF6' }
      ],
      nutritionCompliance: [
        { date: '2024-01-01', compliance: 85, calories: 1850 },
        { date: '2024-01-02', compliance: 92, calories: 1780 },
        { date: '2024-01-03', compliance: 78, calories: 1920 },
        { date: '2024-01-04', compliance: 88, calories: 1800 },
        { date: '2024-01-05', compliance: 95, calories: 1750 },
        { date: '2024-01-06', compliance: 82, calories: 1880 },
        { date: '2024-01-07', compliance: 90, calories: 1820 }
      ],
      clientProgress: clients.map(client => ({
        name: client.name,
        progress: client.progress,
        weightLoss: Math.random() * 5 + 0.5,
        compliance: Math.random() * 20 + 80
      })),
      riskAnalysis: [
        { category: 'Low Risk', count: clients.filter(c => c.riskLevel === 'low').length, color: '#10B981' },
        { category: 'Medium Risk', count: clients.filter(c => c.riskLevel === 'medium').length, color: '#F59E0B' },
        { category: 'High Risk', count: clients.filter(c => c.riskLevel === 'high').length, color: '#EF4444' }
      ]
    };

    setAnalyticsData(mockData);
  };

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const metrics = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'progress', label: 'Goal Progress' },
    { value: 'risk', label: 'Risk Analysis' }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track client progress and nutrition trends</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>{metric.label}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview?.totalClients}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Weight Loss</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.overview?.avgWeightLoss}kg</p>
            </div>
            <TrendingDown className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600">{analyticsData.overview?.successRate}%</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-orange-600">{analyticsData.overview?.avgProgress}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.overview?.activeClients}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Loss Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Weight Loss Trends</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.weightTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="avgLoss"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Goal Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Goal Distribution</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={analyticsData.goalDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {analyticsData.goalDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {analyticsData.goalDistribution?.map((goal, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: goal.color }}
                ></div>
                <span className="text-sm text-gray-600">{goal.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Compliance and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nutrition Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <h3 className="text-lg font-semibold mb-6">Nutrition Compliance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.nutritionCompliance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="compliance"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Client Progress Ranking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <h3 className="text-lg font-semibold mb-6">Client Progress Ranking</h3>
          <div className="space-y-3">
            {analyticsData.clientProgress?.slice(0, 5).map((client, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="ml-3 font-medium">{client.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{client.progress}%</p>
                  <p className="text-xs text-gray-500">{client.weightLoss.toFixed(1)}kg lost</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white p-6 rounded-xl shadow-sm border"
      >
        <h3 className="text-lg font-semibold mb-6">Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analyticsData.riskAnalysis?.map((risk, index) => (
            <div key={index} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={risk.color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${(risk.count / clients.length) * 251.2} 251.2`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold" style={{ color: risk.color }}>
                    {risk.count}
                  </span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900">{risk.category}</h4>
              <p className="text-sm text-gray-600">
                {Math.round((risk.count / clients.length) * 100)}% of clients
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Detailed Metrics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-xl shadow-sm border overflow-hidden"
      >
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Detailed Client Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Check-in
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client, index) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={client.avatar}
                        alt={client.name}
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <span className="font-medium text-gray-900">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${client.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{client.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(Math.random() * 5 + 0.5).toFixed(1)}kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.round(Math.random() * 20 + 80)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      client.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                      client.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {client.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.lastCheckIn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default NutritionAnalytics;