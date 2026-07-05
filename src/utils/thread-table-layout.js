import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 螺纹数据表 max-height：按表格首次布局时的视口位置固定计算，
 * 不随页面滚动变化；表头由 Element Plus max-height 原生固定。
 */
export function useThreadTableMaxHeight(hostRef, { min = 320, gap = 24 } = {}) {
  const maxHeight = ref(min)
  let anchorTop = null

  const update = (remeasure = false) => {
    const el = hostRef.value
    if (!el) return
    if (anchorTop == null || remeasure) {
      anchorTop = el.getBoundingClientRect().top
    }
    maxHeight.value = Math.max(min, window.innerHeight - anchorTop - gap)
  }

  const onResize = () => update(true)

  onMounted(() => {
    update(true)
    window.addEventListener('resize', onResize, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
  })

  return { maxHeight, updateMaxHeight: () => update(true) }
}
