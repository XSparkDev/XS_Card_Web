import React, { useState, useEffect, useRef, ReactNode } from 'react';
import '../../styles/Popover.css';

// Popover Context for state management
const PopoverContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement> | null;
  setTriggerRef: (ref: React.RefObject<HTMLElement>) => void;
}>({
  open: false,
  setOpen: () => {},
  triggerRef: null,
  setTriggerRef: () => {},
});

// Types for alignment
type PopoverAlign = 'start' | 'center' | 'end';
type PopoverSide = 'top' | 'right' | 'bottom' | 'left';

// Root Popover component
interface PopoverProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ 
  children, 
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [triggerRef, setTriggerRef] = useState<React.RefObject<HTMLElement> | null>(null);
  
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  
  return (
    <PopoverContext.Provider value={{ 
      open: isOpen, 
      setOpen, 
      triggerRef, 
      setTriggerRef 
    }}>
      {children}
    </PopoverContext.Provider>
  );
}

// Popover Trigger component
interface PopoverTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export function PopoverTrigger({ children, asChild = false }: PopoverTriggerProps) {
  const { setOpen, setTriggerRef } = React.useContext(PopoverContext);
  const ref = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      setTriggerRef(ref as unknown as React.RefObject<HTMLElement>);
    }
  }, [setTriggerRef]);
  
  const handleClick = () => {
    setOpen(true);
  };
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      ref: (node: HTMLElement) => {
        // This handles forwarding refs
        const originalRef = (children as any).ref;
        if (originalRef) {
          if (typeof originalRef === 'function') {
            originalRef(node);
          } else {
            originalRef.current = node;
          }
        }
        if (node) {
          ref.current = node as unknown as HTMLButtonElement;
          setTriggerRef(ref as unknown as React.RefObject<HTMLElement>);
        }
      },
    } as React.HTMLAttributes<HTMLElement>);
  }
  
  return (
    <button 
      type="button"
      className="popover-trigger"
      onClick={handleClick}
      ref={ref}
    >
      {children}
    </button>
  );
}

// Popover Content component
interface PopoverContentProps {
  children: ReactNode;
  align?: PopoverAlign;
  side?: PopoverSide;
  sideOffset?: number;
  alignOffset?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PopoverContent({ 
  children, 
  align = 'center', 
  side = 'bottom',
  sideOffset = 4,
  alignOffset = 0,
  className,
  style 
}: PopoverContentProps) {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [animationClass, setAnimationClass] = useState('');
  
  // Calculate position when open changes or when elements resize
  useEffect(() => {
    if (open && triggerRef?.current && contentRef.current) {
      const updatePosition = () => {
        const triggerRect = triggerRef.current!.getBoundingClientRect();
        const contentRect = contentRef.current!.getBoundingClientRect();
        
        let top = 0;
        let left = 0;
        
        // Calculate vertical position
        switch (side) {
          case 'top':
            top = triggerRect.top - contentRect.height - sideOffset;
            break;
          case 'bottom':
            top = triggerRect.bottom + sideOffset;
            break;
          case 'left':
          case 'right':
            // Center vertically for left/right
            top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
            break;
        }
        
        // Calculate horizontal position
        switch (side) {
          case 'left':
            left = triggerRect.left - contentRect.width - sideOffset;
            break;
          case 'right':
            left = triggerRect.right + sideOffset;
            break;
          case 'top':
          case 'bottom':
            // Align horizontally based on align prop
            switch (align) {
              case 'start':
                left = triggerRect.left + alignOffset;
                break;
              case 'center':
                left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
                break;
              case 'end':
                left = triggerRect.right - contentRect.width - alignOffset;
                break;
            }
            break;
        }
        
        // Ensure the popover stays within viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < 10) left = 10;
        if (left + contentRect.width > viewportWidth - 10) {
          left = viewportWidth - contentRect.width - 10;
        }
        if (top < 10) top = 10;
        if (top + contentRect.height > viewportHeight - 10) {
          top = viewportHeight - contentRect.height - 10;
        }
        
        // Adjust for scroll position
        top += window.scrollY;
        left += window.scrollX;
        
        setPosition({ top, left });
      };
      
      updatePosition();
      setAnimationClass('animate-in');
      
      // Update position on resize
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    } else {
      setAnimationClass('animate-out');
    }
  }, [open, triggerRef, side, align, sideOffset, alignOffset]);
  
  // Handle clicks outside to close the popover
  useEffect(() => {
    if (open) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          contentRef.current && 
          triggerRef?.current && 
          !contentRef.current.contains(event.target as Node) &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, setOpen, triggerRef]);
  
  // Handle ESC key to close
  useEffect(() => {
    if (open) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false);
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, setOpen]);
  
  if (!open) return null;
  
  return (
    <>
      <div className="popover-overlay" onClick={() => setOpen(false)} />
      <div
        ref={contentRef}
        className={`popover-content ${animationClass} ${className || ''}`}
        style={{
          ...style,
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        role="dialog"
        data-side={side}
        data-align={align}
      >
        {children}
        
        <div className="popover-arrow"></div>
      </div>
    </>
  );
}
