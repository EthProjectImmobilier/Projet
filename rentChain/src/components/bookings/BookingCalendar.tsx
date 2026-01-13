// src/components/bookings/BookingCalendar.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface BookingCalendarProps {
  unavailableDates: string[];
  onDateRangeSelect: (checkIn: string, checkOut: string) => void;
  selectedCheckIn?: string;
  selectedCheckOut?: string;
  minNights?: number;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  unavailableDates,
  onDateRangeSelect,
  selectedCheckIn,
  selectedCheckOut,
  minNights = 1,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempCheckIn, setTempCheckIn] = useState<string | null>(selectedCheckIn || null);
  const [tempCheckOut, setTempCheckOut] = useState<string | null>(selectedCheckOut || null);

  // Convert unavailable dates string array to a Set of YYYY-MM-DD for faster lookup
  const unavailableSet = new Set(unavailableDates.map((date) => date.split('T')[0]));

  // Get the first day of the month and number of days
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Create array of days for the calendar grid
  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getDateString = (day: number): string => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString()
      .split('T')[0];
  };

  const isUnavailable = (day: number): boolean => {
    return unavailableSet.has(getDateString(day));
  };

  const isPast = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isInRange = (day: number): boolean => {
    if (!tempCheckIn || !tempCheckOut) return false;
    const dateStr = getDateString(day);
    const start = new Date(tempCheckIn);
    const end = new Date(tempCheckOut);
    const current = new Date(dateStr);
    return current > start && current < end;
  };

  const isCheckInDate = (day: number): boolean => {
    return tempCheckIn === getDateString(day);
  };

  const isCheckOutDate = (day: number): boolean => {
    return tempCheckOut === getDateString(day);
  };

  const handleDayClick = (day: number) => {
    const dateStr = getDateString(day);

    // Can't select past or unavailable dates
    if (isPast(day) || isUnavailable(day)) return;

    // If no check-in selected, select it
    if (!tempCheckIn) {
      setTempCheckIn(dateStr);
      return;
    }

    // If check-in selected but no check-out, select check-out
    if (!tempCheckOut) {
      const checkInDate = new Date(tempCheckIn);
      const selectedDate = new Date(dateStr);
      const diffDays = Math.floor((selectedDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      // Check minimum nights requirement
      if (diffDays < minNights) {
        setTempCheckIn(dateStr); // Reset and start over
        return;
      }

      // Check if any date in range is unavailable
      let hasUnavailable = false;
      for (let d = new Date(checkInDate); d <= selectedDate; d.setDate(d.getDate() + 1)) {
        if (unavailableSet.has(d.toISOString().split('T')[0])) {
          hasUnavailable = true;
          break;
        }
      }

      if (hasUnavailable) {
        return; // Can't select range with unavailable dates
      }

      setTempCheckOut(dateStr);
      onDateRangeSelect(tempCheckIn, dateStr);
      return;
    }

    // Both selected, reset and start new selection
    setTempCheckIn(dateStr);
    setTempCheckOut(null);
  };

  const handleClear = () => {
    setTempCheckIn(null);
    setTempCheckOut(null);
    onDateRangeSelect('', '');
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const formatDisplayDate = (dateStr: string | null) => {
    if (!dateStr) return 'Select date';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const calculateNights = () => {
    if (!tempCheckIn || !tempCheckOut) return 0;
    const start = new Date(tempCheckIn);
    const end = new Date(tempCheckOut);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Select Dates</CardTitle>
          {(tempCheckIn || tempCheckOut) && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Dates Display */}
        <div className="grid grid-cols-2 gap-2 bg-muted/50 p-3 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Check-in</p>
            <p className="text-sm font-semibold">{formatDisplayDate(tempCheckIn)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Check-out</p>
            <p className="text-sm font-semibold">{formatDisplayDate(tempCheckOut)}</p>
          </div>
        </div>

        {/* Nights Display */}
        {calculateNights() > 0 && (
          <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">
              {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-sm font-semibold">{monthName}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, index) => (
            <div key={index}>
              {day === null ? (
                <div className="aspect-square"></div>
              ) : (
                <button
                  onClick={() => handleDayClick(day)}
                  disabled={isPast(day) || isUnavailable(day)}
                  className={`
                    w-full aspect-square flex items-center justify-center rounded text-xs font-medium
                    transition-all duration-150 relative
                    ${isPast(day) || isUnavailable(day)
                      ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      : isCheckInDate(day) || isCheckOutDate(day)
                      ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700'
                      : isInRange(day)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-foreground'
                      : 'hover:bg-muted text-foreground cursor-pointer'
                    }
                  `}
                >
                  {day}
                  {(isCheckInDate(day) || isCheckOutDate(day)) && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded"></div>
            <span className="text-muted-foreground">In range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted rounded"></div>
            <span className="text-muted-foreground">Unavailable</span>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          {tempCheckIn && tempCheckOut
            ? 'Dates selected'
            : tempCheckIn
            ? 'Click a checkout date'
            : 'Click to select dates'}
        </p>
      </CardContent>
    </Card>
  );
};
