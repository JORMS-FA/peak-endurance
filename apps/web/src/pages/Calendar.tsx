import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../hooks/useI18n'

export function Calendar() {
  const { t } = useI18n()
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate()
  const firstDayOfWeek = (new Date(currentMonth.year, currentMonth.month, 1).getDay() + 6) % 7
  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
  })

  function prevMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { ...prev, month: prev.month - 1 }
    })
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { ...prev, month: prev.month + 1 }
    })
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="page-calendar">
      <div className="page-header">
        <h2>{t('calendar')}</h2>
      </div>

      <div className="calendar-card">
        <div className="calendar-nav">
          <button type="button" className="icon-btn" onClick={prevMonth}>
            <ChevronLeft size={18} />
          </button>
          <h3 className="calendar-month-title">{monthName}</h3>
          <button type="button" className="icon-btn" onClick={nextMonth}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="calendar-weekdays">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((day, i) => (
            <div
              key={i}
              className={`calendar-cell${day ? '' : ' empty'}${
                day === new Date().getDate() &&
                currentMonth.month === new Date().getMonth() &&
                currentMonth.year === new Date().getFullYear()
                  ? ' today'
                  : ''
              }`}
            >
              {day && <span className="calendar-day">{day}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="empty-state">
          <p>{t('noData')}</p>
          <small>{t('connectSource')}</small>
        </div>
      </div>
    </div>
  )
}
