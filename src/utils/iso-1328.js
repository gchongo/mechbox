/**
 * ISO 1328 齿轮精度等级 — 简化查表/公式
 * 用于估算齿距/齿形/齿向公差，并联动 ISO 6336 动载系数 KV
 */

/** ISO 1328 精度等级 5–12 */
export const ISO1328_GRADES = [5, 6, 7, 8, 9, 10, 11, 12]

/** 等级相对 6 级的倍率（公差随等级按 2^(grade-6)/2 近似） */
function gradeMultiplier(grade) {
  return 2 ** ((grade - 6) / 2)
}

/**
 * 单齿距偏差 f_pt、齿距累积 F_pt、齿形 f_fα、齿向 F_β (μm)
 * 基于 ISO 1328-1:2013 附录经验公式简化
 */
export function calcISO1328Tolerances({ module, pitchDiameter, grade = 6, faceWidth = 20 }) {
  const m = Math.max(module, 0.5)
  const d = Math.max(pitchDiameter, 5)
  const b = Math.max(faceWidth, 1)
  const k = gradeMultiplier(grade)

  // 基准值 (grade 6, μm)
  const fptBase = 0.42 * m ** 0.5 + 0.12 * d ** 0.5
  const FptBase = 0.52 * m ** 0.5 + 0.15 * d ** 0.5
  const ffAlphaBase = 0.38 * m ** 0.5 + 0.1 * d ** 0.5
  const FbetaBase = 0.35 * b ** 0.5 + 0.08 * d ** 0.5

  return {
    grade,
    module: m,
    pitchDiameter: d,
    faceWidth: b,
    f_pt: fptBase * k,
    F_pt: FptBase * k,
    f_falpha: ffAlphaBase * k,
    F_beta: FbetaBase * k,
    multiplier: k,
  }
}

/** 由 ISO 1328 公差估算 ISO 6336 动载系数 KV 修正 */
export function estimateKVFromISO1328({ tolerances, velocity, baseGrade = 6 }) {
  const v = velocity ?? 0
  const grade = tolerances?.grade ?? baseGrade
  const fpt = tolerances?.f_pt ?? 10
  const ff = tolerances?.f_falpha ?? 10

  // 公差越大 → KV 越高
  const tolFactor = Math.sqrt((fpt * ff) / 100)
  const gradeFactor = Math.max(1, (10 - grade) * 0.035)
  const speedFactor = 1 + Math.min(0.6, v / 40)

  const KV = 1 + gradeFactor * speedFactor * 0.12 + tolFactor * 0.008
  return Math.min(Math.max(KV, 1.0), 2.0)
}

/** 完整 ISO 1328 → ISO 6336 联动参数 */
export function linkISO1328ToISO6336(input) {
  const m = input.module
  const z1 = input.pinionTeeth ?? 24
  const d1 = m * z1

  const tolerances = calcISO1328Tolerances({
    module: m,
    pitchDiameter: d1,
    grade: input.iso1328Grade ?? input.accuracyGrade ?? 6,
    faceWidth: input.faceWidth ?? 20,
  })

  const velocity = input.pitchLineVelocity ?? 0
  const KV = estimateKVFromISO1328({ tolerances, velocity })

  return {
    tolerances,
    recommendedAccuracyGrade: tolerances.grade,
    dynamicFactorKV: KV,
    notes: [
      {
        key: 'note_grade',
        params: {
          grade: tolerances.grade,
          fpt: tolerances.f_pt.toFixed(1),
        },
      },
      {
        key: 'note_profile',
        params: {
          ff: tolerances.f_falpha.toFixed(1),
          fbeta: tolerances.F_beta.toFixed(1),
        },
      },
      {
        key: 'note_kv',
        params: { kv: KV.toFixed(3) },
      },
    ],
  }
}

export const ISO1328_GRADE_LABELS = {
  5: '5 级（高精度）',
  6: '6 级（精密）',
  7: '7 级（较精密）',
  8: '8 级（中等）',
  9: '9 级（一般）',
  10: '10 级（低精度）',
  11: '11 级',
  12: '12 级（粗糙）',
}
