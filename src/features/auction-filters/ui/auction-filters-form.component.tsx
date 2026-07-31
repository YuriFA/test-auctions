import type { AuctionType } from '@shared/api'
import {
  describeAuctionStatusCode,
  describeAuctionType,
  describeTradingStatus,
} from '@entities/auction'
import { cities } from '@shared/config'
import { Button } from '@shared/ui'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

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
  [
    'NotParticipating',
    'Leading',
    'Losing',
    'Winner',
    'Confirmed',
    'Unknown',
  ] as const
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
  const [draft, setDraft] = useState<AuctionsListFilters>(initialFilters)

  useEffect(() => {
    setDraft(initialFilters)
  }, [initialFilters])

  const patch = (next: Partial<AuctionsListFilters>) => {
    setDraft((current) => ({ ...current, ...next }))
  }

  const apply = () => {
    commitFilters(draft)
    onApplied()
  }

  const reset = () => {
    setDraft({ ...DEFAULT_AUCTIONS_LIST_FILTERS })
  }

  const isDefault = isDefaultFilters(draft)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        apply()
      }}
      className="flex flex-col gap-5"
    >
      <FilterSection title="Тип аукциона">
        <CheckboxList
          options={AUC_TYPE_OPTIONS}
          selected={draft.auc_type}
          onToggle={(value, checked) =>
            patch({
              auc_type: checked
                ? [...draft.auc_type, value]
                : draft.auc_type.filter((v) => v !== value),
            })
          }
        />
      </FilterSection>

      <FilterSection title="Статус аукциона">
        <CheckboxList
          options={AUCTION_STATUS_CODE_OPTIONS}
          selected={draft.statuses}
          onToggle={(value, checked) =>
            patch({
              statuses: checked
                ? [...draft.statuses, value]
                : draft.statuses.filter((v) => v !== value),
            })
          }
        />
      </FilterSection>

      <FilterSection title="Мой статус в торгах">
        <CheckboxList
          options={TRADING_STATUS_OPTIONS}
          selected={draft.status}
          onToggle={(value, checked) =>
            patch({
              status: checked
                ? [...draft.status, value]
                : draft.status.filter((v) => v !== value),
            })
          }
        />
      </FilterSection>

      <FilterSection title="Маршрут">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Город погрузки">
            <CitySelect
              value={draft.load_city}
              onChange={(next) => patch({ load_city: next })}
            />
          </Field>
          <Field label="Город выгрузки">
            <CitySelect
              value={draft.unload_city}
              onChange={(next) => patch({ unload_city: next })}
            />
          </Field>
        </div>
      </FilterSection>

      <FilterSection title="Дата погрузки">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="С">
            <DateInput
              value={draft.load_date_from}
              onCommit={(next) => patch({ load_date_from: next })}
            />
          </Field>
          <Field label="По">
            <DateInput
              value={draft.load_date_to}
              onCommit={(next) => patch({ load_date_to: next })}
            />
          </Field>
        </div>
      </FilterSection>

      <FilterSection title="Текущая цена (₽)">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="От">
            <NumberInput
              value={draft.current_price_from}
              placeholder="0"
              onCommit={(next) => patch({ current_price_from: next })}
            />
          </Field>
          <Field label="До">
            <NumberInput
              value={draft.current_price_to}
              placeholder="∞"
              onCommit={(next) => patch({ current_price_to: next })}
            />
          </Field>
        </div>
      </FilterSection>

      <FilterSection title="Дополнительно">
        <div className="flex flex-col gap-3">
          <ToggleCheckbox
            label="Только доступные для ставки"
            checked={draft.is_available === true}
            onChange={(checked) => patch({ is_available: checked || undefined })}
          />
          <ToggleCheckbox
            label="Только мои участия"
            checked={draft.is_bidder === true}
            onChange={(checked) => patch({ is_bidder: checked || undefined })}
          />
        </div>
      </FilterSection>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={isDefault}>
          Сбросить
        </Button>
        <Button type="submit" size="sm">
          Применить
        </Button>
      </div>
    </form>
  )
}

function useAuctionsListFiltersCommit() {
  const navigate = useNavigate({ from: '/auctions' })
  const search = useSearch({ from: '/auctions' })

  const initialFilters = useMemo<AuctionsListFilters>(
    () => ({ ...DEFAULT_AUCTIONS_LIST_FILTERS, ...search }),
    [search],
  )

  const commitFilters = (next: AuctionsListFilters) => {
    navigate({
      to: '/auctions',
      search: toAuctionsListSearch({ ...next, page: 1 }),
    })
  }

  return { initialFilters, commitFilters }
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

const INPUT_CLASS =
  'h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:opacity-50'

function NumberInput({
  value,
  placeholder,
  onCommit,
}: {
  value: number | undefined
  placeholder?: string
  onCommit: (next: number | undefined) => void
}) {
  const [local, setLocal] = useState(value === undefined ? '' : String(value))
  useEffect(() => {
    setLocal(value === undefined ? '' : String(value))
  }, [value])

  const commit = () => {
    const trimmed = local.trim()
    if (trimmed === '') {
      if (value !== undefined) {
        onCommit(undefined)
      }
      return
    }
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed)) {
      setLocal(value === undefined ? '' : String(value))
      return
    }
    if (parsed !== value) {
      onCommit(parsed)
    }
  }

  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      value={local}
      placeholder={placeholder}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit()
        }
      }}
      className={INPUT_CLASS}
    />
  )
}

function DateInput({
  value,
  onCommit,
}: {
  value: string | undefined
  onCommit: (next: string | undefined) => void
}) {
  return (
    <input
      type="date"
      value={value ?? ''}
      onChange={(e) => onCommit(e.target.value || undefined)}
      className={INPUT_CLASS}
    />
  )
}

function CitySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS}>
      <option value="">Любой город</option>
      {cities.map((city) => (
        <option key={city.gcId} value={city.name}>
          {city.name} — {city.region}
        </option>
      ))}
    </select>
  )
}

function CheckboxList<T extends string | number>({
  options,
  selected,
  onToggle,
}: {
  options: ReadonlyArray<{ value: T; label: string }>
  selected: ReadonlyArray<T>
  onToggle: (value: T, checked: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const checked = selected.includes(option.value)
        return (
          <ToggleCheckbox
            key={String(option.value)}
            label={option.label}
            checked={checked}
            onChange={(next) => onToggle(option.value, next)}
          />
        )
      })}
    </div>
  )
}

function ToggleCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-primary"
      />
      <span>{label}</span>
    </label>
  )
}
