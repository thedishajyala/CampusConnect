import { cn } from '../../utils/cn';

export const Card = ({ children, className, hover = false, glass = true, ...props }) => {
  return (
    <div 
      className={cn(
        "rounded-2xl border overflow-hidden transition-all duration-300",
        glass ? "bg-white/70 dark:bg-secondary-800/60 backdrop-blur-xl border-white/40 dark:border-secondary-700/50 shadow-xl" : "bg-white dark:bg-secondary-800 border-secondary-200 shadow-md",
        hover && "cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:border-primary-300 dark:hover:border-primary-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn("px-6 py-5 border-b border-secondary-100 dark:border-secondary-700/50", className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={cn("text-xl font-bold text-secondary-900 dark:text-white", className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn("text-sm text-secondary-500 dark:text-secondary-400 mt-1", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div className={cn("px-6 py-4 bg-secondary-50/50 dark:bg-secondary-800/30 border-t border-secondary-100 dark:border-secondary-700/50 flex items-center", className)} {...props}>
      {children}
    </div>
  );
};
