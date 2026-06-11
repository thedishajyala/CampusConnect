import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ 
  className, 
  type = 'text', 
  label, 
  error, 
  icon: Icon,
  fullWidth = true,
  ...props 
}, ref) => {
  return (
    <div className={cn("flex flex-col", fullWidth ? "w-full" : "")}>
      {label && (
        <label className="label-text" htmlFor={props.id}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-secondary-400 dark:text-secondary-500" />
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "input-field",
            Icon ? "pl-11" : "",
            error ? "border-red-300 dark:border-red-500/50 focus:ring-red-500/50 focus:border-red-500" : "",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 animate-fade-in flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
