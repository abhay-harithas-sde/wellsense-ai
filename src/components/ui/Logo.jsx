
const Logo = ({ size = 'md', variant = 'full', className = '' }) => {
  const sizes = {
    sm: { container: 'h-8', icon: 'w-6 h-6', text: 'text-lg', subtext: 'text-xs' },
    md: { container: 'h-12', icon: 'w-8 h-8', text: 'text-2xl', subtext: 'text-sm' },
    lg: { container: 'h-16', icon: 'w-12 h-12', text: 'text-3xl', subtext: 'text-base' },
    xl: { container: 'h-20', icon: 'w-16 h-16', text: 'text-4xl', subtext: 'text-lg' }
  };

  const currentSize = sizes[size];

  if (variant === 'icon') {
    return (
      <div className={`relative ${currentSize.container} ${className}`}>
        <img
          src="/logo.png"
          alt="WellSense AI"
          className={`${currentSize.icon} object-contain`}
        />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className={`font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent ${currentSize.text}`}>
          WellSense
        </span>
        <span className={`font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent ${currentSize.text}`}>
          AI
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <img
        src="/logo.png"
        alt="WellSense AI"
        className={`${currentSize.icon} object-contain`}
      />

      {/* Logo Text */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1">
          <span className={`font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent ${currentSize.text}`}>
            WellSense
          </span>
          <span className={`font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent ${currentSize.text}`}>
            AI
          </span>
        </div>
        <span className={`text-gray-500 font-medium ${currentSize.subtext} -mt-1`}>
          Your Health Companion
        </span>
      </div>
    </div>
  );
};

// Animated version for loading screens
export const AnimatedLogo = ({ size = 'lg', className = '' }) => {
  const sizes = {
    sm: { container: 'h-8', icon: 'w-6 h-6', text: 'text-lg', subtext: 'text-xs' },
    md: { container: 'h-12', icon: 'w-8 h-8', text: 'text-2xl', subtext: 'text-sm' },
    lg: { container: 'h-16', icon: 'w-12 h-12', text: 'text-3xl', subtext: 'text-base' },
    xl: { container: 'h-20', icon: 'w-16 h-16', text: 'text-4xl', subtext: 'text-lg' }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img
        src="/logo.png"
        alt="WellSense AI"
        className={`${sizes[size].icon} object-contain animate-pulse`}
      />

      <div className="flex flex-col">
        <div className="flex items-center space-x-1">
          <span className={`font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent ${sizes[size].text} animate-pulse`}>
            WellSense
          </span>
          <span className={`font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent ${sizes[size].text} animate-pulse`}>
            AI
          </span>
        </div>
        <span className={`text-gray-500 font-medium ${sizes[size].subtext} -mt-1`}>
          Your Health Companion
        </span>
      </div>
    </div>
  );
};

export default Logo;