<script setup lang="ts">
import { computed } from "vue";
import type { Booth } from "~/data/boothData";
import type { VenueZoneEvent } from "~/types/content";
import { getTrackForVenueZone } from "~/utils/venue";

defineProps<{
  selectedZoneId: string | null;
  selectedBooth: Booth | null;
  hoveredZoneId: string | null;
  hoveredBooth: Booth | null;
  hoveredBoothId: string | null;
  zoneEvents: VenueZoneEvent[];
  fromEventId: string | undefined;
}>();

const emit = defineEmits<{ clearSelection: [] }>();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const isEn = computed(() => locale.value.startsWith("en"));

function cleanLabel(text: string): string {
  return text.replace(/\n/g, " ");
}
</script>

<template>
  <div class="sidebar-column-wrapper">
    <div
      class="info-sidebar-card"
      :class="{ 'has-selection': selectedZoneId || selectedBooth }"
    >
      <!-- Clear Selection Close Button -->
      <button
        v-if="selectedZoneId || selectedBooth"
        class="clear-selection-btn"
        type="button"
        @click="emit('clearSelection')"
        :title="t('common.close')"
        :aria-label="t('common.close')"
      >
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>

      <!-- Hover/Selection Context Info -->
      <div class="sidebar-content-wrapper">
        <!-- 1. Selection State: Booth -->
        <template v-if="selectedBooth">
          <div class="sidebar-item-detail">
            <span class="preview-badge booth-badge">{{
              t("venue.modal.boothTitle", { id: selectedBooth.mapId })
            }}</span>
            <h3>{{ selectedBooth.name[isEn ? "en" : "zh"] }}</h3>
            <div class="sidebar-section-title">
              {{ t("venue.modal.boothIntro") }}
            </div>
            <p class="detail-desc">
              {{ selectedBooth.introduction[isEn ? "en" : "zh"] }}
            </p>

            <div class="booth-cta-section">
              <NuxtLink
                :to="localePath(`/booths/${selectedBooth.id}`)"
                class="view-detail-btn"
              >
                <span>{{ t("venue.modal.viewBoothDetail") }}</span>
                <i class="fa-solid fa-arrow-right"></i>
              </NuxtLink>
            </div>

            <!-- Links -->
            <div
              v-if="selectedBooth.links && selectedBooth.links.length > 0"
              class="sidebar-links-section"
            >
              <div class="sidebar-section-title">
                {{ t("venue.modal.links") }}
              </div>
              <div class="links-grid">
                <a
                  v-for="(link, idx) in selectedBooth.links"
                  :key="idx"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="booth-social-link"
                >
                  <i :class="link.icon || 'fa-solid fa-link'"></i>
                  <span>{{ link.label }}</span>
                </a>
              </div>
            </div>
          </div>
        </template>

        <!-- 2. Selection State: Zone -->
        <template v-else-if="selectedZoneId">
          <div class="sidebar-item-detail">
            <span class="preview-badge" :class="`zone-badge-${selectedZoneId}`">
              {{ cleanLabel(t(`venue.legend.${selectedZoneId}`)) }}
            </span>

            <h3>{{ cleanLabel(t(`venue.legend.${selectedZoneId}`)) }}</h3>
            <div class="sidebar-section-title">
              {{ t("venue.modal.details") }}
            </div>
            <p class="detail-desc">
              {{ t(`venue.zones.${selectedZoneId}`) }}
            </p>

            <!-- Linked Events Schedule -->
            <div
              v-if="getTrackForVenueZone(selectedZoneId)"
              class="sidebar-events-section"
            >
              <div class="sidebar-section-title">
                {{ t("venue.modal.events") }}
              </div>

              <div v-if="zoneEvents.length > 0" class="events-list">
                <NuxtLink
                  v-for="(event, idx) in zoneEvents"
                  :key="idx"
                  :to="event.id ? localePath(`/events/${event.id}`) : undefined"
                  :class="[
                    'event-item-wrapper',
                    { 'interactive-wrapper': event.id },
                  ]"
                >
                  <div
                    :class="[
                      'event-item',
                      {
                        'interactive-item': event.id,
                        'active-event-item': event.id === fromEventId,
                      },
                    ]"
                    :style="{
                      borderLeftColor:
                        event.id === fromEventId
                          ? 'var(--color-gold)'
                          : event.bg,
                      backgroundColor:
                        event.id === fromEventId
                          ? 'rgba(255, 230, 167, 0.08)'
                          : event.bg + '12',
                    }"
                  >
                    <div class="event-item-content">
                      <div class="event-time" :style="{ color: event.bg }">
                        {{ event.start }} - {{ event.end }}
                      </div>
                      <div class="event-title">{{ event.title }}</div>
                      <div v-if="event.detail" class="event-desc">
                        {{ event.detail }}
                      </div>
                    </div>
                    <div class="event-item-action" v-if="event.id">
                      <i class="fa-solid fa-chevron-right"></i>
                    </div>
                  </div>
                </NuxtLink>
              </div>
              <p v-else class="no-events-text">
                {{ t("venue.modal.noEvents") }}
              </p>
            </div>
          </div>
        </template>

        <!-- 3. Hover State: Booth -->
        <template v-else-if="hoveredBoothId">
          <div class="sidebar-item-preview">
            <span class="preview-badge booth-badge">{{
              t("venue.modal.boothTitle", {
                id: hoveredBooth?.id ?? hoveredBoothId,
              })
            }}</span>
            <h3>
              {{ hoveredBooth?.name[isEn ? "en" : "zh"] }}
            </h3>
            <p class="preview-desc">
              {{ hoveredBooth?.introduction[isEn ? "en" : "zh"] }}
            </p>
            <div class="tap-hint">
              <i class="fa-solid fa-hand-pointer"></i>
              <span>{{ t("venue.tapHintBooth") }}</span>
            </div>
          </div>
        </template>

        <!-- 4. Hover State: Zone -->
        <template v-else-if="hoveredZoneId && hoveredZoneId !== 'entrance'">
          <div class="sidebar-item-preview">
            <span
              class="preview-badge"
              :class="`zone-badge-${hoveredZoneId}`"
              >{{ cleanLabel(t(`venue.legend.${hoveredZoneId}`)) }}</span
            >
            <h3>{{ cleanLabel(t(`venue.legend.${hoveredZoneId}`)) }}</h3>
            <p class="preview-desc">
              {{ t(`venue.zones.${hoveredZoneId}`) }}
            </p>
            <div class="tap-hint" v-if="getTrackForVenueZone(hoveredZoneId)">
              <i class="fa-solid fa-hand-pointer"></i>
              <span>{{ t("venue.tapHintZone") }}</span>
            </div>
          </div>
        </template>

        <!-- 5. Default State -->
        <template v-else>
          <div class="sidebar-placeholder">
            <i class="fa-solid fa-map-location-dot placeholder-icon"></i>
            <p>{{ t("venue.hint") }}</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Sidebar Wrapper & Card Styling (Prevents content-based height expansion on desktop) */
.sidebar-column-wrapper {
  position: relative;
  width: 100%;
}

@media (min-width: 951px) {
  .sidebar-column-wrapper {
    height: 100%;
  }

  .info-sidebar-card {
    position: absolute;
    inset: 0;
  }
}

@media (max-width: 950px) {
  .sidebar-column-wrapper {
    height: auto;
  }
}

.info-sidebar-card {
  display: flex;
  flex-direction: column;
  padding: 1.8em;
  border-radius: var(--page-surface-radius);
  background: linear-gradient(
    180deg,
    rgba(46, 21, 56, 0.85),
    rgba(29, 13, 36, 0.95)
  );
  box-shadow:
    0 1em 2em rgba(0, 0, 0, 0.25),
    inset 0 0 0 1px rgba(127, 100, 50, 0.15);
  transition: all 0.3s ease;
  overflow: hidden; /* Lock main container; only wrapper inside scrolls */
}

@media (max-width: 950px) {
  .info-sidebar-card {
    position: relative;
    min-height: 380px;
    max-height: 500px;
  }
}

.info-sidebar-card.has-selection {
  border: 1px solid rgba(255, 230, 167, 0.25);
  box-shadow:
    0 1em 2.5em rgba(0, 0, 0, 0.35),
    0 0 15px rgba(255, 230, 167, 0.05);
}

.clear-selection-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 10;
}

.clear-selection-btn:hover {
  color: var(--color-gold);
  background: rgba(255, 255, 255, 0.05);
  transform: scale(1.1);
}

/* Sidebar Styling */
.sidebar-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Internal scrolling within stretched side panel */
  min-height: 0; /* Flexbox safety constraint to enable internal scrollbar */
  padding-right: 0.4rem;
}

.sidebar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  gap: 1.2rem;
  margin: auto 0;
  padding: 2rem 0;
}

.placeholder-icon {
  font-size: 3rem;
  color: rgba(255, 230, 167, 0.25);
  animation: float-slow 4s ease-in-out infinite;
}

@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.sidebar-item-preview,
.sidebar-item-detail {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  animation: fadeIn 0.3s ease-out;
  width: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 99px;
  text-transform: uppercase;
  color: var(--color-text-light);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.zone-badge-stage {
  background-color: rgba(186, 85, 211, 0.75);
}
.zone-badge-vendors {
  background-color: rgba(255, 215, 0, 0.75);
  color: var(--color-bg-dark);
}
.zone-badge-workshop {
  background-color: rgba(255, 170, 130, 0.75);
}
.zone-badge-social {
  background-color: rgba(26, 255, 236, 0.75);
  color: var(--color-bg-dark);
}
.zone-badge-exhibition {
  background-color: rgba(163, 161, 160, 0.75);
  color: var(--color-bg-dark);
}
.zone-badge-checkin {
  background-color: rgba(255, 94, 98, 0.75);
  color: var(--color-text-light);
}
.zone-badge-bar {
  background-color: rgba(255, 189, 222, 0.75);
  color: var(--color-bg-dark);
}
.zone-badge-entrance {
  background-color: rgba(255, 51, 102, 0.75);
}
.booth-badge {
  background-color: var(--color-gold);
  color: var(--color-bg-dark);
}

.sidebar-item-preview h3,
.sidebar-item-detail h3 {
  margin: 0.2rem 0;
  font-size: clamp(1.4rem, 2vw, 1.8rem);
  color: var(--color-text-light);
  text-shadow: 0 0 8px rgba(255, 230, 167, 0.35);
  line-height: 1.25;
}

.preview-desc,
.detail-desc {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.sidebar-section-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: var(--color-gold);
  border-bottom: 1px solid rgba(255, 230, 167, 0.15);
  width: 100%;
  padding-bottom: 0.25rem;
  margin-top: 0.8rem;
  opacity: 0.85;
}

.tap-hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--color-gold);
  opacity: 0.75;
  margin-top: 0.6rem;
}

/* Event schedules in sidebar */
.sidebar-events-section,
.sidebar-links-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.2rem;
  width: 100%;
}

.event-item-wrapper {
  display: block;
  text-decoration: none;
  width: 100%;
}

.event-item-wrapper.interactive-wrapper {
  cursor: pointer;
}

.event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-left: 3px solid var(--color-gold);
  padding: 0.6rem 0.8rem;
  border-radius: 0 6px 6px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
  gap: 0.6rem;
  width: 100%;
}

.event-item-wrapper.interactive-wrapper:hover .event-item {
  background-color: rgba(255, 255, 255, 0.08) !important;
  transform: translateX(4px);
}

.event-item.active-event-item {
  border-left-width: 5px;
  box-shadow: 0 0 12px rgba(255, 230, 167, 0.15);
}

.event-item-content {
  flex: 1;
  min-width: 0;
}

.event-item-action {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
  transition: all 0.2s ease;
  padding-left: 0.2rem;
}

.event-item-wrapper.interactive-wrapper:hover .event-item-action {
  color: var(--color-gold);
  transform: translateX(2px);
}

.event-time {
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.event-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-light);
  margin-bottom: 0.15rem;
}

.event-desc {
  font-size: 0.85rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.7);
}

.no-events-text {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

/* Booth links in sidebar */
.links-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.2rem;
}

.booth-social-link {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-light);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
  border: 1px solid rgba(255, 230, 167, 0.1);
}

.booth-social-link:hover {
  background: var(--color-gold);
  color: var(--color-bg-dark);
  border-color: var(--color-gold);
  transform: translateY(-1px);
}

.booth-cta-section {
  margin-top: 1rem;
  margin-bottom: 1.25rem;
}

.view-detail-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  background: var(--color-gold);
  color: var(--color-bg-dark);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.25s ease;
  border: 1px solid var(--color-gold);
}

.view-detail-btn:hover {
  background: transparent;
  color: var(--color-gold);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 230, 167, 0.2);
}
</style>
