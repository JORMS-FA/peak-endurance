import type { PendingAiAction, TrainingSession } from './types'

export function createAiProposal(params: {
  kind: PendingAiAction['kind']
  selectedSession: TrainingSession | null
  selectedDate: string
}) {
  const targetSession = params.selectedSession

  if (params.kind === 'detect_fatigue' && targetSession) {
    return {
      id: `ai-${params.kind}-${targetSession.id}`,
      kind: params.kind,
      headline: 'Reducir carga del siguiente bloque',
      summary: 'La carga reciente sugiere fatiga alta. Propongo bajar volumen y TSS del siguiente trabajo intenso.',
      reason: 'ATL alto, TSB bajo y carrera cercana.',
      impact: 'Menor fatiga residual y mejor disposicion para el proximo pico.',
      needsConfirmation: true,
      sessionEdits: [
        {
          sessionId: targetSession.id,
          patch: {
            title: `${targetSession.title} - descarga`,
            durationMinutes: Math.max(40, targetSession.durationMinutes - 20),
            tss: Math.max(20, targetSession.tss - 18),
            notes: `${targetSession.notes} Ajuste IA: bajar carga y mantener calidad controlada.`,
          },
        },
      ],
    } satisfies PendingAiAction
  }

  if (params.kind === 'adjust_plan' && targetSession) {
    return {
      id: `ai-${params.kind}-${targetSession.id}`,
      kind: params.kind,
      headline: 'Mover intensidad al dia siguiente',
      summary: 'La IA propone una version mas limpia del bloque para proteger recuperacion y sostener forma.',
      reason: 'Mejor distribucion de carga segun el contexto global.',
      impact: 'Mas claridad en la semana y menor riesgo de acumulacion innecesaria.',
      needsConfirmation: true,
      sessionEdits: [
        {
          sessionId: targetSession.id,
          patch: {
            title: `Ajustado - ${targetSession.title}`,
            tss: Math.max(25, targetSession.tss - 10),
            notes: `${targetSession.notes} Ajuste IA: se prioriza control de FC y calidad del bloque.`,
          },
        },
      ],
    } satisfies PendingAiAction
  }

  return {
    id: `ai-${params.kind}-${params.selectedDate}`,
    kind: params.kind,
    headline: 'Resumen de semana con accion sugerida',
    summary: 'La IA detecta una semana utilizable y recomienda revisar la siguiente sesion clave con foco en recuperacion.',
    reason: 'El contexto global muestra buena carga, pero con margen de ajuste fino.',
    impact: 'Mas consistencia y menos decisiones improvisadas.',
    needsConfirmation: true,
    sessionEdits: targetSession
      ? [
          {
            sessionId: targetSession.id,
            patch: {
              notes: `${targetSession.notes} Sugerencia IA: revisar sensaciones antes de salir.`,
            },
          },
        ]
      : [],
  } satisfies PendingAiAction
}
