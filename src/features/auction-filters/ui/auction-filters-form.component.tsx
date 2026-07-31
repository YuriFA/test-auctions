import {
  describeAuctionStatusCode,
  describeAuctionType,
  describeTradingStatus,
} from '@entities/auction'
import type { AuctionType } from '@shared/api'
import { cities } from '@shared/config'
import {
  Button,
  Checkbox,
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  DEFAULT_AUCTIONS_LIST_FILTERS,
  isDefaultFilters,
  toAuctionsListSearch,
  type AuctionsListFilters,
} from '../lib/search-params'

const AUC_TYPE_OPTIONS: ReadonlyArray<{ value: AuctionType; label: string }> = [
  { value: 'Request', label: describeAuctionType('Request') },
  { value: 'Up', label: describeAuctionType('Up') },
  { value: 'Down', label: describeAuctionType('Down') },
  { value: 'FixPrice', label: describeAuctionType('FixPrice') },
]

const TRADING_STATUS_OPTIONS = (
  ['NotParticipating', 'Leading', 'Losing', 'Winner', 'Confirmed', 'Unknown'] as const
).map((value) => ({ value, label: describeTradingStatus(value) }))

const AUCTION_STATUS_CODE_OPTIONS = Array.from({ length: 7 }, (_, idx) => {
  const code = idx + 1
  return { value: code, label: describeAuctionStatusCode(code) }
})

interface Props {
  onApplied: () => void
}

export function AuctionFiltersForm({ onApplied }: Props) {
  const { initialFilters, commitFilters } = useAuctionsListFiltersCommit()
  const form = useForm<AuctionsListFilters>({
    defaultValues: initialFilters,
    // Re-sync from URL when search changes (e.g. user typed in the header search).
    values: initialFilters,
  })

  const onSubmit = useCallback(
    (next: AuctionsListFilters) => {
      commitFilters(next)
      onApplied()
    },
    [commitFilters, onApplied],
  )

  const reset = useCallback(() => {
    form.reset({ ...DEFAULT_AUCTIONS_LIST_FILTERS })
  }, [form])

  const values = form.watch()
  const isDefault = isDefaultFilters(values)

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
      autoComplete="off"
    >
      <div className="flex-1 overflow-y-auto p-4">
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Тип аукциона</FieldLegend>
            <Controller
              control={form.control}
              name="auc_type"
              render={({ field }) => (
                <CheckboxList
                  options={AUC_TYPE_OPTIONS}
                  selected={field.value ?? []}
                  onToggle={(value, checked) =>
                    field.onChange(toggleInArray(field.value ?? [], value, checked))
                  }
                  idPrefix="auc_type"
                />
              )}
            />
          </FieldSet>

          <FieldSet>
            <FieldLegend>Статус аукциона</FieldLegend>
            <Controller
              control={form.control}
              name="statuses"
              render={({ field }) => (
                <CheckboxList
                  options={AUCTION_STATUS_CODE_OPTIONS}
                  selected={field.value ?? []}
                  onToggle={(value, checked) =>
                    field.onChange(toggleInArray(field.value ?? [], value, checked))
                  }
                  idPrefix="statuses"
                />
              )}
            />
          </FieldSet>

          <FieldSet>
            <FieldLegend>Мой статус в торгах</FieldLegend>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <CheckboxList
                  options={TRADING_STATUS_OPTIONS}
                  selected={field.value ?? []}
                  onToggle={(value, checked) =>
                    field.onChange(toggleInArray(field.value ?? [], value, checked))
                  }
                  idPrefix="status"
                />
              )}
            />
          </FieldSet>

          <FieldSet>
            <FieldLegend>Маршрут</FieldLegend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field orientation="vertical">
                <FieldLabel htmlFor="load_city">Город погрузки</FieldLabel>
                <Controller
                  control={form.control}
                  name="load_city"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="load_city" className="w-full">
                        <SelectValue placeholder="Любой город" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Любой город</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.gcId} value={city.name}>
                            {city.name} — {city.region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field orientation="vertical">
                <FieldLabel htmlFor="unload_city">Город выгрузки</FieldLabel>
                <Controller
                  control={form.control}
                  name="unload_city"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="unload_city" className="w-full">
                        <SelectValue placeholder="Любой город" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Любой город</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.gcId} value={city.name}>
                            {city.name} — {city.region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Дата погрузки</FieldLegend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field orientation="vertical">
                <FieldLabel htmlFor="load_date_from">С</FieldLabel>
                <Input id="load_date_from" type="date" {...form.register('load_date_from')} />
              </Field>
              <Field orientation="vertical">
                <FieldLabel htmlFor="load_date_to">По</FieldLabel>
                <Input id="load_date_to" type="date" {...form.register('load_date_to')} />
              </Field>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Текущая цена (₽)</FieldLegend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field orientation="vertical">
                <FieldLabel htmlFor="current_price_from">От</FieldLabel>
                <Controller
                  control={form.control}
                  name="current_price_from"
                  render={({ field }) => (
                    <Input
                      id="current_price_from"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      placeholder="0"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseOptionalNumber(e.target.value))}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </Field>
              <Field orientation="vertical">
                <FieldLabel htmlFor="current_price_to">До</FieldLabel>
                <Controller
                  control={form.control}
                  name="current_price_to"
                  render={({ field }) => (
                    <Input
                      id="current_price_to"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      placeholder="∞"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseOptionalNumber(e.target.value))}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </Field>
            </div>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Дополнительно</FieldLegend>
            <FieldGroup>
              <Controller
                control={form.control}
                name="is_available"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="is_available"
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked || undefined)}
                    />
                    <FieldLabel htmlFor="is_available">Только доступные для ставки</FieldLabel>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="is_bidder"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="is_bidder"
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked || undefined)}
                    />
                    <FieldLabel htmlFor="is_bidder">Только мои участия</FieldLabel>
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-border bg-popover p-4">
        <Button type="button" variant="ghost" onClick={reset} disabled={isDefault}>
          Сбросить
        </Button>
        <Button type="submit">Применить</Button>
      </div>
    </form>
  )
}

function useAuctionsListFiltersCommit() {
  const navigate = useNavigate({ from: '/auctions' })
  const search = useSearch({ from: '/auctions' })

  const initialFilters: AuctionsListFilters = {
    ...DEFAULT_AUCTIONS_LIST_FILTERS,
    ...search,
  }

  const commitFilters = useCallback(
    (next: AuctionsListFilters) => {
      navigate({
        to: '/auctions',
        search: toAuctionsListSearch({ ...next, page: 1 }),
      })
    },
    [navigate],
  )

  return { initialFilters, commitFilters }
}

function toggleInArray<T>(current: ReadonlyArray<T>, value: T, checked: boolean): T[] {
  if (checked) {
    return current.includes(value) ? [...current] : [...current, value]
  }
  return current.filter((v) => v !== value)
}

function parseOptionalNumber(raw: string): number | undefined {
  if (raw.trim() === '') {
    return undefined
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

function CheckboxList<T extends string | number>({
  options,
  selected,
  onToggle,
  idPrefix,
}: {
  options: ReadonlyArray<{ value: T; label: string }>
  selected: ReadonlyArray<T>
  onToggle: (value: T, checked: boolean) => void
  idPrefix: string
}) {
  return (
    <FieldGroup>
      {options.map((option) => {
        const id = `${idPrefix}-${option.value}`
        const checked = selected.includes(option.value)
        return (
          <Field key={id} orientation="horizontal">
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={(state) => onToggle(option.value, state === true)}
            />
            <FieldLabel htmlFor={id}>{option.label}</FieldLabel>
          </Field>
        )
      })}
    </FieldGroup>
  )
}
