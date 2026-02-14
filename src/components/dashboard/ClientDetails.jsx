import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Calendar,
  Target,
  TrendingUp,
  Activity,
  Apple,
  Scale,
  Heart,
  Brain,
  Clock,
  MessageCircle,
  FileText,
  Download,
  Edit,
  Plus,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ClientDetails = ({ client, onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [healthData, setHealthData] = useState({});
  const [nutritionData, setNutritionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [client.id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockHealthData = {
        weightHistory: [
          { date: '2024-01-01', weight: 70.2, bodyFat: 22.5 },
          { date: '2024-01-03', weight: 69.8, bodyFat: 22.3 },
          { date: '2024-01-05', weight: 69.5, bodyFat: 22.1 },
          { date: '2024-01-07', weight: 69.1, bodyFat: 21.9 },
          { date: '2024-01-09', weight: 68.8, bodyFat: 21.7 },
          { date: '2024-01-10', weight: 68.5, bodyFat: 21.5 }
        ],
        vitals: {
          bloodPressure: '120/80',
          heartRate: 72,
          bloodSugar: 95,
          cholesterol: 180
        },
        recentMeals: [
          {
            date: '2024-01-10',
            meal: 'Breakfast',
            foods: ['Oatmeal with berries', 'Greek yogurt', 'Green tea'],
            calories: 350,
            protein: 15,
            carbs: 45,
            fat: 8
          },
          {
            date: '2024-01-10',
            meal: 'Lunch',
            foods: ['Grilled chicken salad', 'Quinoa', 'Avocado'],
            calories: 520,
            protein: 35,
            carbs: 30,
            fat: 22
          },
          {
            date: '2024-01-10',
            meal: 'Dinner',
            foods: ['Salmon', 'Steamed broccoli', 'Sweet potato'],
            calories: 480,
            protein: 32,
            carbs: 35,
            fat: 18
          }
        ]
      };

      const mockNutritionData = [
        { date: '2024-01-01', calories: 1850, protein: 95, carbs: 180, fat: 65 },
        { date: '2024-01-02', calories: 1920, protein: 88, carbs: 195, fat: 70 },
        { date: '2024-01-03', calories: 1780, protein: 92, carbs: 165, fat: 62 },
        { date: '2024-01-04', calories: 1890, protein: 96, carbs: 175, fat: 68 },
        { date: '2024-01-05', calories: 1820, protein: 90, carbs: 170, fat: 64 },
        { date: '2024-01-06', calories: 1950, protein: 98, carbs: 185, fat: 72 },
        { date: '2024-01-07', calories: 1800, protein: 85, carbs: 160, fat: 66 }
      ];

      setHealthData(mockHealthData);
      setNutritionData(mockNutritionData);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Open messaging interface for client
    alert('Messaging feature coming soon!');
  };

  const handleEditClient = () => {
    // Open edit client dialog
    alert('Edit client feature coming soon!');
  };

  const macroDistribution = nutritionData.length > 0 ? [
    { name: 'Protein', value: nutritionData[nutritionData.length - 1].protein, color: '#3B82F6' },
    { name: 'Carbs', value: nutritionData[nutritionData.length - 1].carbs, color: '#10B981' },
    { name: 'Fat', value: nutritionData[nutritionData.length - 1].fat, color: '#F59E0B' }
  ] : [];

  const sections = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'vitals', label: 'Vitals', icon: Heart },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="h-16 w-16 rounded-full border-4 border-white/20"
                />
                <div>
                  <h2 className="text-2xl font-bold">{client.name}</h2>
                  <p className="text-blue-100">{client.email}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      Age: {client.age}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {client.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSendMessage}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleEditClient}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r overflow-y-auto">
              <nav className="p-4 space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <section.icon className="h-5 w-5 mr-3" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {activeSection === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Current Stats */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 font-medium">Current Weight</p>
                            <p className="text-3xl font-bold text-blue-900">{client.currentWeight}kg</p>
                            <p className="text-sm text-blue-600">Target: {client.targetWeight}kg</p>
                          </div>
                          <Scale className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 font-medium">Progress</p>
                            <p className="text-3xl font-bold text-green-900">{client.progress}%</p>
                            <p className="text-sm text-green-600">On track</p>
                          </div>
                          <Target className="h-8 w-8 text-green-600" />
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 font-medium">Days Active</p>
                            <p className="text-3xl font-bold text-purple-900">28</p>
                            <p className="text-sm text-purple-600">This month</p>
                          </div>
                          <Activity className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>
                    </div>

                    {/* Goals */}
                    <div className="bg-white border rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Current Goals</h3>
                      <div className="space-y-3">
                        {client.goals.map((goal, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <Target className="h-5 w-5 text-blue-600 mr-3" />
                              <span className="font-medium">{goal.replace('_', ' ')}</span>
                            </div>
                            <span className="text-green-600 font-medium">Active</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white border rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <div className="p-2 bg-green-100 rounded-full mr-3">
                            <Apple className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Logged breakfast</p>
                            <p className="text-sm text-gray-600">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-full mr-3">
                            <Scale className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Weight check-in</p>
                            <p className="text-sm text-gray-600">Yesterday</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'nutrition' && (
                  <div className="space-y-6">
                    {/* Daily Nutrition Chart */}
                    <div className="bg-white border rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Daily Nutrition Intake</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={nutritionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="calories" stroke="#3B82F6" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Macro Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Macro Distribution</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={macroDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                dataKey="value"
                              >
                                {macroDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center space-x-4 mt-4">
                          {macroDistribution.map((macro, index) => (
                            <div key={index} className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: macro.color }}
                              ></div>
                              <span className="text-sm">{macro.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Meals</h3>
                        <div className="space-y-3">
                          {healthData.recentMeals?.map((meal, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{meal.meal}</h4>
                                <span className="text-sm text-gray-600">{meal.calories} cal</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {meal.foods.join(', ')}
                              </p>
                              <div className="flex space-x-4 text-xs text-gray-500">
                                <span>P: {meal.protein}g</span>
                                <span>C: {meal.carbs}g</span>
                                <span>F: {meal.fat}g</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'progress' && (
                  <div className="space-y-6">
                    {/* Weight Progress */}
                    <div className="bg-white border rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Weight Progress</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={healthData.weightHistory}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} />
                            <Line type="monotone" dataKey="bodyFat" stroke="#10B981" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Progress Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white border rounded-xl p-6 text-center">
                        <h4 className="font-medium text-gray-600 mb-2">Weight Lost</h4>
                        <p className="text-3xl font-bold text-green-600">1.7kg</p>
                        <p className="text-sm text-gray-500">Last 10 days</p>
                      </div>
                      <div className="bg-white border rounded-xl p-6 text-center">
                        <h4 className="font-medium text-gray-600 mb-2">Body Fat</h4>
                        <p className="text-3xl font-bold text-blue-600">-1.0%</p>
                        <p className="text-sm text-gray-500">Reduction</p>
                      </div>
                      <div className="bg-white border rounded-xl p-6 text-center">
                        <h4 className="font-medium text-gray-600 mb-2">Goal ETA</h4>
                        <p className="text-3xl font-bold text-purple-600">6 weeks</p>
                        <p className="text-sm text-gray-500">At current rate</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'vitals' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Current Vitals</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center">
                              <Heart className="h-5 w-5 text-red-600 mr-3" />
                              <span>Blood Pressure</span>
                            </div>
                            <span className="font-semibold">{healthData.vitals?.bloodPressure}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                              <Activity className="h-5 w-5 text-blue-600 mr-3" />
                              <span>Heart Rate</span>
                            </div>
                            <span className="font-semibold">{healthData.vitals?.heartRate} bpm</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center">
                              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                              <span>Blood Sugar</span>
                            </div>
                            <span className="font-semibold">{healthData.vitals?.bloodSugar} mg/dL</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center">
                              <Heart className="h-5 w-5 text-green-600 mr-3" />
                              <span>Cholesterol</span>
                            </div>
                            <span className="font-semibold">{healthData.vitals?.cholesterol} mg/dL</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Health Alerts</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="p-1 bg-green-100 rounded-full mr-3">
                                <Heart className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-green-800">Blood pressure normal</p>
                                <p className="text-sm text-green-600">Within healthy range</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="p-1 bg-yellow-100 rounded-full mr-3">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div>
                                <p className="font-medium text-yellow-800">Monitor cholesterol</p>
                                <p className="text-sm text-yellow-600">Slightly elevated levels</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'notes' && (
                  <div className="space-y-6">
                    <div className="bg-white border rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Session Notes</h3>
                        <button 
                          onClick={() => alert('Add Note: Create a new session note for this client.')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Note
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Initial Consultation</h4>
                            <span className="text-sm text-gray-500">Jan 5, 2024</span>
                          </div>
                          <p className="text-gray-700 mb-2">
                            Client is motivated to lose weight for health reasons. Has previous experience with dieting but struggles with consistency. Recommended starting with portion control and gradual exercise increase.
                          </p>
                          <div className="flex space-x-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Weight Loss</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Motivation High</span>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Follow-up Session</h4>
                            <span className="text-sm text-gray-500">Jan 8, 2024</span>
                          </div>
                          <p className="text-gray-700 mb-2">
                            Good progress on meal planning. Client reports feeling more energetic. Discussed increasing protein intake and adding strength training twice per week.
                          </p>
                          <div className="flex space-x-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Progress Good</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Exercise Plan</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClientDetails;