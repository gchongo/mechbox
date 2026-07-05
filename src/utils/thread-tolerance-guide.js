/** @typedef {'general'|'close'|'loose'|'coated'|'vibration'|'pipe_ref'} ToleranceScenarioId */

export const TOLERANCE_SCENARIOS = [
  {
    id: 'general',
    systems: ['metric'],
    internal: '6H',
    external: '6g',
    scenarioKey: 'tolSc_general',
    detailKey: 'tolSc_general_detail',
    standardKey: 'wiz_std_metric',
  },
  {
    id: 'close',
    systems: ['metric'],
    internal: '5H',
    external: '6g',
    scenarioKey: 'tolSc_close',
    detailKey: 'tolSc_close_detail',
    standardKey: 'wiz_std_metric',
  },
  {
    id: 'loose',
    systems: ['metric'],
    internal: '6H',
    external: '7g',
    scenarioKey: 'tolSc_loose',
    detailKey: 'tolSc_loose_detail',
    standardKey: 'wiz_std_metric',
  },
  {
    id: 'coated',
    systems: ['metric'],
    internal: '6H',
    external: '6g',
    coatedExternal: '6az',
    scenarioKey: 'tolSc_coated',
    detailKey: 'tolSc_coated_detail',
    standardKey: 'wiz_std_metric',
  },
  {
    id: 'vibration',
    systems: ['metric'],
    internal: '6H',
    external: '6g',
    pitchHintKey: 'tolSc_vibration_pitch',
    scenarioKey: 'tolSc_vibration',
    detailKey: 'tolSc_vibration_detail',
    standardKey: 'wiz_std_metric',
  },
  {
    id: 'unified_commercial',
    systems: ['unc', 'unf'],
    internal: '2B',
    external: '2A',
    scenarioKey: 'tolSc_unified',
    detailKey: 'tolSc_unified_detail',
    standardKey: 'wiz_std_unified',
  },
  {
    id: 'unified_close',
    systems: ['unc', 'unf'],
    internal: '3B',
    external: '3A',
    scenarioKey: 'tolSc_unified_close',
    detailKey: 'tolSc_unified_close_detail',
    standardKey: 'wiz_std_unified',
  },
  {
    id: 'pipe_ref',
    systems: ['npt', 'g', 'r'],
    internal: '—',
    external: '—',
    scenarioKey: 'tolSc_pipe',
    detailKey: 'tolSc_pipe_detail',
    standardKey: 'wiz_std_npt',
  },
]

/**
 * @param {ToleranceScenarioId|string} scenarioId
 * @param {string} [system]
 */
export function getToleranceScenario(scenarioId, system) {
  const scenario = TOLERANCE_SCENARIOS.find((s) => s.id === scenarioId)
  if (!scenario) return null
  if (system && !scenario.systems.includes(system)) {
    return TOLERANCE_SCENARIOS.find((s) => s.systems.includes(system) && s.id === 'general')
      ?? TOLERANCE_SCENARIOS.find((s) => s.systems.includes(system))
      ?? scenario
  }
  return scenario
}

/**
 * @param {string} system
 */
export function listScenariosForSystem(system) {
  return TOLERANCE_SCENARIOS.filter((s) => s.systems.includes(system))
}
