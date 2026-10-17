export interface RawTicketTier {
  id: string;
  color: string;
  subColor: string;
  img: string;
  url: string;
  closeTime: string;
  presalePrice: number;
  onsitePrice?: number;
  isRoyale?: boolean;
}

export interface ProcessedTier {
  id: string;
  color: string;
  subColor: string;
  img: string;
  url?: string;
  closeTime: string;
  presalePrice: number;
  onsitePrice?: number;
  isRoyale?: boolean;
  isClosed: boolean;
  isOnsite: boolean;
  displayPrice: string;
  originalPrice?: string;
  futureOnsitePrice?: string;
}

export interface TicketFeature {
  key: string;
  availability: readonly [boolean, boolean, boolean, boolean];
}

// Ticket tier configurations containing layout colors, graphic assets, pricing, and purchase forms
export const rawTiers: RawTicketTier[] = [
  {
    id: "budget",
    color: "var(--color-tier-budget)",
    subColor: "var(--color-tier-budget-sub)",
    img: "/img/B.avif",
    url: "https://go.twbronycon.org/ticket/budget",
    closeTime: "2026-08-09T23:59:59+08:00",
    presalePrice: 500,
    onsitePrice: 550,
  },
  {
    id: "standard",
    color: "var(--color-tier-standard)",
    subColor: "var(--color-tier-standard-sub)",
    img: "/img/PU.avif",
    url: "https://go.twbronycon.org/ticket/standard",
    closeTime: "2026-08-09T23:59:59+08:00",
    presalePrice: 600,
    onsitePrice: 650,
  },
  {
    id: "sponsor",
    color: "var(--color-tier-sponsor)",
    subColor: "var(--color-tier-sponsor-sub)",
    img: "/img/PI.avif",
    url: "https://go.twbronycon.org/ticket/sponsor",
    closeTime: "2026-08-09T23:59:59+08:00",
    presalePrice: 1000,
    onsitePrice: 1050,
  },
  {
    id: "royale",
    color: "var(--color-tier-royale)",
    subColor: "var(--color-tier-royale-sub)",
    img: "/img/Y.avif",
    url: "https://go.twbronycon.org/ticket/royale",
    closeTime: "2026-06-30T23:59:59+08:00",
    presalePrice: 5000,
    isRoyale: true,
  },
];

// Matrix mapping features to their availability across [budget, standard, sponsor, royale] tiers
export const featuresList: TicketFeature[] = [
  { key: "badge", availability: [true, true, true, true] },
  { key: "pin", availability: [false, true, true, true] },
  { key: "postcard", availability: [false, true, true, true] },
  { key: "folder", availability: [false, false, true, true] },
  { key: "bag", availability: [false, false, true, true] },
  { key: "keychain", availability: [false, false, true, true] },
  { key: "standee", availability: [false, false, true, true] },
  { key: "thanks", availability: [false, false, true, true] },
  { key: "intro_thx", availability: [false, false, true, true] },
  { key: "intro_detail", availability: [false, false, false, true] },
  { key: "discord", availability: [false, false, true, true] },
  { key: "mug", availability: [false, false, false, true] },
  { key: "coaster", availability: [false, false, false, true] },
  { key: "tshirt", availability: [false, false, false, true] },
  { key: "speech", availability: [false, false, false, true] },
];
