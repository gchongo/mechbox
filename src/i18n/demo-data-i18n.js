/** Locale-aware sample / demo data for module pages */

export const demoDataZh = {
  allocation: {
    rings: [
      { name: '挡环厚度', factor: 1, nominal: 40, cost: 1, sensitivity: 1 },
      { name: '齿轮宽度', factor: 1, nominal: 15, cost: 1.2, sensitivity: 1 },
      { name: '轴径', factor: 1, nominal: 55, cost: 2, sensitivity: 1 },
    ],
    sampleRings: [
      { name: '挡环厚度', factor: 1, nominal: 40, cost: 1, sensitivity: 1 },
      { name: '齿轮宽度', factor: 1, nominal: 15, cost: 1.5, sensitivity: 1.2 },
      { name: '轴径', factor: 1, nominal: 55.25, cost: 2.5, sensitivity: 0.8 },
    ],
    closedRingName: '间隙 L0',
  },
  analytics: {
    doeFactors: [
      { name: '温度', low: 180, high: 220 },
      { name: '压力', low: 50, high: 80 },
      { name: '时间', low: 10, high: 30 },
    ],
    rsmF1: { name: '温度', low: 180, high: 220 },
    rsmF2: { name: '压力', low: 50, high: 80 },
  },
  fmea: `螺栓,断裂,连接失效,预紧力不足,8,4,3,增加扭矩监控
密封圈,泄漏,污染,压缩率不足,7,5,4,沟槽尺寸管控
轴承,异响,停机,润滑不良,6,3,5,定期换油`,
  msa: `A,1,10.02,10.05,10.03
A,2,10.15,10.12,10.14
A,3,10.08,10.10,10.09
B,1,10.04,10.01,10.06
B,2,10.18,10.16,10.17
B,3,10.11,10.09,10.12
C,1,10.00,10.03,10.02
C,2,10.14,10.13,10.15
C,3,10.07,10.08,10.06`,
  xr: `10.1,10.3,10.2
10.0,10.4,10.1
10.2,10.2,10.3
10.15,10.25,10.2
10.05,10.1,10.08
10.3,10.2,10.25`,
  batchSchemes: ['方案A', '方案B', '方案C', '方案D', '方案E'],
  batchCsvPlaceholder: `方案A,0.06,0.05,0.04
方案B,0.08,0.06,0.05
方案C,0.05,0.04,0.03`,
}

export const demoDataEn = {
  allocation: {
    rings: [
      { name: 'Retainer thickness', factor: 1, nominal: 40, cost: 1, sensitivity: 1 },
      { name: 'Gear width', factor: 1, nominal: 15, cost: 1.2, sensitivity: 1 },
      { name: 'Shaft diameter', factor: 1, nominal: 55, cost: 2, sensitivity: 1 },
    ],
    sampleRings: [
      { name: 'Retainer thickness', factor: 1, nominal: 40, cost: 1, sensitivity: 1 },
      { name: 'Gear width', factor: 1, nominal: 15, cost: 1.5, sensitivity: 1.2 },
      { name: 'Shaft diameter', factor: 1, nominal: 55.25, cost: 2.5, sensitivity: 0.8 },
    ],
    closedRingName: 'Clearance L0',
  },
  analytics: {
    doeFactors: [
      { name: 'Temperature', low: 180, high: 220 },
      { name: 'Pressure', low: 50, high: 80 },
      { name: 'Time', low: 10, high: 30 },
    ],
    rsmF1: { name: 'Temperature', low: 180, high: 220 },
    rsmF2: { name: 'Pressure', low: 50, high: 80 },
  },
  fmea: `Bolt,Fracture,Joint failure,Insufficient preload,8,4,3,Add torque monitoring
Seal,Leak,Contamination,Insufficient compression,7,5,4,Control groove dimensions
Bearing,Noise,Shutdown,Poor lubrication,6,3,5,Scheduled oil change`,
  msa: demoDataZh.msa,
  xr: demoDataZh.xr,
  batchSchemes: ['Scheme A', 'Scheme B', 'Scheme C', 'Scheme D', 'Scheme E'],
  batchCsvPlaceholder: `Scheme A,0.06,0.05,0.04
Scheme B,0.08,0.06,0.05
Scheme C,0.05,0.04,0.03`,
}

export function getDemoData(locale = 'zh') {
  return locale === 'en' ? demoDataEn : demoDataZh
}
