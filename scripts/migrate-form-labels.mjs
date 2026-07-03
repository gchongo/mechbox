import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const viewsDir = path.join(__dirname, '../src/views')

function walk(dir) {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) out.push(...walk(p))
    else if (name.endsWith('.vue')) out.push(p)
  }
  return out
}

let total = 0
for (const file of walk(viewsDir)) {
  let src = fs.readFileSync(file, 'utf8')
  const orig = src

  src = src.replace(
    /<el-form-item([^>]*?)\s:label="pf\(([^)]+)\)"([^>]*)>/g,
    (_, before, key, after) => {
      total++
      const attrs = `${before}${after}`.trim()
      return `<CalcFormItem${attrs ? ` ${attrs}` : ''} :label="pf(${key})">`
    },
  )

  src = src.replace(
    /<el-form-item([^>]*?)\s:label="pr\(([^)]+)\)"([^>]*)>/g,
    (_, before, key, after) => {
      total++
      const attrs = `${before}${after}`.trim()
      return `<CalcFormItem${attrs ? ` ${attrs}` : ''} :label="pr(${key})">`
    },
  )

  src = src.replace(
    /<el-form-item([^>]*?)\s:label="([a-zA-Z][a-zA-Z0-9_]*)"([^>]*)>/g,
    (_, before, key, after) => {
      if (['left', 'right', 'top', 'bottom'].includes(key)) return _
      total++
      const attrs = `${before}${after}`.trim()
      return `<CalcFormItem${attrs ? ` ${attrs}` : ''} :label="${key}">`
    },
  )

  if (src !== orig) fs.writeFileSync(file, src)
}

console.log(`Migrated ${total} form item labels to CalcFormItem`)
