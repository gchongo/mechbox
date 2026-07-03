/** Sync document lang + default SEO from saved locale before Vue hydrates */
(function () {
  var KEY = 'mechbox_settings'
  var SEO = {
    zh: {
      lang: 'zh-CN',
      title: '机械工具箱 — 尺寸链与机械强度计算',
      description:
        '在线尺寸链叠加分析、概率统计与机械强度计算。支持 RSS/极值/GD&T、Monte Carlo 模拟、齿轮/轴承/螺栓等工程计算。',
      keywords:
        '机械工具箱,尺寸链,公差分析,尺寸链叠加,RSS法,极值法,GD&T,Monte Carlo,概率统计,mechbox',
      ogLocale: 'zh_CN',
      siteName: '机械工具箱',
    },
    en: {
      lang: 'en',
      title: 'MechBox — Tolerance Stack & Mechanical Strength Calculators',
      description:
        'Online tolerance stack-up analysis, statistical tools, and mechanical engineering calculators. RSS/worst-case/GD&T, Monte Carlo, gears, bearings, bolts, and more.',
      keywords:
        'MechBox,tolerance stack,stack-up analysis,RSS,worst-case,GD&T,Monte Carlo,mechanical engineering calculator',
      ogLocale: 'en_US',
      siteName: 'MechBox',
    },
  }

  function setMeta(name, content, useProperty) {
    if (!content) return
    var sel = useProperty
      ? 'meta[property="' + name + '"]'
      : 'meta[name="' + name + '"]'
    var el = document.querySelector(sel)
    if (!el) {
      el = document.createElement('meta')
      if (useProperty) el.setAttribute('property', name)
      else el.setAttribute('name', name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  try {
    var settings = JSON.parse(localStorage.getItem(KEY) || '{}')
    var loc = settings.locale === 'en' ? 'en' : 'zh'
    var seo = SEO[loc]
    document.documentElement.lang = seo.lang
    document.title = seo.title
    setMeta('description', seo.description, false)
    setMeta('keywords', seo.keywords, false)
    setMeta('og:title', seo.title, true)
    setMeta('og:description', seo.description, true)
    setMeta('og:site_name', seo.siteName, true)
    setMeta('og:locale', seo.ogLocale, true)
    setMeta('twitter:title', seo.title, false)
    setMeta('twitter:description', seo.description, false)
  } catch (e) {
    /* keep index.html defaults */
  }
})()
