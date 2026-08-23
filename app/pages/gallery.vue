<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { galleryPhotos, type GalleryPhoto } from "~/data/galleryData";

const { t, locale } = useI18n();
const route = useRoute();
const localePath = useLocalePath();

const isEn = computed(() => locale.value.startsWith("en"));

// Lightbox state
const activePhotoIdx = ref<number | null>(null);

const activePhoto = computed<GalleryPhoto | null>(() => {
  if (activePhotoIdx.value === null) return null;
  return galleryPhotos[activePhotoIdx.value] || null;
});

const openLightbox = (idx: number) => {
  activePhotoIdx.value = idx;
};

const closeLightbox = () => {
  activePhotoIdx.value = null;
};

const nextPhoto = () => {
  if (activePhotoIdx.value === null) return;
  activePhotoIdx.value = (activePhotoIdx.value + 1) % galleryPhotos.length;
};

const prevPhoto = () => {
  if (activePhotoIdx.value === null) return;
  activePhotoIdx.value =
    (activePhotoIdx.value - 1 + galleryPhotos.length) % galleryPhotos.length;
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (activePhotoIdx.value === null) return;

  if (e.key === "Escape") {
    closeLightbox();
  } else if (e.key === "ArrowRight") {
    nextPhoto();
  } else if (e.key === "ArrowLeft") {
    prevPhoto();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// SEO configuration
const siteUrl = "https://twbronycon.org";
const pageTitle = computed(() => `${t("gallery.title")} - TWBC`);
const pageDesc = computed(() => t("gallery.subtitle"));

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  twitterTitle: pageTitle,
  description: pageDesc,
  ogDescription: pageDesc,
  twitterDescription: pageDesc,
  ogImage: `${siteUrl}/img/text-logo.avif`,
  twitterImage: `${siteUrl}/img/text-logo.avif`,
  ogUrl: computed(() => `${siteUrl}${route.path}`),
  ogImageWidth: null,
  ogImageHeight: null,
});
</script>

<template>
  <PageLayout>
    <template #title>
      <h1>{{ t("gallery.title") }}</h1>
      <p>{{ t("gallery.subtitle") }}</p>
    </template>

    <template #surface>
      <div v-if="galleryPhotos.length > 0" class="gallery-container">
        <!-- Back navigation link -->
        <div class="gallery-nav-top">
          <NuxtLink :to="localePath('/')" class="back-home-link">
            <i class="fa-solid fa-arrow-left"></i>
            <span>{{ t("gallery.backHome") }}</span>
          </NuxtLink>
        </div>

        <!-- Photo Grid -->
        <div class="photo-grid">
          <div
            v-for="(photo, idx) in galleryPhotos"
            :key="photo.id"
            class="photo-card"
            role="button"
            tabindex="0"
            :aria-label="t('common.zoomImage')"
            @click="openLightbox(idx)"
            @keydown.enter="openLightbox(idx)"
            @keydown.space.prevent="openLightbox(idx)"
          >
            <div class="photo-wrapper">
              <img
                :src="photo.url"
                :alt="photo.title[isEn ? 'en' : 'zh']"
                class="photo-img"
                loading="lazy"
                width="400"
                height="300"
              />
              <div class="photo-overlay">
                <i class="fa-solid fa-magnifying-glass-plus zoom-icon"></i>
              </div>
            </div>
            <div class="photo-info">
              <h3 class="photo-title">{{ photo.title[isEn ? "en" : "zh"] }}</h3>
              <p class="photo-desc">
                {{ photo.description[isEn ? "en" : "zh"] }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Photos State -->
      <div v-else class="no-photos-state">
        <p>{{ t("gallery.noPhotos") }}</p>
        <NuxtLink :to="localePath('/')" class="back-home-link">
          <span>{{ t("gallery.backHome") }}</span>
        </NuxtLink>
      </div>

      <!-- Lightbox Modal -->
      <Teleport to="body">
        <Transition name="lightbox-fade">
          <div
            v-if="activePhotoIdx !== null && activePhoto"
            class="lightbox-overlay"
            @click="closeLightbox"
          >
            <!-- Close Button -->
            <button
              class="lightbox-btn lightbox-close"
              type="button"
              :aria-label="t('common.close')"
              @click.stop="closeLightbox"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>

            <!-- Navigation Controls -->
            <button
              class="lightbox-btn lightbox-prev"
              type="button"
              :aria-label="t('gallery.prev')"
              @click.stop="prevPhoto"
            >
              <i class="fa-solid fa-chevron-left"></i>
            </button>

            <button
              class="lightbox-btn lightbox-next"
              type="button"
              :aria-label="t('gallery.next')"
              @click.stop="nextPhoto"
            >
              <i class="fa-solid fa-chevron-right"></i>
            </button>

            <!-- Lightbox Content Container -->
            <div class="lightbox-content-wrapper" @click.stop>
              <div class="lightbox-media-container">
                <img
                  :src="activePhoto.url"
                  :alt="activePhoto.title[isEn ? 'en' : 'zh']"
                  class="lightbox-img"
                />
              </div>

              <!-- Metadata panel inside modal -->
              <div class="lightbox-metadata">
                <div class="metadata-left">
                  <h3 class="metadata-title">
                    {{ activePhoto.title[isEn ? "en" : "zh"] }}
                  </h3>
                  <p class="metadata-desc">
                    {{ activePhoto.description[isEn ? "en" : "zh"] }}
                  </p>
                </div>
                <div class="metadata-right">
                  <span class="photo-counter">
                    {{
                      t("gallery.imageCounter", {
                        current: activePhotoIdx + 1,
                        total: galleryPhotos.length,
                      })
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </PageLayout>
</template>

<style scoped>
.gallery-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.gallery-nav-top {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.5rem;
}

.back-home-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-gold);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.25s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 230, 167, 0.25);
  background: rgba(255, 230, 167, 0.03);
}

.back-home-link:hover {
  border-color: var(--color-gold);
  background: rgba(255, 230, 167, 0.1);
  transform: translateX(-4px);
}

/* Photo Grid */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

@media (max-width: 480px) {
  .photo-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.photo-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: rgba(20, 10, 25, 0.55);
  border: 1px solid rgba(255, 230, 167, 0.08);
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.photo-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 230, 167, 0.4);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

.photo-card:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 4px;
}

.photo-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.photo-card:hover .photo-img {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(18, 11, 24, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.zoom-icon {
  font-size: 2rem;
  color: var(--color-gold);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
  transform: scale(0.8);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.photo-card:hover .zoom-icon {
  transform: scale(1);
}

.photo-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.photo-title {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-gold);
  font-weight: 600;
}

.photo-desc {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* No Photos State */
.no-photos-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.6);
}

/* Lightbox Modal */
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.lightbox-btn {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 230, 167, 0.15);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  z-index: 1010;
}

.lightbox-btn:hover {
  background: var(--color-gold);
  color: #120b18;
  border-color: var(--color-gold);
  transform: scale(1.1);
}

.lightbox-close {
  top: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  font-size: 1.25rem;
}

.lightbox-prev {
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
}

.lightbox-next {
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .lightbox-prev {
    left: 0.75rem;
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
  .lightbox-next {
    right: 0.75rem;
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
}

.lightbox-content-wrapper {
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(18, 11, 24, 0.85);
  border: 1px solid rgba(255, 230, 167, 0.15);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

.lightbox-media-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  position: relative;
  aspect-ratio: 4 / 3;
  max-height: 70vh;
}

.lightbox-img {
  max-width: 100%;
  max-height: 70vh;
  width: auto;
  height: auto;
  object-fit: contain;
}

.lightbox-metadata {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
}

.metadata-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
}

.metadata-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-gold);
  font-weight: 600;
}

.metadata-desc {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
}

.metadata-right {
  flex-shrink: 0;
}

.photo-counter {
  font-size: 0.9rem;
  color: var(--color-pink);
  background: rgba(255, 189, 222, 0.1);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-weight: 500;
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

.lightbox-fade-enter-active .lightbox-content-wrapper {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lightbox-fade-enter-from .lightbox-content-wrapper {
  transform: scale(0.95);
}
</style>
