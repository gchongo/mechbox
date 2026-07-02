import { findAnalysisType } from '@/constants/analysis-types'

export const CASE_PRESETS = [
  {
    id: 'gear-gap',
    title: '齿轮装配间隙',
    desc: '挡环 + 齿轮 + 轴径组成的典型 1D 尺寸链（需求书标准案例）',
    type: '1D 线性',
    typeId: 'gear-gap',
    data: {
      selectedTypeId: 'gear-gap',
      closedRing: {
        name: '间隙 L0',
        min: 0.1,
        max: 0.35,
        direction: 'right',
        unit: 'mm',
      },
      componentRings: [
        {
          name: '挡环厚度',
          size: 40,
          tolerance: 0.06,
          factor: 1,
          direction: 'left',
        },
        {
          name: '齿轮宽度',
          size: 15,
          tolerance: 0.05,
          factor: 1,
          direction: 'left',
        },
        {
          name: '轴径',
          size: 55.25,
          tolerance: 0.04,
          factor: 1,
          direction: 'right',
        },
      ],
      method: 'rss',
    },
  },
  {
    id: 'bearing-fit',
    title: '轴承配合公差',
    desc: '轴承内圈与轴的过盈配合分析',
    type: '1D 线性',
    typeId: 'bearing-fit',
    data: {
      selectedTypeId: 'bearing-fit',
      closedRing: {
        name: '过盈量 L0',
        min: 0.02,
        max: 0.08,
        direction: 'right',
        unit: 'mm',
      },
      componentRings: [
        { name: '轴径', size: 50.0, tolerance: 0.015, factor: 1, direction: 'right' },
        { name: '孔径', size: 49.92, tolerance: 0.02, factor: 1, direction: 'left' },
      ],
      method: 'worst',
    },
  },
  {
    id: 'shim-thickness',
    title: '垫片厚度叠加',
    desc: '多垫片厚度叠加对轴向间隙的影响',
    type: '1D 线性',
    typeId: 'shim-thickness',
    data: {
      selectedTypeId: 'shim-thickness',
      closedRing: {
        name: '轴向间隙 L0',
        min: 0.05,
        max: 0.3,
        direction: 'up',
        unit: 'mm',
      },
      componentRings: [
        { name: '垫片 A', size: 2.0, tolerance: 0.02, factor: 1, direction: 'down' },
        { name: '垫片 B', size: 1.5, tolerance: 0.015, factor: 1, direction: 'down' },
        { name: '垫片 C', size: 1.0, tolerance: 0.01, factor: 1, direction: 'down' },
        { name: '总高度', size: 4.8, tolerance: 0.03, factor: 1, direction: 'up' },
      ],
      method: 'rss',
    },
  },
  {
    id: 'shaft-tolerance',
    title: '轴径公差链',
    desc: '阶梯轴各段尺寸公差叠加',
    type: '1D 线性',
    typeId: 'shaft-tolerance',
    data: {
      selectedTypeId: 'shaft-tolerance',
      closedRing: {
        name: '台阶差 L0',
        min: 10.0,
        max: 10.5,
        direction: 'right',
        unit: 'mm',
      },
      componentRings: [
        { name: '大轴段', size: 60, tolerance: 0.05, factor: 1, direction: 'right' },
        { name: '小轴段', size: 49.75, tolerance: 0.04, factor: 1, direction: 'left' },
      ],
      method: 'rss',
    },
  },
]

export function findCasePreset(caseId) {
  return CASE_PRESETS.find((c) => c.id === caseId) ?? null
}

export function prepareCaseForEditor(preset) {
  const type = findAnalysisType(preset.data.selectedTypeId)
  const closedDirection = preset.data.closedRing.direction
  const componentRings = preset.data.componentRings.map((ring) => ({
    ...ring,
    type: ring.direction === closedDirection ? 'increasing' : 'decreasing',
  }))
  return {
    selectedType: type,
    activeGroup: type?.groupId ?? '1d',
    closedRing: { ...preset.data.closedRing },
    componentRings,
    method: preset.data.method ?? 'rss',
    currentStep: 5,
  }
}

export const CASE_STORAGE_KEY = 'mechbox_load_case'
