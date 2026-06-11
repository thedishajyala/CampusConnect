import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading, 
  disabled, 
  icon: Icon,
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 active:scale-95';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:brightness-110 focus:ring-primary-500',
    secondary: 'bg-white/80 dark:bg-secondary-800/80 text-secondary-700 dark:text-secondary-200 border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700 hover:shadow-md focus:ring-secondary-500 backdrop-blur-sm',
    accent: 'bg-gradient-to-r from-accent-500 to-emerald-600 text-white shadow-md hover:shadow-lg hover:brightness-110 focus:ring-accent-500',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg hover:brightness-110 focus:ring-red-500',
    ghost: 'bg-transparent text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:ring-secondary-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm sm:text-base',
    lg: 'px-6 py-3 text-base sm:text-lg',
    icon: 'p-2',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon && (
        <Icon className={cn("h-5 w-5", children ? "mr-2" : "")} />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
