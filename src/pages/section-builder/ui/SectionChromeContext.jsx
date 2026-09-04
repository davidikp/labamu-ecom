import { createContext, useContext } from 'react';

/**
 * @module section-builder/ui/SectionChromeContext
 * @description Phase 2 of the Easyblocks-inspired styling work. SectionShell
 * already resolves the shared chrome fields (color_scheme -> background/text,
 * padding) once per section — this exposes that *resolved* value to whatever
 * Renderer it wraps, so a Renderer that needs the actual color (not just to
 * have it applied as CSS on the wrapping div) doesn't independently import
 * `resolveSectionScheme` and recompute it a second time.
 *
 * Before this existed, `newsletter_signup/Renderer.jsx` was the one place
 * doing that double resolution (it needs `background` as a value, to pick a
 * contrasting button text color) — that's now the reference consumer of
 * `useSectionChrome()`. New Renderers needing the resolved scheme should use
 * this instead of importing sectionChrome.js's resolver directly.
 */
const SectionChromeContext = createContext({ background: undefined, text: undefined });

export const SectionChromeProvider = SectionChromeContext.Provider;

/** @returns {{ background?: string, text?: string }} the enclosing SectionShell's resolved color scheme. */
export function useSectionChrome() {
  return useContext(SectionChromeContext);
}
