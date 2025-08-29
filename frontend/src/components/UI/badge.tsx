import { ReactNode } from 'react';
import "../../styles/Badge.css";

// Define badge variants
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

// Badge props interface
interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  className?: string;
}

function Badge({ 
  children, 
  variant = 'default', 
  style,
  textStyle,
  className = ""
}: BadgeProps) {
  // Get styles based on variant
  const getVariantStyles = (): { container: React.CSSProperties, text: React.CSSProperties } => {
    switch (variant) {
      case 'default':
        return {
          container: {
            backgroundColor: 'var(--color-primary)',
            borderColor: 'transparent',
          },
          text: {
            color: '#fff',
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: '#f1f5f9', // Light gray
            borderColor: 'transparent',
          },
          text: {
            color: '#64748b', // Slate gray
          },
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: '#ef4444', // Red
            borderColor: 'transparent',
          },
          text: {
            color: '#fff',
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: '#e2e8f0', // Light border
          },
          text: {
            color: '#0f172a', // Dark text
          },
        };
      default:
        return {
          container: {
            backgroundColor: 'var(--color-primary)',
            borderColor: 'transparent',
          },
          text: {
            color: '#fff',
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div 
      className={`badge badge-${variant} ${className}`}
      style={{
        ...variantStyles.container,
        ...style,
      }}
    >
      {typeof children === 'string' ? (
        <span 
          className="badge-text"
          style={{
            ...variantStyles.text,
            ...textStyle
          }}
        >
          {children}
        </span>
      ) : (
        children
      )}
    </div>
  );
}

export { Badge };
