import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ArrowLeft, Dot, CheckCheck, X } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { mockNotifications, type NotificationMock } from '../lib/notificationsMock'

const STORAGE_KEY = 'peak_notifications_read'
const DISMISSED_KEY = 'peak_notifications_dismissed'
const CHANGE_EVENT = 'peak:notifications-changed'

function loadIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveIdSet(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...ids]))
}

function notifyChange() {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export default function Notifications() {
  const { t, language } = useI18n()
  const [readIds, setReadIds] = useState<Set<string>>(() => loadIdSet(STORAGE_KEY))
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => loadIdSet(DISMISSED_KEY))
  const [notifications, setNotifications] = useState<NotificationMock[]>(() =>
    mockNotifications
      .filter((n) => !dismissedIds.has(n.id))
      .map((n) => ({ ...n, read: n.read || readIds.has(n.id) }))
  )
  const unreadCount = notifications.filter((n) => !n.read).length
  const isEs = language === 'es'

  // Persist read state
  useEffect(() => {
    saveIdSet(STORAGE_KEY, readIds)
    notifyChange()
  }, [readIds])

  // Persist dismissed state
  useEffect(() => {
    saveIdSet(DISMISSED_KEY, dismissedIds)
  }, [dismissedIds])

  function toggleRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  function dismissNotification(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDismissedIds((prev) => new Set(prev).add(id))
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="page-notifications">
      {/* Header */}
      <div className="notif-page-header">
        <Link to="/app" className="notif-page-back" aria-label={isEs ? 'Volver' : 'Back'}>
          <ArrowLeft size={22} strokeWidth={2} />
        </Link>
        <div className="notif-page-header-text">
          <h1>{t('notifications')}</h1>
          {unreadCount > 0 && (
            <span className="notif-page-unread-badge">
              {unreadCount} {isEs ? 'nuevas' : 'new'}
            </span>
          )}
        </div>
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="empty-state notif-page-empty">
          <Bell size={40} strokeWidth={1.5} className="empty-icon-svg" />
          <p>{isEs ? 'Sin notificaciones' : 'No notifications'}</p>
          <small className="text-muted">
            {isEs
              ? 'Aquí aparecerán tus notificaciones cuando tengas alguna.'
              : 'Your notifications will appear here when you have any.'}
          </small>
        </div>
      ) : (
        <div className="notif-page-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-page-item${notif.read ? '' : ' unread'}`}
              onClick={() => toggleRead(notif.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleRead(notif.id) }}
            >
              <div className="notif-page-item-indicator">
                {notif.read ? (
                  <CheckCheck size={14} strokeWidth={1.5} className="notif-page-read-icon" />
                ) : (
                  <Dot size={20} strokeWidth={2} className="notif-page-dot-icon" />
                )}
              </div>
              <div className="notif-page-item-body">
                <div className="notif-page-item-top">
                  <strong className="notif-page-title">{notif.title}</strong>
                  <span className="notif-page-time">{notif.time}</span>
                </div>
                <p className="notif-page-desc">{notif.description}</p>
              </div>
              <button
                type="button"
                className="notif-page-dismiss"
                onClick={(e) => dismissNotification(notif.id, e)}
                aria-label={isEs ? 'Eliminar notificación' : 'Dismiss notification'}
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
