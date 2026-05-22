---
name: Peak Endurance
colors:
  surface: '#1d100a'
  surface-dim: '#1d100a'
  surface-bright: '#46362e'
  surface-container-lowest: '#170b06'
  surface-container-low: '#261812'
  surface-container: '#2b1c16'
  surface-container-high: '#362720'
  surface-container-highest: '#41312a'
  on-surface: '#f8ddd2'
  on-surface-variant: '#e2bfb0'
  inverse-surface: '#f8ddd2'
  inverse-on-surface: '#3d2d26'
  outline: '#a98a7d'
  outline-variant: '#5a4136'
  surface-tint: '#ffb694'
  primary: '#ffb694'
  on-primary: '#571f00'
  primary-container: '#ff6a00'
  on-primary-container: '#571f00'
  inverse-primary: '#a14000'
  secondary: '#9ccaff'
  on-secondary: '#003256'
  secondary-container: '#009eff'
  on-secondary-container: '#003357'
  tertiary: '#4de082'
  on-tertiary: '#003919'
  tertiary-container: '#00af5a'
  on-tertiary-container: '#003919'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb694'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7b2f00'
  secondary-fixed: '#d0e4ff'
  secondary-fixed-dim: '#9ccaff'
  on-secondary-fixed: '#001d35'
  on-secondary-fixed-variant: '#00497a'
  tertiary-fixed: '#6dfe9c'
  tertiary-fixed-dim: '#4de082'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005227'
  background: '#1d100a'
  on-background: '#f8ddd2'
  surface-variant: '#41312a'
typography:
  display-xl:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  container-margin: 24px
---

## Brand & Style
Peak Endurance is a high-performance sports science platform designed for elite athletes and serious competitors. The brand personality is **active, clear, and motivating**, blending technical precision with an energetic, "raceday" urgency.

The visual style is a hybrid of **Modern Corporate** and **Glassmorphism**. It utilizes a deep "midnight" foundation to reduce eye strain during high-intensity training review, layered with translucent "glass" surfaces and vibrant, high-contrast accents. The interface prioritizes data density and biometric visualization, using light-emitting (glow) effects to highlight critical physiological states and AI-driven insights.

## Colors
The palette is built on an ultra-dark background (`#0B0F14`) to allow performance data to "pop" with liturgical clarity.

- **Primary (Endurance Orange):** Used for critical actions, progress indicators, and active states. It carries a subtle outer glow to simulate high energy.
- **Secondary (Hydration Blue):** Used for supplemental data like nutrition (carbs) and secondary metrics.
- **Tertiary (Recovery Green):** Signifies readiness, health, and positive trends (CTL growth).
- **Glass System:** Surfaces are not solid colors but layers of low-opacity white or orange with heavy backdrop blurs (10px+), creating a sophisticated, multi-dimensional depth.

## Typography
The system uses a dual-type approach. **Lexend** is the primary "Athletic" face, chosen for its high readability and geometric strength in headlines and large numerical displays. **Inter** provides a utilitarian, neutral companion for dense technical data and UI controls.

Large numbers (Display XL) should always use Lexend with tight tracking to emphasize the "Power" metric aesthetic. Labels use a semi-bold Inter weight with increased letter-spacing for clarity at small sizes.

## Layout & Spacing
The layout follows a **Fluid Bento Grid** model. Content is organized into modular containers that adapt to a 12-column system on desktop. 

- **Gutter:** A consistent 16px (md) or 24px (lg) gap between modules.
- **Inner Padding:** Standardized at 24px (lg) for glass cards to maintain an airy, premium feel despite high data density.
- **Sidebar:** A fixed 256px (64 units) navigation rail that collapses to 64px on smaller viewports.
- **Alignment:** All data points within modules should align to a vertical rhythm based on the 4px base unit.

## Elevation & Depth
Depth is achieved through **Glassmorphism and Tonal Gradients** rather than traditional shadows.

1.  **Level 0 (Base):** Solid `#0B0F14` background.
2.  **Level 1 (Modules):** `rgba(255, 255, 255, 0.03)` with a `10px` backdrop-blur and a `1px` white border at `10%` opacity.
3.  **Level 2 (Active/AI):** A linear gradient overlay using the primary color (`#FF6A00`) at `10%` opacity, indicating elevated importance or "AI Intelligence."
4.  **Floating Elements:** Navbars and sticky headers use `80%` background opacity with `blur-lg` to create a sense of being suspended over the scrollable canvas.

## Shapes
The shape language is **Soft-Rounded**. 

- **Standard Cards:** 0.75rem (rounded-xl) to 1rem for large containers.
- **Buttons & Chips:** 0.5rem (rounded-lg) to maintain a modern, "tool-like" feel.
- **Full Round:** Used exclusively for user avatars, status pips (active indicators), and progress track ends.
- **Active Indicators:** Sidebar active states use a "destructive" vertical bar (4px width) on the left edge to anchor the selection.

## Components
- **Primary Buttons:** Gradient backgrounds (`from-primary-container to-orange-700`) with white text and a subtle orange drop-shadow (`shadow-orange-500/20`).
- **Glass Cards:** The "Bento" unit. Must have a 1px border (`white/10`) and backdrop-blur. 
- **Data Visuals:** Progress rings should use high-contrast primary colors against a `white/10` track. Bar charts use the primary color for "peak" values and `white/10` for baseline/historical data.
- **Navigation:** Vertical rail with high-contrast active states (Primary Orange) and low-contrast inactive states (Gray-400).
- **AI Components:** Distinguished by a "breathing" pulse animation and a specific orange-tinted glass effect (`ai-glass-card`).
- **Status Badges:** Small, caps-heavy labels with low-opacity background fills matching the semantic color of the status (e.g., Primary for "Priority A").