import { t } from '@/i18n'
import { getSettings } from '@/utils/settings'
import { SITE_URL } from '@/constants/seo'

function upsertMeta(selector, attr, name, content) {
  if (!content) return
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href, hreflang) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (hreflang) el.setAttribute('hreflang', hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function applySeoMeta(route) {
  const locale = getSettings().locale ?? 'zh'
  const routeName = route.name ?? 'home'
  const pageTitle = t(`routes.${routeName}`, locale)
  const siteName = t('appName', locale)
  const defaultTitle = t('seo.defaultTitle', locale)
  const defaultDesc = t('seo.defaultDescription', locale)
  const pageDesc =
    t(`seo.routes.${routeName}`, locale) ||
    (pageTitle && pageTitle !== `routes.${routeName}`
      ? t('seo.pageDescription', locale, { page: pageTitle })
      : defaultDesc)

  const fullTitle = pageTitle && pageTitle !== `routes.${routeName}`
    ? `${pageTitle} | ${siteName}`
    : defaultTitle

  document.title = fullTitle
  document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN'

  upsertMeta('meta[name="description"]', 'name', 'description', pageDesc)
  upsertMeta('meta[name="keywords"]', 'name', 'keywords', t('seo.keywords', locale))
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', pageDesc)
  upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', siteName)
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', `${SITE_URL}${route.fullPath}`)
  upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', locale === 'en' ? 'en_US' : 'zh_CN')
  upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary')
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle)
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', pageDesc)

  upsertLink('canonical', `${SITE_URL}${route.path === '/' ? '' : route.path}`)
  upsertLink('alternate', `${SITE_URL}${route.path === '/' ? '' : route.path}`, 'zh-CN')
  upsertLink('alternate', `${SITE_URL}${route.path === '/' ? '' : route.path}`, 'en')
  upsertLink('alternate', `${SITE_URL}${route.path === '/' ? '' : route.path}`, 'x-default')
}
