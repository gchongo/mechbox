/** 详情页工艺/用途说明 key（文案在 i18n calc.pages.thread-table） */

export function getUsageNoteKey(row) {
  if (row.sealing === 'taper_seal') return 'usageTaperSeal'
  if (row.sealing === 'parallel_seal') return 'usageParallelSeal'
  if (row.sealing === 'dry_seal') return 'usageDrySeal'
  if (row.system === 'tr' || row.system === 'acme') return 'usagePower'
  if (row.system === 'metric' || row.system === 'unc' || row.system === 'unf' || row.system === 'unef') {
    return 'usageFastener'
  }
  if (row.system === 'bsw' || row.system === 'bsf') return 'usageLegacy'
  return 'usageGeneral'
}

export function getProcessNoteKeys(row) {
  const keys = ['processTapDrill']
  if (row.system === 'metric') keys.push('processMetricTap')
  if (row.system === 'unc' || row.system === 'unf' || row.system === 'unef') keys.push('processUnifiedTap')
  if (row.system === 'tr') keys.push('processTrapezoidalTap')
  if (row.system === 'acme') keys.push('processAcmeTap')
  if (['npt', 'nptf', 'g', 'r'].includes(row.system)) keys.push('processPipeSeal')
  return keys
}

export function getToleranceNoteKey(row) {
  if (row.system === 'metric') return 'toleranceMetricDefault'
  if (row.system === 'unc' || row.system === 'unf' || row.system === 'unef') return 'toleranceUnifiedDefault'
  if (row.system === 'tr') return 'toleranceTrDefault'
  if (row.system === 'acme') return 'toleranceAcmeDefault'
  return 'tolerancePipeDefault'
}
