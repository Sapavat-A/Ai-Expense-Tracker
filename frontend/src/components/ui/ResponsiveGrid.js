import React from 'react';

/**
 * Responsive Grid Component with Smart Breakpoints
 * Provides adaptive layouts for mobile, tablet, and desktop
 */
const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = { default: 4, sm: 4, md: 6, lg: 6, xl: 8 },
  className = '',
  ...props 
}) => {
  const getGridClasses = () => {
    const classes = ['grid'];
    
    // Default columns
    classes.push(`grid-cols-${cols.default}`);
    
    // Responsive columns
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    // Gap
    classes.push(`gap-${gap.default}`);
    if (gap.sm) classes.push(`sm:gap-${gap.sm}`);
    if (gap.md) classes.push(`md:gap-${gap.md}`);
    if (gap.lg) classes.push(`lg:gap-${gap.lg}`);
    if (gap.xl) classes.push(`xl:gap-${gap.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getGridClasses()} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Container with Smart Padding
 */
export const ResponsiveContainer = ({ 
  children, 
  maxWidth = '7xl',
  padding = { default: 4, sm: 6, lg: 8 },
  className = '',
  ...props 
}) => {
  const getContainerClasses = () => {
    const classes = [`max-w-${maxWidth}`, 'mx-auto'];
    
    // Padding
    classes.push(`px-${padding.default}`);
    if (padding.sm) classes.push(`sm:px-${padding.sm}`);
    if (padding.lg) classes.push(`lg:px-${padding.lg}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getContainerClasses()} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Flex Component
 */
export const ResponsiveFlex = ({ 
  children, 
  direction = 'row',
  wrap = false,
  justify = 'start',
  align = 'start',
  gap = { default: 4, sm: 4, md: 6, lg: 6 },
  responsive = {},
  className = '',
  ...props 
}) => {
  const getFlexClasses = () => {
    const classes = ['flex'];
    
    // Direction
    classes.push(`flex-${direction}`);
    
    // Responsive direction
    if (responsive.direction) {
      Object.entries(responsive.direction).forEach(([breakpoint, dir]) => {
        classes.push(`${breakpoint}:flex-${dir}`);
      });
    }
    
    // Wrap
    if (wrap) classes.push('flex-wrap');
    
    // Justify content
    classes.push(`justify-${justify}`);
    
    // Align items
    classes.push(`items-${align}`);
    
    // Gap
    classes.push(`gap-${gap.default}`);
    if (gap.sm) classes.push(`sm:gap-${gap.sm}`);
    if (gap.md) classes.push(`md:gap-${gap.md}`);
    if (gap.lg) classes.push(`lg:gap-${gap.lg}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getFlexClasses()} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Card Component
 */
export const ResponsiveCard = ({ 
  children, 
  padding = { default: 6, sm: 4, md: 6 },
  shadow = 'md',
  rounded = 'xl',
  hover = true,
  className = '',
  ...props 
}) => {
  const getCardClasses = () => {
    const classes = [];
    
    // Background and border
    classes.push('bg-white/80', 'backdrop-blur-xl', 'border', 'border-white/20');
    
    // Shadow
    classes.push(`shadow-${shadow}`);
    if (hover) classes.push('hover:shadow-2xl', 'transition-all', 'duration-300');
    
    // Rounded
    classes.push(`rounded-${rounded}`);
    
    // Padding
    classes.push(`p-${padding.default}`);
    if (padding.sm) classes.push(`sm:p-${padding.sm}`);
    if (padding.md) classes.push(`md:p-${padding.md}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getCardClasses()} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Text Component
 */
export const ResponsiveText = ({ 
  children, 
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  truncate = false,
  className = '',
  ...props 
}) => {
  const getTextClasses = () => {
    const classes = [];
    
    // Size
    classes.push(`text-${size}`);
    
    // Weight
    classes.push(`font-${weight}`);
    
    // Color
    classes.push(`text-${color}`);
    
    // Align
    classes.push(`text-${align}`);
    
    // Truncate
    if (truncate) classes.push('truncate');
    
    return classes.join(' ');
  };

  return (
    <p className={`${getTextClasses()} ${className}`} {...props}>
      {children}
    </p>
  );
};

/**
 * Responsive Button Component
 */
export const ResponsiveButton = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  responsive = {},
  className = '',
  onClick,
  ...props 
}) => {
  const getButtonClasses = () => {
    const classes = [];
    
    // Base styles
    classes.push('relative', 'overflow-hidden', 'font-medium', 'transition-all', 'duration-300');
    
    // Size
    const sizeClasses = {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl'
    };
    classes.push(sizeClasses[size] || sizeClasses.md);
    
    // Full width
    if (fullWidth) classes.push('w-full');
    
    // Disabled state
    if (disabled) classes.push('opacity-50', 'cursor-not-allowed');
    
    // Loading state
    if (loading) classes.push('opacity-75', 'cursor-wait');
    
    // Responsive sizes
    if (responsive.size) {
      Object.entries(responsive.size).forEach(([breakpoint, btnSize]) => {
        const responsiveSizeClasses = {
          xs: `${breakpoint}:px-3 ${breakpoint}:py-1.5 ${breakpoint}:text-xs`,
          sm: `${breakpoint}:px-4 ${breakpoint}:py-2 ${breakpoint}:text-sm`,
          md: `${breakpoint}:px-6 ${breakpoint}:py-3 ${breakpoint}:text-base`,
          lg: `${breakpoint}:px-8 ${breakpoint}:py-4 ${breakpoint}:text-lg`,
          xl: `${breakpoint}:px-10 ${breakpoint}:py-5 ${breakpoint}:text-xl`
        };
        classes.push(responsiveSizeClasses[btnSize] || responsiveSizeClasses.md);
      });
    }
    
    return classes.join(' ');
  };

  const getVariantClasses = () => {
    const variants = {
      primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
      success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl',
      danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      ghost: 'text-blue-600 hover:bg-blue-50'
    };
    
    return variants[variant] || variants.primary;
  };

  return (
    <button 
      className={`${getButtonClasses()} ${getVariantClasses()} ${className}`}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Button content */}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
    </button>
  );
};

/**
 * Responsive Input Component
 */
export const ResponsiveInput = ({ 
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const getInputClasses = () => {
    const classes = [];
    
    // Base styles
    classes.push('w-full', 'border', 'rounded-xl', 'transition-all', 'duration-300');
    
    // Size
    const sizeClasses = {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg',
      xl: 'px-8 py-5 text-xl'
    };
    classes.push(sizeClasses[size] || sizeClasses.md);
    
    // Icon padding
    if (icon) {
      if (iconPosition === 'left') {
        classes.push('pl-12');
      } else {
        classes.push('pr-12');
      }
    }
    
    // States
    classes.push(
      'bg-white/80',
      'backdrop-blur-xl',
      'border-white/20',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:border-blue-500',
      'focus:bg-white/90'
    );
    
    // Error state
    if (error) {
      classes.push('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
    }
    
    // Disabled state
    if (disabled) {
      classes.push('opacity-50', 'cursor-not-allowed');
    }
    
    return classes.join(' ');
  };

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          className={getInputClasses()}
          disabled={disabled}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default ResponsiveGrid;
