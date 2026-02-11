import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar,
  Clock,
  Award,
  Lightbulb,
  Activity,
  Heart,
  Moon,
  Zap,
  CheckCircle,
  AlertCircle,
  Users,
  Plus,
  Droplets
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import aiHealthEngine from '../services/aiHealthEngine';
import BehaviorTracker from '../components/coaching/BehaviorTracker';
import axios from 'axios';

const AICoaching = () => {
  const { user } = useAuth();
  const [showTracker, setShowTracker] = useState(false);
  const [behaviorAnalysis, setBehaviorAnalysis] = useState(null);
  const [coachingPlan, setCoachingPlan] = useState(null);
  const [dailyHabits, setDailyHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analysis');

  // Demo behavior data
  const behaviorData = {
    meals: [
      { time: '08:00', type: 'breakfast', quality: 8 },
      { time: '13:00', type: 'lunch', quality: 7 },
      { time: '19:00', type: 'dinner', quality: 9 }
    ],
    workouts: [
      { date: '2024-03-01', duration: 45, intensity: 'moderate' },
      { date: '2024-03-02', duration: 30, intensity: 'high' },
      { date: '2024-03-04', duration: 60, intensity: 'low' }
    ],
    sleep: [
      { date: '2024-03-01', hours: 7.5, quality: 8 },
      { date: '2024-03-02', hours: 6.5, quality: 6 },
      { date: '2024-03-03', hours: 8.0, quality: 9 }
    ],
    stress: [
      { date: '2024-03-01', level: 3 },
      { date: '2024-03-02', level: 7 },
      { date: '2024-03-03', level: 4 }
    ],
    water: { daily: 2200, target: 2500 },
    screenTime: { daily: 6.5, target: 4.0 }
  };

  const healthGoals = ['weight_loss', 'better_sleep', 'stress_reduction'];

  useEffect(() => {
    loadCoachingData();
  }, []);

  const handleLogBehavior = async (behaviorData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/behavior/log', behaviorData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Reload coaching data
        await loadCoachingData();
        setShowTracker(false);
        alert('Behavior logged successfully!');
      }
    } catch (error) {
      console.error('Failed to log behavior:', error);
      throw error;
    }
  };

  const loadCoachingData = async () => {
    try {
      setLoading(true);
      
      // Generate behavior coaching
      const coaching = await aiHealthEngine.generateBehaviorCoaching(behaviorData, healthGoals);
      setCoachingPlan(coaching);
      
      // Set daily habits
      setDailyHabits([
        { id: 1, habit: 'Drink 8 glasses of water', completed: true, streak: 5 },
        { id: 2, habit: 'Exercise for 30 minutes', completed: false, streak: 3 },
        { id: 3, habit: 'Sleep 7+ hours', completed: true, streak: 7 },
        { id: 4, habit: 'Meditate for 10 minutes', completed: false, streak: 2 },
        { id: 5, habit: 'Eat 5 servings of fruits/vegetables', completed: true, streak: 4 }
      ]);
      
    } catch (error) {
      console.error('Failed to load coaching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = (habitId) => {
    setDailyHabits(habits => 
      habits.map(habit => 
        habit.id === habitId 
          ? { ...habit, completed: !habit.completed }
          : habit
      )
    );
  };

  // Behavior pattern data for radar chart
  const behaviorPatterns = [
    { subject: 'Exercise', current: 75, optimal: 90 },
    { subject: 'Nutrition', current: 85, optimal: 90 },
    { subject: 'Sleep', current: 70, optimal: 90 },
    { subject: 'Hydration', current: 88, optimal: 90 },
    { subject: 'Stress Management', current: 60, optimal: 90 },
    { subject: 'Consistency', current: 80, optimal: 90 }
  ];

  // Weekly progress data
  const weeklyProgress = [
    { day: 'Mon', habits: 4, mood: 7, energy: 6 },
    { day: 'Tue', habits: 5, mood: 8, energy: 7 },
    { day: 'Wed', habits: 3, mood: 6, energy: 5 },
    { day: 'Thu', habits: 5, mood: 8, energy: 8 },
    { day: 'Fri', habits: 4, mood: 7, energy: 7 },
    { day: 'Sat', habits: 5, mood: 9, energy: 8 },
    { day: 'Sun', habits: 4, mood: 8, energy: 7 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">AI is analyzing your behavior patterns...</p>
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
        className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-8 h-8" />
          <h1 className="text-2xl font-bold">AI Behavior Coach</h1>
        </div>
        <p className="text-purple-100">Intelligent lifestyle coaching for sustainable health habits</p>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex space-x-8 px-6 py-4 border-b border-gray-100">
          {[
            { id: 'analysis', label: 'Behavior Analysis', icon: TrendingUp },
            { id: 'habits', label: 'Daily Habits', icon: CheckCircle },
            { id: 'coaching', label: 'AI Coaching', icon: Brain },
            { id: 'progress', label: 'Progress Tracking', icon: Award }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'analysis' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Behavior Patterns Radar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavior Pattern Analysis</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={behaviorPatterns}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Current"
                        dataKey="current"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Optimal"
                        dataKey="optimal"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.1}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Strengths</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Excellent hydration consistency (88%)</li>
                      <li>• Strong nutrition adherence (85%)</li>
                      <li>• Good overall habit consistency (80%)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Areas for Improvement</span>
                    </div>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Stress management needs attention (60%)</li>
                      <li>• Sleep quality could be optimized (70%)</li>
                      <li>• Exercise consistency has room for growth (75%)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">AI Recommendations</span>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Add 10-minute morning meditation</li>
                      <li>• Establish consistent bedtime routine</li>
                      <li>• Schedule workouts at optimal energy times</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Weekly Trends */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Behavior Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="habits" stroke="#8B5CF6" strokeWidth={3} name="Habits Completed" />
                    <Line type="monotone" dataKey="mood" stroke="#10B981" strokeWidth={3} name="Mood Score" />
                    <Line type="monotone" dataKey="energy" stroke="#F59E0B" strokeWidth={3} name="Energy Level" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {activeTab === 'habits' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Today's Habits</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowTracker(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Track Behavior</span>
                  </button>
                  <div className="text-sm text-gray-600">
                    {dailyHabits.filter(h => h.completed).length} of {dailyHabits.length} completed
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyHabits.map((habit) => (
                  <motion.div
                    key={habit.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      habit.completed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-purple-200'
                    }`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        habit.completed 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {habit.completed && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${habit.completed ? 'text-green-800' : 'text-gray-900'}`}>
                          {habit.habit}
                        </p>
                        <p className="text-sm text-gray-600">
                          🔥 {habit.streak} day streak
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Habit Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round((dailyHabits.filter(h => h.completed).length / dailyHabits.length) * 100)}%
                  </div>
                  <div className="text-sm text-purple-700">Today's Completion</div>
                </div>
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.max(...dailyHabits.map(h => h.streak))}
                  </div>
                  <div className="text-sm text-green-700">Longest Streak</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round(dailyHabits.reduce((sum, h) => sum + h.streak, 0) / dailyHabits.length)}
                  </div>
                  <div className="text-sm text-blue-700">Average Streak</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'coaching' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Personalized AI Coaching</h3>

              {/* AI Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coachingPlan?.personalizedTips?.map((tip, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    tip.priority === 'high' ? 'border-red-500 bg-red-50' :
                    tip.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className={`w-5 h-5 ${
                        tip.priority === 'high' ? 'text-red-600' :
                        tip.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <span className={`font-medium text-sm uppercase tracking-wide ${
                        tip.priority === 'high' ? 'text-red-700' :
                        tip.priority === 'medium' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        {tip.priority} Priority
                      </span>
                    </div>
                    <p className={`font-medium mb-2 ${
                      tip.priority === 'high' ? 'text-red-800' :
                      tip.priority === 'medium' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {tip.tip}
                    </p>
                    <p className={`text-sm ${
                      tip.priority === 'high' ? 'text-red-700' :
                      tip.priority === 'medium' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      <strong>AI Reasoning:</strong> {tip.aiReasoning}
                    </p>
                  </div>
                ))}
              </div>

              {/* Motivational Content */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                  <h4 className="text-lg font-semibold text-purple-900">Daily Motivation</h4>
                </div>
                <p className="text-purple-800 mb-4">
                  "Your consistency has improved 23% this week - keep up the momentum! Small daily improvements lead to remarkable long-term results."
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-purple-700">Health Score: +5 points</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-purple-700">Streak Bonus: 2x points</span>
                  </div>
                </div>
              </div>

              {/* Action Plan */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">This Week's Action Plan</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Establish Morning Routine</p>
                      <p className="text-sm text-gray-600">Wake up 15 minutes earlier for meditation</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Optimize Sleep Environment</p>
                      <p className="text-sm text-gray-600">Keep bedroom temperature at 65-68°F</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Schedule Exercise</p>
                      <p className="text-sm text-gray-600">Block 2-4 PM for optimal workout performance</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>

              {/* Achievement Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Consistency Master</h4>
                  <p className="text-sm text-gray-600">7-day habit streak</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Hydration Hero</h4>
                  <p className="text-sm text-gray-600">Perfect water intake</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Fitness Enthusiast</h4>
                  <p className="text-sm text-gray-600">5 workouts this week</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Moon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Sleep Champion</h4>
                  <p className="text-sm text-gray-600">Optimal sleep schedule</p>
                </div>
              </div>

              {/* Progress Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Overall Progress</h4>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">+23%</div>
                  <p className="text-sm text-gray-600">Improvement this month</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Goals Achieved</h4>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">8/10</div>
                  <p className="text-sm text-gray-600">This month's targets</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-blue-500 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Community Rank</h4>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">#12</div>
                  <p className="text-sm text-gray-600">Out of 1,247 users</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className="bg-purple-500 h-2 rounded-full w-5/6"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Behavior Tracker Modal */}
      {showTracker && (
        <BehaviorTracker
          onLogBehavior={handleLogBehavior}
          onClose={() => setShowTracker(false)}
        />
      )}
    </div>
  );
};

export default AICoaching;