<script setup lang="ts">
import type { ProcessedTier } from "~/data/ticketData";

defineProps<{ tier: ProcessedTier; includedFeatures: string }>();
</script>

<template>
  <a
    :href="tier.isClosed || tier.isOnsite ? undefined : tier.url"
    :target="tier.isClosed || tier.isOnsite ? undefined : '_blank'"
    class="block-link"
    :class="{ 'is-disabled': tier.isClosed }"
    :aria-disabled="tier.isClosed"
  >
    <div
      class="block"
      :style="{ color: tier.color }"
      :class="{ 'is-closed': tier.isClosed }"
    >
      <!-- Ribbon Banners -->
      <div v-if="tier.isClosed" class="ribbon-closed">
        <span>{{ $t("ticket.closed") }}</span>
      </div>
      <div v-else-if="tier.isOnsite" class="ribbon-onsite">
        <span>{{ $t("ticket.onsite") }}</span>
      </div>

      <img
        :src="tier.img"
        :alt="$t(`ticket.tiers.${tier.id}`)"
        class="ticket-img"
      />
      <div class="ticket-text">
        <div class="ticket-title">
          {{ $t(`ticket.tiers.${tier.id}`) }}
        </div>
        <div class="description">
          <div class="desc-top">
            <span :style="{ color: tier.subColor }">{{
              $t(`ticket.descriptions.${tier.id}`)
            }}</span>
          </div>
          <div class="desc-bottom">
            {{ $t("ticket.includes") }}{{ includedFeatures }}
          </div>
        </div>
      </div>
      <div class="ticket-price">
        <template v-if="tier.isOnsite">
          <span class="price-strike-line">
            <del>{{ tier.originalPrice }}</del>
          </span>
          <span class="price-main-line">
            {{ tier.displayPrice }}
            <span class="price-onsite-tag">({{ $t("ticket.onsite") }})</span>
          </span>
        </template>
        <template v-else-if="!tier.isClosed && tier.futureOnsitePrice">
          <span class="price-strike-line">
            <del>{{ tier.futureOnsitePrice }}</del>
          </span>
          <span class="price-main-line">{{ tier.displayPrice }}</span>
        </template>
        <template v-else>
          <span class="price-main-line">{{ tier.displayPrice }}</span>
        </template>
      </div>
    </div>
  </a>
</template>

<style scoped>
.block-link {
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
}

.block {
  height: 100%;
}

.block {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.9rem;
  min-height: 24rem;
  padding: 1.5rem 1.35rem 1.25rem;
  margin: 0;
  border-radius: 1.7rem;
  border: 2px solid color-mix(in srgb, currentColor 62%, #f1d38c 38%);
  background: linear-gradient(
    180deg,
    rgba(255, 246, 227, 0.8),
    rgba(248, 239, 221, 0.9)
  );
  color: var(--color-paper-text);
  box-shadow:
    inset 0 0 0 2px rgba(163, 112, 45, 0.12),
    inset 0 0 30px rgba(255, 255, 255, 0.28),
    0 10px 28px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  transition: all 0.2s ease-out;
}

.block::before {
  content: "";
  position: absolute;
  inset: 10px;
  border-radius: 1.25rem;
  border: 1px solid rgba(164, 120, 57, 0.26);
  pointer-events: none;
}

.block::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.46), transparent 34%),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.12),
      transparent 20%,
      transparent 80%,
      rgba(148, 108, 54, 0.06)
    );
  opacity: 1;
}

.block-link:hover .block {
  transform: translateY(-3px);
  background: linear-gradient(
    180deg,
    rgba(243, 218, 108, 0.8),
    rgba(255, 248, 183, 0.9)
  );
  box-shadow:
    inset 0 0 0 2px rgba(163, 112, 45, 0.16),
    inset 0 0 30px rgba(255, 255, 255, 0.28),
    0 18px 40px rgba(0, 0, 0, 0.24),
    0 0 26px color-mix(in srgb, currentColor 18%, transparent);
}

.block-link:active .block {
  transform: translateY(2px);
  background: linear-gradient(
    180deg,
    rgba(255, 213, 176, 0.8),
    rgba(255, 228, 213, 0.9)
  );
  box-shadow:
    inset 0 0 0 2px rgba(163, 112, 45, 0.12),
    inset 0 0 30px rgba(255, 255, 255, 0.28),
    0 10px 28px rgba(0, 0, 0, 0.18);
}

.ticket-img {
  position: relative;
  z-index: 1;
  width: auto;
  height: 6.25rem;
  margin: 0 auto 0.2rem;
  object-fit: contain;
  flex-shrink: 0;
  color: color-mix(in srgb, currentColor 58%, white 42%);
  filter: drop-shadow(0 0 10px currentColor)
    drop-shadow(0 0 20px color-mix(in srgb, currentColor 45%, transparent));
  transition: all 0.2s ease-out;
  animation-play-state: paused;
}

.block-link:hover .ticket-img {
  animation: wiggle 1.5s infinite ease;
}

@keyframes wiggle {
  0% {
    transform: translateY(0px) scale(1) rotate(-4deg);
  }
  25% {
    transform: translateY(-2px) scale(1.04) rotate(4deg);
  }
  50% {
    transform: translateY(2px) scale(1.1) rotate(-4deg);
  }
  75% {
    transform: translateY(-2px) scale(1.04) rotate(4deg);
  }
  100% {
    transform: translateY(0px) scale(1) rotate(-4deg);
  }
}

.ticket-text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s ease-out;
}

.ticket-title {
  width: 100%;
  margin-bottom: 0.25rem;
  font-size: clamp(1.6rem, 2vw, 2rem);
  line-height: 1.2;
  text-align: center;
  color: color-mix(in srgb, currentColor 65%, #6a4b22 35%);
  letter-spacing: 0.08em;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.42);
}

.ticket-title::after {
  content: "";
  display: block;
  width: 5.5rem;
  height: 1px;
  margin: 0.55rem auto 0;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  opacity: 0.55;
}

.description {
  width: 100%;
  margin-top: 0.3rem;
  font-size: 1.04rem;
  line-height: 1.7;
  color: var(--color-paper-text);
}

.desc-top {
  text-align: center;
  width: 100%;
  margin-bottom: 0.45rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.desc-bottom {
  width: 100%;
  max-width: 26em;
  margin: 0 auto;
  text-align: center;
  word-break: break-word;
}

.ticket-price {
  position: relative;
  z-index: 1;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1.15;
}

.price-strike-line {
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.6;
  margin-bottom: 0.1rem;
  color: var(--color-paper-text-muted);
}

.price-strike-line del {
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
}

.price-main-line {
  font-size: clamp(1.4rem, 1.8vw, 1.85rem);
  white-space: nowrap;
  font-weight: 1000;
  color: color-mix(in srgb, currentColor 72%, #7a5626 28%);
  text-shadow:
    0 0 5px rgba(255, 245, 225, 0.7),
    0 0 10px rgba(255, 240, 218, 0.5),
    0 0 20px rgba(255, 251, 238, 0.3);
}

/* ===== 平板 ===== */
@media screen and (max-width: 1100px) {
  .block {
    min-height: 22rem;
  }

  .desc-bottom {
    max-width: none;
  }
}

/* ===== 手機 ===== */
@media screen and (max-width: 800px) {
  .block {
    min-height: unset;
    padding: 1.15rem 1rem 1rem;
    border-radius: 1.25rem;
  }

  .ticket-img {
    height: 5rem;
  }

  .ticket-title {
    font-size: 1.45rem;
  }

  .description {
    font-size: 0.97rem;
    line-height: 1.65;
  }

  .desc-top {
    margin-bottom: 0.35rem;
  }

  .desc-bottom {
    text-align: left;
  }

  .ticket-price {
    font-size: 1.45rem;
  }
}

/* ===== 超大螢幕 ===== */
@media screen and (min-width: 1400px) {
  .block {
    min-height: 26rem;
  }

  .ticket-img {
    height: 5.8rem;
  }
}

.ribbon-closed {
  position: absolute;
  top: 1.2rem;
  right: -2.6rem;
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  color: var(--color-text-light);
  text-align: center;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 0.15rem 2.8rem;
  transform: rotate(45deg);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.ribbon-onsite {
  position: absolute;
  top: 1.2rem;
  right: -2.6rem;
  background: linear-gradient(135deg, #e65100, #bf360c);
  color: var(--color-text-light);
  text-align: center;
  font-weight: 700;
  font-size: 0.92rem;
  line-height: 1.5;
  padding: 0.15rem 2.8rem;
  transform: rotate(45deg);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
  border: 1px solid var(--color-border-strong);
}

.price-onsite-tag {
  font-size: 0.75em;
  font-weight: 700;
  margin-left: 0.35em;
  opacity: 0.85;
}

.block-link.is-disabled {
  cursor: not-allowed;
}

.block-link.is-disabled .block {
  opacity: 0.65;
  filter: grayscale(0.5);
}

.block-link.is-disabled:hover .block {
  transform: none;
  background: linear-gradient(
    180deg,
    rgba(255, 246, 227, 0.8),
    rgba(248, 239, 221, 0.9)
  );
  box-shadow:
    inset 0 0 0 2px rgba(163, 112, 45, 0.12),
    inset 0 0 30px rgba(255, 255, 255, 0.28),
    0 10px 28px rgba(0, 0, 0, 0.18);
}

.block-link.is-disabled:hover .ticket-img {
  animation: none;
  transform: none;
}
</style>
