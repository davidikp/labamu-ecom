/**
 * @module section-builder/themes/breakpoints
 * @description Canonical breakpoint set for the storefront canvas and any
 * per-field responsive values (Phase 0 of the Easyblocks-inspired responsive
 * work). Five device presets — mobile/tablet/desktop/largeDesktop/fit —
 * mirroring Easyblocks' device picker. `fit` has no fixed width: it means
 * "stretch to the canvas panel's actual width" rather than a device size, so
 * it resolves to the base/inherited value of any responsive field rather
 * than introducing its own override tier.
 */
export const BREAKPOINTS = {
  mobile: { id: 'mobile', width: 390, label: 'Mobile' },
  tablet: { id: 'tablet', width: 768, label: 'Tablet' },
  desktop: { id: 'desktop', width: 1280, label: 'Desktop' },
  largeDesktop: { id: 'largeDesktop', width: 1600, label: 'Large desktop' },
  fit: { id: 'fit', width: null, label: 'Fit screen' },
};

/** Narrowest to widest — the order responsive-value resolution walks. */
export const BREAKPOINT_ORDER = ['mobile', 'tablet', 'desktop', 'largeDesktop', 'fit'];

export const DEFAULT_BREAKPOINT = 'desktop';
