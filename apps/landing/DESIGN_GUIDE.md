# Advocata Landing Page - Design Guide

Complete design system documentation for the Advocata landing page.

## Design Principles

1. **Visual Hierarchy**: Clear distinction between primary, secondary, and tertiary elements
2. **Consistency**: Reusable components with consistent spacing and styling
3. **Accessibility**: WCAG AA compliant with proper contrast ratios
4. **Performance**: Optimized for 60 FPS animations
5. **Responsiveness**: Mobile-first approach

## Color Palette

### Primary Colors

#### Purple (Brand Primary)
```css
purple-50:  #faf5ff  /* Lightest background */
purple-100: #f3e8ff  /* Light background */
purple-200: #e9d5ff  /* Border/divider */
purple-300: #d8b4fe  /* Muted text */
purple-400: #c084fc  /* Icons */
purple-500: #a855f7  /* Default */
purple-600: #9333ea  /* Hover states */
purple-700: #7e22ce  /* Active states */
purple-800: #6b21a8  /* Deep purple */
purple-900: #581c87  /* Darkest */
```

#### Pink (Brand Secondary)
```css
pink-50:  #fdf2f8  /* Lightest background */
pink-100: #fce7f3  /* Light background */
pink-200: #fbcfe8  /* Border/divider */
pink-300: #f9a8d4  /* Muted text */
pink-400: #f472b6  /* Icons */
pink-500: #ec4899  /* Default */
pink-600: #db2777  /* Hover states */
pink-700: #be185d  /* Active states */
pink-800: #9d174d  /* Deep pink */
pink-900: #831843  /* Darkest */
```

### Gradient Combinations

```css
/* Hero Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Card Gradient */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Purple to Pink */
background: linear-gradient(to right, #9333ea, #ec4899);

/* Soft Gradient Backgrounds */
background: linear-gradient(to bottom right, #faf5ff, #fdf2f8);
```

### Neutral Colors

```css
gray-50:  #f9fafb  /* Page background */
gray-100: #f3f4f6  /* Section backgrounds */
gray-200: #e5e7eb  /* Borders */
gray-300: #d1d5db  /* Dividers */
gray-400: #9ca3af  /* Placeholder text */
gray-500: #6b7280  /* Secondary text */
gray-600: #4b5563  /* Primary text (light bg) */
gray-700: #374151  /* Headings */
gray-800: #1f2937  /* Dark headings */
gray-900: #111827  /* Darkest text */
```

### Semantic Colors

```css
/* Success */
success: #10b981  /* Green for positive actions */

/* Warning */
warning: #f59e0b  /* Amber for cautions */

/* Error */
error: #ef4444    /* Red for errors */

/* Info */
info: #3b82f6     /* Blue for information */
```

## Typography

### Font Family

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Type Scale

```css
/* Display - Hero headings */
text-6xl: 3.75rem / 60px   (mobile: 3rem / 48px)
text-5xl: 3rem / 48px      (mobile: 2.5rem / 40px)

/* Headings */
text-4xl: 2.25rem / 36px   (mobile: 1.875rem / 30px)
text-3xl: 1.875rem / 30px  (mobile: 1.5rem / 24px)
text-2xl: 1.5rem / 24px
text-xl:  1.25rem / 20px

/* Body */
text-lg:  1.125rem / 18px  (mobile: 1rem / 16px)
text-base: 1rem / 16px
text-sm:   0.875rem / 14px
text-xs:   0.75rem / 12px
```

### Font Weights

```css
font-light:     300  /* Rarely used */
font-normal:    400  /* Body text */
font-medium:    500  /* Subheadings, emphasis */
font-semibold:  600  /* Card titles */
font-bold:      700  /* Section headings */
font-extrabold: 800  /* Hero headings */
```

### Line Heights

```css
leading-tight:   1.25  /* Headings */
leading-snug:    1.375 /* Subheadings */
leading-normal:  1.5   /* Body text */
leading-relaxed: 1.625 /* Long-form content */
leading-loose:   2     /* Spacious layouts */
```

### Letter Spacing

```css
tracking-tighter: -0.05em  /* Large headings */
tracking-tight:   -0.025em /* Medium headings */
tracking-normal:   0       /* Body text */
tracking-wide:     0.025em /* Buttons, labels */
```

## Spacing System

8px grid system:

```css
spacing-0:   0px
spacing-1:   0.25rem  (4px)
spacing-2:   0.5rem   (8px)
spacing-3:   0.75rem  (12px)
spacing-4:   1rem     (16px)
spacing-5:   1.25rem  (20px)
spacing-6:   1.5rem   (24px)
spacing-8:   2rem     (32px)
spacing-10:  2.5rem   (40px)
spacing-12:  3rem     (48px)
spacing-16:  4rem     (64px)
spacing-20:  5rem     (80px)
spacing-24:  6rem     (96px)
```

### Component Spacing

```css
/* Cards */
padding: 1.5rem (24px) - 2rem (32px)

/* Sections */
padding-y: 4rem (64px) - 6rem (96px)
desktop: 5rem (80px) - 7.5rem (120px)

/* Buttons */
padding-x: 1.5rem (24px)
padding-y: 0.75rem (12px)

/* Grid gaps */
gap: 1.5rem (24px) - 2rem (32px)
```

## Border Radius

```css
rounded-none:  0
rounded-sm:    0.125rem  (2px)
rounded:       0.25rem   (4px)
rounded-md:    0.375rem  (6px)
rounded-lg:    0.5rem    (8px)
rounded-xl:    0.75rem   (12px)
rounded-2xl:   1rem      (16px)
rounded-3xl:   1.5rem    (24px)
rounded-full:  9999px
```

### Component Radius

```css
/* Buttons */
border-radius: 0.75rem (12px)

/* Cards */
border-radius: 1rem (16px)

/* Modals */
border-radius: 1.5rem (24px)

/* Avatars */
border-radius: 9999px (full)
```

## Shadows

```css
/* Elevation levels */
shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05)
shadow:     0 1px 3px rgba(0, 0, 0, 0.1)
shadow-md:  0 4px 6px rgba(0, 0, 0, 0.1)
shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.1)
shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25)

/* Glow effects */
shadow-glow-purple: 0 0 20px rgba(102, 126, 234, 0.5)
shadow-glow-pink:   0 0 20px rgba(236, 72, 153, 0.5)
```

## Breakpoints

```css
/* Mobile first approach */
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

### Usage Examples

```tsx
<div className="
  grid
  grid-cols-1     /* Mobile: 1 column */
  md:grid-cols-2  /* Tablet: 2 columns */
  lg:grid-cols-3  /* Desktop: 3 columns */
  gap-6
">
```

## Components

### Button Variants

**Primary** (Default CTA)
```tsx
<Button variant="primary">
  // Purple to pink gradient
  // White text
  // Hover: scale + glow shadow
</Button>
```

**Secondary** (Alternative CTA)
```tsx
<Button variant="secondary">
  // Pink gradient
  // White text
  // Hover: scale + glow shadow
</Button>
```

**Outline** (Low emphasis)
```tsx
<Button variant="outline">
  // Transparent background
  // Purple border
  // Purple text
  // Hover: light purple background
</Button>
```

**Ghost** (Minimal)
```tsx
<Button variant="ghost">
  // Transparent background
  // Gray text
  // Hover: light gray background
</Button>
```

### Card Variants

**Default**
```tsx
<Card variant="default">
  // White background
  // Medium shadow
  // Rounded corners
</Card>
```

**Gradient**
```tsx
<Card variant="gradient">
  // Gradient background (purple to pink)
  // Large shadow
  // Enhanced visual impact
</Card>
```

**Bordered**
```tsx
<Card variant="bordered">
  // White background
  // Colored border
  // Minimal shadow
</Card>
```

## Animation Patterns

### Fade In
```tsx
<FadeIn direction="up" delay={0.2}>
  {children}
</FadeIn>
```

### Slide In
```tsx
<SlideIn direction="left" delay={0.3}>
  {children}
</SlideIn>
```

### Stagger Children
```tsx
<Stagger staggerDelay={0.1}>
  {items.map(item => <div>{item}</div>)}
</Stagger>
```

### Counter Animation
```tsx
<Counter value={10000} suffix="+" duration={2} />
```

### Float Animation
```tsx
<Float delay={0.5} yOffset={20}>
  <Icon />
</Float>
```

## Responsive Design

### Mobile (< 768px)
- Single column layouts
- Larger tap targets (min 44x44px)
- Simplified navigation
- Stack elements vertically

### Tablet (768px - 1024px)
- 2-column grids
- Expanded navigation
- Larger typography

### Desktop (> 1024px)
- Multi-column layouts
- Maximum content width: 1280px
- Enhanced animations
- Hover states

## Accessibility Guidelines

### Color Contrast
- Text on light backgrounds: ratio ≥ 4.5:1
- Large text: ratio ≥ 3:1
- Interactive elements: ratio ≥ 4.5:1

### Focus States
```css
focus:outline-none
focus-visible:ring-2
focus-visible:ring-purple-500
focus-visible:ring-offset-2
```

### ARIA Labels
```tsx
<button aria-label="Close menu">
  <X />
</button>
```

### Keyboard Navigation
- Tab order follows visual order
- Skip to content link
- Escape key closes modals
- Enter/Space activates buttons

## Performance Guidelines

### Images
- Use `next/image` for optimization
- Provide width/height
- Use WebP format
- Lazy load below-fold images

### Animations
- Target 60 FPS
- Use `transform` and `opacity` (GPU accelerated)
- Implement `prefers-reduced-motion`
- Avoid animating `width`, `height`, `top`, `left`

### Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting (automatic in Next.js)
- Lazy load non-critical components

## Design Tokens

```ts
// Example usage in code
const theme = {
  colors: {
    brand: {
      primary: '#9333ea',
      secondary: '#ec4899',
    },
  },
  spacing: {
    section: '5rem',
    card: '1.5rem',
  },
  borderRadius: {
    card: '1rem',
    button: '0.75rem',
  },
};
```

---

**Version**: 1.0
**Last Updated**: November 2025
