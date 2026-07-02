import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import 'katex/dist/katex.min.css'
import MathTex from './components/common/MathTex.vue'
import MathContent from './components/common/MathContent.vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.component('MathTex', MathTex)
app.component('MathContent', MathContent)

app.use(ElementPlus, { locale: zhCn })
app.use(router)
app.mount('#app')
