# UI Audit — Peak Endurance Landing Page (Vercel Web Design Guidelines)

**Date:** 23 Junio 2026
**Target:** https://peak-endurance.vercel.app
**Guidelines:** Vercel Web Design Guidelines (100+ rules, 7 categories)

---

## 1. Accessibility

| # | Rule | Status | Location | Evidence / Fix |
|---|------|--------|----------|----------------|
| 1.1 | Semantic HTML (nav, main, button) | ✅ PASS | Landing.tsx | `<nav>`, `<header>`, `<footer>`, `<button>` used correctly |
| 1.2 | Interactive elements have accessible names | ⚠️ FAIL | Landing.tsx: hero-gallery divs | `aria-hidden="true"` on gallery divs is correct, but the crossfade images need `role="img"` and `aria-label` describing the sport |
| 1.3 | Images have alt text | ✅ PASS | Landing.tsx | Gallery uses `background-image` (CSS), no `<img>` tags without alt |
| 1.4 | aria-expanded on toggles | ⚠️ FAIL | TopBar.tsx | Search modal toggle lacks `aria-expanded` |
| 1.5 | Heading hierarchy (h1→h2→h3) | ✅ PASS | Landing.tsx | H1 in hero, H2 in sections, H3 in feature cards — correct order |
| 1.6 | Skip to content link | ❌ FAIL | — | No skip navigation link present for keyboard users |

## 2. Focus States

| # | Rule | Status | Location | Evidence / Fix |
|---|------|--------|----------|----------------|
| 2.1 | Visible focus indicator on all elements | ⚠️ FAIL | index.css | `.btn-primary`, `.btn-secondary`, `.pricing-btn` have `:hover` but no `:focus-visible` styles |
| 2.2 | Uses `:focus-visible` not `:focus` | ❌ FAIL | index.css | No `:focus-visible` selectors found in landing CSS. Uses older `:focus` patterns |
| 2.3 | Never `outline: none` without replacement | ✅ PASS | index.css | No raw `outline: none` without replacement |
| 2.4 | Focus ring ≥ 2px offset/thickness | ❌ FAIL | index.css | No focus ring defined for any landing element |

## 3. Forms

| # | Rule | Status | Location | Evidence / Fix |
|---|------|--------|----------|----------------|
| 3.1 | Inputs have associated labels | ✅ PASS | AuthScreen.tsx | Email/password have `<LabelText>` with correct refs |
| 3.2 | Use `inputMode` for numeric inputs | ❌ FAIL | AiCoach.tsx, Dashboard.tsx | AI coach text input and suggestion chips lack proper inputMode |
| 3.3 | Use `autoComplete` on fields | ⚠️ FAIL | AuthScreen.tsx | Email field should have `autoComplete="email"`, password should have `autoComplete="current-password"` |
| 3.4 | Inline validation errors | ✅ PASS | AuthScreen.tsx | Shows inline error messages |
| 3.5 | Disable submit while submitting | ✅ PASS | AuthScreen.tsx | Button shows loading state |

## 4. Animation

| # | Rule | Status | Location | Evidence / Fix |
|---|------|--------|----------|----------------|
| 4.1 | Respect `prefers-reduced-motion` | ✅ PASS | index.css | 11 `prefers-reduced-motion` guards found for hero gallery, scroll, badge bounce, RGB rotate |
| 4.2 | Use `will-change` sparingly | ⚠️ FAIL | index.css | `.reveal`, `.reveal-left`, `.reveal-right` all use `will-change: opacity, transform` — 6 elements total, acceptable |
| 4.3 | Animation duration 200-500ms | ✅ PASS | index.css | Framer Motion uses 0.3-0.7s easings, CSS transitions use 0.2-0.3s |
| 4.4 | Avoid animating `top`/`left` | ✅ PASS | index.css | All animations use `transform` and `opacity`, never `top`/`left` |

## 5. Typography

| # | Rule | Status | Location | Evidence / Fix |
|---|------|--------|----------|----------------|
| 5.1 | Curly quotes (“ ”) not straight | ❌ FAIL | i18n.ts, Landing.tsx | All Spanish text uses straight quotes `" "` instead of curly `""`. Detected in: i18n strings for heroSubtitleV2, feature descriptions |
| 5.2 | `tabular-nums` for data | ⚠️ FAIL | index.css | Metric values (CTL, ATL, TSB) don't have `font-variant-numeric: tabular-nums` — numbers shift width as they change |
| 5.3 | Line height 1.5 body, 1.2 headings | ✅ PASS | index.css | Body uses 1.6, headings use 1.05-1.2 — correct |
| 5.4 | Max line length 60-75 chars | ✅ PASS | Hero | Hero content max-width 760px with appropriate font size |

## 6. Images & Media

| # | Rule | Status | Location | Evidence / Fix |
|---|------|--------|----------|----------------|
| 6.1 | Explicit width/height on images | ✅ PASS | Landing.tsx | Gallery uses CSS `background-image` (no img tags), social proof logos are SVGs with viewBox |
| 6.2 | `loading="lazy"` on below-fold | N/A | — | No `<img>` tags on landing page |
| 6.3 | Use `<picture>` with WebP/AVIF | N/A | — | Gallery uses CSS background-image from external URLs |
| 6.4 | `preconnect` for third-party origins | ❌ FAIL | index.html | No `<link rel="preconnect">` for Unsplash, fal.media, or Google Fonts origins |

## 7. Performance

| # | Rule | Status | Location | Evidence / Fix |
|---|------|--------|----------|----------------|
| 7.1 | Virtualize long lists | N/A | — | No long lists on landing page |
| 7.2 | Avoid layout thrashing | ✅ PASS | — | No read-write cycles detected |
| 7.3 | `content-visibility: auto` on off-screen | ❌ FAIL | index.css | No `content-visibility: auto` on below-fold sections (features, pricing, etc.) |
| 7.4 | Lazy load below-fold content | ✅ PASS | Framer Motion | Sections use `whileInView` with `viewport={{ once: true }}` |
| 7.5 | Preconnect critical origins | ❌ FAIL | index.html | Missing preconnect for: `https://fonts.googleapis.com`, `https://v3b.fal.media`, `https://images.unsplash.com` |

---

## Summary

| Category | Pass | Fail | Notes |
|----------|------|------|-------|
| Accessibility | 4 | 2 | Missing skip link, missing aria-expanded on toggle |
| Focus States | 1 | 3 | No `:focus-visible` anywhere, no focus rings defined |
| Forms | 3 | 2 | Missing autoComplete, inputMode |
| Animation | 3 | 1 | Good `prefers-reduced-motion` coverage |
| Typography | 2 | 2 | Straight quotes, missing tabular-nums |
| Images & Media | 1 | 1 | Missing preconnect hints |
| Performance | 2 | 2 | Missing content-visibility, preconnect |

**Total: 16 Pass / 13 Fail**

## Critical Fixes (Priority Order)

1. 🔴 Add `:focus-visible` styles to all interactive elements (buttons, links, nav items)
2. 🔴 Add `<link rel="preconnect">` for Google Fonts, fal.media, Unsplash in index.html
3. 🟠 Add `content-visibility: auto` to below-fold sections (features, pricing, how-it-works)
4. 🟠 Add skip-to-content link for keyboard users
5. 🟠 Replace straight quotes with curly quotes in all Spanish text
6. 🟡 Add `font-variant-numeric: tabular-nums` to metric values
7. 🟡 Add `autoComplete` attributes to auth form fields
8. 🟡 Add `aria-expanded` to search modal toggle
