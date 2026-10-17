<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import type { MarkdownImage } from "~/types/content";
import {
  parseMarkdownWithFrontmatter,
  renderMarkdownWithAttachments,
} from "~/utils/markdown";
import { events, columns } from "~/data/scheduleData";
import { toSiteImageUrl } from "~/utils/site";
import { getVenueZoneForTrack } from "~/utils/venue";

const { t, locale } = useI18n();
const route = useRoute();
const localePath = useLocalePath();

const id = route.params.id as string;
const isEn = computed(() => locale.value.startsWith("en"));

// Lightbox state
const isLightboxOpen = ref(false);
const currentImage = ref("");

function openAttachment(image: MarkdownImage): void {
  currentImage.value = image.src;
  isLightboxOpen.value = true;
}

function handleContentClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target && target.tagName === "IMG") {
    currentImage.value = (target as HTMLImageElement).src;
    isLightboxOpen.value = true;
  }
}

// Find the event in schedule data (fallback)
const event = computed(() => events.find((e) => e.id === id));

// Locale suffix for file resolution
const localeSuffix = computed(() => {
  return locale.value === "zh-TW" ? "zh-TW" : "en";
});

// Import all event markdown files lazily/dynamically
const eventMdFiles = import.meta.glob<string>("../../content/events/**/*.md", {
  query: "?raw",
  import: "default",
});

// Fetch raw markdown file content dynamically at runtime
const { data: rawMd } = await useAsyncData(
  `event-md-${id}-${locale.value}`,
  async () => {
    const pathWithLocale = `../../content/events/${id}.${localeSuffix.value}.md`;
    if (eventMdFiles[pathWithLocale]) {
      const loader = eventMdFiles[pathWithLocale];
      return await loader();
    }
    const defaultPath = `../../content/events/${id}.md`;
    if (eventMdFiles[defaultPath]) {
      const loader = eventMdFiles[defaultPath];
      return await loader();
    }
    return null;
  },
);

// Compute parsed content and metadata
const parsed = computed(() => {
  if (!rawMd.value) {
    return {
      meta: {} as Record<string, string>,
      html: "",
      images: [] as MarkdownImage[],
    };
  }
  const { meta, content } = parseMarkdownWithFrontmatter(
    rawMd.value,
    "preserve",
  );
  const { html, images } = renderMarkdownWithAttachments(content);

  return { meta, html, images };
});

const hasEvent = computed(() => !!event.value || !!rawMd.value);

// Resolve properties with fallbacks
const eventTitle = computed(() => {
  if (parsed.value.meta.title) return parsed.value.meta.title;
  return event.value
    ? isEn.value
      ? event.value.title.en
      : event.value.title.zh
    : "";
});

const eventSubtitle = computed(() => {
  return parsed.value.meta.subtitle || "";
});

const eventTimeRange = computed(() => {
  // if (parsed.value.meta.time) return parsed.value.meta.time;
  return event.value ? `${event.value.start} - ${event.value.end}` : "";
});

const eventArea = computed(() => {
  const currentEvent = event.value;
  if (!currentEvent) return "";
  const matchingCol = columns.find((col) => col.key === currentEvent.track);
  if (matchingCol?.label) {
    return isEn.value ? matchingCol.label.en : matchingCol.label.zh;
  }
  return currentEvent.track;
});

const eventZoneId = computed(() => {
  const currentEvent = event.value;
  if (!currentEvent) return "";
  return getVenueZoneForTrack(currentEvent.track) || "";
});

const eventDetailText = computed(() => {
  // If there's no compiled markdown HTML, we fallback to event.detail from JSON
  return event.value && event.value.detail
    ? isEn.value
      ? event.value.detail.en
      : event.value.detail.zh
    : "";
});

const eventType = computed(() => {
  return event.value?.type || "";
});

// Map event type to FontAwesome icon
const posterIcon = computed(() => {
  switch (eventType.value) {
    case "entry":
      return "fa-solid fa-door-open";
    case "opening":
      return "fa-solid fa-flag";
    case "community":
      return "fa-solid fa-users";
    case "break":
      return "fa-solid fa-film";
    case "talk":
      return "fa-solid fa-chalkboard-user";
    case "music":
      return "fa-solid fa-compact-disc";
    case "sing":
      return "fa-solid fa-music";
    case "photo":
      return "fa-solid fa-camera";
    case "workshop":
      return "fa-solid fa-palette";
    case "vendor":
      return "fa-solid fa-store";
    case "social":
      return "fa-solid fa-comments";
    case "social-special":
      return "fa-solid fa-dice";
    default:
      return "fa-solid fa-star";
  }
});

// Get the localized type label for the poster subtitle
const posterSubtitle = computed(() => {
  if (parsed.value.meta.subtitle)
    return parsed.value.meta.subtitle.toUpperCase();
  if (eventType.value) {
    const key = `schedule.types.${eventType.value}`;
    const localized = t(key);
    if (localized && localized !== key) {
      return localized.toUpperCase();
    }
    return eventType.value.toUpperCase();
  }
  return "SPECIAL EVENT";
});

const pageTitle = computed(() =>
  hasEvent.value
    ? `${eventTitle.value} - Taiwan BronyCon`
    : t("event.notFound.title"),
);

const pageDesc = computed(() =>
  hasEvent.value
    ? parsed.value.meta.intro || eventDetailText.value
    : t("event.notFound.message"),
);

const pageImage = computed(() => toSiteImageUrl(parsed.value.images[0]?.src));

usePageSeo({
  title: pageTitle,
  description: pageDesc,
  image: pageImage,
  originalImageSize: true,
});
</script>

<template>
  <PageLayout>
    <template #title>
      <div class="event-header" v-if="hasEvent">
        <h1>{{ eventTitle }}</h1>
      </div>
      <div class="event-header" v-else>
        <h1>{{ t("event.notFound.title") }}</h1>
      </div>
    </template>

    <template #surface>
      <div v-if="hasEvent" class="event-detail-container">
        <!-- Hero section with graphic and quick info -->
        <div class="event-hero info-card">
          <div class="event-poster">
            <div class="poster-glow" />
            <div class="poster-inner">
              <i
                class="poster-icon"
                :class="[posterIcon, { spin: eventType === 'music' }]"
              />
              <div class="poster-title">{{ eventTitle.toUpperCase() }}</div>
              <div class="poster-subtitle" v-if="eventSubtitle">
                {{ eventSubtitle }}
              </div>
              <div class="poster-subtitle" v-else>{{ posterSubtitle }}</div>
            </div>
          </div>

          <div class="event-summary">
            <div class="info-tag-list">
              <NuxtLink
                v-if="eventTimeRange"
                class="info-tag interactive"
                :to="localePath('/schedule')"
                :title="t('event.viewSchedule')"
              >
                <i class="fa-solid fa-clock" />
                <span>{{ eventTimeRange }}</span>
                <span class="map-hint-text"
                  >({{ t("event.viewSchedule") }})</span
                >
              </NuxtLink>
              <NuxtLink
                v-if="eventArea && eventZoneId"
                class="info-tag interactive"
                :to="
                  localePath({
                    path: '/venue',
                    query: { zone: eventZoneId, fromEvent: id },
                  })
                "
                :title="t('event.viewOnMapTooltip')"
              >
                <i class="fa-solid fa-location-dot" />
                <span>{{ eventArea }}</span>
                <span class="map-hint-text">({{ t("event.viewOnMap") }})</span>
              </NuxtLink>
              <span class="info-tag" v-else-if="eventArea">
                <i class="fa-solid fa-location-dot" />
                <span>{{ eventArea }}</span>
              </span>
            </div>
            <!-- If we have parsed HTML, we render it below in a standard markdown area. 
                 Otherwise, fall back to showing the simple intro text. -->
            <p class="intro-text">
              {{ eventDetailText }}
            </p>
          </div>
        </div>

        <!-- Compiled Markdown Content Area -->
        <div
          v-if="parsed.html"
          class="event-markdown-content info-card"
          v-html="parsed.html"
          @click="handleContentClick"
        ></div>

        <!-- Attachments Section -->
        <ContentAttachments
          v-if="parsed.images && parsed.images.length > 0"
          class="info-card"
          :images="parsed.images"
          :fallback-alt="eventTitle"
          @select="openAttachment"
        />
      </div>

      <!-- Not Found State -->
      <div v-else class="not-found-state">
        <p class="not-found-message">{{ t("event.notFound.message") }}</p>
        <NuxtLink :to="localePath('/schedule')" class="back-list-btn">
          <i class="fa-solid fa-list" />
          <span>{{ t("event.viewSchedule") }}</span>
        </NuxtLink>
      </div>

      <!-- Lightbox Modal -->
      <ImageLightbox
        v-model:open="isLightboxOpen"
        :src="currentImage"
        :alt="eventTitle"
        :close-on-escape="false"
        overlay-cursor="zoom-out"
      />
    </template>
  </PageLayout>
</template>

<style scoped>
.event-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.event-badge {
  background: var(--color-gold);
  color: #120b18;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.event-detail-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--color-card-bg-strong);
  border: 1px solid var(--color-gold-border-subtle);
}

/* Event Hero Layout */
.event-hero {
  display: grid;
  grid-template-columns: 1fr 1.8fr;
  gap: 2rem;
  align-items: center;
}

@media (max-width: 850px) {
  .event-hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

/* Stylized Poster */
.event-poster {
  position: relative;
  aspect-ratio: 3 / 2;
  background: linear-gradient(135deg, #2c1a4d, #140526);
  border-radius: 10px;
  border: 1px solid var(--color-gold-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1.5rem;
}

.poster-glow {
  position: absolute;
  inset: -10%;
  background: radial-gradient(
    circle,
    rgba(238, 122, 176, 0.15) 0%,
    rgba(20, 155, 230, 0.15) 40%,
    transparent 70%
  );
  animation: pulse-glow 6s infinite alternate ease-in-out;
}

.poster-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-pink);
  text-align: center;
}

.poster-icon {
  font-size: 4.5rem;
  background: linear-gradient(45deg, var(--color-pink), var(--color-gold));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 12px rgba(255, 189, 222, 0.5));
}

.poster-icon.spin {
  animation: spin 8s infinite linear;
}

.poster-title {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: var(--color-gold);
  text-shadow: 0 0 10px rgba(255, 230, 167, 0.4);
}

.poster-subtitle {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  opacity: 0.8;
}

.event-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 850px) {
  .info-tag-list {
    justify-content: center;
  }
}

.info-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 230, 167, 0.12);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-gold);
}

.info-tag.interactive {
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.info-tag.interactive:hover {
  background: rgba(255, 230, 167, 0.15);
  border-color: var(--color-gold);
  transform: translateY(-1px);
}

.map-hint-text {
  font-size: 0.8rem;
  opacity: 0.75;
  font-weight: 500;
  margin-left: 0.2rem;
  transition: opacity 0.2s ease;
}

.info-tag.interactive:hover .map-hint-text {
  opacity: 1;
}

.intro-text {
  font-size: 1.05rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.95);
}

/* Dynamic Markdown Content Styling */
.event-markdown-content :deep(h1),
.event-markdown-content :deep(h2),
.event-markdown-content :deep(h3) {
  color: var(--color-gold);
  border-bottom: 1px solid var(--color-gold-border);
  padding-bottom: 0.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.event-markdown-content :deep(h1:first-child),
.event-markdown-content :deep(h2:first-child),
.event-markdown-content :deep(h3:first-child) {
  margin-top: 0;
}

.event-markdown-content :deep(p) {
  font-size: 0.95rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 1.25rem;
}

.event-markdown-content :deep(ul),
.event-markdown-content :deep(ol) {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.event-markdown-content :deep(li) {
  font-size: 0.95rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.event-markdown-content :deep(strong) {
  color: var(--color-text-light);
  font-weight: 700;
}

.event-markdown-content :deep(a) {
  color: var(--color-gold);
  font-weight: 700;
  text-decoration: underline;
  word-break: break-all;
}

.event-markdown-content :deep(a:hover) {
  opacity: 0.8;
}

.event-markdown-content :deep(img) {
  display: block;
  max-width: min(100%, 650px);
  max-height: 480px;
  width: auto;
  height: auto;
  object-fit: contain;
  margin: 1.5rem auto;
  border-radius: 12px;
  border: 1px solid var(--color-gold-border);
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  cursor: zoom-in;
  transition:
    transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
    border-color 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.event-markdown-content :deep(img:hover) {
  transform: scale(1.01);
  border-color: rgba(255, 230, 167, 0.5);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.45),
    0 0 15px rgba(255, 230, 167, 0.1);
}

/* Not Found styles */
.not-found-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.not-found-message {
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse-glow {
  0% {
    opacity: 0.7;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1.05);
  }
}
</style>
