/**
 * 扩展帮助注册表 — article.id → { blocks }
 */
import { getFatigueHelpRef } from '@/constants/fatigue-help-reference'
import {
  getGearHelp,
  getThreadHelp,
  getBoltPreloadHelp,
  getBearingHelp,
} from './mechanical-core.js'
import {
  getBeamHelp,
  getShaftHelp,
  getKeyHelp,
  getWeldHelp,
  getSpringHelp,
} from './mechanical-structure.js'
import {
  getBeltHelp,
  getChainHelp,
  getClutchHelp,
  getBoltGroupHelp,
  getWormGearHelp,
} from './mechanical-drive.js'
import {
  getSheetMetalHelp,
  getORingHelp,
  getCylinderHelp,
  getThermalExpansionHelp,
  getPipeFlowHelp,
  getPlateBucklingHelp,
  getColumnBucklingHelp,
  getPinRetainerHelp,
  getGasketFlangeHelp,
  getModalFreqHelp,
} from './mechanical-misc.js'
import {
  getEditorHelp,
  getBatchHelp,
  getAllocationHelp,
  getStatisticsHelp,
  getMonteCarloHelp,
  getQualityHelp,
} from './tolerance-stats.js'

/** @param {ReturnType<typeof getFatigueHelpRef>} ref @param {'zh'|'en'} locale */
function fatigueHelpToBlocks(ref, locale) {
  const L = locale === 'en'
  return {
    blocks: [
      {
        type: 'modes',
        title: L ? 'Calculation modes compared' : '三种计算模式对照',
        subtitle: L
          ? 'Simplified / Full / Professional — Miner, Goodman, pass paths'
          : '简化 / 完整 / 专业 — Miner、Goodman 与 pass 路径',
        colMode: L ? 'Mode' : '模式',
        colModel: L ? 'Features' : '功能',
        colPass: L ? 'Pass / release' : '通过 / 放行',
        colCaveat: L ? 'Caution' : '注意',
        rows: ref.calcModes.map((r) => ({
          mode: r.mode,
          features: r.features,
          passRule: r.passRule,
          caveat: r.caveat,
        })),
      },
      {
        type: 'guide',
        title: L ? 'Single-level S-N check — tutorial' : '单级 S-N 判定 — 教材说明',
        subtitle: L
          ? 'How the right-panel single-level verdict relates to Sa, N_target, Goodman, and Se′'
          : '右侧「单级判定」与左侧 Sa、N_target、Goodman、Se′ 的关系；与 Miner/综合 pass 的区别',
        intro: ref.singleLevelGuide.intro,
        sections: ref.singleLevelGuide.sections,
      },
      {
        type: 'guide',
        title: L ? 'Overall vs single-level verdict' : '综合判定 vs 单级判定',
        subtitle: L
          ? 'Why you can see overall pass with single-level fail — not a bug'
          : '为何会出现「综合通过 + 单级 ✗」—— 不是算错',
        paragraphs: ref.overallVsSingle.paragraphs,
        examples: ref.overallVsSingle.examples,
      },
      {
        type: 'compareTable',
        title: L ? 'Full vs Professional — same inputs, different results' : '完整模式 vs 专业模式 — 同参不同果',
        subtitle: L
          ? 'Why Miner D and pass can flip when only the mode changes'
          : '相同材料、Sa、载荷谱时，为何 D 与 pass 可能完全相反',
        intro: ref.modeCompare.intro,
        sharedTitle: L ? 'Shared inputs for example' : '算例共用输入',
        sharedInputs: ref.modeCompare.sharedInputs,
        columns: [
          { key: 'scenario', label: L ? 'Scenario' : '场景' },
          { key: 'complete', label: L ? 'Full mode' : '完整模式' },
          { key: 'professional', label: L ? 'Professional' : '专业模式' },
        ],
        rowKey: 'scenario',
        rows: ref.modeCompare.rows,
        conclusion: ref.modeCompare.conclusion,
      },
      {
        type: 'guide',
        title: L ? 'Sa lower bound vs Se′ — common confusion' : 'Sa 输入下限与 Se′ — 常见误解',
        subtitle: L
          ? 'Why single-level can fail even when Sa is at the UI minimum'
          : '为何 Sa 已调到最小仍显示单级 ✗',
        intro: ref.saBounds.intro,
        sections: ref.saBounds.sections,
      },
      {
        type: 'formulas',
        title: L ? 'Core formulas (matches code)' : '核心公式（与代码一致）',
        items: ref.formulas,
      },
      {
        type: 'passChecks',
        title: L ? 'Pass criteria' : '判定依据一览',
        rows: ref.passChecks,
      },
      {
        type: 'passChecks',
        title: L ? 'Miner status levels' : 'Miner 状态分级',
        rows: ref.minerStatus.map((r) => ({ check: r.status, rule: r.rule })),
      },
      {
        type: 'howToPass',
        title: L ? 'How to pass single-level (inputs only)' : '如何让单级判定通过（只调输入）',
        items: ref.howToPass,
        columns: 3,
      },
      {
        type: 'faq',
        title: L ? 'FAQ' : '常见问题 FAQ',
        colQ: L ? 'Question' : '问题',
        colA: L ? 'Answer' : '解答',
        rows: ref.faq,
      },
      {
        type: 'pageNotes',
        title: L ? 'Page interaction notes' : '本页交互说明',
        notes: ref.pageNotes,
        confirmNote: ref.criticalInputs.confirmNote,
        extraNote: ref.criticalInputs.sizeFactorNote,
        lists: [
          { title: L ? 'Full mode — key inputs' : '完整模式关键输入', items: ref.criticalInputs.complete },
          { title: L ? 'Professional — additional inputs' : '专业模式额外输入', items: ref.criticalInputs.professional },
        ],
      },
      {
        type: 'compareTable',
        title: L ? 'This page vs assessComponentFatigue' : '本页 vs assessComponentFatigue',
        subtitle: L
          ? 'Shaft/beam/key use a different API—do not mix pass conclusions'
          : '轴/梁/键模块使用不同入口，勿混用 pass 结论',
        columns: [
          { key: 'item', label: L ? 'Item' : '项' },
          { key: 'page', label: L ? 'This page /fatigue' : '本页 /fatigue' },
          { key: 'other', label: L ? 'Shaft/beam/key' : '轴/梁/键' },
        ],
        rowKey: 'item',
        rows: ref.assessVsPage,
      },
      {
        type: 'examples',
        title: L ? 'Examples & counterexamples' : '算例与反例',
        rows: ref.exampleSteps,
      },
      {
        type: 'limitations',
        title: L ? 'Scope limits' : '适用边界',
        items: ref.limitations,
      },
    ],
  }
}

const REGISTRY = {
  fatigue: (locale) => fatigueHelpToBlocks(getFatigueHelpRef(locale), locale),
  gear: getGearHelp,
  thread: getThreadHelp,
  'bolt-preload': getBoltPreloadHelp,
  bearing: getBearingHelp,
  beam: getBeamHelp,
  shaft: getShaftHelp,
  key: getKeyHelp,
  weld: getWeldHelp,
  spring: getSpringHelp,
  belt: getBeltHelp,
  chain: getChainHelp,
  'worm-gear': getWormGearHelp,
  clutch: getClutchHelp,
  'bolt-group': getBoltGroupHelp,
  'sheet-metal': getSheetMetalHelp,
  'o-ring': getORingHelp,
  cylinder: getCylinderHelp,
  'thermal-expansion': getThermalExpansionHelp,
  'pipe-flow': getPipeFlowHelp,
  'plate-buckling': getPlateBucklingHelp,
  'column-buckling': getColumnBucklingHelp,
  'pin-retainer': getPinRetainerHelp,
  'gasket-flange': getGasketFlangeHelp,
  'modal-freq': getModalFreqHelp,
  editor: getEditorHelp,
  batch: getBatchHelp,
  allocation: getAllocationHelp,
  statistics: getStatisticsHelp,
  'monte-carlo': getMonteCarloHelp,
  quality: getQualityHelp,
}

/** @param {string} id @param {'zh'|'en'} [locale='zh'] */
export function getExtendedHelpRef(id, locale = 'zh') {
  const fn = REGISTRY[id]
  if (!fn) return null
  return fn(locale)
}

export const EXTENDED_HELP_IDS = Object.keys(REGISTRY)
