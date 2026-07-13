import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-white/80">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={clsx(
          'w-full px-3.5 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 rounded-lg text-sm text-white',
          'bg-white/5 border transition-all duration-200',
          'placeholder:text-white/30',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
          error
            ? 'border-red-500/50 focus:ring-red-500/50'
            : 'border-white/10 focus:border-emerald-500/50',
          className
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-white/40">{helperText}</p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-white/80">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={clsx(
          'w-full px-3.5 py-2.5 rounded-lg text-sm text-white',
          'bg-gray-800 border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
          error
            ? 'border-red-500/50 focus:ring-red-500/50'
            : 'border-white/10 focus:border-emerald-500/50',
          className
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const textareaId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        {...props}
        className={clsx(
          'w-full px-3.5 py-2.5 rounded-lg text-sm text-white',
          'bg-white/5 border transition-all duration-200',
          'placeholder:text-white/30 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
          error
            ? 'border-red-500/50 focus:ring-red-500/50'
            : 'border-white/10 focus:border-emerald-500/50',
          className
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
