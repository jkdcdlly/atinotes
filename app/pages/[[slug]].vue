<script setup>
const editor = ref(null)
const editing = ref(false)
const saving = ref(false)
const slug = useRoute().params.slug || 'index'
const { data: page } = await useFetch(`/api/pages/${slug}`)
const { loggedIn } = useUserSession()

useSeoMeta({
  titleTemplate: '%s | Atinotes',
  title: () => page.value.parsed.data?.title || 'Missing title',
  description: () => page.value.parsed.data?.description || 'Missing description',
  ogTitle: () => (page.value.parsed.data?.title || 'Missing title') + ' | Atinotes'
})

defineOgImageComponent('OgImagePage', {
  title: page.value.parsed.data?.title || 'Missing title',
  description: page.value.parsed.data?.description || 'Missing description'
})

async function editMode() {
  if (!loggedIn.value) {
    return
  }
  editing.value = true
  await nextTick()
  editor.value.focus()
  autogrow()
}

function autogrow() {
  if (!editor.value) return
  editor.value.style.height = '5px'
  editor.value.style.height = `${editor.value.scrollHeight}px`
}

function save() {
  if (!editing.value || saving.value) return
  saving.value = true
  $fetch(`/api/pages/${slug}`, {
    method: 'PUT',
    body: { body: page.value.body }
  }).then(async ({ parsed }) => {
    page.value.parsed = parsed
    editing.value = saving.value = false
  }).catch((err) => {
    editing.value = saving.value = false
    alert(err.data.message)
  })
}
</script>

<template>
  <UPage>
    <template
      v-if="page.parsed?.toc?.links?.length"
      #right
    >
      <UContentToc :links="page.parsed?.toc?.links" />
    </template>
    <UPageHeader
      v-if="!editing"
      :title="page.parsed?.data?.title"
      :description="page.parsed?.data?.description"
      @dblclick="editMode"
    >
      <template
        v-if="loggedIn"
        #links
      >
        <UButton
          color="neutral"
          icon="i-lucide-pen"
          variant="soft"
          label="Edit"
          size="sm"
          @click="editMode"
        />
      </template>
    </UPageHeader>
    <UPageBody
      prose
      @dblclick="editMode"
    >
      <form
        v-if="editing"
        class="editor-wrapper"
        @submit.prevent="save"
      >
        <textarea
          ref="editor"
          v-model="page.body"
          @blur="save"
          @input="autogrow"
        />
        <UButton type="submit">
          {{ saving ? 'Saving' : 'Save' }}
        </UButton>
      </form>
      <MDCRenderer
        v-else
        :body="page.parsed.body"
        class="body"
      />
    </UPageBody>
  </UPage>
</template>

<style lang="postcss" scoped>
textarea {
  width: 100%;
  min-height: 200px;
  height: 100%;
  border-width: 0;
  outline: none;
  resize: none;
}
</style>
