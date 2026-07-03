import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const roots = [
  path.join(__dirname, '../src/components'),
]

function walk(dir) {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) out.push(...walk(p))
    else if (name.endsWith('Diagram.vue')) out.push(p)
  }
  return out
}

let count = 0

for (const root of roots) {
  for (const file of walk(root)) {
    let src = fs.readFileSync(file, 'utf8')
    const orig = src

    src = src.replace(
      /<p class="(mech-diagram__hint|oring-diagram__hint|bolt-diagram__hint)">\{\{\s*([^}]+)\s*\}\}<\/p>/g,
      (_, cls, expr) => {
        count++
        return `<p class="${cls}"><MathContent :text="dm(${expr.trim()})" /></p>`
      },
    )

    src = src.replace(
      /<p class="mech-diagram__hint" v-html="([^"]+)"\s*\/>/g,
      (_, expr) => {
        count++
        return `<p class="mech-diagram__hint"><MathContent :text="dm(${expr.trim()})" /></p>`
      },
    )

    src = src.replace(
      /<p class="mech-diagram__hint">\{\{\s*hint(Text)?\s*\}\}<\/p>/g,
      (_, suffix) => {
        count++
        const varName = suffix ? 'hintText' : 'hint'
        return `<p class="mech-diagram__hint"><MathContent :text="dm(${varName})" /></p>`
      },
    )

    if (src.includes('dm(') && !src.includes('dm }') && src.includes('useDiagramI18n')) {
      src = src.replace(
        /const \{\s*dt(?:,\s*locale)?\s*\} = useDiagramI18n\(/g,
        (m) => m.replace('dt', 'dt, dm').replace('dt, dm, locale', 'dt, locale, dm'),
      )
      if (!src.includes(', dm }') && !src.includes(', dm,') && src.includes('useDiagramI18n')) {
        src = src.replace(
          /const \{\s*dt,\s*locale\s*\} = useDiagramI18n\(/g,
          'const { dt, locale, dm } = useDiagramI18n(',
        )
      }
    }

    if (src !== orig) fs.writeFileSync(file, src)
  }
}

console.log(`Migrated ${count} diagram hint lines to MathContent`)
