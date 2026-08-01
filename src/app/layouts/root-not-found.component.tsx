import { Button, Empty, EmptyDescription } from '@shared/ui'
import { Link } from '@tanstack/react-router'

export function RootNotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-3 px-4 py-12 sm:px-6">
      <Empty>
        <h1 className="font-heading text-sm font-medium tracking-tight">Страница не найдена</h1>
        <EmptyDescription>Запрошенная страница не существует или была перемещена.</EmptyDescription>
        <Button nativeButton={false} render={<Link to="/" search={{}} />}>
          К списку аукционов →
        </Button>
      </Empty>
    </div>
  )
}
