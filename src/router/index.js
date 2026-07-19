import { createRouter, createWebHistory } from 'vue-router'
import { applySeoMeta } from '@/utils/seo-meta'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/editor',
    name: 'editor',
    component: () => import('@/views/SizeChainEditorView.vue'),
  },
  {
    path: '/editor/:id',
    name: 'editor-detail',
    component: () => import('@/views/SizeChainEditorView.vue'),
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: () => import('@/views/StatisticsView.vue'),
  },
  {
    path: '/tutorial',
    name: 'tutorial',
    component: () => import('@/views/TutorialView.vue'),
  },
  {
    path: '/cases',
    name: 'cases',
    component: () => import('@/views/CasesView.vue'),
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: () => import('@/views/QuizView.vue'),
  },
  {
    path: '/manual',
    name: 'manual',
    component: () => import('@/views/ManualView.vue'),
  },
  {
    path: '/monte-carlo',
    name: 'monte-carlo',
    component: () => import('@/views/MonteCarloView.vue'),
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/HistoryView.vue'),
    meta: { requiresLogin: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
  },
  {
    path: '/glossary',
    name: 'glossary',
    component: () => import('@/views/GlossaryView.vue'),
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@/views/AccountView.vue'),
  },
  {
    path: '/batch',
    name: 'batch',
    component: () => import('@/views/BatchAnalysisView.vue'),
  },
  {
    path: '/gear',
    name: 'gear',
    component: () => import('@/views/GearCalcView.vue'),
  },
  {
    path: '/thread',
    name: 'thread',
    component: () => import('@/views/ThreadCalcView.vue'),
  },
  {
    path: '/thread-table',
    name: 'thread-table',
    component: () => import('@/views/ThreadTableView.vue'),
  },
  {
    path: '/bolt-preload',
    name: 'bolt-preload',
    component: () => import('@/views/BoltPreloadView.vue'),
  },
  {
    path: '/bearing',
    name: 'bearing',
    component: () => import('@/views/BearingCalcView.vue'),
  },
  {
    path: '/shaft',
    name: 'shaft',
    component: () => import('@/views/ShaftCalcView.vue'),
  },
  {
    path: '/key',
    name: 'key',
    component: () => import('@/views/KeyCalcView.vue'),
  },
  {
    path: '/weld',
    name: 'weld',
    component: () => import('@/views/WeldCalcView.vue'),
  },
  {
    path: '/bolt-group',
    name: 'bolt-group',
    component: () => import('@/views/BoltGroupCalcView.vue'),
  },
  {
    path: '/spring',
    name: 'spring',
    component: () => import('@/views/SpringCalcView.vue'),
  },
  {
    path: '/clutch',
    name: 'clutch',
    component: () => import('@/views/ClutchCalcView.vue'),
  },
  {
    path: '/belt',
    name: 'belt',
    component: () => import('@/views/BeltCalcView.vue'),
  },
  {
    path: '/chain',
    name: 'chain',
    component: () => import('@/views/ChainCalcView.vue'),
  },
  {
    path: '/worm-gear',
    name: 'worm-gear',
    component: () => import('@/views/WormGearCalcView.vue'),
  },
  {
    path: '/bevel-gear',
    name: 'bevel-gear',
    component: () => import('@/views/BevelGearCalcView.vue'),
  },
  {
    path: '/cylinder',
    name: 'cylinder',
    component: () => import('@/views/CylinderCalcView.vue'),
  },
  {
    path: '/materials',
    name: 'materials',
    component: () => import('@/views/MaterialsView.vue'),
  },
  {
    path: '/allocation',
    name: 'allocation',
    component: () => import('@/views/ToleranceAllocationView.vue'),
  },
  {
    path: '/interference-fit',
    name: 'interference-fit',
    component: () => import('@/views/InterferenceFitView.vue'),
  },
  {
    path: '/beam',
    name: 'beam',
    component: () => import('@/views/BeamCalcView.vue'),
  },
  {
    path: '/thermal-expansion',
    name: 'thermal-expansion',
    component: () => import('@/views/ThermalExpansionView.vue'),
  },
  {
    path: '/quality',
    name: 'quality',
    component: () => import('@/views/QualityView.vue'),
  },
  {
    path: '/sheet-metal',
    name: 'sheet-metal',
    component: () => import('@/views/SheetMetalView.vue'),
  },
  {
    path: '/o-ring',
    name: 'o-ring',
    component: () => import('@/views/ORingSealView.vue'),
  },
  {
    path: '/fatigue',
    name: 'fatigue',
    component: () => import('@/views/FatigueView.vue'),
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/views/AnalyticsView.vue'),
  },
  {
    path: '/structural',
    redirect: '/pipe-flow',
  },
  {
    path: '/pipe-flow',
    name: 'pipe-flow',
    component: () => import('@/views/PipeFlowCalcView.vue'),
  },
  {
    path: '/plate-buckling',
    name: 'plate-buckling',
    component: () => import('@/views/PlateBucklingCalcView.vue'),
  },
  {
    path: '/column-buckling',
    name: 'column-buckling',
    component: () => import('@/views/ColumnBucklingCalcView.vue'),
  },
  {
    path: '/pin-retainer',
    name: 'pin-retainer',
    component: () => import('@/views/PinRetainerCalcView.vue'),
  },
  {
    path: '/gasket-flange',
    name: 'gasket-flange',
    component: () => import('@/views/GasketFlangeCalcView.vue'),
  },
  {
    path: '/modal-freq',
    name: 'modal-freq',
    component: () => import('@/views/ModalFreqCalcView.vue'),
  },
  {
    path: '/material-selection',
    name: 'material-selection',
    component: () => import('@/views/MaterialSelectionView.vue'),
  },
  {
    path: '/manufacturing',
    name: 'manufacturing',
    component: () => import('@/views/ManufacturingView.vue'),
  },
  {
    path: '/vibration-isolation',
    name: 'vibration-isolation',
    component: () => import('@/views/VibrationIsolationView.vue'),
  },
  {
    path: '/heat-transfer',
    name: 'heat-transfer',
    component: () => import('@/views/HeatTransferView.vue'),
  },
  {
    path: '/standards-ref',
    name: 'standards-ref',
    component: () => import('@/views/StandardsRefView.vue'),
  },
  {
    path: '/heat-treatment',
    name: 'heat-treatment',
    component: () => import('@/views/HeatTreatmentView.vue'),
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('@/views/ToolMapView.vue'),
  },
  {
    path: '/units',
    name: 'units',
    component: () => import('@/views/UnitsView.vue'),
  },
  {
    path: '/fit',
    name: 'fit',
    component: () => import('@/views/FitView.vue'),
  },
  {
    path: '/gdt-stack',
    name: 'gdt-stack',
    component: () => import('@/views/GdtStackView.vue'),
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/FaqView.vue'),
  },
  {
    path: '/help',
    name: 'help',
    component: () => import('@/views/ToolHelpView.vue'),
  },
  {
    path: '/help/:id',
    name: 'help-tool',
    component: () => import('@/views/ToolHelpView.vue'),
  },
  {
    path: '/design/powertrain',
    name: 'design-powertrain',
    component: () => import('@/views/design/PowertrainChainView.vue'),
  },
  {
    path: '/design/bolt-joint',
    name: 'design-bolt-joint',
    component: () => import('@/views/design/BoltJointChainView.vue'),
  },
  {
    path: '/design/flange-seal',
    name: 'design-flange-seal',
    component: () => import('@/views/design/FlangeSealChainView.vue'),
  },
  {
    path: '/design/gearbox',
    name: 'design-gearbox',
    component: () => import('@/views/design/GearboxChainView.vue'),
  },
  {
    path: '/design/projects',
    name: 'design-projects',
    component: () => import('@/views/design/DesignProjectsView.vue'),
  },
]

const ENGINEERING_ROUTE_NAMES = new Set([
  'editor',
  'editor-detail',
  'statistics',
  'monte-carlo',
  'batch',
  'allocation',
  'gear',
  'thread',
  'thread-table',
  'bolt-preload',
  'bearing',
  'shaft',
  'key',
  'weld',
  'bolt-group',
  'spring',
  'clutch',
  'belt',
  'chain',
  'worm-gear',
  'bevel-gear',
  'cylinder',
  'interference-fit',
  'beam',
  'thermal-expansion',
  'quality',
  'sheet-metal',
  'o-ring',
  'fatigue',
  'analytics',
  'pipe-flow',
  'plate-buckling',
  'column-buckling',
  'pin-retainer',
  'gasket-flange',
  'modal-freq',
  'material-selection',
  'manufacturing',
  'vibration-isolation',
  'heat-transfer',
  'standards-ref',
  'heat-treatment',
  'units',
  'fit',
  'gdt-stack',
  'design-powertrain',
  'design-bolt-joint',
  'design-flange-seal',
  'design-gearbox',
  'design-projects',
])

for (const route of routes) {
  if (ENGINEERING_ROUTE_NAMES.has(route.name)) {
    route.meta = { ...route.meta, engineeringCalc: true }
  }
}

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

router.beforeEach(async (to) => {
  if (!to.meta.requiresLogin) return true
  const { fetchCurrentUser } = await import('@/utils/auth')
  const user = await fetchCurrentUser()
  if (user) return true
  return {
    name: 'account',
    query: { redirect: to.fullPath },
  }
})

router.afterEach((to) => {
  const scrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
  scrollTop()
  requestAnimationFrame(scrollTop)
  setTimeout(scrollTop, 0)
  setTimeout(scrollTop, 100)

  applySeoMeta(to)
})

window.addEventListener('mechbox-settings', () => {
  applySeoMeta(router.currentRoute.value)
})

export default router
