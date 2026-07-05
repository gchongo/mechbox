import {
  calcMinEngagementLength,
  calcTensileStressArea,
  calcThreadShearStress,
  calcExternalThreadShearArea,
  calcInternalThreadShearArea,
  METRIC_THREAD_PITCH,
  THREAD_GRADES,
} from '@/utils/thread-calc'
import { getAllThreadRows } from '@/constants/thread-standards'

/** @typedef {'steel'|'aluminum'|'stainless'|'cast_iron'|'plastic'} JointMaterialId */

export const JOINT_MATERIALS = {
  steel: { minFactor: 0.8, recommendFactor: 1.0, maxPracticalFactor: 1.5, nutMaterial: 'steel' },
  stainless: { minFactor: 0.8, recommendFactor: 1.0, maxPracticalFactor: 1.5, nutMaterial: 'steel' },
  cast_iron: { minFactor: 0.8, recommendFactor: 1.2, maxPracticalFactor: 2.0, nutMaterial: 'steel' },
  aluminum: { minFactor: 1.0, recommendFactor: 1.5, maxPracticalFactor: 2.5, nutMaterial: 'soft' },
  plastic: { minFactor: 1.5, recommendFactor: 2.0, maxPracticalFactor: 3.0, nutMaterial: 'soft' },
}

/**
 * @param {import('@/constants/thread-standards').ThreadRow|null} row
 * @param {{
 *   diameter?: number,
 *   pitch?: number,
 *   engagedLength?: number,
 *   jointMaterial?: JointMaterialId,
 *   grade?: string,
 *   axialForce?: number,
 * }} input
 */
export function analyzeThreadEngagement(input = {}) {
  const dims = resolveEngagementDims(input)
  if (dims.errorKey) return { ok: false, errorKey: dims.errorKey }

  const { diameter, pitch, unit } = dims
  const jointMaterial = input.jointMaterial ?? 'steel'
  const mat = JOINT_MATERIALS[jointMaterial] ?? JOINT_MATERIALS.steel
  const engagedLength = Number(input.engagedLength) || diameter * mat.recommendFactor

  const minByRule = calcMinEngagementLength(diameter, mat.nutMaterial)
  const minByMaterial = diameter * mat.minFactor
  const minEngagement = Math.max(minByRule, minByMaterial)
  const recommended = diameter * mat.recommendFactor
  const maxPractical = diameter * mat.maxPracticalFactor

  const grade = THREAD_GRADES[input.grade ?? '8.8'] ?? THREAD_GRADES['8.8']
  const axialForce = Number(input.axialForce) || 0
  const stressArea = calcTensileStressArea(diameter, pitch)
  const shearStress = axialForce > 0
    ? calcThreadShearStress(axialForce, diameter, pitch, engagedLength)
    : null
  const shearExt = axialForce > 0 ? calcExternalThreadShearArea(diameter, pitch, engagedLength) : null
  const shearInt = axialForce > 0 ? calcInternalThreadShearArea(diameter, pitch, engagedLength) : null

  const passMin = engagedLength >= minEngagement
  const passRecommend = engagedLength >= recommended

  return {
    ok: true,
    unit: 'mm',
    displayUnit: unit,
    diameter,
    pitch,
    designation: dims.designation,
    jointMaterial,
    engagedLength,
    minEngagement,
    recommendedEngagement: recommended,
    maxPracticalEngagement: maxPractical,
    passMin,
    passRecommend,
    marginToMin: engagedLength - minEngagement,
    stressArea,
    axialForce,
    grade: grade.label,
    allowShearStress: grade.allowStress * 0.6,
    shearStress,
    shearPass: shearStress == null ? null : shearStress <= grade.allowStress * 0.6,
    shearAreaExternal: shearExt,
    shearAreaInternal: shearInt,
    isMetric: dims.isMetric,
  }
}

/**
 * @param {object} input
 */
function resolveEngagementDims(input) {
  if (input.row) {
    const row = input.row
    if ((row.system === 'metric' || row.system === 'tr') && row.nominal && row.pitch) {
      return {
        diameter: row.nominal,
        pitch: row.pitch,
        unit: row.unit,
        designation: row.designation,
        isMetric: true,
      }
    }
    if ((row.system === 'unc' || row.system === 'unf' || row.system === 'unef') && row.nominal && row.tpi) {
      const pitchMm = 25.4 / row.tpi
      return {
        diameter: row.nominal * 25.4,
        pitch: pitchMm,
        unit: row.unit,
        designation: row.designation,
        isMetric: false,
      }
    }
    if (row.system === 'acme' && row.nominal && row.tpi) {
      const pitchMm = 25.4 / row.tpi
      return {
        diameter: row.nominal * 25.4,
        pitch: pitchMm,
        unit: row.unit,
        designation: row.designation,
        isMetric: false,
        isPower: true,
      }
    }
    return { errorKey: 'eng_unsupported_system' }
  }

  const diameter = Number(input.diameter)
  if (!diameter || diameter <= 0) return { errorKey: 'eng_need_diameter' }
  const pitch = Number(input.pitch) || METRIC_THREAD_PITCH[Math.round(diameter)] || 1.5
  return {
    diameter,
    pitch,
    unit: 'mm',
    designation: `M${diameter}×${pitch}`,
    isMetric: true,
  }
}

/** @param {string} rowId */
export function findThreadRowById(rowId) {
  return getAllThreadRows().find((r) => r.id === rowId) ?? null
}
