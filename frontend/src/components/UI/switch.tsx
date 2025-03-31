import React from "react";
import "../../styles/Switch.css";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div 
      className={`switch-container ${disabled ? 'disabled' : ''} ${className}`}
      onClick={handleClick}
      aria-checked={checked}
      role="switch"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={`switch ${checked ? 'active' : ''}`}>
        <div className="switch-thumb"></div>
      </div>
    </div>
  );
};

export { Switch };
