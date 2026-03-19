'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROOMS, SHIFTS, canCancelBooking, type ShiftKey, type Booking } from '@/lib/booking-service'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: number
  shift: ShiftKey
  date: string
  existingBooking?: Booking
  onConfirm: (data: { responsibleName: string; description?: string }) => Promise<void>
  onDelete?: () => Promise<void>
}

export function BookingModal({
  isOpen,
  onClose,
  roomId,
  shift,
  date,
  existingBooking,
  onConfirm,
  onDelete,
}: BookingModalProps) {
  const [responsibleName, setResponsibleName] = useState(existingBooking?.responsibleName || '')
  const [description, setDescription] = useState(existingBooking?.description || '')
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const room = ROOMS.find((r) => r.id === roomId)
  const shiftInfo = SHIFTS[shift]
  const canCancel = existingBooking ? canCancelBooking(existingBooking.date, existingBooking.shift) : false
  
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!responsibleName.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      await onConfirm({
        responsibleName: responsibleName.trim(),
        description: description.trim() || undefined,
      })
      setResponsibleName('')
      setDescription('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (!canCancel) return
    setIsCancelDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!onDelete || isSubmitting) return

    setIsSubmitting(true)

    try {
      await onDelete()
      setIsCancelDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl border border-border animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {existingBooking ? 'Detalhes da Reserva' : 'Nova Reserva'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {room?.name} - {shiftInfo.label} ({shiftInfo.time})
            </p>
            <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
          </div>

          {existingBooking ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Responsável</label>
                <p className="text-foreground mt-1">{existingBooking.responsibleName}</p>
              </div>
              {existingBooking.description && (
                <div>
                  <label className="text-sm font-medium text-foreground">Observações</label>
                  <p className="text-muted-foreground mt-1">{existingBooking.description}</p>
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Fechar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={!canCancel || isSubmitting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancelar Reserva
                </Button>
              </div>
              {!canCancel && (
                <p className="text-sm text-muted-foreground">
                  Reservas só podem ser canceladas com pelo menos 24 horas de antecedência.
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="responsible" className="text-sm font-medium text-foreground">
                  Nome do Responsável *
                </label>
                <Input
                  id="responsible"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  placeholder="Digite o nome"
                  className="mt-1.5"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Observações (opcional)
                </label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Consulta de rotina"
                  className="mt-1.5"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!responsibleName.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Confirmar'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="max-w-md rounded-2xl border-border bg-card p-6 shadow-xl">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle>Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação cancelará a reserva de {existingBooking?.responsibleName} em {room?.name} no turno da {shiftInfo.label.toLowerCase()}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 sm:flex-row">
            <AlertDialogCancel className="mt-0 sm:mt-0" disabled={isSubmitting}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 hover:text-white"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cancelando...' : 'Confirmar cancelamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
