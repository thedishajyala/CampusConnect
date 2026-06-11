import { cn } from '../../utils/cn';

export const Badge = ({ children, variant = 'default', className, ...props }) => {
  const variants = {
    default: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200 border-secondary-200 dark:border-secondary-700',
    primary: 'bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300 border-primary-200 dark:border-primary-800',
    success: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    danger: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  return (
    <span className={cn("badge", variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
