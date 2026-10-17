<script setup lang="ts">
const { t } = useI18n();

definePageMeta({
  underDevelopment: false,
});

usePageSeo({
  title: () => t("seo.title"),
  description: () => t("seo.description"),
});
</script>

<template>
  <HomePage />
</template>
