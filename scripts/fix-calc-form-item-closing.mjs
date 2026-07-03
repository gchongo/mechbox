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

function fixClosingTags(content) {
  const openCalc = (content.match(/<CalcFormItem\b/g) || []).length
  if (!openCalc) return content

  let fixed = 0
  let pending = 0
  const lines = content.split('\n')
  const out = lines.map((line) => {
    const opens = (line.match(/<CalcFormItem\b/g) || []).length
    pending += opens

    if (line.includes('</el-form-item>') && pending > 0) {
      pending -= 1
      fixed += 1
      return line.replace('</el-form-item>', '</CalcFormItem>')
    }
    return line
  })

  if (fixed !== openCalc) {
    console.warn(`  warning: ${openCalc} CalcFormItem opens but ${fixed} closings fixed`)
  }
  return out.join('\n')
}

for (const file of walk(viewsDir)) {
  const orig = fs.readFileSync(file, 'utf8')
  const next = fixClosingTags(orig)
  if (next !== orig) {
    fs.writeFileSync(file, next)
    console.log('Fixed', path.relative(viewsDir, file))
  }
}

console.log('Done')
