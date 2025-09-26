import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
}

export function Calendar({ 
  selectedDate, 
  onDateSelect, 
  className,
  disabled 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Get days from previous month to fill the grid
  const prevMonth = new Date(year, month - 1, 0);
  const daysFromPrevMonth = firstDayOfWeek;
  
  // Get days from next month to fill the grid
  const totalCells = 42; // 6 weeks * 7 days
  const daysFromNextMonth = totalCells - (daysFromPrevMonth + daysInMonth);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };
  
  const handleDateClick = (date: Date) => {
    if (disabled && disabled(date)) return;
    onDateSelect?.(date);
  };
  
  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const isDateDisabled = (date: Date) => {
    if (disabled) return disabled(date);
    return date < today;
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push(
        <button
          key={`prev-${i}`}
          className="text-gray-400 hover:bg-gray-100 rounded-lg p-2 text-sm"
          disabled
        >
          {date.getDate()}
        </button>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = isDateSelected(date);
      const isTodayDate = isToday(date);
      const isDisabled = isDateDisabled(date);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isDisabled}
          className={cn(
            "relative p-2 text-sm rounded-lg transition-all duration-200 hover:bg-gray-100",
            isSelected && "bg-blue-600 text-white hover:bg-blue-700",
            isTodayDate && !isSelected && "bg-blue-100 text-blue-700 font-semibold",
            isDisabled && "text-gray-300 cursor-not-allowed hover:bg-transparent",
            !isSelected && !isTodayDate && !isDisabled && "text-gray-700 hover:bg-gray-100"
          )}
        >
          {day}
        </button>
      );
    }
    
    // Next month days
    for (let day = 1; day <= daysFromNextMonth; day++) {
      const date = new Date(year, month + 1, day);
      days.push(
        <button
          key={`next-${day}`}
          className="text-gray-400 hover:bg-gray-100 rounded-lg p-2 text-sm"
          disabled
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className={cn("bg-white rounded-lg shadow-lg border border-gray-200 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>
      
      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
}
