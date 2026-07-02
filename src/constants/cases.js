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
  {
    id: 'parallelism-2d',
    title: '平行度尺寸链',
    desc: '2D 平面平行度累积分析（面 A 相对基准面）',
    type: '2D 平面',
    typeId: 'parallelism',
    data: {
      selectedTypeId: 'parallelism',
      closedRing: {
        name: '平行度 L0',
        min: 0,
        max: 0.05,
        direction: 'up',
        unit: 'mm',
      },
      componentRings: [
        { name: '基准面 flatness', size: 0.02, tolerance: 0.01, factor: 1, direction: 'up' },
        { name: '上表面 flatness', size: 0.02, tolerance: 0.012, factor: 1, direction: 'down' },
        { name: '厚度', size: 25, tolerance: 0.03, factor: 0.5, direction: 'up' },
      ],
      method: 'modified-rss',
      rssDistribution: 'uniform',
    },
  },
  {
    id: 'position-gdt',
    title: 'GD&T 位置度',
    desc: 'X/Y 双向定位偏差 RSS 合成位置度公差带',
    type: 'GD&T 公差',
    typeId: 'position',
    data: {
      selectedTypeId: 'position',
      closedRing: {
        name: '位置度 L0',
        min: 0,
        max: 0.1,
        direction: 'right',
        unit: 'mm',
      },
      componentRings: [
        { name: 'X 向定位', size: 50, tolerance: 0.05, factor: 1, direction: 'right' },
        { name: 'Y 向定位', size: 30, tolerance: 0.04, factor: 1, direction: 'up' },
        { name: '孔径', size: 10, tolerance: 0.02, factor: 0.5, direction: 'right' },
      ],
      method: 'rss',
    },
  },
  {
    id: 'perpendicularity-2d',
    title: '垂直度尺寸链',
    desc: '基准面 flatness + 侧壁 flatness + 定位尺寸叠加',
    type: '2D 平面',
    typeId: 'perpendicularity',
    data: {
      selectedTypeId: 'perpendicularity',
      closedRing: {
        name: '垂直度 L0',
        min: 0,
        max: 0.08,
        direction: 'up',
        unit: 'mm',
      },
      componentRings: [
        { name: '基准面 flatness', size: 0.015, tolerance: 0.008, factor: 1, direction: 'up' },
        { name: '侧壁 flatness', size: 0.02, tolerance: 0.01, factor: 1, direction: 'right' },
        { name: '定位尺寸', size: 30, tolerance: 0.05, factor: 0.7, direction: 'right' },
      ],
      method: 'modified-rss',
      rssDistribution: 'uniform',
    },
  },
  {
    id: 'coaxiality-gdt',
    title: '同轴度尺寸链',
    desc: '多段轴径径向误差 RSS 合成同轴度',
    type: 'GD&T 公差',
    typeId: 'coaxiality',
    data: {
      selectedTypeId: 'coaxiality',
      closedRing: {
        name: '同轴度 L0',
        min: 0,
        max: 0.05,
        direction: 'right',
        unit: 'mm',
      },
      componentRings: [
        { name: '轴径 A', size: 20, tolerance: 0.02, factor: 1, direction: 'right' },
        { name: '轴径 B', size: 25, tolerance: 0.025, factor: 1, direction: 'right' },
        { name: '径向跳动', size: 0.01, tolerance: 0.008, factor: 1, direction: 'up' },
      ],
      method: 'rss',
    },
  },
  {
    id: 'flatness-2d',
    title: '平面度叠加',
    desc: '多平面 flatness 直接叠加至封闭环',
    type: '2D 平面',
    typeId: 'flatness',
    data: {
      selectedTypeId: 'flatness',
      closedRing: {
        name: '平面度 L0',
        min: 0,
        max: 0.03,
        direction: 'up',
        unit: 'mm',
      },
      componentRings: [
        { name: '面 A flatness', size: 0.01, tolerance: 0.008, factor: 1, direction: 'up' },
        { name: '面 B flatness', size: 0.012, tolerance: 0.01, factor: 1, direction: 'down' },
      ],
      method: 'worst',
    },
  },
  {
    id: 'runout-gdt',
    title: '跳动尺寸链',
    desc: '圆度 + 偏心 + 轴径径向分量叠加',
    type: 'GD&T 公差',
    typeId: 'runout',
    data: {
      selectedTypeId: 'runout',
      closedRing: {
        name: '跳动 L0',
        min: 0,
        max: 0.04,
        direction: 'right',
        unit: 'mm',
      },
      componentRings: [
        { name: '圆度', size: 0.008, tolerance: 0.006, factor: 1, direction: 'right' },
        { name: '偏心', size: 0.01, tolerance: 0.008, factor: 1, direction: 'up' },
        { name: '轴径', size: 30, tolerance: 0.02, factor: 0.5, direction: 'right' },
      ],
      method: 'rss',
    },
  },
  {
    id: 'profile-2d',
    title: '2D 轮廓度链',
    desc: '多段轮廓偏差沿法向 RSS 叠加',
    type: '2D 平面',
    typeId: 'profile-2d',
    data: {
      selectedTypeId: 'profile-2d',
      closedRing: {
        name: '轮廓度 L0',
        min: 0,
        max: 0.06,
        direction: 'right',
        unit: 'mm',
      },
      componentRings: [
        { name: '段1 轮廓', size: 0.02, tolerance: 0.015, factor: 1, direction: 'right' },
        { name: '段2 轮廓', size: 0.018, tolerance: 0.012, factor: 1, direction: 'right' },
      ],
      method: 'modified-rss',
      rssDistribution: 'triangular',
    },
  },
  {
    id: 'straightness-2d',
    title: '直线度尺寸链',
    desc: '多段直线要素偏差沿长度方向叠加',
    type: '2D 平面',
    typeId: 'straightness',
    data: {
      selectedTypeId: 'straightness',
      closedRing: {
        name: '直线度 L0',
        min: 0,
        max: 0.04,
        direction: 'right',
        unit: 'mm',
      },
      componentRings: [
        { name: '段1 直线', size: 0.01, tolerance: 0.008, factor: 1, direction: 'right' },
        { name: '段2 直线', size: 0.012, tolerance: 0.01, factor: 1, direction: 'right' },
        { name: '段3 直线', size: 0.009, tolerance: 0.007, factor: 0.8, direction: 'right' },
      ],
      method: 'rss',
    },
  },
  {
    id: 'roundness-gdt',
    title: '圆度尺寸链',
    desc: '多截面圆度径向误差 RSS 合成',
    type: 'GD&T 公差',
    typeId: 'roundness',
    data: {
      selectedTypeId: 'roundness',
      closedRing: {
        name: '圆度 L0',
        min: 0,
        max: 0.025,
        direction: 'right',
        unit: 'mm',
      },
      componentRings: [
        { name: '截面 A 圆度', size: 0.008, tolerance: 0.006, factor: 1, direction: 'right' },
        { name: '截面 B 圆度', size: 0.007, tolerance: 0.005, factor: 1, direction: 'right' },
        { name: '径向尺寸', size: 25, tolerance: 0.015, factor: 0.5, direction: 'up' },
      ],
      method: 'modified-rss',
      rssDistribution: 'normal',
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
    uid: ring.uid ?? crypto.randomUUID(),
    type: ring.direction === closedDirection ? 'increasing' : 'decreasing',
  }))
  return {
    selectedType: type,
    activeGroup: type?.groupId ?? '1d',
    closedRing: { ...preset.data.closedRing },
    componentRings,
    method: preset.data.method ?? 'rss',
    rssDistribution: preset.data.rssDistribution ?? 'skewed',
    currentStep: 5,
  }
}

export const CASE_STORAGE_KEY = 'mechbox_load_case'

/** 编辑器空白打开时加载的默认示范案例 ID */
export const EDITOR_DEMO_CASE_ID = 'gear-gap'

export function prepareEditorDemoState() {
  const preset = findCasePreset(EDITOR_DEMO_CASE_ID)
  if (!preset) return null
  const state = prepareCaseForEditor(preset)
  state.currentStep = 3
  state.componentRings = state.componentRings.map((ring, i) => ({
    ...ring,
    name: ['A1', 'A2', 'A3'][i] ?? ring.name,
  }))
  return state
}
