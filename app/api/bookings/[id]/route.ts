import { NextResponse } from 'next/server'
import { canCancelBooking } from '@/lib/booking-service'
import {
  getSupabaseHeaders,
  getSupabaseRestUrl,
  mapBookingRow,
} from '@/lib/supabase-server'

const SELECT_COLUMNS = 'id,room_id,date,shift,responsible_name,description,created_at'

async function readSupabaseError(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string; error?: string }
    return data.message || data.error || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const encodedId = encodeURIComponent(id)

    const existingResponse = await fetch(
      `${getSupabaseRestUrl('bookings')}?select=${SELECT_COLUMNS}&id=eq.${encodedId}&limit=1`,
      {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      }
    )

    if (!existingResponse.ok) {
      const message = await readSupabaseError(existingResponse, 'Não foi possível localizar a reserva.')
      return NextResponse.json({ error: message }, { status: existingResponse.status })
    }

    const [bookingRow] = await existingResponse.json()

    if (!bookingRow) {
      return NextResponse.json({ error: 'Reserva não encontrada.' }, { status: 404 })
    }

    const booking = mapBookingRow(bookingRow)

    if (!canCancelBooking(booking.date, booking.shift)) {
      return NextResponse.json(
        { error: 'Reservas só podem ser canceladas com pelo menos 24 horas de antecedência.' },
        { status: 409 }
      )
    }

    const deleteResponse = await fetch(`${getSupabaseRestUrl('bookings')}?id=eq.${encodedId}`, {
      method: 'DELETE',
      headers: getSupabaseHeaders({
        Prefer: 'return=minimal',
      }),
    })

    if (!deleteResponse.ok) {
      const message = await readSupabaseError(deleteResponse, 'Não foi possível cancelar a reserva.')
      return NextResponse.json({ error: message }, { status: deleteResponse.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível cancelar a reserva.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
