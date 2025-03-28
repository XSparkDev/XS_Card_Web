import React, { forwardRef } from 'react';
import "../../styles/Input.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  inputClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    containerClassName, 
    inputClassName, 
    leftIcon, 
    rightIcon, 
    error = false,
    errorMessage,
    className,
    style,
    ...props 
  }, ref) => {
    const inputClasses = [
      'input',
      leftIcon ? 'input-with-left-icon' : '',
      rightIcon ? 'input-with-right-icon' : '',
      error ? 'input-error' : '',
      inputClassName,
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={`input-container ${containerClassName || ''} ${error ? 'container-error' : ''}`}>
        {leftIcon && <div className="input-icon-left">{leftIcon}</div>}
        <input
          className={inputClasses}
          ref={ref}
          style={style}
          {...props}
        />
        {rightIcon && <div className="input-icon-right">{rightIcon}</div>}
        {error && errorMessage && <div className="input-error-message">{errorMessage}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;
