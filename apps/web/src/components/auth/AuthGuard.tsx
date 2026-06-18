import type { ReactNode } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../lib/auth'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

export function AuthGuard({ children, fallback }: Props) {
  const { status, configured } = useAuth()

  if (!configured) {
    return (
      fallback ?? (
        <div className="status-callout" role="alert">
          Supabase no está configurado. Agrega las variables de entorno para continuar.
        </div>
      )
    )
  }

  if (status === 'loading') {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <Loader2 size={20} className="auth-loading-spinner" />
        <span>Verificando sesión…</span>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return null
  }

  return <>{children}</>
}

export function SignOutButton({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  const { refresh } = useAuth()

  async function handleSignOut() {
    await signOut()
    await refresh()
  }

  return (
    <button type="button" className={className ?? 'ghost-button'} onClick={handleSignOut}>
      {children ?? (
        <>
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </>
      )}
    </button>
  )
}
