/**
 * 梁挠度与弯曲应力前置估算 (Euler-Bernoulli 梁，解析解)
 */

export const BEAM_CASES = {
  simply_center: {
    id: 'simply_center',
    label: '简支梁 — 跨中集中力',
    loadLabel: '集中力 P (N)',
    deflection: (P, L, E, I) => (P * L ** 3) / (48 * E * I),
    maxMoment: (P, L) => (P * L) / 4,
  },
  cantilever_end: {
    id: 'cantilever_end',
    label: '悬臂梁 — 自由端集中力',
    loadLabel: '集中力 P (N)',
    deflection: (P, L, E, I) => (P * L ** 3) / (3 * E * I),
    maxMoment: (P, L) => P * L,
  },
  simply_uniform: {
    id: 'simply_uniform',
    label: '简支梁 — 均布载荷',
    loadLabel: '线载荷 q (N/mm)',
    deflection: (q, L, E, I) => (5 * q * L ** 4) / (384 * E * I),
    maxMoment: (q, L) => (q * L ** 2) / 8,
  },
  cantilever_uniform: {
    id: 'cantilever_uniform',
    label: '悬臂梁 — 均布载荷',
    loadLabel: '线载荷 q (N/mm)',
    deflection: (q, L, E, I) => (q * L ** 4) / (8 * E * I),
    maxMoment: (q, L) => (q * L ** 2) / 2,
  },
}

export const SECTION_TYPES = {
  solid_round: {
    id: 'solid_round',
    label: '实心圆',
    inertia: (d) => (Math.PI * d ** 4) / 64,
    sectionModulus: (d) => (Math.PI * d ** 3) / 32,
    params: [{ key: 'diameter', label: '直径 d (mm)', default: 30, min: 1 }],
  },
  hollow_round: {
    id: 'hollow_round',
    label: '空心圆管',
    inertia: (d, di) => (Math.PI * (d ** 4 - di ** 4)) / 64,
    sectionModulus: (d, di) => (Math.PI * (d ** 4 - di ** 4)) / (32 * d),
    params: [
      { key: 'diameter', label: '外径 D (mm)', default: 40, min: 1 },
      { key: 'innerDiameter', label: '内径 d (mm)', default: 30, min: 0 },
    ],
  },
  rectangle: {
    id: 'rectangle',
    label: '矩形截面',
    inertia: (b, h) => (b * h ** 3) / 12,
    sectionModulus: (b, h) => (b * h ** 2) / 6,
    params: [
      { key: 'width', label: '宽度 b (mm)', default: 20, min: 1 },
      { key: 'height', label: '高度 h (mm)', default: 30, min: 1 },
    ],
  },
}

function calcSection(sectionType, dims) {
  const sec = SECTION_TYPES[sectionType]
  if (!sec) return { error: '未知截面类型' }

  if (sectionType === 'solid_round') {
    const d = dims.diameter
    return { I: sec.inertia(d), W: sec.sectionModulus(d) }
  }
  if (sectionType === 'hollow_round') {
    const { diameter: D, innerDiameter: d } = dims
    if (d >= D) return { error: '内径须小于外径' }
    return { I: sec.inertia(D, d), W: sec.sectionModulus(D, d) }
  }
  if (sectionType === 'rectangle') {
    const { width: b, height: h } = dims
    return { I: sec.inertia(b, h), W: sec.sectionModulus(b, h) }
  }
  return { error: '截面计算失败' }
}

export function analyzeBeam(input) {
  const beamCase = BEAM_CASES[input.caseId] ?? BEAM_CASES.simply_center
  const section = calcSection(input.sectionType ?? 'solid_round', input)
  if (section.error) return { error: section.error }

  const L = input.spanLength
  const E = input.elasticModulus ?? 210000
  const P = input.load ?? 1000
  const allowStress = input.allowableStress ?? 160
  const allowDeflection = input.allowableDeflection ?? L / 1000

  const deflection = beamCase.deflection(P, L, E, section.I)
  const moment = beamCase.maxMoment(P, L)
  const stress = moment / section.W

  return {
    caseId: beamCase.id,
    caseLabel: beamCase.label,
    spanLength: L,
    load: P,
    elasticModulus: E,
    moment,
    deflection,
    stress,
    inertia: section.I,
    sectionModulus: section.W,
    allowableStress: allowStress,
    allowableDeflection: allowDeflection,
    stressPass: stress <= allowStress,
    deflectionPass: deflection <= allowDeflection,
    pass: stress <= allowStress && deflection <= allowDeflection,
  }
}
