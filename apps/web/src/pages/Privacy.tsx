import { Link } from 'react-router-dom'
import { useI18n } from '../hooks/useI18n'

export function Privacy() {
  const { language } = useI18n()
  const isEs = language === 'es'

  return (
    <div className="legal-page">
      <div className="legal-header">
        <Link to="/" className="legal-back">← {isEs ? 'Volver' : 'Back'}</Link>
        <h1>{isEs ? 'Politica de Privacidad' : 'Privacy Policy'}</h1>
        <p className="text-muted">{isEs ? 'Ultima actualizacion: 21 de junio de 2026' : 'Last updated: June 21, 2026'}</p>
      </div>

      <div className="legal-content">
        <section>
          <h2>1. {isEs ? 'Informacion que recopilamos' : 'Information we collect'}</h2>
          <p>{isEs
            ? 'Recopilamos informacion que nos proporcionas directamente al crear una cuenta, como tu correo electronico y nombre. Tambien recopilamos datos de rendimiento deportivo cuando conectas Strava u otros servicios.'
            : 'We collect information you provide directly when creating an account, such as your email and name. We also collect sports performance data when you connect Strava or other services.'}</p>
          <ul>
            <li>{isEs ? 'Informacion de cuenta (email, nombre)' : 'Account information (email, name)'}</li>
            <li>{isEs ? 'Datos de actividades deportivas (distancia, duracion, frecuencia cardiaca)' : 'Sports activity data (distance, duration, heart rate)'}</li>
            <li>{isEs ? 'Tokens de conexion con terceros (cifrados)' : 'Third-party connection tokens (encrypted)'}</li>
            <li>{isEs ? 'Datos de uso de la plataforma' : 'Platform usage data'}</li>
          </ul>
        </section>

        <section>
          <h2>2. {isEs ? 'Como usamos tu informacion' : 'How we use your information'}</h2>
          <p>{isEs
            ? 'Usamos tu informacion para proporcionar y mejorar nuestros servicios de coaching deportivo con IA.'
            : 'We use your information to provide and improve our AI sports coaching services.'}</p>
          <ul>
            <li>{isEs ? 'Calcular metricas de rendimiento (TSS, CTL, ATL, TSB)' : 'Calculate performance metrics (TSS, CTL, ATL, TSB)'}</li>
            <li>{isEs ? 'Generar recomendaciones personalizadas de entrenamiento' : 'Generate personalized training recommendations'}</li>
            <li>{isEs ? 'Sincronizar tus actividades entre plataformas' : 'Sync your activities across platforms'}</li>
            <li>{isEs ? 'Comunicarnos contigo sobre tu cuenta' : 'Communicate with you about your account'}</li>
          </ul>
        </section>

        <section>
          <h2>3. {isEs ? 'Compartir informacion' : 'Information sharing'}</h2>
          <p>{isEs
            ? 'No vendemos tu informacion personal. Compartimos datos solo con:'
            : 'We do not sell your personal information. We only share data with:'}</p>
          <ul>
            <li><strong>Supabase</strong> — {isEs ? 'Alojamiento de base de datos y autenticacion' : 'Database hosting and authentication'}</li>
            <li><strong>Strava</strong> — {isEs ? 'Para sincronizar tus actividades (solo con tu permiso)' : 'To sync your activities (only with your permission)'}</li>
            <li><strong>Google AI</strong> — {isEs ? 'Para generar recomendaciones de IA (los datos se envian de forma anonima)' : 'To generate AI recommendations (data is sent anonymously)'}</li>
            <li><strong>Stripe</strong> — {isEs ? 'Para procesar pagos (no almacenamos datos de tarjeta)' : 'To process payments (we do not store card data)'}</li>
          </ul>
        </section>

        <section>
          <h2>4. {isEs ? 'Seguridad de datos' : 'Data security'}</h2>
          <p>{isEs
            ? 'Implementamos medidas de seguridad estandar de la industria incluyendo cifrado en transito (TLS) y en reposo, Row Level Security (RLS) en la base de datos, y tokens de acceso con expiracion.'
            : 'We implement industry-standard security measures including encryption in transit (TLS) and at rest, Row Level Security (RLS) on the database, and expiring access tokens.'}</p>
        </section>

        <section>
          <h2>5. {isEs ? 'Tus derechos' : 'Your rights'}</h2>
          <p>{isEs ? 'Tienes derecho a:' : 'You have the right to:'}</p>
          <ul>
            <li>{isEs ? 'Acceder a tus datos personales' : 'Access your personal data'}</li>
            <li>{isEs ? 'Corregir datos inexactos' : 'Correct inaccurate data'}</li>
            <li>{isEs ? 'Eliminar tu cuenta y todos tus datos' : 'Delete your account and all your data'}</li>
            <li>{isEs ? 'Exportar tus datos en formato JSON' : 'Export your data in JSON format'}</li>
            <li>{isEs ? 'Revocar conexiones con terceros en cualquier momento' : 'Revoke third-party connections at any time'}</li>
          </ul>
        </section>

        <section>
          <h2>6. {isEs ? 'Retencion de datos' : 'Data retention'}</h2>
          <p>{isEs
            ? 'Conservamos tus datos mientras tu cuenta este activa. Si eliminas tu cuenta, todos tus datos se borran permanentemente en un plazo de 30 dias.'
            : 'We retain your data while your account is active. If you delete your account, all your data is permanently deleted within 30 days.'}</p>
        </section>

        <section>
          <h2>7. {isEs ? 'Cookies' : 'Cookies'}</h2>
          <p>{isEs
            ? 'Usamos cookies esenciales para mantener tu sesion activa. No usamos cookies de rastreo o publicidad de terceros.'
            : 'We use essential cookies to keep your session active. We do not use third-party tracking or advertising cookies.'}</p>
        </section>

        <section>
          <h2>8. {isEs ? 'Contacto' : 'Contact'}</h2>
          <p>{isEs
            ? 'Para preguntas sobre privacidad, contactanos en: privacy@peakendurance.app'
            : 'For privacy questions, contact us at: privacy@peakendurance.app'}</p>
        </section>

        <section className="legal-disclaimer">
          <p><strong>{isEs ? 'Aviso medico:' : 'Medical disclaimer:'}</strong> {isEs
            ? 'Peak Endurance no es un sustituto del consejo medico profesional. Consulta a un medico antes de iniciar cualquier programa de entrenamiento.'
            : 'Peak Endurance is not a substitute for professional medical advice. Consult a doctor before starting any training program.'}</p>
        </section>
      </div>
    </div>
  )
}
