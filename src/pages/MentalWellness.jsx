import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain,
  Heart,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  Calendar,
  BookOpen,
  Users,
  Phone,
  MessageCircle,
  Activity,
  Moon,
  Sun,
  Wind,
  Target,
  Award,
  Play,
  Clock,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Zap,
  Star,
  Shield,
  Headphones,
  Coffee
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const MentalWellness = () => {
  const [currentMood, setCurrentMood] = useState('good');
  const [stressLevel, setStressLevel] = useState(3);
  const [anxietyLevel, setAnxietyLevel] = useState(2);
  const [energyLevel, setEnergyLevel] = useState(4);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const moodOptions = [
    { id: 'excellent', label: 'Excellent', icon: Smile, color: 'text-green-500', bg: 'bg-green-100', emoji: '😊' },
    { id: 'good', label: 'Good', icon: Smile, color: 'text-blue-500', bg: 'bg-blue-100', emoji: '🙂' },
    { id: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-100', emoji: '😐' },
    { id: 'poor', label: 'Poor', icon: Frown, color: 'text-orange-500', bg: 'bg-orange-100', emoji: '😔' },
    { id: 'terrible', label: 'Terrible', icon: Frown, color: 'text-red-500', bg: 'bg-red-100', emoji: '😢' }
  ];

  const weeklyMoodData = [
    { day: 'Mon', mood: 4, stress: 2, anxiety: 1, energy: 4, sleep: 7 },
    { day: 'Tue', mood: 5, stress: 1, anxiety: 1, energy: 5, sleep: 8 },
    { day: 'Wed', mood: 3, stress: 4, anxiety: 3, energy: 3, sleep: 6 },
    { day: 'Thu', mood: 4, stress: 2, anxiety: 2, energy: 4, sleep: 7 },
    { day: 'Fri', mood: 5, stress: 1, anxiety: 1, energy: 5, sleep: 8 },
    { day: 'Sat', mood: 4, stress: 2, anxiety: 2, energy: 4, sleep: 9 },
    { day: 'Sun', mood: 4, stress: 3, anxiety: 2, energy: 3, sleep: 8 }
  ];

  const wellnessActivities = [
    {
      id: 'meditation',
      title: 'Guided Meditation',
      description: 'Calm your mind with 10-minute sessions',
      duration: '10-30 min',
      icon: Brain,
      color: 'purple',
      benefits: ['Reduces stress', 'Improves focus', 'Better sleep'],
      difficulty: 'Beginner'
    },
    {
      id: 'breathing',
      title: 'Breathing Exercises',
      description: 'Simple techniques to reduce anxiety',
      duration: '5-15 min',
      icon: Wind,
      color: 'blue',
      benefits: ['Instant calm', 'Lower heart rate', 'Mental clarity'],
      difficulty: 'Beginner'
    },
    {
      id: 'journaling',
      title: 'Mood Journaling',
      description: 'Track thoughts and emotions',
      duration: '10-20 min',
      icon: BookOpen,
      color: 'green',
      benefits: ['Self-awareness', 'Emotional processing', 'Pattern recognition'],
      difficulty: 'Easy'
    },
    {
      id: 'music',
      title: 'Therapeutic Music',
      description: 'Curated playlists for mental wellness',
      duration: '15-60 min',
      icon: Headphones,
      color: 'pink',
      benefits: ['Mood boost', 'Stress relief', 'Emotional regulation'],
      difficulty: 'Easy'
    },
    {
      id: 'exercise',
      title: 'Mindful Movement',
      description: 'Gentle exercises for mental health',
      duration: '20-45 min',
      icon: Activity,
      color: 'orange',
      benefits: ['Endorphin release', 'Better mood', 'Increased energy'],
      difficulty: 'Moderate'
    },
    {
      id: 'sleep',
      title: 'Sleep Optimization',
      description: 'Improve sleep quality and duration',
      duration: '7-9 hours',
      icon: Moon,
      color: 'indigo',
      benefits: ['Better mood', 'Reduced anxiety', 'Mental clarity'],
      difficulty: 'Easy'
    }
  ];

  const mentalHealthResources = [
    {
      title: 'Crisis Hotline',
      description: '24/7 mental health support',
      contact: '988',
      icon: Phone,
      urgent: true
    },
    {
      title: 'Online Therapy',
      description: 'Connect with licensed therapists',
      contact: 'Book Session',
      icon: MessageCircle,
      urgent: false
    },
    {
      title: 'Support Groups',
      description: 'Join community discussions',
      contact: 'Find Groups',
      icon: Users,
      urgent: false
    }
  ];

  const radarData = [
    { subject: 'Mood', A: currentMood === 'excellent' ? 5 : currentMood === 'good' ? 4 : 3, fullMark: 5 },
    { subject: 'Energy', A: energyLevel, fullMark: 5 },
    { subject: 'Sleep', A: 4, fullMark: 5 },
    { subject: 'Stress', A: 5 - stressLevel, fullMark: 5 },
    { subject: 'Anxiety', A: 5 - anxietyLevel, fullMark: 5 },
    { subject: 'Focus', A: 4, fullMark: 5 }
  ];

  const handleMoodSelection = (moodId) => {
    setCurrentMood(moodId);
    setShowMoodTracker(false);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-3xl p-8 text-white overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4 mb-4"
              >
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Mental Wellness Hub</h1>
                  <p className="text-purple-100 text-lg">Your journey to better mental health starts here</p>
                </div>
              </motion.div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl"
            >
              🧠
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-pink-300" />
              <p className="text-sm font-semibold">Wellness Score</p>
              <p className="text-2xl font-bold">87%</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-green-300" />
              <p className="text-sm font-semibold">Daily Goals</p>
              <p className="text-2xl font-bold">3/4</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <Award className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <p className="text-sm font-semibold">Streak</p>
              <p className="text-2xl font-bold">12 days</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-blue-300" />
              <p className="text-sm font-semibold">Mindful Min</p>
              <p className="text-2xl font-bold">45</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Mood Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
              <Smile className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">How are you feeling today?</h3>
          </div>
          <motion.button
            onClick={() => setShowMoodTracker(!showMoodTracker)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Track Mood
          </motion.button>
        </div>

        <AnimatePresence>
          {showMoodTracker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="grid grid-cols-5 gap-4">
                {moodOptions.map((mood, index) => (
                  <motion.button
                    key={mood.id}
                    onClick={() => handleMoodSelection(mood.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                      currentMood === mood.id 
                        ? `${mood.bg} border-current ${mood.color}` 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{mood.emoji}</div>
                      <p className="text-sm font-semibold text-gray-700">{mood.label}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Mood Display */}
        {currentMood && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
          >
            <div className="flex items-center space-x-4">
              <div className="text-4xl">
                {moodOptions.find(m => m.id === currentMood)?.emoji}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  You're feeling {moodOptions.find(m => m.id === currentMood)?.label.toLowerCase()} today
                </p>
                <p className="text-sm text-gray-600">
                  {currentMood === 'excellent' ? 'Keep up the great energy!' :
                   currentMood === 'good' ? 'You\'re doing well today!' :
                   currentMood === 'okay' ? 'It\'s okay to have average days.' :
                   currentMood === 'poor' ? 'Consider some self-care activities.' :
                   'Remember, it\'s okay to not be okay. Reach out for support.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Mental Health Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wellness Radar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Wellness Overview</h3>
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-blue-500"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 5]} />
                <Radar
                  name="Wellness"
                  dataKey="A"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Mood Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Weekly Trends</h3>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-green-500"
            >
              <Heart className="w-5 h-5" />
            </motion.div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyMoodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="energy" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Wellness Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Recommended Activities</h3>
          </div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="text-purple-500"
          >
            <Zap className="w-5 h-5" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wellnessActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`group bg-gradient-to-br ${
                activity.color === 'purple' ? 'from-purple-50 to-indigo-50 border-purple-200' :
                activity.color === 'blue' ? 'from-blue-50 to-cyan-50 border-blue-200' :
                activity.color === 'green' ? 'from-green-50 to-emerald-50 border-green-200' :
                activity.color === 'pink' ? 'from-pink-50 to-rose-50 border-pink-200' :
                activity.color === 'orange' ? 'from-orange-50 to-yellow-50 border-orange-200' :
                'from-indigo-50 to-purple-50 border-indigo-200'
              } rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 cursor-pointer`}
              onClick={() => setSelectedActivity(activity)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${
                  activity.color === 'purple' ? 'bg-purple-100' :
                  activity.color === 'blue' ? 'bg-blue-100' :
                  activity.color === 'green' ? 'bg-green-100' :
                  activity.color === 'pink' ? 'bg-pink-100' :
                  activity.color === 'orange' ? 'bg-orange-100' :
                  'bg-indigo-100'
                }`}>
                  <activity.icon className={`w-6 h-6 ${
                    activity.color === 'purple' ? 'text-purple-600' :
                    activity.color === 'blue' ? 'text-blue-600' :
                    activity.color === 'green' ? 'text-green-600' :
                    activity.color === 'pink' ? 'text-pink-600' :
                    activity.color === 'orange' ? 'text-orange-600' :
                    'text-indigo-600'
                  }`} />
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{activity.duration}</span>
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-2">{activity.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{activity.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                  activity.difficulty === 'Easy' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {activity.difficulty}
                </span>
                <motion.button
                  className={`p-2 rounded-lg ${
                    activity.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' :
                    activity.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                    activity.color === 'green' ? 'bg-green-500 hover:bg-green-600' :
                    activity.color === 'pink' ? 'bg-pink-500 hover:bg-pink-600' :
                    activity.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
                    'bg-indigo-500 hover:bg-indigo-600'
                  } text-white transition-colors`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mental Health Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Mental Health Resources</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentalHealthResources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                resource.urgent 
                  ? 'bg-red-50 border-red-200 hover:border-red-300' 
                  : 'bg-blue-50 border-blue-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  resource.urgent ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  <resource.icon className={`w-5 h-5 ${
                    resource.urgent ? 'text-red-600' : 'text-blue-600'
                  }`} />
                </div>
                {resource.urgent && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    URGENT
                  </span>
                )}
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
              
              <motion.button
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors ${
                  resource.urgent
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {resource.contact}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Meditation Center', icon: Brain, link: '/meditation-center', color: 'purple' },
            { label: 'Breathing Exercise', icon: Wind, action: () => {}, color: 'blue' },
            { label: 'Mood Journal', icon: BookOpen, action: () => {}, color: 'green' },
            { label: 'Relaxing Music', icon: Headphones, action: () => {}, color: 'pink' }
          ].map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                action.color === 'purple' ? 'bg-purple-50 hover:bg-purple-100 border border-purple-200' :
                action.color === 'blue' ? 'bg-blue-50 hover:bg-blue-100 border border-blue-200' :
                action.color === 'green' ? 'bg-green-50 hover:bg-green-100 border border-green-200' :
                'bg-pink-50 hover:bg-pink-100 border border-pink-200'
              }`}
            >
              {action.link ? (
                <Link to={action.link} className="block text-center">
                  <action.icon className={`w-8 h-8 mx-auto mb-2 ${
                    action.color === 'purple' ? 'text-purple-600' :
                    action.color === 'blue' ? 'text-blue-600' :
                    action.color === 'green' ? 'text-green-600' :
                    'text-pink-600'
                  }`} />
                  <p className="text-sm font-semibold text-gray-700">{action.label}</p>
                </Link>
              ) : (
                <div className="text-center" onClick={action.action}>
                  <action.icon className={`w-8 h-8 mx-auto mb-2 ${
                    action.color === 'purple' ? 'text-purple-600' :
                    action.color === 'blue' ? 'text-blue-600' :
                    action.color === 'green' ? 'text-green-600' :
                    'text-pink-600'
                  }`} />
                  <p className="text-sm font-semibold text-gray-700">{action.label}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MentalWellness;