import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

const ResponsiveContainer = ({ 
  children, 
  className = '', 
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  as: Component = 'div',
  ...props 
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Build responsive classes
  let responsiveClasses = className;
  
  if (isMobile && mobileClassName) {
    responsiveClasses += ` ${mobileClassName}`;
  } else if (isTablet && tabletClassName) {
    responsiveClasses += ` ${tabletClassName}`;
  } else if (isDesktop && desktopClassName) {
    responsiveClasses += ` ${desktopClassName}`;
  }

  return (
    <Component className={responsiveClasses} {...props}>
      {children}
    </Component>
  );
};

// Specialized responsive components
export const ResponsiveGrid = ({ children, className = '', ...props }) => {
  return (
    <ResponsiveContainer
      className={`grid gap-4 ${className}`}
      mobileClassName="grid-cols-1"
      tabletClassName="grid-cols-2"
      desktopClassName="grid-cols-3 lg:grid-cols-4"
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
};

export const ResponsiveCard = ({ children, className = '', ...props }) => {
  return (
    <ResponsiveContainer
      className={`bg-white/80 backdrop-blur-xl shadow-lg border border-white/20 ${className}`}
      mobileClassName="rounded-lg p-4"
      tabletClassName="rounded-xl p-5"
      desktopClassName="rounded-2xl p-6"
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
};

export const ResponsiveText = ({ 
  children, 
  variant = 'body',
  className = '', 
  ...props 
}) => {
  const variants = {
    h1: {
      base: 'font-bold leading-tight',
      mobile: 'text-2xl',
      tablet: 'text-3xl',
      desktop: 'text-4xl lg:text-5xl'
    },
    h2: {
      base: 'font-bold leading-tight',
      mobile: 'text-xl',
      tablet: 'text-2xl',
      desktop: 'text-3xl lg:text-4xl'
    },
    h3: {
      base: 'font-semibold leading-tight',
      mobile: 'text-lg',
      tablet: 'text-xl',
      desktop: 'text-2xl lg:text-3xl'
    },
    h4: {
      base: 'font-semibold',
      mobile: 'text-base',
      tablet: 'text-lg',
      desktop: 'text-xl lg:text-2xl'
    },
    body: {
      base: 'leading-relaxed',
      mobile: 'text-sm',
      tablet: 'text-base',
      desktop: 'text-base lg:text-lg'
    },
    caption: {
      base: 'leading-normal',
      mobile: 'text-xs',
      tablet: 'text-sm',
      desktop: 'text-sm'
    }
  };

  const variantClasses = variants[variant] || variants.body;

  return (
    <ResponsiveContainer
      as="span"
      className={`${variantClasses.base} ${className}`}
      mobileClassName={variantClasses.mobile}
      tabletClassName={variantClasses.tablet}
      desktopClassName={variantClasses.desktop}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
};

export const ResponsiveButton = ({ 
  children, 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const sizes = {
    sm: {
      base: 'font-medium rounded-lg transition-all duration-200',
      mobile: 'px-3 py-2 text-sm',
      tablet: 'px-4 py-2 text-sm',
      desktop: 'px-4 py-2 text-base'
    },
    md: {
      base: 'font-medium rounded-xl transition-all duration-200',
      mobile: 'px-4 py-2.5 text-sm',
      tablet: 'px-5 py-3 text-base',
      desktop: 'px-6 py-3 text-base'
    },
    lg: {
      base: 'font-semibold rounded-xl transition-all duration-200',
      mobile: 'px-5 py-3 text-base',
      tablet: 'px-6 py-4 text-lg',
      desktop: 'px-8 py-4 text-lg'
    }
  };

  const sizeClasses = sizes[size] || sizes.md;

  return (
    <ResponsiveContainer
      as="button"
      className={`${sizeClasses.base} ${className}`}
      mobileClassName={sizeClasses.mobile}
      tabletClassName={sizeClasses.tablet}
      desktopClassName={sizeClasses.desktop}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
};

export const ResponsiveModal = ({ children, className = '', ...props }) => {
  return (
    <ResponsiveContainer
      className={`bg-white rounded-lg shadow-2xl ${className}`}
      mobileClassName="w-full max-w-sm mx-4 p-4"
      tabletClassName="w-full max-w-md mx-6 p-6"
      desktopClassName="w-full max-w-lg mx-8 p-8"
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
};

export const ResponsiveIcon = ({ 
  icon: Icon, 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const { isMobile, isTablet } = useResponsive();
  
  const sizes = {
    sm: isMobile ? 'w-4 h-4' : isTablet ? 'w-4 h-4' : 'w-5 h-5',
    md: isMobile ? 'w-5 h-5' : isTablet ? 'w-6 h-6' : 'w-6 h-6',
    lg: isMobile ? 'w-6 h-6' : isTablet ? 'w-7 h-7' : 'w-8 h-8',
    xl: isMobile ? 'w-8 h-8' : isTablet ? 'w-10 h-10' : 'w-12 h-12'
  };

  return (
    <Icon 
      className={`${sizes[size]} ${className}`} 
      {...props} 
    />
  );
};

export default ResponsiveContainer;