import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  BookOpen, 
  Heart, 
  Brain,
  Apple,
  Activity,
  Moon,
  ThumbsUp,
  Share2,
  Bookmark,
  Search,
  Video,
  FileText,
  Headphones,
  Youtube,
  ExternalLink,
  Clock,
  Users,
  TrendingUp,
  Star,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HealthTips = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('all');
  const [loading, setLoading] = useState(true);

  // YouTube health videos data
  const youtubeHealthVideos = [
    {
      id: 'yt1',
      videoId: 'dQw4w9WgXcQ', // Replace with actual YouTube video IDs
      title: '10-Minute Full Body Workout - No Equipment Needed',
      channel: 'FitnessBlender',
      description: 'A complete full-body workout that requires no equipment and can be done anywhere. Perfect for beginners and busy schedules.',
      duration: '10:32',
      views: '2.3M',
      likes: '45K',
      publishedAt: '2 weeks ago',
      category: 'fitness',
      difficulty: 'Beginner',
      tags: ['workout', 'fitness', 'no-equipment', 'full-body'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      aiRecommended: true,
      personalizedReason: 'Matches your fitness level and equipment preferences'
    },
    {
      id: 'yt2',
      videoId: 'dQw4w9WgXcQ',
      title: 'Healthy Meal Prep for Weight Loss - 5 Easy Recipes',
      channel: 'Healthy Eating Hub',
      description: 'Learn how to meal prep 5 delicious and nutritious recipes that support weight loss and save time during busy weeks.',
      duration: '15:45',
      views: '1.8M',
      likes: '32K',
      publishedAt: '1 week ago',
      category: 'nutrition',
      difficulty: 'Beginner',
      tags: ['meal-prep', 'weight-loss', 'healthy-recipes', 'nutrition'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      aiRecommended: true,
      personalizedReason: 'Aligns with your weight loss goals and meal planning needs'
    },
    {
      id: 'yt3',
      videoId: 'dQw4w9WgXcQ',
      title: 'Guided Meditation for Stress Relief - 10 Minutes',
      channel: 'Mindful Moments',
      description: 'A calming guided meditation session designed to reduce stress and promote relaxation. Perfect for daily practice.',
      duration: '10:15',
      views: '3.1M',
      likes: '78K',
      publishedAt: '3 days ago',
      category: 'mental_health',
      difficulty: 'All Levels',
      tags: ['meditation', 'stress-relief', 'mindfulness', 'relaxation'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      aiRecommended: false,
      personalizedReason: null
    },
    {
      id: 'yt4',
      videoId: 'dQw4w9WgXcQ',
      title: 'The Science of Sleep - How to Get Better Rest',
      channel: 'Health Science Explained',
      description: 'Discover the science behind sleep and learn practical tips to improve your sleep quality and duration.',
      duration: '18:30',
      views: '956K',
      likes: '28K',
      publishedAt: '5 days ago',
      category: 'sleep',
      difficulty: 'All Levels',
      tags: ['sleep', 'health-science', 'sleep-hygiene', 'wellness'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      aiRecommended: true,
      personalizedReason: 'Based on your sleep tracking data and improvement goals'
    },
    {
      id: 'yt5',
      videoId: 'dQw4w9WgXcQ',
      title: 'Desk Stretches for Office Workers - 5 Minutes',
      channel: 'Workplace Wellness',
      description: 'Quick and effective stretches you can do at your desk to combat the effects of prolonged sitting.',
      duration: '5:22',
      views: '1.2M',
      likes: '35K',
      publishedAt: '1 day ago',
      category: 'fitness',
      difficulty: 'Beginner',
      tags: ['desk-exercises', 'stretching', 'office-health', 'posture'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      aiRecommended: true,
      personalizedReason: 'Perfect for your work-from-home lifestyle'
    },
    {
      id: 'yt6',
      videoId: 'dQw4w9WgXcQ',
      title: 'Understanding Macronutrients - Protein, Carbs, and Fats',
      channel: 'Nutrition Simplified',
      description: 'A comprehensive guide to understanding macronutrients and how to balance them for optimal health.',
      duration: '12:45',
      views: '743K',
      likes: '19K',
      publishedAt: '1 week ago',
      category: 'nutrition',
      difficulty: 'Intermediate',
      tags: ['macronutrients', 'nutrition-education', 'healthy-eating', 'diet'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      aiRecommended: false,
      personalizedReason: null
    },
    {
      id: 'yt7',
      videoId: 'dQw4w9WgXcQ',
      title: 'Morning Yoga Flow for Energy - 15 Minutes',
      channel: 'Yoga with Sarah',
      description: 'Start your day with this energizing yoga flow that will wake up your body and mind.',
      duration: '15:00',
      views: '2.7M',
      likes: '89K',
      publishedAt: '4 days ago',
      category: 'fitness',
      difficulty: 'Beginner',
      tags: ['yoga', 'morning-routine', 'energy', 'flexibility'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      aiRecommended: true,
      personalizedReason: 'Complements your morning routine and flexibility goals'
    },
    {
      id: 'yt8',
      videoId: 'dQw4w9WgXcQ',
      title: 'Breathing Techniques for Anxiety Relief',
      channel: 'Mental Health Matters',
      description: 'Learn powerful breathing techniques that can help manage anxiety and promote calm in stressful situations.',
      duration: '8:15',
      views: '1.5M',
      likes: '42K',
      publishedAt: '2 weeks ago',
      category: 'mental_health',
      difficulty: 'All Levels',
      tags: ['breathing', 'anxiety', 'stress-management', 'mental-health'],
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      aiRecommended: true,
      personalizedReason: 'Helpful for your stress management and mental wellness goals'
    }
  ];

  // Demo health content data
  const healthContent = [
    {
      id: 1,
      type: 'video',
      category: 'fitness',
      title: '10-Minute Morning Workout for Beginners',
      description: 'Start your day with energy! This beginner-friendly routine requires no equipment and can be done anywhere.',
      duration: '10:32',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      author: 'Dr. Sarah Johnson',
      views: 15420,
      likes: 892,
      difficulty: 'Beginner',
      tags: ['morning', 'cardio', 'strength', 'no-equipment'],
      aiRecommended: true,
      personalizedReason: 'Based on your fitness level and morning routine preferences'
    },
    {
      id: 2,
      type: 'article',
      category: 'nutrition',
      title: 'The Science of Hydration: How Much Water Do You Really Need?',
      description: 'Discover the optimal hydration formula based on your weight, activity level, and climate.',
      readTime: '5 min read',
      thumbnail: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
      author: 'Nutritionist Mike Chen',
      views: 8934,
      likes: 567,
      tags: ['hydration', 'health', 'science', 'daily-habits'],
      aiRecommended: true,
      personalizedReason: 'Matches your current hydration goals and weight loss journey'
    },
    {
      id: 3,
      type: 'video',
      category: 'mental_health',
      title: 'Guided Meditation for Better Sleep',
      description: 'A calming 15-minute meditation to help you unwind and prepare for restful sleep.',
      duration: '15:45',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      author: 'Mindfulness Coach Emma Davis',
      views: 23156,
      likes: 1234,
      difficulty: 'All Levels',
      tags: ['meditation', 'sleep', 'relaxation', 'mindfulness'],
      aiRecommended: false,
      personalizedReason: null
    },
    {
      id: 4,
      type: 'podcast',
      category: 'wellness',
      title: 'The Psychology of Habit Formation',
      description: 'Learn how to build lasting healthy habits using science-backed strategies.',
      duration: '28:15',
      thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
      author: 'Dr. Alex Rivera',
      views: 12890,
      likes: 743,
      tags: ['habits', 'psychology', 'behavior-change', 'motivation'],
      aiRecommended: true,
      personalizedReason: 'Aligns with your behavior coaching goals and consistency challenges'
    },
    {
      id: 5,
      type: 'article',
      category: 'nutrition',
      title: 'Meal Prep Mastery: 5 Healthy Recipes for Busy Professionals',
      description: 'Time-saving meal prep strategies with nutritious recipes that support your health goals.',
      readTime: '8 min read',
      thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
      author: 'Chef Maria Rodriguez',
      views: 19567,
      likes: 1089,
      tags: ['meal-prep', 'recipes', 'nutrition', 'time-saving'],
      aiRecommended: true,
      personalizedReason: 'Perfect for your busy schedule and weight management goals'
    },
    {
      id: 6,
      type: 'video',
      category: 'fitness',
      title: 'Desk Exercises to Combat Sitting All Day',
      description: 'Simple exercises you can do at your desk to improve posture and reduce back pain.',
      duration: '12:20',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      author: 'Physical Therapist John Smith',
      views: 34521,
      likes: 1876,
      difficulty: 'Beginner',
      tags: ['desk-exercises', 'posture', 'office-health', 'stretching'],
      aiRecommended: false,
      personalizedReason: null
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen, color: 'gray' },
    { id: 'fitness', name: 'Fitness', icon: Activity, color: 'blue' },
    { id: 'nutrition', name: 'Nutrition', icon: Apple, color: 'green' },
    { id: 'mental_health', name: 'Mental Health', icon: Brain, color: 'purple' },
    { id: 'wellness', name: 'Wellness', icon: Heart, color: 'red' },
    { id: 'sleep', name: 'Sleep', icon: Moon, color: 'indigo' }
  ];

  const contentTypes = [
    { id: 'all', name: 'All Content', icon: BookOpen },
    { id: 'youtube', name: 'YouTube Videos', icon: Youtube },
    { id: 'video', name: 'Videos', icon: Video },
    { id: 'article', name: 'Articles', icon: FileText },
    { id: 'podcast', name: 'Podcasts', icon: Headphones }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const filteredContent = healthContent.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = contentType === 'all' || item.type === contentType;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const filteredYouTubeVideos = youtubeHealthVideos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesType = contentType === 'all' || contentType === 'youtube';
    const matchesSearch = searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesType && matchesSearch;
  });

  const aiRecommendedContent = healthContent.filter(item => item.aiRecommended);
  const aiRecommendedYouTube = youtubeHealthVideos.filter(video => video.aiRecommended);

  const handleLike = (contentId) => {
    // Simulate liking content - could integrate with backend API
    // For now, just update local state or show feedback
  };

  const handleBookmark = (contentId) => {
    // Simulate bookmarking content - could save to localStorage or backend
    // For now, just update local state or show feedback
  };

  const handleShare = (contentId) => {
    // Simulate sharing content
    alert('Content shared! 📤');
  };

  const openYouTubeVideo = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const formatViews = (views) => {
    if (views.includes('M')) return views;
    if (views.includes('K')) return views;
    const num = parseInt(views.replace(/,/g, ''));
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return views;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading health tips and videos...</p>
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
        className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Health Tips & Videos</h1>
        </div>
        <p className="text-green-100">Personalized health content curated by AI for your wellness journey</p>
      </motion.div>

      {/* Featured YouTube Videos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Youtube className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Featured YouTube Health Videos</h3>
          </div>
          <button 
            onClick={() => setContentType('youtube')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Youtube className="w-4 h-4" />
            <span>View All Videos</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {youtubeHealthVideos.slice(0, 6).map((video) => (
            <motion.div
              key={video.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-red-200 cursor-pointer"
              onClick={() => openYouTubeVideo(video.videoId)}
            >
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs">
                  {video.duration}
                </div>
                {video.aiRecommended && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Brain className="w-3 h-3" />
                    <span>AI Pick</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">{video.title}</h4>
                <p className="text-xs text-gray-600 mb-2">{video.channel}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{video.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{video.likes}</span>
                    </div>
                  </div>
                  <span>{video.publishedAt}</span>
                </div>
                
                {video.aiRecommended && (
                  <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                    {video.personalizedReason}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">AI Recommended Content</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...aiRecommendedYouTube.slice(0, 2), ...aiRecommendedContent.slice(0, 1)].map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-purple-200"
              onClick={item.videoId ? () => openYouTubeVideo(item.videoId) : undefined}
            >
              <div className="relative mb-3">
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  AI Pick
                </div>
                {item.videoId && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Youtube className="w-3 h-3" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
              <p className="text-sm text-purple-700 mb-2">{item.personalizedReason}</p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{item.duration || item.readTime}</span>
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{item.likes}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search health tips, videos, articles..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Content Type Filter */}
          <div className="flex space-x-2">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setContentType(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  contentType === type.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <type.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? `bg-${category.color}-100 text-${category.color}-700`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* YouTube Videos */}
        {(contentType === 'all' || contentType === 'youtube') && filteredYouTubeVideos.map((video) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer"
            onClick={() => openYouTubeVideo(video.videoId)}
          >
            {/* Thumbnail */}
            <div className="relative">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Youtube className="w-3 h-3" />
                <span>YouTube</span>
              </div>
              {video.aiRecommended && (
                <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Brain className="w-3 h-3" />
                  <span>AI Pick</span>
                </div>
              )}
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                {video.duration}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <PlayCircle className="w-16 h-16 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  video.category === 'fitness' ? 'bg-blue-100 text-blue-700' :
                  video.category === 'nutrition' ? 'bg-green-100 text-green-700' :
                  video.category === 'mental_health' ? 'bg-purple-100 text-purple-700' :
                  video.category === 'sleep' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {video.category.replace('_', ' ')}
                </span>
                {video.difficulty && (
                  <span className="text-xs text-gray-500">{video.difficulty}</span>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span className="font-medium text-red-600">{video.channel}</span>
                <span>{video.publishedAt}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{video.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{video.likes}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {video.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>

              {video.aiRecommended && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium">🤖 AI Recommendation</p>
                  <p className="text-xs text-purple-600 mt-1">{video.personalizedReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(video.id);
                    }}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{video.likes}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark(video.id);
                    }}
                    className="text-gray-600 hover:text-yellow-600 transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(video.id);
                    }}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openYouTubeVideo(video.videoId);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Play className="w-4 h-4" />
                    <span>Watch</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank');
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Regular Content */}
        {(contentType === 'all' || contentType !== 'youtube') && filteredContent.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="relative">
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              {item.aiRecommended && (
                <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Brain className="w-3 h-3" />
                  <span>AI Pick</span>
                </div>
              )}
              <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                {item.type === 'video' ? item.duration : item.readTime}
              </div>
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 rounded-full p-4 hover:bg-opacity-70 transition-all cursor-pointer">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
              {item.type === 'podcast' && (
                <div className="absolute bottom-3 left-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Headphones className="w-3 h-3" />
                  <span>Podcast</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.category === 'fitness' ? 'bg-blue-100 text-blue-700' :
                  item.category === 'nutrition' ? 'bg-green-100 text-green-700' :
                  item.category === 'mental_health' ? 'bg-purple-100 text-purple-700' :
                  item.category === 'wellness' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.category.replace('_', ' ')}
                </span>
                {item.difficulty && (
                  <span className="text-xs text-gray-500">{item.difficulty}</span>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>by {item.author}</span>
                <span>{item.views.toLocaleString()} views</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleLike(item.id)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{item.likes}</span>
                  </button>
                  <button
                    onClick={() => handleBookmark(item.id)}
                    className="text-gray-600 hover:text-yellow-600 transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare(item.id)}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => alert(`${item.type === 'video' ? 'Watch' : item.type === 'podcast' ? 'Listen to' : 'Read'} ${item.title}`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  {item.type === 'video' ? 'Watch' : item.type === 'podcast' ? 'Listen' : 'Read'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button 
          onClick={() => alert('Load more health content')}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Load More Content
        </button>
      </div>
    </div>
  );
};

export default HealthTips;