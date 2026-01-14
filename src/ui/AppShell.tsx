import { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-reader-bg text-reader-text font-reader">
      {children}
    </div>
  )
}
