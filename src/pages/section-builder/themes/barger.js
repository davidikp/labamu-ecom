import { validateTheme } from './tokenSchema';

/**
 * @module section-builder/themes/barger
 * @description "Barger" storefront theme — fast-food/F&B identity built
 * around a monochrome black/white palette with flat, high-contrast
 * components. Values extracted from the Barger Figma tokens (Labamu
 * E-Commerce MVP 2, node 171:76095 light / 171:69357 dark) and the Barger
 * component set (node 165:84351, e.g. "Button - Barger" / "[New] Text Field
 * - Barger" for radius + Lato typography). Alert container slots
 * (`alertDangerContainer`/`alertWarningContainer`/`alertSuccessContainer`)
 * and the "Other" utility slots (`otherOutline`/`otherPlaceholder`/
 * `otherBackground`) aren't split by mode in the Figma source — both light
 * and dark reuse the same values, same as xinear.js/houzez.js do for their
 * theme-independent overlay utilities.
 */
export const bargerTheme = {
  id: 'barger',
  name: 'Barger',
  typography: {
    heading: { fontFamily: 'Lato', fontWeight: 700 },
    body: { fontFamily: 'Lato', fontWeight: 400 },
  },
  shape: {
    radiusSm: '10px',
    radiusMd: '12px',
    radiusLg: '16px',
    shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
    shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  },
  light: {
    background: '#f7f7f7', backgroundPopUp: '#ffffff', backgroundImage: '#20201e4d',
    surface1: '#f7f7f7', surface2: '#ffffff', surface3: '#e9e9e9', surface4: '#535353', surface5: '#ffffff', surface6: '#e8e8e8', surface7: '#e2e2e2', surface8: '#f7f7f7',
    outline1: '#e8e8e8', outline2: '#d1d1d0', outline3: '#e8e8e8', outline4: '#676767', outline5: '#d4d4d4',
    onSurface1: '#282828', onSurface1_70: '#282828b2', onSurface2: '#535353', onSurface3: '#a9a9a9', onSurface4: '#ffffff', onSurface5: '#20201e33', onSurface6: '#767573', onSurface7: '#767573', onSurface8: '#282828', onSurface8_60: '#28282899', onSurface9: '#a9a9a9',
    primary1: '#282828', primary1_60: '#28282899', primary1_10: '#2828281a', primary2: '#ffffff', secondary: '#20201e', onPrimary: '#ffffff', onPrimary2: '#20201e', hover: '#555452',
    alertDanger: '#d0021b', alertDangerContainer: '#f6ccd1', alertWarning: '#ff9100', alertWarningContainer: '#ffe9cc', alertSuccess: '#54a73f', alertSuccessContainer: '#ddedd9',
    otherRating: '#f2ce17', otherBlack: '#1b1916', otherWhite: '#ffffff', otherDarkGrey: '#484744', otherOutline: '#ffffff52', otherPlaceholder: '#ffffffa3', otherBackground: '#0000001a',
  },
  dark: {
    background: '#1b1916', backgroundPopUp: '#1b1916', backgroundImage: '#20201e4d',
    surface1: '#1b1916', surface2: '#262522', surface3: '#262522', surface4: '#262522', surface5: '#ffffff', surface6: '#333333', surface7: '#262522', surface8: '#333333',
    outline1: '#333333', outline2: '#d1d1d0', outline3: '#262522', outline4: '#333333', outline5: '#333333',
    onSurface1: '#ffffff', onSurface1_70: '#ffffffb2', onSurface2: '#ffffff', onSurface3: '#a9a9a9', onSurface4: '#ffffff', onSurface5: '#20201e33', onSurface6: '#adadad', onSurface7: '#8f8e8c', onSurface8: '#ffffff', onSurface8_60: '#ffffff99', onSurface9: '#a9a9a9',
    primary1: '#ffffff', primary1_60: '#ffffff99', primary1_10: '#ffffff1a', primary2: '#ffffff', secondary: '#20201e', onPrimary: '#1b1916', onPrimary2: '#20201e', hover: '#bbbab9',
    alertDanger: '#e36776', alertDangerContainer: '#f6ccd1', alertWarning: '#ffa733', alertWarningContainer: '#ffe9cc', alertSuccess: '#76b965', alertSuccessContainer: '#ddedd9',
    otherRating: '#f2ce17', otherBlack: '#1b1916', otherWhite: '#ffffff', otherDarkGrey: '#484744', otherOutline: '#ffffff52', otherPlaceholder: '#ffffffa3', otherBackground: '#0000001a',
  },
};

// Dev-time sanity check — throws loudly if this definition ever drifts from
// the canonical schema (e.g. a slot dropped by mistake during editing).
validateTheme(bargerTheme);
