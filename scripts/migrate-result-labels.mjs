import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const roots = [
  path.join(__dirname, '../src/views'),
  path.join(__dirname, '../src/components'),
]

function walk(dir) {
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) out.push(...walk(p))
    else if (name.endsWith('.vue')) out.push(p)
  }
  return out
}

function toLatexDollar(expr) {
  return `$${expr.trim()}$`
}

let mathTexCount = 0
let plainGrayCount = 0
let plainPrCount = 0

for (const root of roots) {
  if (!fs.existsSync(root)) continue
  for (const file of walk(root)) {
    let src = fs.readFileSync(file, 'utf8')
    const orig = src

    src = src.replace(
      /<dt class="text-gray-500">\{\{\s*(pr(?:Cast)?|pt|pf)\(([^)]+)\)\s*\}\}\s*<MathTex expr="([^"]+)"\s*\/>\s*<\/dt>/g,
      (_, fn, key, expr) => {
        mathTexCount++
        return `<ResultLabel label-class="text-gray-500" :text="${fn}(${key}) + ' ${toLatexDollar(expr)}'" />`
      },
    )

    src = src.replace(
      /<dt>\{\{\s*(pr(?:Cast)?|pt|pf)\(([^)]+)\)\s*\}\}\s*<MathTex expr="([^"]+)"\s*\/>\s*<\/dt>/g,
      (_, fn, key, expr) => {
        mathTexCount++
        return `<ResultLabel :text="${fn}(${key}) + ' ${toLatexDollar(expr)}'" />`
      },
    )

    src = src.replace(
      /<dt class="text-gray-500"><MathTex expr="([^"]+)"\s*\/>\s*<\/dt>/g,
      (_, expr) => {
        mathTexCount++
        return `<ResultLabel label-class="text-gray-500" :text="'${toLatexDollar(expr)}'" />`
      },
    )

    src = src.replace(
      /<dt class="text-gray-500">\{\{\s*(pr(?:Cast)?|pt|pf)\(([^)]+)\)\s*\}\}\s*<\/dt>/g,
      (_, fn, key) => {
        plainGrayCount++
        return `<ResultLabel label-class="text-gray-500" :text="${fn}(${key})" />`
      },
    )

    src = src.replace(
      /<div class="flex justify-between rounded bg-gray-50[^"]*">\s*<dt>\{\{\s*(pr(?:Cast)?|pt|pf)\(([^)]+)\)\s*\}\}\s*<\/dt>/g,
      (_, fn, key) => {
        plainPrCount++
        return `<div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="${fn}(${key})" />`
      },
    )

    src = src.replace(
      /<div class="rounded bg-gray-50[^"]*">\s*<dt class="text-gray-500">\{\{\s*(pr(?:Cast)?|pt|pf)\(([^)]+)\)\s*\}\}\s*<\/dt>/g,
      (_, fn, key) => {
        plainPrCount++
        return `<div class="rounded bg-gray-50 p-3"><ResultLabel label-class="text-gray-500" :text="${fn}(${key})" />`
      },
    )

    src = src.replace(
      /<div class="rounded bg-gray-50 p-3 dark:bg-gray-900">\s*<dt class="text-gray-500">\{\{\s*(pr(?:Cast)?|pt|pf)\(([^)]+)\)\s*\}\}\s*<\/dt>/g,
      (_, fn, key) => {
        plainPrCount++
        return `<div class="rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel label-class="text-gray-500" :text="${fn}(${key})" />`
      },
    )

    if (src !== orig) fs.writeFileSync(file, src)
  }
}

console.log(
  `Migrated result labels: MathTex=${mathTexCount}, gray dt=${plainGrayCount}, flex/grid dt=${plainPrCount}`,
)
