import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, KeyRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStripe } from '../../hooks/useStripe'
import { useI18n } from '../../hooks/useI18n'

// Compact, theme-matching subscription paywall (monthly / annual).
export function Paywall() {
  const { language } = useI18n()
  const isEs = language === 'es'
  const { checkout, loading } = useStripe()
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')

  const price = interval === 'monthly' ? 'COP$30.000' : 'COP$300.000'
  const per = interval === 'monthly' ? (isEs ? '/mes' : '/mo') : (isEs ? '/año' : '/yr')

  const features = isEs
    ? ['500 consultas de IA al mes', 'Chat ilimitado con el coach', 'Planes generados por IA', 'Sin anuncios', 'Soporte prioritario']
    : ['500 AI queries / month', 'Unlimited coach chat', 'AI-generated plans', 'No ads', 'Priority support']

  return (
    <motion.div
      className="card paywall2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="paywall2-top">
        <div className="paywall2-title">
          <span className="paywall2-badge">PRO</span>
          <strong>{isEs ? 'Desbloquea tu coach de IA' : 'Unlock your AI coach'}</strong>
        </div>
        <div className="paywall2-toggle">
          <button type="button" className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>
            {isEs ? 'Mensual' : 'Monthly'}
          </button>
          <button type="button" className={interval === 'yearly' ? 'active' : ''} onClick={() => setInterval('yearly')}>
            {isEs ? 'Anual' : 'Annual'}
            <span className="paywall2-save">−17%</span>
          </button>
        </div>
      </div>

      <div className="paywall2-body">
        <div className="paywall2-price">
          <strong>{price}</strong><span>{per}</span>
        </div>
        <ul className="paywall2-features">
          {features.map((f) => (<li key={f}><Check size={14} /> {f}</li>))}
        </ul>
      </div>

      <div className="paywall2-actions">
        <button type="button" className="paywall2-cta" onClick={() => checkout(interval)} disabled={loading}>
          <Sparkles size={15} />
          {loading ? '...' : isEs ? 'Empezar con Pro' : 'Start with Pro'}
        </button>
        <Link to="/app/ajustes" className="paywall2-byok">
          <KeyRound size={13} /> {isEs ? 'o usa tu API key gratis' : 'or use your API key free'}
        </Link>
      </div>
    </motion.div>
  )
}
