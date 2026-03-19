'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate()
  
  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  ).getDay()

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + delta)
    newDate.setDate(1)
    onDateChange(newDate)
  }

  const selectDay = (day: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    onDateChange(newDate)
  }

  const isToday = (day: number) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    return date.getTime() === today.getTime()
  }

  const isSelected = (day: number) => {
    return day === selectedDate.getDate()
  }

  const isPast = (day: number) => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
    return date < today
  }

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changeMonth(-1)}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-foreground">
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => changeMonth(1)}
          className="h-9 w-9"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          return (
            <button
              key={day}
              onClick={() => selectDay(day)}
              disabled={isPast(day)}
              className={cn(
                'h-10 w-full rounded-lg text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected(day) && 'bg-primary text-primary-foreground',
                !isSelected(day) && isToday(day) && 'bg-accent text-accent-foreground ring-1 ring-primary',
                !isSelected(day) && !isToday(day) && !isPast(day) && 'hover:bg-accent text-foreground',
                isPast(day) && 'text-muted-foreground/50 cursor-not-allowed'
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
