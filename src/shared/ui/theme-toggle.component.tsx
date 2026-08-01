import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { cn } from '@shared/lib/cn'
import { useTheme, type Theme } from '@shared/lib/theme'
import { CheckIcon, ChevronDownIcon, Moon, Sun, SunMoon } from 'lucide-react'
import type { ComponentType } from 'react'

import { Button } from './button.component'

interface ThemeOption {
  value: Theme
  label: string
  Icon: ComponentType<{ className?: string }>
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: 'light', label: 'Светлая', Icon: Sun },
  { value: 'dark', label: 'Тёмная', Icon: Moon },
  { value: 'system', label: 'Авто', Icon: SunMoon },
]

function findOption(theme: Theme): ThemeOption {
  return THEME_OPTIONS.find((option) => option.value === theme) ?? THEME_OPTIONS[2]!
}

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const current = findOption(theme)
  const CurrentIcon = current.Icon

  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger
        render={<Button variant="ghost" size="sm" className={className} />}
        aria-label={`Тема оформления: ${current.label}. Открыть выбор темы.`}
      >
        <CurrentIcon className="size-4" aria-hidden />
        <ChevronDownIcon className="size-3 opacity-70" aria-hidden />
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner align="end" sideOffset={4} className="isolate z-50">
          <MenuPrimitive.Popup
            className={cn(
              'relative isolate min-w-48 origin-(--transform-origin) overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100',
              'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            )}
          >
            <MenuPrimitive.RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as Theme)}
            >
              {THEME_OPTIONS.map(({ value, label, Icon }) => (
                <MenuPrimitive.RadioItem
                  key={value}
                  value={value}
                  className={cn(
                    'relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-xs/relaxed outline-hidden select-none',
                    'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="flex-1">{label}</span>
                  <MenuPrimitive.RadioItemIndicator
                    render={<span className="flex size-4 items-center justify-center" />}
                  >
                    <CheckIcon className="size-3" />
                  </MenuPrimitive.RadioItemIndicator>
                </MenuPrimitive.RadioItem>
              ))}
            </MenuPrimitive.RadioGroup>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}
