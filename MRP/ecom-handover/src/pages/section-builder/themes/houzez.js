import { validateTheme } from './tokenSchema';

/**
 * @module section-builder/themes/houzez
 * @description "Houzez" storefront theme — real-estate/construction-supply
 * identity. Values extracted from the Houzez Figma tokens (Labamu
 * E-Commerce MVP 2, node 81:71854 light / 81:72885 dark). Slots not present
 * in the Figma variable export for this node (backgroundPopUp, primary1_10,
 * onPrimary2, otherOutline, otherPlaceholder, otherBackground) fall back to
 * the same generic values xinear.js uses for those slots — they read as
 * theme-independent overlay/placeholder utilities rather than brand color.
 */
export const houzezTheme = {
  id: 'houzez',
  name: 'Houzez',
  typography: {
    heading: { fontFamily: 'Lato', fontWeight: 700 },
    body: { fontFamily: 'Lato', fontWeight: 400 },
  },
  shape: {
    radiusSm: '4px',
    radiusMd: '8px',
    radiusLg: '16px',
    shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
    shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  },
  light: {
    background: '#ffffff', backgroundPopUp: '#ffffff', backgroundImage: '#20201e4d',
    surface1: '#ffffff', surface2: '#e8f6ef', surface3: '#ffffff', surface4: '#ffffff', surface5: '#ffffff', surface6: '#e8e8e8', surface7: '#f4f4f4', surface8: '#ffffff',
    outline1: '#e8e8e8', outline2: '#d1d1d0', outline3: '#d1d1d0', outline4: '#e9e9e9', outline5: '#d4d4d4',
    onSurface1: '#1b1916', onSurface1_70: '#1b1916b2', onSurface2: '#484744', onSurface3: '#a9a9a9', onSurface4: '#1b1916', onSurface5: '#20201e33', onSurface6: '#767573', onSurface7: '#767573', onSurface8: '#16894b', onSurface8_60: '#16894b99', onSurface9: '#a9a9a9',
    primary1: '#16894b', primary1_60: '#16894b99', primary1_10: '#16894b1a', primary2: '#16894b', secondary: '#16894b', onPrimary: '#ffffff', onPrimary2: '#1b1916', hover: '#51a276',
    alertDanger: '#d0021b', alertDangerContainer: '#f6ccd1', alertWarning: '#ff9100', alertWarningContainer: '#ffe9cc', alertSuccess: '#54a73f', alertSuccessContainer: '#ddedd9',
    otherRating: '#f2ce17', otherBlack: '#1b1916', otherWhite: '#ffffff', otherDarkGrey: '#484744', otherOutline: '#ffffff52', otherPlaceholder: '#ffffffa3', otherBackground: '#0000001a',
  },
  dark: {
    background: '#1b1916', backgroundPopUp: '#20201e', backgroundImage: '#20201e4d',
    surface1: '#262522', surface2: '#262522', surface3: '#ffffff', surface4: '#333333', surface5: '#262522', surface6: '#898886', surface7: '#262522', surface8: '#333333',
    outline1: '#333333', outline2: '#575757', outline3: '#262522', outline4: '#333333', outline5: '#262522',
    onSurface1: '#ffffff', onSurface1_70: '#ffffffb2', onSurface2: '#e9e9e9', onSurface3: '#a9a9a9', onSurface4: '#ffffff', onSurface5: '#ffffff33', onSurface6: '#a9a9a9', onSurface7: '#eeeeee', onSurface8: '#ffffff', onSurface8_60: '#ffffff99', onSurface9: '#a9a9a9',
    primary1: '#41ad73', primary1_60: '#41ad7399', primary1_10: '#41ad731a', primary2: '#16894b', secondary: '#41ad73', onPrimary: '#ffffff', onPrimary2: '#1b1916', hover: '#32724e',
    alertDanger: '#e36776', alertDangerContainer: '#f6ccd1', alertWarning: '#ffa733', alertWarningContainer: '#695e4f', alertSuccess: '#76b965', alertSuccessContainer: '#ddedd9',
    otherRating: '#f2ce17', otherBlack: '#1b1916', otherWhite: '#ffffff', otherDarkGrey: '#484744', otherOutline: '#ffffff52', otherPlaceholder: '#ffffffa3', otherBackground: '#0000001a',
  },
};

// Dev-time sanity check — throws loudly if this definition ever drifts from
// the canonical schema (e.g. a slot dropped by mistake during editing).
validateTheme(houzezTheme);
