import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'white-outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-display font-bold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/30",
    secondary: "bg-secondary-100 text-primary-700 hover:bg-secondary-200",
    accent: "bg-accent-600 text-white hover:bg-accent-700 shadow-lg shadow-accent-600/30",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white",
    'white-outline': "border-2 border-white text-white hover:bg-white hover:text-primary-600",
    ghost: "text-slate-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-slate-300 dark:hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
