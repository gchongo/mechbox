/** 可从标签尾部剥离并挪到输入框后的单位 */
const UNIT_PATTERN =
  /^(.*?)\s*\(((?:mm|μm|um|N·m|N⋅m|N·mm|N\/mm|MPa|GPa|rpm|kW|kPa|°C|Hz|L\/min|m\/s²|m\/s|kg|kJ\/mm|g\/cm³|N|°|%|h|ASTM|m))\)\s*$/u

/**
 * 将「轴径 d (mm)」拆成标签与单位；非单位括号原样返回。
 * @param {string} label
 * @returns {{ text: string, unit: string }}
 */
export function splitFormLabelUnit(label) {
  const raw = label == null ? '' : String(label)
  if (!raw) return { text: '', unit: '' }
  const m = raw.match(UNIT_PATTERN)
  if (!m) return { text: raw, unit: '' }
  return { text: m[1].trim(), unit: m[2] }
}
