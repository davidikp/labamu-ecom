# Untranslated Wording — merchant-backoffice (whole app)

Hardcoded English strings that are **not** wrapped in a `t()` call, scanned across `src/pages` and `src/components`. This app uses `react-i18next` (`useTranslation()` + `src/locales/{en,id}/*.json`) — any string skipped by `t()` renders as raw English even when the UI is switched to Bahasa Indonesia.

Legend:
- **Missing** — no i18n key exists for this string at all; it's a plain JS/JSX literal.
- **Partial** — a similar phrase or fragment is already translated elsewhere in the locale files, but this exact instance isn't wired to it.

Locations are file:line at the time of this review — re-verify before editing, since files may have shifted.

Scope note: of 168 page/component files, only 21 call `useTranslation()` at all. The remaining ~147 render 100% hardcoded English. The **Section Builder** module (the website page-builder editor and its live section renderers) has *zero* i18n coverage — everything in it is listed as Missing.

---

## Auth & Onboarding (39)

| # | English | Location | Status |
|---|---|---|---|
| 1 | Indonesia (language dropdown option) | LoginRevamp.jsx:302 | Missing |
| 2 | English (language dropdown option) | LoginRevamp.jsx:303 | Missing |
| 3 | Confirm Sync Platform? | LabamuOnboarding.jsx:293 | Missing |
| 4 | You're about to set {platform} as your sync platform. This choice is permanent and cannot be changed after onboarding. | LabamuOnboarding.jsx:294 | Missing |
| 5 | Yes, Continue | LabamuOnboarding.jsx:295 | Missing |
| 6 | Cancel | LabamuOnboarding.jsx:296 | Partial ("Cancel" translated elsewhere, not wired here) |
| 7 | Custom page content (default desc) | LabamuOnboarding.jsx:1234 | Missing |
| 8 | Select a section to configure. | LabamuOnboarding.jsx:1447 | Missing |
| 9 | Desktop (viewport toggle) | LabamuOnboarding.jsx:1526 | Missing |
| 10 | Mobile (viewport toggle) | LabamuOnboarding.jsx:1550 | Missing |
| 11 | Labamu / Ecommerce (header brand text) | LabamuOnboarding.jsx:1683-1684 | Partial (`auth:onboarding.header.brand`="ShopFront" exists, not used here) |
| 12 | Important: | LabamuOnboarding.jsx:940 | Missing |
| 13 | The sync platform you select cannot be changed after you complete the onboarding. | LabamuOnboarding.jsx:940 | Missing |
| 14 | LB Business (placeholder) | LabamuOnboarding.jsx:964 | Missing |
| 15 | Bahasa Indonesia (footer language switcher) | LabamuOnboarding.jsx:1096 | Missing |
| 16 | English (footer language switcher) | LabamuOnboarding.jsx:1097 | Partial |
| 17 | Collapse Sidebar / Expand Sidebar (title attr) | LabamuOnboarding.jsx:1131 | Missing |
| 18 | Collapse sidebar / Expand sidebar (aria-label) | LabamuOnboarding.jsx:1132 | Missing |
| 19 | Preview Image (modal title) | LabamuOnboarding.jsx:1172 | Missing |
| 20 | Make sure the image is fully visible and within the area. | LabamuOnboarding.jsx:1173 | Missing |
| 21 | First-time setup (badge) | FirstTimeBoth.jsx:97 | Missing |
| 22 | Let's get your storefront ready | FirstTimeBoth.jsx:105 | Missing |
| 23 | You have access to both Labamu App and MRP. Choose your sync platform during setup to connect your storefront. | FirstTimeBoth.jsx:108 | Missing |
| 24 | Confirm your business information / Choose your sync platform / Choose your website template and style / Continue to your merchant dashboard (steps) | FirstTimeBoth.jsx:114-117 | Missing |
| 25 | Welcome to Labamu Ecommerce | FirstTimeBoth.jsx:155 | Partial (`auth:firstTime.title` is a related but not identical string) |
| 26 | You have access to both Labamu App and MRP. You'll choose your preferred sync platform during the setup. | FirstTimeBoth.jsx:157 | Missing |
| 27 | Important: sync platform is permanent | FirstTimeBoth.jsx:178 | Missing |
| 28 | The sync platform you choose during setup cannot be changed afterwards. Choose carefully. | FirstTimeBoth.jsx:181 | Missing |
| 29 | First-time setup / Let's get your storefront ready / step list / Labamu App access / "Your account is ready..." | FirstTimeLabamu.jsx:97-176 | Missing (8 strings, same pattern as FirstTimeBoth) |
| 30 | First-time setup / Let's get your storefront ready / step list / Welcome to Labamu Ecommerce / MRP access / "Your account is ready..." | FirstTimeMRP.jsx:97-176 | Missing/Partial (10 strings, same pattern) |

*(SSOError.jsx and Login.jsx — clean, no hardcoded strings.)*

---

## Dashboard, Company Profile & Modifiers (33)

| # | English | Location | Status |
|---|---|---|---|
| 1 | Labamu Icon (img alt) | Dashboard.jsx:83 | Missing |
| 2 | Logo (img alt) | CompanyProfile.jsx:106 | Missing |
| 3 | Company data is unavailable. | CompanyProfile.jsx:60 | Missing |
| 4 | Free | ConnectedModifiers.jsx:8 | Missing |
| 5 | Min 1, Max {max} / Optional, Max {max} | ConnectedModifiers.jsx:14 | Missing |
| 6 | Collapse / Expand (aria-label) | ConnectedModifiers.jsx:48 | Missing |
| 7 | Catalog Detail (fallback name) | ConnectedModifiers.jsx:95 | Missing |
| 8 | Connected Modifier (title) | ConnectedModifiers.jsx:113 | Missing |
| 9 | Catalog (breadcrumb) | ConnectedModifiers.jsx:115 | Missing |
| 10 | Failed to load modifiers | ConnectedModifiers.jsx:125 | Missing |
| 11 | No Connected Modifiers | ConnectedModifiers.jsx:142 | Missing |
| 12 | This catalog doesn't have any modifiers connected yet. | ConnectedModifiers.jsx:143 | Missing |
| 13 | Failed to load modifiers | ModifierList.jsx:53, 95 | Missing |
| 14 | Modifier (h1 title) | ModifierList.jsx:83 | Missing |
| 15 | Search (placeholder) | ModifierList.jsx:89 | Partial (generic "Cari..." exists but not wired) |
| 16 | Modifier Name / Modifier Options / Connected Catalog (table headers) | ModifierList.jsx:103-105 | Missing |
| 17 | No Search Results Found / No Modifier Yet | ModifierList.jsx:118 | Missing |
| 18 | Try searching with a different term, okay? / We couldn't find any modifier from your connected store. | ModifierList.jsx:119 | Missing |
| 19 | Loading… / No results / from {total} rows | ModifierList.jsx:145 | Missing |
| 20 | Close (aria-label) | ModifierDetail.jsx:15 | Missing |
| 21 | Services connected to this modifier will become unavailable | ModifierDetail.jsx:21 | Missing |
| 22 | This modifier must be selected at least {MIN_ACTIVE}. | ModifierDetail.jsx:24 | Missing |
| 23 | Deactivate Modifier / Cancel (buttons) | ModifierDetail.jsx:29-32 | Missing |
| 24 | Free | ModifierDetail.jsx:41 | Missing |
| 25 | Modifier (breadcrumb title/name fallback) | ModifierDetail.jsx:126-127 | Missing |
| 26 | Failed to load modifier | ModifierDetail.jsx:134 | Missing |
| 27 | Modifier has been enabled / disabled (snackbar) | ModifierDetail.jsx:91 | Missing |
| 28 | Modifier Availability | ModifierDetail.jsx:154 | Missing |
| 29 | Click the toggle to set availability | ModifierDetail.jsx:155 | Missing |
| 30 | At least {MIN_ACTIVE} options must be active to enable this modifier. | ModifierDetail.jsx:162 | Missing |
| 31 | Modifier not found | ModifierDetail.jsx:178 | Missing |
| 32 | Connected Catalog | ModifierDetail.jsx:185 | Missing |
| 33 | No connected catalog | ModifierDetail.jsx:187 | Missing |

---

## Catalog: Products, Settings, Bulk Edit, Packages (133)

| # | English | Location | Status |
|---|---|---|---|
| 1 | Loading Data / Please wait a moment | CatalogProducts.jsx:55-56 | Missing |
| 2 | Catalog has been enabled/disabled from website | CatalogProducts.jsx:218 | Missing |
| 3 | Failed to change website visibility | CatalogProducts.jsx:221 | Missing |
| 4 | Weight or Volume Required | CatalogProducts.jsx:269 | Missing |
| 5 | Some products are missing weight or volume information. Complete these details so delivery services can calculate shipping costs accurately. | CatalogProducts.jsx:270 | Missing |
| 6 | Category / Unit (summary card titles) | CatalogProducts.jsx:277, 293 | Missing |
| 7 | Total / View Detail (summary cards) | CatalogProducts.jsx:280-300 | Missing |
| 8 | Category (FilterPill label) | CatalogProducts.jsx:316 | Missing |
| 9 | {selectedCount} Catalog Selected / Bulk Edit | CatalogProducts.jsx:336-342 | Missing |
| 10 | Loading… / No results / from {total} rows | CatalogProducts.jsx:451 | Missing |
| 11 | Failed to load categories / units | CatalogSettings.jsx:163, 179 | Missing |
| 12 | Category order updated | CatalogSettings.jsx:231 | Missing |
| 13 | Catalog Settings / Catalog (breadcrumb) | CatalogSettings.jsx:256-257 | Missing |
| 14 | Category / Unit (tab labels) | CatalogSettings.jsx:268 | Missing |
| 15 | Search category name… / Search unit name… | CatalogSettings.jsx:274-275 | Missing |
| 16 | Click, hold, and drag the category to the position you want. | CatalogSettings.jsx:285 | Missing |
| 17 | Changing category orders will also change the display of your Online Catalog. | CatalogSettings.jsx:286 | Missing |
| 18 | Cancel / Save Category Order / Change Category Order | CatalogSettings.jsx:289-298 | Missing |
| 19 | Category Name / Total Products (headers) | CatalogSettings.jsx:314-315 | Missing |
| 20 | No Search Results Found / No Category Yet + descriptions | CatalogSettings.jsx:326-327 | Missing |
| 21 | Show {n} from {n} rows | CatalogSettings.jsx:366 | Missing |
| 22 | Unit / Number of Catalog (headers) | CatalogSettings.jsx:384-388 | Missing |
| 23 | No Search Results Found / No Unit Yet + descriptions | CatalogSettings.jsx:402-403 | Missing |
| 24 | No results / from {total} rows | CatalogSettings.jsx:96 | Missing |
| 25 | Show on Website / Hide from Website | BulkEditCatalog.jsx:9-10 | Missing |
| 26 | Package / Catalog (label) | BulkEditCatalog.jsx:38 | Missing |
| 27 | No items selected for bulk edit. | BulkEditCatalog.jsx:84 | Missing |
| 28 | ← Back to {label} | BulkEditCatalog.jsx:85 | Missing |
| 29 | Applied to selected rows / Changes saved | BulkEditCatalog.jsx:120, 145 | Missing |
| 30 | Bulk Edit {label} | BulkEditCatalog.jsx:156 | Missing |
| 31 | Weight or Volume Required + description | BulkEditCatalog.jsx:165-166 | Missing |
| 32 | Input weight/length/width/height (placeholders, x2) | BulkEditCatalog.jsx:174-179, 215-218 | Missing |
| 33 | Select Web Visibility / Apply to Selected | BulkEditCatalog.jsx:181-188 | Missing |
| 34 | {label} Name / table headers (Weight, Length, Width, Height, Website Visibility) | BulkEditCatalog.jsx:200-205 | Missing |
| 35 | Show {n} from {n} rows | BulkEditCatalog.jsx:232 | Missing |
| 36 | Cancel Edit / Save Changes | BulkEditCatalog.jsx:239-240 | Missing |
| 37 | Discard Changes? / Yes, Discard / Cancel | BulkEditCatalog.jsx:246-249 | Missing |
| 38 | No Changes Made / Please update the catalog value before saving / Okay | BulkEditCatalog.jsx:255-258 | Missing |
| 39 | Catalog has been enabled/disabled from website | ProductDetail.jsx:96 | Missing |
| 40 | Failed to change website visibility | ProductDetail.jsx:99 | Missing |
| 41 | Catalog has been enabled/disabled for fragile handling | ProductDetail.jsx:112 | Missing |
| 42 | Failed to change fragile handling | ProductDetail.jsx:115 | Missing |
| 43 | Delivery properties updated | ProductDetail.jsx:140 | Missing |
| 44 | Catalog Detail | ProductDetail.jsx:153 | Missing |
| 45 | Edit Delivery Properties | ProductDetail.jsx:165 | Partial (same untranslated phrase repeats in PackageDetail.jsx:117) |
| 46 | Failed to load product / Product not found | ProductDetail.jsx:174, 191 | Missing |
| 47 | ← Back to Catalog | ProductDetail.jsx:178, 192 | Missing |
| 48 | Modifier | ProductDetail.jsx:267 | Missing |
| 49 | E-Commerce Delivery / Eligible / Pickup Only | ProductDetail.jsx:284-286 | Missing |
| 50 | Add the product's weight and volume to enable delivery services. | ProductDetail.jsx:289 | Missing |
| 51 | Total Weight / Volume | ProductDetail.jsx:293-299 | Missing |
| 52 | Show on Website + description | ProductDetail.jsx:315-316 | Missing |
| 53 | Fragile Handling + description | ProductDetail.jsx:326-327 | Missing |
| 54 | Failed to load packages | PackageList.jsx:75, 160 | Missing |
| 55 | Package has been enabled/disabled from website | PackageList.jsx:116 | Missing |
| 56 | Failed to change website visibility | PackageList.jsx:119 | Missing |
| 57 | Package (page title) | PackageList.jsx:132 | Missing |
| 58 | Weight or Volume Required + description | PackageList.jsx:136-137 | Missing |
| 59 | Search (placeholder) | PackageList.jsx:146 | Missing |
| 60 | {selectedCount} Package Selected / Bulk Edit | PackageList.jsx:153-154 | Missing |
| 61 | Image / Package Name / Weight / Volume / Selling Price / Website Visibility (headers) | PackageList.jsx:171-176 | Missing |
| 62 | No Search Results Found / No Packages Yet + descriptions | PackageList.jsx:189-190 | Missing |
| 63 | Loading… / No results / from {total} rows | PackageList.jsx:226 | Missing |
| 64 | Package has been enabled/disabled from website | PackageDetail.jsx:62 | Missing |
| 65 | Failed to change website visibility | PackageDetail.jsx:65 | Missing |
| 66 | Package has been enabled/disabled for fragile handling | PackageDetail.jsx:78 | Missing |
| 67 | Failed to change fragile handling | PackageDetail.jsx:81 | Missing |
| 68 | Delivery properties updated | PackageDetail.jsx:96 | Missing |
| 69 | Package Detail / Catalog (breadcrumb) | PackageDetail.jsx:112-113 | Missing |
| 70 | Edit Delivery Properties | PackageDetail.jsx:117 | Missing |
| 71 | Failed to load package | PackageDetail.jsx:123 | Missing |
| 72 | SKU / Sold {n} times | PackageDetail.jsx:171, 177 | Missing |
| 73 | Show on Website + description | PackageDetail.jsx:182-183 | Missing |
| 74 | Fragile Handling + description | PackageDetail.jsx:186-187 | Missing |
| 75 | Package not found | PackageDetail.jsx:191 | Missing |
| 76 | E-Commerce Delivery / Eligible / Pickup Only | PackageDetail.jsx:199-200 | Missing |
| 77 | Add the product's weight and volume to enable delivery services. | PackageDetail.jsx:203 | Missing |
| 78 | Total Weight / Volume | PackageDetail.jsx:207-211 | Missing |
| 79 | Catalog List / Out of stock | PackageDetail.jsx:221, 233 | Missing |
| 80 | Total Weight/Length/Width/Height labels + "{label} must be greater than 0" | DeliveryCards.jsx:55-61 | Missing |
| 81 | Delivery Properties / Save | DeliveryCards.jsx:89-90 | Missing |
| 82 | Total Weight + "Make sure the weight includes packaging" | DeliveryCards.jsx:96-99 | Missing |
| 83 | Volume + volumetric-weight description / Learn More | DeliveryCards.jsx:107-111 | Missing |
| 84 | Input weight / Length / Width / Height (placeholders) | DeliveryCards.jsx:102, 115-117 | Missing |
| 85 | How to Calculate Size + instructions / Okay, Got it | DeliveryCards.jsx:132-134 | Missing |
| 86 | Height / Length / Width (SVG labels) | DeliveryCards.jsx:144-146 | Missing |

*(ImagePlaceholder.jsx — clean, no user-facing text.)*

---

## Delivery Settings (8)

| # | English | Location | Status |
|---|---|---|---|
| 1 | e.g. 12345 (placeholder) | DeliverySettings.jsx:235 | Missing |
| 2 | Lalamove (alt/span, x2 pairs) | DeliverySettings.jsx:396-397, 429-430 | Missing |
| 3 | Lalamove Partner Portal login (alt) | DeliverySettings.jsx:506 | Missing |
| 4 | Lalamove API Keys page (alt) | DeliverySettings.jsx:540 | Missing |
| 5 | © OpenStreetMap contributors | StaticMapPreview.jsx:73 | Missing |

*(deliverySettingsStorage.js — clean, no rendered UI text.)*

---

## Website Studio: Templates, Builder, Shop Page (67)

| # | English | Location | Status |
|---|---|---|---|
| 1 | Editor Coming Soon! (alert) | WebsiteTemplates.jsx:73 | Missing |
| 2 | Desktop / Mobile (viewport toggle) | PreviewLayout.jsx:65, 77 | Missing |
| 3 | Custom Page / Custom page content (fallback title/desc) | TemplateBuilder.jsx:98 | Missing |
| 4 | Select a section to configure. | TemplateBuilder.jsx:210 | Missing |
| 5 | Website published! (Mock) (alert) | TemplateBuilder.jsx:324 | Missing |
| 6 | Collapse Sidebar / Expand Sidebar (title attr) | TemplateBuilder.jsx:335 | Missing |
| 7 | Desktop / Mobile (viewport toggle) | TemplateBuilder.jsx:368, 375 | Missing |
| 8 | Preview Image + description (modal) | TemplateBuilder.jsx:407-408 | Missing |
| 9 | Newest to Oldest / Oldest to Newest / Price: Low to High / Price: High to Low (sort options) | ShopPage.jsx:6-9 | Missing |
| 10 | All Categories / All | ShopPage.jsx:78, 88 | Missing |
| 11 | Price Filter / Lowest Price / Highest Price (placeholders) | ShopPage.jsx:127-139 | Missing |
| 12 | Add to cart (aria-label) | ShopPage.jsx:225 | Missing |
| 13 | No products found / "{from}-{to} from {total} products" | ShopPage.jsx:307, 423 | Partial |
| 14 | Category (label) | ShopPage.jsx:312 | Missing |
| 15 | Price Filter (mobile chip) / Lowest Price / Highest Price (mobile) | ShopPage.jsx:383-393 | Missing |
| 16 | Sort by | ShopPage.jsx:437 | Missing |
| 17 | Catalog not available / "This seller doesn't have any products listed at the moment." / No products found. | ShopPage.jsx:717-726 | Partial |
| 18 | Salutation / Select salutation (placeholder) | HouzezPreview.jsx:1537, 1544 | Missing |
| 19 | Qty: (inline label) | HouzezPreview.jsx:1721 | Missing |
| 20 | Add to cart (aria-label) | HouzezPreview.jsx:2685 | Missing |
| 21 | Search... / No results | AddLanguagePill.jsx:87, 107 | Missing |
| 22 | Drag and drop or click to upload image / Accepted formats: JPG, JPEG & PNG / (Max 5MB) / "{label} uploaded" | FileUploadBox.jsx:27-32 | Missing |
| 23 | Appointment Title / Appointment Subtitle (labels) | AppointmentPanel.jsx:8-9 | Missing |
| 24 | Phone (label) / Banner {n} / Footer + description / Business Name + placeholder / Email + placeholder / Footer Description | BusinessPanel.jsx:25-128 | Missing |
| 25 | Salutation / Email / Phone (toggle labels) / Name / Message (always-required) | ContactPanel.jsx:7-12 | Missing |
| 26 | General + description / Section Title / Contact Us (placeholder) / Section Description / placeholder text / Contact Section Header Image | ContactPanel.jsx:20-45 | Missing/Partial |
| 27 | Drag and drop or click to upload image / Accepted formats... | ContactPanel.jsx:60-61 | Missing |
| 28 | Required Fields + description / Always required | ContactPanel.jsx:72-82 | Missing |
| 29 | Forward Contact Us Form + description / Business Email + placeholder / Confirmation Message + placeholder | ContactPanel.jsx:114-130 | Missing |
| 30 | Section Title / Section Subtitle / Business Address + description / Street Address / City / Province / State / Postal Code / Country | LocationPanel.jsx:10-29 | Missing |
| 31 | Quote Request Section + description / Section Title / Request a Quote (placeholder) / Section Description + placeholder / Background Image + fallback note | QuotePanel.jsx:11-49 | Missing/Partial |
| 32 | Reviews Title (label) | ReviewsPanel.jsx:8 | Missing |
| 33 | Homepage Sections + description / Remove section / Add section / empty-state text | ShopPanel.jsx:64-114 | Missing |
| 34 | Custom Page / Custom link on your menu (fallback) / Online Checkout | FeaturesStep.jsx:26-86 | Missing |
| 35 | Domain connection initiated (mock) (alert) | PublishStep.jsx:63 | Missing |
| 36 | The quick brown fox (font preview sample) | StylingStep.jsx:36 | Missing |

*(ConfigSection.jsx, DeleteIconButton.jsx, InputField.jsx, LangPillsBar.jsx, Switch.jsx, CustomPagePanel.jsx, ConfigureStep.jsx — clean, all text is passed-through props or already translated.)*

---

## Section Builder — Editor Shell (78)

No file in this module calls `useTranslation()` — the entire website page-builder editor is untranslated.

| # | English | Location | Status |
|---|---|---|---|
| 1 | This preview link is invalid or has expired. | PreviewLive.jsx:19 | Missing |
| 2 | Reorder sections / Add {type} / Duplicate {type} / Delete {type} / Add page / Rename page / Delete page / Update page SEO / Toggle page navigation visibility / Theme preset → {name} / Show/Hide {label} (undo-redo meta labels) | SectionBuilder.jsx:106-223 | Missing |
| 3 | Discard all unpublished changes? Your store will revert to the last published version. This can't be undone. / Discard | SectionBuilder.jsx:362-363 | Missing |
| 4 | Your store is live! / View live store → | SectionBuilder.jsx:371-373 | Missing |
| 5 | Add section / "Your page is getting long..." / Dismiss / "Remove a section to add more (max {n})" | AddSectionList.jsx:23-51 | Missing |
| 6 | Unknown section type: {type} / {label} hidden / Move up/down / Duplicate / Delete (buttons + aria-labels) | Canvas.jsx:11-109 | Missing |
| 7 | Delete this section? This can't be undone. / Delete / Cancel | Canvas.jsx:122-135 | Missing |
| 8 | No sections yet | Canvas.jsx:190 | Missing |
| 9 | {editorName} is currently editing this store. Publishing may overwrite their changes. | ConcurrentEditingBanner.jsx:12 | Missing |
| 10 | Confirm (default label) / Cancel | ConfirmDialog.jsx:11, 26 | Missing |
| 11 | moments ago / {n} minute(s) ago / {n} hour(s) ago / Draft restored from {time}. / Keep draft / Discard and load last published | DraftRecoveryBanner.jsx:3-21 | Missing |
| 12 | Unsupported file type — use JPG, PNG, WebP, or SVG. / File too large — max 10MB. Try compressing your image. | MediaLibraryPanel.jsx:33-36 | Missing |
| 13 | Media library / Close / Choose an image / Search by filename (placeholder) | MediaLibraryPanel.jsx:79-95 | Missing |
| 14 | No images yet. Upload your first image above. / No images match '{query}'. Try a different name. | MediaLibraryPanel.jsx:102-104 | Missing |
| 15 | Delete (aria-label) / Delete anyway / "This image is used in {sections}..." / "Delete {filename}? This can't be undone." | MediaLibraryPanel.jsx:125-146 | Missing |
| 16 | + Add page / Page name / About Us (placeholder) / URL slug / "This slug is already in use." / Cancel / Create | PagesPanel.jsx:48-92 | Missing |
| 17 | SEO / Meta title / Meta description + placeholder (x2) | PagesPanel.jsx:108-140 | Missing |
| 18 | Rename / Show-Hide navigation / Delete (aria-labels, buttons) | PagesPanel.jsx:180-205 | Missing |
| 19 | "Delete {page.name}? Shoppers visiting this URL will see a 404. This can't be undone." | PagesPanel.jsx:204 | Missing |
| 20 | Pages / {n} pages / System pages / Custom pages / "No custom pages yet. Create one below." | PagesPanel.jsx:225-250 | Missing |
| 21 | Before you publish / Close / "Your store may not work correctly for shoppers." / Publish anyway | PublishDrawer.jsx:24-57 | Missing |
| 22 | Drag to reorder (aria-label) | SectionListItem.jsx:25 | Missing |
| 23 | Select a section to edit / "Click any section on the canvas or in the sidebar to open its settings" | SettingsPanel.jsx:19-22 | Missing |
| 24 | Header / Footer (labels) / (hidden) / Show / Hide / Sections / Pages (tabs) / {n}/{max} sections | Sidebar.jsx:29-134 | Missing |
| 25 | Media library / Theme settings (aria-labels) / Global (heading) / "Add your first section below" / Sections (compact-mode) | Sidebar.jsx:104-207 | Missing |
| 26 | Apply / Add to cart (sample) / Theme / Presets / Sample / "Apply {preset.name}? ..." | ThemePanel.jsx:26-113 | Missing |
| 27 | Storefront Builder / "You have unsaved changes" / Undo / Redo / Preview / Publish / More options / Discard changes | TopBar.jsx:37-101 | Missing |
| 28 | Desktop / Mobile / Viewport (aria-label) | ViewportToggle.jsx:2-12 | Missing |
| 29 | {slot} (swatch title) | fields/ColorField.jsx:21 | Missing |
| 30 | Good contrast / Low contrast | fields/ContrastBadge.jsx:14 | Missing |
| 31 | My Store — the quick brown fox jumps over the lazy dog (font sample) | fields/FontPickerField.jsx:28 | Missing |
| 32 | Unsupported file type... / File too large — max 10MB / "Image was deleted..." / Choose from library | fields/ImageField.jsx:31-81 | Missing |
| 33 | Item {n} / Remove item / "Max {n} items reached" / Add item / Drag to reorder | fields/RepeaterField.jsx:36-139 | Missing |

*(BooleanField, ColorField, PaletteColorField, RangeField, RichTextField, TextField, ThemeSchemaField, SelectField, SchemaField only render dynamic labels from schema config — no additional hardcoded literals in the components themselves.)*

---

## Section Builder — Live Section Renderers (43)

These render merchant-authored website sections; entries marked *default-content fallback* are placeholder copy that ships until the merchant edits it (lower priority) — entries marked *static chrome* are labels/buttons/placeholders the renderer itself always outputs regardless of merchant content (higher priority, real gap).

| # | English | Location | Status |
|---|---|---|---|
| 1 | Free shipping on orders over $50 | announcement_bar/Renderer.jsx:13 | Missing — default-content fallback |
| 2 | Why shop with us | brand_values/Renderer.jsx:14 | Missing — default-content fallback |
| 3 | Add your first brand value below | brand_values/Renderer.jsx:17 | Missing — static chrome |
| 4 | Value | brand_values/Renderer.jsx:23 | Missing — static chrome |
| 5 | Shop by category | collection_list/Renderer.jsx:17 | Missing — default-content fallback |
| 6 | No image | collection_list/Renderer.jsx:23 | Missing — static chrome |
| 7 | Get in touch | contact_form/Renderer.jsx:11 | Missing — default-content fallback |
| 8 | Your name / Your email / Phone / Subject / Your message (form placeholders) | contact_form/Renderer.jsx:14-18 | Missing — static chrome |
| 9 | Send (button) | contact_form/Renderer.jsx:19 | Missing — static chrome |
| 10 | Spacer ({height}px) | divider_spacer/Renderer.jsx:21 | Missing — static chrome (builder-only) |
| 11 | Question | faq_accordion/Renderer.jsx:13 | Missing — static chrome |
| 12 | Answer goes here. | faq_accordion/Renderer.jsx:19 | Missing — default-content fallback |
| 13 | Frequently asked questions | faq_accordion/Renderer.jsx:45 | Missing — default-content fallback |
| 14 | Add your first FAQ below | faq_accordion/Renderer.jsx:48 | Missing — static chrome |
| 15 | No image | featured_products/Renderer.jsx:12 | Missing — static chrome |
| 16 | Sold out | featured_products/Renderer.jsx:18 | Missing — static chrome |
| 17 | Featured products | featured_products/Renderer.jsx:44 | Missing — default-content fallback |
| 18 | View all products | featured_products/Renderer.jsx:52 | Missing — static chrome |
| 19 | Links / Link (fallback labels) | footer/Renderer.jsx:17-20 | Missing — static chrome |
| 20 | © {year} My Store. All rights reserved. | footer/Renderer.jsx:28 | Missing — default-content fallback |
| 21 | IG FB TikTok (social icon placeholder text) | footer/Renderer.jsx:29 | Missing — static chrome |
| 22 | Shop / About (default nav links) | header/Renderer.jsx:9-10 | Missing — default-content fallback |
| 23 | My Store | header/Renderer.jsx:15 | Missing — default-content fallback |
| 24 | Link (fallback label) | header/Renderer.jsx:18 | Missing — static chrome |
| 25 | Welcome to our store | hero_banner/Renderer.jsx:27 | Missing — default-content fallback |
| 26 | Shop now | hero_banner/Renderer.jsx:30 | Missing — default-content fallback |
| 27 | No image | image_with_text/Renderer.jsx:13 | Missing — static chrome |
| 28 | About our story | image_with_text/Renderer.jsx:24 | Missing — default-content fallback |
| 29 | Join our newsletter | newsletter_signup/Renderer.jsx:16 | Missing — default-content fallback |
| 30 | your@email.com (placeholder) | newsletter_signup/Renderer.jsx:22 | Missing — static chrome |
| 31 | Subscribe (button) | newsletter_signup/Renderer.jsx:26 | Missing — default-content fallback |
| 32 | No spam. Unsubscribe anytime. | newsletter_signup/Renderer.jsx:30 | Missing — default-content fallback |
| 33 | Add content to this section. | rich_text/Renderer.jsx:19 | Missing — static chrome |
| 34 | What customers say | testimonials/Renderer.jsx:15 | Missing — default-content fallback |
| 35 | Add your first quote below | testimonials/Renderer.jsx:18 | Missing — static chrome |
| 36 | Great experience! / Happy customer | testimonials/Renderer.jsx:26-27 | Missing — default-content fallback |

---

## Shared UI Components (16)

Wide blast radius — used across many pages.

| # | English | Location | Status |
|---|---|---|---|
| 1 | Labamu / Ecommerce / by Labamu (sidebar brand) | Layout.jsx:131-135 | Missing |
| 2 | Expand/Collapse sidebar (aria-label) | Layout.jsx:330 | Missing |
| 3 | John Doe / Admin (user menu placeholders) | Layout.jsx:503-504 | Missing |
| 4 | User menu (aria-label) | Layout.jsx:499 | Missing |
| 5 | Company Profile (menu item) | Layout.jsx:523 | Missing |
| 6 | Indonesia / English (language label) | Layout.jsx:14 | Missing |
| 7 | Fallback menu labels passed as t() defaultValue (Dashboard, Manage Catalog, Catalog, Package, Modifier, Orders, Request for Quotes, Bookings, Reviews, Delivery Settings, Domain Setup, Customize Domain, Website Tracking, Role Management) | Layout.jsx:18-39 | Partial — real keys exist and are used, these are fallback-only |
| 8 | Something went wrong in the preview | ErrorBoundary.jsx:34 | Missing |
| 9 | The preview engine encountered an error during reordering. Please try refreshing or continuing your edits. | ErrorBoundary.jsx:36 | Missing |
| 10 | Retry Preview | ErrorBoundary.jsx:50 | Missing |
| 11 | Preview Image / "Make sure the image is fully visible and within the area." (default props) | ImageCropModal.jsx:48-49 | Missing |
| 12 | Save (button) | ImageCropModal.jsx:204 | Partial ("Save" translated elsewhere in dashboard/delivery/website) |
| 13 | Select option (default placeholder prop) | Dropdown.jsx:19 | Partial (only swapped for t() when value is exactly "Select option") |
| 14 | Search... (options panel input) | Dropdown.jsx:261 | Partial (common.json has translated "Search...", not wired here) |
| 15 | Phone Number (default placeholder prop) | PhoneInput.jsx:233 | Partial (common.json has translated version, not wired here) |

*(Button.jsx, IconButton.jsx, Input.jsx, PageHeader.jsx, Stepper.jsx, Snackbar.jsx — clean, all text is passed-through props or already translated.)*

---

## Summary

| Module | Findings |
|---|---|
| Auth & Onboarding | 39 |
| Dashboard, Company Profile & Modifiers | 33 |
| Catalog (Products, Settings, Bulk Edit, Packages) | 133 |
| Delivery Settings | 8 |
| Website Studio (Templates, Builder, Shop Page) | 67 |
| Section Builder — Editor Shell | 78 |
| Section Builder — Live Section Renderers | 43 |
| Shared UI Components | 16 |
| **Total** | **~417** |

## Suggested priority order
1. **Shared UI Components** — smallest fix, largest blast radius (Layout.jsx, Dropdown, PhoneInput, ImageCropModal appear on nearly every page).
2. **Catalog module** — largest single feature area and heavily used day-to-day.
3. **Section Builder editor shell** — currently has zero i18n at all; needs `useTranslation()` wired in from scratch, not just missing keys added.
4. **Section Builder renderers** — lower priority for "static chrome" rows; "default-content fallback" rows are lowest priority since merchants typically overwrite them.
5. **Auth/Onboarding, Dashboard, Delivery, Website Studio** — moderate priority, mostly single-instance strings.
