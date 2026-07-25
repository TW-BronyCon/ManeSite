<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";

const { locale, t } = useI18n();
const route = useRoute();
const siteUrl = "https://twbronycon.org";

definePageMeta({
  underDevelopment: false,
});

const localeSuffix = computed(() => {
  return locale.value === "zh-TW" ? "zh-TW" : "en";
});

// Import all CoC markdown files dynamically
const cocMdFiles = import.meta.glob<string>("../content/coc.*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Render Markdown to HTML string based on current locale
const renderedHtml = computed(() => {
  const pathWithLocale = `../content/coc.${localeSuffix.value}.md`;
  const rawContent =
    cocMdFiles[pathWithLocale] || cocMdFiles["../content/coc.zh-TW.md"] || "";
  if (!rawContent) return "";
  return marked.parse(rawContent);
});

useSeoMeta({
  title: () => t("cocPage.title"),
  ogTitle: () => t("cocPage.title"),
  twitterTitle: () => t("cocPage.title"),
  description: () => t("cocPage.subtitle"),
  ogDescription: () => t("cocPage.subtitle"),
  twitterDescription: () => t("cocPage.subtitle"),
  ogImage: `${siteUrl}/img/text-logo.avif`,
  twitterImage: `${siteUrl}/img/text-logo.avif`,
  ogUrl: computed(() => `${siteUrl}${route.path}`),
});
</script>

<template>
  <PageLayout>
    <template #title>
      <h1>{{ t("cocPage.title") }}</h1>
      <p>{{ t("cocPage.subtitle") }}</p>
    </template>

    <template #surface>
      <div class="coc-container">
        <!-- Notice Card -->
        <div class="coc-notice-card">
          <p>{{ t("cocPage.notice") }}</p>
        </div>

        <!-- Rendered Markdown Body -->
        <article class="coc-article" v-html="renderedHtml"></article>
      </div>
    </template>
  </PageLayout>
</template>

<style scoped>
.coc-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.coc-notice-card {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem 1.5rem;
  background: rgba(226, 184, 102, 0.08);
  border: 1px solid rgba(226, 184, 102, 0.25);
  border-radius: 0.8rem;
}

.coc-notice-card .icon {
  font-size: 1.8rem;
  color: var(--color-gold);
  flex-shrink: 0;
}

.coc-notice-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

/* Styled Markdown typography */
.coc-article :deep(h1) {
  font-size: 1.8rem;
  color: var(--color-gold);
  margin-top: 0;
  margin-bottom: 1.2rem;
  border-bottom: 1px solid rgba(226, 184, 102, 0.2);
  padding-bottom: 0.5rem;
}

.coc-article :deep(h2) {
  font-size: 1.4rem;
  color: #ffffff;
  margin-top: 1.8rem;
  margin-bottom: 1rem;
}

.coc-article :deep(h3) {
  font-size: 1.15rem;
  color: var(--color-gold);
  margin-top: 1.2rem;
  margin-bottom: 0.6rem;
}

.coc-article :deep(p) {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 1rem;
}

.coc-article :deep(ul),
.coc-article :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1.2rem;
}

.coc-article :deep(li) {
  font-size: 0.98rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 0.4rem;
}

.coc-article :deep(hr) {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 2rem 0;
}

.coc-article :deep(strong) {
  color: var(--color-gold);
}
</style>
