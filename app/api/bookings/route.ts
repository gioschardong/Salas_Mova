import { NextResponse } from 'next/server'
import {
  canBookShift,
  SHIFTS,
  type BookingInput,
  type ShiftKey,
} from '@/lib/booking-service'
import {
  getSupabaseHeaders,
  getSupabaseRestUrl,
  mapBookingInputToRow,
  mapBookingRow,
} from '@/lib/supabase-server'

const SELECT_COLUMNS = 'id,room_id,date,shift,responsible_name,description,created_at'

function isValidShift(value: unknown): value is ShiftKey {
  return typeof value === 'string' && value in SHIFTS
}

function isValidBookingInput(body: unknown): body is BookingInput {
  if (!body || typeof body !== 'object') return false

  const booking = body as Partial<BookingInput>

  return (
    typeof booking.roomId === 'number' &&
    typeof booking.date === 'string' &&
    isValidShift(booking.shift) &&
    typeof booking.responsibleName === 'string' &&
    (typeof booking.description === 'string' || typeof booking.description === 'undefined')
  )
}

async function readSupabaseError(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const data = (await response.json()) as { code?: string; message?: string; error?: string }

    if (data.code === '23505') {
      return 'Este horário já está reservado.'
    }

    return data.message || data.error || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export async function GET() {
  try {
    const response = await fetch(
      `${getSupabaseRestUrl('bookings')}?select=${SELECT_COLUMNS}&order=created_at.desc`,
      {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      const message = await readSupabaseError(response, 'Não foi possível carregar as reservas.')
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const rows = await response.json()
    return NextResponse.json(rows.map(mapBookingRow))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível carregar as reservas.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!isValidBookingInput(body)) {
      return NextResponse.json({ error: 'Dados de reserva inválidos.' }, { status: 400 })
    }

    if (!canBookShift(body.date, body.shift)) {
      return NextResponse.json(
        { error: 'Não é mais possível reservar esse turno para o dia atual.' },
        { status: 409 }
      )
    }

    const duplicateResponse = await fetch(
      `${getSupabaseRestUrl('bookings')}?select=id&room_id=eq.${body.roomId}&date=eq.${body.date}&shift=eq.${body.shift}&limit=1`,
      {
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      }
    )

    if (!duplicateResponse.ok) {
      const message = await readSupabaseError(duplicateResponse, 'Não foi possível validar a disponibilidade.')
      return NextResponse.json({ error: message }, { status: duplicateResponse.status })
    }

    const duplicates = (await duplicateResponse.json()) as Array<{ id: string }>

    if (duplicates.length > 0) {
      return NextResponse.json(
        { error: 'Este horário já está reservado.' },
        { status: 409 }
      )
    }

    const insertResponse = await fetch(getSupabaseRestUrl('bookings'), {
      method: 'POST',
      headers: getSupabaseHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      }),
      body: JSON.stringify(mapBookingInputToRow(body)),
    })

    if (!insertResponse.ok) {
      const message = await readSupabaseError(insertResponse, 'Não foi possível criar a reserva.')
      return NextResponse.json(
        { error: message },
        { status: message === 'Este horário já está reservado.' ? 409 : insertResponse.status }
      )
    }

    const [createdBooking] = await insertResponse.json()
    return NextResponse.json(mapBookingRow(createdBooking), { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível criar a reserva.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
