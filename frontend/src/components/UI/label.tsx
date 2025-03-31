import React from "react";
import "../../styles/Label.css";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`label ${disabled ? 'disabled' : ''} ${required ? 'required' : ''} ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export { Label };
