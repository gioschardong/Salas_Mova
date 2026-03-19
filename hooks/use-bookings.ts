'use client'

import { useState, useCallback, useEffect } from 'react'
import { bookingService, type Booking, type BookingInput, type ShiftKey } from '@/lib/booking-service'

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const nextBookings = await bookingService.getAll()
      setBookings(nextBookings)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const getBookingsForDate = useCallback((date: string) => {
    return bookings.filter((b) => b.date === date)
  }, [bookings])

  const getBookingsForDateRange = useCallback((startDate: string, endDate: string) => {
    return bookings.filter((b) => b.date >= startDate && b.date <= endDate)
  }, [bookings])

  const isSlotAvailable = useCallback((roomId: number, date: string, shift: ShiftKey) => {
    return !bookings.some(
      (b) => b.roomId === roomId && b.date === date && b.shift === shift
    )
  }, [bookings])

  const getSlotBooking = useCallback((roomId: number, date: string, shift: ShiftKey) => {
    return bookings.find(
      (b) => b.roomId === roomId && b.date === date && b.shift === shift
    )
  }, [bookings])

  const createBooking = useCallback(async (booking: BookingInput) => {
    const newBooking = await bookingService.create(booking)
    await refresh()
    return newBooking
  }, [refresh])

  const deleteBooking = useCallback(async (id: string) => {
    await bookingService.delete(id)
    await refresh()
  }, [refresh])

  return {
    bookings,
    isLoading,
    refresh,
    getBookingsForDate,
    getBookingsForDateRange,
    isSlotAvailable,
    getSlotBooking,
    createBooking,
    deleteBooking,
  }
}
