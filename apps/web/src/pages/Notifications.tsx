import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, ArrowLeft, Dot, CheckCheck, X, Trophy, Dumbbell, Users, Settings2 } from 'lucide-react'
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

function pathForNotification(n: NotificationMock): string | null {
  switch (n.type) {
    case 'achievement':
      return '/app/logros'
    case 'training':
      return '/app/entrena'
    case 'social':
      return '/app/conexiones'
    default:
      return '/app'
  }
}

const chevron = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export default function Notifications() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
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

  function markAsRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  function dismissNotification(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDismissedIds((prev) => new Set(prev).add(id))
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  function handleItemClick(notif: NotificationMock) {
    const target = pathForNotification(notif)
    if (!notif.read) markAsRead(notif.id)
    if (target) navigate(target)
  }

  return (
    <div className="page-notifications">
      {/* Header */}
      <div className="notif-page-header">
        <button
          type="button"
          className="notif-page-back"
          aria-label={isEs ? 'Volver' : 'Back'}
          onClick={() => navigate('/app')}
        >
          <ArrowLeft size={22} strokeWidth={2} />
          <span className="notif-page-back-label">{isEs ? 'Atrás' : 'Back'}</span>
        </button>
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
          {notifications.map((notif) => {
            const href = pathForNotification(notif)
            const isSocial = notif.type === 'social'
            const isAchievement = notif.type === 'achievement'
            const isTraining = notif.type === 'training'
            const isSystem = notif.type === 'system'

            return (
              <div
                key={notif.id}
                className={`notif-page-item${notif.read ? '' : ' unread'}`}
                onClick={() => handleItemClick(notif)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleItemClick(notif) }}
              >
                <div className="notif-page-item-indicator">
                  {notif.read ? (
                    <CheckCheck size={14} strokeWidth={1.5} className="notif-page-read-icon" />
                  ) : isAchievement ? (
                    <Trophy size={18} strokeWidth={2} className="notif-page-type-icon notif-page-type-icon--achievement" />
                  ) : isTraining ? (
                    <Dumbbell size={18} strokeWidth={2} className="notif-page-type-icon notif-page-type-icon--training" />
                  ) : isSocial ? (
                    <Users size={18} strokeWidth={2} className="notif-page-type-icon notif-page-type-icon--social" />
                  ) : (
                    <Settings2 size={18} strokeWidth={2} className="notif-page-type-icon notif-page-type-icon--system" />
                  )}
                </div>
                <div className="notif-page-item-body">
                  <div className="notif-page-item-top">
                    <strong className="notif-page-title">{notif.title}</strong>
                    <span className="notif-page-time">{notif.time}</span>
                  </div>
                  <p className="notif-page-desc">{notif.description}</p>
                </div>
                <div className="notif-page-actions">
                  {href && (
                    <span className="notif-page-go" aria-hidden>
                      <svg {...chevron} viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                  <button
                    type="button"
                    className="notif-page-dismiss"
                    onClick={(e) => dismissNotification(notif.id, e)}
                    aria-label={isEs ? 'Eliminar notificación' : 'Dismiss notification'}
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
