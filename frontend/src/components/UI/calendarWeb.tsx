import React, { useState } from 'react';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  events?: Date[];
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  events = [],
  className = ''
}) => {
  const [currentMonth] = useState(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(selectedDate || null);

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Simple calendar days generation
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        hasEvents: false,
        isPast: date < new Date()
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const today = new Date();
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        hasEvents: events.some(event => event.toDateString() === date.toDateString()),
        isPast: date < today
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        hasEvents: false,
        isPast: date < new Date()
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleDateSelect = (date: Date) => {
    setInternalSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const isDateSelected = (date: Date) => {
    if (!internalSelectedDate) return false;
    return date.toDateString() === internalSelectedDate.toDateString();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className={`calendar-container ${className}`}>
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
            isDisabled ? 'calendar-disabled' : '',
            day.isCurrentMonth && day.isPast ? 'calendar-past-day' : '',
            day.hasEvents ? 'calendar-day-with-events' : ''
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
};

Calendar.displayName = "Calendar";

export default Calendar;
