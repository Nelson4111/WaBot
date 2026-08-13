import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'black' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'brutal-btn brutal-btn-primary',
  secondary: 'brutal-btn brutal-btn-secondary',
  outline: 'brutal-btn brutal-btn-outline',
  black: 'brutal-btn brutal-btn-black',
  danger: 'brutal-btn brutal-btn-danger',
  ghost: 'inline-flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer bg-transparent border-none px-3 py-2 rounded-lg hover:bg-black/5 transition-colors',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'brutal-btn-sm',
  md: '',
  lg: 'brutal-btn-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconRight,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
        </svg>
      )}
      {!loading && icon && <span>{icon}</span>}
      {children}
      {iconRight && <span>{iconRight}</span>}
    </button>
  );
}

export default Button;
