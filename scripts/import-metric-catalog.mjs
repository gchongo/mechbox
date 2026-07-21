/**
 * Import `_source/公制螺纹2.xlsx` → `src/constants/thread-standards/metric-catalog-data.js`
 *
 * Usage: node scripts/import-metric-catalog.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const xlsxPath = path.join(root, '_source', '公制螺纹2.xlsx')
const outPath = path.join(root, 'src', 'constants', 'thread-standards', 'metric-catalog-data.js')
const defOutPath = path.join(root, 'src', 'constants', 'thread-standards', 'metric-definitions.js')

const ROOT_COEF = 1.226869456414

function num(v) {
  if (v == null || v === '' || v === '-' || v === '—') return null
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = Number(String(v).replace(/,/g, '').replace(/^\+/, '').trim())
  return Number.isFinite(n) ? n : null
}

function round(v, d) {
  if (v == null) return null
  const f = 10 ** d
  return Math.round(v * f) / f
}

const wb = XLSX.readFile(xlsxPath)
const sheet = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

/** 公制螺纹2.xlsx：3 行表头（分组 / 中文列名 / 符号），数据从第 4 行起 */
const catalog = []
for (let i = 3; i < rows.length; i++) {
  const r = rows[i]
  if (!r || r[1] == null || r[2] == null) continue
  const toothRaw = String(r[3] ?? '').trim()
  if (toothRaw !== '粗牙' && toothRaw !== '细牙') continue

  const nominal = num(r[1])
  const pitch = num(r[2])
  if (nominal == null || pitch == null) continue

  const priority = (() => {
    const p = num(r[0])
    if (p === 2 || p === 3) return p
    return 1
  })()
  const toothType = toothRaw === '粗牙' ? 'coarse' : 'fine'
  const pitchDiameter = num(r[5])
  const minor = num(r[6])
  const rootDiameter = round(nominal - ROOT_COEF * pitch, 3)

  catalog.push({
    priority,
    nominal,
    pitch,
    toothType,
    rMinUm: num(r[4]),
    major: nominal,
    pitchDiameter,
    minor,
    rootDiameter,
    tapDrill: minor != null ? round(minor, 2) : null,
    int4H: {
      D2max: num(r[7]),
      D2min: num(r[8]),
      D1max: num(r[9]),
      D1min: num(r[10]),
    },
    int6H: {
      D2max: num(r[11]),
      D2min: num(r[12]),
      D1max: num(r[13]),
      D1min: num(r[14]),
    },
    ext4h: {
      dmax: num(r[15]),
      dmin: num(r[16]),
      d2max: num(r[17]),
      d2min: num(r[18]),
      d3max: num(r[19]),
    },
    ext6g: {
      dmax: num(r[20]),
      dmin: num(r[21]),
      d2max: num(r[22]),
      d2min: num(r[23]),
      d3max: num(r[24]),
    },
    eiG: num(r[25]),
    eiH: num(r[26]),
    esE: num(r[27]),
    esF: num(r[28]),
    esG: num(r[29]),
    esH: num(r[30]),
    td1: {
      g4: num(r[31]),
      g5: num(r[32]),
      g6: num(r[33]),
      g7: num(r[34]),
      g8: num(r[35]),
    },
    td2: {
      g4: num(r[36]),
      g5: num(r[37]),
      g6: num(r[38]),
      g7: num(r[39]),
      g8: num(r[40]),
    },
    tdMajor: {
      g4: num(r[41]),
      g6: num(r[42]),
      g8: num(r[43]),
    },
    td2Ext: {
      g3: num(r[44]),
      g4: num(r[45]),
      g5: num(r[46]),
      g6: num(r[47]),
      g7: num(r[48]),
      g8: num(r[49]),
      g9: num(r[50]),
    },
    engSN: num(r[51]),
    engNL: num(r[53]),
  })
}

const coarse = catalog.filter((r) => r.toothType === 'coarse')
const fine = catalog.filter((r) => r.toothType === 'fine')

const js = `/** AUTO-GENERATED from _source/公制螺纹2.xlsx — run: node scripts/import-metric-catalog.mjs */
export const METRIC_CATALOG_SOURCE = '公制螺纹2.xlsx'
export const METRIC_CATALOG_ROWS = ${JSON.stringify(catalog, null, 2)}
`

fs.writeFileSync(outPath, js, 'utf8')

const byNominal = new Map()
for (const row of catalog) {
  if (!byNominal.has(row.nominal)) {
    byNominal.set(row.nominal, { coarse: null, fine: [], priority: row.priority })
  }
  const slot = byNominal.get(row.nominal)
  slot.priority = Math.min(slot.priority, row.priority)
  if (row.toothType === 'coarse') slot.coarse = row.pitch
  else slot.fine.push(row.pitch)
}

const definitions = [...byNominal.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([nominal, v]) => {
    const pitch = v.coarse ?? v.fine[0]
    const finePitches = v.fine.filter((p) => p !== pitch).sort((a, b) => a - b)
    return [nominal, pitch, v.priority, finePitches]
  })

const defJs = `/** AUTO-GENERATED from _source/公制螺纹2.xlsx — run: node scripts/import-metric-catalog.mjs */
export const METRIC_DEFINITIONS = ${JSON.stringify(definitions, null, 2)}
`

fs.writeFileSync(defOutPath, defJs, 'utf8')

console.log('wrote', outPath)
console.log('wrote', defOutPath)
console.log({ total: catalog.length, coarse: coarse.length, fine: fine.length })
const m10 = catalog.find((r) => r.nominal === 10 && r.pitch === 1.5)
console.log('M10×1.5 spot', m10?.ext6g, m10?.int6H)
