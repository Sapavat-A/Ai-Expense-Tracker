import React from 'react';
import { motion } from 'framer-motion';

const ResponsiveLayout = ({ 
  children, 
  className = '',
  maxWidth = '7xl',
  padding = '4',
  sidebar = null,
  header = null 
}) => {
  const containerClasses = [
    'mx-auto w-full',
    `max-w-${maxWidth}`,
    `px-${padding}`,
    'sm:px-6',
    'lg:px-8',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {header && (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className={containerClasses}>
            {header}
          </div>
        </header>
      )}
      
      <div className="flex">
        {sidebar && (
          <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              {sidebar}
            </div>
          </aside>
        )}
        
        <main className="flex-1 lg:ml-0">
          <div className={containerClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebar && (
        <div className="lg:hidden fixed inset-0 z-50 hidden">
          <div className="fixed inset-0 bg-black/50" />
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800">
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
};

// Responsive Grid Component
export const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4, xl: 6 },
  gap = '4',
  className = '' 
}) => {
  const gridClasses = [
    'grid',
    `gap-${gap}`,
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  ].filter(Boolean).join(' ');

  return <div className={gridClasses}>{children}</div>;
};

// Responsive Card Component
export const ResponsiveCard = ({ 
  children, 
  className = '',
  hover = true,
  padding = '6' 
}) => {
  const cardClasses = [
    'bg-white dark:bg-gray-800',
    'rounded-xl shadow-lg',
    'border border-gray-200 dark:border-gray-700',
    `p-${padding}`,
    hover && 'hover:shadow-xl hover:-translate-y-1',
    'transition-all duration-200',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={cardClasses}
      whileHover={hover ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Responsive Text Component
export const ResponsiveText = ({ 
  children, 
  size = 'base',
  weight = 'normal',
  color = 'gray-900',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  const classes = [
    sizeClasses[size],
    weightClasses[weight],
    `text-${color}`,
    className
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};

// Responsive Button Group
export const ResponsiveButtonGroup = ({ 
  children, 
  vertical = false,
  className = '' 
}) => {
  const groupClasses = [
    'flex',
    vertical ? 'flex-col space-y-2' : 'flex-row space-x-2',
    'flex-wrap',
    className
  ].filter(Boolean).join(' ');

  return <div className={groupClasses}>{children}</div>;
};

export default ResponsiveLayout;
