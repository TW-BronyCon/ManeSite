<p align="center">
  <img src="public/img/text-logo-clear.avif" alt="TWBC Logo" align="center" width="256">
</p>

<h1 align="center">TWBC - Taiwan BronyCon</h1>

<p align="center">
  A modern, high-performance website for Taiwan BronyCon.
</p>

<p align="center">
  <a href="https://nuxt.com"><img
    alt="Made with Nuxt"
    src="https://img.shields.io/badge/made_with-nuxt-00DC82?logo=nuxt.js"
  ></a>
  <img
    alt="Works on my machine"
    src="https://img.shields.io/badge/works_on-my_machine-dark_green"
  >
</p>

## What is this?

This is the official website for **Taiwan BronyCon (TWBC)**, a fan-organized convention for _My Little Pony: Friendship is Magic_ fans in Taiwan.

The site features:

- Event information and countdown
- Ticket information and purchase links
- Multi-language support (Traditional Chinese and English)
- Interactive inline-SVG venue map

## Tech Stack

- **Framework:** [Nuxt 4](https://nuxt.com/)
- **UI:** [Vue 3](https://vuejs.org/) (Composition API)
- **Styling:** Vanilla CSS
- **i18n:** [@nuxtjs/i18n](https://i18n.nuxtjs.org/)
- **Venue map:** Inline SVG with Vue-managed zoom, pan, and selection

## Getting Started

### Prerequisites

- Node.js 24 (see `.node-version`)
- `npm` or `pnpm`

### Installation

```bash
# Install dependencies
npm ci
```

### Development

```bash
# Start development server
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Shared page code

- `HomePage.vue` serves both the index and `/home` routes; SEO remains route-owned.
- `usePageSeo` shares reactive page metadata and the canonical origin in `app/utils/site.ts`; call it last in page setup. Global defaults remain in `app.vue`.
- `app/utils/markdown.ts` shares frontmatter parsing and ordered image attachments. News strips matching metadata quotes; events preserve them. Repository Markdown is trusted content.
- `ContentAttachments` emits image selection; `ImageLightbox` owns overlay rendering and its Escape listener. Pages retain gallery state and choose Escape behavior.
- Ticket components render typed data from `ticketData.ts`; the ticket page retains timing, pricing, modes, and hover state.
- `useVenueViewport` owns gestures and viewport listeners; `VenueInfoSidebar` renders page-owned selection. `venueMapData.ts` supplies shared physical booth geometry.
- `useScheduleModel` derives timetable views; keyboard navigation and modal lifecycle remain in the schedule page.
- `PageLayout.vue` and `app/assets/css/variables.css` remain the page-wrapper and design-token authorities.

### Verification without Discord synchronization

The `dev`, `build`, and `typecheck` npm scripts synchronize crew avatars. To work with the existing generated crew fixture without contacting Discord, use the direct Nuxt commands:

```bash
./node_modules/.bin/nuxt dev --host 127.0.0.1 --port 3000
npm test
npm run i18n:check
./node_modules/.bin/nuxi typecheck
./node_modules/.bin/nuxt build
```

`npm test` uses Node's built-in test runner and Node 24 TypeScript stripping for the shared content utilities.

## Contributors

See [CONTRIBUTING.md](CONTRIBUTING.md) for commit and branch guidelines.

## License

Copyright (C) 2026 TWBC

**Code:** This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

**Assets:** All visual assets (including logos, images, and mascots in `public/img/`) are **not** covered by the GPL license. These assets remain the exclusive property and copyright of the TWBC team. Unauthorized use, redistribution, or modification of these assets is prohibited.

See [LICENSE](LICENSE) for details.
