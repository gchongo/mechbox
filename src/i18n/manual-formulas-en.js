/** English formula / LaTeX strings for the manual (derived from constants/formulas.js) */

import { FORMULAS } from '@/constants/formulas'

const FORMULA_OVERRIDES = {
  'nominal-chain': 'L₀ = ΣL_inc − ΣL_dec',
  'sigma-level': 'σ_level = T_target / (6σ)',
  'pass-rate': 'P = 2Φ(σ_level) − 1',
  'bearing-l10': 'L₁₀ = (C/P)^ε (million rev)',
  'it-tolerance': 'IT = i × grade factor',
}

const LATEX_OVERRIDES = {
  'nominal-chain': 'L_0 = \\sum L_{\\text{inc}} - \\sum L_{\\text{dec}}',
  'sigma-level': '\\sigma_{\\text{level}} = \\frac{T_{\\text{target}}}{6\\sigma}',
  'pass-rate': 'P = 2\\Phi(\\sigma_{\\text{level}}) - 1',
}

export const manualFormulasEn = Object.fromEntries(
  FORMULAS.map((f) => [
    f.id,
    {
      formula: FORMULA_OVERRIDES[f.id] ?? f.formula,
      latex: LATEX_OVERRIDES[f.id] ?? f.latex,
    },
  ]),
)
