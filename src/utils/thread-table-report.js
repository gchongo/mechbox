/**
 * Build flat PDF sections for thread-table tools (no calc-history).
 * @param {Function} pt - i18n pt from useCalcPage('thread-table')
 */

export function buildDesignWizardPdfSections(result, answers, pt) {
  if (!result) return []
  const sections = [
    {
      heading: pt('wizResultTitle'),
      rows: [
        { label: pt('wizResultSystem'), value: result.systems?.join(', ') || '—' },
        { label: pt('wizResultTolerance'), value: `${result.toleranceInternal} / ${result.toleranceExternal}` },
        { label: pt('wizResultPitch'), value: result.preferFinePitch ? pt('wiz_pitch_fine') : pt('wiz_pitch_coarse') },
        { label: pt('wizResultSizeRange'), value: pt(result.sizeRangeKey) },
      ],
    },
  ]
  if (result.warnings?.length) {
    sections.push({
      heading: pt('wizResultWarningsPdf'),
      text: result.warnings.map((w) => pt(w.key)).join('\n'),
    })
  }
  if (result.processTipKeys?.length) {
    sections.push({
      heading: pt('wizResultProcess'),
      text: result.processTipKeys.map((k) => `• ${pt(k)}`).join('\n'),
    })
  }
  if (answers) {
    sections.push({
      heading: pt('wizAnswersPdf'),
      rows: [
        { label: pt('wizStep_purpose'), value: pt(`wiz_purpose_${answers.purpose}`) },
        { label: pt('wizStep_unit'), value: pt(`wiz_unit_${answers.unit}`) },
        { label: pt('wizStep_process'), value: pt(`wiz_process_${answers.process}`) },
      ],
    })
  }
  sections.push({ heading: pt('dataDisclaimer'), text: pt('dataDisclaimer') })
  return sections
}

export function buildEngagementPdfSections(result, pt) {
  if (!result?.ok) return [{ heading: pt('engTitle'), text: pt(result?.errorKey || 'eng_error') }]
  return [
    {
      heading: pt('engTitle'),
      rows: [
        { label: pt('engDesignation'), value: result.designation },
        { label: pt('engMinLength'), value: `${result.minEngagement.toFixed(2)} mm` },
        { label: pt('engRecommendLength'), value: `${result.recommendedEngagement.toFixed(2)} mm` },
        { label: pt('engInputLength'), value: `${result.engagedLength.toFixed(2)} mm` },
        { label: pt('engPassMin'), value: result.passMin ? pt('engPass') : pt('engFail') },
      ],
    },
    { heading: pt('dataDisclaimer'), text: pt('engDisclaimer') },
  ]
}

export function buildTapDrillPdfSections(result, pt) {
  if (!result?.ok) return [{ heading: pt('tapTitle'), text: pt(result?.errorKey || 'tap_error') }]
  return [
    {
      heading: pt('tapTitle'),
      rows: [
        { label: pt('colDesignation'), value: result.row.designation },
        { label: pt('tapBaseDrill'), value: `${result.baseDrill} ${result.unit}` },
        { label: pt('tapRecommendDrill'), value: `${result.recommendedDrill} ${result.unit}` },
        { label: pt('tapMaterial'), value: pt(`wiz_material_${result.material}`) },
        { label: pt('tapHoleType'), value: pt(`tapHole_${result.holeType}`) },
      ],
    },
    {
      heading: pt('tapTipsPdf'),
      text: result.tipKeys.map((k) => `• ${pt(k)}`).join('\n'),
    },
    { heading: pt('dataDisclaimer'), text: pt('tapDisclaimer') },
  ]
}

export function buildTolerancePdfSections(scenario, system, pt) {
  if (!scenario) return []
  return [
    {
      heading: pt('tolGuideTitle'),
      rows: [
        { label: pt('tolScenario'), value: pt(scenario.scenarioKey) },
        { label: pt('detailSystem'), value: pt(`system_${system}`) },
        { label: pt('colToleranceInt'), value: scenario.internal },
        { label: pt('colToleranceExt'), value: scenario.external },
      ],
    },
    { heading: pt('tolDetail'), text: pt(scenario.detailKey) },
    { heading: pt('dataDisclaimer'), text: pt('tolDisclaimer') },
  ]
}
