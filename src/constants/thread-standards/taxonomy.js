/**
 * 螺纹总分类注册表 — 按用途 / 牙型 / 标准体系 / 结构维度统一描述
 * 已实现规格表者 catalog 指向 THREAD_SYSTEMS；其余为参考元数据（implemented: false）
 */

/** @typedef {'fastener'|'pipe'|'power'|'special'} ThreadPurposeId */
/** @typedef {'triangular'|'trapezoidal'|'square'|'buttress'|'round'|'ball_screw'} ThreadProfileId */
/** @typedef {'cylindrical'|'conical'} ParentShapeId */
/** @typedef {'parallel'|'taper'} TaperKindId */
/** @typedef {'none'|'taper_metal'|'gasket'|'dry_seal'} SealingKindId */

/**
 * @typedef {object} ThreadSystemDef
 * @property {string} id
 * @property {ThreadPurposeId} purpose
 * @property {boolean} implemented
 * @property {{ system: string, subTab: string }|null} catalog
 * @property {ThreadProfileId} profile
 * @property {number|null} angle
 * @property {ParentShapeId} parentShape
 * @property {TaperKindId} taper
 * @property {SealingKindId} sealing
 * @property {('RH'|'LH')[]} hand
 * @property {('single'|'multi')[]} starts
 * @property {'mm'|'in'|null} unit
 * @property {string[]} standards
 * @property {number} [diagramAngle]
 */

export const THREAD_PURPOSE_ORDER = /** @type {ThreadPurposeId[]} */ ([
  'fastener',
  'pipe',
  'power',
  'special',
])

/** @type {Record<ThreadPurposeId, string[]>} */
export const PURPOSE_SYSTEM_IDS = {
  fastener: [
    'metric_coarse',
    'metric_fine',
    'unc',
    'unf',
    'unef',
    'uns',
    'whitworth',
    'bsw',
    'bsf',
  ],
  pipe: [
    'npt',
    'nptf',
    'nps',
    'npsm',
    'bspp_g',
    'bspt_r',
    'bspt_rc',
    'bspt_rp',
  ],
  power: ['tr', 'acme', 'square', 'buttress', 'ball_screw'],
  special: ['rd', 'knuckle', 'arc_round', 'industry_custom'],
}

/** @type {Record<string, ThreadSystemDef>} */
export const THREAD_SYSTEM_REGISTRY = {
  metric_coarse: {
    id: 'metric_coarse',
    purpose: 'fastener',
    implemented: true,
    catalog: { system: 'metric', subTab: 'coarse' },
    profile: 'triangular',
    angle: 60,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single'],
    unit: 'mm',
    standards: ['ISO 724', 'ISO 965', 'ISO 68-1'],
    diagramAngle: 60,
  },
  metric_fine: {
    id: 'metric_fine',
    purpose: 'fastener',
    implemented: true,
    catalog: { system: 'metric', subTab: 'fine' },
    profile: 'triangular',
    angle: 60,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single'],
    unit: 'mm',
    standards: ['ISO 724', 'ISO 965', 'ISO 68-1'],
    diagramAngle: 60,
  },
  unc: {
    id: 'unc',
    purpose: 'fastener',
    implemented: true,
    catalog: { system: 'unc', subTab: 'unc' },
    profile: 'triangular',
    angle: 60,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single'],
    unit: 'in',
    standards: ['ASME B1.1'],
    diagramAngle: 60,
  },
  unf: {
    id: 'unf',
    purpose: 'fastener',
    implemented: true,
    catalog: { system: 'unf', subTab: 'unf' },
    profile: 'triangular',
    angle: 60,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single'],
    unit: 'in',
    standards: ['ASME B1.1'],
    diagramAngle: 60,
  },
  unef: {
    id: 'unef',
    purpose: 'fastener',
    implemented: true,
    catalog: { system: 'unef', subTab: 'unef' },
    profile: 'triangular',
    angle: 60,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single'],
    unit: 'in',
    standards: ['ASME B1.1'],
    diagramAngle: 60,
  },
  uns: {
    id: 'uns',
    purpose: 'fastener',
    implemented: false,
    catalog: null,
    profile: 'triangular',
    angle: 60,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single', 'multi'],
    unit: 'in',
    standards: ['ASME B1.1'],
    diagramAngle: 60,
  },
  whitworth: {
    id: 'whitworth',
    purpose: 'fastener',
    implemented: false,
    catalog: null,
    profile: 'triangular',
    angle: 55,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single'],
    unit: 'in',
    standards: ['BS 84', 'ISO 7 (legacy W)'],
    diagramAngle: 55,
  },
  bsw: {
    id: 'bsw',
    purpose: 'fastener',
    implemented: false,
    catalog: null,
    profile: 'triangular',
    angle: 55,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single'],
    unit: 'in',
    standards: ['BS 84 BSW'],
    diagramAngle: 55,
  },
  bsf: {
    id: 'bsf',
    purpose: 'fastener',
    implemented: false,
    catalog: null,
    profile: 'triangular',
    angle: 55,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single'],
    unit: 'in',
    standards: ['BS 84 BSF'],
    diagramAngle: 55,
  },
  npt: {
    id: 'npt',
    purpose: 'pipe',
    implemented: true,
    catalog: { system: 'npt', subTab: 'npt' },
    profile: 'triangular',
    angle: 60,
    parentShape: 'conical',
    taper: 'taper',
    sealing: 'taper_metal',
    hand: ['RH'],
    starts: ['single'],
    unit: 'in',
    standards: ['ASME B1.20.1'],
    diagramAngle: 60,
  },
  nptf: {
    id: 'nptf',
    purpose: 'pipe',
    implemented: true,
    catalog: { system: 'nptf', subTab: 'nptf' },
    profile: 'triangular',
    angle: 60,
    parentShape: 'conical',
    taper: 'taper',
    sealing: 'dry_seal',
    hand: ['RH'],
    starts: ['single'],
    unit: 'in',
    standards: ['SAE J476', 'ASME B1.20.3'],
    diagramAngle: 60,
  },
  nps: {
    id: 'nps',
    purpose: 'pipe',
    implemented: false,
    catalog: null,
    profile: 'triangular',
    angle: 60,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'gasket',
    hand: ['RH'],
    starts: ['single'],
    unit: 'in',
    standards: ['ASME B36.10M (NPS nominal)'],
    diagramAngle: 60,
  },
  npsm: {
    id: 'npsm',
    purpose: 'pipe',
    implemented: false,
    catalog: null,
    profile: 'triangular',
    angle: 60,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'gasket',
    hand: ['RH'],
    starts: ['single'],
    unit: 'in',
    standards: ['ASME B1.20.1 (NPSM)'],
    diagramAngle: 60,
  },
  bspp_g: {
    id: 'bspp_g',
    purpose: 'pipe',
    implemented: true,
    catalog: { system: 'g', subTab: 'g' },
    profile: 'triangular',
    angle: 55,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'gasket',
    hand: ['RH'],
    starts: ['single'],
    unit: 'in',
    standards: ['ISO 228-1'],
    diagramAngle: 55,
  },
  bspt_r: {
    id: 'bspt_r',
    purpose: 'pipe',
    implemented: true,
    catalog: { system: 'r', subTab: 'r' },
    profile: 'triangular',
    angle: 55,
    parentShape: 'conical',
    taper: 'taper',
    sealing: 'taper_metal',
    hand: ['RH'],
    starts: ['single'],
    unit: 'in',
    standards: ['ISO 7-1'],
    diagramAngle: 55,
  },
  bspt_rc: {
    id: 'bspt_rc',
    purpose: 'pipe',
    implemented: false,
    catalog: null,
    profile: 'triangular',
    angle: 55,
    parentShape: 'conical',
    taper: 'taper',
    sealing: 'taper_metal',
    hand: ['RH'],
    starts: ['single'],
    unit: 'in',
    standards: ['ISO 7-1 Rc (internal taper)'],
    diagramAngle: 55,
  },
  bspt_rp: {
    id: 'bspt_rp',
    purpose: 'pipe',
    implemented: false,
    catalog: null,
    profile: 'triangular',
    angle: 55,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'gasket',
    hand: ['RH'],
    starts: ['single'],
    unit: 'in',
    standards: ['ISO 228-1 Rp (internal parallel)'],
    diagramAngle: 55,
  },
  tr: {
    id: 'tr',
    purpose: 'power',
    implemented: true,
    catalog: { system: 'tr', subTab: 'tr' },
    profile: 'trapezoidal',
    angle: 30,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single', 'multi'],
    unit: 'mm',
    standards: ['ISO 290', 'DIN 103'],
    diagramAngle: 30,
  },
  acme: {
    id: 'acme',
    purpose: 'power',
    implemented: true,
    catalog: { system: 'acme', subTab: 'acme' },
    profile: 'trapezoidal',
    angle: 29,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single', 'multi'],
    unit: 'in',
    standards: ['ASME B1.5'],
    diagramAngle: 29,
  },
  square: {
    id: 'square',
    purpose: 'power',
    implemented: false,
    catalog: null,
    profile: 'square',
    angle: 0,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single', 'multi'],
    unit: null,
    standards: ['历史/专用标准'],
    diagramAngle: 90,
  },
  buttress: {
    id: 'buttress',
    purpose: 'power',
    implemented: false,
    catalog: null,
    profile: 'buttress',
    angle: 45,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single', 'multi'],
    unit: 'in',
    standards: ['ASME B1.9'],
    diagramAngle: 45,
  },
  ball_screw: {
    id: 'ball_screw',
    purpose: 'power',
    implemented: false,
    catalog: null,
    profile: 'ball_screw',
    angle: null,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single', 'multi'],
    unit: 'mm',
    standards: ['ISO 3408', 'DIN 69051'],
    diagramAngle: 60,
  },
  rd: {
    id: 'rd',
    purpose: 'special',
    implemented: false,
    catalog: null,
    profile: 'round',
    angle: 30,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH'],
    starts: ['single'],
    unit: 'mm',
    standards: ['DIN 405'],
    diagramAngle: 30,
  },
  knuckle: {
    id: 'knuckle',
    purpose: 'special',
    implemented: false,
    catalog: null,
    profile: 'round',
    angle: 30,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH'],
    starts: ['single'],
    unit: 'in',
    standards: ['BS 4827 (historical)'],
    diagramAngle: 30,
  },
  arc_round: {
    id: 'arc_round',
    purpose: 'special',
    implemented: false,
    catalog: null,
    profile: 'round',
    angle: null,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH'],
    starts: ['single'],
    unit: null,
    standards: ['行业专用'],
    diagramAngle: 30,
  },
  industry_custom: {
    id: 'industry_custom',
    purpose: 'special',
    implemented: false,
    catalog: null,
    profile: 'triangular',
    angle: null,
    parentShape: 'cylindrical',
    taper: 'parallel',
    sealing: 'none',
    hand: ['RH', 'LH'],
    starts: ['single', 'multi'],
    unit: null,
    standards: ['按行业图纸'],
    diagramAngle: 60,
  },
}

/** @param {ThreadPurposeId} purposeId */
export function getSystemsForPurpose(purposeId) {
  return (PURPOSE_SYSTEM_IDS[purposeId] ?? [])
    .map((id) => THREAD_SYSTEM_REGISTRY[id])
    .filter(Boolean)
}

/** @param {string} systemId */
export function getThreadSystemDef(systemId) {
  return THREAD_SYSTEM_REGISTRY[systemId] ?? null
}

/** @param {string} catalogSystem @param {string} [subSeries] */
export function resolveTaxonomyFromCatalog(catalogSystem, subSeries) {
  if (catalogSystem === 'metric') {
    return subSeries === 'fine' ? 'metric_fine' : 'metric_coarse'
  }
  const map = {
    unc: 'unc',
    unf: 'unf',
    unef: 'unef',
    tr: 'tr',
    acme: 'acme',
    npt: 'npt',
    nptf: 'nptf',
    g: 'bspp_g',
    r: 'bspt_r',
  }
  return map[catalogSystem] ?? null
}

/** 无尺寸表体系的已收录替代选型（catalog system id） */
export const REFERENCE_CATALOG_ALTERNATIVES = {
  uns: ['unc', 'unf', 'unef'],
  whitworth: ['metric', 'unc', 'unf'],
  bsw: ['metric', 'unc'],
  bsf: ['metric', 'unf'],
  nps: ['npt', 'g'],
  npsm: ['npt', 'g'],
  bspt_rc: ['r'],
  bspt_rp: ['r', 'g'],
  square: ['tr', 'acme'],
  buttress: ['tr', 'acme'],
  ball_screw: ['tr'],
  rd: [],
  knuckle: [],
  arc_round: [],
  industry_custom: [],
}

/** @param {string} taxonomySystemId */
export function getReferenceCatalogAlternatives(taxonomySystemId) {
  return REFERENCE_CATALOG_ALTERNATIVES[taxonomySystemId] ?? []
}

/** @param {string} catalogSystem @param {string} [subSeries] */
export function catalogAlternativeToQuery(catalogSystem) {
  if (catalogSystem === 'metric') return { system: 'metric', subSeries: 'coarse' }
  return { system: catalogSystem, subSeries: catalogSystem }
}

/** @param {ThreadPurposeId} purposeId */
export function countImplementedInPurpose(purposeId) {
  return getSystemsForPurpose(purposeId).filter((s) => s.implemented).length
}

/** @returns {ThreadSystemDef[]} */
export function getAllRegisteredSystems() {
  return Object.values(THREAD_SYSTEM_REGISTRY)
}

export const PROFILE_ORDER = ['triangular', 'trapezoidal', 'square', 'buttress', 'round', 'ball_screw']
