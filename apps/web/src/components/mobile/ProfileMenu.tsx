import { LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../lib/auth'

export function ProfileMenu() {
  const { refresh, profile, user } = useAuth()

  async function handleSignOut() {
    await signOut()
    await refresh()
  }

  const email = profile?.email ?? user?.email ?? ''
  const displayName = profile?.displayName ?? user?.email?.split('@')[0] ?? 'Atleta'

  return (
    <div className="profile-card">
      <div className="profile-avatar" aria-hidden>
        {displayName.slice(0, 1).toUpperCase()}
      </div>
      <div className="profile-name">{displayName}</div>
      {email ? <div className="profile-email">{email}</div> : null}
      <button
        type="button"
        className="btn-secondary"
        style={{ marginTop: 12 }}
        onClick={handleSignOut}
      >
        <LogOut size={16} />
        <span>Cerrar sesión</span>
      </button>
    </div>
  )
}