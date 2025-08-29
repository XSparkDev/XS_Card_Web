import React, { TextareaHTMLAttributes, forwardRef } from "react";
import "../../styles/Textarea.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  className?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", containerClassName = "", ...props }, ref) => {
    return (
      <div className={`textarea-container ${containerClassName}`}>
        <textarea 
          ref={ref} 
          className={`textarea-input ${error ? 'error' : ''} ${className}`} 
          {...props} 
        />
        {error && <div className="textarea-error">{error}</div>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
