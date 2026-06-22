/**
 * AMOLED ambient background with slow lava-lamp-style light blobs.
 *
 * Pure CSS, no JS. Three blurred radial-gradient blobs drift independently
 * across the parent container. The parent must be `position: relative` and
 * `overflow: hidden` (we set those defensively on the wrapper itself).
 *
 * Drop this as the FIRST child of any full-screen container that wants the
 * AMOLED feel:
 *
 *   <section className="onboarding-shell">
 *     <LavaBackground />
 *     ... content ...
 *   </section>
 *
 * Respects `prefers-reduced-motion`.
 */
export function LavaBackground() {
  return (
    <div className="lava-ambient" aria-hidden="true">
      <span className="lava-blob" />
    </div>
  )
}
