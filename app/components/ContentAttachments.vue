<script setup lang="ts">
import type { MarkdownImage } from "~/types/content";

defineProps<{
  images: readonly MarkdownImage[];
  fallbackAlt: string;
}>();

const emit = defineEmits<{
  select: [image: MarkdownImage];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="attachments-card">
    <h2 class="attachments-title">
      <i class="fa-solid fa-paperclip" />
      <span>{{ t("event.attachments") }}</span>
    </h2>
    <div class="attachments-grid">
      <div
        v-for="(img, idx) in images"
        :key="idx"
        class="attachment-thumbnail"
        @click="emit('select', img)"
        @keydown.enter="emit('select', img)"
        @keydown.space.prevent="emit('select', img)"
        tabindex="0"
        role="button"
        :aria-label="img.alt || fallbackAlt"
      >
        <div class="thumbnail-wrapper">
          <img :src="img.src" :alt="img.alt || fallbackAlt" />
          <div class="thumbnail-overlay">
            <i class="fa-solid fa-magnifying-glass-plus" />
          </div>
        </div>
        <div class="attachment-info" v-if="img.alt">
          <span class="attachment-name">{{ img.alt }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Attachments Section */
.attachments-card {
  margin-top: 1rem;
}

.attachments-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--color-gold);
  border-bottom: 1px solid var(--color-gold-border);
  padding-bottom: 0.75rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.attachments-title i {
  font-size: 1.1rem;
  color: var(--color-pink);
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.attachment-thumbnail {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 230, 167, 0.12);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
}

.attachment-thumbnail:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 230, 167, 0.4);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 12px rgba(255, 189, 222, 0.08);
}

.attachment-thumbnail:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: rgba(10, 5, 20, 0.4);
}

.thumbnail-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.attachment-thumbnail:hover .thumbnail-wrapper img {
  transform: scale(1.05);
}

.thumbnail-overlay {
  position: absolute;
  inset: 0;
  background: rgba(18, 11, 24, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.thumbnail-overlay i {
  color: var(--color-gold);
  font-size: 1.5rem;
  filter: drop-shadow(0 0 8px rgba(255, 230, 167, 0.6));
  transform: scale(0.9);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.attachment-thumbnail:hover .thumbnail-overlay {
  opacity: 1;
}

.attachment-thumbnail:hover .thumbnail-overlay i {
  transform: scale(1);
}

.attachment-info {
  padding: 0.75rem;
  border-top: 1px solid var(--color-gold-border-subtle);
  background: rgba(20, 10, 25, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.attachment-name {
  font-size: 0.85rem;
  color: var(--color-text-body);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
</style>
