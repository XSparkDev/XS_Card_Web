import React from 'react';
import "../../styles/Button.css";

// Define variants and sizes similar to the native version
export type ButtonVariant = 
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

// Props interface
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  children,
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  className,
  onClick,
  ...props
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-size-${size}`,
    disabled && 'btn-disabled',
    isLoading && 'btn-loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      style={style}
      {...props}
    >
      <div className="btn-content">
        {isLoading ? (
          <div className="btn-spinner"></div>
        ) : (
          <>
            {leftIcon && <div className="btn-icon btn-icon-left">{leftIcon}</div>}
            {typeof children === 'string' ? (
              <span className="btn-text" style={textStyle}>{children}</span>
            ) : (
              children
            )}
            {rightIcon && <div className="btn-icon btn-icon-right">{rightIcon}</div>}
          </>
        )}
      </div>
    </button>
  );
};

export default Button;
