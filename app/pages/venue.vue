<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { booths, type Booth } from "~/data/boothData";
import { boothPositions } from "~/data/venueMapData";
import { getTrackForVenueZone } from "~/utils/venue";
import type { VenueZoneEvent } from "~/types/content";

/** Look up a booth by its physical map position. */
const boothByMapId = (mapId: string): Booth | undefined =>
  booths.find((b) => b.mapId === mapId);

const visibleBoothPositions = computed(() =>
  boothPositions.filter((position) => boothByMapId(position.mapId)),
);
import { events, EVENT_COLORS } from "~/data/scheduleData";

const { t, locale } = useI18n();
const route = useRoute();

definePageMeta({
  underDevelopment: false,
});

// Selection states
const selectedZoneId = ref<string | null>(null);
const selectedBooth = ref<Booth | null>(null);
const hoveredZoneId = ref<string | null>(null);
const hoveredBoothId = ref<string | null>(null);
const hoveredBooth = computed(() =>
  hoveredBoothId.value ? (boothByMapId(hoveredBoothId.value) ?? null) : null,
);

const fromEventId = computed(() => route.query.fromEvent as string | undefined);
const fromEvent = computed(() => {
  if (!fromEventId.value) return null;
  return events.find((e) => e.id === fromEventId.value);
});
const fromEventTitle = computed(() => {
  if (!fromEvent.value) return "";
  return isEn.value ? fromEvent.value.title.en : fromEvent.value.title.zh;
});

// Helper for locale checking
const isEn = computed(() => locale.value.startsWith("en"));

// Helpers to support multiline text translations in SVG labels
function getLines(text: string): string[] {
  return text.split("\n");
}

// Event mapping for zones
const zoneEvents = computed<VenueZoneEvent[]>(() => {
  if (!selectedZoneId.value) return [];
  const track = getTrackForVenueZone(selectedZoneId.value);
  if (!track) return [];
  return events
    .filter((e) => e.track === track)
    .sort(
      (a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end),
    )
    .map((e) => {
      const rawColor = EVENT_COLORS[e.type];
      const bg = normalizeHexColor(rawColor);
      return {
        id: e.id,
        title: isEn.value ? e.title.en : e.title.zh,
        start: e.start,
        end: e.end,
        detail: e.detail ? (isEn.value ? e.detail.en : e.detail.zh) : "",
        bg,
      };
    });
});

const mapWrapper = ref<HTMLElement | null>(null);
const {
  zoom,
  panX,
  panY,
  startTouchDistance,
  dragDistance,
  isDragging,
  cursorStyle,
  updateSvgRectSize,
  startPan,
  handleWheel,
  startTouchPan,
  onTouchPan,
  endTouchPan,
  zoomIn,
  zoomOut,
  resetZoom,
  zoomToCoords,
} = useVenueViewport(mapWrapper);

// Handlers
const openZone = (zoneId: string) => {
  if (dragDistance.value > 256) return; // Skip click if panned (16px squared for improved touch sensitivity)
  selectedZoneId.value = zoneId;
  selectedBooth.value = null;

  const zoneCenters: Record<string, { x: number; y: number }> = {
    stage: { x: 347.9, y: 185.7 },
    vendors: { x: 190.0, y: 310.0 },
    workshop: { x: 466.7, y: 192.0 },
    social: { x: 347.9, y: 306.7 },
    exhibition: { x: 435.0, y: 385.0 },
    bar: { x: 74.6, y: 154.3 },
    checkin: { x: 420.4, y: 474.0 },
  };

  const coords = zoneCenters[zoneId];
  if (coords) {
    zoomToCoords(coords.x, coords.y, 1.8);
  }
};

const openBooth = (booth: Booth) => {
  if (dragDistance.value > 256) return; // Skip click if panned (16px squared for improved touch sensitivity)
  selectedBooth.value = booth;
  selectedZoneId.value = null;

  // Keyed by mapId (physical position on the SVG)
  const coords = boothPositions.find(
    (position) => position.mapId === booth.mapId,
  );
  if (coords) {
    zoomToCoords(coords.x, coords.y, 2.5);
  }
};

const openBoothById = (id: string) => {
  const booth = booths.find((b) => b.id === id);
  if (booth) {
    openBooth(booth);
  }
};

const openBoothByMapId = (mapId: string) => {
  const booth = boothByMapId(mapId);
  if (booth) {
    openBooth(booth);
  }
};

const clearSelection = () => {
  selectedZoneId.value = null;
  selectedBooth.value = null;
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    clearSelection();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);

  setTimeout(() => {
    updateSvgRectSize();
    if (route.query.booth) {
      const boothId = route.query.booth as string;
      openBoothById(boothId);
    } else if (route.query.zone) {
      const zoneId = route.query.zone as string;
      openZone(zoneId);
    }
  }, 100);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

usePageSeo({
  title: () => t("venue.title"),
  description: () => t("seo.description"),
});
</script>

<template>
  <PageLayout>
    <template #title>
      <h1>{{ t("venue.title") }}</h1>
      <p>{{ t("venue.hint") }}</p>
    </template>

    <template #surface>
      <div class="venue-layout">
        <!-- SVG Map Container -->
        <div class="map-container-card">
          <div class="map-wrapper" id="map-wrapper" ref="mapWrapper">
            <div
              class="map-viewport"
              :class="{
                'smooth-pan': !isDragging && startTouchDistance === 0,
              }"
              :style="{
                transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`,
                transformOrigin: '0 0',
              }"
            >
              <svg
                id="venue-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 598.22 598.22"
                :style="{
                  cursor: cursorStyle,
                  touchAction: zoom > 1 ? 'none' : 'pan-y',
                }"
                @mousedown="startPan"
                @wheel="handleWheel"
                @touchstart="startTouchPan"
                @touchmove="onTouchPan"
                @touchend="endTouchPan"
              >
                <defs>
                  <!-- SVG Filter for custom glow effects -->
                  <filter
                    id="neon-glow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <!-- Scalable Viewport Group -->
                <g>
                  <!-- Wood Floor Background -->
                  <path
                    class="wood-floor"
                    d="M497.88,107.34v188.78l-39.08,53.09h-249.9l-91.28-122.84-25.7,19.1-22.53-30.43,3.13-2.34c-1.49-.05-2.96-.16-4.42-.32l.14-1.14c-10.19-1.3-19.84-5.36-27.9-11.73l11.46-14.52c16.49,13.05,40.43,10.26,53.48-6.23,13.04-16.47,10.27-40.39-6.18-53.45l-.47-.39,10.14-13.23.67-4.35h388.44Z"
                  />

                  <!-- Outer Border Walls -->
                  <path
                    class="outer-border"
                    d="M546.36,465.67l-95.84-.2v16.86h-60.18v-17.06l-114.95-.3v-39.79h-20.65l-32.85,24.41L55.39,225.52l17.13-12.82c-31.34-1.08-56.4-26.82-56.4-58.42s26.17-58.46,58.46-58.46c13.06,0,25.13,4.28,34.86,11.52h436.92v200.87l-59.36,80.79v34.3h59.36"
                  />

                  <!-- Structural Pillars -->
                  <rect
                    class="pillar"
                    x="264.81"
                    y="237.23"
                    width="23.26"
                    height="23.73"
                  />
                  <rect
                    class="pillar"
                    x="407.27"
                    y="237.23"
                    width="23.26"
                    height="23.73"
                  />
                  <rect
                    class="pillar"
                    x="308.75"
                    y="392.76"
                    width="68.84"
                    height="30.54"
                  />

                  <!-- Connector line -->
                  <line
                    class="map-line"
                    x1="304.55"
                    y1="423.31"
                    x2="487"
                    y2="423.31"
                  />

                  <!-- Interactive Zone: Main Stage -->
                  <g
                    class="zone-group stage-group"
                    :class="{
                      active:
                        hoveredZoneId === 'stage' || selectedZoneId === 'stage',
                    }"
                    @mouseover="hoveredZoneId = 'stage'"
                    @mouseleave="hoveredZoneId = null"
                    @click="openZone('stage')"
                  >
                    <rect
                      class="zone-shape shape-stage"
                      x="260.35"
                      y="107.34"
                      width="175.11"
                      height="156.75"
                    />
                    <text class="zone-label-text" x="347.9" y="185.7">
                      <tspan
                        v-for="(line, idx) in getLines(t('venue.legend.stage'))"
                        :key="idx"
                        x="347.9"
                        :dy="
                          idx === 0
                            ? getLines(t('venue.legend.stage')).length > 1
                              ? '-0.6em'
                              : '0'
                            : '1.2em'
                        "
                      >
                        {{ line }}
                      </tspan>
                    </text>
                  </g>

                  <!-- Interactive Zone: Vendor Alley -->
                  <g
                    class="zone-group vendors-group"
                    :class="{
                      active:
                        hoveredZoneId === 'vendors' ||
                        selectedZoneId === 'vendors',
                    }"
                    @mouseover="hoveredZoneId = 'vendors'"
                    @mouseleave="hoveredZoneId = null"
                    @click="openZone('vendors')"
                  >
                    <polygon
                      class="zone-shape shape-vendors"
                      points="260.35 183.43 175.42 183.43 77.93 255.86 221.89 449.6 254.74 425.18 260.35 425.19 260.35 183.43"
                    />
                    <text class="zone-label-text" x="190.0" y="310.0">
                      <tspan
                        v-for="(line, idx) in getLines(
                          t('venue.legend.vendors'),
                        )"
                        :key="idx"
                        x="190.0"
                        :dy="
                          idx === 0
                            ? getLines(t('venue.legend.vendors')).length > 1
                              ? '-0.6em'
                              : '0'
                            : '1.2em'
                        "
                      >
                        {{ line }}
                      </tspan>
                    </text>
                  </g>

                  <!-- Interactive Zone: Workshop Area -->
                  <g
                    class="zone-group workshop-group"
                    :class="{
                      active:
                        hoveredZoneId === 'workshop' ||
                        selectedZoneId === 'workshop',
                    }"
                    @mouseover="hoveredZoneId = 'workshop'"
                    @mouseleave="hoveredZoneId = null"
                    @click="openZone('workshop')"
                  >
                    <rect
                      class="zone-shape shape-workshop"
                      x="435.46"
                      y="107.35"
                      width="62.42"
                      height="169.22"
                    />
                    <text class="zone-label-text" x="466.7" y="192.0">
                      <tspan
                        v-for="(line, idx) in getLines(
                          t('venue.legend.workshop'),
                        )"
                        :key="idx"
                        x="466.7"
                        :dy="
                          idx === 0
                            ? getLines(t('venue.legend.workshop')).length > 1
                              ? '-0.6em'
                              : '0'
                            : '1.2em'
                        "
                      >
                        {{ line }}
                      </tspan>
                    </text>
                  </g>

                  <!-- Interactive Zone: Social Area -->
                  <g
                    class="zone-group social-group"
                    :class="{
                      active:
                        hoveredZoneId === 'social' ||
                        selectedZoneId === 'social',
                    }"
                    @mouseover="hoveredZoneId = 'social'"
                    @mouseleave="hoveredZoneId = null"
                    @click="openZone('social')"
                  >
                    <rect
                      class="zone-shape shape-social"
                      x="260.35"
                      y="264.09"
                      width="175.11"
                      height="85.13"
                    />
                    <text class="zone-label-text" x="347.9" y="306.7">
                      <tspan
                        v-for="(line, idx) in getLines(
                          t('venue.legend.social'),
                        )"
                        :key="idx"
                        x="347.9"
                        :dy="
                          idx === 0
                            ? getLines(t('venue.legend.social')).length > 1
                              ? '-0.6em'
                              : '0'
                            : '1.2em'
                        "
                      >
                        {{ line }}
                      </tspan>
                    </text>
                  </g>

                  <!-- Interactive Zone: Exhibition -->
                  <g
                    class="zone-group exhibition-group"
                    :class="{
                      active:
                        hoveredZoneId === 'exhibition' ||
                        selectedZoneId === 'exhibition',
                    }"
                    @mouseover="hoveredZoneId = 'exhibition'"
                    @mouseleave="hoveredZoneId = null"
                    @click="openZone('exhibition')"
                  >
                    <polygon
                      class="zone-shape shape-exhibition"
                      points="487 389.01 487 423.31 377.59 423.31 377.59 349.22 458.8 349.22 497.88 296.12 535.13 323.49 487 389.01"
                    />
                    <text class="zone-label-text" x="435.0" y="385.0">
                      <tspan
                        v-for="(line, idx) in getLines(
                          t('venue.legend.exhibition'),
                        )"
                        :key="idx"
                        x="435.0"
                        :dy="
                          idx === 0
                            ? getLines(t('venue.legend.exhibition')).length > 1
                              ? '-0.6em'
                              : '0'
                            : '1.2em'
                        "
                      >
                        {{ line }}
                      </tspan>
                    </text>
                  </g>

                  <!-- Interactive Zone: Bar -->
                  <g
                    class="zone-group bar-group"
                    :class="{
                      active:
                        hoveredZoneId === 'bar' || selectedZoneId === 'bar',
                    }"
                    @mouseover="hoveredZoneId = 'bar'"
                    @mouseleave="hoveredZoneId = null"
                    @click="openZone('bar')"
                  >
                    <polygon
                      class="zone-shape shape-bar"
                      points="22.3 180.48 25.12 185.48 28.41 190.17 32.15 194.52 36.3 198.49 40.82 202.03 45.66 205.11 50.78 207.69 56.13 209.77 61.66 211.31 67.31 212.3 73.03 212.73 78.77 212.6 84.47 211.91 90.07 210.66 95.52 208.87 100.77 206.55 105.77 203.74 110.46 200.44 114.82 196.7 118.78 192.55 122.32 188.03 125.4 183.19 127.99 178.07 130.06 172.72 131.6 167.19 132.59 161.54 133.02 155.82 132.89 150.08 132.2 144.38 130.95 138.78 129.16 133.33 126.85 128.08 124.03 123.08 120.73 118.39 116.99 114.03 112.84 110.07 108.32 106.53 103.48 103.45 98.36 100.86 93.01 98.79 87.48 97.25 81.83 96.26 76.11 95.83 70.37 95.96 64.68 96.65 59.07 97.9 53.62 99.69 48.37 102 43.37 104.82 38.68 108.12 34.33 111.86 30.36 116.01 26.82 120.53 23.74 125.37 21.16 130.49 19.08 135.84 17.54 141.37 16.55 147.02 16.12 152.74 16.25 158.48 16.94 164.17 18.19 169.78 19.98 175.23 22.3 180.48"
                    />
                    <text class="zone-label-text" x="74.6" y="154.3">
                      <tspan
                        v-for="(line, idx) in getLines(t('venue.legend.bar'))"
                        :key="idx"
                        x="74.6"
                        :dy="
                          idx === 0
                            ? getLines(t('venue.legend.bar')).length > 1
                              ? '-0.6em'
                              : '0'
                            : '1.2em'
                        "
                      >
                        {{ line }}
                      </tspan>
                    </text>
                  </g>

                  <!-- Interactive Zone: Check-in -->
                  <g
                    class="zone-group checkin-group"
                    :class="{
                      active:
                        hoveredZoneId === 'checkin' ||
                        selectedZoneId === 'checkin',
                    }"
                    @mouseover="hoveredZoneId = 'checkin'"
                    @mouseleave="hoveredZoneId = null"
                    @click="openZone('checkin')"
                  >
                    <rect
                      class="zone-shape shape-checkin"
                      x="390.34"
                      y="465.47"
                      width="60.18"
                      height="17.06"
                    />
                    <text class="zone-label-text" x="420.4" y="474.0">
                      <tspan
                        v-for="(line, idx) in getLines(
                          t('venue.legend.checkin'),
                        )"
                        :key="idx"
                        x="420.4"
                        :dy="
                          idx === 0
                            ? getLines(t('venue.legend.checkin')).length > 1
                              ? '-0.6em'
                              : '0'
                            : '1.2em'
                        "
                      >
                        {{ line }}
                      </tspan>
                    </text>
                  </g>

                  <!-- Non-interactive Zone: Entrance -->
                  <g class="entrance-group">
                    <polygon
                      class="shape-entrance"
                      points="553.51 441.24 549.52 445.47 553.51 449.7 553.51 441.24"
                    />
                    <text class="zone-label-text-static" x="544.5" y="445.5">
                      <tspan
                        v-for="(line, idx) in getLines(
                          t('venue.legend.entrance'),
                        )"
                        :key="idx"
                        x="544.5"
                        :dy="
                          idx === 0
                            ? getLines(t('venue.legend.entrance')).length > 1
                              ? '-0.6em'
                              : '0'
                            : '1.2em'
                        "
                      >
                        {{ line }}
                      </tspan>
                    </text>
                  </g>

                  <!-- Interactive Booths Layer -->
                  <g id="booths-layer">
                    <g
                      v-for="position in visibleBoothPositions"
                      :key="position.mapId"
                      class="booth-group"
                      :class="{
                        active:
                          hoveredBoothId === position.mapId ||
                          selectedBooth?.mapId === position.mapId,
                      }"
                      :transform="`translate(${position.x}, ${position.y}) rotate(-36.62)`"
                      @mouseover="hoveredBoothId = position.mapId"
                      @mouseleave="hoveredBoothId = null"
                      @click.stop="openBoothByMapId(position.mapId)"
                    >
                      <rect
                        class="booth-rect"
                        :x="-position.width / 2"
                        :y="-position.height / 2"
                        :width="position.width"
                        :height="position.height"
                        rx="2"
                        ry="2"
                      />
                      <text
                        class="booth-label"
                        x="0"
                        y="0.5"
                        dominant-baseline="central"
                        text-anchor="middle"
                      >
                        {{ position.mapId }}
                      </text>
                    </g>
                  </g>
                </g>
              </svg>
            </div>

            <!-- Interactive Zoom & Pan Controls Overlay -->
            <div class="map-controls">
              <button
                class="control-btn"
                type="button"
                @click="zoomIn"
                :aria-label="t('common.zoomIn')"
                title="Zoom In"
              >
                <i class="fa-solid fa-plus" aria-hidden="true"></i>
              </button>
              <button
                class="control-btn"
                type="button"
                @click="zoomOut"
                :aria-label="t('common.zoomOut')"
                title="Zoom Out"
              >
                <i class="fa-solid fa-minus" aria-hidden="true"></i>
              </button>
              <button
                class="control-btn"
                type="button"
                @click="resetZoom"
                :aria-label="t('common.resetZoom')"
                title="Reset View"
              >
                <i class="fa-solid fa-arrows-to-dot" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar / Interactive Info Deck Column Wrapper -->
        <VenueInfoSidebar
          :selected-zone-id="selectedZoneId"
          :selected-booth="selectedBooth"
          :hovered-zone-id="hoveredZoneId"
          :hovered-booth="hoveredBooth"
          :hovered-booth-id="hoveredBoothId"
          :zone-events="zoneEvents"
          :from-event-id="fromEventId"
          @clear-selection="clearSelection"
        />
      </div>
    </template>
  </PageLayout>
</template>

<style scoped>
/* Page Layout */
.venue-layout {
  width: 100%;
  display: grid;
  grid-template-columns: 3fr 1.6fr;
  gap: 1.5em;
  align-items: stretch;
}

@media (max-width: 950px) {
  .venue-layout {
    grid-template-columns: 1fr;
  }
}

.map-container-card {
  min-width: 0; /* Prevent grid column overflow on smaller desktops/tablets */
  padding: 1.5em;
  border-radius: var(--page-surface-radius);
  background: linear-gradient(
    180deg,
    rgba(72, 38, 82, 0.75),
    rgba(72, 38, 82, 0.75)
  );
  box-shadow:
    var(--page-surface-shadow),
    inset 0 0 0 1px var(--page-surface-border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.map-wrapper {
  width: 100%;
  max-width: 650px;
  min-width: 0; /* Prevent flexbox item overflow */
  position: relative;
  overflow: hidden;
  user-select: none;
  border-radius: 0.75em; /* Smooth corners for the map viewport */
  border: 1px solid rgba(255, 230, 167, 0.25); /* Gold outline border around the map */
}

/* SVG styling */
#venue-svg {
  width: 100%;
  height: auto;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  overflow: hidden;
}

.map-viewport {
  width: 100%;
  height: auto;
  display: block;
  transition: none;
  will-change: transform;
}

.map-viewport.smooth-pan {
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

#venue-svg g {
  /* Disabled transition for active drag/pan gesture to prevent heavy/rubbery feedback on touches */
  transition: none;
}

/* Map Controls */
.map-controls {
  position: absolute;
  bottom: 0.8rem;
  right: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  z-index: 10;
}

.control-btn {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background: rgba(20, 10, 25, 0.88);
  border: 1px solid rgba(255, 230, 167, 0.18);
  color: var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.control-btn:hover {
  background: var(--color-nav-bg);
  border-color: var(--color-gold);
  color: var(--color-text-light);
  box-shadow: 0 0 8px var(--color-gold);
}

/* Floor paths & structural styles */
.wood-floor {
  fill: #221424;
  fill-rule: evenodd;
  stroke: #442a49;
  stroke-width: 1px;
}

.outer-border {
  fill: #0c050d;
  stroke: color-mix(in srgb, var(--color-gold) 35%, transparent);
  stroke-miterlimit: 10;
  stroke-width: 2px;
}

.pillar {
  fill: #1e1322;
  stroke: #48344c;
  stroke-width: 1px;
}

.map-line {
  stroke: #48344c;
  stroke-width: 2px;
  stroke-dasharray: 4 4;
}

/* Zone shapes coloring */
.zone-shape {
  fill-opacity: 0.15;
  stroke-width: 2.2px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.zone-characters {
  pointer-events: none;
  transition: all 0.3s ease;
}

.zone-label-text {
  font-family: NotoSansTC-Regular, "Noto Sans TC", sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  fill: var(--color-text-light);
  opacity: 0.65;
  pointer-events: none;
  transition: all 0.25s ease;
  user-select: none;
  text-anchor: middle;
  dominant-baseline: central;
}

.zone-label-text-static {
  font-family: NotoSansTC-Regular, "Noto Sans TC", sans-serif;
  font-size: 12.5px;
  font-weight: 700;
  fill: var(--color-text-light);
  opacity: 0.55;
  pointer-events: none;
  user-select: none;
  text-anchor: end;
  dominant-baseline: central;
}

.zone-group:hover .zone-label-text,
.zone-group.active .zone-label-text {
  opacity: 1;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

/* Main Stage Color System */
.shape-stage {
  fill: #ba55d3;
  stroke: #ba55d3;
}
.font-stage path {
  fill: #da70d6;
}
.stage-group:hover .shape-stage,
.stage-group.active .shape-stage {
  fill-opacity: 0.38;
  stroke: var(--color-text-light);
  filter: url(#neon-glow);
}
.stage-group:hover .font-stage path,
.stage-group.active .font-stage path {
  fill: var(--color-text-light);
}

/* Vendor Alley Color System */
.shape-vendors {
  fill: #fffb1a;
  stroke: #fffb1a;
}
.font-vendors path {
  fill: #ffe6a7;
}
.vendors-group:hover .shape-vendors,
.vendors-group.active .shape-vendors {
  fill-opacity: 0.28;
  stroke: var(--color-text-light);
  filter: url(#neon-glow);
}
.vendors-group:hover .font-vendors path,
.vendors-group.active .font-vendors path {
  fill: var(--color-text-light);
}

/* Workshop Color System */
.shape-workshop {
  fill: #ffaa82;
  stroke: #ffaa82;
}
.font-workshop path {
  fill: #ffdcd0;
}
.workshop-group:hover .shape-workshop,
.workshop-group.active .shape-workshop {
  fill-opacity: 0.38;
  stroke: var(--color-text-light);
  filter: url(#neon-glow);
}
.workshop-group:hover .font-workshop path,
.workshop-group.active .font-workshop path {
  fill: var(--color-text-light);
}

/* Social Area Color System */
.shape-social {
  fill: #1affec;
  stroke: #1affec;
}
.font-social path {
  fill: #a6fff8;
}
.social-group:hover .shape-social,
.social-group.active .shape-social {
  fill-opacity: 0.38;
  stroke: var(--color-text-light);
  filter: url(#neon-glow);
}
.social-group:hover .font-social path,
.social-group.active .font-social path {
  fill: var(--color-text-light);
}

/* Exhibition Color System */
.shape-exhibition {
  fill: #a3a1a0;
  stroke: #a3a1a0;
}
.exhibition-group:hover .shape-exhibition,
.exhibition-group.active .shape-exhibition {
  fill-opacity: 0.38;
  stroke: var(--color-text-light);
  filter: url(#neon-glow);
}

/* Check-in Color System */
.shape-checkin {
  fill: #ff5e62;
  stroke: #ff5e62;
}
.checkin-group:hover .shape-checkin,
.checkin-group.active .shape-checkin {
  fill-opacity: 0.38;
  stroke: var(--color-text-light);
  filter: url(#neon-glow);
}

/* Bar Zone Color System */
.shape-bar {
  fill: var(--color-pink);
  stroke: var(--color-pink);
}
.font-bar path {
  fill: var(--color-pink);
}
.bar-group:hover .shape-bar,
.bar-group.active .shape-bar {
  fill-opacity: 0.38;
  stroke: var(--color-text-light);
  filter: url(#neon-glow);
}
.bar-group:hover .font-bar path,
.bar-group.active .font-bar path {
  fill: var(--color-text-light);
}

/* Entrance Color System (Static reference only) */
.shape-entrance {
  fill: #ff3366;
  stroke: #ff3366;
  fill-opacity: 0.15;
  stroke-width: 2.2px;
}

/* Booth design inside Vendor Alley */
.booth-group {
  cursor: pointer;
  transition: all 0.25s ease;
}

.booth-rect {
  fill: rgba(255, 230, 167, 0.2);
  stroke: var(--color-gold);
  stroke-width: 1px;
  transition: all 0.25s ease;
  transform-origin: 0px 0px;
}

.booth-label {
  fill: var(--color-gold);
  font-size: 7.5px;
  font-weight: 700;
  font-family: inherit;
  pointer-events: none;
  transition: all 0.25s ease;
  transform-origin: 0px 0px;
}

.booth-group:hover .booth-rect,
.booth-group.active .booth-rect {
  fill: var(--color-gold);
  stroke: var(--color-text-light);
  filter: drop-shadow(0 0 4px var(--color-gold));
  transform: scale(1.18);
}

.booth-group:hover .booth-label,
.booth-group.active .booth-label {
  fill: var(--color-bg-dark);
}
</style>
