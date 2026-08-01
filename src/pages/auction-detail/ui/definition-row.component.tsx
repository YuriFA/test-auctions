export interface DefinitionRowProps {
  label: string
  value: string
}

export function DefinitionRow({ label, value }: DefinitionRowProps) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
