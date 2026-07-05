/** 螺纹术语表 — key 对应 calc.pages.thread-table.{key} */

export const THREAD_GLOSSARY_GROUPS = [
  {
    id: 'basic',
    titleKey: 'glossaryGroup_basic',
    items: [
      { key: 'term_designation', labelKey: 'colDesignation' },
      { key: 'term_pitch', labelKey: 'colPitch' },
      { key: 'term_tpi', labelKey: 'colTpiPitch' },
      { key: 'term_major', labelKey: 'colMajor' },
      { key: 'term_pitchDia', labelKey: 'colPitchDia' },
      { key: 'term_minor', labelKey: 'colMinor' },
    ],
  },
  {
    id: 'system',
    titleKey: 'glossaryGroup_system',
    items: [
      { key: 'term_purpose', labelKey: 'metaField_purpose' },
      { key: 'term_profile', labelKey: 'metaField_profile' },
      { key: 'term_threadAngle', labelKey: 'metaField_angle' },
      { key: 'term_parentShape', labelKey: 'metaField_parentShape' },
      { key: 'term_taper', labelKey: 'colTaper' },
      { key: 'term_sealing', labelKey: 'colSealing' },
      { key: 'term_hand', labelKey: 'metaField_hand' },
      { key: 'term_starts', labelKey: 'metaField_starts' },
    ],
  },
  {
    id: 'tolerance',
    titleKey: 'glossaryGroup_tolerance',
    items: [
      { key: 'term_toleranceExt', labelKey: 'colToleranceExt' },
      { key: 'term_toleranceInt', labelKey: 'colToleranceInt' },
      { key: 'term_tapDrill', labelKey: 'colTapDrill' },
      { key: 'term_priority', labelKey: 'colPriority' },
      { key: 'term_standard', labelKey: 'colStandard' },
    ],
  },
]
