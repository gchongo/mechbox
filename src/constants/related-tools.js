/**
 * 结果页「下一步」跨工具跳转
 * path 为路由；label 由 i18n 导航名解析
 */
export const RELATED_TOOLS = {
  gear: ['bevel-gear', 'shaft', 'bearing', 'key', 'worm-gear'],
  'bevel-gear': ['gear', 'shaft', 'bearing', 'key', 'worm-gear'],
  'worm-gear': ['gear', 'bevel-gear', 'shaft', 'bearing'],
  shaft: ['bearing', 'key', 'gear', 'fatigue'],
  bearing: ['shaft', 'interference-fit', 'gear'],
  key: ['shaft', 'standards-ref', 'gear'],
  'bolt-preload': ['bolt-group', 'gasket-flange', 'thread'],
  'gasket-flange': ['bolt-preload', 'bolt-group', 'o-ring'],
  'o-ring': ['standards-ref', 'gasket-flange'],
  'pin-retainer': ['standards-ref', 'key', 'shaft'],
  cylinder: ['column-buckling', 'pin-retainer', 'materials'],
  spring: ['fatigue', 'materials'],
  manufacturing: ['standards-ref', 'materials', 'heat-treatment'],
  'standards-ref': ['key', 'pin-retainer', 'o-ring'],
  'modal-freq': ['vibration-isolation', 'shaft'],
  'vibration-isolation': ['modal-freq', 'spring'],
  'heat-transfer': ['thermal-expansion', 'materials'],
}

const PATH_BY_ID = {
  gear: '/gear',
  'bevel-gear': '/bevel-gear',
  'worm-gear': '/worm-gear',
  shaft: '/shaft',
  bearing: '/bearing',
  key: '/key',
  'bolt-preload': '/bolt-preload',
  'bolt-group': '/bolt-group',
  'gasket-flange': '/gasket-flange',
  'o-ring': '/o-ring',
  'pin-retainer': '/pin-retainer',
  cylinder: '/cylinder',
  spring: '/spring',
  manufacturing: '/manufacturing',
  'standards-ref': '/standards-ref',
  'modal-freq': '/modal-freq',
  'vibration-isolation': '/vibration-isolation',
  'heat-transfer': '/heat-transfer',
  fatigue: '/fatigue',
  'interference-fit': '/interference-fit',
  thread: '/thread',
  materials: '/materials',
  'heat-treatment': '/heat-treatment',
  'column-buckling': '/column-buckling',
  'thermal-expansion': '/thermal-expansion',
}

/**
 * @param {string} toolId
 * @param {'zh'|'en'} [_locale]
 */
export function getRelatedToolLinks(toolId, _locale = 'zh') {
  const ids = RELATED_TOOLS[toolId] ?? []
  return ids
    .map((id) => {
      const path = PATH_BY_ID[id]
      if (!path) return null
      return { id, path }
    })
    .filter(Boolean)
}
