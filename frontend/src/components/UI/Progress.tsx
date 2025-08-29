import React from "react";
import "../../styles/Progress.css";

interface ProgressProps {
  value?: number;
  style?: React.CSSProperties;
  backgroundColor?: string;
  progressColor?: string;
  height?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, style, backgroundColor, progressColor, height = 8, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className="progress-container"
        style={{
          height: `${height}px`,
          backgroundColor: backgroundColor || '#e2e8f0',
          ...style
        }}
        {...props}
      >
        <div
          className="progress-indicator"
          style={{
            width: `${value}%`,
            backgroundColor: progressColor || 'var(--color-primary)'
          }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
