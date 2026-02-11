import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Brain,
  Heart,
  Leaf,
  Moon,
  Sun,
  Wind,
  Waves,
  Mountain,
  Timer,
  Settings,
  BookOpen,
  Award,
  TrendingUp,
  Plus,
  Bell,
  CheckCircle
} from 'lucide-react';

const MeditationCenter = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [selectedType, setSelectedType] = useState('mindfulness');
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [meditationStreak, setMeditationStreak] = useState(7);
  const [totalMinutes, setTotalMinutes] = useState(245);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const meditationTypes = [
    {
      id: 'mindfulness',
      name: 'Mindfulness',
      description: 'Focus on present moment awareness',
      icon: Brain,
      color: 'bg-blue-500',
      duration: [5, 10, 15, 20, 30],
      benefits: ['Reduces stress', 'Improves focus', 'Enhances awareness']
    },
    {
      id: 'breathing',
      name: 'Breathing',
      description: 'Guided breathing exercises',
      icon: Wind,
      color: 'bg-green-500',
      duration: [3, 5, 10, 15],
      benefits: ['Calms nervous system', 'Reduces anxiety', 'Improves oxygen flow']
    },
    {
      id: 'body-scan',
      name: 'Body Scan',
      description: 'Progressive muscle relaxation',
      icon: Heart,
      color: 'bg-red-500',
      duration: [10, 15, 20, 30],
      benefits: ['Releases tension', 'Improves body awareness', 'Promotes relaxation']
    },
    {
      id: 'loving-kindness',
      name: 'Loving Kindness',
      description: 'Cultivate compassion and love',
      icon: Leaf,
      color: 'bg-pink-500',
      duration: [10, 15, 20],
      benefits: ['Increases empathy', 'Reduces negative emotions', 'Builds compassion']
    },
    {
      id: 'sleep',
      name: 'Sleep',
      description: 'Prepare for restful sleep',
      icon: Moon,
      color: 'bg-indigo-500',
      duration: [10, 15, 20, 30],
      benefits: ['Improves sleep quality', 'Reduces insomnia', 'Calms mind']
    },
    {
      id: 'energy',
      name: 'Energy Boost',
      description: 'Energizing morning meditation',
      icon: Sun,
      color: 'bg-yellow-500',
      duration: [5, 10, 15],
      benefits: ['Increases energy', 'Improves mood', 'Enhances motivation']
    }
  ];

  const ambientSounds = [
    { id: 'rain', name: 'Rain', icon: '🌧️' },
    { id: 'ocean', name: 'Ocean Waves', icon: '🌊' },
    { id: 'forest', name: 'Forest', icon: '🌲' },
    { id: 'birds', name: 'Birds', icon: '🐦' },
    { id: 'fire', name: 'Fireplace', icon: '🔥' },
    { id: 'silence', name: 'Silence', icon: '🤫' }
  ];

  const [selectedSound, setSelectedSound] = useState('silence');
  const [schedule, setSchedule] = useState([
    { id: 1, time: '07:00', type: 'energy', duration: 10, days: ['Mon', 'Wed', 'Fri'], active: true },
    { id: 2, time: '12:00', type: 'breathing', duration: 5, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], active: true },
    { id: 3, time: '21:00', type: 'sleep', duration: 15, days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], active: false }
  ]);

  const weeklyProgress = [
    { day: 'Mon', minutes: 25, completed: true },
    { day: 'Tue', minutes: 15, completed: true },
    { day: 'Wed', minutes: 30, completed: true },
    { day: 'Thu', minutes: 20, completed: true },
    { day: 'Fri', minutes: 10, completed: true },
    { day: 'Sat', minutes: 35, completed: true },
    { day: 'Sun', minutes: 25, completed: true }
  ];

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            setCurrentSession(null);
            // Play completion sound or notification
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, timeRemaining]);

  const startMeditation = (type, duration) => {
    setCurrentSession({ type, duration });
    setTimeRemaining(duration * 60);
    setIsPlaying(true);
  };

  const pauseResume = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setCurrentSession(null);
    setTimeRemaining(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleScheduleItem = (id) => {
    setSchedule(prev => prev.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  const MeditationCard = ({ meditation }) => {
    const Icon = meditation.icon;
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 cursor-pointer"
        onClick={() => setSelectedType(meditation.id)}
      >
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-full ${meditation.color} mr-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{meditation.name}</h3>
            <p className="text-gray-600 text-sm">{meditation.description}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Duration Options:</p>
          <div className="flex flex-wrap gap-2">
            {meditation.duration.map(duration => (
              <button
                key={duration}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDuration(duration);
                  startMeditation(meditation.id, duration);
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {duration}m
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Benefits:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {meditation.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    );
  };

  const TimerDisplay = () => (
    <div className="text-center">
      <div className="relative w-64 h-64 mx-auto mb-8">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#E5E7EB"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - (timeRemaining / (selectedDuration * 60)))}`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-gray-600 capitalize">
              {currentSession?.type.replace('-', ' ')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={resetSession}
          className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          onClick={pauseResume}
          className="p-4 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white" />
          )}
        </button>
        
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-gray-600" />
          ) : (
            <Volume2 className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Ambient Sound Selection */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Ambient Sounds</p>
        <div className="flex flex-wrap justify-center gap-2">
          {ambientSounds.map(sound => (
            <button
              key={sound.id}
              onClick={() => setSelectedSound(sound.id)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedSound === sound.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sound.icon} {sound.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const ScheduleManager = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Meditation Schedule
        </h3>
        <button className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Session
        </button>
      </div>

      <div className="space-y-4">
        {schedule.map(item => {
          const meditationType = meditationTypes.find(type => type.id === item.type);
          const Icon = meditationType?.icon || Clock;
          
          return (
            <div
              key={item.id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                item.active
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full ${meditationType?.color || 'bg-gray-500'} mr-3`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{item.time}</span>
                      <span className="text-sm text-gray-600">
                        {meditationType?.name} • {item.duration}m
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {item.days.map(day => (
                        <span
                          key={day}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleScheduleItem(item.id)}
                    className={`p-2 rounded-full transition-colors ${
                      item.active
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  const ProgressStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 text-center"
      >
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{meditationStreak}</h3>
        <p className="text-gray-600">Day Streak</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 text-center"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{totalMinutes}</h3>
        <p className="text-gray-600">Total Minutes</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {weeklyProgress.filter(day => day.completed).length}/7
        </h3>
        <p className="text-gray-600">This Week</p>
      </motion.div>
    </div>
  );

  const WeeklyProgress = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-8"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
        Weekly Progress
      </h3>
      
      <div className="grid grid-cols-7 gap-2">
        {weeklyProgress.map((day, index) => (
          <div key={day.day} className="text-center">
            <div className="text-xs text-gray-600 mb-2">{day.day}</div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${
                day.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {day.minutes}m
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <Brain className="w-8 h-8 mr-3 text-purple-600" />
            Meditation & Mindfulness Center
          </h1>
          <p className="text-gray-600">
            Find peace, reduce stress, and improve your mental well-being
          </p>
        </div>

        {/* Progress Stats */}
        <ProgressStats />

        {/* Active Session or Meditation Types */}
        {currentSession ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <TimerDisplay />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {meditationTypes.map(meditation => (
              <MeditationCard key={meditation.id} meditation={meditation} />
            ))}
          </div>
        )}

        {/* Weekly Progress and Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <WeeklyProgress />
          </div>
          <div>
            <ScheduleManager />
          </div>
        </div>

        {/* Meditation Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mt-8 border border-purple-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
            Meditation Tips for Beginners
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-purple-700 mb-2">🧘‍♀️ Find Your Space</h4>
              <p className="text-sm text-gray-600">
                Choose a quiet, comfortable spot where you won't be disturbed.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-blue-700 mb-2">⏰ Start Small</h4>
              <p className="text-sm text-gray-600">
                Begin with just 5 minutes daily and gradually increase duration.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-green-700 mb-2">🎯 Be Consistent</h4>
              <p className="text-sm text-gray-600">
                Regular practice is more beneficial than long, infrequent sessions.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-orange-700 mb-2">💭 Don't Judge</h4>
              <p className="text-sm text-gray-600">
                It's normal for your mind to wander. Gently return focus to your breath.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MeditationCenter;