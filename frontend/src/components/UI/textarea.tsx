import React, { forwardRef } from 'react';
import "../../styles/Textarea.css";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  error?: boolean;
  errorMessage?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    containerClassName, 
    error, 
    errorMessage, 
    style,
    rows = 4,
    ...props 
  }, ref) => {
    const textareaClasses = [
      'textarea',
      error ? 'textarea-error' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={`textarea-container ${containerClassName || ''}`}>
        <textarea
          ref={ref}
          className={textareaClasses}
          rows={rows}
          style={style}
          {...props}
        />
        {error && errorMessage && (
          <div className="textarea-error-container">
            <p className="textarea-error-text">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
