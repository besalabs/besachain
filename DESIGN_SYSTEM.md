# Besa Foundation Design System
## besachain.org — Visual Identity & UI Specification

> **Besa** (Albanian): The sacred promise that cannot be broken.

---

## 1. Executive Summary

This design system establishes a modern, trustworthy, and human-centered visual identity for the Besa Foundation. The design balances technical credibility (blockchain foundation) with emotional resonance (sacred promise, human impact).

### Design Philosophy
- **Trust through Transparency**: Open, light aesthetic signaling institutional integrity
- **Human-First Technology**: Technology serving humanity, not the other way around
- **Timeless Modernity**: Clean 2025 aesthetics that won't feel dated
- **Purposeful Restraint**: Every element earns its place

### Theme Recommendation: **Light Theme**
For foundation/trust organizations, a light theme communicates:
- Transparency and openness
- Accessibility and inclusivity
- Professional institutional credibility
- Optimism and forward-looking mission

---

## 2. Color Palette

### Primary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-primary` | `#0F172A` | rgb(15, 23, 42) | Primary text, headings, key UI |
| `--color-primary-dark` | `#020617` | rgb(2, 6, 23) | Deep accents, footer |
| `--color-primary-light` | `#1E293B` | rgb(30, 41, 59) | Secondary text |

### Secondary/Accent Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--color-accent` | `#059669` | rgb(5, 150, 105) | Primary CTA, links, success states |
| `--color-accent-hover` | `#047857` | rgb(4, 120, 87) | CTA hover states |
| `--color-accent-light` | `#D1FAE5` | rgb(209, 250, 229) | Light backgrounds, badges |
| `--color-accent-subtle` | `#ECFDF5` | rgb(236, 253, 245) | Subtle highlights |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-trust` | `#0369A1` | Trust indicators, info blocks |
| `--color-warmth` | `#B45309` | Human stories, testimonials |
| `--color-impact` | `#7C3AED` | Impact metrics, achievements |

### Neutral Colors (Grayscale)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-white` | `#FFFFFF` | Backgrounds, cards |
| `--color-gray-50` | `#F8FAFC` | Page background, sections |
| `--color-gray-100` | `#F1F5F9` | Subtle backgrounds, hover states |
| `--color-gray-200` | `#E2E8F0` | Borders, dividers |
| `--color-gray-300` | `#CBD5E1` | Disabled states, subtle borders |
| `--color-gray-400` | `#94A3B8` | Placeholder text, icons |
| `--color-gray-500` | `#64748B` | Secondary text, captions |
| `--color-gray-600` | `#475569` | Body text secondary |
| `--color-gray-700` | `#334155` | Emphasized secondary text |
| `--color-gray-800` | `#1E293B` | Strong secondary text |
| `--color-gray-900` | `#0F172A` | Primary text |

### Color Usage Patterns

```
┌─────────────────────────────────────────────────────────┐
│  PAGE BACKGROUND: #F8FAFC (gray-50)                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │  CARD BACKGROUND: #FFFFFF                       │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │  Text Primary: #0F172A                  │    │    │
│  │  │  Text Secondary: #64748B                │    │    │
│  │  │  Accent/CTA: #059669                    │    │    │
│  │  │  Accent Light: #ECFDF5 (subtle bg)      │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Typography System

### Font Families

| Role | Font | Fallback Stack |
|------|------|----------------|
| **Headings** | Inter | `Inter, system-ui, -apple-system, sans-serif` |
| **Body** | Inter | `Inter, system-ui, -apple-system, sans-serif` |
| **Accent/Quotes** | Source Serif 4 | `Source Serif 4, Georgia, serif` |

> **Rationale**: Inter is the gold standard for modern UI—excellent legibility, extensive weights, and open source. Source Serif 4 adds warmth for human stories and quotes.

### Type Scale

| Level | Size | Line Height | Weight | Letter Spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| Display | 4.5rem (72px) | 1.1 | 700 | -0.02em | Hero headlines |
| H1 | 3rem (48px) | 1.2 | 700 | -0.02em | Page titles |
| H2 | 2.25rem (36px) | 1.25 | 600 | -0.01em | Section headers |
| H3 | 1.5rem (24px) | 1.35 | 600 | -0.01em | Card titles |
| H4 | 1.25rem (20px) | 1.4 | 600 | 0 | Subsection headers |
| H5 | 1.125rem (18px) | 1.5 | 600 | 0 | Labels, small headers |
| H6 | 1rem (16px) | 1.5 | 600 | 0 | Meta labels |
| Body Large | 1.25rem (20px) | 1.7 | 400 | 0 | Lead paragraphs |
| Body | 1rem (16px) | 1.75 | 400 | 0 | Standard text |
| Body Small | 0.875rem (14px) | 1.6 | 400 | 0 | Secondary text |
| Caption | 0.75rem (12px) | 1.5 | 500 | 0.02em | Labels, timestamps |

### Typography Patterns

**Hero Headline:**
```
font-size: 4.5rem;
font-weight: 700;
line-height: 1.1;
letter-spacing: -0.02em;
color: #0F172A;
max-width: 20ch;
```

**Section Header:**
```
font-size: 2.25rem;
font-weight: 600;
line-height: 1.25;
letter-spacing: -0.01em;
color: #0F172A;
```

**Body Text:**
```
font-size: 1rem;
font-weight: 400;
line-height: 1.75;
color: #334155;
max-width: 65ch;
```

**Pull Quote (Serif):**
```
font-family: 'Source Serif 4', Georgia, serif;
font-size: 1.5rem;
font-weight: 400;
font-style: italic;
line-height: 1.6;
color: #475569;
border-left: 3px solid #059669;
padding-left: 1.5rem;
```

---

## 4. Spacing System

### Base Unit: 4px

All spacing values derive from a 4px base unit for consistent rhythm.

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0 | - |
| `--space-1` | 0.25rem (4px) | Micro spacing, icon gaps |
| `--space-2` | 0.5rem (8px) | Tight element spacing |
| `--space-3` | 0.75rem (12px) | Inline element gaps |
| `--space-4` | 1rem (16px) | Default padding, gaps |
| `--space-5` | 1.25rem (20px) | Card padding |
| `--space-6` | 1.5rem (24px) | Component gaps |
| `--space-8` | 2rem (32px) | Section element gaps |
| `--space-10` | 2.5rem (40px) | Medium section padding |
| `--space-12` | 3rem (48px) | Large component gaps |
| `--space-16` | 4rem (64px) | Section padding (mobile) |
| `--space-20` | 5rem (80px) | Standard section padding |
| `--space-24` | 6rem (96px) | Large section padding |
| `--space-32` | 8rem (128px) | Hero section padding |

### Layout Spacing

```
┌────────────────────────────────────────────────────────┐
│  SECTION PADDING                                       │
│  ┌────────────────────────────────────────────────┐    │
│  │  Container Max-Width: 1280px (80rem)           │    │
│  │  Padding X: 1rem (mobile) → 2rem (desktop)     │    │
│  │  ┌────────────────────────────────────────┐    │    │
│  │  │  Content Area                          │    │    │
│  │  │  ┌────────────────────────────────┐    │    │    │
│  │  │  │  Grid Gap: 1.5rem - 3rem       │    │    │    │
│  │  │  │  Card Padding: 1.5rem - 2rem   │    │    │    │
│  │  │  └────────────────────────────────┘    │    │    │
│  │  └────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

### Section Padding Guidelines

| Section Type | Mobile | Tablet | Desktop |
|--------------|--------|--------|---------|
| Hero | 5rem 0 | 6rem 0 | 8rem 0 |
| Standard | 4rem 0 | 5rem 0 | 6rem 0 |
| Compact | 2.5rem 0 | 3rem 0 | 4rem 0 |
| Footer | 3rem 0 | 4rem 0 | 5rem 0 |

---

## 5. Component Library

### 5.1 Buttons

#### Primary Button
```css
/* Default State */
background: #059669;
color: #FFFFFF;
font-size: 1rem;
font-weight: 600;
padding: 0.875rem 1.75rem;
border-radius: 0.5rem;
border: none;
cursor: pointer;
transition: all 0.2s ease;

/* Hover State */
background: #047857;
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);

/* Active State */
transform: translateY(0);
box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);

/* Focus State */
outline: 2px solid #059669;
outline-offset: 2px;
```

#### Secondary Button
```css
/* Default State */
background: transparent;
color: #059669;
font-size: 1rem;
font-weight: 600;
padding: 0.875rem 1.75rem;
border-radius: 0.5rem;
border: 2px solid #059669;

/* Hover State */
background: #ECFDF5;
color: #047857;
```

#### Tertiary Button (Ghost)
```css
/* Default State */
background: transparent;
color: #0F172A;
font-size: 1rem;
font-weight: 600;
padding: 0.75rem 1rem;
border-radius: 0.5rem;
border: none;

/* Hover State */
background: #F1F5F9;
color: #0F172A;
```

#### Donation Button (Special Variant)
```css
/* Features heart icon and pulsing attention */
background: linear-gradient(135deg, #059669 0%, #047857 100%);
color: #FFFFFF;
font-size: 1.125rem;
font-weight: 600;
padding: 1rem 2rem;
border-radius: 0.75rem;
border: none;
box-shadow: 0 4px 20px rgba(5, 150, 105, 0.3);
position: relative;
overflow: hidden;

/* Subtle pulse animation on idle */
animation: pulse-soft 2s infinite;

@keyframes pulse-soft {
  0%, 100% { box-shadow: 0 4px 20px rgba(5, 150, 105, 0.3); }
  50% { box-shadow: 0 4px 30px rgba(5, 150, 105, 0.5); }
}
```

---

### 5.2 Cards

#### Impact Card
```
┌─────────────────────────────────────────┐
│  ┌─────────┐                            │
│  │  Icon   │  2.4M+                     │
│  │  48x48  │  Lives Impacted            │
│  └─────────┘  Supporting description    │
│           text here...                  │
└─────────────────────────────────────────┘
```

```css
.impact-card {
  background: #FFFFFF;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
}

.impact-card:hover {
  border-color: #059669;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.impact-card__icon {
  width: 3rem;
  height: 3rem;
  background: #ECFDF5;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #059669;
}

.impact-card__stat {
  font-size: 2rem;
  font-weight: 700;
  color: #0F172A;
  letter-spacing: -0.02em;
}

.impact-card__label {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
}

.impact-card__description {
  font-size: 0.875rem;
  color: #64748B;
  line-height: 1.6;
}
```

#### Story Card
```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │        Image (16:10)            │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│  Tag: Education                         │
│  Building Schools in Rural...           │
│  A brief description of the impact      │
│  and outcomes of this initiative...     │
│  Read more →                            │
└─────────────────────────────────────────┘
```

```css
.story-card {
  background: #FFFFFF;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
}

.story-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.story-card:hover .story-card__image {
  transform: scale(1.05);
}

.story-card__image-wrapper {
  aspect-ratio: 16/10;
  overflow: hidden;
}

.story-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.story-card__content {
  padding: 1.5rem;
}

.story-card__tag {
  display: inline-block;
  background: #ECFDF5;
  color: #059669;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}

.story-card__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0F172A;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.story-card__excerpt {
  font-size: 0.9375rem;
  color: #64748B;
  line-height: 1.7;
  margin-bottom: 1rem;
}

.story-card__link {
  color: #059669;
  font-weight: 600;
  font-size: 0.9375rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: gap 0.2s ease;
}

.story-card:hover .story-card__link {
  gap: 0.5rem;
}
```

#### Testimonial Card
```
┌─────────────────────────────────────────┐
│  "Quote text here..."                   │
│                                         │
│  ┌────┐  Name                           │
│  │Avatar│ Role / Location               │
│  └────┘                                 │
└─────────────────────────────────────────┘
```

```css
.testimonial-card {
  background: #FFFFFF;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #E2E8F0;
  position: relative;
}

.testimonial-card::before {
  content: '"';
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 6rem;
  color: #ECFDF5;
  line-height: 1;
  z-index: 0;
}

.testimonial-card__quote {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 1.25rem;
  font-style: italic;
  color: #475569;
  line-height: 1.7;
  position: relative;
  z-index: 1;
  margin-bottom: 1.5rem;
}

.testimonial-card__author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.testimonial-card__avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #E2E8F0;
}

.testimonial-card__name {
  font-weight: 600;
  color: #0F172A;
}

.testimonial-card__role {
  font-size: 0.875rem;
  color: #64748B;
}
```

---

### 5.3 Navigation

#### Main Navigation
```
┌────────────────────────────────────────────────────────────┐
│  Logo                    Home  About  Impact  News  Donate │
│  ┌─────┐                              [Secondary] [Primary]│
│  │BESA │                                                  │
│  └─────┘                                                  │
└────────────────────────────────────────────────────────────┘
```

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar--scrolled {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.navbar__container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar__logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0F172A;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar__logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}

.navbar__nav {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.navbar__link {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  transition: color 0.2s ease;
  position: relative;
}

.navbar__link:hover {
  color: #0F172A;
}

.navbar__link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: #059669;
  transition: width 0.2s ease;
}

.navbar__link:hover::after,
.navbar__link--active::after {
  width: 100%;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
```

#### Mobile Navigation
```css
.navbar__mobile-toggle {
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #0F172A;
}

@media (max-width: 768px) {
  .navbar__mobile-toggle {
    display: block;
  }
  
  .navbar__nav {
    position: fixed;
    top: 4.5rem;
    left: 0;
    right: 0;
    bottom: 0;
    background: #FFFFFF;
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  
  .navbar__nav--open {
    transform: translateX(0);
  }
}
```

---

### 5.4 Hero Section

#### Standard Hero
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Tagline / Eyebrow                                         │
│                                                            │
│  A powerful headline about                                 │
│  the foundation's mission                                  │
│  and impact.                                               │
│                                                            │
│  Supporting description that elaborates on the mission     │
│  and invites visitors to learn more or take action.        │
│                                                            │
│  [Primary CTA]  [Secondary CTA]                            │
│                                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Hero Image / Video                    │    │
│  │              (16:9 or 2:1 aspect ratio)            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

```css
.hero {
  padding: 8rem 0 6rem;
  background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%);
  position: relative;
  overflow: hidden;
}

.hero__container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.hero__eyebrow::before {
  content: '';
  width: 2rem;
  height: 2px;
  background: #059669;
}

.hero__title {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #0F172A;
  max-width: 18ch;
  margin-bottom: 1.5rem;
}

.hero__description {
  font-size: 1.25rem;
  line-height: 1.7;
  color: #64748B;
  max-width: 55ch;
  margin-bottom: 2.5rem;
}

.hero__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 4rem;
}

.hero__image-wrapper {
  position: relative;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.1);
}

.hero__image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}

/* Decorative elements */
.hero__decoration {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(5, 150, 105, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  top: -200px;
  right: -200px;
  pointer-events: none;
}
```

---

### 5.5 Donation CTAs

#### Inline Donation Block
```
┌────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────┐    │
│  │  Support our mission                               │    │
│  │                                                    │    │
│  │  Your contribution helps us build a better future  │    │
│  │  for communities around the world.                 │    │
│  │                                                    │    │
│  │  [$25] [$50] [$100] [$250] [Custom $___]          │    │
│  │                                                    │    │
│  │  [       Donate Now       ]                        │    │
│  │                                                    │    │
│  │  🔒 Secure donation · Tax deductible               │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

```css
.donation-block {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  border-radius: 1.5rem;
  padding: 3rem;
  color: #FFFFFF;
  position: relative;
  overflow: hidden;
}

.donation-block::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(5, 150, 105, 0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.donation-block__title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  position: relative;
}

.donation-block__description {
  font-size: 1.125rem;
  color: #94A3B8;
  margin-bottom: 2rem;
  max-width: 50ch;
  position: relative;
}

.donation-block__amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.donation-block__amount {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.donation-block__amount:hover,
.donation-block__amount--selected {
  background: #059669;
  border-color: #059669;
}

.donation-block__custom {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #FFFFFF;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.donation-block__custom input {
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-weight: 600;
  width: 5rem;
  outline: none;
}

.donation-block__custom input::placeholder {
  color: #94A3B8;
}

.donation-block__submit {
  width: 100%;
  background: #059669;
  color: #FFFFFF;
  border: none;
  padding: 1.25rem;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.donation-block__submit:hover {
  background: #047857;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
}

.donation-block__trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #94A3B8;
}
```

#### Floating Donation Bar (Mobile-Optimized)
```css
.donation-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
}

.donation-bar__text {
  flex: 1;
}

.donation-bar__title {
  font-weight: 600;
  color: #0F172A;
  font-size: 0.9375rem;
}

.donation-bar__subtitle {
  font-size: 0.8125rem;
  color: #64748B;
}

.donation-bar__button {
  background: #059669;
  color: #FFFFFF;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

@media (min-width: 768px) {
  .donation-bar {
    display: none;
  }
}
```

---

### 5.6 Forms

#### Input Fields
```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #334155;
  margin-bottom: 0.5rem;
}

.form-label__required {
  color: #DC2626;
  margin-left: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 0.75rem;
  font-size: 1rem;
  color: #0F172A;
  background: #FFFFFF;
  transition: all 0.2s ease;
}

.form-input:hover {
  border-color: #CBD5E1;
}

.form-input:focus {
  outline: none;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.form-input::placeholder {
  color: #94A3B8;
}

.form-input--error {
  border-color: #DC2626;
}

.form-input--error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-error {
  font-size: 0.875rem;
  color: #DC2626;
  margin-top: 0.375rem;
}

.form-hint {
  font-size: 0.875rem;
  color: #64748B;
  margin-top: 0.375rem;
}
```

#### Newsletter Signup
```css
.newsletter {
  background: #ECFDF5;
  border-radius: 1rem;
  padding: 2rem;
}

.newsletter__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 0.5rem;
}

.newsletter__description {
  font-size: 0.9375rem;
  color: #64748B;
  margin-bottom: 1.25rem;
}

.newsletter__form {
  display: flex;
  gap: 0.75rem;
}

.newsletter__input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid #059669;
  border-radius: 0.75rem;
  font-size: 1rem;
}

.newsletter__button {
  background: #059669;
  color: #FFFFFF;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .newsletter__form {
    flex-direction: column;
  }
}
```

---

### 5.7 Footer

```css
.footer {
  background: #0F172A;
  color: #FFFFFF;
  padding: 5rem 0 2rem;
}

.footer__container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer__grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 4rem;
  margin-bottom: 4rem;
}

@media (max-width: 768px) {
  .footer__grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}

@media (max-width: 480px) {
  .footer__grid {
    grid-template-columns: 1fr;
  }
}

.footer__brand {
  max-width: 20rem;
}

.footer__logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFFFFF;
  text-decoration: none;
  margin-bottom: 1.25rem;
}

.footer__logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer__description {
  font-size: 0.9375rem;
  color: #94A3B8;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.footer__social {
  display: flex;
  gap: 1rem;
}

.footer__social-link {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  transition: all 0.2s ease;
}

.footer__social-link:hover {
  background: #059669;
  transform: translateY(-2px);
}

.footer__column-title {
  font-size: 1rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 1.25rem;
}

.footer__links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__link {
  display: block;
  font-size: 0.9375rem;
  color: #94A3B8;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color 0.2s ease;
}

.footer__link:hover {
  color: #FFFFFF;
}

.footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer__copyright {
  font-size: 0.875rem;
  color: #64748B;
}

.footer__legal {
  display: flex;
  gap: 1.5rem;
}

.footer__legal-link {
  font-size: 0.875rem;
  color: #64748B;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer__legal-link:hover {
  color: #FFFFFF;
}
```

---

## 6. Layout Patterns

### Container System

| Container | Max-Width | Padding |
|-----------|-----------|---------|
| `container-sm` | 40rem (640px) | 0 1.5rem |
| `container-md` | 48rem (768px) | 0 1.5rem |
| `container-lg` | 64rem (1024px) | 0 1.5rem |
| `container-xl` | 80rem (1280px) | 0 2rem |
| `container-full` | 100% | 0 1.5rem |

### Grid System

```css
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid--2 { grid-template-columns: repeat(2, 1fr); }
.grid--3 { grid-template-columns: repeat(3, 1fr); }
.grid--4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 1024px) {
  .grid--4 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .grid--2,
  .grid--3,
  .grid--4 { grid-template-columns: 1fr; }
}
```

---

## 7. Animations & Micro-interactions

### Hover Transitions
```css
/* Standard transition */
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;

/* Card lift on hover */
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}
```

### Scroll Reveal Animation
```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.reveal-children > * {
  opacity: 0;
  transform: translateY(20px);
}

.reveal-children.reveal--visible > *:nth-child(1) { transition-delay: 0ms; }
.reveal-children.reveal--visible > *:nth-child(2) { transition-delay: 100ms; }
.reveal-children.reveal--visible > *:nth-child(3) { transition-delay: 200ms; }
.reveal-children.reveal--visible > *:nth-child(4) { transition-delay: 300ms; }
```

### Button Press Effect
```css
.button:active {
  transform: scale(0.98);
}
```

### Link Underline Animation
```css
.link-animated {
  position: relative;
  text-decoration: none;
}

.link-animated::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}

.link-animated:hover::after {
  width: 100%;
}
```

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile-First Approach
```css
/* Base styles for mobile */
.element {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .element {
    padding: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .element {
    padding: 2rem;
  }
}
```

---

## 9. Accessibility Guidelines

### Color Contrast
- All text must meet WCAG 2.1 AA standards:
  - Normal text: 4.5:1 contrast ratio
  - Large text (18px+): 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio against adjacent colors

### Focus Indicators
```css
/* Visible focus states */
:focus-visible {
  outline: 2px solid #059669;
  outline-offset: 2px;
}

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  background: #0F172A;
  color: #FFFFFF;
  padding: 1rem 2rem;
  border-radius: 0 0 0.5rem 0.5rem;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Support
```css
/* Visually hidden but accessible */
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

---

## 10. Asset Guidelines

### Logo Usage
- **Primary Logo**: Horizontal format with wordmark
- **Icon Only**: For favicon, mobile app, social avatars
- **Clear Space**: Minimum 8px around logo
- **Minimum Size**: 24px height for digital

### Imagery Style
- **Photography**: Authentic, documentary-style images of real people
- **Avoid**: Stock photos that feel staged or generic
- **Tone**: Hopeful, human, dignified
- **Treatment**: Slight warmth, natural colors, minimal filters
- **Aspect Ratios**: 16:9 (heroes), 4:3 (stories), 1:1 (avatars)

### Iconography
- **Style**: Outlined, 2px stroke weight
- **Library**: Lucide or Phosphor Icons
- **Size**: 16px (inline), 20px (buttons), 24px (standalone)
- **Color**: Inherit from text or accent color

---

## 11. Implementation Notes

### CSS Custom Properties
```css
:root {
  /* Colors */
  --color-primary: #0F172A;
  --color-primary-dark: #020617;
  --color-accent: #059669;
  --color-accent-hover: #047857;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-serif: 'Source Serif 4', Georgia, serif;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  --space-16: 4rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.04);
  
  /* Radii */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

### Recommended Tech Stack
- **CSS Framework**: Tailwind CSS (with custom config)
- **Animation**: Framer Motion (React) or GSAP
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Inter, Source Serif 4)

---

## 12. Design Principles Checklist

When designing for Besa Foundation, ensure:

- [ ] **Trust First**: Every element should reinforce credibility
- [ ] **Human Focus**: People and impact come before technology
- [ ] **Generous Whitespace**: Let content breathe
- [ ] **Clear Hierarchy**: Users always know what to do next
- [ ] **Consistent Rhythm**: 4px base unit throughout
- [ ] **Accessible to All**: WCAG 2.1 AA compliance
- [ ] **Performance Minded**: Optimize images, minimal animations
- [ ] **Mobile First**: 52%+ of traffic is mobile

---

*Document Version: 1.0*
*Last Updated: April 2026*
*For: besachain.org (Besa Foundation)*
