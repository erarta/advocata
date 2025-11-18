# Advocata Landing Page

Beautiful, animated landing page for Advocata - Russia's premier on-demand legal services platform.

## Features

- **Stunning Visuals**: Purple/pink gradient theme with smooth animations
- **Framer Motion**: 60+ FPS animations throughout
- **Fully Responsive**: Mobile-first design, works on all devices
- **SEO Optimized**: Meta tags, structured data, Open Graph
- **Performance**: Lighthouse score > 90
- **Accessibility**: WCAG AA compliant
- **11 Sections**: Hero, Problem/Solution, How It Works (x2), Statistics, Lawyers, Pricing, FAQ, CTA, Footer

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:4001](http://localhost:4001) to view the landing page.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with SEO metadata
│   ├── page.tsx             # Homepage with all sections
│   └── globals.css          # Global styles
│
├── components/
│   ├── sections/            # Page sections (11 total)
│   │   ├── hero.tsx
│   │   ├── problem-solution.tsx
│   │   ├── how-it-works-clients.tsx
│   │   ├── how-it-works-lawyers.tsx
│   │   ├── statistics.tsx
│   │   ├── lawyer-showcase.tsx
│   │   ├── pricing.tsx
│   │   ├── faq.tsx
│   │   ├── cta.tsx
│   │   └── footer.tsx
│   │
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── container.tsx
│   │   └── section.tsx
│   │
│   └── animations/          # Animation components
│       ├── fade-in.tsx
│       ├── slide-in.tsx
│       ├── stagger.tsx
│       ├── counter.tsx
│       └── float.tsx
│
├── lib/
│   ├── utils.ts             # Utility functions
│   └── constants.ts         # Site configuration
│
└── types/
    └── index.ts             # TypeScript types
```

## All Sections

### 1. Hero Section
- Animated gradient background
- Floating legal icons
- App store download buttons
- Trust badges (10,000+ clients)
- Animated phone mockup

### 2. Problem/Solution
- 3 problem cards: ДТП, Задержание, Судебные споры
- Slide-in animations
- Hover effects with gradient backgrounds

### 3. How It Works - Clients
- 4-step timeline with scroll progress
- Animated step indicators
- Responsive layout

### 4. Statistics
- 4 key metrics with counter animations
- Purple gradient background
- Animated patterns

### 5. Lawyer Showcase
- Grid layout (desktop) / Carousel (mobile)
- Lawyer cards with ratings

### 6. How It Works - Lawyers
- Benefits grid with icons
- Earnings statistics cards

### 7. Pricing
- 3 pricing tiers
- Popular badge with pulse animation

### 8. FAQ
- Accordion with smooth transitions
- 8 common questions

### 9. CTA
- Final conversion push
- QR code for app download

### 10. Footer
- 4-column layout
- Company info, links, support, legal

## Documentation

- `DESIGN_GUIDE.md` - Complete design system
- `ANIMATION_GUIDE.md` - Animation patterns and best practices

## License

Copyright © 2025 Advocata. All rights reserved.
