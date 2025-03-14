'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'summarize' | 'delete';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  title?: string;
}

const variantStyles = {
  primary: 'bg-[#4CAF50] hover:bg-[#2E7D32] text-white',
  secondary:
    'border-2 border-[#4CAF50] bg-[#F5F1E9] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white',
  summarize: 'bg-[#64B5F6] hover:bg-[#42A5F5] text-white',
  delete: 'bg-[#EF5350] hover:bg-[#E53935] text-white',
};

const sizeStyles = {
  sm: 'px-3 py-1.5',
  md: 'px-3 py-2',
  lg: 'px-4 py-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  title,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        flex items-center justify-center rounded-lg transition-colors
        disabled:cursor-not-allowed disabled:opacity-50
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled}
      title={title}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
