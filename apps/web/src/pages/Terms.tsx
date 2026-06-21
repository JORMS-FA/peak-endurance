import { Link } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'

export function Terms() {
  const { language } = useI18n()
  const isEs = language === 'es'

  return (
    <div className="legal-page">
      <div className="legal-header">
        <Link to="/" className="legal-back">← {isEs ? 'Volver' : 'Back'}</Link>
        <h1>{isEs ? 'Terminos de Servicio' : 'Terms of Service'}</h1>
        <p className="text-muted">{isEs ? 'Ultima actualizacion: 21 de junio de 2026' : 'Last updated: June 21, 2026'}</p>
      </div>

      <div className="legal-content">
        <section>
          <h2>1. {isEs ? 'Aceptacion de terminos' : 'Acceptance of terms'}</h2>
          <p>{isEs
            ? 'Al acceder o usar Peak Endurance, aceptas estos terminos de servicio. Si no estas de acuerdo, no uses el servicio.'
            : 'By accessing or using Peak Endurance, you agree to these terms of service. If you do not agree, do not use the service.'}</p>
        </section>

        <section>
          <h2>2. {isEs ? 'Descripcion del servicio' : 'Service description'}</h2>
          <p>{isEs
            ? 'Peak Endurance es una plataforma de entrenamiento deportivo que ofrece analisis de datos, planificacion de entrenamiento y coaching con inteligencia artificial para atletas de resistencia.'
            : 'Peak Endurance is a sports training platform that offers data analysis, training planning, and AI coaching for endurance athletes.'}</p>
        </section>

        <section>
          <h2>3. {isEs ? 'Cuentas de usuario' : 'User accounts'}</h2>
          <ul>
            <li>{isEs ? 'Debes tener al menos 16 anos para usar el servicio.' : 'You must be at least 16 years old to use the service.'}</li>
            <li>{isEs ? 'Eres responsable de mantener la seguridad de tu cuenta.' : 'You are responsible for maintaining the security of your account.'}</li>
            <li>{isEs ? 'No compartas tus credenciales con terceros.' : 'Do not share your credentials with third parties.'}</li>
            <li>{isEs ? 'Una cuenta por persona.' : 'One account per person.'}</li>
          </ul>
        </section>

        <section>
          <h2>4. {isEs ? 'Planes y precios' : 'Plans and pricing'}</h2>
          <ul>
            <li><strong>{isEs ? 'Plan Gratuito:' : 'Free Plan:'}</strong> {isEs
              ? 'Conexion Strava, dashboard con metricas, 20 consultas IA/mes (requiere tu propia API key de Google AI Studio).'
              : 'Strava connection, dashboard with metrics, 20 AI queries/month (requires your own Google AI Studio API key).'}</li>
            <li><strong>{isEs ? 'Plan Pro ($10/mes):' : 'Pro Plan ($10/month):'}</strong> {isEs
              ? '200 consultas IA/mes con modelos del servidor, planes multi-deporte personalizados, analisis avanzado, soporte prioritario.'
              : '200 AI queries/month with server models, personalized multi-sport plans, advanced analytics, priority support.'}</li>
          </ul>
        </section>

        <section>
          <h2>5. {isEs ? 'Pagos y suscripciones' : 'Payments and subscriptions'}</h2>
          <ul>
            <li>{isEs ? 'Los pagos se procesan a traves de Stripe.' : 'Payments are processed through Stripe.'}</li>
            <li>{isEs ? 'Las suscripciones se renuevan automaticamente.' : 'Subscriptions renew automatically.'}</li>
            <li>{isEs ? 'Puedes cancelar en cualquier momento desde Ajustes.' : 'You can cancel at any time from Settings.'}</li>
            <li>{isEs ? 'Al cancelar, mantienes acceso Pro hasta el final del periodo pagado.' : 'Upon canceling, you retain Pro access until the end of the paid period.'}</li>
            <li>{isEs ? 'No se ofrecen reembolsos por periodos parciales.' : 'No refunds are offered for partial periods.'}</li>
          </ul>
        </section>

        <section>
          <h2>6. {isEs ? 'API Keys de terceros (BYOK)' : 'Third-party API keys (BYOK)'}</h2>
          <p>{isEs
            ? 'Si usas tu propia API key de Google AI Studio en el plan gratuito:'
            : 'If you use your own Google AI Studio API key on the free plan:'}</p>
          <ul>
            <li>{isEs ? 'Eres responsable de los costos asociados a tu clave.' : 'You are responsible for costs associated with your key.'}</li>
            <li>{isEs ? 'Peak Endurance almacena tu clave de forma segura y solo la usa para generar respuestas de IA en tu nombre.' : 'Peak Endurance stores your key securely and only uses it to generate AI responses on your behalf.'}</li>
            <li>{isEs ? 'Puedes eliminar tu clave en cualquier momento.' : 'You can delete your key at any time.'}</li>
          </ul>
        </section>

        <section>
          <h2>7. {isEs ? 'Uso aceptable' : 'Acceptable use'}</h2>
          <p>{isEs ? 'No esta permitido:' : 'You may not:'}</p>
          <ul>
            <li>{isEs ? 'Usar el servicio para actividades ilegales.' : 'Use the service for illegal activities.'}</li>
            <li>{isEs ? 'Intentar acceder a datos de otros usuarios.' : 'Attempt to access other users data.'}</li>
            <li>{isEs ? 'Automatizar el acceso al servicio sin permiso.' : 'Automate access to the service without permission.'}</li>
            <li>{isEs ? 'Revender o redistribuir el servicio.' : 'Resell or redistribute the service.'}</li>
          </ul>
        </section>

        <section>
          <h2>8. {isEs ? 'Limitacion de responsabilidad' : 'Limitation of liability'}</h2>
          <p>{isEs
            ? 'Peak Endurance se proporciona "tal cual". No garantizamos resultados deportivos especificos. No somos responsables de lesiones derivadas de seguir recomendaciones de la IA.'
            : 'Peak Endurance is provided "as is". We do not guarantee specific sports results. We are not liable for injuries resulting from following AI recommendations.'}</p>
        </section>

        <section>
          <h2>9. {isEs ? 'Propiedad intelectual' : 'Intellectual property'}</h2>
          <p>{isEs
            ? 'Tus datos deportivos son tuyos. El software, diseno y marca Peak Endurance son propiedad del equipo de desarrollo. Los datos de Strava estan sujetos a los terminos de uso de Strava.'
            : 'Your sports data belongs to you. The Peak Endurance software, design, and brand are owned by the development team. Strava data is subject to Strava\'s terms of use.'}</p>
        </section>

        <section>
          <h2>10. {isEs ? 'Cambios en los terminos' : 'Changes to terms'}</h2>
          <p>{isEs
            ? 'Podemos actualizar estos terminos. Te notificaremos por email sobre cambios significativos con al menos 30 dias de anticipacion.'
            : 'We may update these terms. We will notify you by email of significant changes at least 30 days in advance.'}</p>
        </section>

        <section>
          <h2>11. {isEs ? 'Contacto' : 'Contact'}</h2>
          <p>{isEs
            ? 'Para preguntas sobre estos terminos: legal@peakendurance.app'
            : 'For questions about these terms: legal@peakendurance.app'}</p>
        </section>

        <section className="legal-disclaimer">
          <p><strong>{isEs ? 'Aviso medico:' : 'Medical disclaimer:'}</strong> {isEs
            ? 'Este servicio no constituye consejo medico. Las recomendaciones de la IA son orientativas y no sustituyen la opinion de un profesional de la salud. Consulta a tu medico antes de iniciar cualquier programa de entrenamiento.'
            : 'This service does not constitute medical advice. AI recommendations are advisory and do not replace the opinion of a healthcare professional. Consult your doctor before starting any training program.'}</p>
        </section>
      </div>
    </div>
  )
}
