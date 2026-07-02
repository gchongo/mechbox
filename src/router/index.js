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
    ? `${to.meta.title} - MechBox 机械工具箱`
    : 'MechBox 机械工具箱'
})

export default router
