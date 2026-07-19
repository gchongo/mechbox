<template>
  <div class="overflow-x-auto rounded-lg border border-gray-100 bg-white/60 dark:border-gray-800 dark:bg-gray-950/40">
    <svg
      viewBox="0 0 960 420"
      class="min-w-[720px] w-full text-gray-700 dark:text-gray-300"
      role="img"
      :aria-label="dt('fundamentalDeviationAria')"
    >
      <defs>
        <pattern id="fit-hole-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#409eff" stroke-width="1.2" opacity="0.35" />
        </pattern>
        <pattern id="fit-shaft-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#e6a23c" stroke-width="1.2" opacity="0.4" />
        </pattern>
      </defs>

      <!-- 孔区 -->
      <text x="28" y="28" font-size="13" font-weight="600" fill="#409eff">{{ dt('holeSection') }}</text>
      <text x="48" :y="holeZeroY - 52" font-size="11" fill="currentColor" opacity="0.55">+</text>
      <text x="48" :y="holeZeroY + 58" font-size="11" fill="currentColor" opacity="0.55">−</text>
      <line
        :x1="plotLeft"
        :y1="holeZeroY"
        :x2="plotRight"
        :y2="holeZeroY"
        stroke="currentColor"
        stroke-width="1.25"
        opacity="0.45"
      />
      <text :x="plotLeft - 10" :y="holeZeroY + 4" font-size="10" text-anchor="end" fill="currentColor" opacity="0.55">0</text>

      <g v-for="(col, i) in holeColumns" :key="'h-' + col.letter">
        <rect
          :x="col.x"
          :y="col.y"
          :width="bandW"
          :height="col.h"
          :rx="2"
          :fill="col.selected ? '#409eff' : 'url(#fit-hole-hatch)'"
          :fill-opacity="col.selected ? 0.35 : col.enabled ? 0.9 : 0.35"
          :stroke="col.selected ? '#2563eb' : '#409eff'"
          :stroke-width="col.selected ? 2.25 : 1"
          :opacity="col.enabled ? 1 : 0.4"
          :class="col.enabled ? 'cursor-pointer' : 'cursor-default'"
          @click="onHoleClick(col)"
        />
        <text
          :x="col.x + bandW / 2"
          :y="labelY(col)"
          font-size="9"
          font-weight="600"
          text-anchor="middle"
          :fill="col.selected ? '#1d4ed8' : 'currentColor'"
          :opacity="col.enabled ? 0.9 : 0.35"
          :class="col.enabled ? 'cursor-pointer' : 'cursor-default'"
          @click="onHoleClick(col)"
        >
          {{ col.display }}
        </text>
      </g>

      <!-- 孔侧标注 -->
      <text :x="plotLeft + 8" :y="holeZeroY - 38" font-size="9" fill="#409eff" opacity="0.85">EI</text>
      <text :x="plotRight - 70" :y="holeZeroY + 36" font-size="9" fill="#409eff" opacity="0.85">ES</text>
      <text :x="plotRight + 8" :y="holeZeroY + 4" font-size="10" fill="currentColor" opacity="0.55">{{ dt('basicSize') }}</text>

      <!-- 轴区 -->
      <text x="28" y="232" font-size="13" font-weight="600" fill="#e6a23c">{{ dt('shaftSection') }}</text>
      <text x="48" :y="shaftZeroY - 52" font-size="11" fill="currentColor" opacity="0.55">+</text>
      <text x="48" :y="shaftZeroY + 58" font-size="11" fill="currentColor" opacity="0.55">−</text>
      <line
        :x1="plotLeft"
        :y1="shaftZeroY"
        :x2="plotRight"
        :y2="shaftZeroY"
        stroke="currentColor"
        stroke-width="1.25"
        opacity="0.45"
      />
      <text :x="plotLeft - 10" :y="shaftZeroY + 4" font-size="10" text-anchor="end" fill="currentColor" opacity="0.55">0</text>

      <g v-for="col in shaftColumns" :key="'s-' + col.letter">
        <rect
          :x="col.x"
          :y="col.y"
          :width="bandW"
          :height="col.h"
          :rx="2"
          :fill="col.selected ? '#e6a23c' : 'url(#fit-shaft-hatch)'"
          :fill-opacity="col.selected ? 0.4 : col.enabled ? 0.9 : 0.35"
          :stroke="col.selected ? '#c27a12' : '#e6a23c'"
          :stroke-width="col.selected ? 2.25 : 1"
          :opacity="col.enabled ? 1 : 0.4"
          :class="col.enabled ? 'cursor-pointer' : 'cursor-default'"
          @click="onShaftClick(col)"
        />
        <text
          :x="col.x + bandW / 2"
          :y="labelY(col)"
          font-size="9"
          font-weight="600"
          text-anchor="middle"
          :fill="col.selected ? '#b45309' : 'currentColor'"
          :opacity="col.enabled ? 0.9 : 0.35"
          :class="col.enabled ? 'cursor-pointer' : 'cursor-default'"
          @click="onShaftClick(col)"
        >
          {{ col.display }}
        </text>
      </g>

      <text :x="plotLeft + 8" :y="shaftZeroY + 42" font-size="9" fill="#e6a23c" opacity="0.85">es</text>
      <text :x="plotRight - 70" :y="shaftZeroY - 28" font-size="9" fill="#e6a23c" opacity="0.85">ei</text>
      <text :x="plotRight + 8" :y="shaftZeroY + 4" font-size="10" fill="currentColor" opacity="0.55">{{ dt('basicSize') }}</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'
import { SUPPORTED_HOLE_LETTERS, SUPPORTED_SHAFT_LETTERS } from '@/utils/iso-286-calc'

const { dt } = useDiagramI18n('fit')

const props = defineProps({
  /** 当前孔基本偏差字母，如 H / JS */
  holeLetter: { type: String, default: 'H' },
  /** 当前轴基本偏差字母，如 g / js */
  shaftLetter: { type: String, default: 'g' },
})

const emit = defineEmits(['select-hole', 'select-shaft'])

/** ISO 286 附图字母序（孔大写 / 轴小写） */
const HOLE_LETTERS = [
  'A', 'B', 'C', 'CD', 'D', 'E', 'EF', 'F', 'FG', 'G', 'H',
  'J', 'Js', 'K', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'ZA', 'ZB', 'ZC',
]
const SHAFT_LETTERS = [
  'a', 'b', 'c', 'cd', 'd', 'e', 'ef', 'f', 'fg', 'g', 'h',
  'j', 'js', 'k', 'm', 'n', 'p', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'za', 'zb', 'zc',
]

/**
 * 孔公差带下缘相对零线的示意单位（正=上，负=下）；带宽固定 1 单位向上延伸。
 * Js 单独居中处理。
 */
const HOLE_EDGE = {
  A: 9.2, B: 7.8, C: 6.6, CD: 5.9, D: 5.2, E: 4.3, EF: 3.7, F: 3.1, FG: 2.5, G: 1.9, H: 0,
  J: -0.35, Js: null, K: -1.1, M: -1.7, N: -2.35, P: -3.15, R: -4.0, S: -4.85,
  T: -5.55, U: -6.25, V: -6.9, X: -7.6, Y: -8.3, Z: -9.05, ZA: -9.85, ZB: -10.65, ZC: -11.5,
}

/** 轴公差带上缘相对零线（正=上）；带宽固定 1 单位向下延伸。js 居中。 */
const SHAFT_EDGE = {
  a: -9.2, b: -7.8, c: -6.6, cd: -5.9, d: -5.2, e: -4.3, ef: -3.7, f: -3.1, fg: -2.5, g: -1.9, h: 0,
  j: 0.35, js: null, k: 1.1, m: 1.7, n: 2.35, p: 3.15, r: 4.0, s: 4.85,
  t: 5.55, u: 6.25, v: 6.9, x: 7.6, y: 8.3, z: 9.05, za: 9.85, zb: 10.65, zc: 11.5,
}

const plotLeft = 64
const plotRight = 900
const bandW = 18
const bandH = 14
const unitPx = 7.2
const holeZeroY = 118
const shaftZeroY = 318
const colGap = (plotRight - plotLeft - bandW) / (HOLE_LETTERS.length - 1)

const supportedHole = new Set(SUPPORTED_HOLE_LETTERS.map((l) => l.toUpperCase()))
const supportedShaft = new Set(SUPPORTED_SHAFT_LETTERS.map((l) => l.toLowerCase()))

function normalizeHole(letter) {
  const u = String(letter || '').toUpperCase()
  return u === 'JS' ? 'Js' : u
}

function normalizeShaft(letter) {
  return String(letter || '').toLowerCase()
}

function holeKey(letter) {
  return String(letter).toUpperCase() === 'JS' || letter === 'Js' ? 'JS' : String(letter).toUpperCase()
}

function shaftKey(letter) {
  return String(letter).toLowerCase()
}

const selectedHole = computed(() => normalizeHole(props.holeLetter))
const selectedShaft = computed(() => normalizeShaft(props.shaftLetter))

function holeBand(letter, i) {
  const x = plotLeft + i * colGap
  const display = letter
  const enabled = supportedHole.has(holeKey(letter))
  const selected = selectedHole.value === letter || (letter === 'Js' && selectedHole.value === 'Js')
  let y
  let h = bandH
  if (letter === 'Js') {
    y = holeZeroY - bandH / 2
  } else {
    const edge = HOLE_EDGE[letter]
    // 下缘在 zero - edge*unit（SVG y 向下为正，故上方 edge>0 → y 更小）
    const bottom = holeZeroY - edge * unitPx
    y = bottom - bandH
  }
  return { letter, display, x, y, h, enabled, selected }
}

function shaftBand(letter, i) {
  const x = plotLeft + i * colGap
  const display = letter
  const enabled = supportedShaft.has(shaftKey(letter))
  const selected = selectedShaft.value === letter
  let y
  let h = bandH
  if (letter === 'js') {
    y = shaftZeroY - bandH / 2
  } else {
    const edge = SHAFT_EDGE[letter]
    // 上缘在 zero - edge*unit；带宽向下
    y = shaftZeroY - edge * unitPx
  }
  return { letter, display, x, y, h, enabled, selected }
}

const holeColumns = computed(() => HOLE_LETTERS.map((l, i) => holeBand(l, i)))
const shaftColumns = computed(() => SHAFT_LETTERS.map((l, i) => shaftBand(l, i)))

function labelY(col) {
  const zeroY = col.letter === col.letter.toLowerCase() ? shaftZeroY : holeZeroY
  const mid = col.y + col.h / 2
  // 带心在零线上方 → 标签在带上；下方 → 标签在带下
  return mid < zeroY ? col.y - 4 : col.y + col.h + 11
}

function onHoleClick(col) {
  if (!col.enabled) return
  emit('select-hole', holeKey(col.letter))
}

function onShaftClick(col) {
  if (!col.enabled) return
  emit('select-shaft', shaftKey(col.letter))
}
</script>
