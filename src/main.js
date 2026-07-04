import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import 'katex/dist/katex.min.css'
import { initSettings } from './utils/settings'
import { applySeoMeta } from './utils/seo-meta'
import { initAuth } from './utils/auth'
import MathTex from './components/common/MathTex.vue'
import MathContent from './components/common/MathContent.vue'
import FormMathLabel from './components/common/FormMathLabel.vue'
import CalcFormItem from './components/calc/CalcFormItem.vue'
import ResultLabel from './components/common/ResultLabel.vue'
import SvgMathText from './components/common/SvgMathText.vue'

/** SW 误把 /api/* 当 SPA 路由时会白屏；注销 SW 后重载一次即可 */
async function recoverFromApiSwTrap() {
  if (!window.location.pathname.startsWith('/api/')) return false
  if (!('serviceWorker' in navigator)) {
    window.location.replace(window.location.pathname + window.location.search)
    return true
  }
  const regs = await navigator.serviceWorker.getRegistrations()
  await Promise.all(regs.map((r) => r.unregister()))
  window.location.replace(window.location.pathname + window.location.search)
  return true
}

function bootstrap() {
  const app = createApp(App)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.component('MathTex', MathTex)
  app.component('MathContent', MathContent)
  app.component('FormMathLabel', FormMathLabel)
  app.component('CalcFormItem', CalcFormItem)
  app.component('ResultLabel', ResultLabel)
  app.component('SvgMathText', SvgMathText)

  app.use(ElementPlus)
  app.use(router)
  initSettings()
  initAuth()
  router.isReady().then(() => {
    applySeoMeta(router.currentRoute.value)
    app.mount('#app')
  })
}

recoverFromApiSwTrap().then((trapped) => {
  if (!trapped) bootstrap()
})
