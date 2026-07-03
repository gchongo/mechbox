/** English case display strings keyed by case id (matches constants/cases.js) */

export const caseClosedRingNamesEn = {
  '间隙 L0': 'Clearance L0',
  '过盈量 L0': 'Interference L0',
  '轴向间隙 L0': 'Axial clearance L0',
  '台阶差 L0': 'Step height L0',
  '平行度 L0': 'Parallelism L0',
  '位置度 L0': 'Position L0',
  '垂直度 L0': 'Perpendicularity L0',
  '同轴度 L0': 'Coaxiality L0',
  '平面度 L0': 'Flatness L0',
  '跳动 L0': 'Runout L0',
  '轮廓度 L0': 'Profile L0',
  '直线度 L0': 'Straightness L0',
  '圆度 L0': 'Roundness L0',
}

export const caseRingNamesEn = {
  '挡环厚度': 'Retainer thickness',
  '齿轮宽度': 'Gear width',
  '轴径': 'Shaft diameter',
  '孔径': 'Bore diameter',
  '垫片 A': 'Shim A',
  '垫片 B': 'Shim B',
  '垫片 C': 'Shim C',
  '总高度': 'Total height',
  '大轴段': 'Large shaft section',
  '小轴段': 'Small shaft section',
  '基准面 flatness': 'Datum flatness',
  '上表面 flatness': 'Top surface flatness',
  '厚度': 'Thickness',
  'X 向定位': 'X locating',
  'Y 向定位': 'Y locating',
  '侧壁 flatness': 'Sidewall flatness',
  '定位尺寸': 'Locating dimension',
  '轴径 A': 'Shaft diameter A',
  '轴径 B': 'Shaft diameter B',
  '径向跳动': 'Radial runout',
  '面 A flatness': 'Surface A flatness',
  '面 B flatness': 'Surface B flatness',
  '圆度': 'Roundness',
  '偏心': 'Eccentricity',
  '段1 轮廓': 'Segment 1 profile',
  '段2 轮廓': 'Segment 2 profile',
  '段1 直线': 'Segment 1 straightness',
  '段2 直线': 'Segment 2 straightness',
  '段3 直线': 'Segment 3 straightness',
  '截面 A 圆度': 'Section A roundness',
  '截面 B 圆度': 'Section B roundness',
  '径向尺寸': 'Radial dimension',
}

export function translateRingName(name, locale = 'zh') {
  if (!name) return name
  if (locale === 'en') return caseRingNamesEn[name] ?? name
  for (const [zh, en] of Object.entries(caseRingNamesEn)) {
    if (en === name) return zh
  }
  return name
}

export function translateClosedRingName(name, locale = 'zh') {
  if (!name) return name
  if (locale === 'en') return caseClosedRingNamesEn[name] ?? name
  for (const [zh, en] of Object.entries(caseClosedRingNamesEn)) {
    if (en === name) return zh
  }
  return name
}

export function localizeEditorRingNames(state, locale = 'zh') {
  if (!state) return state
  const next = { ...state }
  if (next.closedRing) {
    next.closedRing = {
      ...next.closedRing,
      name: translateClosedRingName(next.closedRing.name, locale),
    }
  }
  if (next.componentRings) {
    next.componentRings = next.componentRings.map((ring) => ({
      ...ring,
      name: translateRingName(ring.name, locale),
    }))
  }
  return next
}

export function localizeCasePresetData(data, locale = 'zh') {
  if (locale !== 'en' || !data) return data
  return localizeEditorRingNames(data, locale)
}

export const casesEn = {
  'gear-gap': {
    title: 'Gear Assembly Clearance',
    desc: 'Typical 1D stack: spacer + gear + shaft diameter (standard requirements case)',
    type: '1D linear',
  },
  'bearing-fit': {
    title: 'Bearing Fit Tolerance',
    desc: 'Interference fit analysis for bearing inner ring and shaft',
    type: '1D linear',
  },
  'shim-thickness': {
    title: 'Shim Thickness Stack',
    desc: 'Effect of stacked shim thicknesses on axial clearance',
    type: '1D linear',
  },
  'shaft-tolerance': {
    title: 'Stepped Shaft Tolerance Chain',
    desc: 'Tolerance accumulation across stepped shaft segments',
    type: '1D linear',
  },
  'parallelism-2d': {
    title: 'Parallelism Stack',
    desc: '2D planar parallelism accumulation (surface A relative to datum)',
    type: '2D planar',
  },
  'position-gdt': {
    title: 'GD&T Position',
    desc: 'RSS synthesis of X/Y locating deviations into a position tolerance zone',
    type: 'GD&T',
  },
  'perpendicularity-2d': {
    title: 'Perpendicularity Stack',
    desc: 'Datum flatness + sidewall flatness + locating dimension accumulation',
    type: '2D planar',
  },
  'coaxiality-gdt': {
    title: 'Coaxiality Stack',
    desc: 'RSS synthesis of radial errors across multiple shaft diameters',
    type: 'GD&T',
  },
  'flatness-2d': {
    title: 'Flatness Accumulation',
    desc: 'Direct stacking of multiple surface flatness values into the closed loop',
    type: '2D planar',
  },
  'runout-gdt': {
    title: 'Runout Stack',
    desc: 'Roundness + eccentricity + shaft radial component accumulation',
    type: 'GD&T',
  },
  'profile-2d': {
    title: '2D Profile Stack',
    desc: 'RSS accumulation of profile deviations along the surface normal',
    type: '2D planar',
  },
  'straightness-2d': {
    title: 'Straightness Stack',
    desc: 'Accumulation of straightness deviations along the length direction',
    type: '2D planar',
  },
  'roundness-gdt': {
    title: 'Roundness Stack',
    desc: 'RSS synthesis of roundness radial errors across multiple cross-sections',
    type: 'GD&T',
  },
}
