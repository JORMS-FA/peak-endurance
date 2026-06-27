import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import { useI18n } from '../../hooks/useI18n'
import { useAuth } from '../../hooks/useAuth'
import { useSearch, type SearchResultItem } from '../../hooks/useSearch'
import { SearchIcon } from '../ui/icons/SearchIcon'

function GroupIcon({ type }: { type: string }) {
  switch (type) {
    case 'user':
      return (
        <div className="search-group-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )
    case 'activity':
      return (
        <div className="search-group-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
      )
    case 'session':
      return (
        <div className="search-group-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      )
    default:
      return <SearchIcon size={12} />
  }
}

function ResultIcon({ type }: { type: string }) {
  switch (type) {
    case 'user':
      return (
        <div className="search-result-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )
    case 'activity':
      return (
        <div className="search-result-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
      )
    case 'session':
      return (
        <div className="search-result-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" Stroke="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      )
    default:
      return <SearchIcon size={14} />
  }
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { t, language } = useI18n()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const isEs = language === 'es'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { results: searchResults, loading: searchLoading } = useSearch(searchQuery)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
    if (!open) {
      setSearchQuery('')
      setSelectedIdx(-1)
    }
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
      }
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIdx((prev) => Math.min(prev + 1, searchResults.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIdx((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter' && selectedIdx >= 0 && searchResults[selectedIdx]) {
        e.preventDefault()
        handleSelect(searchResults[selectedIdx])
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, searchResults, selectedIdx])

  useEffect(() => {
    if (!open || selectedIdx < 0) return
    const el = listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx, open])

  function handleSelect(item: SearchResultItem) {
    navigate(item.path)
    onClose()
  }

  const groups = useCallback((): { type: string; label: string; items: SearchResultItem[] }[] => {
    const order = ['user', 'page', 'activity', 'session', 'connection']
    const labels: Record<string, string> = {
      user: isEs ? 'Usuarios' : 'Users',
      page: isEs ? 'Páginas' : 'Pages',
      activity: isEs ? 'Actividades' : 'Activities',
      session: isEs ? 'Sesiones' : 'Sessions',
      connection: isEs ? 'Conexiones' : 'Connections',
    }
    const map: Record<string, SearchResultItem[]> = {}
    for (const item of searchResults) {
      if (!map[item.type]) map[item.type] = []
      map[item.type].push(item)
    }
    return order
      .filter((type) => map[type]?.length)
      .map((type) => ({ type, label: labels[type] ?? type, items: map[type] }))
  }, [searchResults, isEs])

  if (!open) return null

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <SearchIcon size={18} className="search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder={isEs ? 'Buscar @usuario, actividades, planes...' : 'Search @user, activities, plans...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSelectedIdx(-1)
            }}
          />
          <kbd className="search-modal-kbd">ESC</kbd>
          <button type="button" className="search-modal-close" onClick={onClose}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="search-modal-body">
          {searchQuery.trim() ? (
            <>
              {searchLoading ? (
                <p className="search-modal-empty">{isEs ? 'Buscando...' : 'Searching...'}</p>
              ) : searchResults.length === 0 ? (
                <p className="search-modal-empty">{isEs ? 'Sin resultados' : 'No results'}</p>
              ) : (
                <div className="search-modal-results" ref={listRef}>
                  {groups().map((group) => (
                    <div key={group.label} className="search-group">
                      <div className="search-group-label">
                        <GroupIcon type={group.type} />
                        <span>{group.label}</span>
                      </div>
                      {group.items.map((item, idx) => (
                        <button
                          key={item.id}
                          data-idx={idx}
                          type="button"
                          className={`search-result-item${idx === selectedIdx ? ' selected' : ''}`}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIdx(idx)}
                        >
                          <div className="search-result-icon">
                            <ResultIcon type={item.type} />
                          </div>
                          <div className="search-result-text">
                            <span className="search-result-title">{item.label}</span>
                            {item.description && (
                              <span className="search-result-desc">{item.description}</span>
                            )}
                          </div>
                          <ArrowRight size={14} strokeWidth={1.5} className="search-result-arrow" />
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="search-modal-hints">
              <p className="search-modal-empty text-muted">
                {isEs
                  ? 'Escribe para buscar actividades, entrenamientos, o ir a una página...'
                  : 'Type to search activities, workouts, or navigate to a page...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
