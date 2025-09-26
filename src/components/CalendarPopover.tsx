import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from './ui/Calendar';
import { Button } from './ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '../lib/utils';

interface CalendarPopoverProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: (date: Date) => boolean;
}

export function CalendarPopover({
  selectedDate,
  onDateSelect,
  placeholder = "Select date",
  className,
  disabled
}: CalendarPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (date: Date) => {
    onDateSelect?.(date);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
