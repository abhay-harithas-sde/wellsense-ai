import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Heart, 
  Activity,
  Award,
  MessageCircle,
  Share2,
  Target,
  Calendar,
  Zap,
  Crown,
  Trophy,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import aiHealthEngine from '../services/aiHealthEngine';

const CommunityHealth = () => {
  const { user } = useAuth();
  const [communityData, setCommunityData] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Demo community data
  const demoData = {
    totalMembers: 12847,
    activeToday: 3421,
    challengesActive: 15,
    totalSteps: 45678923,
    avgHealthScore: 78.5,
    topPerformers: [
      { name: 'Sarah J.', score: 95, avatar: '👩‍💼', streak: 28 },
      { name: 'Mike C.', score: 92, avatar: '👨‍💻', streak: 21 },
      { name: 'Emma D.', score: 89, avatar: '👩‍⚕️', streak: 19 },
      { name: 'You', score: 85, avatar: '🧑‍💼', streak: 12 },
      { name: 'Alex R.', score: 83, avatar: '👨‍🎓', streak: 15 }
    ],
    challenges: [
      {
        id: 1,
        name: '10K Steps Challenge',
        participants: 2847,
        progress: 73,
        reward: '🏆 Fitness Champion Badge',
        endDate: '2024-03-15',
        category: 'fitness'
      },
      {
        id: 2,
        name: 'Hydration Heroes',
        participants: 1923,
        progress: 89,
        reward: '💧 Hydration Master Badge',
        endDate: '2024-03-10',
        category: 'wellness'
      },
      {
        id: 3,
        name: 'Mindful March',
        participants: 1456,
        progress: 45,
        reward: '🧘‍♀️ Zen Master Badge',
        endDate: '2024-03-31',
        category: 'mental_health'
      }
    ],
    healthTrends: [
      { week: 'Week 1', avgSteps: 8500, avgSleep: 7.2, avgMood: 7.5 },
      { week: 'Week 2', avgSteps: 9200, avgSleep: 7.5, avgMood: 7.8 },
      { week: 'Week 3', avgSteps: 9800, avgSleep: 7.8, avgMood: 8.1 },
      { week: 'Week 4', avgSteps: 10200, avgSleep: 8.0, avgMood: 8.3 }
    ]
  };

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading community data
      setCommunityData(demoData);
      setActiveChallenge(demoData.challenges[0]);
      
      // Generate health alerts
      setHealthAlerts([
        {
          type: 'community_milestone',
          message: 'Community reached 50M total steps this month! 🎉',
          priority: 'info',
          timestamp: new Date()
        },
        {
          type: 'personal_achievement',
          message: 'You\'re in the top 15% of active users this week!',
          priority: 'success',
          timestamp: new Date()
        },
        {
          type: 'challenge_reminder',
          message: 'Hydration Heroes challenge ends in 2 days',
          priority: 'warning',
          timestamp: new Date()
        }
      ]);
      
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = (challengeId) => {
    // Simulate joining a challenge
    alert(`Joined challenge! You'll receive daily reminders and progress updates.`);
  };

  const shareAchievement = (achievement) => {
    // Simulate sharing achievement
    alert(`Achievement shared with the community! 🎉`);
  };

  // Chart colors
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Health score distribution
  const healthScoreDistribution = [
    { range: '90-100', count: 1284, color: '#10B981' },
    { range: '80-89', count: 3421, color: '#3B82F6' },
    { range: '70-79', count: 4567, color: '#F59E0B' },
    { range: '60-69', count: 2341, color: '#EF4444' },
    { range: '50-59', count: 1234, color: '#8B5CF6' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center space-x-3 mb-2">
          <Users className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Community Health Hub</h1>
        </div>
        <p className="text-blue-100">Connect, compete, and achieve health goals together</p>
      </motion.div>

      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Community Updates</h3>
          </div>
          <div className="space-y-2">
            {healthAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg flex items-center space-x-3 ${
                alert.priority === 'success' ? 'bg-green-50 border border-green-200' :
                alert.priority === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                {alert.priority === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {alert.priority === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                {alert.priority === 'info' && <Zap className="w-4 h-4 text-blue-600" />}
                <span className={`text-sm ${
                  alert.priority === 'success' ? 'text-green-800' :
                  alert.priority === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {alert.message}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{communityData.totalMembers.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-green-600">+234 this week</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Today</p>
              <p className="text-2xl font-bold text-gray-900">{communityData.activeToday.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-green-600">27% of members</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Challenges</p>
              <p className="text-2xl font-bold text-gray-900">{communityData.challengesActive}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600">Join now!</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Health Score</p>
              <p className="text-2xl font-bold text-gray-900">{communityData.avgHealthScore}</p>
            </div>
          </div>
          <div className="text-sm text-green-600">+2.3 this month</div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex space-x-8 px-6 py-4 border-b border-gray-100">
          {[
            { id: 'overview', label: 'Community Overview', icon: TrendingUp },
            { id: 'challenges', label: 'Health Challenges', icon: Trophy },
            { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
            { id: 'monitoring', label: 'Health Monitoring', icon: Heart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Community Health Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Health Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={communityData.healthTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgSteps" stroke="#3B82F6" strokeWidth={3} name="Avg Steps" />
                      <Line type="monotone" dataKey="avgSleep" stroke="#10B981" strokeWidth={3} name="Avg Sleep (hrs)" />
                      <Line type="monotone" dataKey="avgMood" stroke="#F59E0B" strokeWidth={3} name="Avg Mood" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Score Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={healthScoreDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ range, count }) => `${range}: ${count}`}
                      >
                        {healthScoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Community Achievements */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Achievements This Month</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏃‍♂️</div>
                    <div className="text-2xl font-bold text-gray-900">50M+</div>
                    <div className="text-sm text-gray-600">Total Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">💧</div>
                    <div className="text-2xl font-bold text-gray-900">2.3M</div>
                    <div className="text-sm text-gray-600">Liters of Water</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🧘‍♀️</div>
                    <div className="text-2xl font-bold text-gray-900">15K</div>
                    <div className="text-sm text-gray-600">Meditation Minutes</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'challenges' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Active Health Challenges</h3>
                <button 
                  onClick={() => alert('Create Challenge feature coming soon! You can design custom health challenges for the community.')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Challenge
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityData.challenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">
                        {challenge.category === 'fitness' ? '🏃‍♂️' : 
                         challenge.category === 'wellness' ? '💧' : '🧘‍♀️'}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{challenge.name}</h4>
                      <p className="text-sm text-gray-600">{challenge.participants.toLocaleString()} participants</p>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${challenge.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-1">Reward</p>
                      <p className="text-sm font-medium text-blue-600">{challenge.reward}</p>
                    </div>

                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600">Ends: {challenge.endDate}</p>
                    </div>

                    <button
                      onClick={() => joinChallenge(challenge.id)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Join Challenge
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white text-center">
                <Crown className="w-12 h-12 mx-auto mb-2" />
                <h2 className="text-2xl font-bold mb-1">Community Leaderboard</h2>
                <p className="text-yellow-100">Top health champions this month</p>
              </div>

              <div className="space-y-3">
                {communityData.topPerformers.map((performer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-4 p-4 rounded-lg ${
                      performer.name === 'You' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                    </div>
                    <div className="text-2xl">{performer.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">#{index + 1}</span>
                        <span className={`font-medium ${performer.name === 'You' ? 'text-blue-700' : 'text-gray-700'}`}>
                          {performer.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Score: {performer.score}</span>
                        <span>🔥 {performer.streak} day streak</span>
                      </div>
                    </div>
                    {performer.name === 'You' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => shareAchievement(performer)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200"
                        >
                          <Share2 className="w-4 h-4 inline mr-1" />
                          Share
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'monitoring' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Continuous Health Monitoring</h3>

              {/* Real-time Health Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">72</div>
                  <div className="text-sm text-red-700">Avg Heart Rate</div>
                  <div className="text-xs text-red-600 mt-1">Community: 74 BPM</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">9,847</div>
                  <div className="text-sm text-blue-700">Daily Steps</div>
                  <div className="text-xs text-blue-600 mt-1">Community: 8,234</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">7.8h</div>
                  <div className="text-sm text-purple-700">Sleep Duration</div>
                  <div className="text-xs text-purple-600 mt-1">Community: 7.2h</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-green-700">Health Score</div>
                  <div className="text-xs text-green-600 mt-1">Community: 78%</div>
                </div>
              </div>

              {/* AI Health Insights */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                  <h4 className="text-lg font-semibold text-purple-900">AI Community Insights</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-800">
                      <strong>Trend Alert:</strong> Community sleep quality improved 15% this month. Your 7.8h average is above community standard!
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-800">
                      <strong>Peer Comparison:</strong> You're in the top 25% for consistency. Keep up the great work!
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-800">
                      <strong>Challenge Opportunity:</strong> Join the "Mindful March" challenge - 89% of participants report reduced stress.
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-800">
                      <strong>Health Tip:</strong> Community members who exercise between 2-4 PM show 23% better performance metrics.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHealth;