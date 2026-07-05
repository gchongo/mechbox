/** 搜索别名 → 规范化 token（小写、无空格） */
export const THREAD_SEARCH_ALIASES = {
  bspp: 'g',
  bsp: 'g',
  bspt: 'r',
  rc: 'r',
  npt: 'npt',
  nptf: 'nptf',
  unc: 'unc',
  unf: 'unf',
  unef: 'unef',
  tr: 'tr',
  acme: 'acme',
  metric: 'metric',
  iso: 'metric',
  m: 'm',
}

/** 输入预处理：展开常见别名 */
export function expandSearchAliases(q) {
  let s = String(q ?? '').trim().toLowerCase()
  for (const [alias, token] of Object.entries(THREAD_SEARCH_ALIASES)) {
    if (s === alias || s.startsWith(`${alias} `) || s.endsWith(` ${alias}`)) {
      s = s.replace(new RegExp(`\\b${alias}\\b`, 'gi'), token)
    }
  }
  return s
}
