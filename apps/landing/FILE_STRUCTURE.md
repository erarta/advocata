# Advocata Landing Page - Complete File Structure

## Overview

```
/home/user/advocata/apps/landing/
│
├── 📁 src/                          # Source code
│   ├── 📁 app/                      # Next.js App Router
│   │   ├── layout.tsx              # Root layout + SEO metadata
│   │   ├── page.tsx                # Homepage (assembles all sections)
│   │   └── globals.css             # Global styles
│   │
│   ├── 📁 components/
│   │   ├── 📁 sections/            # Page sections (10 files)
│   │   │   ├── hero.tsx           # ⭐ Hero section
│   │   │   ├── problem-solution.tsx
│   │   │   ├── how-it-works-clients.tsx
│   │   │   ├── statistics.tsx
│   │   │   ├── lawyer-showcase.tsx
│   │   │   ├── how-it-works-lawyers.tsx
│   │   │   ├── pricing.tsx
│   │   │   ├── faq.tsx
│   │   │   ├── cta.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   ├── 📁 ui/                  # Reusable UI components (4 files)
│   │   │   ├── button.tsx         # Button with 4 variants
│   │   │   ├── card.tsx           # Card with 3 variants
│   │   │   ├── container.tsx      # Container wrapper
│   │   │   └── section.tsx        # Section wrapper
│   │   │
│   │   └── 📁 animations/          # Animation components (5 files)
│   │       ├── fade-in.tsx        # Fade in with direction
│   │       ├── slide-in.tsx       # Slide from left/right
│   │       ├── stagger.tsx        # Sequential animations
│   │       ├── counter.tsx        # Animated number counter
│   │       └── float.tsx          # Floating animation
│   │
│   ├── 📁 lib/                      # Utilities & constants
│   │   ├── utils.ts               # cn() utility function
│   │   └── constants.ts           # Site config, lawyers, pricing, FAQ
│   │
│   └── 📁 types/                    # TypeScript types
│       └── index.ts               # Interface definitions
│
├── 📁 public/                       # Static assets (to be added)
│   ├── 📁 images/
│   │   ├── 📁 lawyers/            # Lawyer photos
│   │   └── 📁 icons/              # Icons
│   ├── 📁 fonts/                   # Custom fonts
│   └── qr-code.png                # QR code for app
│
├── 📄 tailwind.config.js           # Enhanced Tailwind config
├── 📄 tsconfig.json                # TypeScript config
├── 📄 next.config.js               # Next.js config
├── 📄 package.json                 # Dependencies
│
└── 📚 Documentation/
    ├── QUICK_START.md             # ⚡ Start here!
    ├── LANDING_README.md          # Complete guide
    ├── DESIGN_GUIDE.md            # Design system
    ├── ANIMATION_GUIDE.md         # Animation patterns
    ├── IMPLEMENTATION_SUMMARY.md  # What was built
    └── FILE_STRUCTURE.md          # This file
```

## File Count

- **Total TypeScript/React Files**: 24
  - App files: 3
  - Section components: 10
  - UI components: 4
  - Animation components: 5
  - Library files: 2
  - Type definitions: 1

- **Configuration Files**: 4
  - tailwind.config.js
  - tsconfig.json
  - next.config.js
  - package.json

- **Documentation Files**: 5
  - QUICK_START.md
  - LANDING_README.md
  - DESIGN_GUIDE.md
  - ANIMATION_GUIDE.md
  - IMPLEMENTATION_SUMMARY.md

- **Total Lines of Code**: ~2,000+ lines

## Component Hierarchy

```
App Layout (layout.tsx)
└── Page (page.tsx)
    ├── Hero
    ├── ProblemSolution
    ├── HowItWorksClients
    ├── Statistics
    ├── LawyerShowcase
    ├── HowItWorksLawyers
    ├── Pricing
    ├── FAQ
    ├── CTA
    └── Footer
```

## Animation Components Usage

```
FadeIn
├── Used in: All sections for entry animations
├── Variants: up, down, left, right
└── Props: direction, delay, duration

SlideIn
├── Used in: ProblemSolution, HowItWorksLawyers
├── Variants: left, right
└── Props: direction, delay, duration

Stagger
├── Used in: HowItWorksLawyers
├── Purpose: Sequential child animations
└── Props: staggerDelay, initialDelay

Counter
├── Used in: Statistics
├── Purpose: Animated number counting
└── Props: value, suffix, duration

Float
├── Used in: Hero (floating icons)
├── Purpose: Infinite floating animation
└── Props: delay, duration, yOffset
```

## UI Components Usage

```
Button
├── Variants: primary, secondary, outline, ghost
├── Sizes: sm, md, lg
└── Used in: Hero, HowItWorksLawyers, Pricing, CTA

Card
├── Variants: default, gradient, bordered
├── Props: hoverable
└── Used in: All sections with content cards

Container
├── Sizes: sm, md, lg, full
└── Used in: Section wrapper

Section
├── Props: containerSize, noPadding
└── Used in: All page sections
```

## Data Files

```
/src/lib/constants.ts
├── SITE_CONFIG
│   ├── name, title, description
│   ├── keywords, url, ogImage
│   ├── links (email, phone, social, app stores)
│   └── company (name, address, INN, OGRN)
│
├── LAWYERS (4 profiles)
│   └── id, name, photo, specialization, experience, rating, bio
│
├── PRICING_PLANS (3 tiers)
│   └── id, name, price, period, description, features, cta, popular
│
├── FAQ_ITEMS (8 questions)
│   └── question, answer
│
└── STATISTICS (4 metrics)
    └── value, suffix, label
```

## Design Tokens

```
Colors
├── Purple: 50-900 (primary brand)
├── Pink: 50-900 (secondary brand)
└── Gray: 50-900 (neutrals)

Gradients
├── hero-gradient: #667eea → #764ba2
├── card-gradient: #f093fb → #f5576c
├── purple-gradient: #667eea → #764ba2
└── pink-gradient: #FF9A8B → #FF6B9D

Spacing
└── 8px grid system (0-24)

Typography
├── Font: Inter (Google Fonts)
├── Scale: xs → 6xl
└── Weights: 300-800

Animations
├── Duration: 0.1s - 5s
├── Easing: easeInOut, easeOut, spring
└── Delays: 0s - 1s (stagger: 0.05s - 0.15s)
```

## Key Features

### SEO & Metadata
- ✅ Meta tags (title, description, keywords)
- ✅ Open Graph (social sharing)
- ✅ Twitter Cards
- ✅ Structured Data (Organization, WebSite, Service)
- ✅ Canonical URLs

### Performance
- ✅ GPU-accelerated animations (transform, opacity)
- ✅ Viewport detection (lazy animation triggers)
- ✅ Code splitting (component-based)
- ✅ 60 FPS target

### Accessibility
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ WCAG AA color contrast
- ✅ prefers-reduced-motion

### Responsive Design
- ✅ Mobile-first
- ✅ Breakpoints: sm (640), md (768), lg (1024), xl (1280)
- ✅ Touch-friendly (44x44px targets)
- ✅ Responsive typography

## Dependencies

```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.18.0",
    "lucide-react": "^0.309.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0"
  }
}
```

## How to Navigate This Codebase

1. **Start with**: `QUICK_START.md` for setup
2. **Understand structure**: `src/app/page.tsx` (main page assembly)
3. **Explore sections**: `src/components/sections/` (10 section files)
4. **Learn design**: `DESIGN_GUIDE.md`
5. **Understand animations**: `ANIMATION_GUIDE.md`
6. **Customize**: `src/lib/constants.ts`

## Development Workflow

```bash
# 1. Install
npm install

# 2. Develop
npm run dev

# 3. Type check
npm run type-check

# 4. Lint
npm run lint

# 5. Build
npm run build

# 6. Start production
npm start
```

---

**Everything you need is here!** 🎯
