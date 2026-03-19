'use client'

import { useState, useMemo, useEffect } from 'react'
import { CalendarDays, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROOMS, SHIFTS, type Booking } from '@/lib/booking-service'
import { cn } from '@/lib/utils'

interface BookingHistoryProps {
  bookings: Booking[]
}

const ITEMS_PER_PAGE = 10

export function BookingHistory({ bookings }: BookingHistoryProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredBookings = useMemo(() => {
    let filtered = [...bookings]
    
    if (startDate) {
      filtered = filtered.filter((b) => b.date >= startDate)
    }
    if (endDate) {
      filtered = filtered.filter((b) => b.date <= endDate)
    }
    if (selectedRoom !== null) {
      filtered = filtered.filter((b) => b.roomId === selectedRoom)
    }
    
    // Ordenar por criação do registro (mais recente primeiro)
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    
    return filtered
  }, [bookings, startDate, endDate, selectedRoom])

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE))
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [startDate, endDate, selectedRoom])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
    setSelectedRoom(null)
    setCurrentPage(1)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCreatedAt = (dateTimeStr: string) => {
    return new Date(dateTimeStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hasActiveFilters = startDate || endDate || selectedRoom !== null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Histórico de Reservas</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(hasActiveFilters && 'border-primary text-primary')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {[startDate, endDate, selectedRoom].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="bg-card rounded-xl p-4 border border-border space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Data Início</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Data Fim</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Sala</label>
            <div className="flex flex-wrap gap-2">
              {ROOMS.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    selectedRoom === room.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  )}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
              Limpar Filtros
            </Button>
          )}
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma reserva encontrada</p>
          <p className="text-sm">
            {hasActiveFilters 
              ? 'Tente ajustar os filtros' 
              : 'As reservas aparecerão aqui'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {filteredBookings.length} reserva{filteredBookings.length !== 1 && 's'}
          </p>
          {paginatedBookings.map((booking) => {
            const room = ROOMS.find((r) => r.id === booking.roomId)
            const shift = SHIFTS[booking.shift]
            
            return (
              <div
                key={booking.id}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{booking.responsibleName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {room?.name}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {formatDate(booking.date)} - {shift.label} ({shift.time})
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registrado em {formatCreatedAt(booking.createdAt)}
                  </p>
                  {booking.description && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {booking.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
