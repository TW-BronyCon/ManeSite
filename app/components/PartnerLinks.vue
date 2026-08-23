<script setup lang="ts">
import { partnerSites, type PartnerSite } from "~/data/partnerData";

const { t } = useI18n();
const localePath = useLocalePath();

const getPartnerAlt = (partner: PartnerSite): string => {
  if (partner.altKey) {
    return t(partner.altKey);
  }
  return partner.name;
};
</script>

<template>
  <div class="partner-list" role="list">
    <template v-for="partner in partnerSites" :key="partner.id">
      <NuxtLink
        v-if="partner.internal"
        :to="localePath(partner.url)"
        class="partner-link"
        :style="{ '--logo-url': `url(${partner.logo})` }"
        :aria-label="getPartnerAlt(partner)"
        role="listitem"
      >
        <img
          :src="partner.logo"
          :alt="getPartnerAlt(partner)"
          :width="partner.width"
          :height="partner.height"
          class="partner-logo"
          loading="lazy"
        />
      </NuxtLink>

      <a
        v-else
        :href="partner.url"
        target="_blank"
        rel="noopener noreferrer"
        class="partner-link"
        :style="{ '--logo-url': `url(${partner.logo})` }"
        :aria-label="getPartnerAlt(partner)"
        role="listitem"
      >
        <img
          :src="partner.logo"
          :alt="getPartnerAlt(partner)"
          :width="partner.width"
          :height="partner.height"
          class="partner-logo"
          loading="lazy"
        />
      </a>
    </template>
  </div>
</template>

<style scoped>
.partner-list {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.partner-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  outline: none;
  opacity: 0.75;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.partner-logo {
  height: 2.75rem;
  width: auto;
  max-width: 140px;
  object-fit: contain;
  display: block;
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

/* Duotone / Monochrome tint using CSS variables and mask */
.partner-link::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--color-pink);
  -webkit-mask-image: var(--logo-url);
  mask-image: var(--logo-url);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
  mix-blend-mode: multiply;
  pointer-events: none;
  opacity: 1;
  transition: all 0.3s ease;
}

/* Hover Effect */
.partner-link:hover {
  transform: translateY(-5px) scale(1.1);
  opacity: 1;
}

.partner-link:hover .partner-logo {
  filter: grayscale(0%) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.partner-link:hover::after {
  opacity: 0;
}

/* Active State */
.partner-link:active {
  transform: translateY(-2px) scale(1.05);
}

/* Focus Visible */
.partner-link:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 4px;
  border-radius: 4px;
  opacity: 1;
  transform: translateY(-5px) scale(1.1);
}

.partner-link:focus-visible .partner-logo {
  filter: grayscale(0%);
}

.partner-link:focus-visible::after {
  opacity: 0;
}

/* Responsive */
@media screen and (max-width: 800px) {
  .partner-list {
    justify-content: center;
    gap: 1.2rem;
  }

  .partner-logo {
    height: 2.2rem;
    max-width: 110px;
  }
}
</style>
