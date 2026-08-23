<script setup lang="ts">
import { computed } from "vue";
import { galleryPhotos } from "~/data/galleryData";

const { locale } = useI18n();
const localePath = useLocalePath();
const isEn = computed(() => locale.value.startsWith("en"));

const previewPhotos = computed(() => galleryPhotos.slice(0, 4));
</script>

<template>
  <div class="homepage-root">
    <main class="container">
      <section class="hero">
        <img
          class="logo"
          src="/img/text-logo.avif"
          alt="TWBC"
          width="2362"
          height="1816"
        />

        <div class="date">
          {{ $t("home.subtitle") }}
          <span class="time-addon">09:30 (GMT+8)</span>
        </div>

        <div class="thank-you-area">
          <h2 class="thank-you-title">{{ $t("home.thankYou.title") }}</h2>
          <p class="thank-you-text">{{ $t("home.thankYou.subtitle") }}</p>
          <NuxtLink class="gallery-btn" :to="localePath('/gallery')">
            <i class="fa-solid fa-images"></i>
            <span>{{ $t("home.thankYou.viewGallery") }}</span>
          </NuxtLink>
        </div>
      </section>

      <!-- Gallery Highlights Preview -->
      <section
        v-if="previewPhotos.length > 0"
        class="info-card gallery-preview-card"
      >
        <h2>{{ $t("home.galleryPreview.title") }}</h2>
        <p class="gallery-preview-subtitle">
          {{ $t("home.galleryPreview.subtitle") }}
        </p>
        <div class="gallery-preview-grid">
          <NuxtLink
            v-for="photo in previewPhotos"
            :key="photo.id"
            :to="localePath('/gallery')"
            class="preview-item"
          >
            <div class="preview-img-wrapper">
              <img
                :src="photo.url"
                :alt="photo.title[isEn ? 'en' : 'zh']"
                class="preview-img"
                loading="lazy"
                width="300"
                height="200"
              />
              <div class="preview-overlay">
                <span class="preview-title">{{
                  photo.title[isEn ? "en" : "zh"]
                }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <div class="gallery-preview-actions">
          <NuxtLink class="gallery-btn secondary" :to="localePath('/gallery')">
            <span>{{ $t("home.thankYou.viewGallery") }}</span>
            <i class="fa-solid fa-arrow-right"></i>
          </NuxtLink>
        </div>
      </section>

      <section class="info-card">
        <h2>{{ $t("home.about.title") }}</h2>
        <h4>{{ $t("home.about.content") }}</h4>
        <h4 class="pinkie-quote align-right">
          {{ $t("home.about.pinkiequote") }}
        </h4>
      </section>

      <section class="info-card">
        <h2>{{ $t("home.location.title") }}</h2>
        <h4 class="location-details">
          {{ $t("home.location.name") }}<br />
          {{ $t("home.location.address") }}
        </h4>
        <iframe
          class="map"
          :title="$t('home.location.mapTitle')"
          loading="lazy"
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d903.4343855604266!2d121.4858447!3d25.0768833!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a8d751f69539%3A0x3363e968c8ea913!2zQXNpIFNwYWNlIFJlbnRhbCDpmL_mlq_nlJ_mtLvnqbrplpPloLTlnLDlh7rnp58!5e0!3m2!1szh-TW!2stw!4v1777220130926!5m2!1szh-TW!2stw"
          referrerpolicy="no-referrer-when-downgrade"
        >
        </iframe>
      </section>

      <section class="info-card large">
        <h2>{{ $t("home.faq.title") }}</h2>
        <div v-for="i in 4" :key="i">
          <h4>{{ $t("home.faq.questionPrefix") }}{{ $t(`home.faq.q${i}`) }}</h4>
          <p>{{ $t("home.faq.answerPrefix") }}{{ $t(`home.faq.a${i}`) }}</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* General Reset */
.homepage-root {
  overflow-x: hidden;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Main Container */
.container {
  position: relative;
  width: clamp(50%, 50vw, 1400px);
  border-radius: 1em;
  background: linear-gradient(
    to bottom,
    rgba(72, 38, 82, 0) 40%,
    rgba(72, 38, 82, 0.5) 50%,
    rgba(72, 38, 82, 0.5) 95%,
    rgba(72, 38, 82, 0) 100%
  );
  min-height: 100vh;
  margin: 0 auto;
  padding: 0 1.2em 0em;
  box-sizing: border-box;
  container-type: inline-size;
}

.container::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(72, 38, 82, 0) 40%,
    rgba(72, 38, 82, 0.5) 50%,
    rgba(72, 38, 82, 0.5) 95%,
    rgba(72, 38, 82, 0) 100%
  );
  z-index: -2;
  transition: all 0.25s ease;
}

/* Logo */
.logo {
  display: block;
  width: clamp(20em, 30vw, 40em);
  height: auto;
  margin: 5rem auto 5.5rem;
  transition: all 0.2s ease-out;
}

/* Hero */
.hero {
  text-align: center;
  padding: 2.2em 0 2.5em;
  margin-bottom: 10em;
  color: var(--color-pink);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.hero .date {
  font-size: clamp(1.75em, 3.5vw, 2.25em);
  margin-bottom: 0.5em;
  color: var(--color-text-light);
}

.hero .time-addon {
  font-size: 0.65em;
  color: var(--color-pink);
  font-weight: 600;
  margin-left: 0.3em;
  white-space: nowrap;
}

.countdown-area {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 1.5rem 0 2rem;
  gap: 0.75rem;
}

.count-title {
  margin: 0;
  font-size: clamp(1.5em, 3.5vw, 1.75em);
}

/* Thank You Area */
.thank-you-area {
  margin: 2rem auto;
  max-width: 650px;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  background: rgba(20, 10, 25, 0.45);
  border: 1px solid rgba(255, 230, 167, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.thank-you-title {
  margin: 0;
  font-size: clamp(1.4rem, 3.2vw, 1.8rem);
  color: var(--color-gold);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  font-weight: 700;
}

.thank-you-text {
  margin: 0;
  font-size: clamp(0.95rem, 2.2vw, 1.1rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  text-align: center;
}

/* Gallery Buttons */
.gallery-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.75rem;
  color: #120b18;
  font-weight: bold;
  text-decoration: none;
  font-size: 1.1rem;
  background: linear-gradient(135deg, var(--color-gold), #e2b866);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(255, 230, 167, 0.3);
  transition: all 0.25s ease;
  cursor: pointer;
  border: none;
}

.gallery-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 230, 167, 0.5);
  background: linear-gradient(135deg, #fff2cc, var(--color-gold));
}

.gallery-btn:active {
  transform: translateY(0);
}

.gallery-btn.secondary {
  background: transparent;
  color: var(--color-gold);
  border: 1px solid var(--color-gold);
  box-shadow: none;
  margin-top: 0.5rem;
}

.gallery-btn.secondary:hover {
  background: rgba(255, 230, 167, 0.1);
  color: var(--color-gold);
}

/* Gallery Preview Section */
.gallery-preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.gallery-preview-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.05rem;
  margin: 0 0 1.5rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.gallery-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  width: 100%;
  margin-bottom: 1.5rem;
}

.preview-item {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 230, 167, 0.1);
  aspect-ratio: 3 / 2;
  position: relative;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: #000;
}

.preview-img-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(18, 11, 24, 0.8) 10%,
    rgba(18, 11, 24, 0.1) 60%
  );
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0.75rem;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.preview-title {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.preview-item:hover {
  transform: translateY(-4px);
  border-color: var(--color-gold);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
}

.preview-item:hover .preview-img {
  transform: scale(1.05);
}

.preview-item:hover .preview-overlay {
  opacity: 1;
  background: rgba(18, 11, 24, 0.4);
  align-items: center;
}

.gallery-preview-actions {
  display: flex;
  justify-content: center;
  width: 100%;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Info Card */
.info-card {
  min-height: 13em;
  margin: 1.5em 0;
  padding: 1.5em;
  border: 0.12em solid rgba(255, 255, 255, 0.45);
  border-radius: 1em;
  background: rgba(78, 48, 86, 0.42);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.05);
}

.info-card.large {
  min-height: 18em;
}

.info-card h2 {
  margin: 0 0 0.5em;
  text-align: center;
  font-size: clamp(1.75em, 3.75cqw, 2em);
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.7);
}

.info-card h4 {
  text-align: justify;
  font-size: clamp(1.1em, 2.75cqw, 1.25em);
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.7);
  margin-bottom: 0;
  font-weight: 400;
}

.info-card h4.location-details {
  text-align: center;
}

.info-card p {
  text-align: justify;
  font-size: clamp(1.1em, 2.75cqw, 1.2em);
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.7);
  margin-top: 0;
  font-weight: 400;
}

/* Map */
.map {
  border: 0;
  border-radius: 1em;
  background: rgba(78, 48, 86, 0.42);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.05);
  width: 100%;
  height: 50vh;
  margin-top: 1em;
}

.info-card h4.pinkie-quote {
  display: block;
  margin-top: 1em;
  color: var(--color-pink);
  text-align: right;
}

/* Mobile */
@media screen and (max-width: 800px) {
  .container {
    width: 100%;
    padding: 0 0.5em 1em;
  }

  .container::before {
    background: linear-gradient(
      to bottom,
      rgba(72, 38, 82, 0) 25%,
      rgba(72, 38, 82, 0.5) 35%,
      rgba(72, 38, 82, 0.5) 95%,
      rgba(72, 38, 82, 0) 100%
    );
  }

  .logo {
    margin: 3em auto 1em;
  }

  .hero {
    margin-bottom: 2.5em;
  }

  .gallery-preview-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .info-card {
    min-height: 11em;
  }

  .info-card.large {
    min-height: 15em;
  }
}
</style>
