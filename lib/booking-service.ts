export interface Booking {
  id: string
  roomId: number
  date: string
  shift: 'morning' | 'afternoon' | 'evening'
  responsibleName: string
  description?: string
  createdAt: string
}

export type BookingInput = Omit<Booking, 'id' | 'createdAt'>

export const ROOMS = [
  { id: 1, name: 'Sala 1' },
  { id: 2, name: 'Sala 2' },
  { id: 3, name: 'Sala 3' },
  { id: 4, name: 'Sala 4' },
] as const

export const SHIFTS = {
  morning: { label: 'Manhã', time: '08:00 - 12:00' },
  afternoon: { label: 'Tarde', time: '13:00 - 17:00' },
  evening: { label: 'Noite', time: '18:00 - 22:00' },
} as const

export type ShiftKey = keyof typeof SHIFTS

const SHIFT_START_HOURS: Record<ShiftKey, string> = {
  morning: '08:00',
  afternoon: '13:00',
  evening: '18:00',
}

export function canCancelBooking(date: string, shift: ShiftKey, now = new Date()): boolean {
  const bookingStart = new Date(`${date}T${SHIFT_START_HOURS[shift]}:00`)
  return bookingStart.getTime() - now.getTime() >= 24 * 60 * 60 * 1000
}

export class BookingServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'BookingServiceError'
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>
  }

  const fallbackMessage = 'Não foi possível concluir a operação.'
  let errorMessage = fallbackMessage

  try {
    const error = (await response.json()) as { error?: string }
    errorMessage = error.error || fallbackMessage
  } catch {
    // Ignora erros de parsing e mantém a mensagem padrão.
  }

  throw new BookingServiceError(errorMessage, response.status)
}

export const bookingService = {
  async getAll(): Promise<Booking[]> {
    const response = await fetch('/api/bookings', {
      cache: 'no-store',
    })

    return parseResponse<Booking[]>(response)
  },

  async create(booking: BookingInput): Promise<Booking> {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    })

    return parseResponse<Booking>(response)
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'DELETE',
    })

    await parseResponse<{ success: true }>(response)
  },
}
