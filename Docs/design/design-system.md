# BeeriManager Design System 🎨

## Overview

BeeriManager Design System is a comprehensive Hebrew-first design language built on shadcn/ui and Radix UI primitives. It provides a consistent, accessible, and RTL-optimized experience for parent committee management.

---

## 🎨 Color Palette

### Primary Colors (Modern Palette)
```css
:root {
  /* Royal Blue Traditional - Primary Brand */
  --royal-blue-traditional: 214 100% 21%;    /* #00296b */
  --marian-blue: 214 100% 27%;               /* #003f88 */
  --polynesian-blue: 214 100% 31%;           /* #00509d */

  /* Modern Blue Scale */
  --primary-50: 214 100% 97%;                /* #f0f6ff */
  --primary-100: 214 95% 94%;                /* #dbeafe */
  --primary-200: 214 90% 87%;                /* #bdd7fd */
  --primary-300: 214 85% 77%;                /* #8db8fa */
  --primary-400: 214 80% 64%;                /* #5a96f7 */
  --primary-500: 214 100% 31%;               /* #00509d - Polynesian Blue */
  --primary-600: 214 100% 27%;               /* #003f88 - Marian Blue */
  --primary-700: 214 100% 21%;               /* #00296b - Royal Blue Traditional */
  --primary-800: 214 95% 18%;                /* #001f5a */
  --primary-900: 214 90% 14%;                /* #001546 */
  --primary-950: 214 85% 9%;                 /* #000b2e */

  /* Accent Colors */
  --mikado-yellow: 50 100% 49%;              /* #fdc500 */
  --gold: 51 100% 50%;                       /* #ffd500 */

  /* Yellow Scale for Accents */
  --accent-50: 55 100% 97%;                  /* #fefce8 */
  --accent-100: 55 92% 95%;                  /* #fef3c7 */
  --accent-200: 53 98% 77%;                  /* #fed7aa */
  --accent-300: 50 98% 64%;                  /* #fbbf24 */
  --accent-400: 50 100% 49%;                 /* #fdc500 - Mikado Yellow */
  --accent-500: 51 100% 50%;                 /* #ffd500 - Gold */
  --accent-600: 45 93% 47%;                  /* #d97706 */
  --accent-700: 41 96% 40%;                  /* #b45309 */
  --accent-800: 36 75% 35%;                  /* #92400e */
  --accent-900: 30 70% 32%;                  /* #78350f */
}
```

### Semantic Colors (Modern)
```css
:root {
  /* Success - Emerald for completed/approved */
  --success: 158 64% 52%;            /* #10b981 */
  --success-50: 151 81% 96%;         /* #ecfdf5 */
  --success-100: 149 81% 90%;        /* #d1fae5 */
  --success-200: 152 76% 80%;        /* #a7f3d0 */
  --success-500: 158 64% 52%;        /* #10b981 */
  --success-600: 158 64% 43%;        /* #059669 */
  --success-700: 158 75% 32%;        /* #047857 */

  /* Warning - Using Accent Colors */
  --warning: 50 100% 49%;            /* #fdc500 - Mikado Yellow */
  --warning-50: 55 100% 97%;         /* #fefce8 */
  --warning-100: 55 92% 95%;         /* #fef3c7 */
  --warning-500: 50 100% 49%;        /* #fdc500 */

  /* Error - Modern Red for errors */
  --error: 0 72% 51%;                /* #dc2626 */
  --error-50: 0 86% 97%;             /* #fef2f2 */
  --error-100: 0 93% 94%;            /* #fee2e2 */
  --error-500: 0 72% 51%;            /* #dc2626 */
  --error-600: 0 84% 43%;            /* #b91c1c */

  /* Info - Using Primary Colors */
  --info: 214 100% 31%;              /* #00509d - Polynesian Blue */
  --info-50: 214 100% 97%;           /* #f0f6ff */
  --info-100: 214 95% 94%;           /* #dbeafe */
  --info-500: 214 100% 31%;          /* #00509d */

  /* Critical/Urgent - Deep Red */
  --critical: 0 84% 37%;             /* #b91c1c */
}
```

### Neutral Colors (Modern & RTL Optimized)
```css
:root {
  /* Backgrounds - Modern Grays */
  --background: 0 0% 100%;           /* #ffffff */
  --surface: 214 32% 99%;            /* #fcfdff */
  --muted: 214 32% 97%;              /* #f1f5f9 */
  --card: 214 25% 98%;               /* #f8fafc */
  --popover: 0 0% 100%;              /* #ffffff */

  /* Text - Enhanced Contrast */
  --foreground: 214 32% 9%;          /* #0f172a */
  --muted-foreground: 214 16% 46%;   /* #64748b */
  --card-foreground: 214 32% 9%;     /* #0f172a */
  --popover-foreground: 214 32% 9%;  /* #0f172a */

  /* Interactive Elements */
  --primary: 214 100% 31%;           /* #00509d - Polynesian Blue */
  --primary-foreground: 0 0% 100%;   /* #ffffff */
  --secondary: 214 32% 96%;          /* #e2e8f0 */
  --secondary-foreground: 214 32% 9%; /* #0f172a */
  --accent: 214 32% 96%;             /* #e2e8f0 */
  --accent-foreground: 214 32% 9%;   /* #0f172a */

  /* Borders & Inputs */
  --border: 214 32% 90%;             /* #cbd5e1 */
  --input: 214 32% 90%;              /* #cbd5e1 */
  --ring: 214 100% 31%;              /* #00509d - Focus ring matches primary */

  /* Modern Glass Effect */
  --glass-bg: 214 32% 99% / 0.8;     /* Semi-transparent background */
  --glass-border: 214 32% 90% / 0.3; /* Subtle glass border */
}
```

---

## 📝 Typography

### Hebrew Font Stack
```css
:root {
  /* Primary Hebrew font family */
  --font-hebrew: "Rubik", "Assistant", "Heebo", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

  /* Monospace for dates/numbers */
  --font-mono: "JetBrains Mono", "Fira Code", "Consolas", monospace;
}

body {
  font-family: var(--font-hebrew);
  direction: rtl;
  text-align: right;
}
```

### Font Sizes & Line Heights
```css
/* Typography Scale */
.text-xs    { font-size: 0.75rem; line-height: 1rem; }     /* 12px/16px */
.text-sm    { font-size: 0.875rem; line-height: 1.25rem; } /* 14px/20px */
.text-base  { font-size: 1rem; line-height: 1.5rem; }      /* 16px/24px */
.text-lg    { font-size: 1.125rem; line-height: 1.75rem; } /* 18px/28px */
.text-xl    { font-size: 1.25rem; line-height: 1.75rem; }  /* 20px/28px */
.text-2xl   { font-size: 1.5rem; line-height: 2rem; }      /* 24px/32px */
.text-3xl   { font-size: 1.875rem; line-height: 2.25rem; } /* 30px/36px */
.text-4xl   { font-size: 2.25rem; line-height: 2.5rem; }   /* 36px/40px */
```

### Hebrew Text Optimization
```css
/* Hebrew text rendering */
.hebrew-text {
  font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* RTL text alignment */
.text-right { text-align: right; }
.rtl\:text-right[dir="rtl"] { text-align: right; }
.rtl\:text-left[dir="rtl"] { text-align: left; }
```

---

## 🧩 Modern Component Specifications

### Modern Button Variants
```css
/* Primary Button - Modern Button */
.modern-button {
  background: linear-gradient(135deg, #00509d 0%, #003f88 50%, #00296b 100%);
  color: white;
  border: none;
  border-radius: 1.25rem;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(0, 80, 157, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.modern-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 25px -5px rgba(0, 80, 157, 0.4);
}

.modern-button:active {
  transform: translateY(-1px);
}

/* Secondary Button */
.secondary-button {
  background: rgba(255, 255, 255, 0.9);
  color: #00296b;
  border: 2px solid rgba(0, 80, 157, 0.2);
  border-radius: 1.25rem;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  backdrop-filter: blur(8px);
}

.secondary-button:hover {
  background: rgba(0, 80, 157, 0.1);
  border-color: #00509d;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 80, 157, 0.2);
}

/* Accent Button - Gold Gradient */
.accent-button {
  background: linear-gradient(135deg, #ffd500 0%, #fdc500 100%);
  color: #00296b;
  border: none;
  border-radius: 1.25rem;
  padding: 1rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(253, 197, 0, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.accent-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 25px -5px rgba(253, 197, 0, 0.4);
}

/* Button Size Variations */
.button-sm {
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
}

.button-default {
  padding: 0.625rem 1.75rem;
  font-size: 0.9375rem;
}

.button-lg {
  padding: 0.875rem 2.25rem;
  font-size: 1rem;
}

.button-xl {
  padding: 1rem 2.75rem;
  font-size: 1.125rem;
}

/* UI/UX Guidelines for Button Sizes:
 * - Use button-sm for secondary/tertiary actions
 * - Use button-default for primary actions in forms and cards (recommended for most use cases)
 * - Use button-lg sparingly for hero sections or prominent CTAs only
 * - Use button-xl only for landing pages or special marketing sections
 * - Maintain consistent sizing within the same component or section
 * - Consider mobile touch targets: minimum 44px height recommended
 */
```

### Modern Card Layout
```css
.card {
  @apply rounded-2xl border bg-card text-card-foreground shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300;
  direction: rtl;
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--surface)) 100%);
}

.card-modern {
  @apply rounded-3xl border-0 bg-gradient-to-br from-card to-surface shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1;
  direction: rtl;
}

.card-glass {
  @apply rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-lg shadow-xl;
  direction: rtl;
}

.card-header {
  @apply flex flex-col space-y-2 p-8 text-right;
}

.card-title {
  @apply text-2xl font-bold leading-tight tracking-tight text-right bg-gradient-to-l from-primary to-primary-600 bg-clip-text text-transparent;
}

.card-description {
  @apply text-sm text-muted-foreground text-right font-medium;
}

.card-content {
  @apply p-8 pt-0 text-right;
}

.card-footer {
  @apply flex items-center p-8 pt-0 text-right gap-3;
}
```

### Modern Form Components (Glass Morphism Style)

#### Form Containers
```css
/* Main Form Container */
.form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Form Section Cards */
.form-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  border: 1px solid rgba(0, 80, 157, 0.1);
  box-shadow: 0 10px 15px -3px rgba(0, 80, 157, 0.1);
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 80, 157, 0.15);
  transform: translateY(-2px);
}
```

#### Input Fields
```css
/* Standard Input */
.form-input {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(0, 80, 157, 0.1);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  direction: rtl;
  text-align: right;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-input:focus {
  outline: none;
  border-color: #00509d;
  box-shadow: 0 0 0 4px rgba(0, 80, 157, 0.1), 0 10px 15px -3px rgba(0, 80, 157, 0.2);
  transform: translateY(-2px);
}

.form-input:hover {
  border-color: rgba(0, 80, 157, 0.3);
  box-shadow: 0 8px 10px -2px rgba(0, 0, 0, 0.1);
}

/* Textarea */
.form-textarea {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(0, 80, 157, 0.1);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  direction: rtl;
  text-align: right;
  resize: none;
  min-height: 120px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-textarea:focus {
  outline: none;
  border-color: #00509d;
  box-shadow: 0 0 0 4px rgba(0, 80, 157, 0.1), 0 10px 15px -3px rgba(0, 80, 157, 0.2);
  transform: translateY(-2px);
}

/* Select Dropdown */
.form-select {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(0, 80, 157, 0.1);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  direction: rtl;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2300296b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: left 1rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  padding-left: 3rem;
}

.form-select:focus {
  outline: none;
  border-color: #00509d;
  box-shadow: 0 0 0 4px rgba(0, 80, 157, 0.1), 0 10px 15px -3px rgba(0, 80, 157, 0.2);
  transform: translateY(-2px);
}
```

#### Form Labels and Messages
```css
/* Form Label */
.form-label {
  font-size: 1rem;
  font-weight: 600;
  color: #00296b;
  margin-bottom: 0.75rem;
  display: block;
  text-align: right;
}

/* Success Message */
.success-message {
  color: #10b981;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Error Message */
.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
```

#### Modern Form Controls
```css
/* Custom Checkbox */
.form-checkbox {
  appearance: none;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(0, 80, 157, 0.3);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.form-checkbox:checked {
  background: linear-gradient(135deg, #00509d, #003f88);
  border-color: #00509d;
}

.form-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 1rem;
}

/* Custom Radio Button */
.form-radio {
  appearance: none;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(0, 80, 157, 0.3);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.form-radio:checked {
  border-color: #00509d;
}

.form-radio:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.75rem;
  height: 0.75rem;
  background: linear-gradient(135deg, #00509d, #003f88);
  border-radius: 50%;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 0.75rem;
  background: rgba(0, 80, 157, 0.1);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00509d, #003f88);
  border-radius: 1rem;
  transition: width 0.5s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Form Grid Layout */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.form-field {
  margin-bottom: 1.5rem;
}

/* Step Indicator */
.step-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  justify-content: center;
}

.step {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid rgba(0, 80, 157, 0.2);
  background: rgba(255, 255, 255, 0.8);
}

.step.active {
  background: linear-gradient(135deg, #00509d, #003f88);
  color: white;
  border-color: #00509d;
}

.step.completed {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-color: #10b981;
}

.step-line {
  width: 2rem;
  height: 2px;
  background: rgba(0, 80, 157, 0.2);
  transition: all 0.3s ease;
}

.step-line.active {
  background: linear-gradient(90deg, #00509d, #003f88);
}

/* Floating Icons */
.floating-icon {
  position: absolute;
  top: -1rem;
  right: -1rem;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #ffd500, #fdc500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(253, 197, 0, 0.4);
  animation: float 3s ease-in-out infinite;
}

.floating-icon-blue {
  background: linear-gradient(135deg, #00509d, #003f88);
  box-shadow: 0 10px 15px -3px rgba(0, 80, 157, 0.4);
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 3.5rem;
  height: 1.75rem;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 2rem;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 1.25rem;
  width: 1.25rem;
  left: 0.25rem;
  bottom: 0.25rem;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #00509d;
}

input:checked + .toggle-slider:before {
  transform: translateX(1.75rem);
}
```

---

## 🎯 Badge System

### Priority Badges
```typescript
const priorityBadges = {
  low: "bg-slate-100 text-slate-800 hover:bg-slate-100/80",
  normal: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
  high: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
  urgent: "bg-red-100 text-red-800 hover:bg-red-100/80"
}

const priorityLabels = {
  low: "נמוך",
  normal: "רגיל",
  high: "גבוה",
  urgent: "דחוף"
}
```

### Status Badges
```typescript
const statusBadges = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  draft: "bg-slate-100 text-slate-800",
  published: "bg-green-100 text-green-800"
}

const statusLabels = {
  pending: "בהמתנה",
  in_progress: "בביצוע",
  completed: "הושלם",
  cancelled: "בוטל",
  draft: "טיוטה",
  published: "פורסם"
}
```

### Category Badges
```typescript
const categoryBadges = {
  general: "bg-slate-100 text-slate-800",
  meeting: "bg-blue-100 text-blue-800",
  fundraiser: "bg-green-100 text-green-800",
  trip: "bg-purple-100 text-purple-800",
  workshop: "bg-orange-100 text-orange-800",
  event: "bg-indigo-100 text-indigo-800"
}

const categoryLabels = {
  general: "כללי",
  meeting: "פגישה",
  fundraiser: "התרמה",
  trip: "טיול",
  workshop: "סדנה",
  event: "אירוע"
}
```

---

## 📐 Spacing & Layout

### Spacing Scale (RTL Optimized)
```css
/* Margin - RTL aware */
.mr-1  { margin-right: 0.25rem; }    /* 4px */
.mr-2  { margin-right: 0.5rem; }     /* 8px */
.mr-3  { margin-right: 0.75rem; }    /* 12px */
.mr-4  { margin-right: 1rem; }       /* 16px */
.mr-6  { margin-right: 1.5rem; }     /* 24px */
.mr-8  { margin-right: 2rem; }       /* 32px */

/* Padding */
.p-2   { padding: 0.5rem; }          /* 8px */
.p-4   { padding: 1rem; }            /* 16px */
.p-6   { padding: 1.5rem; }          /* 24px */
.p-8   { padding: 2rem; }            /* 32px */

/* Gap for flexbox */
.gap-2 { gap: 0.5rem; }              /* 8px */
.gap-4 { gap: 1rem; }                /* 16px */
.gap-6 { gap: 1.5rem; }              /* 24px */
```

### Grid System
```css
/* Grid Layout */
.grid-cols-1    { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2    { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3    { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-12   { grid-template-columns: repeat(12, minmax(0, 1fr)); }

/* Responsive breakpoints */
@media (min-width: 640px) {
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
```

---

## 🔧 RTL Utilities

### Direction Classes
```css
/* RTL specific utilities */
.rtl\:mr-2[dir="rtl"] { margin-right: 0.5rem; }
.rtl\:ml-2[dir="rtl"] { margin-left: 0.5rem; }
.rtl\:pr-4[dir="rtl"] { padding-right: 1rem; }
.rtl\:pl-4[dir="rtl"] { padding-left: 1rem; }

/* Text alignment */
.rtl\:text-right[dir="rtl"] { text-align: right; }
.rtl\:text-left[dir="rtl"] { text-align: left; }

/* Flexbox direction */
.rtl\:flex-row-reverse[dir="rtl"] { flex-direction: row-reverse; }

/* Border utilities */
.rtl\:border-r[dir="rtl"] { border-right-width: 1px; }
.rtl\:border-l[dir="rtl"] { border-left-width: 1px; }
```

### Icon Positioning
```css
/* Icon spacing for RTL */
.icon-right {
  margin-left: 0.5rem;
}

.icon-left {
  margin-right: 0.5rem;
}

[dir="rtl"] .icon-right {
  margin-left: 0;
  margin-right: 0.5rem;
}

[dir="rtl"] .icon-left {
  margin-right: 0;
  margin-left: 0.5rem;
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
/* xs: 0px */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */

/* Component responsive patterns */
.responsive-card {
  @apply p-4 sm:p-6;
  @apply text-sm sm:text-base;
  @apply space-y-2 sm:space-y-4;
}

.responsive-grid {
  @apply grid grid-cols-1 gap-4;
  @apply sm:grid-cols-2 sm:gap-6;
  @apply lg:grid-cols-3;
}

.responsive-form {
  @apply grid grid-cols-1 gap-4;
  @apply md:grid-cols-2 md:gap-6;
}
```

### Mobile Optimizations
```css
/* Touch targets */
.touch-target {
  @apply min-h-[44px] min-w-[44px];
}

/* Mobile-specific spacing */
@media (max-width: 640px) {
  .mobile-compact {
    @apply p-2 text-sm;
  }

  .mobile-full-width {
    @apply w-full;
  }

  .mobile-hide {
    @apply hidden;
  }
}
```

---

## ♿ Accessibility

### Focus Management
```css
/* Focus styles */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2;
}

/* Skip links */
.skip-link {
  @apply absolute -top-full left-6 z-50 bg-background px-4 py-2 text-sm font-medium;
  @apply focus:top-6;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### ARIA Labels (Hebrew)
```typescript
const ariaLabels = {
  navigation: "ניווט ראשי",
  menu: "תפריט",
  search: "חיפוש",
  close: "סגור",
  open: "פתח",
  loading: "טוען...",
  error: "שגיאה",
  success: "הצלחה",
  warning: "אזהרה",
  required: "שדה חובה",
  optional: "אופציונלי"
}
```

---

## 🎭 Modern Animation System (Subtle & Professional)

### Core Animation Principles
- **Subtle and Professional** - Enhances UX without overwhelming
- **Performance Optimized** - Uses transform and opacity for smooth animations
- **Consistent Timing** - 0.3s for interactions, 0.5s for state changes
- **Purpose-Driven** - Every animation serves a functional purpose

### Transition Classes
```css
/* Standard transitions */
.transition-base {
  transition: all 0.3s ease;
}

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.3s ease;
}

.transition-shadow {
  transition: box-shadow 0.3s ease;
}

/* Hover effects for form elements */
.form-section:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 80, 157, 0.15);
  transform: translateY(-2px);
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  transform: translateY(-2px);
  box-shadow: 0 0 0 4px rgba(0, 80, 157, 0.1), 0 10px 15px -3px rgba(0, 80, 157, 0.2);
}

/* Button hover animations */
.modern-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 25px -5px rgba(0, 80, 157, 0.4);
}

.secondary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 80, 157, 0.2);
}

.accent-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 25px -5px rgba(253, 197, 0, 0.4);
}
```

### Floating and Progress Animations
```css
/* Floating icon animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

.floating-icon {
  animation: float 3s ease-in-out infinite;
}

/* Progress bar shimmer */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-fill::after {
  animation: shimmer 2s infinite;
}

/* Subtle scale on checkbox/radio interaction */
.form-checkbox:checked, .form-radio:checked {
  animation: checkbox-check 0.3s ease;
}

@keyframes checkbox-check {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### Loading States & Feedback
```css
/* Loading spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

/* Button loading state */
.button-loading {
  position: relative;
  pointer-events: none;
}

.button-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin-left: -8px;
  margin-top: -8px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Subtle pulse for loading skeleton */
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background-color: rgba(0, 80, 157, 0.1);
  border-radius: 0.5rem;
}

/* Success feedback animation */
@keyframes success-checkmark {
  0% {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(45deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(45deg);
    opacity: 1;
  }
}

.success-icon {
  animation: success-checkmark 0.5s ease-out;
}
```

### Interactive Feedback
```css
/* Subtle click feedback */
.interactive-element:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* Focus ring animation */
@keyframes focus-ring {
  0% { box-shadow: 0 0 0 0 rgba(0, 80, 157, 0.4); }
  100% { box-shadow: 0 0 0 4px rgba(0, 80, 157, 0.1); }
}

.focus-ring:focus {
  animation: focus-ring 0.3s ease-out;
}

/* Input validation feedback */
.input-valid {
  border-color: #10b981;
  animation: input-success 0.3s ease;
}

.input-invalid {
  border-color: #dc2626;
  animation: input-error 0.3s ease;
}

@keyframes input-success {
  0% { transform: translateX(0); }
  25% { transform: translateX(2px); }
  75% { transform: translateX(-2px); }
  100% { transform: translateX(0); }
}

@keyframes input-error {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}
```

### Page Transitions
```css
/* Fade in animation for form sections */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

/* Stagger effect for multiple elements */
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 100ms; }
.stagger-item:nth-child(3) { animation-delay: 200ms; }
.stagger-item:nth-child(4) { animation-delay: 300ms; }
.stagger-item:nth-child(5) { animation-delay: 400ms; }
```

### Animation Performance Guidelines
```css
/* Optimized animations - prefer transform and opacity */
.optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0); /* Create compositing layer */
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .floating-icon {
    animation: none;
  }
}
```

---

## 📅 Calendar Component System

### MobileCalendar Component
The core calendar component built from Template 9 (Dot Indicators) design with mobile-first approach.

#### Design Specifications
```css
/* Calendar Container */
.mobile-calendar {
  @apply w-full max-w-sm mx-auto;
  background-color: hsl(225, 100%, 94%); /* indigo-50 */
  direction: rtl;
}

/* Calendar Header */
.calendar-header {
  @apply bg-white rounded-2xl shadow-lg p-4 mb-4;
}

/* Navigation Buttons */
.calendar-nav-button {
  @apply text-indigo-400 hover:text-indigo-600 text-3xl p-3;
  @apply hover:bg-indigo-50 rounded-full transition-colors;
  @apply touch-manipulation min-h-[44px] min-w-[44px];
}

/* Month Title */
.calendar-title {
  @apply text-lg sm:text-xl font-bold text-gray-800 text-center;
}

/* Date Subtitle */
.calendar-subtitle {
  @apply text-xs text-gray-500 mt-1 text-center;
}

/* Week Days Header */
.calendar-weekdays {
  @apply grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-3;
}

.calendar-weekday {
  @apply py-2 font-medium;
}

/* Calendar Grid */
.calendar-grid {
  @apply grid grid-cols-7 gap-1 sm:gap-2;
}

/* Day Cells */
.calendar-day-cell {
  @apply relative flex flex-col items-center justify-center text-sm;
  @apply aspect-square rounded-lg transition-all touch-manipulation;
  min-height: 44px; /* Accessibility requirement */
}

.calendar-day-cell.today {
  @apply bg-indigo-600 text-white font-bold shadow-lg;
}

.calendar-day-cell.selected {
  @apply bg-indigo-100 text-indigo-800 font-semibold;
  @apply ring-2 ring-indigo-400;
}

.calendar-day-cell.current-month {
  @apply text-gray-800 hover:bg-indigo-50 active:bg-indigo-100;
}

.calendar-day-cell.other-month {
  @apply text-gray-300;
}
```

#### Event Indicators System
```css
/* Event Dots Container */
.event-indicators {
  @apply absolute bottom-1 flex space-x-0.5 flex-wrap justify-center;
}

/* Individual Event Dots */
.event-dot {
  @apply w-1.5 h-1.5 rounded-full transition-all touch-manipulation;
  @apply hover:scale-125 active:scale-150;
}

/* Event Type Colors */
.event-dot.meeting { @apply bg-red-400; }
.event-dot.trip { @apply bg-green-400; }
.event-dot.fundraising { @apply bg-blue-400; }
.event-dot.event { @apply bg-yellow-400; }
.event-dot.volunteer { @apply bg-purple-400; }
.event-dot.holiday { @apply bg-white border-2 border-indigo-400; }

/* Event Overflow Indicator */
.event-overflow {
  @apply text-[10px] font-bold;
}

.event-overflow.today {
  @apply text-white;
}

.event-overflow.normal {
  @apply text-indigo-600;
}
```

#### Event Legend Component
```css
/* Legend Container */
.calendar-legend {
  @apply bg-white rounded-2xl shadow-lg p-4 mb-4;
}

.legend-title {
  @apply font-bold text-base mb-3;
}

.legend-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-2;
}

.legend-item {
  @apply flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50;
}

.legend-dot {
  @apply w-3 h-3 rounded-full flex-shrink-0;
}

.legend-label {
  @apply text-sm text-gray-700 font-medium;
}
```

#### Weekly Summary Component
```css
/* Summary Container */
.weekly-summary {
  @apply bg-white rounded-2xl shadow-lg p-4;
}

.summary-header {
  @apply flex justify-between items-center;
}

.summary-title {
  @apply text-sm text-indigo-800 font-bold;
}

.summary-count {
  @apply text-xs text-indigo-600 mt-1;
}

.summary-icon {
  @apply text-2xl;
}

/* Today's Events List */
.today-events {
  @apply mt-3;
}

.event-item {
  @apply w-full text-right p-3 rounded-lg mb-2 transition-all touch-manipulation;
  @apply hover:shadow-md active:scale-95;
}

.event-title {
  @apply font-medium text-sm;
}

.event-details {
  @apply text-xs text-gray-600 mt-1;
}

/* Event Type Backgrounds */
.event-item.meeting { @apply bg-red-50; }
.event-item.meeting .event-title { @apply text-red-800; }

.event-item.trip { @apply bg-green-50; }
.event-item.trip .event-title { @apply text-green-800; }

.event-item.fundraising { @apply bg-blue-50; }
.event-item.fundraising .event-title { @apply text-blue-800; }

.event-item.event { @apply bg-yellow-50; }
.event-item.event .event-title { @apply text-yellow-800; }

.event-item.volunteer { @apply bg-purple-50; }
.event-item.volunteer .event-title { @apply text-purple-800; }

.event-item.holiday { @apply bg-indigo-50; }
.event-item.holiday .event-title { @apply text-indigo-800; }
```

#### Touch Gesture Support
```css
/* Touch Enhancements */
.touch-manipulation {
  touch-action: manipulation;
}

/* Swipe Hint */
.swipe-hint {
  @apply mt-3 text-center;
}

.swipe-hint-text {
  @apply text-xs text-gray-400;
}

/* Touch Feedback */
.touch-feedback {
  @apply active:bg-indigo-100 active:scale-95;
  @apply transition-all duration-100 ease-in-out;
}
```

---

## 📐 Component Patterns

### Card Layouts
```css
/* Event Card */
.event-card {
  @apply card border-r-4 border-r-primary/20;
  @apply hover:shadow-lg transition-all duration-200;
}

.event-card.urgent {
  @apply border-r-red-500 shadow-red-100;
}

.event-card.completed {
  @apply bg-green-50 border-r-green-500;
}

/* Task Card */
.task-card {
  @apply card hover:shadow-lg transition-all duration-200;
}

.task-card.overdue {
  @apply border-r-red-600 bg-red-50;
}

/* Form Cards */
.form-card {
  @apply card p-6 space-y-6;
}
```

### Layout Patterns
```css
/* Dashboard Layout */
.dashboard-grid {
  @apply grid grid-cols-1 gap-6;
  @apply md:grid-cols-2 lg:grid-cols-3;
}

/* Form Layout */
.form-layout {
  @apply space-y-6;
}

.form-section {
  @apply card p-6 space-y-4;
}

.form-row {
  @apply grid grid-cols-1 gap-4;
  @apply md:grid-cols-2;
}

/* List Layout */
.list-container {
  @apply space-y-4;
}

.list-item {
  @apply card p-4 hover:shadow-md transition-shadow duration-200;
}
```

---

## 🚀 Usage Guidelines

### Do's ✅
- **Always use RTL direction** for Hebrew text
- **Apply consistent spacing** using the spacing scale
- **Use semantic colors** for status indicators
- **Maintain touch targets** of minimum 44px on mobile
- **Test with real Hebrew content** during development
- **Follow accessibility guidelines** with proper ARIA labels

### Don'ts ❌
- **Don't mix LTR and RTL** without proper direction attributes
- **Don't use arbitrary color values** outside the design system
- **Don't ignore keyboard navigation** for interactive elements
- **Don't use only color** to convey meaning (add text/icons)
- **Don't override focus styles** without providing alternatives

### Component Composition
```tsx
// Good: Using design system components
<Card className="event-card">
  <CardHeader>
    <CardTitle className="text-right">כותרת האירוע</CardTitle>
    <div className="flex gap-2 justify-end">
      <Badge variant="warning">דחוף</Badge>
      <Badge variant="outline">פגישה</Badge>
    </div>
  </CardHeader>
  <CardContent className="text-right">
    <p>תיאור האירוע בעברית...</p>
  </CardContent>
</Card>

// Bad: Custom styling outside system
<div style={{backgroundColor: '#ff0000', textAlign: 'left'}}>
  <h1>Event Title</h1>
</div>
```

---

## 📋 Component Checklist

When creating new components, ensure:
- [ ] RTL support with proper direction attributes
- [ ] Hebrew text alignment (`text-right`)
- [ ] Consistent color usage from design system
- [ ] Proper spacing using system scale
- [ ] Accessibility features (ARIA labels, keyboard nav)
- [ ] Responsive design for mobile/desktop
- [ ] Loading and error states
- [ ] TypeScript interfaces defined
- [ ] Documented props and usage examples

---

## 🔄 Design Tokens

### CSS Custom Properties
```css
:root {
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Border radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal: 1040;
  --z-tooltip: 1070;
}
```

---

*Design System Version: 1.0.0*
*Last Updated: December 2024*
*Hebrew-First • RTL Optimized • Accessibility Focused*