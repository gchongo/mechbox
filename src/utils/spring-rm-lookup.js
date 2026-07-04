/**
 * GB/T 23935-2009 附录 F — 弹簧钢丝抗拉强度 Rm 下限查表（MPa）
 * F.4 油淬火-回火钢丝（GB/T 18983）高疲劳级 VD 列下限
 * 注：取材料标准下限值，d 落在 “>a ~ b mm” 档内
 */

/** @typedef {'VDC'|'VDCrV-A'|'VDCrSi'|'music_F'|'stainless_B'} SpringRmGrade */

/** GB/T 23935 表 F.4 — VD / VDCrV-A / VDCrSi 直径档上限 (mm) 与 Rm 下限 */
export const GB23935_APPENDIX_F4_RM = {
  VDC: [
    { maxD: 0.8, rm: 1800 },
    { maxD: 1.0, rm: 1800 },
    { maxD: 1.3, rm: 1800 },
    { maxD: 1.4, rm: 1750 },
    { maxD: 1.6, rm: 1740 },
    { maxD: 2.0, rm: 1720 },
    { maxD: 2.5, rm: 1670 },
    { maxD: 2.7, rm: 1640 },
    { maxD: 3.0, rm: 1620 },
    { maxD: 3.2, rm: 1600 },
    { maxD: 3.5, rm: 1580 },
    { maxD: 4.0, rm: 1550 },
    { maxD: 4.2, rm: 1540 },
    { maxD: 4.5, rm: 1520 },
    { maxD: 4.7, rm: 1510 },
    { maxD: 5.0, rm: 1500 },
    { maxD: 5.6, rm: 1470 },
    { maxD: 6.0, rm: 1460 },
    { maxD: 6.5, rm: 1440 },
    { maxD: 7.0, rm: 1430 },
    { maxD: 8.0, rm: 1400 },
    { maxD: 9.0, rm: 1380 },
    { maxD: 10.0, rm: 1360 },
    { maxD: 12.0, rm: 1320 },
    { maxD: 14.0, rm: 1280 },
    { maxD: 15.0, rm: 1270 },
    { maxD: 17.0, rm: 1250 },
  ],
  'VDCrV-A': [
    { maxD: 0.8, rm: 1700 },
    { maxD: 1.0, rm: 1700 },
    { maxD: 1.3, rm: 1700 },
    { maxD: 1.4, rm: 1680 },
    { maxD: 1.6, rm: 1660 },
    { maxD: 2.0, rm: 1640 },
    { maxD: 2.5, rm: 1620 },
    { maxD: 2.7, rm: 1610 },
    { maxD: 3.0, rm: 1600 },
    { maxD: 3.2, rm: 1580 },
    { maxD: 3.5, rm: 1560 },
    { maxD: 4.0, rm: 1540 },
    { maxD: 4.5, rm: 1520 },
    { maxD: 5.0, rm: 1500 },
    { maxD: 5.6, rm: 1480 },
    { maxD: 6.0, rm: 1470 },
    { maxD: 6.5, rm: 1440 },
    { maxD: 7.0, rm: 1420 },
    { maxD: 8.0, rm: 1410 },
    { maxD: 9.0, rm: 1390 },
    { maxD: 10.0, rm: 1370 },
  ],
  VDCrSi: [
    { maxD: 0.8, rm: 1910 },
    { maxD: 1.0, rm: 1880 },
    { maxD: 1.3, rm: 1860 },
    { maxD: 1.4, rm: 1840 },
    { maxD: 1.6, rm: 1820 },
    { maxD: 2.0, rm: 1770 },
    { maxD: 2.5, rm: 1720 },
    { maxD: 2.7, rm: 1690 },
    { maxD: 3.0, rm: 1660 },
    { maxD: 3.2, rm: 1640 },
    { maxD: 3.5, rm: 1620 },
    { maxD: 4.0, rm: 1570 },
    { maxD: 4.5, rm: 1810 },
    { maxD: 5.0, rm: 1780 },
    { maxD: 5.6, rm: 1750 },
    { maxD: 6.0, rm: 1730 },
    { maxD: 6.5, rm: 1710 },
    { maxD: 7.0, rm: 1690 },
    { maxD: 8.0, rm: 1660 },
    { maxD: 9.0, rm: 1640 },
    { maxD: 10.0, rm: 1620 },
  ],
}

/** GB/T 23935 表 F.1 — 重要用途碳素弹簧钢丝 F 组（琴钢丝类） */
export const GB23935_APPENDIX_F1_MUSIC_RM = [
  { maxD: 0.08, rm: 2710 },
  { maxD: 0.09, rm: 2700 },
  { maxD: 0.1, rm: 2690 },
  { maxD: 0.12, rm: 2680 },
  { maxD: 0.14, rm: 2670 },
  { maxD: 0.16, rm: 2660 },
  { maxD: 0.18, rm: 2650 },
  { maxD: 0.2, rm: 2640 },
  { maxD: 0.22, rm: 2620 },
  { maxD: 0.25, rm: 2600 },
  { maxD: 0.28, rm: 2600 },
  { maxD: 0.3, rm: 2600 },
  { maxD: 0.32, rm: 2590 },
  { maxD: 0.35, rm: 2590 },
  { maxD: 0.4, rm: 2580 },
  { maxD: 0.45, rm: 2570 },
  { maxD: 0.5, rm: 2560 },
  { maxD: 0.55, rm: 2550 },
  { maxD: 0.6, rm: 2540 },
  { maxD: 0.63, rm: 2520 },
  { maxD: 0.7, rm: 2500 },
  { maxD: 0.8, rm: 2490 },
  { maxD: 0.9, rm: 2390 },
  { maxD: 1.0, rm: 2350 },
  { maxD: 1.2, rm: 2270 },
  { maxD: 1.4, rm: 2200 },
  { maxD: 1.6, rm: 2160 },
  { maxD: 1.8, rm: 2060 },
  { maxD: 2.0, rm: 1970 },
  { maxD: 2.2, rm: 1870 },
  { maxD: 2.5, rm: 1770 },
  { maxD: 2.8, rm: 1720 },
  { maxD: 3.0, rm: 1690 },
  { maxD: 3.2, rm: 1670 },
  { maxD: 3.5, rm: 1620 },
  { maxD: 4.0, rm: 1570 },
  { maxD: 4.5, rm: 1500 },
  { maxD: 5.0, rm: 1480 },
  { maxD: 5.5, rm: 1440 },
  { maxD: 6.0, rm: 1420 },
  { maxD: 6.3, rm: 1420 },
  { maxD: 7.0, rm: 1370 },
  { maxD: 8.0, rm: 1320 },
  { maxD: 9.0, rm: 1320 },
  { maxD: 10.0, rm: 1320 },
  { maxD: 11.0, rm: 1270 },
  { maxD: 12.0, rm: 1270 },
]

/** GB/T 23935 表 F.5 — 不锈钢丝 B 组 */
export const GB23935_APPENDIX_F5_STAINLESS_B_RM = [
  { maxD: 0.08, rm: 2157 },
  { maxD: 0.09, rm: 2157 },
  { maxD: 0.1, rm: 2157 },
  { maxD: 0.12, rm: 2157 },
  { maxD: 0.14, rm: 2157 },
  { maxD: 0.16, rm: 2157 },
  { maxD: 0.18, rm: 2157 },
  { maxD: 0.2, rm: 2157 },
  { maxD: 0.23, rm: 2157 },
  { maxD: 0.26, rm: 2059 },
  { maxD: 0.29, rm: 2059 },
  { maxD: 0.32, rm: 2059 },
  { maxD: 0.35, rm: 2059 },
  { maxD: 0.4, rm: 2059 },
  { maxD: 0.45, rm: 1961 },
  { maxD: 0.5, rm: 1961 },
  { maxD: 0.55, rm: 1961 },
  { maxD: 0.6, rm: 1961 },
  { maxD: 0.65, rm: 1961 },
  { maxD: 0.7, rm: 1961 },
  { maxD: 0.8, rm: 1863 },
  { maxD: 0.9, rm: 1863 },
  { maxD: 1.0, rm: 1863 },
  { maxD: 1.2, rm: 1765 },
  { maxD: 1.4, rm: 1765 },
  { maxD: 1.6, rm: 1765 },
  { maxD: 1.8, rm: 1667 },
  { maxD: 2.0, rm: 1667 },
  { maxD: 2.2, rm: 1667 },
  { maxD: 2.3, rm: 1471 },
  { maxD: 2.5, rm: 1569 },
  { maxD: 2.9, rm: 1569 },
  { maxD: 3.0, rm: 1471 },
  { maxD: 3.2, rm: 1471 },
  { maxD: 3.5, rm: 1471 },
  { maxD: 4.0, rm: 1471 },
  { maxD: 4.5, rm: 1471 },
  { maxD: 5.0, rm: 1373 },
  { maxD: 5.5, rm: 1373 },
  { maxD: 6.0, rm: 1373 },
  { maxD: 6.5, rm: 1373 },
  { maxD: 7.0, rm: 1275 },
  { maxD: 8.0, rm: 1275 },
  { maxD: 9.0, rm: 1275 },
  { maxD: 10.0, rm: 1128 },
  { maxD: 11.0, rm: 981 },
]

/** 应用材料 → 附录 F 钢丝等级（F.2/F.3） */
export const SPRING_MATERIAL_RM_GRADES = {
  '50CrVA': 'VDCrV-A',
  '60Si2CrA': 'VDCrSi',
  '60Si2CrVA': 'VDCrSi',
  '65Mn': 'VDC',
  oil_tempered: 'VDC',
  music_wire: 'music_F',
  stainless: 'stainless_B',
  custom: null,
}

export function lookupRmFromDiameterTable(wireDiameter, tiers) {
  if (!(wireDiameter > 0) || !tiers?.length) {
    return { rm: null, inTableRange: false, maxTableDiameter: tiers?.[tiers.length - 1]?.maxD ?? null }
  }
  for (const tier of tiers) {
    if (wireDiameter <= tier.maxD) {
      return { rm: tier.rm, inTableRange: true, maxTableDiameter: tiers[tiers.length - 1].maxD, tierMaxD: tier.maxD }
    }
  }
  return {
    rm: null,
    inTableRange: false,
    maxTableDiameter: tiers[tiers.length - 1].maxD,
  }
}

export function lookupSpringRmByWireDiameter(wireDiameter, grade) {
  if (grade === 'music_F') {
    return { grade, ...lookupRmFromDiameterTable(wireDiameter, GB23935_APPENDIX_F1_MUSIC_RM) }
  }
  if (grade === 'stainless_B') {
    return { grade, ...lookupRmFromDiameterTable(wireDiameter, GB23935_APPENDIX_F5_STAINLESS_B_RM) }
  }
  const tiers = GB23935_APPENDIX_F4_RM[grade]
  if (!tiers) {
    return { grade, rm: null, inTableRange: false, maxTableDiameter: null }
  }
  return { grade, ...lookupRmFromDiameterTable(wireDiameter, tiers) }
}

/**
 * 解析 Rm — GB/T 23935 附录 F 按线径查表，或用户手动输入
 */
export function resolveSpringTensileStrength({
  material,
  wireDiameter,
  tensileStrength,
  tensileStrengthManual = false,
  materialDefault = 1600,
}) {
  if (tensileStrengthManual && tensileStrength != null && tensileStrength > 0) {
    return {
      value: tensileStrength,
      source: 'manual',
      grade: null,
      inTableRange: true,
      issue: null,
    }
  }

  const grade = SPRING_MATERIAL_RM_GRADES[material]
  if (!grade || !(wireDiameter > 0)) {
    const fallback = tensileStrength ?? materialDefault
    return {
      value: fallback,
      source: material === 'custom' ? 'manual' : 'material_default',
      grade: null,
      inTableRange: true,
      issue: null,
    }
  }

  const looked = lookupSpringRmByWireDiameter(wireDiameter, grade)
  if (looked.rm != null) {
    return {
      value: looked.rm,
      source: 'appendix_f',
      grade: looked.grade,
      inTableRange: true,
      tierMaxD: looked.tierMaxD,
      maxTableDiameter: looked.maxTableDiameter,
      issue: null,
    }
  }

  return {
    value: tensileStrength ?? materialDefault,
    source: 'material_default',
    grade: looked.grade,
    inTableRange: false,
    maxTableDiameter: looked.maxTableDiameter,
    issue: 'rm_out_of_table_range',
  }
}
