import { type Booking, type BookingInput, type ShiftKey } from '@/lib/booking-service'

interface SupabaseBookingRow {
  id: string
  room_id: number
  date: string
  shift: ShiftKey
  responsible_name: string
  description: string | null
  created_at: string
}

function requireEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY'): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`)
  }

  return value
}

export function getSupabaseRestUrl(path: string): string {
  const baseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  return `${baseUrl}/rest/v1/${path}`
}

export function getSupabaseHeaders(extraHeaders?: HeadersInit): HeadersInit {
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extraHeaders,
  }
}

export function mapBookingRow(row: SupabaseBookingRow): Booking {
  return {
    id: row.id,
    roomId: row.room_id,
    date: row.date,
    shift: row.shift,
    responsibleName: row.responsible_name,
    description: row.description || undefined,
    createdAt: row.created_at,
  }
}

export function mapBookingInputToRow(booking: BookingInput) {
  return {
    room_id: booking.roomId,
    date: booking.date,
    shift: booking.shift,
    responsible_name: booking.responsibleName,
    description: booking.description || null,
  }
}
