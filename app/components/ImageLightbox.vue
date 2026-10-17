<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{
  src: string;
  alt: string;
  closeOnEscape: boolean;
  overlayCursor: "pointer" | "zoom-out";
}>();
const open = defineModel<boolean>("open", { required: true });
const { t } = useI18n();

const handleKeyDown = (event: KeyboardEvent): void => {
  if (props.closeOnEscape && event.key === "Escape") {
    open.value = false;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div
        v-if="open && src"
        class="lightbox-overlay"
        :style="{ cursor: overlayCursor }"
        @click="open = false"
      >
        <button
          class="lightbox-close"
          type="button"
          @click="open = false"
          :aria-label="t('common.close')"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="lightbox-content">
          <img :src="src" :alt="alt" class="lightbox-img" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Lightbox Styles */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(10, 5, 20, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: var(--color-control-bg);
  border: 1px solid var(--color-gold-border);
  color: var(--color-text-light);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  z-index: 1010;
}

.lightbox-close:hover {
  background: var(--color-gold);
  color: var(--color-bg-dark);
  border-color: var(--color-gold);
  transform: scale(1.1);
}

.lightbox-content {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--color-gold-border);
  cursor: zoom-out;
  transition: transform 0.3s ease;
}

/* Lightbox Fade Transition */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

.lightbox-fade-enter-active .lightbox-img {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lightbox-fade-enter-from .lightbox-img {
  transform: scale(0.9);
}
</style>
