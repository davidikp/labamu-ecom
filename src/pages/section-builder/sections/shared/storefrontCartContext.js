import { createContext, useContext } from 'react';

/**
 * @module section-builder/sections/shared/storefrontCartContext
 * @description Plain context object + reader hook, split out of
 * storefrontCart.jsx so that file can export only its `StorefrontCartProvider`
 * component (react-refresh/only-export-components).
 */
export const StorefrontCartContext = createContext(null);

/**
 * Reads the nearest StorefrontCartProvider's state. Returns a safe no-op
 * shape (`{ items: [], count: 0, addItem: () => {} }`) when rendered
 * outside a provider (e.g. the interactive builder canvas, which doesn't
 * mount one) instead of throwing — callers never need to guard.
 */
export function useStorefrontCart() {
  const ctx = useContext(StorefrontCartContext);
  return ctx ?? { items: [], count: 0, addItem: () => {} };
}
