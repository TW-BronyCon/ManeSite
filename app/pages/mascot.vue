<script setup lang="ts">
import { ref, computed } from "vue";
import { SITE_ORIGIN } from "~/utils/site";

const { t } = useI18n();

definePageMeta({
  underDevelopment: false,
});

// Lightbox state
const isLightboxOpen = ref(false);
const currentImage = computed(() => "/img/mascot.avif");

const paletteColors = [
  { nameKey: "mascotPage.colors.newPink", hex: "#FDD0E5" },
  { nameKey: "mascotPage.colors.mattePlum", hex: "#AD87B0" },
  { nameKey: "mascotPage.colors.premiumBlue", hex: "#2551A3" },
  { nameKey: "mascotPage.colors.wellRead", hex: "#B42F33" },
];

usePageSeo({
  title: () => t("mascotPage.title"),
  description: () => t("mascotPage.conceptDesc"),
  image: `${SITE_ORIGIN}/img/mascot.avif`,
  originalImageSize: true,
});
</script>

<template>
  <PageLayout>
    <template #title>
      <h1>{{ t("mascotPage.title") }}</h1>
      <p>{{ t("mascotPage.subtitle") }}</p>
    </template>

    <template #surface>
      <div class="mascot-grid">
        <!-- Mascot Showcase Image Column -->
        <div class="mascot-visual-col">
          <div
            class="mascot-frame clickable"
            role="button"
            tabindex="0"
            :aria-label="t('common.zoomImage')"
            @click="isLightboxOpen = true"
            @keydown.enter="isLightboxOpen = true"
            @keydown.space.prevent="isLightboxOpen = true"
          >
            <img
              src="/img/mascot.avif"
              alt="TWBC Mascot"
              class="mascot-img"
              width="8156"
              height="7067"
            />
          </div>
        </div>

        <!-- Mascot Details Column -->
        <div class="mascot-details-col">
          <div class="mascot-card">
            <h3>{{ t("mascotPage.nameTitle") }}</h3>
            <p>{{ t("mascotPage.name") }}</p>
          </div>

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
                :title="t(color.nameKey)"
              >
                <span class="swatch-label">{{ color.hex }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lightbox Modal -->
      <ImageLightbox
        v-model:open="isLightboxOpen"
        :src="currentImage"
        :alt="t('mascotPage.title')"
        :close-on-escape="true"
        overlay-cursor="zoom-out"
      />
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
    var(--color-antique-gold-tint) 0%,
    rgba(20, 10, 30, 0.6) 70%
  );
  border: 1px solid var(--color-antique-gold-border);
  border-radius: 1.2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  text-align: center;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mascot-frame.clickable {
  cursor: zoom-in;
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
  background: var(--color-card-bg);
  border: 1px solid var(--color-border-subtle);
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
  color: var(--color-text-body);
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
  background: var(--color-card-bg);
  border: 1px solid var(--color-border-subtle);
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
  border: 1px solid var(--color-border-strong);
}

.swatch-label {
  font-size: 0.65rem;
  font-weight: bold;
  color: var(--color-text-light);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
</style>
