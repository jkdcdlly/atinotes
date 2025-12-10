<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'

const { loggedIn, fetch: refreshSession, clear } = useUserSession()
const toast = useToast()
const { t, locale, locales, setLocale } = useI18n() // 新增 i18n
// 新增：单独获取 localePath
const localePath = useLocalePath() // 用于生成带语言前缀的链接，这算是啥提供的？ nuxt/i18n 的吗？ 
const loginModal = ref(false)
const logging = ref(false)
const state = reactive({
  password: ''
})

useSeoMeta({
  ogSiteName: 'Atinotes',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: 'atinux'
})

async function onSubmit(event: FormSubmitEvent<typeof state>) {
  if (!event.data.password) return

  await $fetch('/api/login', {
    method: 'POST',
    body: { password: event.data.password }
  })
    .then(async () => {
      await refreshSession()
      loginModal.value = false
      state.password = ''
    })
    .catch(err => toast.add({
      title: 'Wrong password',
      description: err.data?.message,
      color: 'error'
    }))
  logging.value = false
}

// 切换语言的函数
// const availableLocales = computed(() => {
//   return (locales.value as any[]).filter(i => i.code !== locale.value)
// })

// 修改：定义下拉菜单的数据项
const localeItems = computed(() => [
  (locales.value as any[]).map(l => ({
    label: l.name,
    // 当前选中的语言显示对勾图标
    icon: l.code === locale.value ? 'i-lucide-check' : undefined,
    // 点击时切换语言
    onSelect: () => navigateTo(localePath('/', l.code))
  }))
])
</script>

<template>
  <UApp>
    <Head>
      <Html lang="en" />
    </Head>
    <NuxtLoadingIndicator />
    <UHeader
      :title="$t('title')" 
      :to="localePath('/')" 
      :toggle="false"
    >
      <template #right>
        <!-- 新增：语言切换按钮 
        <UButton
          v-for="l in availableLocales"
          :key="l.code"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="setLocale(l.code)"
        >
          {{ l.name }}
        </UButton>
-->
        <!-- 修改：使用下拉菜单切换语言 -->
        <UDropdownMenu :items="localeItems">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-languages"
          />
        </UDropdownMenu>

        <UButton
          v-if="loggedIn"
          color="neutral"
          variant="soft"
          size="sm"
          @click="clear"
        >
          {{ $t('logout') }}
        </UButton>
        <UButton
          v-else
          color="neutral"
          variant="soft"
          size="sm"
          @click="loginModal = true"
        >
          {{ $t('login') }}
        </UButton>
        <USeparator
          orientation="vertical"
          class="mx-3 h-6"
        />
        <UColorModeButton />
        <UButton
          icon="i-simple-icons-github"
          to="https://github.com/jkdcdlly"
          target="_blank"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>
    <UMain>
      <UContainer>
        <NuxtPage />
      </UContainer>
    </UMain>

    <UModal v-model:open="loginModal">
      <template #content>
        <UCard>
          <UForm
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField
              :label="$t('password_label')"
              name="password"
            >
              <UInput
                v-model="state.password"
                type="password"
                icon="i-lucide-lock"
                class="w-full"
              />
            </UFormField>
            <UButton
              type="submit"
              :disabled="state.password.length < 1"
              :loading="logging"
              color="neutral"
              block
            >
              {{ $t('login_to_edit') }}
            </UButton>
          </UForm>
        </UCard>
      </template>
    </UModal>
  </UApp>
</template>
