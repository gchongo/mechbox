import { enrichMathText } from '../src/utils/math-label.js'

const samples = [
  'L_K',
  'd_h',
  'd_W',
  'D_A',
  'f_Z',
  'd',
  'P',
  'μ_G',
  '有效面积 A_s',
  '螺栓刚度 k_S',
  'L_K — 两被夹紧件贴合面之间的夹紧长度',
]

let failed = 0
for (const s of samples) {
  const out = enrichMathText(s)
  const double = /\$\$[^$]|\$\$/.test(out.replace(/\$[^$]+\$/g, '')) || out.includes('$$')
  const blockLike = /\$\$[\s\S]+?\$\$/.test(out)
  if (blockLike) {
    console.error('BLOCK', s, '->', out)
    failed++
  } else {
    console.log('ok', s, '->', out)
  }
}
process.exit(failed ? 1 : 0)
