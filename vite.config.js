import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      // 登录 /api 跳转不能被 SW 拦截；停止注册 SW，并下发自毁脚本清理旧缓存
      injectRegister: false,
      selfDestroying: true,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'MechBox 机械工具箱',
        short_name: 'MechBox',
        description: '尺寸链叠加分析 + 机械计算工具',
        theme_color: '#409EFF',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'zh-CN',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api\//, /^\/auth-login\.html$/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          plotly: ['plotly.js-dist-min'],
          katex: ['katex'],
        },
      },
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    open: true,
    watch: {
      // Windows 上短时探测脚本易触发 EBUSY 使 watcher 崩溃
      ignored: ['**/tmp-*-probe.mjs', '**/tmp-*.mjs'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
