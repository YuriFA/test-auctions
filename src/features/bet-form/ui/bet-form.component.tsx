import { usePlaceBet } from '@entities/auction'
import { zodResolver } from '@hookform/resolvers/zod'
import { isApiValidationError } from '@shared/api'
import { Alert, AlertDescription, AlertTitle, Button } from '@shared/ui'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { applyValidationErrors, errorMessage } from '../lib/api-errors'
import type { BetFormValues, BetPriceConstraints } from '../lib/bet-form-schema'
import { betFormSchema } from '../lib/bet-form-schema'
import { PriceField } from './price-field.component'

export interface BetFormProps {
  auctionUuid: string
  constraints: BetPriceConstraints
  available: number | null
  onSuccess: () => void
}

export function BetForm({ auctionUuid, constraints, available, onSuccess }: BetFormProps) {
  const placeBet = usePlaceBet(auctionUuid)

  const form = useForm<{ price: string }, undefined, BetFormValues>({
    resolver: zodResolver(betFormSchema(constraints)),
    defaultValues: { price: '' },
    mode: 'onSubmit',
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await placeBet.mutateAsync(values.price)
      toast.success('Ставка сохранена', { description: 'Она появилась в истории ставок.' })
      onSuccess()
    } catch (error) {
      if (isApiValidationError(error)) {
        applyValidationErrors(error, form.setError)
        toast.error('Проверьте введённую цену', {
          description: 'Сервер отклонил ставку. Ошибки показаны в форме.',
        })
        return
      }
      const message = errorMessage(error)
      form.setError('root.serverError', { message })
      toast.error('Не удалось сохранить ставку', { description: message })
    }
  })

  const rootError = form.formState.errors.root?.serverError?.message

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
        <PriceField constraints={constraints} available={available} disabled={placeBet.isPending} />

        {rootError && (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Не удалось сохранить ставку</AlertTitle>
            <AlertDescription>{rootError}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={placeBet.isPending}>
            {placeBet.isPending ? 'Сохранение…' : 'Сделать ставку'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={placeBet.isPending}
            onClick={() => form.reset({ price: '' })}
          >
            Очистить
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
