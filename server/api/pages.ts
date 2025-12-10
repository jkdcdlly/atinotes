export default eventHandler(async (event) => {
  const { locale } = getQuery(event) // 获取语言参数
  const currentLocale = (locale as string) || 'zh'
  const prefix = `${currentLocale}:`

  const keys = await hubKV().keys()
  const notes: any[] = []

  for (const key of keys) {
    let noteSlug = ''
    // 1. 匹配新格式 "zh:slug"
    if (key.startsWith(prefix)) {
      noteSlug = key.slice(prefix.length)
    }
    // 2. 兼容旧格式 (仅限中文)
    else if (currentLocale === 'zh' && !key.includes(':')) {
      noteSlug = key
    } else {
      continue
    }


    if (key === 'index') continue
    const note = await hubKV().get(key) as any
    
    if (note && note.parsed) {
      notes.push({
        path: '/' + noteSlug,
        title: note.parsed.data?.title || noteSlug,
        description: note.parsed.data?.description || ''
      })
    }
  }
  return notes
})