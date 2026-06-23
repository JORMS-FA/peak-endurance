import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, KeyRound, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStripe } from '../../hooks/useStripe'
import { useI18n } from '../../hooks/useI18n'

// Multicolor subscription paywall: monthly / annual toggle, big credits, BYOK
// alternative. Shown when the AI Coach is locked.
export function Paywall() {
  const { language } = useI18n()
  const isEs = language === 'es'
  const { checkout, loading } = useStripe()
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('yearly')

  const price = interval === 'monthly' ? 'COP$37.000' : 'COP$355.000'
  const per = interval === 'monthly' ? (isEs ? '/mes' : '/mo') : (isEs ? '/año' : '/yr')
  const save = isEs ? 'Ahorra 20%' : 'Save 20%'

  const features = isEs
    ? ['500 consultas de IA al mes', 'Chat ilimitado con el coach', 'Planes generados por IA', 'Múltiples modelos (Gemini, GPT, Claude)', 'Soporte prioritario']
    : ['500 AI queries / month', 'Unlimited coach chat', 'AI-generated plans', 'Multiple models (Gemini, GPT, Claude)', 'Priority support']

  return (
    <motion.div
      className="paywall"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="paywall-glow" aria-hidden />
      <div className="paywall-head">
        <span className="paywall-badge"><Crown size={13} /> PRO</span>
        <h3>{isEs ? 'Desbloquea tu coach de IA' : 'Unlock your AI coach'}</h3>
        <p>{isEs ? 'Análisis, ajustes y entrenamientos creados por IA, sin límites prácticos.' : 'AI analysis, adjustments and workouts, with practical no limits.'}</p>
      </div>

      <div className="paywall-toggle">
        <button type="button" className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>
          {isEs ? 'Mensual' : 'Monthly'}
        </button>
        <button type="button" className={interval === 'yearly' ? 'active' : ''} onClick={() => setInterval('yearly')}>
          {isEs ? 'Anual' : 'Annual'} <span className="paywall-save">{save}</span>
        </button>
      </div>

      <div className="paywall-price">
        <strong>{price}</strong><span>{per}</span>
      </div>

      <ul className="paywall-features">
        {features.map((f) => (
          <li key={f}><Check size={15} /> {f}</li>
        ))}
      </ul>

      <button type="button" className="paywall-cta" onClick={() => checkout(interval)} disabled={loading}>
        <Sparkles size={16} />
        {loading ? '...' : isEs ? 'Empezar con Pro' : 'Start with Pro'}
      </button>

      <div className="paywall-alt">
        <span>{isEs ? 'o usa tu propia API key gratis' : 'or use your own API key for free'}</span>
        <Link to="/app/ajustes" className="paywall-byok">
          <KeyRound size={14} /> {isEs ? 'Configurar API key (BYOK)' : 'Set up API key (BYOK)'}
        </Link>
      </div>
    </motion.div>
  )
}
