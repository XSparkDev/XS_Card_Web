import React, { SelectHTMLAttributes, forwardRef, ReactNode } from "react";
import "../../styles/Select.css";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, label, error, className = "", containerClassName = "", placeholder, ...props }, ref) => {
    return (
      <div className={`select-container ${containerClassName}`}>
        {label && <label className="select-label">{label}</label>}
        <div className="select-wrapper">
          <select ref={ref} className={`select-input ${error ? 'error' : ''} ${className}`} {...props}>
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="select-icon">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>
        {error && <div className="select-error">{error}</div>}
      </div>
    );
  }
);

Select.displayName = "Select";
