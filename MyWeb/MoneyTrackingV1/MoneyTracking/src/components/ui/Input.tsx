import React from 'react';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export function Input({ label, error, icon, iconRight, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-700 text-[#111] mb-1.5 font-semibold">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">
            {icon}
          </div>
        )}
        <input
          className={`brutal-input ${icon ? 'pl-10' : ''} ${iconRight ? 'pr-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]">
            {iconRight}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export function SearchInput({ onClear, className = '', value, ...props }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
      <input
        className={`brutal-input pl-9 pr-9 ${className}`}
        value={value}
        {...props}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#111] w-4 h-4 flex items-center justify-center"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[#111] mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`brutal-input appearance-none cursor-pointer ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export default Input;
