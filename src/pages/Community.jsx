import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, MessageCircle, Share2, Plus, Search, Filter } from 'lucide-react';

const Community = () => {
  const [posts] = useState([
    {
      id: 1,
      author: { name: 'Sarah Johnson', avatar: 'SJ' },
      title: 'My 6-month weight loss journey!',
      content: 'I wanted to share my progress after 6 months of consistent effort. Lost 25 pounds and feeling amazing!',
      category: 'Success Story',
      likes: 24,
      comments: 8,
      timeAgo: '2 hours ago',
      isLiked: false
    },
    {
      id: 2,
      author: { name: 'Mike Chen', avatar: 'MC' },
      title: 'Best home workout equipment for beginners?',
      content: 'Looking to set up a home gym on a budget. What equipment would you recommend for someone just starting out?',
      category: 'Fitness',
      likes: 12,
      comments: 15,
      timeAgo: '4 hours ago',
      isLiked: true
    },
    {
      id: 3,
      author: { name: 'Emma Davis', avatar: 'ED' },
      title: 'Healthy meal prep ideas for busy professionals',
      content: 'Sharing some quick and nutritious meal prep recipes that have helped me stay on track with my health goals.',
      category: 'Nutrition',
      likes: 31,
      comments: 12,
      timeAgo: '1 day ago',
      isLiked: false
    }
  ]);

  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [showNewPost, setShowNewPost] = useState(false);

  const categories = ['All', 'Fitness', 'Nutrition', 'Mental Health', 'Success Story', 'General'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Community</h1>
            <p className="text-green-100">Connect, share, and support each other on your health journey</p>
          </div>
          <motion.button
            onClick={() => setShowNewPost(!showNewPost)}
            className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            <span>New Post</span>
          </motion.button>
        </div>
      </motion.div>

      {/* New Post Form */}
      {showNewPost && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Share with the Community</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's your post about?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your thoughts, experiences, or questions..."
              />
            </div>
            
            <div className="flex space-x-3">
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Post to Community
              </motion.button>
              <motion.button
                onClick={() => setShowNewPost(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all">
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
          >
            {/* Post Header */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {post.author.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{post.timeAgo}</span>
                  <span>•</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {post.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
              <p className="text-gray-700 leading-relaxed">{post.content}</p>
            </div>

            {/* Post Actions */}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
              <motion.button
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  post.isLiked 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span className="font-semibold">{post.likes}</span>
              </motion.button>

              <motion.button
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">{post.comments}</span>
              </motion.button>

              <motion.button
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
                <span className="font-semibold">Share</span>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <motion.button
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Load More Posts
        </motion.button>
      </div>
    </div>
  );
};

export default Community;