'use client'

import { useState } from 'react'
import { CalendarDays, ClipboardList } from 'lucide-react'
import { DatePicker } from '@/components/date-picker'
import { RoomGrid } from '@/components/room-grid'
import { BookingModal } from '@/components/booking-modal'
import { BookingHistory } from '@/components/booking-history'
import { toast } from '@/hooks/use-toast'
import { useBookings } from '@/hooks/use-bookings'
import { BookingServiceError, type ShiftKey, type Booking } from '@/lib/booking-service'
import { cn } from '@/lib/utils'

type Tab = 'schedule' | 'history'

function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('schedule')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    roomId: number
    shift: ShiftKey
    booking?: Booking
  } | null>(null)

  const {
    bookings,
    isLoading,
    refresh,
    getSlotBooking,
    createBooking,
    deleteBooking,
  } = useBookings()

  const dateString = getLocalDateString(selectedDate)

  const handleSlotClick = (roomId: number, shift: ShiftKey, booking?: Booking) => {
    setModalState({ isOpen: true, roomId, shift, booking })
  }

  const handleConfirmBooking = async (data: { responsibleName: string; description?: string }) => {
    if (!modalState) return

    try {
      await createBooking({
        roomId: modalState.roomId,
        date: dateString,
        shift: modalState.shift,
        responsibleName: data.responsibleName,
        description: data.description,
      })
      setModalState(null)
    } catch (error) {
      if (error instanceof BookingServiceError && error.status === 409) {
        await refresh()
        setModalState(null)
      }

      toast({
        title: 'Não foi possível criar a reserva',
        description:
          error instanceof BookingServiceError && error.status === 409
            ? 'Esse horário acabou de ser reservado por outra pessoa. A agenda foi atualizada.'
            : error instanceof Error
              ? error.message
              : 'Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteBooking = async () => {
    if (!modalState?.booking) return

    try {
      await deleteBooking(modalState.booking.id)
      setModalState(null)
    } catch (error) {
      toast({
        title: 'Não foi possível cancelar a reserva',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold text-center">Clínica Mova</h1>
          <p className="text-xs text-primary-foreground/80 text-center mt-0.5">
            Agendamento de Salas
          </p>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="px-4 py-4 max-w-lg mx-auto">
        {activeTab === 'schedule' ? (
          <div className="space-y-6">
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Disponibilidade em{' '}
                <span className="text-foreground">
                  {selectedDate.toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </h2>
              <div className="bg-card rounded-xl p-4 border border-border">
                <RoomGrid
                  date={dateString}
                  getSlotBooking={getSlotBooking}
                  onSlotClick={handleSlotClick}
                />
              </div>
            </div>
          </div>
        ) : (
          <BookingHistory
            bookings={bookings}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground border-t border-primary/80 px-4 py-2 safe-area-pb">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('schedule')}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-6 rounded-xl transition-colors',
              activeTab === 'schedule'
                ? 'bg-primary-foreground/12 text-primary-foreground'
                : 'text-primary-foreground/75 hover:text-primary-foreground'
            )}
          >
            <CalendarDays className="h-6 w-6" />
            <span className="text-xs font-medium">Agendar</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-6 rounded-xl transition-colors',
              activeTab === 'history'
                ? 'bg-primary-foreground/12 text-primary-foreground'
                : 'text-primary-foreground/75 hover:text-primary-foreground'
            )}
          >
            <ClipboardList className="h-6 w-6" />
            <span className="text-xs font-medium">Registros</span>
          </button>
        </div>
      </nav>

      {/* Modal de Reserva */}
      {modalState && (
        <BookingModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState(null)}
          roomId={modalState.roomId}
          shift={modalState.shift}
          date={dateString}
          existingBooking={modalState.booking}
          onConfirm={handleConfirmBooking}
          onDelete={modalState.booking ? handleDeleteBooking : undefined}
        />
      )}
    </main>
  )
}
