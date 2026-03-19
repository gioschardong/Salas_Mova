'use client'

import { ROOMS, SHIFTS, type ShiftKey, type Booking } from '@/lib/booking-service'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

interface RoomGridProps {
  date: string
  getSlotBooking: (roomId: number, date: string, shift: ShiftKey) => Booking | undefined
  onSlotClick: (roomId: number, shift: ShiftKey, booking?: Booking) => void
}

export function RoomGrid({ date, getSlotBooking, onSlotClick }: RoomGridProps) {
  const shifts = Object.entries(SHIFTS) as [ShiftKey, typeof SHIFTS[ShiftKey]][]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 px-1">
        <div className="col-span-1" />
        {shifts.map(([key, shift]) => (
          <div key={key} className="text-center">
            <div className="text-xs font-medium text-foreground">{shift.label}</div>
            <div className="text-[10px] text-muted-foreground">{shift.time}</div>
          </div>
        ))}
      </div>

      {ROOMS.map((room) => (
        <div key={room.id} className="grid grid-cols-4 gap-2 items-center">
          <div className="font-medium text-sm text-foreground pl-1">{room.name}</div>
          {shifts.map(([shiftKey]) => {
            const booking = getSlotBooking(room.id, date, shiftKey)
            const isBooked = !!booking
            
            return (
              <button
                key={`${room.id}-${shiftKey}`}
                onClick={() => onSlotClick(room.id, shiftKey, booking)}
                className={cn(
                  'h-14 rounded-lg flex items-center justify-center transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  'active:scale-95',
                  isBooked 
                    ? 'bg-destructive/15 border-2 border-destructive/30 text-destructive' 
                    : 'bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/25'
                )}
              >
                {isBooked ? (
                  <div className="flex flex-col items-center">
                    <X className="h-4 w-4" />
                    <span className="text-[10px] mt-0.5 font-medium truncate max-w-[60px]">
                      {booking.responsibleName.split(' ')[0]}
                    </span>
                  </div>
                ) : (
                  <Check className="h-5 w-5" />
                )}
              </button>
            )
          })}
        </div>
      ))}

      <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-emerald-500/15 border border-emerald-500/30" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-destructive/15 border border-destructive/30" />
          <span>Reservado</span>
        </div>
      </div>
    </div>
  )
}
