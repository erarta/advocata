# Advocata Landing Page - Animation Guide

Comprehensive guide to animations used in the Advocata landing page.

## Animation Philosophy

1. **Purpose-Driven**: Every animation serves a purpose (guide attention, provide feedback, enhance UX)
2. **Performant**: Target 60 FPS, use GPU-accelerated properties
3. **Accessible**: Respect `prefers-reduced-motion` setting
4. **Subtle**: Animations should enhance, not distract
5. **Consistent**: Reuse animation patterns across components

## Animation Library

We use **Framer Motion** for all animations:
- Declarative API
- Physics-based animations
- Gesture support
- Viewport detection
- Reduced motion support (built-in)

## Core Animation Components

### 1. FadeIn

**Purpose**: Gradually reveal content as user scrolls

```tsx
<FadeIn direction="up" delay={0.2} duration={0.5}>
  <h1>Content</h1>
</FadeIn>
```

**Parameters**:
- `direction`: `'up' | 'down' | 'left' | 'right'` (optional)
- `delay`: number (seconds)
- `duration`: number (seconds)

**Use Cases**:
- Section titles
- Text blocks
- Images
- Cards

**Implementation**:
```tsx
// Opacity: 0 → 1
// Transform: translateY(20px) → translateY(0)
// Triggered on scroll into viewport
```

### 2. SlideIn

**Purpose**: Slide content from left or right

```tsx
<SlideIn direction="left" delay={0.3} duration={0.6}>
  <Card />
</SlideIn>
```

**Parameters**:
- `direction`: `'left' | 'right'`
- `delay`: number (seconds)
- `duration`: number (seconds)

**Use Cases**:
- Alternating content blocks
- Feature cards
- Testimonials
- Image reveals

**Implementation**:
```tsx
// Opacity: 0 → 1
// Transform: translateX(±50px) → translateX(0)
// Triggered on scroll into viewport
```

### 3. Stagger

**Purpose**: Animate children with sequential delays

```tsx
<Stagger staggerDelay={0.1} initialDelay={0}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stagger>
```

**Parameters**:
- `staggerDelay`: number (seconds between children)
- `initialDelay`: number (seconds before first child)

**Use Cases**:
- Lists
- Grid items
- Navigation links
- Feature lists

**Implementation**:
```tsx
// Each child fades in with increasing delay
// Creates waterfall effect
```

### 4. Counter

**Purpose**: Animate numbers counting up

```tsx
<Counter value={10000} suffix="+" duration={2} />
```

**Parameters**:
- `value`: target number
- `suffix`: string to append (optional)
- `duration`: animation duration (seconds)

**Use Cases**:
- Statistics
- Metrics
- Achievement numbers

**Implementation**:
```tsx
// Spring physics animation
// Counts from 0 to target value
// Triggers on scroll into viewport
```

### 5. Float

**Purpose**: Subtle floating animation

```tsx
<Float delay={0.5} duration={3} yOffset={20}>
  <Icon />
</Float>
```

**Parameters**:
- `delay`: initial delay (seconds)
- `duration`: cycle duration (seconds)
- `yOffset`: vertical movement (pixels)

**Use Cases**:
- Icons
- Decorative elements
- Background shapes
- Illustrations

**Implementation**:
```tsx
// Infinite loop
// translateY: -yOffset → +yOffset → -yOffset
```

## Section-Specific Animations

### Hero Section

**Background Gradient**
```tsx
<motion.div
  animate={{
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  }}
  transition={{
    duration: 10,
    repeat: Infinity,
    ease: 'linear',
  }}
/>
```

**Floating Icons**
```tsx
<Float delay={index * 0.5} duration={3 + index} yOffset={20}>
  <Icon />
</Float>
```

**Phone Mockup**
```tsx
<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

**Scroll Indicator**
```tsx
<motion.div
  animate={{ y: [0, 10, 0] }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

### Problem/Solution Section

**Card Hover Effect**
```tsx
<Card hoverable>
  {/* Scale: 1 → 1.05 on hover */}
  {/* Shadow: md → xl on hover */}
</Card>
```

**Icon Hover**
```tsx
<motion.div
  whileHover={{ scale: 1.1, rotate: 5 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  <Icon />
</motion.div>
```

### How It Works - Clients

**Timeline Progress**
```tsx
const progress = useTransform(scrollYProgress, [0, 1], [0, 100]);

<motion.div
  style={{ height: `${progress}%` }}
  className="bg-gradient-to-b from-purple-600 to-pink-600"
/>
```

**Step Numbers**
```tsx
<motion.div
  whileHover={{ scale: 1.2, rotate: 360 }}
  transition={{ type: 'spring', stiffness: 200 }}
>
  {stepNumber}
</motion.div>
```

### How It Works - Lawyers

**Benefit Cards Hover**
```tsx
<motion.div
  whileHover={{ x: 10 }}
  className="flex items-start gap-4"
>
  {/* Content */}
</motion.div>
```

**Stats Card Glow**
```tsx
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    opacity: [0.2, 0.3, 0.2],
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

### Statistics Section

**Background Pattern Animation**
```tsx
<motion.div
  animate={{
    backgroundPosition: ['0px 0px', '60px 60px'],
  }}
  transition={{
    duration: 20,
    repeat: Infinity,
    ease: 'linear',
  }}
/>
```

**Stat Card Hover**
```tsx
<motion.div
  whileHover={{ scale: 1.05, y: -5 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  <Counter value={stat.value} />
</motion.div>
```

### Lawyer Showcase

**Mobile Carousel**
```tsx
<motion.div
  animate={{ x: `${-activeIndex * 100}%` }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  {/* Lawyer cards */}
</motion.div>
```

**Avatar Hover**
```tsx
<motion.div whileHover={{ scale: 1.05 }}>
  <Avatar />
</motion.div>
```

### Pricing Section

**Card Hover (3D Tilt)**
```tsx
<motion.div
  whileHover={{ y: -10 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  <Card />
</motion.div>
```

**Popular Badge Pulse**
```tsx
<motion.div
  animate={{ scale: [1, 1.05, 1] }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
  <Badge>Популярный</Badge>
</motion.div>
```

### FAQ Section

**Accordion Expand/Collapse**
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {answer}
    </motion.div>
  )}
</AnimatePresence>
```

**Chevron Rotation**
```tsx
<motion.div
  animate={{ rotate: isOpen ? 180 : 0 }}
  transition={{ duration: 0.3 }}
>
  <ChevronDown />
</motion.div>
```

### CTA Section

**Background Blobs**
```tsx
<motion.div
  animate={{
    x: [0, 100, 0],
    y: [0, 50, 0],
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

**QR Code Card Hover**
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  <QRCode />
</motion.div>
```

## Animation Timing

### Duration Guidelines

```tsx
// Micro interactions
duration: 0.1 - 0.2s  // Button states, hovers

// Standard animations
duration: 0.3 - 0.5s  // Fades, slides, reveals

// Complex animations
duration: 0.6 - 1.0s  // Multi-step, orchestrated

// Ambient animations
duration: 2.0 - 5.0s  // Background, decorative
```

### Delay Guidelines

```tsx
// Stagger delays
staggerDelay: 0.05 - 0.15s  // Quick succession

// Sequence delays
delay: 0.2 - 0.4s  // Clear sequence

// Section delays
delay: 0.3 - 0.6s  // Coordinated entry
```

## Easing Functions

```tsx
// Default easing
ease: 'easeInOut'  // Smooth start and end

// Sharp entrance
ease: 'easeOut'    // Quick start, slow end

// Anticipation
ease: 'easeIn'     // Slow start, quick end

// Bounce
type: 'spring'
stiffness: 300
damping: 20
```

## Performance Best Practices

### GPU-Accelerated Properties

✅ **Animate These** (60 FPS):
```tsx
transform
opacity
filter
```

❌ **Avoid Animating** (Janky):
```tsx
width
height
top
left
margin
padding
```

### Will-Change Optimization

```css
.animated-element {
  will-change: transform, opacity;
}
```

### Reduce Motion

Automatically handled by Framer Motion:

```tsx
// User preference: prefers-reduced-motion
// Framer Motion automatically disables animations
```

Manual implementation:

```tsx
const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={shouldReduceMotion ? {} : { x: 100 }}
/>
```

## Common Animation Patterns

### Hover Scale + Shadow

```tsx
<motion.div
  whileHover={{
    scale: 1.05,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
  }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  {children}
</motion.div>
```

### Fade In On Scroll

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.5 }}
>
  {children}
</motion.div>
```

### Sequential Reveal

```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
  initial="hidden"
  whileInView="visible"
>
  {items.map(item => (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

## Debugging Animations

### Chrome DevTools

1. Open DevTools → Performance
2. Record animation
3. Look for:
   - 60 FPS (green bars)
   - No layout thrashing (purple bars)
   - No long tasks (red bars)

### Framer Motion DevTools

```tsx
import { MotionConfig } from 'framer-motion';

<MotionConfig isValidProp={() => true}>
  {/* Your app */}
</MotionConfig>
```

## Testing Animations

### Manual Testing

- Test on real devices (not just browser)
- Test with slow network (animations should still work)
- Test with reduced motion enabled
- Test on different screen sizes

### Automated Testing

```tsx
// Example with Jest + React Testing Library
test('card animates on hover', async () => {
  const { container } = render(<Card hoverable />);
  const card = container.firstChild;

  fireEvent.mouseEnter(card);

  // Wait for animation
  await waitFor(() => {
    expect(card).toHaveStyle('transform: scale(1.05)');
  });
});
```

---

**Version**: 1.0
**Last Updated**: November 2025

**Performance Target**: 60 FPS
**Accessibility**: WCAG AA Compliant
**Browser Support**: Modern browsers (last 2 versions)
