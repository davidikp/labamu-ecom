# Labamu Design System

Source: [Labamu Library - Typography](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=3-10516&t=FAeEIp6fozPOSFtH-1)

Last extracted: 2026-04-01

## Purpose

This document captures the Labamu design system in a reusable Markdown format so it can be referenced when generating new product prototypes, UI explorations, and implementation-ready specs.

Current coverage includes typography, color palettes, spacing, responsive layout foundations, and radius values.

## Typography Overview

Labamu typography primarily uses `Lato` for product UI copy and structured content, with `Inter` reserved for display-scale text and a compact emphasized label style.

### Core Typography Rules

- Use `Lato` as the default font family for product text.
- Use `Inter` only for display-scale headings or the compact bold label token where explicitly specified.
- Use `Neutral/900` (`#171717`) for primary text.
- Use `Neutral/500` (`#737373`) for supporting or secondary text.
- Use `Neutral/400` (`#A3A3A3`) for low-emphasis text such as navigation or page context labels.
- Preserve the very tight tracking only on the `Display` style.
- Keep title hierarchy bold and subtitle/body hierarchy regular unless a token explicitly defines another weight.

## Typography Tokens

### Display

| Token | Font Family | Weight | Size | Line Height | Letter Spacing | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `Display/Bold/Large` | Inter | 700 | 52px | 56px | -2px | Reserved for large page or hero-style headings |

### Title

| Token | Font Family | Weight | Size | Line Height | Letter Spacing | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `Title/Large Title, Bold 26` | Lato | 700 | 26px | 38px | 0.18px | Highest standard content title |
| `Title/Big Title, Bold 24` | Lato | 700 | 24px | 34px | 0.14px | Secondary large title |
| `Title/Headline, Bold 20` | Lato | 700 | 20px | 30px | 0.14px | Prominent section headline |
| `Title/Title 1, Bold 18` | Lato | 700 | 18px | 26px | 0.12px | Section title |
| `Title/Title 2, Bold 16` | Lato | 700 | 16px | 22px | 0.11px | Compact title |
| `Title/Title 3, Bold 14` | Lato | 700 | 14px | 20px | 0.10px | Small title or emphasized label-like heading |

### Subtitle

| Token | Font Family | Weight | Size | Line Height | Letter Spacing | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `Subtitle/Subtitle 1, Regular 16` | Lato | 400 | 16px | 22px | 0.11px | Default subtitle or supporting heading |
| `Subtitle/Subtitle 2, Regular 14` | Lato | 400 | 14px | 20px | 0.10px | Compact subtitle |

### Body

| Token | Font Family | Weight | Size | Line Height | Letter Spacing | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `Body/Body 1, Regular 12` | Lato | 400 | 12px | 18px | 0.08px | Default body copy |
| `Body/Body 1, Bold 12` | Lato | 600 | 12px | 18px | 0.08px | Emphasized inline body text |
| `Body/Body 1, Italic 12` | Lato | 400 Italic | 12px | 18px | 0.08px | Notes, quotes, or light emphasis |

### Description / Label

| Token | Font Family | Weight | Size | Line Height | Letter Spacing | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `Description/Description 1, Regular 10` | Lato | 400 | 10px | 16px | 0.07px | Microcopy, helper text, small metadata |
| `Description/Description, Bold 10` | Inter | 600 | 10px | See note | See note | Compact emphasized label style |

## Supporting Color Tokens Used On Typography Sheet

These are not the complete color system, but they are the color tokens visible in the typography source and should be preserved when recreating the sheet or using the same text roles.

| Token | Value | Usage |
| --- | --- | --- |
| `Neutral/900` | `#171717` | Primary text |
| `Neutral/500` | `#737373` | Supporting text |
| `Neutral/400` | `#A3A3A3` | Muted contextual text |
| `Neutral/200` | `#E5E5E5` | Dividers |
| `Neutral/50` | `#FAFAFA` | Soft background |
| `Neutral Shade/Neutral 10` | `#E9E9E9` | Card borders |

## Recommended Usage In Prototypes

- Use `Display/Bold/Large` for high-impact page titles only.
- Use `Title/Large Title` through `Title/Title 3` for page sections, cards, and content hierarchy.
- Use `Subtitle` tokens for secondary headings, descriptive labels, and structured supporting text.
- Use `Body/Body 1, Regular 12` as the default paragraph style when the interface is dense and compact.
- Use `Body/Body 1, Bold 12` for emphasis inside body copy instead of switching to a title token.
- Use `Description` tokens for captions, input hints, metadata, tags, and tight UI labels.

## AI Interpretation Notes

- Treat the title scale as the main UI hierarchy.
- Treat subtitle and body tokens as the default content system for forms, lists, tables, and cards.
- Do not replace `Lato` with `Inter` globally. The font pairing appears intentional.
- When generating new screens, default to `Neutral/900` for text and only step down to `Neutral/500` or `Neutral/400` when the content is secondary.

## Open Notes

- The typography board shows a small inconsistency for `Description/Description, Bold 10`.
- The variable definition says `Inter`, `Semi Bold`, `10px`, `lineHeight: 100`, `letterSpacing: 0`.
- The visible annotation on the board says `Line Height: 16` and `Letter Spacing: 0.07px`.
- Until this is clarified in Figma, treat the on-canvas annotation as the intended design spec for layout, and keep `Inter 600 10px` as the intended font treatment.

## Color Overview

Sources:

- Main Colors: [Labamu Library - Colors](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=211-5828&t=FAeEIp6fozPOSFtH-1)
- Feature Colors: [Labamu Library - Colors / Features](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=211-7125&t=FAeEIp6fozPOSFtH-1)

The Labamu color system is organized into four layers:

- Neutral foundation for backgrounds, surfaces, text, and borders
- Status colors for semantic system states
- Membership colors for tiered product plans
- Feature colors for module-level accents and feature identity

### Core Color Rules

- Use neutral tokens as the default UI foundation.
- Use `Neutral/Background` for page backgrounds, not card backgrounds.
- Use `Neutral/Surface/*` for cards, secondary panels, and contained surfaces.
- Use `Neutral/OnSurface/*` for text and icons placed on surface layers.
- Use `Status/*` only for semantic states such as success, warning, danger, muted, and status badges.
- Use `Membership/*` only for membership tiers or subscription-related UI.
- Use `Feature/*` to give each product area or feature family a distinct accent color.
- Prefer one feature family per screen or module instead of mixing many feature palettes in the same local area.

## Color Tokens

### Neutral Foundation

#### Background

| Token | Value | Usage |
| --- | --- | --- |
| `Neutral/Background` | `#F5F5F7` | Pure page background, not cards |

#### Surface

| Token | Value | Usage |
| --- | --- | --- |
| `Neutral/Surface/Primary` | `#FFFFFF` | Primary card or panel surface |
| `Neutral/Surface/GreyLighter` | `#F4F4F4` | Soft secondary surface |
| `Neutral/Surface/GreyDarker` | `#E9E9E9` | Stronger muted surface |
| `Neutral/Surface/Reverse` | `#7E7E7E` | Reverse or dark-muted surface |

#### On Surface

| Token | Value | Usage |
| --- | --- | --- |
| `Neutral/OnSurface/Primary` | `#282828` | Primary text and icons on light surfaces |
| `Neutral/OnSurface/Secondary` | `#7E7E7E` | Secondary text |
| `Neutral/OnSurface/Tertiary` | `#A9A9A9` | Low-emphasis text |
| `Neutral/OnSurface/Reverse` | `#FFFFFF` | Text on dark or reverse surfaces |
| `Neutral/OnSurface/Blue` | `#006BFF` | Links or highlighted interactive text |

#### Line

| Token | Value | Usage |
| --- | --- | --- |
| `Neutral/Line/Outline` | `#E9E9E9` | Default outline and subtle border |
| `Neutral/Line/Separator 1` | `#E9E9E9` | Primary divider |
| `Neutral/Line/Separator 2` | `#D4D4D4` | Stronger divider |
| `Neutral/Line/Scroller` | `#E9E9E9` | Scroll handle or thin rail |

### Status Colors

| Group | Primary | On Primary | Container | On Container | Usage |
| --- | --- | --- | --- | --- | --- |
| `Status/Grey/*` | `#A9A9A9` | `#FFFFFF` | `#E9E9E9` | `#535353` | Neutral status, inactive, muted state |
| `Status/Green/*` | `#54A73F` | `#FFFFFF` | `#EEF6EC` | `#52A33E` | Success, positive outcome, healthy state |
| `Status/Yellow/*` | `#F2CE17` | `#FFFFFF` | `#FEFAE8` | `#E0B20C` | Warning, caution, pending attention |
| `Status/Orange/*` | `#FF9100` | `#FFFFFF` | `#FFF4E6` | `#E07F00` | Alert, active warning, urgent attention |
| `Status/Red/*` | `#D0021B` | `#FFFFFF` | `#FAE6E8` | `#D0021B` | Error, destructive state, failure |

### Membership Colors

| Tier | Main | Container | Usage |
| --- | --- | --- | --- |
| `Membership/Basic/*` | `#006BFF` | `#E6F0FF` | Basic membership visuals |
| `Membership/Premium/*` | `#C3992B` | `#F9F5EA` | Premium membership visuals |
| `Membership/Pro/*` | `#3F44A7` | `#ECECF6` | Pro membership visuals |

### Feature Colors

Feature colors create a visual identity for each product area or module. The `Brand` family has the most complete set. Other feature families currently behave like a four-token system in the variables, even though the board labels use `ContainerDarker` and `ContainerLighter`.

| Family | Primary | On Primary | Container | On Container / Accent | Additional Token | Usage |
| --- | --- | --- | --- | --- | --- | --- |
| `Feature/Brand/*` | `#006BFF` | `#FFFFFF` | `#E6F0FF` | `#005DE0` | `ContainerLighter: #F3F7FE` | Shared brand-level accent system |
| `Feature/Cashier/*` | `#26C3BB` | `#FFFFFF` | `#E9F9F8` | `#22AAA4` | None | Cashier module |
| `Feature/Invoice/*` | `#FF9100` | `#FFFFFF` | `#FFF4E6` | `#E07F00` | None | Invoice module |
| `Feature/Product/*` | `#782AAE` | `#FFFFFF` | `#F2EAF7` | `#652494` | None | Product module |
| `Feature/Customer/*` | `#54A73F` | `#FFFFFF` | `#EEF6EC` | `#52A33E` | None | Customer module |
| `Feature/Ledger/*` | `#CCCB04` | `#FFFFFF` | `#FAFAE6` | `#B4B404` | None | Ledger module |
| `Feature/PPOB/*` | `#3F44A7` | `#FFFFFF` | `#ECECF6` | `#3E43A3` | None | PPOB module |

## Recommended Color Usage In Prototypes

- Default full-page backgrounds to `Neutral/Background`.
- Default cards, sheets, drawers, and content containers to `Neutral/Surface/Primary`.
- Use `Neutral/OnSurface/Primary` for the majority of text.
- Use `Neutral/OnSurface/Secondary` and `Neutral/OnSurface/Tertiary` to step down emphasis.
- Use `Neutral/Line/Outline` for borders unless a stronger divider is specifically needed.
- Use `Status/*/Container` plus `Status/*/OnContainer` for badges, pills, and subtle alerts.
- Use `Status/*/Primary` plus `Status/*/OnPrimary` for stronger callouts or status chips.
- Use `Feature/*` colors to theme icons, charts, tabs, headers, or module entry points.
- Avoid using feature colors as status signals unless the feature itself is the meaning.
- Keep membership colors limited to pricing, entitlement, and plan representation.

## Color Interpretation Notes

- The palette is mostly soft, surface-first, and intended for clean light-mode interfaces.
- Brand and feature accents are vivid, but the neutral base remains restrained.
- The system relies heavily on pale containers paired with stronger accent text or fills.
- `Neutral/OnSurface/Blue` and `Feature/Brand/Primary` both use the same blue family, so links and brand accents can feel aligned without inventing a new token.

## Color Open Notes

- The `Background` board uses the variable `Neutral/Background`, but the visible swatch label appears to read `Neutral/Surface/Primary`.
- For implementation and future prototype generation, treat `Neutral/Background` as the correct token name for `#F5F5F7`.
- The `Feature/Brand/*` board exposes five tones: `Primary`, `OnPrimary`, `ContainerLighter`, `ContainerDarker`, and `OnContainer`.
- The other feature rows show four swatches on the board, and their visible labels use `ContainerDarker` and `ContainerLighter`.
- In the variable definitions, those non-brand feature families are stored as `Primary`, `OnPrimary`, `Container`, and `OnContainer`.
- For implementation and future prompt reuse, prefer the variable names as the source of truth.
- `Status/Yellow/OnPrimary` appears on the board as white, but the exported variable list does not return it as a distinct token.
- Treat `Status/Yellow/OnPrimary` as `#FFFFFF`, likely reusing `Generic/White`.

## Spacing Overview

Source: [Labamu Library - Spacing](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=7-6028&t=FAeEIp6fozPOSFtH-1)

The Labamu spacing system is a `4px`-based scale. The `Name` column in the board maps to a numeric step, while the token column provides the canonical spacing token used by the design system.

### Core Spacing Rules

- Treat `4px` as the base spacing unit.
- Use the smaller range (`4px` to `16px`) for dense UI spacing, control padding, and tight vertical rhythm.
- Use the medium range (`20px` to `32px`) for card padding, grouped sections, and standard layout gaps.
- Use the large range (`40px` and above) for page sections, hero spacing, and major structural separation.
- Prefer spacing tokens from the system instead of inventing custom values.

## Spacing Tokens

| Step | Token | Size | Recommended Usage |
| --- | --- | --- | --- |
| `1` | `$spacing-xx-sm` | `4px` | Hairline spacing, icon offset, very tight micro gaps |
| `2` | `$spacing-x-sm` | `8px` | Tight padding, compact chip spacing, close icon-label gaps |
| `3` | `$spacing-sm` | `12px` | Compact component padding, mobile gutters inside cards |
| `4` | `$spacing-md` | `16px` | Default small component padding and list rhythm |
| `5` | `$spacing-big` | `20px` | Medium padding, desktop and mobile outer rhythm |
| `6` | `$spacing-x-big` | `24px` | Standard card padding, section grouping |
| `7` | `$spacing-xx-big` | `28px` | Larger internal grouping space |
| `8` | `$spacing-xxx-big` | `32px` | Standard block separation, large card padding |
| `10` | `$spacing-lg` | `40px` | Page section spacing, desktop layout padding |
| `12` | `$spacing-x-lg` | `48px` | Large section gap |
| `16` | `$spacing-xx-lg` | `64px` | Major container separation |
| `20` | `$spacing-xxx-lg` | `80px` | Hero or page-level spacing |
| `24` | `$spacing-huge` | `96px` | Large feature band spacing |
| `32` | `$spacing-x-huge` | `128px` | Very large structural spacing |
| `40` | `$spacing-xx-huge` | `160px` | Major layout offset or page opening space |
| `48` | `$spacing-xxx-huge` | `192px` | Rare extra-large spacing for dramatic separation |

## Spacing Usage Notes

- The scale follows a numeric step system where each step equals `4px`.
- The board exposes selected steps rather than every possible value.
- When generating new screens, stay on this scale even if a step is not explicitly shown on the board.

## Column And Breakpoint Overview

Source: [Labamu Library - Column & Breakpoint](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=7-6101&t=FAeEIp6fozPOSFtH-1)

The responsive layout system is defined across desktop, tablet, and mobile, with fixed column counts and explicitly labeled gutter and margin values.

### Responsive Grid Rules

- Use `12` columns on desktop layouts.
- Use `8` columns on tablet layouts.
- Use `4` columns on mobile layouts.
- Keep gutter width consistent at `20px` for desktop and tablet.
- Reduce gutter width to `12px` on mobile.
- Keep outer margins at `20px` on desktop and mobile.
- Increase the tablet outer margin to `40px`.

## Grid Specification

| Context | Reference Frame | Columns | Minimum Breakpoint | Margin | Gutter | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Desktop | `1440 x 1024px` | `12` | `1280px` | `20px` | `20px` | Default wide-screen grid |
| Tablet | `1280 x 800px` | `8` | `768px` | `40px` | `20px` | Mid-size responsive layout |
| Mobile | `375 x 812px` | `4` | Inferred `<768px` | `20px` | `12px` | Compact handheld layout |

## Grid Usage In Prototypes

- Build desktop dashboards, dense tables, and multi-panel layouts on the `12`-column system.
- Collapse to `8` columns for tablet layouts while preserving the same `20px` gutter rhythm.
- Use the `4`-column grid for mobile screens, and avoid carrying desktop gutter values down unchanged.
- Let the grid determine card widths, content spans, and section alignment before introducing custom width rules.

## Grid Interpretation Notes

- The mobile board does not explicitly state a minimum breakpoint.
- The mobile range is inferred from the tablet rule `Minimum Breakpoint 768px`.
- For implementation and prompt reuse, use these inferred ranges:
- Desktop: `>= 1280px`
- Tablet: `>= 768px` and `< 1280px`
- Mobile: `< 768px`

## Radius Overview

Source: [Labamu Library - Radius](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=7-6140&t=FAeEIp6fozPOSFtH-1)

The radius board shows six corner-radius values but does not expose token names. The values below are the source-of-truth from Figma, and the alias column is a proposed Markdown shorthand to make the system easier to reference when generating prototypes.

### Radius Values

| Proposed Alias | Figma Value | Recommended Usage |
| --- | --- | --- |
| `radius-full` | `100px` | Pills, capsule buttons, rounded tags, highly rounded badges |
| `radius-2xl` | `24px` | Large cards, modal shells, feature containers |
| `radius-xl` | `16px` | Standard cards, drawers, prominent fields |
| `radius-lg` | `12px` | Medium surfaces, buttons, menus, panels |
| `radius-md` | `8px` | Compact buttons, inputs, chips |
| `radius-sm` | `4px` | Tight utility elements, tags, indicators, tiny containers |

## Radius Usage Rules

- Default to `12px` to `16px` for most product UI surfaces.
- Use `24px` for larger, softer containers where the interface wants a more friendly feel.
- Use `8px` or `4px` for dense controls and smaller utility elements.
- Reserve `100px` for pill-like shapes rather than generic container rounding.

## Foundation Open Notes

- The spacing board exposes actual token names directly on the canvas, but the variable export does not return those spacing tokens.
- Treat the on-canvas spacing table as the source of truth for spacing names and sizes.
- The column and breakpoint board provides explicit layout rules on canvas, but not as reusable variable tokens.
- The radius board provides values only, not official token names.
- The `Proposed Alias` column in this document is a documentation convenience for AI reuse, not a confirmed Figma token set.

## Components Overview

Sources:

- Buttons: [Labamu Library - Buttons](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=48-6979&t=FAeEIp6fozPOSFtH-1)
- Sticky Actions: [Labamu Library - Sticky Action](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=48-17675&t=FAeEIp6fozPOSFtH-1)

Current component coverage in this document includes:

- Main buttons
- Icon buttons
- Text CTA buttons
- Toggle
- Radio buttons
- Checkboxes
- Nominal stepper
- Sticky action patterns for mobile, tablet, and desktop

### Icon Handling Rule

- Use exported icon SVG components as-is whenever these components reference icons.
- Do not redraw, replace, or reinterpret icons with another icon style unless the design system is explicitly updated.
- Keep icon placement and scaling tied to the button size rather than introducing new icon sizing rules.

## Button Components

### Main Button

The main button system supports `Primary` and `Secondary` button types, with `Default`, `Hover`, and `Disabled` states across four sizes.

#### Main Button Types

| Type | Default Styling | Hover Styling | Disabled Styling |
| --- | --- | --- | --- |
| `Primary` | Background `Feature/Brand/Primary` `#006BFF`, text `Feature/Brand/OnPrimary` `#FFFFFF` | Background `Feature/Brand/OnContainer` `#005DE0`, text remains white | Background `Neutral/Surface/GreyLighter` `#F4F4F4`, text `Neutral/OnSurface/Tertiary` `#A9A9A9` |
| `Secondary` | Background `Neutral/Surface/Primary` `#FFFFFF`, border `Feature/Brand/Primary`, text `Neutral/OnSurface/Blue` `#006BFF` | Background `Feature/Brand/ContainerLighter` `#F3F7FE`, border remains brand blue, text remains blue | Same disabled surface treatment as primary in the board examples |

#### Main Button Sizes

| Size | Height | Radius | Horizontal Padding | Text Style | Icon Size | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `Extra Large` | `56px` | `12px` | `24px` | Bold `16px` | `20px` | Highest-emphasis button size |
| `Large` | `50px` | `12px` | `24px` | Regular `16px` | `20px` | Standard desktop action button |
| `Medium` | `44px` | `8px` | `24px` | Regular `16px` | `18px` | Compact standard action |
| `Small` | `32px` | `8px` | `12px` | Regular `14px` | `16px` | Supports a compact count prefix in examples |

#### Main Button Composition

- Buttons are content-width rather than fixed-width.
- The board examples show optional left and right icons.
- Left icon examples use a chevron-style icon.
- Right icon examples use a save-style icon.
- Small button examples may prepend a bold numeric indicator before the label, such as `94`.
- Disabled examples visually include a muted loading indicator at the start of the button.

### Icon Button

The icon button system mirrors the main button state logic, but uses icon-only containers.

#### Icon Button Variants

- Types: `Primary`, `Secondary`
- States: `Default`, `Hover`, `Disabled`
- Sizes: `Xl`, `Lg`, `Md`, `Sm`, `Xs`

#### Icon Button Sizes

| Size | Component Size | Notes |
| --- | --- | --- |
| `Xl` | `56 x 56px` | Largest icon action |
| `Lg` | `50 x 50px` | Standard icon action |
| `Md` | `44 x 44px` | Medium icon action |
| `Sm` | `32 x 32px` | Compact icon action |
| `Xs` | `18 x 18px` | Tiny utility icon action |

#### Icon Button Styling

- `Primary` icon buttons reuse the main button fill colors.
- `Secondary` icon buttons reuse the bordered secondary button treatment.
- `Hover` uses the darker brand tone for primary and the lighter brand container for secondary.
- `Disabled` uses `Neutral/Surface/GreyLighter`.
- Icons should remain centered and use the exported SVG asset without stylistic changes.

### Text CTA Button

This is a text-only CTA pattern with a chevron on both sides of the label.

#### Text CTA Variants

- Sizes: `Small`, `Large`
- States: `Default`, `Hover`

#### Text CTA Specs

| Size | Height | Text Style | Icon Size | Default Color | Hover Color |
| --- | --- | --- | --- | --- | --- |
| `Small` | `24px` | Regular `12px` | `16px` | `Feature/Brand/Primary` `#006BFF` | `Feature/Brand/OnContainer` `#005DE0` |
| `Large` | `24px` | Bold `14px` | `18px` | `Feature/Brand/Primary` `#006BFF` | Inferred darker brand blue on hover |

#### Text CTA Notes

- The button uses a `2px` gap between icon and label.
- The large variant increases emphasis through typography, not height.
- In the sticky action component, the CTA text action changes to a red warning-style treatment instead of blue.

### Toggle

The toggle component is provided in two platform sizes.

#### Toggle Variants

| Variant | Size | Off State | On State | Usage Note |
| --- | --- | --- | --- | --- |
| `Big` | `51 x 32px` | Background `Neutral/Background` | Background `Feature/Brand/Primary` | Use for larger titles or more prominent controls |
| `Small` | `40 x 24px` | Same behavior | Same behavior | Use for multiple smaller controls under larger sections |

#### Toggle Board Note

- The board explicitly says: `Big is used for titles, small for multiple things under bigger ones.`

### Radio Buttons And Checkboxes

These selection controls are shown at a standard compact control size.

#### Radio Button

| State | Size | Notes |
| --- | --- | --- |
| `Off` | `24 x 24px` | Empty outlined control |
| `On` | `24 x 24px` | Uses Labamu blue selection accent |

#### Checkbox

| State | Size | Notes |
| --- | --- | --- |
| `Default` | `24 x 24px` | Empty square control |
| `Disabled` | `24 x 24px` | Muted disabled version shown on board |
| `On` | `24 x 24px` | Filled blue selected checkbox |
| `On-Some` | `24 x 24px` | Indeterminate state with minus indicator |

### Nominal Stepper

The nominal stepper component pairs decrement and increment controls with a centered amount field.

#### Nominal Stepper Structure

- Left decrement button
- Center quantity field with underline
- Right increment button

#### Nominal Stepper Sizes

| Platform Example | Control Size | Amount Text | Center Width | Notes |
| --- | --- | --- | --- | --- |
| `Small` | `24px` | Bold `14px` | `52px` | Dense compact stepper |
| `Medium` | `44px` | Bold `20px` | `88px` | Standard stepper |
| `Large` | `50px` | Bold `24px` | `88px` | Large version with strong emphasis |
| `Large (Alt Example)` | `56px` | Bold `24px` | `88px` | Board shows a second large example with a lighter add-state treatment |

#### Nominal Stepper Notes

- The decrement side is shown using a muted grey surface in the sampled examples.
- The increment side uses brand blue in the standard examples.
- One large example uses a lighter brand container tone on the increment side, so treat that as either an alternate state or a board-specific example until clarified.

## Sticky Action Components

### Sticky Action Principle

Sticky action patterns keep the most important actions anchored near the bottom of the screen while adapting to each platform.

### Sticky Action (Mobile)

The mobile sticky action is a stacked action area built around a `335px` action width inside a `375px` mobile frame.

#### Mobile Structure

- Up to two button rows
- Each row contains one icon button, one secondary action button, and one primary action button
- Optional text CTA row below the buttons
- Optional home indicator below the action area

#### Mobile Layout Specs

| Property | Value |
| --- | --- |
| Internal action width | `335px` |
| Row gap | `12px` |
| Section gap | `20px` |
| Icon button size | `50px` |
| Main button height | `50px` |
| Button radius | `12px` |
| Horizontal button padding | `24px` |

#### Mobile Presentation Modes

| Mode | Description | Use When |
| --- | --- | --- |
| `No Background` | Buttons float without an added surface container | Screen does not need scrolling, or scroll exists without a sticky surface treatment |
| `With Background` | White surface container with elevated sticky treatment | Screen needs scrolling and needs a true sticky action area |

#### Mobile Background Mode Styling

- Surface background: `Neutral/Surface/Primary`
- Top shadow: `0px -3px 10px rgba(0, 0, 0, 0.04)`
- Top padding: `20px`
- Horizontal padding: `20px`

#### Mobile CTA Text Action

- Label color uses a warning red treatment
- The sampled token is `Button/Text/CTABtnWarning`, matching `Status/Red/Primary` `#D0021B`
- The CTA is flanked by chevrons in the examples

### Sticky Action (Tablet)

The tablet sticky action is a full-width anchored action bar.

#### Tablet Structure

- White top container
- Optional subtotal information block
- Right-aligned action button group
- iPad home indicator area below

#### Tablet Layout Specs

| Property | Value |
| --- | --- |
| Width | `1280px` |
| Top padding | `16px` |
| Horizontal padding | `40px` |
| Bottom padding | `4px` |
| Action gap | `12px` |
| Button height | `44px` |
| Button radius | `8px` |
| Home indicator area | `34px` |

#### Tablet Action Order

- `Action 1` is primary
- `Action 2` and `Action 3` are secondary
- Subtotal content sits before the action group when present

### Sticky Action (Desktop)

The desktop sticky action becomes a simpler single-row bottom action bar.

#### Desktop Layout Specs

| Property | Value |
| --- | --- |
| Width | `1190px` |
| Padding | `20px` |
| Border treatment | Top border `2px` using `Neutral/Line/Outline` |
| Action gap | `12px` |
| Button height | `50px` |
| Button radius | `12px` |

#### Desktop Composition

- Left side: red CTA text action
- Right side: up to five actions
- Right-aligned action ordering ends with the primary action on the far right

## Field Components

Sources:

- Text Fields: [Labamu Library - Text Fields](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=48-9231&t=FAeEIp6fozPOSFtH-1)
- Field Desktop: [Labamu Library - Field Desktop](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=48-13010&t=FAeEIp6fozPOSFtH-1)
- Discount Fields: [Labamu Library - Discount Fields](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=48-13217&t=FAeEIp6fozPOSFtH-1)
- Searchbar: [Labamu Library - Searchbar](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=48-14627&t=FAeEIp6fozPOSFtH-1)

### Field Component Principle

Field-related components in Labamu follow a compact, surface-first form pattern:

- Top label row for title, requirement marker, tooltip, and optional counter
- Rounded field shell with subtle outline by default
- Helper or supporting row below when the control needs guidance or validation text
- Brand blue focus treatment for active states
- Red border plus red helper text for error states
- Grey lighter surface for disabled states
- If a field uses icons, use the exported SVG icon component as-is

### Text Fields

The text field family covers both standard single-line inputs and rich-text inputs.

#### Text Field Variant Matrix

| Size | Platform Usage | Field Types | States | Notes |
| --- | --- | --- | --- | --- |
| `Large` | Tablet | `Default`, `Rich Text` | `Enable`, `Active`, `Active Long`, `Error`, `Error + Active`, `Disabled` | Taller single-line shell and tablet-first layout |
| `Medium` | Mobile and Desktop | `Default`, `Rich Text` | `Enable`, `Active`, `Active Long`, `Error`, `Error + Active`, `Disabled` | Same visual language in a slightly tighter shell |

#### Single-Line Text Field Anatomy

| Area | Spec |
| --- | --- |
| Label row | `19px` high row with required asterisk `14px` red, title `12px`, optional `16px` tooltip icon, and optional counter |
| Large shell | `51px` height, `10px` radius, `16px` horizontal padding, `13.5px` vertical padding |
| Medium shell | `46px` height, `10px` radius, `16px` horizontal padding, `11px` vertical padding |
| Inner content | `8px` gap, optional `24px` leading icon, main text or placeholder, optional unit, optional `24px` trailing icon |
| Placeholder / value text | `16px` using `Subtitle/Subtitle 1, Regular 16` |
| Helper row | `4px` gap with optional `16px` info icon and `Body/Body 1, Regular 12` helper text |

#### Single-Line Text Field State Rules

| State | Visual Treatment |
| --- | --- |
| `Enable` | White surface, outline border, tertiary placeholder text |
| `Active` | Border changes to `Feature/Brand/Primary` `#006BFF`, caret is visible, helper remains neutral if no error |
| `Active Long` | Same active treatment with longer filled content |
| `Error` | Border changes to `Status/Red/Primary` `#D0021B`, helper text also turns red |
| `Error + Active` | Error styling remains dominant while the field is active |
| `Disabled` | Field shell switches to `Neutral/Surface/GreyLighter` `#F4F4F4` with muted content |

#### Text Field Counter Behavior

- Tablet-oriented large examples place the counter in the top label row using `Body/Body 1, Regular 12`.
- Desktop-oriented medium examples also show an inline counter inside the field using `Description/Description 1, Regular 10`.
- For reuse, treat the top-row counter as the default pattern and use the inline counter when the layout is desktop-heavy or space-constrained around the label.

#### Rich Text Field

The rich-text field keeps the same label and helper structure, but replaces the single-line shell with a stacked multiline editor.

| Part | Spec |
| --- | --- |
| Writing area | Minimum `72px` content area, `16px` horizontal padding, `12px` vertical padding |
| Bottom toolbar | Attached lower bar with `12px` horizontal padding, `8px` vertical padding |
| Toolbar icons | Five `20px` formatting actions shown on the board |
| Counter | Right-aligned character counter using `Body/Body 1, Regular 12`, max shown as `0/400` |
| Corner treatment | Shared `10px` radius split across top editor and bottom toolbar |

#### Rich Text Content Heights

| Variant Example | Height |
| --- | --- |
| `Large / Empty` | `153px` |
| `Large / Filled` | `193px` |
| `Large / Active + Filled` | `215px` on the board |
| `Medium / Empty` | Mirrors the same structure with the medium size family |

#### Text-Only Field Rows

These are lightweight read or action rows rather than editable input shells.

| Variant | Size | Structure | Usage |
| --- | --- | --- | --- |
| `Text Only` | `335 x 20px` | Left title, right description, optional copy icon `20px` | Read-only information row |
| `Text with CTA` | `335 x 20px` | Left title, right brand CTA with chevrons | Inline action row without an input shell |
| `Text with Status` | `335 x 20px` | Left title, right red status pill | Compact field-like status row |

#### Text-Only Row Styling

- Left title uses `Subtitle/Subtitle 2, Regular 14` in `Neutral/OnSurface/Secondary`.
- `Text Only` value uses `Subtitle/Subtitle 2, Regular 14` in `Neutral/OnSurface/Primary`.
- `Text with CTA` uses bold `14px` blue text with chevrons on both sides.
- `Text with Status` uses a red pill with `4px` radius and `8px` horizontal padding.

### Desktop Field

The desktop field is a split two-column pattern for form-heavy desktop pages, settings pages, or product setup flows.

#### Desktop Field Layout

| Area | Spec |
| --- | --- |
| Overall sample width | `856px` |
| Left column | `240px` wide label and description area |
| Gap between columns | `44px` |
| Right column | `552px` wide field area |
| Input width inside right column | `500px` |
| Gap from field to notes CTA | `20px` |

#### Desktop Field Left Column

- Title row uses `Subtitle/Subtitle 2, Regular 14`
- Required asterisk stays red
- Tooltip icon grows to `24px`
- Verified badge can appear beside the label
- Supporting copy uses `Body/Body 1, Italic 12` in secondary text color

#### Desktop Field Input Shell

- Uses the medium text-field shell structure: `46px` height, `10px` radius, `16px` horizontal padding, `11px` vertical padding
- Placeholder/value text uses `Subtitle/Subtitle 1, Regular 16`
- Character counter sits inline on the right in `Description/Description 1, Regular 10`
- Optional text CTA labeled `Notes` sits to the far right of the field group

#### Desktop Field CTA Variants

| Size | Height | State | Color |
| --- | --- | --- | --- |
| `Medium` | `20px` | `Primary` | `Feature/Brand/Primary` `#006BFF` |
| `Medium` | `20px` | `Danger` | `Status/Red/Primary` `#D0021B` |
| `Medium` | `20px` | `Disabled` | `Neutral/OnSurface/Tertiary` `#A9A9A9` |
| `Small` | `18px` | `Primary`, `Danger`, `Disabled` | Same semantic color logic in a tighter size |

#### Desktop Stacked Info Patterns

The desktop field board also includes field-adjacent information patterns:

- `[Desktop] Stack Info - Text` states: `Default`, `Hover`, `Edit Mode`
- `[Desktop] Stacked Info` types: `Text`, `Info Text`, `Text Button`, `Label + Text Button`

The sampled `Text Button` pattern uses a `280px` wide vertical stack with:

- `8px` gap between title and action
- `4px` gap inside the title row
- Secondary `14px` title text
- Brand blue bold `14px` CTA action

### Discount Fields

Discount fields combine a mode switch and a right-aligned numeric entry into one compact form control.

#### Discount Field Variant Matrix

| Size | Types | States | Notes |
| --- | --- | --- | --- |
| `Mobile` | `Discount Percentage`, `Discount Nominal` | `Default`, `Click`, `Typing`, `Filled`, `Error` | Sampled as a full control with helper text line |
| `Tablet` | `Discount Percentage`, `Discount Nominal` | `Default`, `Click`, `Typing`, `Filled`, `Error` | Same composition in a tighter tablet-oriented presentation |

#### Discount Field Anatomy

| Part | Spec |
| --- | --- |
| Total width | `335px` |
| Mode toggle shell | `46px` high, `10px` radius, `4px` inner padding, brand blue outline |
| Toggle segments | Two `40px`-wide segments with `8px` inner radius |
| Active segment | Filled `Feature/Brand/Primary` with white text |
| Inactive segment | White or transparent surface with brand blue text |
| Numeric field shell | White surface, `10px` radius, `16px` horizontal padding, `12px` vertical padding |
| Numeric alignment | Right-aligned value with unit or symbol suffix |

#### Discount Field Behavior

- Use the left segmented toggle to switch between percentage and nominal discount modes.
- Keep the value right-aligned so amounts and percentages scan cleanly.
- Use tertiary text for empty values and primary text for filled values.
- In error state, only the entry shell and helper text turn red; the mode toggle remains blue.

#### Discount Field Sizing Notes

- Mobile examples are shown at `68px` total height because the helper line is part of the component sample.
- Tablet state rows are shown at `51px` height on the board and appear to emphasize the control row more than the helper line.

### Search Bar

The search bar is a compact search input paired with a trailing add action.

#### Search Bar Variants

| Size | Total Height | Text Style | Add Button |
| --- | --- | --- | --- |
| `Small` | `36px` | `Subtitle/Subtitle 2, Regular 14` | `36 x 36px` tertiary icon button with `16px` add icon |
| `Large` | `44px` | `Subtitle/Subtitle 1, Regular 16` | `44px` high tertiary icon button with `18px` add icon |

#### Search Bar Anatomy

| Part | Spec |
| --- | --- |
| Total width | `335px` |
| Gap between search field and add button | `10px` |
| Search field surface | `Neutral/Surface/GreyLighter` `#F4F4F4` |
| Corner radius | `8px` |
| Leading icon | Search icon `24px` |
| Add button fill | `Feature/Brand/ContainerDarker` `#E6F0FF` |

#### Search Bar States

| State | Behavior |
| --- | --- |
| `Typing Off` | Placeholder `Cari` in tertiary text, no clear button |
| `Typing On` | Entered value in primary text, visible caret, trailing clear icon `24px` |

#### Search Bar Notes

- The add action is visually the same tertiary brand-container icon button already used in the button system.
- Keep the search, clear, and add icons consistent with the exported SVG set.

## Sticky Header Components

Source: [Labamu Library - Sticky Header](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=48-18227&t=FAeEIp6fozPOSFtH-1)

### Sticky Header Principle

The sticky-header board mixes several navigation layers. Reuse them as separate primitives for app chrome, page navigation, and breadcrumbs instead of flattening them into one universal header.

### Header Mobile

The mobile sticky header is split into a system status area and a compact app bar.

#### Mobile Layout

| Part | Spec |
| --- | --- |
| Total width | `375px` |
| System status bar | `48px` height, `20px` horizontal padding |
| App bar | `44px` height, `20px` horizontal padding |
| Left cluster gap | `6px` |
| Right cluster gap | `10px` |

#### Mobile Composition

- Left side: `24px` back icon plus `Title/Title 2, Bold 16`
- Primary action: filled compact button, `32px` height, `8px` radius, `12px` horizontal padding
- The sampled action supports a numeric prefix and label, shown as `94 Action`
- Right side: two `24px` utility icons after the primary action

### Header Tablet

The tablet sticky header becomes a work-oriented header with page title, search, and multiple actions.

#### Tablet Layout

| Part | Spec |
| --- | --- |
| Width | `1280px` |
| Height | `80px` |
| Padding | `40px` horizontal, `18px` vertical |
| Left cluster gap | `12px` |
| Right cluster gap | `12px` |
| Search width | `480px` |

#### Tablet Composition

- Left side: `32px` back action, `32px` avatar, and `Title/Headline, Bold 20`
- Right side: large searchbar without the add button, one secondary `44px` action button, one primary `44px` action button, one `44px` outlined icon button, and one standalone `32px` share icon
- The search input reuses the previously documented large searchbar pattern

### Top Header Desktop

The top desktop header is the shell-level account and utility bar for the desktop workspace.

#### Top Header Specs

| Part | Spec |
| --- | --- |
| Width | `1440px` sample |
| Height | `60px` |
| Surface | `Neutral/Surface/Primary` |
| Shadow | `0px 1px 2px rgba(0, 0, 0, 0.05)` |
| Right cluster gap | `24px` |

#### Top Header Composition

- Notification icon with a `30px` hit area
- User block with bold `14px` name and lower-emphasis `12px` role
- Dropdown chevron in a `30px` hit area
- The left side remains mostly reserved space, matching a persistent desktop shell layout

### Header Page Desktop

The desktop page header is a content-level header that pairs page identity with page-scoped actions.

#### Page Header Layout

| Part | Spec |
| --- | --- |
| Width | `1190px` |
| Padding | `20px` horizontal, `10px` vertical |
| CTA gap | `12px` |
| Small action height | `32px` |

#### Page Header Composition

- Left side: `24px` back icon and `Title/Large Title, Bold 26`
- Secondary line: breadcrumbs using muted `14px` text
- Right side: up to three actions ordered from secondary to primary
- The sampled CTA set uses outlined secondary buttons and a filled primary button

### Breadcrumbs Desktop

Breadcrumbs are exposed as a separate desktop primitive with `Two`, `Three`, and `Four` segment variants.

#### Breadcrumb Specs

| Property | Value |
| --- | --- |
| Text style | `Subtitle/Subtitle 2, Regular 14` |
| Color | `Neutral/OnSurface/Tertiary` |
| Gap | `4px` between labels and separators |
| Separator | Slash `/` |

## Snackbar Components

Source: [Labamu Library - Snackbar](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=48-19103&t=FAeEIp6fozPOSFtH-1)

### Snackbar Principle

The snackbar system is intentionally minimal: one message on the left and a small confirmation action on the right.

#### Snackbar Semantic Mapping

- `Grey` snackbar: neutral or low-key negative outcomes, such as successfully deleted
- `Green` snackbar: positive outcomes, such as successfully created or edited
- `Red` snackbar: negative outcomes, such as failed to save

#### Snackbar Shared Container

| Property | Value |
| --- | --- |
| Width | `335px` |
| Height | `51px` |
| Radius | `8px` |
| Horizontal padding | `20px` |
| Layout | Left message plus right action |

#### Snackbar Platform Differences

| Platform | Message Style | Action Style |
| --- | --- | --- |
| `Mobile` | `Body/Body 1, Regular 12` | `Body/Body 1, Bold 12` |
| `Tablet` | `Subtitle/Subtitle 1, Regular 16` | `Title/Title 3, Bold 14` |

#### Snackbar Colors

| State | Background | Text |
| --- | --- | --- |
| `Grey` | `Neutral/100` `#282828` | `Neutral/OnSurface/Reverse` |
| `Green` | `Status/Green/Primary` | `Status/Green/OnPrimary` |
| `Red` | `Status/Red/Primary` | `Status/Red/OnPrimary` |

#### Snackbar Notes

- The action is text-only, shown as `Oke` on the board.
- Mobile and tablet keep the same outer size; the main difference is typography scale.

## Infobox And Tooltip Components

Source: [Labamu Library - Infobox & Tooltip](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=55-1450&t=FAeEIp6fozPOSFtH-1)

### Infobox

The infobox is a lightweight inline callout for contextual guidance or small notices.

#### Infobox Behavior

- Use the close icon only when the message is dismissable in context
- Use `Blue` for general product guidance or contextual information
- Use `Orange` for cautionary or warning information

#### Infobox Variant Matrix

| Color | Platform | Lines | Width |
| --- | --- | --- | --- |
| `Blue` | `Mobile` | `1 Line`, `2 Line` | `335px` |
| `Blue` | `Tablet` | `1 Line`, `2 Line` | `335px` |
| `Orange` | `Mobile` | `1 Line`, `2 Line` | `335px` |
| `Orange` | `Tablet` | `1 Line`, `2 Line` | `335px` |

#### Infobox Mobile Specs

| Part | Spec |
| --- | --- |
| Background | `Feature/Brand/ContainerDarker` for blue, `Feature/Invoice/Container` for orange |
| Text | `Body/Body 1, Regular 12` |
| Text color | Matching `OnContainer` family |
| Leading icon | `18px` info icon |
| Close icon | `16px` |
| Padding | `16px` horizontal, `8px` vertical |
| Radius | `8px` |

#### Infobox Tablet Specs

| Part | Spec |
| --- | --- |
| Text | `Subtitle/Subtitle 2, Regular 14` |
| Leading icon | `20px` |
| Width | `335px` sample |
| Radius and padding | Same visual structure as mobile |

### Tooltip

The tooltip is a dark floating description box with a centered top arrow.

#### Tooltip Specs

| Part | Spec |
| --- | --- |
| Surface | `Neutral/100` `#282828` |
| Text color | `Neutral/OnSurface/Reverse` |
| Text style | `Body/Body 1, Regular 12` |
| Radius | `8px` |
| Text padding | `12px` horizontal, `8px` vertical |
| Arrow | Top-centered `8 x 6px` pointer |

#### Tooltip Variants

| Variant | Width | Note |
| --- | --- | --- |
| `Multiple Line Off` | `169px` sample | Compact fixed-width one-line tooltip |
| `Multiple Line On` | `335px` sample | Width can change according to the design |

## Status Components

Source: [Labamu Library - Status](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=55-5306&t=FAeEIp6fozPOSFtH-1)

### Status Principle

The status system has three distinct formats:

- solid pill status for high-emphasis state labels
- sheer pill status for softer, lower-emphasis labels
- dot status for lightweight inline indicators

### Status Pills

#### Shared Pill Specs

| Property | Value |
| --- | --- |
| Height | `24px` |
| Radius | `4px` |
| Padding | `8px` horizontal, `2px` vertical |
| Text style | `Subtitle/Subtitle 2, Regular 14` |
| Width | Content-driven |

#### Pill Variants

| Type | Background | Text |
| --- | --- | --- |
| `Solid` | Primary / strong semantic color | White or `OnPrimary` text |
| `Sheer` | Container / soft semantic color | Matching `OnContainer` text |

#### Pill Color Families

| Family | Solid Source | Sheer Source |
| --- | --- | --- |
| `Blue` | `Feature/Brand/Primary` | Brand container family |
| `Grey` | `Status/Grey/Primary` | `Status/Grey/Container` |
| `Yellow` | `Status/Yellow/Primary` | `Status/Yellow/Container` |
| `Green` | `Status/Green/Primary` | `Status/Green/Container` |
| `Orange` | `Status/Orange/Primary` | `Status/Orange/Container` |
| `Red` | `Status/Red/Primary` | `Status/Red/Container` |

#### Real Label Examples On The Board

- Grey: `Belum Aktif`, `Tidak Aktif`, `Belum Registrasi`
- Yellow: `Pending`, `Berlangsung`, `Menunggu`
- Orange: `Outstanding`
- Green: `Aktif`, `Sukses`, `Selesai`, `Berhasil`, `Approved`
- Red: `Ditolak`, `Flagged`, `Fraud`, `Error`

### Dot Status

Dot status is the lightest-weight variant and pairs a colored dot with neutral text.

#### Dot Status Specs

| Property | Value |
| --- | --- |
| Dot size | `8px` |
| Gap to label | `8px` |
| Text style | `Subtitle/Subtitle 2, Regular 14` |
| Text color | `Neutral/OnSurface/Primary` |

#### Dot Status Color Set

- `Blue`
- `Grey`
- `Light Green`
- `Orange`
- `Purple`
- `Green`
- `Yellow`
- `Red`

## Page Indicator, Scroller, And Separator Components

Source: [Labamu Library - Page Indicator, Scroller and Separator](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=55-2866&t=FAeEIp6fozPOSFtH-1)

### Page Indicator

The page indicator is a minimal three-dot pagination hint used across platforms.

#### Page Indicator Specs

| Property | Value |
| --- | --- |
| Dot count | `3` |
| Dot size | `6px` |
| Gap | `6px` |
| Variants | `Dark`, `Light` |

#### Page Indicator Usage

- `Dark` and `Light` are the same structure with inverted emphasis.
- Inference from the board naming: use `Dark` on light surfaces and `Light` on dark or image-heavy surfaces.

### Scroll Indicator

The scroll indicator is a passive vertical rail used to hint at scroll position or long content.

#### Scroll Indicator Specs

| Platform | Size | Color | Radius |
| --- | --- | --- | --- |
| `Tablet & Desktop` | `8 x 94px` | `Neutral/Line/Scroller` `#E9E9E9` | `100px` |
| `Mobile` | `4 x 94px` | `Neutral/Line/Scroller` `#E9E9E9` | `100px` |

### Separator

The separator family contains a thin line divider and a thicker section divider.

#### Separator Variants

| Type | Size | Usage |
| --- | --- | --- |
| `Section Seperator` | `375 x 4px` | Larger section break for strong visual grouping |
| `Line` | `335 x 1px` | Standard inline divider |

#### Separator Notes

- The line separator clearly maps to `Neutral/Line/Separator 1`.
- The section separator is visually a softer block divider and appears to mix `Separator 2` with a lighter overlay on the board.

## Filter Pill Components

Source: [Labamu Library - Filter Pill](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=55-6193&t=FAeEIp6fozPOSFtH-1)

### Filter Pill Principle

Filter pills are compact selection controls rather than generic chips or buttons.

#### Filter Pill Behavior

- Mobile size is used for mobile and desktop.
- Tablet size is used for tablet.
- If activated, the filter moves to the front of the row.
- If activated, the filter color changes according to the feature family.
- For single-selection filters, the text changes to the selected variable name.

#### Filter Pill Sizes

| Platform Token | Height | Padding | Gap | Typography |
| --- | --- | --- | --- | --- |
| `Mobile` | `30px` | `8px` horizontal, `6px` vertical | `4px` | `Body/Body 1, Regular 12` |
| `Tablet` | `44px` | `12px` horizontal, `8px` vertical | `8px` | `Subtitle/Subtitle 2, Regular 14` |

#### Filter Pill State Rules

| State | Visual Treatment |
| --- | --- |
| `Off` | Grey outline, grey label, chevron down |
| `Hovered` | Brand blue outline, grey label, chevron down |
| `Clicked` | Brand blue outline, brand blue label, chevron up |
| `On` | Feature-colored outline and label, count badge or selected-value label, chevron down when closed |

#### Filter Pill Active Variants

| Variant | Behavior |
| --- | --- |
| `Multiple Selection` | Shows a numeric count badge before the label |
| `Single Selection` | Replaces the generic label with the selected variable name |
| `Date Selection Custom` | Shows a chosen date range as the active value |

#### Feature Color Mapping On The Board

- `General`, `Report`, `Quote`, and desktop-general samples use the brand blue family
- `Invoice` uses the orange feature family
- `Product` uses the product purple family
- `Customer` uses the customer green family
- `Cashier` uses the cashier teal family

## Filter Dropdown Components

Source: [Labamu Library - Filter Dropdown](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=55-11108&t=FAeEIp6fozPOSFtH-1)

### Filter Dropdown Principle

The filter dropdown is a structured overlay attached to a filter pill, combining search, selection rows, and optional supporting controls.

#### Filter Dropdown Behavior

- Given: user clicks a filter pill and the dropdown opens
- When the user clicks outside the dropdown, close it
- When the user clicks another filter pill, close the current dropdown and open the new one
- `Remove Filter` CTA appears only when there is an active selection

#### Filter Dropdown Container

| Property | Value |
| --- | --- |
| Width | `274px` |
| Radius | `12px` |
| Padding | `20px` outer padding |
| Vertical gap | `12px` between sections |
| Border | `1px` neutral outline |
| Shadow | `4px 4px 12px rgba(0, 0, 0, 0.12)` |

#### Filter Dropdown Structure

- Header row with bold `14px` title
- Optional red `Hapus Filter` text CTA
- Search input using the small searchbar pattern without add button
- Radio or checkbox option rows
- Optional date field row with calendar icon
- Optional not-found helper text below the field list

#### Selection Rows

| Property | Value |
| --- | --- |
| Row width sample | `220px` |
| Row padding | `8px` vertical |
| Gap | `12px` between control and label |
| Control size | `24px` |
| Label style | `Body/Body 1, Regular 12` |

#### Filter Dropdown Notes

- Radio rows are used for single selection.
- Checkbox rows are used for multiple selection.
- The board sample shows a date-range field embedded inside the dropdown for date-driven filters.

## Filter Card Components

Source: [Labamu Library - Filter Card](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=602-1193&t=FAeEIp6fozPOSFtH-1)

### Filter Card Principle

Filter cards are broader, title-first selection surfaces that auto-filter based on their title and can support multiple selection.

#### Filter Card Behavior

- When clicked, the card auto-filters based on the title
- Card selection can be multiple

#### Filter Card Specs

| Property | Value |
| --- | --- |
| Width | `265.25px` |
| Height | `57px` |
| Radius | `12px` |
| Padding | `20px` left, `12px` right, `16px` vertical |
| Internal gap | `8px` |
| Title style | `Subtitle/Subtitle 1, Regular 16` |

#### Filter Card States

| State | Visual Treatment |
| --- | --- |
| `Default` | White surface, neutral outline, blue count badge, trailing chevron right |
| `Selected` | `Feature/Brand/ContainerLighter`, blue outline, blue count badge, trailing close icon |

## Dropdown General Components

Source: [Labamu Library - Dropdown General](https://www.figma.com/design/tuNPIEke41XKWtJVmopMal/-New--Labamu-Library?node-id=55-11626&t=FAeEIp6fozPOSFtH-1)

### Dropdown General Principle

The general dropdown family is a reusable option-list system that can be attached to text fields or used as a stand-alone suggestion menu.

### Dropdown Option

#### Dropdown Option Specs

| Property | Value |
| --- | --- |
| Width | `295px` sample |
| Padding | `8px` |
| Option gap | `10px` when trailing icon is present |
| Text size | `14px` |
| Separator | `1px` line inset by `8px` on each side |

#### Dropdown Option States

| State | Visual Treatment |
| --- | --- |
| `Selected` | Bold `14px` label with trailing check icon |
| `Not Selected` | Regular `14px` label |
| `Hovered` | `Feature/Brand/ContainerDarker` background with regular `14px` label |
| `Disabled` | Tertiary text, no active highlight |
| `Not Found` | Sentence-style message row, no real selection affordance |

### Dropdown Box

#### Dropdown Box Shared Container

| Property | Value |
| --- | --- |
| Radius | `12px` |
| Border | `1px` neutral separator/outline family |
| Shadow | `4px 4px 12px rgba(0, 0, 0, 0.12)` |
| Add CTA | Bottom section with top border and blue add-copy treatment |

#### Dropdown Box Variants

| Variant | Width | Height | Notes |
| --- | --- | --- | --- |
| `Mobile` | `335px` | `325px` sample | Uses `14px` option text and `4px` scroll indicator |
| `Tablet` | `363px` | `337px` sample | Uses `16px` option text and `8px` scroll indicator |
| `Add Only` | `335px` | `52px` | Only shows create-new CTA |
| `Search Not Found` | `335px` | `52px` | Only shows centered not-found message |

#### Dropdown General Behavior States

- `Default State`: field is closed
- `Click State`: opens a creatable dropdown when nothing is selected yet
- `Clicked on a Selected State`: opens an existing-selection dropdown without create-new CTA
- `Typing State`: narrows results while keeping the text field active
- `Search Not Found`: shows either not-found only, or not-found plus create-new, depending on whether creation is allowed

#### Dropdown General Notes

- The mobile and tablet dropdown boxes both include a visible right-edge scroll indicator.
- The create-new CTA copy is blue and uses the typed query inside quotes, shown as `“Pa” as new unit`.

## Tabs Components

Labamu uses two tab paradigms: contained tabs for mobile or tablet switching, and underline tabs for desktop page-level navigation.

### Contained Tab Items

#### Contained Tab Item Specs

| Size | Sample Width | Height | Active Treatment |
| --- | --- | --- | --- |
| `Sm` | `160px` | `33px` | `Feature/Brand/ContainerLighter` background, bold `14px` brand text |
| `Md` | `160px` | `40px` | `Feature/Brand/ContainerLighter` background, bold `14px` brand text |
| `Lg` | `160px` | `56px` | Same visual hierarchy, larger touch target |

#### Contained Tab States

| State | Visual Treatment |
| --- | --- |
| `Active` | Light brand container fill with bold label |
| `Inactive` | Neutral or transparent shell with regular label |
| `Hover` | Keeps the same size and structure while increasing emphasis |

### Segmented Tab Groups

#### Segmented Group Specs

| Size Label | Container Size | Notes |
| --- | --- | --- |
| `Small` | `335px x 39px` | Compact mobile-width segmented group |
| `Size3` | `335px x 46px` | Mid-size segmented group shown on the board |
| `Extra Large` | `494px x 62px` | Largest segmented sample |

#### Segmented Group Shared Rules

| Property | Value |
| --- | --- |
| Outer border | `1px` `Neutral/10` |
| Radius | `8px` |
| Outer padding | `3px` |
| Active tab fill | `Feature/Brand/ContainerLighter` |
| Label style | Regular `14px` when inactive, bold `14px` when active |

### Desktop Underline Tabs

#### Desktop Tab Specs

| Sample Group | Width | Height | Active Treatment | Inactive Treatment |
| --- | --- | --- | --- | --- |
| `Tab=2` | `1150px` | `46px` | Bold `16px` brand text with `2px` blue underline | Regular `16px` tertiary text with `2px` separator underline |
| `Tab=3` | `1150px` | `46px` | Same as above | Same as above |

#### Desktop Tab Rules

- Use the underline pattern for desktop content sections and page navigation.
- Keep the active indicator aligned to the tab label width rather than turning the whole bar into a filled pill.
- The sampled desktop tabs are text-only.

## Chips Components

Chips are compact selectable pills for lightweight categories, states, or quick selections. They are distinct from filter pills because they do not carry filter-dropdown semantics.

### Chip Specs

| Property | Value |
| --- | --- |
| Height | `44px` |
| Radius | `80px` |
| Horizontal padding | `24px` sample |
| Vertical padding | `8px` |
| Inner gap | `8px` to `10px` depending on content |
| Icon size | `20px` when present |
| Label style | Regular `14px` by default, bold `14px` when selected |

### Chip Types

| Type | Use | Visual Character |
| --- | --- | --- |
| `Solid` | Stronger selection and emphasized categories | White in default state, strong filled selection when active |
| `Sheer` | Lighter contextual tagging | Softer surface treatment with the same `44px` pill shell |

### Chip States

| State | Behavior |
| --- | --- |
| `Default` | Neutral pill shell with regular label |
| `Hover` | Same shell size with stronger emphasis |
| `Active` | Selected state; the `Solid` variant explicitly uses brand blue with white text |
| `Disabled` | Greyed or tertiary treatment, no active affordance |

### Chip Rules

- Icons are optional and should use the exported SVG assets as-is.
- Use chips for light selection or metadata. Use filter pills when the control also needs filter behavior, counts, or overlay interaction.

## Cell Components

The cell library is a composition layer for lists and tables. It wraps text, status, media, actions, and field controls into grid-friendly containers instead of redefining each primitive from scratch.

### Cell Families

| Family | Sample Size | Purpose |
| --- | --- | --- |
| `Base Field Cell` | `320px x 52px` | Inline field shell with helper text |
| `Base Image Cell` | `36px x 36px` | Image or avatar placeholder slot |
| `General Cell` | `320px x 32px` to `320px x 90px` | Reusable wrappers for text, status, toggles, buttons, and rich cell content |

### Base Field Cell

#### Base Field Cell Variants

| Variant | Sample Size | Composition |
| --- | --- | --- |
| `Back` | `320px x 52px` | Leading icon, right-aligned placeholder/value, helper text |
| `Front` | `320px x 52px` | Placeholder/value plus right-side cluster for counter, unit, or dropdown |

#### Base Field Cell Shared Specs

| Property | Value |
| --- | --- |
| Field height | `32px` |
| Border | `1px` neutral grey-lighter family |
| Radius | `4px` |
| Inner padding | `8px` horizontal, `4px` vertical |
| Helper text | Regular `10px` with `16px` line height |
| Icons | `24px` |

#### Base Field Cell States

| State | Meaning |
| --- | --- |
| `Enable` | Default neutral shell |
| `Active` | Focused shell |
| `Error` | Error shell |
| `Error + Active` | Focused error shell |
| `Disabled` | Reduced-emphasis shell |

#### Base Field Cell Content Modes

- `Filled=False`: placeholder-style content
- `Filled=True`: populated content

### Base Image Cell

| Property | Value |
| --- | --- |
| Size | `36px x 36px` |
| Radius | `4px` |
| Border | `1px` neutral outline |
| Placeholder icon | `24px` image placeholder |
| Modes | `Filled=False` and `Filled=True` |

### General Cell Variants

| Type | Sample Size | Composition |
| --- | --- | --- |
| `Title Text` | `320px x 44px` | Bold `14px` title with optional tooltip and sort affordance |
| `Title Icon` | `264px x 44px` | Action icon strip; may include checkbox plus utility icons |
| `Neutral Text` | `320px x 36px` | Regular `14px` neutral text |
| `Primary Text` | `320px x 36px` | Regular `14px` brand-blue action text |
| `Image` | `320px x 52px` | Image slot inside a cell wrapper |
| `Status` | `320px x 40px` | Inline status chip container |
| `Toggle` | `320px x 48px` | Toggle control row |
| `Icon Button` | `264px x 32px` | Compact icon-action wrapper |
| `Button` | `162px x 48px` | Embedded primary button row |
| `Field` | `320px x 90px` | Inline field cell plus helper text and CTA links |

### Cell Composition Rules

- General cells use white surfaces with bottom dividers to align to table and list grids.
- Title-oriented cells use `12px` padding and keep metadata icons tight to the label.
- The `Field` cell variant can expose a primary CTA and a danger CTA below the helper line.
- Whenever a cell includes icons, use the exported SVG assets as-is.

## Desktop Table Components

The desktop table is a composed pattern built from search, filter, cell, status, button, and pagination primitives. It should be treated as a high-level data-surface template rather than a new token family.

### Shared Table Container

| Property | Value |
| --- | --- |
| Width | `1200px` sample |
| Radius | `12px` |
| Surface | Neutral primary / white |
| Structure | Toolbar, table body, footer |

### Toolbar

| Property | Value |
| --- | --- |
| Sample size | `1150px x 60px` inside the table shell |
| Horizontal padding | `20px` |
| Vertical padding | `12px` |
| Filter controls | Up to `5` compact filter dropdowns |
| Search bar width | `335px` |
| Optional right CTA | Add button on the far right |

### Table Grid

| Property | Value |
| --- | --- |
| Header row height | `44px` |
| Data row height | `40px` typical |
| Leading column | `40px` selection checkbox column |
| Middle columns | Repeated fixed columns around `154px` |
| Trailing area | Wider status or actions area around `236px` |
| Scroll affordance | Slot variant adds a horizontal scroll indicator |

### Table States

| State | Sample Size | Behavior |
| --- | --- | --- |
| `Loading` | `1200px x 364px` | Toolbar stays visible while the body shows a centered loader, title, and helper text |
| `Empty State` | `1200px x 408px` | Centered illustration, title, description, and primary CTA |
| `Not Found` | `1200px x 390px` | Centered no-result illustration and recovery copy; sampled search field shows an entered query with clear action |
| `Table` | `1200px x 564px` | Full data grid and footer |
| `Tablle + Slot` | `1200px x 564px` | Grid plus scroll-slot behavior and visible scroll affordance |

### Table Footer

| Variant | Sample Size | Notes |
| --- | --- | --- |
| `>25=False` | `1190px x 60px` | Download action, compact rows-per-page selector, simple pager |
| `>25=True` | `1190px x 60px` | Download action, active rows-per-page selector, expanded pagination with ellipsis and previous or next controls |

### Desktop Table Rules

- Reuse the documented search bar, filter dropdown, cell, status, and button primitives instead of treating the table as a monolith.
- Keep the toolbar visible in `Loading`, `Empty State`, and `Not Found` states.
- Action cells use multiple `16px` utility icons; use the exported SVG assets as-is.

## Calendar Picker Components

The calendar picker uses one popover shell with multiple selection models: week-based selection, single-date selection, dual-month single-date selection, and dual-month period selection.

### Shared Calendar Shell

| Property | Value |
| --- | --- |
| Surface | White |
| Border | `1px` neutral outline |
| Radius | `12px` |
| Shadow | Medium shadow |
| Padding | `20px` |
| Single-calendar gap | `8px` |
| Dual-calendar gap | `20px` |
| Header control | Bordered `8px` radius month/year bar with `24px` chevrons |
| Month / year text | Bold `16px` |
| Weekday label | Regular `14px` |
| Day cell | `40px x 40px` |
| Day number | Regular `16px` |

### Calendar Variants

| Variant | Sample Size | Notes |
| --- | --- | --- |
| `Week` | `440px x 362px` | Adds a left `Week` column and row-level highlight support |
| `Default` | `440px x 386px` | Single-month picker for one selected date |
| `Dual - Single Date` | `860px x 386px` | Two side-by-side months for wider single-date selection |
| `Dual - Period` | `760px x 386px` | Two side-by-side months for range selection |

### Calendar Selection States

| State | Visual Treatment |
| --- | --- |
| Outside month | Light grey date text |
| Default day | Neutral text on white surface |
| Single selected day | Blue circular fill with white text |
| In-range day | Light brand-blue strip background |
| Range start / end | Blue selection cap with rounded leading or trailing edge |
| Week-selected row | Full row highlight plus a blue circular selected day |

### Calendar Behavior Notes

- The `Week` variant uses a dedicated week-number column separated from the date grid by a vertical divider.
- Dual variants place each month in its own calendar frame within the same popover shell.
- The calendar reuses the library section-separator tone as the weekday divider.

## Empty State Template Components

The empty-state template is a reusable content pattern for no-data, no-result, and lightweight placeholder screens. It pairs one illustration, one title, one short description, and an optional primary CTA.

### Empty State Variants

| Variant | Sample Size | Illustration | Text Width | CTA |
| --- | --- | --- | --- | --- |
| `Small` | `290px x 284px` | `160px` illustration | `290px` | Optional `32px` high primary button with `14px` label |
| `Big` | `290px x 312px` | `180px` illustration | `290px` | Optional `44px` high primary button with `16px` label |

### Empty State Shared Content Rules

| Property | Value |
| --- | --- |
| Title style | `Title 1, Bold 18` |
| Description style | `Body 1, Regular 12` |
| Alignment | Centered |
| Layout direction | Vertical stack |
| Default composition gap | `20px` between major blocks |
| CTA treatment | Brand primary filled button |

### Empty State Behavior

- Use the same illustration family and copy structure across states, changing only the message and whether an action is needed.
- The CTA is optional, so empty states may be informational-only or action-led.
- The `Big` variant increases illustration and button size without changing the core template.

## Navigation Bar Components

The navigation-bar board mixes several bottom and lower-navigation patterns for mobile and tablet. They share icon-plus-label navigation DNA, but the platform and product context determine which family to use.

### Mobile Bottom Navigation

#### Mobile Shared Shell

| Property | Value |
| --- | --- |
| Width | `375px` |
| Surface | White |
| Top padding | `12px` |
| Shadow | Upward shadow for dock behavior |
| iOS home indicator | Included in sampled mobile shells |
| Icon size | `24px` |
| Label style | Regular `10px`; active labels may switch to bold and brand blue in newer variants |

#### Mobile Variants

| Variant | Sample Size | Item Count | Notes |
| --- | --- | --- | --- |
| `Nav Bar` | `375px x 98px` | `5` | Labamu mobile nav with `Beranda`, `Produk`, `Pelanggan`, `Laporan`, `Komunitas` |
| `Nav Bar Vietnam` | `375px x 98px` | `5` | Locale-specific version with `Home`, `Network`, `Post`, `Invoice`, `Profile` |
| `Navbar Mobile NEW` | `375px x 94px` | `3` | Compact newer mobile nav with `Admin`, `Beranda`, `Labacash` / `Labaku` |

#### Mobile States

| State | Treatment |
| --- | --- |
| `Off` | Neutral dark icon and regular label |
| `On` | Brand-blue icon and label in newer variants |

### Tablet Navigation

#### Tablet Variants

| Variant | Sample Size | Notes |
| --- | --- | --- |
| `Navbar Menu Tablet` | `1280px x 72px` | Bottom-aligned tablet nav strip with three centered destinations |
| `Navbar Tablet Beranda` | `117px x 48px` per item | Item pattern used inside the tablet strip |

#### Tablet Shared Rules

| Property | Value |
| --- | --- |
| Icon size | `24px` |
| Label style | `16px` |
| Active treatment | Bold brand-blue label plus `6px` underline indicator |
| Inactive treatment | Neutral label with no underline fill |
| Item spacing | Large horizontal spacing between destinations |

### Navigation Bar Rules

- Always use exported SVG icons as-is.
- Use the five-item bars for broader mobile information architecture and the three-item versions for narrowed product modes.
- Treat the tablet bar as a lower navigation strip rather than a mobile bottom tab clone.

## Desktop Sidemenu Components

The desktop sidemenu is a full navigation shell composed of account context, utility cards, menu buttons, child menus, badges, a compact closed state, and a footer action block.

### Open Sidebar Shell

| Variant | Sample Size | Notes |
| --- | --- | --- |
| `Language=ID` | `250px x 1268px` | Indonesian copy |
| `Language=EN` | `250px x 1406px` | English copy with longer content stack |

#### Open Sidebar Shared Structure

| Area | Notes |
| --- | --- |
| Business header | Outlet avatar, verified badge, outlet name, and category text |
| Utility card | `Online Menu` card with title, helper text, and quick action button |
| Menu list | Stacked menu rows with separators |
| Footer | Collapse control, version text, Labamu logo, and contact CTA |

### Sidebar Menu Buttons

#### Menu Button Variants From Board

| Variant | Purpose |
| --- | --- |
| `Inactive, Hover=No, With Child=No` | Neutral menu row |
| `Inactive, Hover=No, With Child=Yes` | Neutral row with child-menu chevron |
| `Inactive, Hover=Yes, With Child=No` | Hover emphasis without children |
| `Inactive, Hover=Yes, With Child=Yes` | Hover emphasis with chevron |
| `Inactive, Hover=With Add, With Child=No` | Hover row with trailing add action |
| `Active, Hover=No, With Child=No` | Selected row with left indicator |
| `Active, Hover=With Add, With Child=No` | Selected row with trailing add action |
| `Active, Hover=No, With Child=Yes` | Selected expandable row with visible child menu |

#### Menu Button Shared Rules

| Property | Value |
| --- | --- |
| Sidebar width | `250px` |
| Row height | `43px` to `45px` sample range |
| Horizontal padding | `20px` leading, `12px` trailing on base rows |
| Icon size | `20px` |
| Default label | Regular `14px` neutral text |
| Active label | Bold `14px` brand-blue text |
| Active indicator | `4px` left indicator plus soft blue active container |

### Child Menus

| Variant | Sample Size | Treatment |
| --- | --- | --- |
| `Default` | `198px x 44px` | Neutral text, optional orange count badge |
| `Selected` | `198px x 44px` | Soft brand background with bold blue text |

#### Child Menu Rules

- Child menus are indented inside the parent group.
- Counter pills are optional and use the invoice-orange badge treatment.

### Sidebar Badges

| Badge | Visual Treatment |
| --- | --- |
| `Upgrade` | Soft blue pill with membership icon and semibold `12px` blue text |
| `New` | Red pill with semibold `12px` white text |

### Closed Sidebar

| Property | Value |
| --- | --- |
| Sample size | `60px x 1024px` |
| Layout | Icon-only rail |
| Active treatment | Blue filled active slot |
| Footer | Version label, compact logo, and expand affordance |

### Sidebar Footer

| Property | Value |
| --- | --- |
| Separator | Top divider line |
| Collapse control | Blue-tinted circular button |
| Version style | `10px` regular |
| Brand mark | Compact Labamu logo |
| CTA | Yellow gradient contact button with icon and chevron |

### Desktop Sidemenu Rules

- Use the open sidebar for full desktop navigation contexts and the closed sidebar as the collapsed rail state of the same system.
- Menu rows, child menus, badges, and footer should be treated as reusable subcomponents, not a single flat screenshot-derived layout.
- Use the exported SVG icons as-is for all menu symbols and controls.

## Selectable Card Components

Selectable cards are choice cards that can work as radio-card selectors or tap-select cards without a visible radio, depending on context.

### Selectable Card Specs

| Property | Value |
| --- | --- |
| Width | `265.25px` |
| Height | `82px` |
| Radius | `12px` |
| Padding | `16px` vertical, `20px` left, `12px` right |
| Gap | `12px` between radio and text content |
| Title style | `Title 2, Bold 16` |
| Description style | `Subtitle 2, Regular 14` |
| Radio size | `24px` when shown |

### Selectable Card States

| State | Visual Treatment |
| --- | --- |
| `Default` | White surface with neutral outline and inactive radio |
| `Selected` | `Feature/Brand/ContainerLighter` background, brand-blue border, active radio |

### Selectable Card Behavior

- Clicking the card selects it.
- The card may be used with or without a visible radio button.
- The full card surface, not just the radio, should behave as the selection target.

## Popup Components

Popup components are modal selection and confirmation surfaces that adapt their shell to mobile, tablet, and desktop while keeping the same core content families.

### Popup Families

| Family | Purpose |
| --- | --- |
| `Info` / `Default` | Informational popup with title, body content, and action area |
| `List Single` | Single-select option list popup |
| `List Multi` / `Checkbox` | Multi-select option list popup with checkbox rows |
| `Card List` | Selectable-card popup |
| `Date` | Date selection popup |
| `Date Custom` | Custom date-range popup with conditional field content |

### Popup Platform Shells

| Platform | Base Frame | Shell Pattern | Width | Max Height | Radius |
| --- | --- | --- | --- | --- | --- |
| Mobile | `375 x 812` | Bottom sheet | Full mobile frame width | `680px` | Sheet-style rounded top corners |
| Tablet | `1280 x 800` page with centered popup | Centered modal | `680px` | `880px` | Rounded modal shell |
| Desktop | `1440 x 1024` page with centered popup | Centered modal | `500px` | `800px` | Rounded modal shell |

### Popup Shared Row States

| Row State | Meaning |
| --- | --- |
| `Default` | Standard option row |
| `Selected` | Option row chosen by the user |
| `Click` | Pressed interaction state |
| `Not Found` | Empty-result or unavailable row state |
| `Add New` | Row used to create a new item or value |
| `Add New Click` | Pressed state for the add-new action |

### Popup Card States

| Card State | Meaning |
| --- | --- |
| `Default` | Standard selectable card in popup lists |
| `Disabled` | Non-interactive card option |

### Popup Behavior

- Close the popup when the user taps outside the surface.
- Show an `x` close control on centered tablet and desktop modal variants.
- On mobile checkbox-list popups, show the remove or reset CTA only after the user has selected at least one option.
- On the mobile custom-date popup, show the date-range field only when `Pilih Tanggal` is selected.
- When popup content exceeds the platform max height, keep the shell fixed and make the content region scrollable.
- Use exported SVG icons as-is for close controls, chevrons, calendars, and any other popup iconography.

### Popup Variant Mapping

| Normalized Variant | Mobile Board Label | Tablet Board Label | Desktop Board Label |
| --- | --- | --- | --- |
| Informational popup | `Info` | `Default` | `Default` |
| Single-select list | `ListSingle` | `ListSingle` | `Variant4` |
| Multi-select list | `ListMulti` | `ListMulti` | `Checkbox` |
| Card selection | `CardList` | `Card List` | `Card List` |
| Date picker | `Date` | `Date` | `Variant5` |
| Custom date picker | `DateCustom` | `DateCustom` | `Variant6` |

## OTP Components

OTP components are verification-entry surfaces for WhatsApp and Email delivery flows. The content model is the same across platforms, while the surrounding shell changes by device.

### OTP Variants

| Variant | Delivery Copy |
| --- | --- |
| `WA` | OTP sent via WhatsApp to a phone number |
| `Email` | OTP sent via email address, with spam-check guidance in the email versions |

### OTP Platform Shells

| Platform | Base Frame | Shell Pattern | Primary Heading Style |
| --- | --- | --- | --- |
| Mobile | `375 x 812` | Full-screen page with back navigation | `24px` bold centered heading |
| Tablet | `1280 x 800` | Light page with tablet header and centered modal card | `26px` bold centered heading inside modal |
| Desktop | `1440 x 1024` | Dark overlay with centered modal card | `18px` bold centered heading inside modal |

### OTP Shared Anatomy

| Part | Description |
| --- | --- |
| Page or modal title | `Masukkan Kode OTP` |
| Delivery description | Explains whether code was sent via WhatsApp or Email |
| OTP input group | Six separate digit boxes |
| Resend helper | Countdown message with bold time value |
| Navigation control | Back arrow on mobile and tablet flows, close icon on desktop modal |

### OTP Input Specs

| Property | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Digit count | `6` | `6` | `6` |
| Box shape | Rounded rectangle | Rounded rectangle | Rounded rectangle |
| Box size | About `45.35 x 59.96px` | `52 x 64px` | About `45.35 x 59.96px` |
| Radius | `12px` | `8px` | `12px` |
| Empty border treatment | Neutral border with low opacity | `Neutral 10` border at `1.5px` | Neutral border with low opacity |

### OTP Behavior

- Use six separate digit fields rather than one continuous text field.
- Keep the resend message visible below the OTP inputs, with the countdown value emphasized in bold.
- Use WhatsApp and Email as copy variants only; do not change the OTP input structure between them.
- On Email variants, include the extra instruction to check spam when it appears in Figma.
- Use the exported SVG icons as-is for back and close controls.

## Receipt Components

Receipt components are document-style transaction outputs built from shared metadata rows, item rows, totals, and format wrappers. The board includes both full receipt layouts and the supporting receipt atoms used to assemble them.

### Receipt Support Blocks

| Block | Purpose |
| --- | --- |
| `Company Info` | Merchant identity block with logo, business name, address, and phone |
| `Item/Credential` | Key-value transaction metadata rows |
| `Payment Status` | `Lunas` and `Belum Lunas` status presentation |
| `Order Reference` | Compact order-code formats such as `Grab`, `Meja`, `Antrian`, and `GoFood` |
| `Summary` | Transaction summary rows |
| `Total Pesanan` | Payment-method and final-total block |
| `Modifier` | Indented add-on or note rows under line items |

### Receipt Item Families

| Item Family | Use |
| --- | --- |
| `Cashier / OM / Ledger Item` | Standard itemized sales rows with quantities, prices, and modifiers |
| `Cashier Nominal` | Nominal-value transaction rows |
| `PPOB` | Utility or bill-payment transaction rows |

### Receipt Output Formats

| Output | Variants |
| --- | --- |
| `Receipt POS` | `58`, `72`, `80`, `Digital` |
| `Cashier Recap` | `58`, `72`, `80`, `Digital` |

### Receipt Format Behavior

- Treat the width variant labels `58`, `72`, `80`, and `Digital` as distinct output formats, not simple scale transforms of one same frame.
- Keep the same information hierarchy across receipt widths even when spacing and line wrapping change.
- Use the supporting receipt blocks to compose layouts instead of treating each receipt screenshot as a one-off design.
- Preserve the perforated receipt edge treatment and bordered paper shell for print-style outputs.
- Keep modifiers indented under their parent line item and visually subordinate to the main item row.

### Receipt Digital POS Anatomy

| Part | Detail |
| --- | --- |
| Shell width | `335px` |
| Header | Merchant avatar or logo, merchant name, address, and phone |
| Order reference | Centered transaction code such as `GF-397` |
| Metadata | Transaction credential table |
| Transaction note | Optional `Catatan Transaksi` block |
| Item list | Item rows with quantity-price pairs, modifiers, and optional item notes |
| Accessory marker | Optional `DENGAN ALAT MAKAN` divider section |
| Summary | Subtotal, tax, discount, fee, voucher, point, debt, and related totals |
| Notes | Optional ledger or payment note rows |
| Final payment block | `Total Pesanan`, payment method, issuer or bank, references, paid amount, and change |
| Powered footer | `Powered by` plus Labamu logo lockup |

### Cashier Recap Anatomy

| Part | Detail |
| --- | --- |
| Header | Merchant identity plus `Rekap Penjualan Kasir` divider |
| Time range | `Dari`, `Sampai`, and `Dibuat Oleh` rows |
| Success section | `TRANSAKSI BERHASIL` grouped by payment method |
| Success detail | `RINCIAN BERHASIL` totals and successful-transaction count |
| Void section | `TRANSAKSI VOID` and `RINCIAN TRANSAKSI VOID` |
| Final summary | `RINGKASAN AKHIR`, net sales, transaction count, and average transaction |
| Outstanding order block | `ORDER BELUM LUNAS` summary |
| Footer | Recap author and timestamp |

## Login Components

Login is a composed desktop authentication panel built from the existing logo, text-field, checkbox, and main-button primitives.

### Login Panel Specs

| Property | Value |
| --- | --- |
| Panel size | `550 x 727.5px` |
| Panel padding | `64px` |
| Panel gap | `64px` |
| Radius | `16px` |
| Form column width | `422px` |

### Login Panel Anatomy

| Part | Detail |
| --- | --- |
| Brand header | Labamu logo centered at the top |
| Heading group | `Set Up Your Password` with explanatory subtitle |
| Password fields | Create-password field with helper text and confirm-password field |
| Agreement row | Checkbox plus inline `Terms & Conditions` and `Privacy Policy` links |
| Primary CTA | Full-width main button |
| Closing statement | Centered supporting line: `Labamu help your business to continue growing!` |

### Login Typography

| Element | Style |
| --- | --- |
| Main heading | `Big Title, Bold 24` |
| Subtitle | `Subtitle 2, Regular 14` |
| Field text | `Subtitle 1, Regular 16` |
| Helper text | `Body 1, Regular 12` |
| Closing statement | `Subtitle 2, Regular 14` |

### Login Behavior

- Treat the login panel as a composed auth template, not a new primitive separate from fields, checkbox, and button foundations.
- Keep the two password fields stacked in one form group, with helper guidance shown under the first password field.
- Use the exported SVG icons as-is for password visibility controls and any checkbox or loading states.
- Preserve the inline blue treatment for legal links inside the agreement text.
- The sampled CTA state on the board is disabled with a loading indicator; do not assume that loading is required for every default login button state.

## Email Template Components

Email template components are fixed transactional-email shells with localized content slots. The Indonesian and English variants share the same structure and styling.

### Email Template Variants

| Variant | Locale |
| --- | --- |
| `ID` | Indonesian |
| `EN` | English |

### Email Template Specs

| Property | Value |
| --- | --- |
| Template width | `600px` |
| Hero height | `201px` |
| Corner radius | `24px` |
| Vertical spacing | `32px` between major content groups |
| Separator width | `498px` |

### Email Template Anatomy

| Part | Detail |
| --- | --- |
| Hero illustration | Fixed top illustration banner |
| Headline block | Centered `Title` and `Description` slots |
| Optional CTA | Small blue button under the headline block |
| Separator | Thin centered divider line |
| Security note | Centered warning or support text with inline brand-blue link emphasis |
| Support footer | Light-blue contact panel with social icons, contact channels, and copyright |

### Email Template Typography

| Element | Style |
| --- | --- |
| Title | `Big Title, Bold 24` |
| Description | `Subtitle 1, Regular 16` |
| CTA number token | `Title 2, Bold 16` |
| CTA label | `Subtitle 2, Regular 14` |
| Security note | `Subtitle 2, Regular 14` |
| Footer contact headings | `Description, Bold 10` |
| Footer contact values | `Body 1, Regular 12` |

### Email Template Rules

- Keep the Indonesian and English templates structurally identical; only localized copy should change.
- Treat the CTA as optional, since the component exposes a button toggle in the template definition.
- Keep the support footer as one consistent block with social icons, call center, WhatsApp customer service, and email contact details.
- Preserve the brand-blue emphasis for inline action links inside the security note.
- Use exported SVG icons and brand assets as-is for the CTA chevrons and footer social icons.

## Component Interpretation Notes

- The Buttons board mixes several interactive controls under one component page.
- For prototype generation, treat `Main Button`, `Icon Button`, `Text CTA`, `Toggle`, `Radio Button`, `Checkbox`, and `Nominal Stepper` as separate reusable primitives.
- The board examples consistently pair buttons with icons, but icons should remain optional unless the layout explicitly depends on them.
- When an icon is present, use the exported SVG component as-is.
- Sticky action patterns are platform-specific and should not be flattened into one generic footer component.
- Text fields combine mobile, tablet, and desktop behavior in one family, so counter placement should follow the platform pattern rather than be treated as globally fixed.
- Desktop field patterns are not just larger text fields; they are split-layout form rows with label metadata living outside the input shell.
- Sticky header boards mix shell navigation, page headers, and breadcrumbs, so prototype generation should treat them as layered navigation primitives.
- The status board exposes both strong and soft chip treatments, so emphasis level should drive the choice between `Solid`, `Sheer`, and `Dot` formats.
- Filter pills are stateful selection controls, not generic chip buttons, so their order, color, and label can change after selection.
- `Filter Dropdown` and `Dropdown General` share option-row DNA, but the filter dropdown is a structured filter overlay while the general dropdown is a reusable option-list system attached to inputs.
- The tabs board actually contains two platform patterns: contained tabs for mobile or tablet contexts, and underline tabs for desktop navigation.
- Chips are lightweight selectable pills and should not be merged with filter pills just because both are rounded components.
- Cells are composition wrappers for data surfaces, so prototype generation should assemble them from existing primitives instead of treating each sample as a standalone bespoke component.
- The desktop table is a composed data pattern built from previously defined controls, not a separate primitive library with its own independent styling rules.
- The calendar picker uses one shell across multiple selection models, so the selection mode should drive the variant choice before any layout styling is changed.
- Empty states are composable templates, so future prototypes should swap copy, illustration size, and CTA presence without inventing new empty-state structures each time.
- The navigation bar board contains both mobile bottom navigation and tablet lower-navigation patterns, so platform should drive the variant choice before label or icon tweaks.
- The desktop sidemenu is a shell built from header, menu rows, child rows, badges, and footer actions rather than one indivisible component.
- Selectable cards are choice controls, not content cards; their whole surface should read as a selection target.
- The popup boards describe one cross-platform modal system with different shells, so the content family and platform should drive the variant choice together.
- OTP is one verification pattern reused across WhatsApp and Email flows, with platform differences mostly limited to shell and typography scale.
- The receipt board is a document system, not a single component; future prototypes should compose receipt atoms, document sections, and output formats rather than copy one full receipt verbatim.
- The login panel is an auth template composed from foundations already documented elsewhere, especially text fields, checkbox, and main button.
- The email template is a shell-and-slot communication component, so locale and copy should change without altering the surrounding structure.

## Component Open Notes

- The `Large` text CTA hover state was not directly sampled, but it is likely the same typography with the darker brand blue used by the small hover state.
- Disabled button examples on the board visually include a loading indicator at the leading edge.
- Treat that loading glyph as part of the disabled example shown in Figma, not necessarily as a universal disabled requirement unless the product pattern confirms it.
- The nominal stepper board shows two different `Large` examples with `50px` and `56px` control heights.
- Until clarified in Figma, keep both documented and avoid collapsing them into a single canonical size.
- The text-field behavior note on the board says `Large: Used fot Tablet`; preserve that exact platform intent even though the word `fot` is clearly a Figma typo for `for`.
- The discount-field board makes helper-text visibility clearer in the mobile examples than in the tablet state grid, so treat tablet helper behavior as a board-level ambiguity until another usage example confirms it.
- The infobox metadata variants are labeled with `Close Button=Off`, but the sampled component instances on the board still show a close icon.
- Until clarified in Figma, treat the infobox close control as optional and context-driven, matching the behavior note rather than the variant label alone.
- The separator board names the thicker divider `Section Seperator`, which is almost certainly a Figma typo for `Section Separator`.
- The section-separator sample also mixes `Separator 2` and a lighter neutral overlay in the extracted structure, so treat its visible tone as a board-level artifact until the token source is clarified.
- The tabs board mixes item-size labels such as `Sm`, `Md`, and `Lg` with segmented-group labels such as `Small`, `Size3`, and `Extra Large`.
- Preserve those labels in documentation instead of silently normalizing them, because they may map to different component families in Figma.
- The chips board exposes the full state matrix, but the extracted design-context samples were strongest for `Solid` and only partial for exact `Sheer` state fills.
- Treat `Sheer` as the softer sibling of `Solid` until a direct token export confirms every hover and active surface value.
- The `Title Icon` cell sample shows many utility icons at once, so read it as a capability matrix rather than one mandatory icon bundle.
- The table board labels one state as `Tablle + Slot`, which is clearly a Figma typo for `Table + Slot`.
- The compact footer sample for `>25=False` also includes a leading loading glyph in the extracted rows-per-page selector, so keep that glyph variant-specific rather than universal.
- The dual-month calendar exports were partially truncated in raw design-context output, but the screenshots and visible structure consistently confirm the four variants and their selection behavior.
- The empty-state board says `These buttons are use all across mobile platform.`
- Treat that sentence as board guidance, not as a button-specific rule, since the board is clearly documenting the empty-state template rather than button foundations.
- The navigation bar board mixes locales and product modes in one place, including `Beranda`, `Admin`, `Labaku`, `Home`, `Network`, `Post`, `Invoice`, and `Profile`.
- Preserve those as distinct navigation variants rather than trying to normalize them into one shared label set.
- The desktop sidemenu board title says `Desktop menubar`, while the actual components are consistently structured as sidebars and sidebar rows.
- Treat `Desktop menubar` as the board title only; the reusable system concept is a desktop sidemenu or sidebar.
- The selectable-card board still uses the internal component name `Filter Card` in Figma metadata.
- For documentation and prototype generation, treat that as the same base component reused in a selectable-card context.
- The selectable-card behavior note says `Can be used with our without radio button`, which is clearly a typo for `or without`.
- The popup boards use inconsistent variant labels across platforms, including `Info`, `Default`, `Checkbox`, `Variant4`, `Variant5`, and `Variant6`.
- Preserve those raw Figma labels in source notes, but normalize them by behavior in prototype-generation rules.
- The mobile and desktop popup boards both use `bottomsheet` wording in their behavior notes, even though the desktop visuals are clearly centered modal popups.
- Treat that wording as a board-level naming inconsistency, not as a literal desktop bottom-sheet requirement.
- The receipt board mixes supporting atoms, POS receipts, cashier recap documents, and itemized transaction examples on one page.
- Treat that board as a documentation cluster for receipt-related outputs rather than one flat component family.
- The login board subtitle says `These buttons are use all across desktop platform.`
- Treat that line as board-level guidance or a Figma wording mistake, not as evidence that the page is documenting buttons rather than the login panel.
- The email template CTA sample reads as `94 Action` in extracted design context.
- Treat that string as placeholder sample content inside the template, not as a literal reusable button label.
