import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flag, Plus, CalendarDays, ListChecks } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'
import { Calendar } from './Calendar'

type Tab = 'plan' | 'calendar'

export function Plan({ initialTab = 'plan' }: { initialTab?: Tab } = {}) {
  const { language } = useI18n()
  const isEs = language === 'es'
  const [tab, setTab] = useState<Tab>(initialTab)

  return (
    <div className="page-plan">
      <div className="page-header">
        <h2>{isEs ? 'Plan' : 'Plan'}</h2>
        <button type="button" className="btn-primary btn-sm">
          <Plus size={16} />
          <span>{isEs ? 'Crear plan' : 'Create plan'}</span>
        </button>
      </div>

      {/* Plan / Calendar view switch */}
      <div className="seg-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'plan'}
          className={`seg-tab${tab === 'plan' ? ' active' : ''}`}
          onClick={() => setTab('plan')}
        >
          <ListChecks size={15} />
          <span>{isEs ? 'Plan' : 'Plan'}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'calendar'}
          className={`seg-tab${tab === 'calendar' ? ' active' : ''}`}
          onClick={() => setTab('calendar')}
        >
          <CalendarDays size={15} />
          <span>{isEs ? 'Calendario' : 'Calendar'}</span>
        </button>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {tab === 'plan' ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">
                <Flag size={24} />
              </div>
              <h3>{isEs ? 'Sin plan activo' : 'No active plan'}</h3>
              <p>
                {isEs
                  ? 'Crea un plan de entrenamiento o pídele al coach IA que genere uno según tu objetivo.'
                  : 'Create a training plan or ask the AI coach to generate one for your goal.'}
              </p>
              <Link to="/app/ia-coach" className="btn-secondary">
                {isEs ? 'Generar con IA' : 'Generate with AI'}
              </Link>
            </div>
          </div>
        ) : (
          <Calendar embedded />
        )}
      </motion.div>
    </div>
  )
}
