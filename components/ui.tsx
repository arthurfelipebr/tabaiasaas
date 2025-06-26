import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseStyles = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-150 ease-in-out inline-flex items-center justify-center";
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  const variantStyles = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
    secondary: "bg-secondary-200 hover:bg-secondary-300 dark:bg-secondary-700 dark:hover:bg-secondary-600 text-secondary-800 dark:text-secondary-100 focus:ring-secondary-500",
    danger: "bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-400",
    ghost: "bg-transparent hover:bg-secondary-100 dark:hover:bg-secondary-800 text-primary-600 dark:text-primary-400 focus:ring-primary-500",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-2" />}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, id, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        <input
          id={id}
          className={`block w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md shadow-sm placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 ${icon ? 'pl-10' : ''} ${className} ${error ? 'border-accent-500 focus:ring-accent-500 focus:border-accent-500' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-accent-600 dark:text-accent-400">{error}</p>}
    </div>
  );
};


interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}
export const Card: React.FC<CardProps> = ({ children, className = '', glass = false, ...props }) => {
  const glassStyles = glass ? "glassmorphism" : "bg-white dark:bg-secondary-800 shadow-lg";
  return (
    <div className={`${glassStyles} rounded-xl p-4 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string; // Tailwind color class e.g., text-primary-500
}
export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', color }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  const colorClass = color || 'text-primary-600 dark:text-primary-400';

  return (
    <svg 
      className={`animate-spin ${sizeClasses[size]} ${colorClass} ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
};

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  children?: React.ReactNode; // Added children prop
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', message, children, onClose }) => {
  const baseClasses = "p-4 mb-4 text-sm rounded-lg";
  const typeClasses = {
    success: "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300",
    error: "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300",
    warning: "bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300",
    info: "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300",
  };

  if (!message && !children) return null; // Return null if no message and no children

  return (
    <div className={`${baseClasses} ${typeClasses[type]} flex justify-between items-start`} role="alert">
      <div className="flex-grow">
        {message && <span>{message}</span>}
        {children && <div className={message ? "mt-2" : ""}>{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          className="-mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg p-1.5 focus:ring-2"
          onClick={onClose}
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};