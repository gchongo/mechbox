/**
 * 工程数值可读格式化 — 减少无意义科学计数法
 */

/** @param {number} value @param {{ maxSig?: number, locale?: string }} [opts] */
export function formatEngineeringValue(value, opts = {}) {
  if (value == null || !Number.isFinite(value)) return '—'
  if (value === 0) return '0'

  const maxSig = opts.maxSig ?? 4
  const abs = Math.abs(value)

  if (abs >= 1e9 || (abs < 1e-4 && abs > 0)) {
    return formatScientific(value, maxSig)
  }

  if (abs >= 1000) {
    return formatWithSeparators(value, Math.min(2, maxSig - 1))
  }

  if (abs >= 1) {
    return trimTrailingZeros(value.toPrecision(maxSig))
  }

  if (abs >= 0.01) {
    const decimals = Math.max(2, maxSig - 1)
    return trimTrailingZeros(value.toFixed(decimals))
  }

  return formatScientific(value, maxSig)
}

/** 参照物倍数：1～3 位有效数字 */
export function formatScaleRatio(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return '—'
  if (ratio >= 100) return trimTrailingZeros(ratio.toPrecision(3))
  if (ratio >= 10) return trimTrailingZeros(ratio.toFixed(1))
  if (ratio >= 1) return trimTrailingZeros(ratio.toFixed(2))
  if (ratio >= 0.1) return trimTrailingZeros(ratio.toFixed(2))
  if (ratio >= 0.01) return trimTrailingZeros(ratio.toFixed(3))
  return formatScientific(ratio, 2)
}

function formatScientific(value, sig) {
  const exp = Math.floor(Math.log10(Math.abs(value)))
  const mantissa = value / 10 ** exp
  const mStr = trimTrailingZeros(mantissa.toPrecision(Math.min(sig, 4)))
  const expStr = formatSuperscript(exp)
  return `${mStr}×10${expStr}`
}

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹'

function formatSuperscript(n) {
  const s = String(n)
  let out = ''
  for (const ch of s) {
    if (ch === '-') out += '⁻'
    else if (ch >= '0' && ch <= '9') out += SUPERSCRIPT[ch.charCodeAt(0) - 48]
    else out += ch
  }
  return out
}

function formatWithSeparators(value, decimals) {
  const fixed = value.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (!decPart || /^0+$/.test(decPart)) return grouped
  return `${grouped}.${decPart.replace(/0+$/, '')}`
}

function trimTrailingZeros(str) {
  if (!str.includes('.')) return str
  return str.replace(/\.?0+$/, '')
}
