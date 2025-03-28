import { useState } from 'react';
import '../../styles/Calendar.css';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  initialMonth?: Date;
  className?: string;
}

export function Calendar({
  onDateSelect,
  selectedDate,
  minDate,
  maxDate,
  initialMonth = new Date(),
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [internalSelectedDate, setInternalSelectedDate] = useState(selectedDate);
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Previous month days to show
    const prevMonthDays = [];
    if (firstDayOfMonth > 0) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
      
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        prevMonthDays.push({
          date: new Date(prevMonthYear, prevMonth, daysInPrevMonth - i),
          isCurrentMonth: false,
          isToday: false,
        });
      }
    }
    
    // Current month days
    const currentMonthDays = [];
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      currentMonthDays.push({
        date,
        isCurrentMonth: true,
        isToday: 
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
      });
    }
    
    // Next month days to fill the calendar
    const nextMonthDays = [];
    const totalDaysShown = prevMonthDays.length + currentMonthDays.length;
    const daysToAdd = 42 - totalDaysShown; // 6 rows of 7 days
    
    if (daysToAdd > 0) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextMonthYear = month === 11 ? year + 1 : year;
      
      for (let i = 1; i <= daysToAdd; i++) {
        nextMonthDays.push({
          date: new Date(nextMonthYear, nextMonth, i),
          isCurrentMonth: false,
          isToday: false,
        });
      }
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  // Handle month navigation
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setInternalSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };
  
  // Check if a date is selected
  const isDateSelected = (date: Date) => {
    if (!internalSelectedDate) return false;
    
    return (
      date.getDate() === internalSelectedDate.getDate() &&
      date.getMonth() === internalSelectedDate.getMonth() &&
      date.getFullYear() === internalSelectedDate.getFullYear()
    );
  };
  
  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };
  
  // Format month name
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Generate calendar days
  const calendarDays = generateCalendarDays();
  
  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className={`calendar-container ${className || ''}`}>
      {/* Header with month navigation */}
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="calendar-nav-button">
          <span className="calendar-chevron">←</span> {/* Left chevron */}
        </button>
        
        <span className="calendar-month-year">{formatMonthYear(currentMonth)}</span>
        
        <button onClick={goToNextMonth} className="calendar-nav-button">
          <span className="calendar-chevron">→</span> {/* Right chevron */}
        </button>
      </div>
      
      {/* Day names row */}
      <div className="calendar-day-names">
        {dayNames.map((day, index) => (
          <span key={index} className="calendar-day-name">
            {day}
          </span>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          const isSelected = isDateSelected(day.date);
          const isDisabled = isDateDisabled(day.date);
          
          const dayClasses = [
            'calendar-day',
            !day.isCurrentMonth ? 'calendar-outside-month' : '',
            day.isToday ? 'calendar-today' : '',
            isSelected ? 'calendar-selected' : '',
            isDisabled ? 'calendar-disabled' : ''
          ].filter(Boolean).join(' ');
          
          return (
            <button
              key={index}
              className={dayClasses}
              onClick={() => !isDisabled && handleDateSelect(day.date)}
              disabled={isDisabled}
              type="button"
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";
