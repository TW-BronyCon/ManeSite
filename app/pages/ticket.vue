<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { rawTiers, featuresList, type ProcessedTier } from "~/data/ticketData";

/**
 * Ticket Page Component
 * Handles displaying detailed ticket tiers and interactive feature comparison table.
 */

const { t, locale } = useI18n();

const isEn = computed(() => locale.value.startsWith("en"));

definePageMeta({
  underDevelopment: false,
});

// Display mode state: 'detailed' view (cards) or 'table' view (comparison grid)
const currentMode = ref<"detailed" | "table">("detailed");

// Interaction states for comparison table hover effects
const isHovering = ref(false);
const activeRowIndex = ref<number | null>(null);
const activeColIndex = ref<number | null>(null);

/**
 * Toggle display mode between card list and comparison table
 */
const toggleMode = () => {
  currentMode.value = currentMode.value === "detailed" ? "table" : "detailed";
};

// Ticket expiration status check
const currentTime = ref(Date.now());
const timeOffset = ref(0);

const isAfterCloseTime = (closeTimeStr?: string | null) => {
  if (!closeTimeStr) return false;
  const now = new Date(currentTime.value + timeOffset.value);
  return now >= new Date(closeTimeStr);
};

async function syncTime() {
  try {
    const res = await fetch(
      "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Taipei",
    );
    const data = await res.json();
    const serverTime = new Date(data.dateTime);
    const localTime = new Date();
    timeOffset.value = serverTime.getTime() - localTime.getTime();
  } catch (error) {
    timeOffset.value = 0;
    console.error("Failed to sync network time, using local time", error);
  }
}

let statusTimer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  await syncTime();
  statusTimer = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (statusTimer) clearInterval(statusTimer);
});

const isGeneralPresaleEnded = computed(() => {
  const budget = rawTiers.find((t) => t.id === "budget");
  return budget ? isAfterCloseTime(budget.closeTime) : false;
});

const isRoyaleClosed = computed(() => {
  const royale = rawTiers.find((t) => t.id === "royale");
  return royale ? isAfterCloseTime(royale.closeTime) : false;
});

const tiers = computed<ProcessedTier[]>(() => {
  return rawTiers.map((tier) => {
    const isClosed = isAfterCloseTime(tier.closeTime);

    if (tier.isRoyale) {
      return {
        ...tier,
        isClosed,
        isOnsite: false,
        displayPrice: `NT$ ${tier.presalePrice.toLocaleString()}`,
        url: isClosed ? undefined : tier.url,
      };
    }

    if (isClosed) {
      const onsitePriceNum = tier.onsitePrice ?? tier.presalePrice + 50;
      return {
        ...tier,
        isClosed: false,
        isOnsite: true,
        displayPrice: `NT$ ${onsitePriceNum.toLocaleString()}`,
        originalPrice: `NT$ ${tier.presalePrice.toLocaleString()}`,
        url: undefined,
      };
    }

    const futurePriceNum = tier.onsitePrice ?? tier.presalePrice + 50;
    return {
      ...tier,
      isClosed: false,
      isOnsite: false,
      displayPrice: `NT$ ${tier.presalePrice.toLocaleString()}`,
      futureOnsitePrice: `NT$ ${futurePriceNum.toLocaleString()}`,
      url: tier.url,
    };
  });
});

const includedFeatures = computed(() =>
  tiers.value.map((_, index) =>
    featuresList
      .filter((feature) => feature.availability[index])
      .map((feature) => t(`ticket.features.${feature.key}`))
      .join(isEn.value ? ", " : "、"),
  ),
);

/**
 * Track hovered cell inside comparison table
 */
const onCellMouseEnter = (rowIndex: number, colIndex: number) => {
  isHovering.value = true;
  activeRowIndex.value = rowIndex;
  activeColIndex.value = colIndex;
};

/**
 * Track hovered row inside comparison table
 */
const onRowMouseEnter = (rowIndex: number) => {
  isHovering.value = true;
  activeRowIndex.value = rowIndex;
  activeColIndex.value = null;
};

/**
 * Track hovered column header inside comparison table
 */
const onHeaderMouseEnter = (colIndex: number) => {
  isHovering.value = true;
  activeRowIndex.value = null;
  activeColIndex.value = colIndex;
};

/**
 * Reset hover tracking states on mouse exit
 */
const onMouseLeave = () => {
  isHovering.value = false;
  activeRowIndex.value = null;
  activeColIndex.value = null;
};

usePageSeo({
  title: () => t("ticket.title"),
  description: () => t("seo.description"),
});
</script>

<template>
  <PageLayout>
    <template #title>
      <h1>{{ $t("ticket.title") }}</h1>
      <p>{{ $t("ticket.subtitle") }}</p>
    </template>

    <template #surface>
      <!-- Status Notice Banner -->
      <div v-if="isGeneralPresaleEnded" class="ticket-status-banner">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ $t("ticket.onsiteNoticeBanner") }}</span>
      </div>
      <div v-else-if="isRoyaleClosed" class="ticket-status-banner">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ $t("ticket.royaleAndPresaleBanner") }}</span>
      </div>
      <div v-else class="ticket-status-banner">
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>{{ $t("ticket.presaleNoticeBanner") }}</span>
      </div>

      <div class="btn">
        <button class="sectionbtn" @click="toggleMode">
          {{
            currentMode === "detailed"
              ? $t("ticket.viewTable")
              : $t("ticket.viewDetailed")
          }}
        </button>
      </div>

      <!-- Detailed vs. Table View transition switcher -->
      <Transition name="fade-slide" mode="out-in">
        <!-- Detailed View (Card List) -->
        <div
          v-if="currentMode === 'detailed'"
          id="section1"
          class="section show"
        >
          <TicketTierCard
            v-for="(tier, index) in tiers"
            :key="tier.id"
            :tier="tier"
            :included-features="includedFeatures[index]!"
          />
        </div>

        <!-- Table View (Comparison Grid) -->
        <div
          v-else-if="currentMode === 'table'"
          id="section2"
          class="section show"
        >
          <TicketComparisonTable
            :tiers="tiers"
            :features="featuresList"
            :is-hovering="isHovering"
            :active-row-index="activeRowIndex"
            :active-col-index="activeColIndex"
            @cell-enter="onCellMouseEnter"
            @row-enter="onRowMouseEnter"
            @header-enter="onHeaderMouseEnter"
            @leave="onMouseLeave"
          />
        </div>
      </Transition>
    </template>
  </PageLayout>
</template>

<style scoped>
/* Mode Switch Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ===== 按鈕 ===== */
.btn {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin: 0 auto 1.5rem;
  transition: all 0.2s ease-out;
}

.sectionbtn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 9.5rem;
  padding: 0.75em 1.5em;
  font-size: 1rem;
  color: var(--color-gold);
  background: linear-gradient(
    180deg,
    rgba(110, 64, 145, 0.85),
    rgba(66, 34, 86, 0.92)
  );
  border: 1px solid rgba(239, 200, 120, 0.62);
  border-radius: 999px;
  cursor: pointer;
  box-shadow:
    inset 0 0 0 1px rgba(255, 244, 220, 0.08),
    0 6px 18px rgba(0, 0, 0, 0.24);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.sectionbtn:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 0 0 1px rgba(255, 244, 220, 0.14),
    0 10px 24px rgba(0, 0, 0, 0.28),
    0 0 16px rgba(255, 218, 136, 0.1);
}

.sectionbtn:active {
  transform: translateY(1px);
  box-shadow:
    inset 0 0 0 1px rgba(255, 244, 220, 0.08),
    0 4px 10px rgba(0, 0, 0, 0.2);
}

.section {
  transition: all 0.3s ease-out;
}

.hidden {
  display: none;
  pointer-events: none;
}

.show {
  position: relative;
}

/* ===== 票卡 ===== */
#section1.show {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  align-items: stretch;
}

#section2.show {
  display: block;
}

/* ===== 平板 ===== */
@media screen and (max-width: 1100px) {
  .container {
    width: min(100vw - 28px, 980px);
    padding: 0.8rem;
  }

  #section1.show {
    grid-template-columns: 1fr 1fr;
  }
}

/* ===== 手機 ===== */
@media screen and (max-width: 800px) {
  .container {
    width: calc(100vw - 12px);
    margin: 0.35rem auto;
    padding: 0.35rem;
    border-radius: 1rem;
  }

  .border {
    min-height: auto;
    padding: 0.3rem;
    border-width: 2px;
    border-radius: 0.9rem;
  }

  .border .border {
    padding: 0.25rem;
    border-radius: 0.7rem;
  }

  h1 {
    margin-top: 0.5em;
  }

  h1::before,
  h1::after {
    margin: 0 0.22em;
  }

  h2 {
    margin-bottom: 1rem;
    padding: 0 0.6rem;
  }

  .btn {
    gap: 0.65rem;
    margin-bottom: 1rem;
  }

  .sectionbtn {
    width: min(100%, 15rem);
    min-width: 0;
    padding: 0.78em 1.1em;
    font-size: 0.95rem;
  }

  #section1.show {
    grid-template-columns: 1fr;
    gap: 0.9rem;
  }
}

/* ===== 超大螢幕 ===== */
@media screen and (min-width: 1400px) {
  .container {
    width: min(1320px, calc(100vw - 80px));
  }

  #section1.show {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* ===== Expired Ticket Banner & Ribbon ===== */
.ticket-status-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin: 0 auto 1.5rem;
  padding: 0.75rem 1.5rem;
  width: fit-content;
  max-width: 90%;
  background: linear-gradient(
    135deg,
    rgba(183, 28, 28, 0.35),
    rgba(127, 0, 0, 0.45)
  );
  border: 1px solid rgba(211, 47, 47, 0.5);
  border-radius: 0.75rem;
  color: #ffcdd2;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
