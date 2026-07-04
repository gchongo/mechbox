/**
 * 梁挠度与弯曲应力前置估算 (Euler-Bernoulli 梁，解析解)
 */

import { findMaterial } from '@/constants/materials'
import { assessComponentFatigue } from '@/utils/fatigue-calc'

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
  if (!sec) return { errorKey: 'unknown_section' }

  if (sectionType === 'solid_round') {
    const d = dims.diameter
    return { I: sec.inertia(d), W: sec.sectionModulus(d) }
  }
  if (sectionType === 'hollow_round') {
    const { diameter: D, innerDiameter: d } = dims
    if (d >= D) return { errorKey: 'inner_gte_outer' }
    return { I: sec.inertia(D, d), W: sec.sectionModulus(D, d) }
  }
  if (sectionType === 'rectangle') {
    const { width: b, height: h } = dims
    return { I: sec.inertia(b, h), W: sec.sectionModulus(b, h) }
  }
  return { errorKey: 'section_calc_failed' }
}

export function analyzeBeam(input) {
  const calcMode = input.calcMode ?? 'simple'
  const beamCase = BEAM_CASES[input.caseId] ?? BEAM_CASES.simply_center
  const section = calcSection(input.sectionType ?? 'solid_round', input)
  if (section.errorKey) return { errorKey: section.errorKey, calcMode }

  const L = input.spanLength
  const mat = input.materialId ? findMaterial(input.materialId) : null
  const E = input.elasticModulus ?? mat?.E ?? 210000
  const loadFactor = calcMode === 'professional' ? input.dynamicFactor ?? 1 : 1
  const P = (input.load ?? 1000) * loadFactor
  let allowStress = input.allowableStress
  if (allowStress == null) {
    allowStress = mat?.sigmaAllow ?? (calcMode === 'simple' ? null : 160)
  }
  const allowDeflection = input.allowableDeflection ?? L / 1000

  if (calcMode === 'simple' && allowStress == null) {
    return { errorKey: 'material_required', calcMode }
  }

  const deflection = beamCase.deflection(P, L, E, section.I)
  const moment = beamCase.maxMoment(P, L)
  let stress = moment / section.W

  if (calcMode === 'professional') {
    const Kt = input.stressConcentration ?? 1
    stress *= Kt
  }

  const result = {
    calcMode,
    caseId: beamCase.id,
    caseLabel: beamCase.label,
    spanLength: L,
    load: input.load ?? 1000,
    designLoad: P,
    elasticModulus: E,
    materialId: input.materialId ?? null,
    materialName: mat?.name ?? null,
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

  const charDim = input.diameter ?? input.height ?? 30
  result.spanRatio = charDim > 0 ? L / charDim : null
  result.slendernessWarning = (result.spanRatio ?? 0) > 40

  if (calcMode === 'complete' || calcMode === 'professional') {
    result.stressUtilization = allowStress ? stress / allowStress : 0
    result.deflectionUtilization = allowDeflection ? deflection / allowDeflection : 0
    result.minSectionModulusStress = moment / allowStress
    switch (beamCase.id) {
      case 'cantilever_end':
        result.minInertiaDeflection = (P * L ** 3) / (3 * E * allowDeflection)
        break
      case 'simply_uniform':
        result.minInertiaDeflection = (5 * P * L ** 4) / (384 * E * allowDeflection)
        break
      case 'cantilever_uniform':
        result.minInertiaDeflection = (P * L ** 4) / (8 * E * allowDeflection)
        break
      default:
        result.minInertiaDeflection = (P * L ** 3) / (48 * E * allowDeflection)
    }
  }

  if (calcMode === 'professional') {
    result.dynamicFactor = loadFactor
    result.stressConcentration = input.stressConcentration ?? 1
    if (input.loadMin != null && input.loadMax != null) {
      const Kt = input.stressConcentration ?? 1
      const mMin = beamCase.maxMoment(input.loadMin, L)
      const mMax = beamCase.maxMoment(input.loadMax * loadFactor, L)
      const sigmaAmp = (((mMax - mMin) / section.W) * Kt) / 2
      const sigmaMean = (((mMax + mMin) / section.W) * Kt) / 2
      const fatigue = assessComponentFatigue({
        materialId: input.materialId,
        snMaterial: input.snMaterial,
        yieldStrength: mat?.sigmaS,
        stressAmplitude: sigmaAmp,
        meanStress: sigmaMean,
        meanStressMethod: input.meanStressMethod,
        surfaceFactor: input.surfaceFactor,
        sizeFactor: input.sizeFactor,
        targetCycles: input.targetCycles ?? 1e6,
      })
      result.stressAmplitude = sigmaAmp
      result.stressMean = sigmaMean
      result.effectiveStressAmplitude = fatigue.effectiveAmplitude
      result.fatigueEndurance = fatigue.adjustedEndurance
      result.fatigueLife = fatigue.fatigueLife
      result.snMaterial = fatigue.snMaterial
      result.fatiguePass = fatigue.fatiguePass
      result.pass = result.pass && result.fatiguePass
    }
  }

  return result
}
