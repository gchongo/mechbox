/** 直齿轮几何参数 */
export function calcGearGeometry({ module, teeth, pressureAngle = 20 }) {
  const m = module
  const z = teeth
  const alpha = (pressureAngle * Math.PI) / 180
  const d = m * z
  return {
    pitchDiameter: d,
    baseDiameter: d * Math.cos(alpha),
    addendum: m,
    dedendum: 1.25 * m,
    wholeDepth: 2.25 * m,
    circularPitch: Math.PI * m,
  }
}

/** 圆周力 Ft (N)，扭矩 T (N·m)，分度圆直径 d (mm) */
export function calcTangentialForce(torque, pitchDiameter) {
  if (!pitchDiameter) return 0
  return (2000 * torque) / pitchDiameter
}

/** Lewis 近似弯曲应力 (MPa) */
export function calcBendingStress({ force, faceWidth, module, formFactor = 2.65 }) {
  const denom = faceWidth * module * formFactor
  if (!denom) return 0
  return force / denom
}

/** 简化接触应力估算 (MPa)，u 为齿数比 */
export function calcContactStress({ force, faceWidth, pitchDiameter, gearRatio = 1 }) {
  const u = Math.max(gearRatio, 1)
  const denom = faceWidth * pitchDiameter * u
  if (!denom || force <= 0) return 0
  return 118 * Math.sqrt((force * (u + 1)) / denom)
}

/** 线速度 (m/s) */
export function calcPitchLineVelocity(pitchDiameter, rpm) {
  return (Math.PI * pitchDiameter * rpm) / 60000
}

/** 综合齿轮强度分析 */
export function analyzeGearStrength(input) {
  const geo = calcGearGeometry(input)
  const force = calcTangentialForce(input.torque, geo.pitchDiameter)
  const sigmaF = calcBendingStress({
    force,
    faceWidth: input.faceWidth,
    module: input.module,
    formFactor: input.formFactor ?? 2.65,
  })
  const sigmaH = calcContactStress({
    force,
    faceWidth: input.faceWidth,
    pitchDiameter: geo.pitchDiameter,
    gearRatio: input.gearRatio ?? 1,
  })
  const velocity = calcPitchLineVelocity(geo.pitchDiameter, input.rpm ?? 0)

  const allowBend = input.allowBending ?? 300
  const allowContact = input.allowContact ?? 900

  return {
    geometry: geo,
    tangentialForce: force,
    bendingStress: sigmaF,
    contactStress: sigmaH,
    pitchLineVelocity: velocity,
    bendingPass: sigmaF <= allowBend,
    contactPass: sigmaH <= allowContact,
    allowBending: allowBend,
    allowContact: allowContact,
  }
}
