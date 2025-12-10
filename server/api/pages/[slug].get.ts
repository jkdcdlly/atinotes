interface Note {
  body: string
  parsed?: object
}

export default eventHandler(async (event) => {
  const { slug } = event.context.params || {}
  const { locale } = getQuery(event) // 获取语言参数
  const currentLocale = (locale as string) || 'zh'
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing slug' })
  }
 // 尝试获取带语言前缀的数据 (例如 "zh:index" 或 "en:index")
  const key = `${currentLocale}:${slug}`
  let note = await hubKV().get<Note>(key)
  
   // 兼容旧数据：如果是中文且没找到，尝试找不带前缀的旧数据
  if (!note && currentLocale === 'zh') {
    note = await hubKV().get<Note>(slug)
  }
  if (!note) {
    note = { body: '# Hello' }
    note.parsed = await parseMarkdown(note.body)
  }

  return { slug, ...note }
})
