import { parseMarkdown } from '@nuxtjs/mdc/runtime'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const { slug } = event.context.params || {}
  const { locale } = getQuery(event) // 获取语言参数
  const currentLocale = (locale as string) || 'zh'
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing slug' })
  }
  // Force being a string
  const { body } = await readBody(event)
  const parsed = await parseMarkdown(body)

    // 保存为带语言前缀的 Key
  const key = `${currentLocale}:${slug}`
  await hubKV().set(key, { body, parsed })
  // await hubKV().set(slug, { body, parsed })

  return { slug, body, parsed }
})
