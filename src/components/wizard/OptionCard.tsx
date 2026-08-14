import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type OptionCardProps = {
  id: string
  title: string
  description?: string
  meta?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  compact?: boolean
}

export function OptionCard({
  id,
  title,
  description,
  meta,
  checked,
  onCheckedChange,
  compact = false,
}: OptionCardProps) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal transition-colors',
        checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50',
        compact && 'p-3'
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <span className="grid gap-1">
        <span className="text-sm font-semibold">{title}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
        {meta && (
          <span className="text-xs text-muted-foreground">{meta}</span>
        )}
      </span>
    </Label>
  )
}
