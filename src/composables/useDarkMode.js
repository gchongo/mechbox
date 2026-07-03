import { ref, onMounted, onUnmounted } from 'vue'
import { getSettings } from '@/utils/settings'

/** 跟随设置页主题切换（html.dark） */
export function useDarkMode() {
  const isDark = ref(
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : getSettings().theme === 'dark',
  )

  function sync(e) {
    if (e?.detail?.theme != null) {
      isDark.value = e.detail.theme === 'dark'
      return
    }
    isDark.value = document.documentElement.classList.contains('dark')
  }

  onMounted(() => {
    sync()
    window.addEventListener('mechbox-settings', sync)
  })
  onUnmounted(() => {
    window.removeEventListener('mechbox-settings', sync)
  })

  return { isDark }
}

/**
 * 合并 Plotly layout 的暗色/亮色背景与坐标轴颜色。
 * 保留调用方已设置的 title 等字段。
 */
export function applyPlotlyTheme(layout = {}, isDark = false) {
  const axis = isDark
    ? {
        gridcolor: '#374151',
        zerolinecolor: '#4b5563',
        linecolor: '#4b5563',
        tickfont: { color: '#9ca3af' },
        titlefont: { color: '#d1d5db' },
        color: '#9ca3af',
      }
    : {
        gridcolor: '#e5e7eb',
        zerolinecolor: '#d1d5db',
        linecolor: '#d1d5db',
        tickfont: { color: '#6b7280' },
        titlefont: { color: '#4b5563' },
        color: '#6b7280',
      }

  const mergeAxis = (existing) => {
    if (!existing) return { ...axis }
    return {
      ...axis,
      ...existing,
      tickfont: { ...axis.tickfont, ...existing.tickfont },
      title:
        typeof existing.title === 'string'
          ? { text: existing.title, font: axis.titlefont }
          : existing.title
            ? { ...existing.title, font: { ...axis.titlefont, ...existing.title?.font } }
            : existing.title,
    }
  }

  const fontColor = isDark ? '#e5e7eb' : '#374151'
  const title =
    layout.title && typeof layout.title === 'object'
      ? { ...layout.title, font: { color: fontColor, ...layout.title.font } }
      : layout.title

  return {
    ...layout,
    title,
    paper_bgcolor: 'transparent',
    plot_bgcolor: isDark ? 'rgba(17, 24, 39, 0.45)' : 'transparent',
    font: { color: fontColor, ...layout.font },
    xaxis: mergeAxis(layout.xaxis),
    yaxis: mergeAxis(layout.yaxis),
    ...(layout.xaxis2 ? { xaxis2: mergeAxis(layout.xaxis2) } : {}),
    ...(layout.yaxis2 ? { yaxis2: mergeAxis(layout.yaxis2) } : {}),
  }
}

/** Canvas 2D 示意图调色板 */
export function canvasPalette(isDark) {
  if (isDark) {
    return {
      panel: '#1f2937',
      baseline: '#9ca3af',
      muted: '#9ca3af',
      label: '#e5e7eb',
      connector: '#4b5563',
      emptyText: '#9ca3af',
      target: '#9ca3af',
      grid: '#4b5563',
    }
  }
  return {
    panel: '#fafbfc',
    baseline: '#34495e',
    muted: '#7f8c8d',
    label: '#2c3e50',
    connector: '#d5dbe1',
    emptyText: '#999999',
    target: '#555555',
    grid: '#bdc3c7',
  }
}
