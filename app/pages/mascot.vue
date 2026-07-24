<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

const { t } = useI18n();
const route = useRoute();
const siteUrl = "https://twbronycon.org";

definePageMeta({
  underDevelopment: false,
});

const isLightboxOpen = ref(false);
const currentImage = ref("");

const openLightbox = (imgSrc: string = "/img/mascot.avif") => {
  currentImage.value = imgSrc;
  isLightboxOpen.value = true;
};

function handleContentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target && target.tagName === "IMG") {
    currentImage.value = (target as HTMLImageElement).src;
    isLightboxOpen.value = true;
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isLightboxOpen.value) {
    isLightboxOpen.value = false;
  }
};

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));

const paletteColors = [
  { name: "New Pink", hex: "#FDD0E5" },
  { name: "Matte Plum", hex: "#AD87B0" },
  { name: "Premium Blue", hex: "#2551A3" },
  { name: "Well Read", hex: "#B42F33" },
];

useSeoMeta({
  title: () => t("mascotPage.title"),
  ogTitle: () => t("mascotPage.title"),
  twitterTitle: () => t("mascotPage.title"),
  description: () => t("mascotPage.conceptDesc"),
  ogDescription: () => t("mascotPage.conceptDesc"),
  twitterDescription: () => t("mascotPage.conceptDesc"),
  ogImage: `${siteUrl}/img/mascot.avif`,
  twitterImage: `${siteUrl}/img/mascot.avif`,
  ogImageWidth: null,
  ogImageHeight: null,
  ogUrl: computed(() => `${siteUrl}${route.path}`),
});
</script>

<template>
  <PageLayout>
    <template #title>
      <h1>{{ t("mascotPage.title") }}</h1>
      <p>{{ t("mascotPage.subtitle") }}</p>
    </template>

    <template #surface>
      <div class="mascot-grid" @click="handleContentClick">
        <!-- Mascot Showcase Image Column -->
        <div class="mascot-visual-col">
          <div
            class="mascot-frame clickable"
            role="button"
            tabindex="0"
            :aria-label="t('common.zoomImage')"
            @click="openLightbox('/img/mascot.avif')"
            @keydown.enter="openLightbox('/img/mascot.avif')"
            @keydown.space.prevent="openLightbox('/img/mascot.avif')"
          >
            <img
              src="/img/mascot.avif"
              alt="TWBC Mascot"
              class="mascot-img"
              width="8156"
              height="7067"
            />
            <div class="zoom-overlay">
              <i class="fa-solid fa-magnifying-glass-plus icon"></i>
              <span>{{ t("common.zoomImage") }}</span>
            </div>
          </div>
        </div>

        <!-- Mascot Details Column -->
        <div class="mascot-details-col">
          <div class="mascot-card">
            <h3>{{ t("mascotPage.conceptTitle") }}</h3>
            <p>{{ t("mascotPage.conceptDesc") }}</p>
          </div>

          <div class="mascot-card">
            <h3>{{ t("mascotPage.loreTitle") }}</h3>
            <p>{{ t("mascotPage.loreDesc") }}</p>
          </div>

          <!-- Color Palette -->
          <div class="palette-card">
            <h3>{{ t("mascotPage.paletteTitle") }}</h3>
            <div class="swatches">
              <div
                v-for="color in paletteColors"
                :key="color.hex"
                class="swatch"
                :style="{ backgroundColor: color.hex }"
                :title="color.name"
              >
                <span class="swatch-label">{{ color.hex }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lightbox Modal -->
      <Teleport to="body">
        <Transition name="lightbox-fade">
          <div
            v-if="isLightboxOpen && currentImage"
            class="lightbox-overlay"
            @click="isLightboxOpen = false"
          >
            <button
              type="button"
              class="lightbox-close"
              :aria-label="t('common.close')"
              @click="isLightboxOpen = false"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="lightbox-content">
              <img
                :src="currentImage"
                :alt="t('mascotPage.title')"
                class="lightbox-img"
              />
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </PageLayout>
</template>

<style scoped>
.mascot-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 2.5rem;
  align-items: stretch;
}

@media (max-width: 850px) {
  .mascot-grid {
    grid-template-columns: 1fr;
  }
}

.mascot-visual-col {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.mascot-frame {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 2rem;
  background: radial-gradient(
    circle at center,
    rgba(226, 184, 102, 0.15) 0%,
    rgba(20, 10, 30, 0.6) 70%
  );
  border: 1px solid rgba(226, 184, 102, 0.25);
  border-radius: 1.2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  text-align: center;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mascot-frame.clickable {
  cursor: pointer;
}

.mascot-img {
  width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 15px rgba(226, 184, 102, 0.3));
  transition: transform 0.3s ease;
}

@media (max-width: 850px) {
  .mascot-visual-col {
    height: auto;
  }

  .mascot-frame {
    height: auto;
    max-width: 380px;
  }
}

.zoom-overlay {
  position: absolute;
  inset: 0;
  background: rgba(20, 10, 30, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--color-gold);
  font-weight: bold;
  font-size: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.zoom-overlay .icon {
  font-size: 2rem;
}

.mascot-frame:hover .zoom-overlay,
.mascot-frame:focus-visible .zoom-overlay {
  opacity: 1;
}

.mascot-frame:hover .mascot-img {
  transform: scale(1.04);
}

.mascot-badge-tag {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.35rem 1rem;
  background: var(--color-gold);
  color: #140a1e;
  font-weight: bold;
  font-size: 0.85rem;
  border-radius: 999px;
  box-shadow: 0 0 10px rgba(226, 184, 102, 0.4);
}

.mascot-details-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mascot-card {
  padding: 1.5rem;
  background: rgba(20, 10, 25, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.8rem;
}

.mascot-card h3 {
  margin: 0 0 0.6rem 0;
  font-size: 1.3rem;
  color: var(--color-gold);
}

.mascot-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.attribute-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(20, 10, 25, 0.5);
  border: 1px solid rgba(226, 184, 102, 0.15);
  border-radius: 0.8rem;
}

.attribute-item .icon {
  font-size: 1.4rem;
  color: var(--color-gold);
}

.attr-text {
  display: flex;
  flex-direction: column;
}

.attr-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
}

.attr-val {
  font-size: 0.9rem;
  color: #ffffff;
}

.palette-card {
  padding: 1.2rem;
  background: rgba(20, 10, 25, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.8rem;
}

.palette-card h3 {
  margin: 0 0 0.6rem 0;
  font-size: 1.3rem;
  color: var(--color-gold);
}

.swatches {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.swatch {
  flex: 1;
  min-width: 70px;
  height: 50px;
  border-radius: 0.5rem;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0.3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.swatch-label {
  font-size: 0.65rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

/* Lightbox Modal Styles */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(10, 5, 20, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  cursor: zoom-out;
}

.lightbox-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  z-index: 10000;
}

.lightbox-close:hover {
  background: var(--color-gold);
  color: #140a1e;
  transform: scale(1.1);
}

.lightbox-content {
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.lightbox-img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 1rem;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6);
  cursor: zoom-out;
}

/* Transitions */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}
</style>
