/** 详情页工艺/用途说明 key（文案在 i18n calc.pages.thread-table） */

export function getUsageNoteKey(row) {
  if (row.sealing === 'taper_seal') return 'usageTaperSeal'
  if (row.sealing === 'parallel_seal') return 'usageParallelSeal'
  if (row.system === 'metric' || row.system === 'unc' || row.system === 'unf') return 'usageFastener'
  return 'usageGeneral'
}

export function getProcessNoteKeys(row) {
  const keys = ['processTapDrill']
  if (row.system === 'metric') keys.push('processMetricTap')
  if (row.system === 'unc' || row.system === 'unf') keys.push('processUnifiedTap')
  if (['npt', 'g', 'r'].includes(row.system)) keys.push('processPipeSeal')
  return keys
}

export function getToleranceNoteKey(row) {
  if (row.system === 'metric') return 'toleranceMetricDefault'
  if (row.system === 'unc' || row.system === 'unf') return 'toleranceUnifiedDefault'
  return 'tolerancePipeDefault'
}
