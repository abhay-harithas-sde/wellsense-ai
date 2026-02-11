import React from 'react';
import { useResponsive, useTouch, useOrientation } from '../../hooks/useResponsive';
import { Smartphone, Tablet, Monitor, Rotate3D } from 'lucide-react';

const MobileOptimized = ({ children, className = '' }) => {
  const { isMobile, isTablet, isDesktop, breakpoint, screenSize } = useResponsive();
  const isTouch = useTouch();
  const orientation = useOrientation();

  return (
    <div className={`mobile-optimized ${className}`}>
      {/* Device info for debugging (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg z-50 font-mono">
          <div className="flex items-center space-x-2 mb-1">
            {isMobile && <Smartphone className="w-3 h-3" />}
            {isTablet && <Tablet className="w-3 h-3" />}
            {isDesktop && <Monitor className="w-3 h-3" />}
            <span>{breakpoint}</span>
            {orientation === 'landscape' && <Rotate3D className="w-3 h-3" />}
          </div>
          <div>{screenSize.width}×{screenSize.height}</div>
          <div>{isTouch ? 'Touch' : 'Mouse'}</div>
        </div>
      )}
      
      {children}
    </div>
  );
};

// Touch-friendly button component
export const TouchButton = ({ 
  children, 
  onClick, 
  className = '',
  size = 'md',
  ...props 
}) => {
  const { isMobile } = useResponsive();
  
  const sizeClasses = {
    sm: isMobile ? 'min-h-[44px] px-4 py-2' : 'px-3 py-1.5',
    md: isMobile ? 'min-h-[48px] px-6 py-3' : 'px-4 py-2',
    lg: isMobile ? 'min-h-[52px] px-8 py-4' : 'px-6 py-3'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        touch-manipulation
        select-none
        transition-all
        duration-200
        active:scale-95
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Swipeable card component
export const SwipeableCard = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  className = '' 
}) => {
  const [startX, setStartX] = React.useState(0);
  const [currentX, setCurrentX] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const diffX = currentX - startX;
    const threshold = 100;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (diffX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setIsDragging(false);
    setCurrentX(0);
    setStartX(0);
  };

  const translateX = isDragging ? currentX - startX : 0;

  return (
    <div
      className={`
        touch-pan-y
        select-none
        transition-transform
        duration-200
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${className}
      `}
      style={{
        transform: `translateX(${translateX}px)`
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

// Responsive image component
export const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props 
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  // Generate responsive srcSet (in a real app, you'd have multiple image sizes)
  const srcSet = `
    ${src}?w=400 400w,
    ${src}?w=800 800w,
    ${src}?w=1200 1200w,
    ${src}?w=1600 1600w
  `;

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      className={`
        max-w-full
        h-auto
        ${isMobile ? 'rounded-lg' : isTablet ? 'rounded-xl' : 'rounded-2xl'}
        ${className}
      `}
      {...props}
    />
  );
};

// Adaptive grid component
export const AdaptiveGrid = ({ 
  children, 
  minItemWidth = 280,
  gap = 4,
  className = '' 
}) => {
  const { screenSize } = useResponsive();
  
  // Calculate optimal columns based on screen width and minimum item width
  const columns = Math.floor(screenSize.width / (minItemWidth + (gap * 16)));
  const actualColumns = Math.max(1, Math.min(columns, React.Children.count(children)));

  return (
    <div
      className={`
        grid
        gap-${gap}
        ${className}
      `}
      style={{
        gridTemplateColumns: `repeat(${actualColumns}, 1fr)`
      }}
    >
      {children}
    </div>
  );
};

// Mobile-first navigation
export const MobileNavigation = ({ items, activeItem, onItemClick }) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {items.slice(0, 5).map((item, index) => (
            <TouchButton
              key={index}
              onClick={() => onItemClick(item)}
              className={`
                flex flex-col items-center space-y-1 p-2
                ${activeItem === item.id ? 'text-blue-600' : 'text-gray-600'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </TouchButton>
          ))}
        </div>
      </nav>
    );
  }

  return null; // Use regular sidebar on larger screens
};

export default MobileOptimized;