import { Checkbox, Field, FieldGroup, FieldLabel } from '@shared/ui'

interface CheckboxListProps<T extends string | number> {
  options: ReadonlyArray<{ value: T; label: string }>
  selected: ReadonlyArray<T>
  onToggle: (value: T, checked: boolean) => void
  idPrefix: string
}

export function CheckboxList<T extends string | number>({
  options,
  selected,
  onToggle,
  idPrefix,
}: CheckboxListProps<T>) {
  return (
    <FieldGroup data-slot="checkbox-group">
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
