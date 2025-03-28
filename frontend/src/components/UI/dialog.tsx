import React, { useState, useEffect, ReactNode, useRef } from 'react';
import "../../styles/Dialog.css";

// Dialog Context for state management
const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

// Root Dialog component
interface DialogProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Dialog({ 
  children, 
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

// Dialog Trigger component
interface DialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

function DialogTrigger({ children, asChild = false }: DialogTriggerProps) {
  const { setOpen } = React.useContext(DialogContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen(true),
    } as React.HTMLAttributes<HTMLElement>);
  }
  
  return (
    <button 
      type="button" 
      className="dialog-trigger" 
      onClick={() => setOpen(true)}
    >
      {children}
    </button>
  );
}

// Dialog Content component
interface DialogContentProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function DialogContent({ children, className, style }: DialogContentProps) {
  const { open, setOpen } = React.useContext(DialogContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const [animationClass, setAnimationClass] = useState('');
  
  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, setOpen]);
  
  // Manage focus when dialog opens
  useEffect(() => {
    if (open) {
      // Prevent scrolling on the body when dialog is open
      document.body.style.overflow = 'hidden';
      
      // Set focus inside dialog
      const focusableElements = contentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
      
      setAnimationClass('dialog-content-open');
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
      setAnimationClass('dialog-content-closed');
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  
  if (!open) return null;
  
  return (
    <div className="dialog-backdrop" onClick={() => setOpen(false)}>
      <div 
        ref={contentRef}
        className={`dialog-content ${animationClass} ${className || ''}`}
        style={style}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
        <button 
          className="dialog-close-button"
          onClick={() => setOpen(false)}
          aria-label="Close dialog"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Dialog Header component
interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function DialogHeader({ children, className, style }: DialogHeaderProps) {
  return (
    <div className={`dialog-header ${className || ''}`} style={style}>
      {children}
    </div>
  );
}

// Dialog Footer component
interface DialogFooterProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function DialogFooter({ children, className, style }: DialogFooterProps) {
  return (
    <div className={`dialog-footer ${className || ''}`} style={style}>
      {children}
    </div>
  );
}

// Dialog Title component
interface DialogTitleProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function DialogTitle({ children, className, style }: DialogTitleProps) {
  return (
    <h2 className={`dialog-title ${className || ''}`} style={style}>
      {children}
    </h2>
  );
}

// Dialog Description component
interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function DialogDescription({ children, className, style }: DialogDescriptionProps) {
  return (
    <p className={`dialog-description ${className || ''}`} style={style}>
      {children}
    </p>
  );
}

// Dialog Close component
interface DialogCloseProps {
  children: ReactNode;
  asChild?: boolean;
}

function DialogClose({ children, asChild = false }: DialogCloseProps) {
  const { setOpen } = React.useContext(DialogContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen(false),
    } as React.HTMLAttributes<HTMLElement>);
  }
  
  return (
    <button 
      type="button" 
      className="dialog-close" 
      onClick={() => setOpen(false)}
    >
      {children}
    </button>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
