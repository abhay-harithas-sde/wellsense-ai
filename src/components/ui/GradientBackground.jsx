import { motion } from 'framer-motion';

const GradientBackground = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    default: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overlay: 'from-blue-600/20 via-purple-600/20 to-indigo-700/20'
    },
    health: {
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      overlay: 'from-green-500/20 via-emerald-500/20 to-teal-600/20'
    },
    mental: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      overlay: 'from-purple-500/20 via-pink-500/20 to-indigo-600/20'
    },
    fitness: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      overlay: 'from-pink-500/20 via-red-500/20 to-orange-600/20'
    },
    nutrition: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      overlay: 'from-blue-500/20 via-cyan-500/20 to-teal-600/20'
    },
    wellness: {
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      overlay: 'from-cyan-300/20 via-pink-300/20 to-purple-400/20'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Base gradient background */}
      <div 
        className="absolute inset-0"
        style={{ background: currentVariant.background }}
      />
      
      {/* Animated overlay gradients */}
      <div className="absolute inset-0">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${currentVariant.overlay}`}
          animate={{
            background: [
              `linear-gradient(135deg, ${currentVariant.overlay.split(' ')[0].replace('from-', '')} 0%, transparent 50%, transparent 100%)`,
              `linear-gradient(225deg, transparent 0%, ${currentVariant.overlay.split(' ')[1].replace('via-', '')} 50%, transparent 100%)`,
              `linear-gradient(315deg, transparent 0%, transparent 50%, ${currentVariant.overlay.split(' ')[2].replace('to-', '')} 100%)`,
              `linear-gradient(135deg, ${currentVariant.overlay.split(' ')[0].replace('from-', '')} 0%, transparent 50%, transparent 100%)`
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="mesh" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="1" fill="white" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Animated gradient text component
export const GradientText = ({ 
  children, 
  gradient = 'from-blue-600 via-purple-600 to-indigo-800',
  className = '',
  animate = false 
}) => {
  return (
    <motion.span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}
      animate={animate ? {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      } : {}}
      transition={animate ? {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      } : {}}
      style={animate ? {
        backgroundSize: '200% 200%'
      } : {}}
    >
      {children}
    </motion.span>
  );
};

// Glass card component with gradient background
export const GlassCard = ({ 
  children, 
  className = '',
  gradient = 'from-white/20 to-white/10',
  blur = 'backdrop-blur-xl',
  border = 'border-white/20'
}) => {
  return (
    <motion.div
      className={`bg-gradient-to-br ${gradient} ${blur} border ${border} rounded-2xl ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
};

export default GradientBackground;