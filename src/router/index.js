import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/editor',
    name: 'editor',
    component: () => import('@/views/SizeChainEditorView.vue'),
    meta: { title: '尺寸链分析' },
  },
  {
    path: '/editor/:id',
    name: 'editor-detail',
    component: () => import('@/views/SizeChainEditorView.vue'),
    meta: { title: '尺寸链分析' },
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: () => import('@/views/StatisticsView.vue'),
    meta: { title: '概率统计' },
  },
  {
    path: '/tutorial',
    name: 'tutorial',
    component: () => import('@/views/TutorialView.vue'),
    meta: { title: '教程' },
  },
  {
    path: '/cases',
    name: 'cases',
    component: () => import('@/views/CasesView.vue'),
    meta: { title: '案例库' },
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: () => import('@/views/QuizView.vue'),
    meta: { title: '练习题库' },
  },
  {
    path: '/manual',
    name: 'manual',
    component: () => import('@/views/ManualView.vue'),
    meta: { title: '公式手册' },
  },
  {
    path: '/monte-carlo',
    name: 'monte-carlo',
    component: () => import('@/views/MonteCarloView.vue'),
    meta: { title: 'Monte Carlo' },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { title: '历史记录' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: '设置' },
  },
  {
    path: '/glossary',
    name: 'glossary',
    component: () => import('@/views/GlossaryView.vue'),
    meta: { title: '术语词典' },
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@/views/AccountView.vue'),
    meta: { title: '账号' },
  },
  {
    path: '/batch',
    name: 'batch',
    component: () => import('@/views/BatchAnalysisView.vue'),
    meta: { title: '批量验证' },
  },
  {
    path: '/gear',
    name: 'gear',
    component: () => import('@/views/GearCalcView.vue'),
    meta: { title: '齿轮计算' },
  },
  {
    path: '/thread',
    name: 'thread',
    component: () => import('@/views/ThreadCalcView.vue'),
    meta: { title: '螺纹强度' },
  },
  {
    path: '/bolt-preload',
    name: 'bolt-preload',
    component: () => import('@/views/BoltPreloadView.vue'),
    meta: { title: '螺栓预紧力' },
  },
  {
    path: '/bearing',
    name: 'bearing',
    component: () => import('@/views/BearingCalcView.vue'),
    meta: { title: '轴承计算' },
  },
  {
    path: '/shaft',
    name: 'shaft',
    component: () => import('@/views/ShaftCalcView.vue'),
    meta: { title: '轴强度' },
  },
  {
    path: '/key',
    name: 'key',
    component: () => import('@/views/KeyCalcView.vue'),
    meta: { title: '平键连接' },
  },
  {
    path: '/weld',
    name: 'weld',
    component: () => import('@/views/WeldCalcView.vue'),
    meta: { title: '焊缝强度' },
  },
  {
    path: '/bolt-group',
    name: 'bolt-group',
    component: () => import('@/views/BoltGroupCalcView.vue'),
    meta: { title: '螺栓组' },
  },
  {
    path: '/spring',
    name: 'spring',
    component: () => import('@/views/SpringCalcView.vue'),
    meta: { title: '弹簧设计' },
  },
  {
    path: '/clutch',
    name: 'clutch',
    component: () => import('@/views/ClutchCalcView.vue'),
    meta: { title: '离合器' },
  },
  {
    path: '/belt',
    name: 'belt',
    component: () => import('@/views/BeltCalcView.vue'),
    meta: { title: '皮带传动' },
  },
  {
    path: '/chain',
    name: 'chain',
    component: () => import('@/views/ChainCalcView.vue'),
    meta: { title: '链传动' },
  },
  {
    path: '/cylinder',
    name: 'cylinder',
    component: () => import('@/views/CylinderCalcView.vue'),
    meta: { title: '液压/气缸' },
  },
  {
    path: '/materials',
    name: 'materials',
    component: () => import('@/views/MaterialsView.vue'),
    meta: { title: '材料库' },
  },
  {
    path: '/allocation',
    name: 'allocation',
    component: () => import('@/views/ToleranceAllocationView.vue'),
    meta: { title: '公差分配' },
  },
  {
    path: '/interference-fit',
    name: 'interference-fit',
    component: () => import('@/views/InterferenceFitView.vue'),
    meta: { title: '过盈配合' },
  },
  {
    path: '/beam',
    name: 'beam',
    component: () => import('@/views/BeamCalcView.vue'),
    meta: { title: '梁挠度估算' },
  },
  {
    path: '/thermal-expansion',
    name: 'thermal-expansion',
    component: () => import('@/views/ThermalExpansionView.vue'),
    meta: { title: '热膨胀补偿' },
  },
  {
    path: '/quality',
    name: 'quality',
    component: () => import('@/views/QualityView.vue'),
    meta: { title: '质量分析' },
  },
  {
    path: '/sheet-metal',
    name: 'sheet-metal',
    component: () => import('@/views/SheetMetalView.vue'),
    meta: { title: '钣金展开' },
  },
  {
    path: '/o-ring',
    name: 'o-ring',
    component: () => import('@/views/ORingSealView.vue'),
    meta: { title: 'O型圈密封' },
  },
  {
    path: '/fatigue',
    name: 'fatigue',
    component: () => import('@/views/FatigueView.vue'),
    meta: { title: '疲劳寿命' },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: { title: '回归与DOE' },
  },
  {
    path: '/structural',
    name: 'structural',
    component: () => import('@/views/StructuralView.vue'),
    meta: { title: '结构流体估算' },
  },
  {
    path: '/material-selection',
    name: 'material-selection',
    component: () => import('@/views/MaterialSelectionView.vue'),
    meta: { title: '材料选型' },
  },
  {
    path: '/manufacturing',
    name: 'manufacturing',
    component: () => import('@/views/ManufacturingView.vue'),
    meta: { title: '制造工艺' },
  },
  {
    path: '/heat-treatment',
    name: 'heat-treatment',
    component: () => import('@/views/HeatTreatmentView.vue'),
    meta: { title: '热处理硬度' },
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('@/views/ToolMapView.vue'),
    meta: { title: '工具地图' },
  },
  {
    path: '/units',
    name: 'units',
    component: () => import('@/views/UnitsView.vue'),
    meta: { title: '单位换算' },
  },
  {
    path: '/fit',
    name: 'fit',
    component: () => import('@/views/FitView.vue'),
    meta: { title: 'ISO 286 配合' },
  },
  {
    path: '/gdt-stack',
    name: 'gdt-stack',
    component: () => import('@/views/GdtStackView.vue'),
    meta: { title: 'GD&T 公差栈' },
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/FaqView.vue'),
    meta: { title: '常见问题' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve({ top: 0, left: 0 })
      })
    })
  },
})

router.afterEach((to) => {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  })

  document.title = to.meta.title
    ? `${to.meta.title} - 机械工具箱`
    : '机械工具箱 — 尺寸链与机械强度计算'

  let desc = document.querySelector('meta[name="description"]')
  if (!desc) {
    desc = document.createElement('meta')
    desc.setAttribute('name', 'description')
    document.head.appendChild(desc)
  }
  desc.setAttribute(
    'content',
    to.meta.description
      ?? `${to.meta.title ?? '机械工具箱'} — 在线尺寸链叠加分析、概率统计与机械强度计算工具。`,
  )
})

export default router
