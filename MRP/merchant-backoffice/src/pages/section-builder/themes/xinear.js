import { validateTheme } from './tokenSchema';

/**
 * @module section-builder/themes/xinear
 * @description "Xinear" storefront theme — the first concrete theme
 * definition for the multi-theme storefront system. Values extracted from
 * the validated Xinear + Medic Figma tokens.
 */
export const xinearTheme = {
  id: 'xinear',
  name: 'Xinear',
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
    surface1: '#ffffff', surface2: '#ffffff', surface3: '#ffffff', surface4: '#ffffff', surface5: '#ffffff', surface6: '#e8e8e8', surface7: '#f4f4f4', surface8: '#ffffff',
    outline1: '#e8e8e8', outline2: '#d1d1d0', outline3: '#e8e8e8', outline4: '#e8e8e8', outline5: '#d4d4d4',
    onSurface1: '#1b1916', onSurface1_70: '#1b1916b2', onSurface2: '#484744', onSurface3: '#a9a9a9', onSurface4: '#1b1916', onSurface5: '#20201e33', onSurface6: '#767573', onSurface7: '#767573', onSurface8: '#1b1916', onSurface8_60: '#1b191699', onSurface9: '#a9a9a9',
    primary1: '#20201e', primary1_60: '#20201e99', primary1_10: '#20201e1a', primary2: '#ffffff', secondary: '#20201e', onPrimary: '#ffffff', onPrimary2: '#20201e', hover: '#5e5e5d',
    alertDanger: '#d0021b', alertDangerContainer: '#f6ccd1', alertWarning: '#ff9100', alertWarningContainer: '#ffe9cc', alertSuccess: '#54a73f', alertSuccessContainer: '#ddedd9',
    otherRating: '#f2ce17', otherBlack: '#1b1916', otherWhite: '#ffffff', otherDarkGrey: '#484744', otherOutline: '#ffffff52', otherPlaceholder: '#ffffffa3', otherBackground: '#0000001a',
  },
  dark: {
    background: '#1b1916', backgroundPopUp: '#20201e', backgroundImage: '#20201e4d',
    surface1: '#1b1916', surface2: '#333333', surface3: '#ffffff', surface4: '#1b1916', surface5: '#262522', surface6: '#898886', surface7: '#262522', surface8: '#333333',
    outline1: '#333333', outline2: '#575757', outline3: '#333333', outline4: '#333333', outline5: '#333333',
    onSurface1: '#ffffff', onSurface1_70: '#ffffffb2', onSurface2: '#d4d4d4', onSurface3: '#a9a9a9', onSurface4: '#ffffff', onSurface5: '#ffffff33', onSurface6: '#a9a9a9', onSurface7: '#eeeeee', onSurface8: '#ffffff', onSurface8_60: '#ffffff99', onSurface9: '#a9a9a9',
    primary1: '#ffffff', primary1_60: '#ffffff99', primary1_10: '#ffffff1a', primary2: '#ffffff', secondary: '#ffffff', onPrimary: '#333333', onPrimary2: '#20201e', hover: '#a4a3a2',
    alertDanger: '#e36776', alertDangerContainer: '#f6ccd1', alertWarning: '#ffa733', alertWarningContainer: '#695e4f', alertSuccess: '#76b965', alertSuccessContainer: '#ddedd9',
    otherRating: '#f2ce17', otherBlack: '#1b1916', otherWhite: '#ffffff', otherDarkGrey: '#484744', otherOutline: '#ffffff52', otherPlaceholder: '#ffffffa3', otherBackground: '#0000001a',
  },
};

// Dev-time sanity check — throws loudly if this definition ever drifts from
// the canonical schema (e.g. a slot dropped by mistake during editing).
validateTheme(xinearTheme);
