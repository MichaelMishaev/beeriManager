# AI Studio 555 - Complete Design System Extraction

**Extracted from**: https://www.aistudio555.com/en/
**Date**: October 9, 2025
**Purpose**: Design reference for modern, professional Hebrew school landing page
**Methodology**: Multi-tool extraction with CSS forensics and visual analysis

---

## 1. Color Palette - Exact Values

### Primary Colors

```css
/* Dark Navy/Purple Foundation */
--primary-darkest: #05051a;        /* Main background, deepest navy */
--primary-darker: #050f2c;         /* Section backgrounds */
--primary-dark: #04193f;           /* Card backgrounds */
--primary-base: #1a1d3a;           /* Navigation, dropdowns */

/* Accent Colors */
--accent-gold: #ffd659;            /* Primary CTA, highlights */
--accent-gold-bright: #FFD700;     /* Active states, hover enhancements */
--accent-gold-deep: #fdc500;       /* Secondary gold accents */

/* Bright Accents */
--accent-blue: #0080ff;            /* Gradient highlights, links */

/* Neutrals */
--white: #ffffff;
--white-transparent: rgba(255, 255, 255, 0.1);   /* Hover overlays */
--white-transparent-30: rgba(255, 255, 255, 0.3); /* Border overlays */
--white-transparent-70: rgba(255, 255, 255, 0.7); /* Glass effects */

/* Shadows */
--shadow-base: rgba(0, 0, 0, 0.4);  /* 0 5px 25px */
```

### Color Applications

| Element | Color | Hex Code |
|---------|-------|----------|
| Page Background | Primary Darkest | #05051a |
| Navigation Bar | Primary Base | #1a1d3a |
| Dropdown Background | Primary Base | #1a1d3a |
| Primary Button | Accent Gold | #ffd659 |
| Primary Button Text | Primary Base | #1a1d3a |
| Body Text | White | #ffffff |
| Link Hover | Accent Gold Bright | #FFD700 |
| Active Language Pill | Accent Gold Bright | #FFD700 |
| Border (Subtle) | White 30% | rgba(255, 255, 255, 0.3) |

### Gradient System

```css
/* Background Gradients */
.hero-gradient {
  background: linear-gradient(180deg, #05051a 0%, #0080ff 100%);
}

.overlay-gradient {
  background: linear-gradient(180deg, rgba(5, 5, 26, 0) 0%, #05051a 100%);
}

/* Accent Line Gradients */
.accent-line-horizontal {
  background: linear-gradient(90deg, #0080ff 0%, rgba(0, 128, 255, 0) 100%);
}

/* Button Gradients */
.button-primary {
  background: #ffd659;
  /* Solid color, no gradient */
}

.button-secondary {
  background: transparent;
  border: 2px solid #ffd659;
}
```

---

## 2. Typography System

### Font Families

```css
/* Primary Font Stack */
font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Alternative Stack (for specific sections) */
font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Weights Available */
--font-weight-extralight: 200;
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

### Type Scale

```css
/* Headings */
--text-6xl: 68px;         /* Hero titles */
--text-5xl: 46px;         /* Main section headers */
--text-4xl: 32px;         /* Sub-section headers */
--text-3xl: 24px;         /* Card titles */
--text-2xl: 20px;         /* Large labels */
--text-xl: 18px;          /* Subheadings */

/* Body & UI */
--text-base: 16px;        /* Body text */
--text-sm: 15px;          /* Small text */

/* Line Heights */
--leading-tight: 1.1;     /* Headings */
--leading-snug: 1.3;      /* Subheadings */
--leading-normal: 1.5;    /* Body text */
--leading-relaxed: 1.75;  /* Paragraph text */
```

### Typography Hierarchy - Exact Styles

```css
/* Hero Title */
.hero-title {
  font-family: 'Manrope', sans-serif;
  font-size: 68px;
  font-weight: 800;
  line-height: 1.1;
  color: #ffffff;
  letter-spacing: -0.02em;
}

/* Section Heading */
.section-heading {
  font-family: 'Manrope', sans-serif;
  font-size: 46px;
  font-weight: 700;
  line-height: 1.2;
  color: #ffffff;
  margin-bottom: 24px;
}

/* Subsection Heading */
.subsection-heading {
  font-family: 'Manrope', sans-serif;
  font-size: 32px;
  font-weight: 600;
  line-height: 1.3;
  color: #ffffff;
}

/* Card Title */
.card-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  color: #ffffff;
}

/* Body Text */
.body-text {
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
}

/* Navigation Link */
.nav-link {
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #ffffff;
  letter-spacing: 0.02em;
}

/* Button Text */
.button-text {
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.01em;
}

/* Small Label */
.small-label {
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## 3. Spacing & Layout System

### Spacing Scale

```css
/* Base Unit: 5px */
--space-1: 5px;
--space-2: 10px;    /* 2 units */
--space-3: 15px;    /* 3 units */
--space-4: 20px;    /* 4 units */
--space-5: 24px;    /* 4.8 units */
--space-6: 30px;    /* 6 units */
--space-8: 40px;    /* 8 units */
--space-10: 50px;   /* 10 units */
--space-12: 60px;   /* 12 units */
--space-16: 80px;   /* 16 units */
--space-20: 100px;  /* 20 units */
--space-24: 120px;  /* 24 units */
```

### Grid System

```css
/* Container Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1440px;

/* Grid Gaps */
--gap-xs: 10px;
--gap-sm: 16px;
--gap-md: 24px;
--gap-lg: 32px;
--gap-xl: 48px;
--gap-2xl: 65px;
```

### Layout Patterns

```css
/* Main Content Container */
.main-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (min-width: 768px) {
  .main-container {
    padding: 0 40px;
  }
}

@media (min-width: 1024px) {
  .main-container {
    padding: 0 60px;
  }
}

/* Section Spacing */
.section {
  padding-top: 80px;
  padding-bottom: 80px;
}

@media (min-width: 768px) {
  .section {
    padding-top: 120px;
    padding-bottom: 120px;
  }
}

/* Card Grid */
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
  }
}
```

---

## 4. Component Patterns

### Navigation Bar

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #1a1d3a;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.nav-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #ffd659;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 0;
  height: 2px;
  background: #ffd659;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}
```

### Dropdown Menu

```css
.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.dropdown-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  background: #1a1d3a;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.dropdown.active .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 10px 16px;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffd659;
  transform: translateX(4px);
}
```

### Language Pills

```css
.lang-pills {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  margin: 0 20px;
}

.lang-pill {
  padding: 6px 12px;
  border-radius: 20px;
  background: transparent;
  color: #ffffff;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.lang-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.lang-pill.active {
  background: #ffd700;
  color: #1a1d3a;
  border-color: #ffd700;
  font-weight: 600;
}
```

### Primary Button

```css
.btn-primary {
  background: #ffd659;
  color: #1a1d3a;
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 20px 30px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(255, 214, 89, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.btn-primary:hover {
  background: #ffcc00;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 214, 89, 0.5);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 214, 89, 0.3);
}
```

### Secondary Button

```css
.btn-secondary {
  background: transparent;
  color: #ffd659;
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 18px 28px;
  border-radius: 8px;
  border: 2px solid #ffd659;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.btn-secondary:hover {
  background: #ffd659;
  color: #1a1d3a;
  border-color: #ffd659;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 214, 89, 0.3);
}
```

### Card Component

```css
.card {
  background: #04193f;
  border-radius: 16px;
  padding: 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #0080ff 0%, rgba(0, 128, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.2);
}

.card:hover::before {
  opacity: 1;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: rgba(0, 128, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #0080ff;
  font-size: 24px;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
  line-height: 1.3;
}

.card-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}
```

---

## 5. Visual Effects

### Shadows

```css
/* Shadow Scale */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
--shadow-base: 0 5px 25px rgba(0, 0, 0, 0.4);
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.4);
--shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.5);

/* Colored Shadows */
--shadow-gold: 0 4px 12px rgba(255, 214, 89, 0.3);
--shadow-gold-hover: 0 8px 20px rgba(255, 214, 89, 0.5);
--shadow-blue: 0 4px 12px rgba(0, 128, 255, 0.3);
```

### Border Radius

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 9999px;  /* Pills, circles */
```

### Backdrop Filters

```css
/* Glass Morphism Effects */
.glass-light {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
}

.glass-medium {
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.05);
}

.glass-dark {
  backdrop-filter: blur(20px);
  background: rgba(5, 5, 26, 0.8);
}
```

### Border Styles

```css
/* Subtle Borders */
.border-subtle {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.border-subtle-hover {
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Accent Borders */
.border-gold {
  border: 1px solid rgba(255, 214, 89, 0.3);
}

.border-gold-solid {
  border: 2px solid #ffd659;
}

/* Dashed Accent Lines */
.border-dashed {
  border: 2px dashed rgba(255, 255, 255, 0.2);
}
```

---

## 6. Interaction Design & Animations

### Timing Functions

```css
/* Easing Curves */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Duration Scale */
--duration-fast: 0.2s;
--duration-base: 0.3s;
--duration-medium: 0.4s;
--duration-slow: 0.5s;
--duration-slower: 0.6s;
```

### Hover States

```css
/* Link Hover */
.link-hover-underline {
  position: relative;
  transition: color 0.3s ease;
}

.link-hover-underline::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}

.link-hover-underline:hover::after {
  width: 100%;
}

/* Card Hover Animation */
.card-hover {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

/* Button Hover - Lift Effect */
.button-lift {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 214, 89, 0.5);
}

.button-lift:active {
  transform: translateY(0);
}
```

### Transitions

```css
/* Universal Smooth Transition */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Specific Transitions */
.transition-all {
  transition: all 0.3s ease;
}

.transition-colors {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.transition-transform {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-opacity {
  transition: opacity 0.3s ease;
}

.transition-shadow {
  transition: box-shadow 0.3s ease;
}
```

### Loading Animations

```css
/* Spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 0.8s linear infinite;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffd659;
  border-radius: 50%;
  width: 24px;
  height: 24px;
}

/* Pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease;
}
```

### Scroll Effects

```css
/* Parallax Scroll */
.parallax-slow {
  transition: transform 0.1s ease-out;
  will-change: transform;
}

/* Fade in on Scroll */
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 7. Responsive Breakpoints

### Breakpoint System

```css
/* Mobile First Approach */
/* Default: 0px - 479px (Mobile) */

/* Small: 480px+ (Large Mobile) */
@media (min-width: 480px) {
  .container {
    padding: 0 24px;
  }
}

/* Medium: 768px+ (Tablet) */
@media (min-width: 768px) {
  .container {
    padding: 0 40px;
  }

  .hero-title {
    font-size: 56px;
  }

  .section {
    padding: 100px 0;
  }
}

/* Large: 992px+ (Desktop) */
@media (min-width: 992px) {
  .container {
    max-width: 1200px;
    padding: 0 60px;
  }

  .hero-title {
    font-size: 68px;
  }

  .section {
    padding: 120px 0;
  }

  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* XLarge: 1280px+ (Large Desktop) */
@media (min-width: 1280px) {
  .container {
    max-width: 1440px;
  }
}
```

### Mobile Optimizations

```css
/* Mobile Navigation */
@media (max-width: 767px) {
  .nav-menu {
    display: none;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: #1a1d3a;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .nav-menu.active {
    display: flex;
  }

  .mobile-menu-toggle {
    display: block;
  }

  /* Mobile Buttons - Full Width */
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  /* Mobile Typography */
  .hero-title {
    font-size: 36px;
  }

  .section-heading {
    font-size: 32px;
  }

  /* Mobile Spacing */
  .section {
    padding: 60px 0;
  }

  .card {
    padding: 24px;
  }
}
```

---

## 8. Design Principles & Patterns

### Visual Hierarchy

1. **Dark Background Foundation**
   - Uses very dark navy (#05051a) to create premium, modern feel
   - Allows white text and gold accents to pop dramatically
   - Creates high contrast for excellent readability

2. **Gold Accent Strategy**
   - Sparingly used for primary CTAs only
   - Creates strong focal points that guide user attention
   - High contrast against dark background (WCAG AAA)

3. **Whitespace Usage**
   - Generous padding around sections (80-120px vertical)
   - Ample spacing between cards (24-40px gaps)
   - Creates breathing room and sophistication

4. **Layering & Depth**
   - Multiple shadow levels create depth
   - Hover states lift elements 2-8px
   - Subtle borders differentiate content layers

### Contrast Ratios (WCAG Compliance)

```css
/* Excellent Contrast Ratios */
White on Dark Navy (#ffffff on #05051a): 19.5:1  /* AAA - Perfect */
Gold on Dark Navy (#ffd659 on #1a1d3a): 12.8:1   /* AAA - Excellent */
Dark Navy on Gold (#1a1d3a on #ffd659): 12.8:1   /* AAA - Excellent */
White 85% on Dark (#ffffffd9 on #05051a): 16.6:1 /* AAA - Excellent */
```

### Component Composition Patterns

1. **Navigation**
   - Fixed at top with subtle shadow
   - Dark background (#1a1d3a) slightly lighter than page background
   - Consistent spacing: 40px between items
   - Dropdown menus aligned to parent with 12px offset

2. **Hero Section**
   - Full viewport height typical
   - Gradient background from dark navy to blue
   - Large, bold typography (68px+)
   - Primary CTA centered or left-aligned
   - Secondary CTA as outline button

3. **Card Layouts**
   - 3-column grid on desktop (992px+)
   - 2-column on tablet (768px+)
   - Single column on mobile (< 768px)
   - Consistent card padding: 32px
   - Hover lift: -8px translateY
   - Icon-title-description structure

4. **Form Elements** (Inferred Pattern)
   - Full-width inputs with rounded corners (8px)
   - Gold focus states
   - White text on dark backgrounds
   - Generous padding: 16px vertical, 20px horizontal

### Micro-interactions

1. **Button Press Feedback**
   - Hover: Lift 2px + shadow increase
   - Active: Return to baseline
   - Timing: 0.4s smooth cubic-bezier

2. **Link Underlines**
   - Animated from left to right
   - 2px height, gold color
   - 0.3s ease timing
   - 4px offset below text

3. **Card Reveals**
   - Lift on hover: -8px translateY
   - Scale up: 1.02x
   - Shadow expands significantly
   - Top accent line fades in

4. **Dropdown Behavior**
   - Fade in: opacity 0 → 1
   - Slide down: -10px → 0px
   - 0.3s ease transition
   - Backdrop blur: 10px

---

## 9. Accessibility Features

### Focus Management

```css
/* Custom Focus Styles */
*:focus-visible {
  outline: 2px solid #ffd659;
  outline-offset: 4px;
  border-radius: 4px;
}

/* Remove default outline but maintain custom */
button:focus:not(:focus-visible) {
  outline: none;
}

/* Enhanced Focus for Interactive Elements */
.btn-primary:focus-visible {
  outline: 3px solid #ffd659;
  outline-offset: 4px;
  box-shadow: 0 0 0 4px rgba(255, 214, 89, 0.2),
              0 8px 20px rgba(255, 214, 89, 0.5);
}

.nav-link:focus-visible {
  outline: 2px solid #ffd659;
  outline-offset: 6px;
  border-radius: 4px;
}
```

### Keyboard Navigation

```css
/* Skip to Content Link */
.skip-to-content {
  position: absolute;
  top: -100px;
  left: 20px;
  background: #ffd659;
  color: #1a1d3a;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 10000;
  transition: top 0.3s ease;
}

.skip-to-content:focus {
  top: 20px;
}
```

### Reduced Motion Support

```css
/* Respect User Preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .card:hover {
    transform: none;
  }

  .btn-primary:hover {
    transform: none;
  }
}
```

---

## 10. Implementation Guide for Hebrew Adaptation

### RTL Modifications Required

```css
/* Base RTL Setup */
html[dir="rtl"] body {
  direction: rtl;
  text-align: right;
}

/* Navigation Adjustments */
html[dir="rtl"] .nav-menu {
  flex-direction: row-reverse;
}

html[dir="rtl"] .nav-link::after {
  left: auto;
  right: 0;
}

/* Dropdown Position */
html[dir="rtl"] .dropdown-menu {
  left: auto;
  right: 0;
}

html[dir="rtl"] .dropdown-item:hover {
  transform: translateX(-4px);
}

/* Language Pills - Reverse Order */
html[dir="rtl"] .lang-pills {
  flex-direction: row-reverse;
}

/* Card Icon Positioning */
html[dir="rtl"] .card-icon {
  margin-left: auto;
  margin-right: 0;
}

/* Button Icon Gaps */
html[dir="rtl"] .btn-primary,
html[dir="rtl"] .btn-secondary {
  flex-direction: row-reverse;
}
```

### Font Substitution

```css
/* Replace English Fonts with Hebrew Equivalents */
/* Original: 'Manrope' */
/* Recommended: 'Heebo' or 'Assistant' */

body {
  font-family: 'Heebo', 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* For Plus Jakarta Sans equivalent */
/* Recommended: 'Rubik' or 'Varela Round' */
.card-title {
  font-family: 'Rubik', 'Heebo', sans-serif;
}
```

### Color Adaptation Recommendations

```css
/* Keep the Core Palette - It Works Universally */
/* No changes needed to color values */

/* However, consider these Hebrew-specific adjustments: */

/* Warmer Gold for Hebrew Audience (optional) */
--accent-gold-hebrew: #ffb700;  /* Slightly warmer than #ffd659 */

/* Slightly Lighter Navy for Better Hebrew Text Rendering */
--primary-base-hebrew: #1f2347;  /* Slightly lighter than #1a1d3a */
```

---

## 11. Complete CSS Variables Reference

```css
:root {
  /* Colors - Foundation */
  --color-bg-darkest: #05051a;
  --color-bg-darker: #050f2c;
  --color-bg-dark: #04193f;
  --color-bg-base: #1a1d3a;

  /* Colors - Accents */
  --color-accent-gold: #ffd659;
  --color-accent-gold-bright: #FFD700;
  --color-accent-gold-deep: #fdc500;
  --color-accent-blue: #0080ff;

  /* Colors - Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.85);
  --color-text-tertiary: rgba(255, 255, 255, 0.7);

  /* Typography */
  --font-primary: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-secondary: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;

  --font-size-6xl: 68px;
  --font-size-5xl: 46px;
  --font-size-4xl: 32px;
  --font-size-3xl: 24px;
  --font-size-2xl: 20px;
  --font-size-xl: 18px;
  --font-size-base: 16px;
  --font-size-sm: 15px;

  --font-weight-extralight: 200;
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  --line-height-tight: 1.1;
  --line-height-snug: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Spacing */
  --space-1: 5px;
  --space-2: 10px;
  --space-3: 15px;
  --space-4: 20px;
  --space-5: 24px;
  --space-6: 30px;
  --space-8: 40px;
  --space-10: 50px;
  --space-12: 60px;
  --space-16: 80px;
  --space-20: 100px;
  --space-24: 120px;

  /* Radius */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-base: 0 5px 25px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 25px 50px rgba(0, 0, 0, 0.5);
  --shadow-gold: 0 4px 12px rgba(255, 214, 89, 0.3);
  --shadow-gold-hover: 0 8px 20px rgba(255, 214, 89, 0.5);

  /* Timing */
  --duration-fast: 0.2s;
  --duration-base: 0.3s;
  --duration-medium: 0.4s;
  --duration-slow: 0.5s;
  --duration-slower: 0.6s;

  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.6, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

---

## 12. Key Takeaways & Recommendations

### What Makes This Design Work

1. **High Contrast Dark Theme**
   - Creates premium, modern aesthetic
   - Excellent for readability
   - Makes gold accents extremely effective
   - Perfect for tech/AI branding

2. **Minimal Color Palette**
   - Only 2 primary colors (navy + gold)
   - Creates strong brand identity
   - Easy to maintain consistency
   - High visual impact

3. **Generous Whitespace**
   - 80-120px section padding
   - 24-40px card gaps
   - Creates sophistication and breathing room

4. **Smooth Interactions**
   - 0.4s cubic-bezier transitions
   - Lift effects on hover (2-8px)
   - Subtle shadow expansions
   - Professional, polished feel

5. **Typography Hierarchy**
   - Clear size jumps (68px → 46px → 32px → 24px)
   - Consistent weight usage
   - Excellent readability with white on dark

### Adaptation for Hebrew School Landing Page

**Keep:**
- Dark navy background (#05051a)
- Gold accent color (#ffd659)
- Button styles and hover effects
- Card layouts and shadows
- Spacing system
- Typography scale (adjust fonts only)

**Change:**
- Font family: Use 'Heebo' or 'Assistant' instead of 'Manrope'
- Direction: Implement full RTL support
- Navigation: Mirror layout for RTL
- Language pills: Reverse order (Hebrew/English instead of EN/HE)

**Consider:**
- Slightly warmer gold (#ffb700) for Hebrew audience
- Add subtle Hebrew pattern background elements
- Adjust line-height slightly for Hebrew (typically 1.6-1.8 works better)

### Implementation Priority

**Phase 1 - Foundation** (Day 1)
- Set up color variables
- Implement typography system with Hebrew fonts
- Create base spacing utilities
- Set up RTL direction

**Phase 2 - Components** (Day 2-3)
- Build navigation bar
- Create button variations
- Implement card components
- Add form elements

**Phase 3 - Interactions** (Day 4-5)
- Add hover effects
- Implement transitions
- Create loading states
- Add scroll animations

**Phase 4 - Polish** (Day 6-7)
- Responsive testing
- Accessibility audit
- Performance optimization
- Final visual adjustments

---

**Design System Extraction Complete**
**Total Components Documented**: 15+
**CSS Variables Defined**: 70+
**Responsive Breakpoints**: 4
**Animation Patterns**: 12+

*This design system provides a complete, production-ready foundation for building a modern, professional Hebrew landing page with the same premium aesthetic as AI Studio 555.*
