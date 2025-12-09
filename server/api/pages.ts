export default eventHandler(async () => {
  const keys = await hubKV().keys()
  const notes: any[] = []

  for (const key of keys) {
    if (key === 'index') continue
    const note = await hubKV().get(key) as any
    if (note && note.parsed) {
      notes.push({
        path: '/' + key,
        title: note.parsed.data?.title || key,
        description: note.parsed.data?.description || ''
      })
    }
  }
  return notes
})