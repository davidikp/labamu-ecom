// labamu-tailwind-config.ts
// ============================================================
// Extend your tailwind.config.ts with this theme block.
// All Labamu CSS custom properties (--lb-*) are mapped to
// named Tailwind utilities so components can use clean class
// names instead of arbitrary bg-[var(--lb-brand)] syntax.
//
// USAGE:
//   bg-lb-brand            → background: var(--lb-brand)
//   text-lb-on-surface     → color: var(--lb-on-surface)
//   border-lb-line-1       → border-color: var(--lb-line-1)
//   rounded-lb-btn         → border-radius: var(--lb-r-btn)
//   shadow-lb              → box-shadow: var(--lb-shadow)
//   font-lb                → font-family: var(--lb-font)
//   font-lb-regular        → font-weight: var(--lb-fw-regular)
//   font-lb-bold           → font-weight: var(--lb-fw-bold)
//
// SETUP: merge this into your tailwind.config.ts:
//   import { labamuTheme } from './labamu-tailwind-config'
//   export default { ..., theme: { extend: labamuTheme } }
// ============================================================

export const labamuTheme = {
  colors: {
    // Surfaces
    "lb-bg": "var(--lb-bg)",
    "lb-surface": "var(--lb-surface)",
    "lb-surface-grey": "var(--lb-surface-grey)",
    "lb-surface-grey-dark": "var(--lb-surface-grey-dark)",

    // On-surface (text / icon colors)
    "lb-on-surface": "var(--lb-on-surface)",
    "lb-on-surface-2": "var(--lb-on-surface-2)",
    "lb-on-surface-3": "var(--lb-on-surface-3)",
    "lb-on-surface-rev": "var(--lb-on-surface-rev)",
    "lb-on-surface-blue": "var(--lb-on-surface-blue)",

    // Lines / borders
    "lb-line-1": "var(--lb-line-1)",
    "lb-line-2": "var(--lb-line-2)",

    // Brand
    "lb-brand": "var(--lb-brand)",
    "lb-brand-on": "var(--lb-brand-on)",
    "lb-brand-light": "var(--lb-brand-light)",
    "lb-brand-dark": "var(--lb-brand-dark)",
    "lb-brand-hover": "var(--lb-brand-hover)",

    // Status — solid
    "lb-green": "var(--lb-green)",
    "lb-yellow": "var(--lb-yellow)",
    "lb-orange": "var(--lb-orange)",
    "lb-red": "var(--lb-red)",
    "lb-grey": "var(--lb-grey)",

    // Status — container (bg)
    "lb-green-bg": "var(--lb-green-bg)",
    "lb-yellow-bg": "var(--lb-yellow-bg)",
    "lb-orange-bg": "var(--lb-orange-bg)",
    "lb-red-bg": "var(--lb-red-bg)",
    "lb-grey-bg": "var(--lb-grey-bg)",

    // Status — text
    "lb-green-text": "var(--lb-green-text)",
    "lb-yellow-text": "var(--lb-yellow-text)",
    "lb-orange-text": "var(--lb-orange-text)",
    "lb-red-text": "var(--lb-red-text)",
    "lb-grey-text": "var(--lb-grey-text)",
  },

  borderRadius: {
    "lb-btn": "var(--lb-r-btn)", // 12px — large buttons, modals
    "lb-card": "var(--lb-r-card)", // 12px — cards
    "lb-input": "var(--lb-r-input)", // 10px — text fields, dropdowns
    "lb-sm": "var(--lb-r-sm)", // 8px  — small buttons, chips, icon btns
    "lb-xs": "var(--lb-r-xs)", // 4px  — badges
    "lb-pill": "var(--lb-r-pill)", // 100px — chips, toggles, badges
  },

  boxShadow: {
    "lb": "var(--lb-shadow)",
    "lb-filter": "4px 4px 12px 0px rgba(0,0,0,0.12)",
    "lb-sticky-col": "-3px 0 6px -1px rgba(0,0,0,0.07)",
  },

  fontFamily: {
    "lb": "var(--lb-font)",
  },

  fontWeight: {
    "lb-regular": "var(--lb-fw-regular)", // 400
    "lb-semibold": "var(--lb-fw-semibold)", // 600
    "lb-bold": "var(--lb-fw-bold)", // 700
  },

  keyframes: {
    // Snackbar entrance — slide up + fade in (mobile, bottom-center)
    "lb-snack-in": {
      from: { opacity: "0", transform: "translateX(-50%) translateY(8px)" },
      to: { opacity: "1", transform: "translateX(-50%) translateY(0)" },
    },
    // Snackbar exit — slide down + fade out (mobile, bottom-center)
    "lb-snack-out": {
      from: { opacity: "1", transform: "translateX(-50%) translateY(0)" },
      to: { opacity: "0", transform: "translateX(-50%) translateY(8px)" },
    },
    // Snackbar entrance — slide from right + fade in (desktop, top-right)
    "lb-snack-in-tr": {
      from: { opacity: "0", transform: "translateX(24px)" },
      to: { opacity: "1", transform: "translateX(0)" },
    },
    // Snackbar exit — slide to right + fade out (desktop, top-right)
    "lb-snack-out-tr": {
      from: { opacity: "1", transform: "translateX(0)" },
      to: { opacity: "0", transform: "translateX(24px)" },
    },
  },

  animation: {
    "lb-snack-in":     "lb-snack-in 0.25s ease forwards",
    "lb-snack-out":    "lb-snack-out 0.25s ease forwards",
    "lb-snack-in-tr":  "lb-snack-in-tr 0.25s ease forwards",
    "lb-snack-out-tr": "lb-snack-out-tr 0.25s ease forwards",
  },
} as const;
