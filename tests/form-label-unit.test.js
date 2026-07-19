import { describe, expect, it } from 'vitest'
import { splitFormLabelUnit } from '../src/utils/form-label-unit.js'

describe('splitFormLabelUnit', () => {
  it('strips trailing engineering units', () => {
    expect(splitFormLabelUnit('轴径 d (mm)')).toEqual({ text: '轴径 d', unit: 'mm' })
    expect(splitFormLabelUnit('扭矩 T (N·m)')).toEqual({ text: '扭矩 T', unit: 'N·m' })
    expect(splitFormLabelUnit('许用切应力 (MPa)')).toEqual({ text: '许用切应力', unit: 'MPa' })
    expect(splitFormLabelUnit('转速 n (rpm)')).toEqual({ text: '转速 n', unit: 'rpm' })
    expect(splitFormLabelUnit('压力角 (°)')).toEqual({ text: '压力角', unit: '°' })
    expect(splitFormLabelUnit('流量 Q (L/min)')).toEqual({ text: '流量 Q', unit: 'L/min' })
    expect(splitFormLabelUnit('弯矩 M (N·mm)')).toEqual({ text: '弯矩 M', unit: 'N·mm' })
    expect(splitFormLabelUnit('线载荷 q (N/mm)')).toEqual({ text: '线载荷 q', unit: 'N/mm' })
  })

  it('keeps non-unit parentheses', () => {
    expect(splitFormLabelUnit('内径说明 (可选)')).toEqual({ text: '内径说明 (可选)', unit: '' })
    expect(splitFormLabelUnit('材料')).toEqual({ text: '材料', unit: '' })
  })
})
