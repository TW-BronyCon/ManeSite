<script setup lang="ts">
import type { ProcessedTier, TicketFeature } from "~/data/ticketData";

const { t } = useI18n();

defineProps<{
  tiers: readonly ProcessedTier[];
  features: readonly TicketFeature[];
  isHovering: boolean;
  activeRowIndex: number | null;
  activeColIndex: number | null;
}>();

const emit = defineEmits<{
  cellEnter: [rowIndex: number, colIndex: number];
  rowEnter: [rowIndex: number];
  headerEnter: [colIndex: number];
  leave: [];
}>();
</script>

<template>
  <div class="compare-wrap">
    <table
      :class="['compare-table', { 'is-hovering': isHovering }]"
      @mouseleave="emit('leave')"
    >
      <thead>
        <tr>
          <th scope="col" class="feature-head"></th>
          <th
            v-for="(tier, index) in tiers"
            :key="tier.id"
            scope="col"
            class="tier-head"
            :class="{
              'active-col': activeColIndex === index,
              'is-closed-col': tier.isClosed,
            }"
            @mouseenter="emit('headerEnter', index)"
          >
            <span :class="['tier-label', tier.id]">{{
              t(`ticket.tiers.${tier.id}`)
            }}</span>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(feature, rIndex) in features"
          :key="feature.key"
          :class="{ 'active-row': activeRowIndex === rIndex }"
        >
          <th
            scope="row"
            class="feature-name"
            @mouseenter="emit('rowEnter', rIndex)"
          >
            {{ t(`ticket.features.${feature.key}`) }}
          </th>
          <td
            v-for="(avail, cIndex) in feature.availability"
            :key="cIndex"
            :class="[
              'col-' + (cIndex + 1),
              avail ? 'yes' : 'no',
              {
                'active-col': activeColIndex === cIndex,
                'is-closed-col': tiers[cIndex]?.isClosed,
              },
            ]"
            @mouseenter="emit('cellEnter', rIndex, cIndex)"
          >
            {{ avail ? "✔" : "✖" }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* ===== 比較表 ===== */
.compare-wrap {
  max-width: 1040px;
  margin: 1rem auto 0.4rem;
  padding: 0;
  border-radius: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  background: var(--color-paper-bg);
  border: 1px solid rgba(120, 85, 40, 0.25);
  box-shadow:
    0 10px 26px rgba(0, 0, 0, 0.28),
    inset 0 0 18px rgba(120, 80, 30, 0.12);
}

.compare-table {
  position: relative;
  min-width: 600px;
  width: 100%;
  padding: 1.6rem 1.4rem;
  background:
    radial-gradient(circle at 0% 0%, rgba(90, 60, 20, 0.18), transparent 38%),
    radial-gradient(circle at 100% 0%, rgba(90, 60, 20, 0.14), transparent 38%),
    radial-gradient(circle at 0% 100%, rgba(90, 60, 20, 0.12), transparent 38%),
    radial-gradient(
      circle at 100% 100%,
      rgba(90, 60, 20, 0.18),
      transparent 38%
    ),
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.025) 0px,
      rgba(0, 0, 0, 0.025) 1px,
      transparent 1px,
      transparent 3px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.02) 0px,
      rgba(0, 0, 0, 0.02) 1px,
      transparent 1px,
      transparent 5px
    ),
    var(--color-paper-bg-gradient);
  border-collapse: collapse;
  table-layout: fixed;
  color: var(--color-paper-text);
}

.compare-table thead th {
  padding-top: 0;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid rgba(137, 97, 43, 0.24);
}

.feature-head {
  width: 30%;
  transition: all 0.2s ease-out;
}

.tier-head {
  height: 4.5rem;
  padding-bottom: 10px;
  position: relative;
  vertical-align: bottom;
  text-align: center;
}

.tier-label {
  position: absolute;
  left: 50%;
  bottom: 1.5rem;
  transform: translateX(-50%) rotate(-32deg);
  transform-origin: center bottom;
  white-space: nowrap;
  font-size: clamp(1rem, 2vw, 1.35rem);
  font-weight: 800;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.32);
  pointer-events: none;
}

.tier-label.budget {
  color: var(--color-tier-budget-dark);
}
.tier-label.standard {
  color: var(--color-tier-standard-dark);
}
.tier-label.sponsor {
  color: var(--color-tier-sponsor-dark);
}
.tier-label.royale {
  color: var(--color-tier-royale-dark);
}

.compare-table td.col-1.yes {
  color: var(--color-tier-budget-dark);
}
.compare-table td.col-2.yes {
  color: var(--color-tier-standard-dark);
}
.compare-table td.col-3.yes {
  color: var(--color-tier-sponsor-dark);
}
.compare-table td.col-4.yes {
  color: var(--color-tier-royale-dark);
}

.compare-table tbody tr {
  border-bottom: 1px solid rgba(137, 97, 43, 0.16);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;
}

.feature-name {
  text-indent: 1em;
  text-align: left;
  padding: 0.8rem 0.8rem;
  font-size: clamp(1rem, 2vw, 1.35rem);
  font-weight: 800;
  line-height: 1.3;
  word-break: break-word;
  color: var(--color-paper-text-muted);
}

.compare-table td {
  text-align: center;
  padding: 0.7rem 0.35rem;
  font-size: 1.12rem;
  font-weight: 700;
  color: var(--color-paper-text);
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;
}

.compare-table td,
.compare-table th {
  position: relative;
}

.compare-table td:not(:first-child),
.compare-table thead th:not(:first-child) {
  width: 2.9em;
}

.compare-table td.yes {
  text-shadow: 0 0 8px currentColor;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
}

.compare-table td.no {
  color: var(--color-paper-text-muted);
  font-size: clamp(1.1rem, 2vw, 1.4rem);
}

.compare-table.is-hovering tbody td,
.compare-table.is-hovering tbody th {
  opacity: 0.25;
}

.compare-table.is-hovering thead th {
  opacity: 0.25;
}

.compare-table.is-hovering thead th.active-col:not(.is-closed-col) {
  opacity: 1;
}

.compare-table.is-hovering .active-row,
.compare-table.is-hovering .active-row td:not(.is-closed-col),
.compare-table.is-hovering .active-row th:not(.is-closed-col),
.compare-table.is-hovering .active-col:not(.is-closed-col) {
  opacity: 1;
}

.compare-table.is-hovering .active-row {
  background: rgba(188, 139, 46, 0.08);
}

.compare-table.is-hovering td.active-col:not(.is-closed-col),
.compare-table.is-hovering th.active-col:not(.is-closed-col) {
  background: rgba(157, 112, 41, 0.06);
}

.compare-table.is-hovering .active-row .feature-name {
  color: var(--color-paper-text-dark);
}

.compare-table.is-hovering .active-col .tier-label {
  opacity: 1;
  text-shadow:
    0 0 6px currentColor,
    0 0 14px rgba(255, 255, 255, 0.18);
}

@media screen and (max-width: 800px) {
  /* compare-table 保持表格，只做橫向滑動 */
  .compare-wrap {
    padding: 0;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .compare-table {
    min-width: 600px;
    padding: 0.7rem;
  }

  .compare-table thead {
    display: table-header-group;
  }

  .compare-table tbody {
    display: table-row-group;
  }

  .compare-table tr {
    display: table-row;
  }

  .compare-table th,
  .compare-table td {
    display: table-cell;
  }

  .feature-name {
    padding: 0.55rem 0.45rem;
    font-size: 0.92rem;
    text-align: left;
    border-bottom: none;
    margin-bottom: 0;
  }

  .compare-table td {
    padding: 0.45rem 0.2rem;
    font-size: 0.95rem;
    font-weight: 700;
    border-bottom: none;
  }

  .compare-table td::before {
    content: none;
  }

  .compare-table td.yes,
  .compare-table td.no {
    font-size: 0.95rem;
  }

  .tier-head {
    height: 3.8rem;
  }

  .tier-label {
    bottom: 1.2rem;
    font-size: 0.85rem;
    transform: translateX(-50%) rotate(-28deg);
  }

  .compare-table td:not(:first-child),
  .compare-table thead th:not(:first-child) {
    width: 2.4em;
  }

  .compare-table.is-hovering tbody tr,
  .compare-table.is-hovering tbody td,
  .compare-table.is-hovering tbody th,
  .compare-table.is-hovering thead th {
    opacity: 1;
  }
}

@media screen and (min-width: 1400px) {
  .feature-head {
    width: 36%;
  }
}

/* Compare table closed tier styles */
.compare-table thead th.is-closed-col,
.compare-table tbody td.is-closed-col {
  opacity: 0.35;
  filter: grayscale(0.5);
}
</style>
