import React, { createContext, useContext, useState, forwardRef, KeyboardEvent } from 'react';
import "../../styles/Tabs.css";

// Context for managing tab state
type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Hook to use tabs context
const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
};

// Tabs (Root) component
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(({
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  className,
  children,
  ...props
}, ref) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;
  
  const onValueChange = (value: string) => {
    if (isControlled) {
      controlledOnValueChange?.(value);
    } else {
      setUncontrolledValue(value);
    }
  };
  
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange }}>
      <div ref={ref} className={`tabs ${className || ''}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});
Tabs.displayName = "Tabs";

// TabsList component
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(({ className, children, ...props }, ref) => {
  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabsListElement = e.currentTarget;
    const tabs = Array.from(tabsListElement.querySelectorAll('[role="tab"]'));
    const currentIndex = tabs.findIndex(tab => tab === document.activeElement);

    if (currentIndex === -1) return;

    let nextIndex: number;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      default:
        return;
    }

    (tabs[nextIndex] as HTMLElement).focus();
    e.preventDefault();
  };

  return (
    <div
      ref={ref}
      role="tablist"
      className={`tabs-list ${className || ''}`}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  );
});
TabsList.displayName = "TabsList";

// TabsTrigger component
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  className?: string;
  activeClassName?: string;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(({
  value,
  disabled = false,
  className,
  activeClassName,
  children,
  ...props
}, ref) => {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isActive = selectedValue === value;
  
  const tabClasses = [
    'tabs-trigger',
    isActive ? 'tabs-trigger-active' : '',
    className || '',
    isActive && activeClassName ? activeClassName : ''
  ].filter(Boolean).join(' ');
  
  return (
    <button
      ref={ref}
      role="tab"
      type="button"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      className={tabClasses}
      onClick={() => onValueChange(value)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

// TabsContent component
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(({
  value,
  className,
  children,
  ...props
}, ref) => {
  const { value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;
  
  if (!isSelected) return null;
  
  return (
    <div
      ref={ref}
      role="tabpanel"
      tabIndex={0}
      className={`tabs-content ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
