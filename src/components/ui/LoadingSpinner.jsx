import { motion } from 'framer-motion';
import { Heart, Brain, Activity, Sparkles } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', type = 'default' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  if (type === 'health') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <motion.div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center`}
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart className={`${iconSizes[size]} text-white`} />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-red-200"
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.p 
          className="text-gray-600 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </div>
    );
  }

  if (type === 'brain') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <motion.div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center`}
            animate={{ 
              scale: [1, 1.1, 1],
              rotateY: [0, 180, 360]
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Brain className={`${iconSizes[size]} text-white`} />
          </motion.div>
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-purple-200 border-dashed"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.p 
          className="text-gray-600 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </div>
    );
  }

  if (type === 'activity') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <motion.div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center`}
            animate={{ 
              scale: [1, 1.15, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Activity className={`${iconSizes[size]} text-white`} />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(16, 185, 129, 0.3), transparent)'
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.p 
          className="text-gray-600 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </div>
    );
  }

  // Default spinner with sparkles
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg`}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Sparkles className={`${iconSizes[size]} text-white`} />
        </motion.div>
        
        {/* Orbiting dots */}
        {[0, 120, 240].map((angle, index) => (
          <motion.div
            key={index}
            className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: `${size === 'sm' ? '20px' : size === 'md' ? '30px' : size === 'lg' ? '40px' : '50px'} 0px`
            }}
            animate={{ 
              rotate: [angle, angle + 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }
            }}
          />
        ))}
      </div>
      
      <motion.p 
        className="text-gray-600 font-medium text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
};

// Skeleton loader for content
export const SkeletonLoader = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"
          style={{ width: `${Math.random() * 40 + 60}%` }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  );
};

// Card skeleton
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <motion.div 
          className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <div className="flex-1">
          <motion.div 
            className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-2"
            style={{ width: '70%' }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: 0.1
            }}
          />
          <motion.div 
            className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
            style={{ width: '50%' }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: 0.2
            }}
          />
        </div>
      </div>
      <SkeletonLoader lines={2} />
    </div>
  );
};

export default LoadingSpinner;