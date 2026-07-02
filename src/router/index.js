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
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/FaqView.vue'),
    meta: { title: '常见问题' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} - 机械工具箱`
    : '机械工具箱'
})

export default router
