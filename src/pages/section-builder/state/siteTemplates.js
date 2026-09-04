import { defaultsForSchema } from '../sections/schemaDefaults';
import { schemaForType } from '../sections/index';
import { seedBlocks, sectionSupportsBlocks } from '../sections/blockHelpers';
import { blockDef } from '../sections/blocks/registry';
import { defaultTheme, createDefaultGlobals } from './defaultTheme';
import { defaultProductItems } from '../sections/featured_products/schema';

/**
 * @module section-builder/state/siteTemplates
 * @description Business-type "site templates" — each bundles a visual theme
 * (same `{typography, colors}` shape as `sections/themePresets.js`), a
 * header/footer content override, a bundled media library (real,
 * free-license stock photography under public/assets/templates/<id>/), and
 * a default page/section scaffold — reusing only existing section types (no
 * new renderers). Templates are named after business-type flavors purely as
 * a naming convention for the picker UI — this has no relationship to any
 * actual merchant business-type/industry selection elsewhere in the app.
 *
 * Two distinct application modes (see builderReducer.js):
 *  - "seed" (APPLY_SITE_TEMPLATE_SEED): first-ever template pick for a site —
 *    replaces theme, pages, header/footer, AND media library.
 *  - "reskin" (APPLY_SITE_TEMPLATE_RESKIN): switching templates afterwards —
 *    replaces theme.colors/typography only. Page structure, section
 *    arrangement, header/footer content, media, and any section
 *    customization are left untouched.
 *
 * Image fields don't hold a URL — they hold `{ mediaId }`, resolved against
 * the store's mediaLibrary (see ui/fields/imageValue.js). `media(...)` below
 * builds real media-library-shaped records; `image(mediaId)` builds the
 * `{ mediaId }` reference an image field expects.
 */

function defaultSection(id, type, overrides = {}, customBlocks) {
  return {
    id,
    type,
    data: { ...defaultsForSchema(schemaForType(type)), ...overrides },
    ...(customBlocks !== undefined
      ? { blocks: customBlocks }
      : sectionSupportsBlocks(type) ? { blocks: seedBlocks(type) } : {}),
  };
}

function image(mediaId) {
  return { mediaId };
}

/** A hand-authored block with real content, merged over that block type's
 * own field defaults — used where a template needs specific copy in blocks
 * that `seedBlocks`' generic presets wouldn't produce (e.g. a hero banner
 * with no button preset, or a testimonials section with real quotes). */
function block(type, overrides = {}) {
  const def = blockDef(type);
  return { id: crypto.randomUUID(), type, data: { ...defaultsForSchema(def?.fields ?? {}), ...overrides } };
}

/** Photos are free-license stock (Unsplash License / Pexels License — free
 * for commercial use, no attribution required), downloaded once into
 * public/assets/templates/<id>/ rather than hotlinked. */
function media(templateId, entries) {
  return entries.map(({ key, filename, width, height }) => ({
    id: `${templateId}-${key}`,
    filename,
    url: `/assets/templates/${templateId}/${filename}`,
    width,
    height,
    uploadedAt: '2026-01-01T00:00:00.000Z',
  }));
}

export const SITE_TEMPLATES = [
  {
    id: 'clothing',
    name: 'Clothing',
    theme: {
      typography: { heading_font: 'Cormorant Garamond', body_font: 'Lora', heading_size: 'large', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#ffffff', surface: '#f5f2ef', primary: '#1a1a1a', primary_text: '#ffffff',
        accent: '#b08968', accent_text: '#ffffff', text_primary: '#1a1a1a', text_secondary: '#6b6b6b', border: '#e5e0da',
      },
    },
    // Editorial, minimal identity — logo left, nav inline (Renderer.jsx's
    // default layout), plain-text logo.
    header: { layout_variant: 'inline', logo_text: 'Horizon & Co.' },
    // Centered, editorial footer to match the inline header's understated,
    // minimal identity — no link columns competing for attention.
    footer: { layout_variant: 'centered-tagline', tagline: 'Considered essentials, made to last.' },
    media: media('clothing', [
      { key: 'hero', filename: 'hero.jpg', width: 1600, height: 1067 },
      { key: 'secondary', filename: 'secondary.jpg', width: 1200, height: 801 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('clothing-home-hero', 'hero_banner', { background_image: image('clothing-hero') }),
          defaultSection('clothing-home-announcement', 'announcement_bar'),
          // Explicit collections list (rather than the "show everything"
          // fallback) so this theme's category row stays exactly what it
          // was before mocks/catalog.json grew Xinear's 6 apparel
          // collections alongside these — unaffected by that addition.
          defaultSection('clothing-home-catalog', 'collection_list', {
            heading: 'Shop by category',
            collections: [
              { id: 'clothing-cat-best-sellers', handle: 'best-sellers' },
              { id: 'clothing-cat-new-arrivals', handle: 'new-arrivals' },
            ],
          }),
          defaultSection('clothing-home-lifestyle', 'image_with_text', { image: image('clothing-secondary'), image_position: 'right' }),
          defaultSection('clothing-home-featured', 'featured_products', { heading: 'New arrivals' }),
          defaultSection('clothing-home-testimonials', 'testimonials'),
        ],
      },
      {
        id: 'about', name: 'About', type: 'system', slug: '/about', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('clothing-about-brand', 'brand_values', { heading: 'Why shop with us' }),
          defaultSection('clothing-about-team', 'team_about'),
        ],
      },
      {
        id: 'contact', name: 'Contact', type: 'system', slug: '/contact', seo: {}, hiddenFromNav: false,
        sections: [defaultSection('clothing-contact-form', 'contact_form')],
      },
    ],
  },
  {
    id: 'fnb',
    name: 'Food & Beverage',
    theme: {
      typography: { heading_font: 'Cormorant Garamond', body_font: 'Nunito', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#faf6f0', surface: '#f0e8dc', primary: '#6b4f3b', primary_text: '#ffffff',
        accent: '#b5651d', accent_text: '#ffffff', text_primary: '#3a2e22', text_secondary: '#7a6a58', border: '#e0d3bf',
      },
    },
    // Energetic, layered identity — slim caps nav bar above a big bold
    // logo row (Renderer.jsx's 'stacked-bold' variant).
    header: { layout_variant: 'stacked-bold', logo_text: 'Savor Kitchen' },
    // Full columns footer — layered and generous, matching the stacked-bold
    // header's energetic, content-rich identity.
    footer: { layout_variant: 'columns', tagline: 'Fresh, seasonal, made with care.' },
    media: media('fnb', [
      { key: 'hero', filename: 'hero.jpg', width: 1600, height: 1067 },
      { key: 'secondary', filename: 'secondary.jpg', width: 1200, height: 800 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('fnb-home-hero', 'hero_banner', { background_image: image('fnb-hero') }),
          defaultSection('fnb-home-announcement', 'announcement_bar'),
          defaultSection('fnb-home-catalog', 'featured_products', { heading: 'Our menu' }),
          defaultSection('fnb-home-interior', 'image_with_text', { image: image('fnb-secondary'), image_position: 'left' }),
          defaultSection('fnb-home-testimonials', 'testimonials'),
          defaultSection('fnb-home-map', 'map_embed'),
        ],
      },
      {
        id: 'about', name: 'About', type: 'system', slug: '/about', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('fnb-about-brand', 'brand_values', { heading: 'Why dine with us' }),
          defaultSection('fnb-about-team', 'team_about'),
        ],
      },
      {
        id: 'contact', name: 'Contact', type: 'system', slug: '/contact', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('fnb-contact-form', 'contact_form'),
          defaultSection('fnb-contact-map', 'map_embed'),
        ],
      },
    ],
  },
  {
    id: 'manufacture',
    name: 'Manufacture',
    theme: {
      typography: { heading_font: 'Montserrat', body_font: 'Inter', heading_size: 'medium', body_size: 'medium', letter_spacing: 'wide', heading_transform: 'none' },
      colors: {
        background: '#ffffff', surface: '#eef2f7', primary: '#1f2a44', primary_text: '#ffffff',
        accent: '#3d6bff', accent_text: '#ffffff', text_primary: '#1a1a1a', text_secondary: '#5c6470', border: '#dbe1ea',
      },
    },
    // Clean, symmetric, corporate identity — nav split left/right around a
    // centered logo (Renderer.jsx's 'centered-split' variant).
    header: { layout_variant: 'centered-split', logo_text: 'Meridian Industrial' },
    // Minimal single-row footer — clean and corporate, matching the
    // centered-split header's symmetric, no-frills identity.
    footer: { layout_variant: 'minimal-bar', tagline: 'Precision manufacturing, built to spec.' },
    media: media('manufacture', [
      { key: 'hero', filename: 'hero.jpg', width: 1600, height: 1067 },
      { key: 'secondary', filename: 'secondary.jpg', width: 1200, height: 817 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('manufacture-home-hero', 'hero_banner', { background_image: image('manufacture-hero') }),
          defaultSection('manufacture-home-brand', 'brand_values', { heading: 'Our capabilities' }),
          defaultSection('manufacture-home-facility', 'image_with_text', { image: image('manufacture-secondary'), image_position: 'right' }),
          defaultSection('manufacture-home-catalog', 'featured_products', { heading: 'Our products' }),
          defaultSection('manufacture-home-logos', 'press_logos'),
          defaultSection('manufacture-home-faq', 'faq_accordion'),
        ],
      },
      {
        id: 'about', name: 'About', type: 'system', slug: '/about', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('manufacture-about-team', 'team_about'),
          defaultSection('manufacture-about-faq', 'faq_accordion'),
        ],
      },
      {
        id: 'contact', name: 'Contact', type: 'system', slug: '/contact', seo: {}, hiddenFromNav: false,
        sections: [defaultSection('manufacture-contact-form', 'contact_form', { reply_to_email: '' })],
      },
    ],
  },
  {
    id: 'xinear',
    name: 'Xinear',
    // Sourced from Xinear's real Figma homepage design — a single-page
    // (home-only) clothing storefront. Unlike clothing/fnb/manufacture,
    // there is no about/contact secondary page in the source design, so
    // this template intentionally has only a `home` page — not an
    // oversight, just an honest reflection of the reference scope.
    theme: {
      typography: { heading_font: 'Lato', body_font: 'Lato', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        // accent intentionally equals primary — Xinear's real design is
        // deliberately monochrome/near-black, no separate accent hue.
        background: '#ffffff', surface: '#f4f4f4', primary: '#20201e', primary_text: '#ffffff',
        accent: '#20201e', accent_text: '#ffffff', text_primary: '#1b1916', text_secondary: '#767573', border: '#e8e8e8',
      },
    },
    header: {
      layout_variant: 'centered-nav',
      logo_text: 'Xinear',
      logo_image: image('xinear-logo'),
      show_border: true,
      show_language_switcher: true,
      show_search_icon: false,
      show_cart_icon: true,
      // Every repeater item needs a stable, unique `id` — RepeaterField's
      // React keys AND its dnd-kit `useSortable({id: item.id})` drag
      // handles both depend on it. Hand-authored template data (unlike
      // items added via the builder's "Add item" button, which always get
      // `crypto.randomUUID()`) doesn't get one for free, so it must be set
      // explicitly here or dragging silently no-ops (every item resolves to
      // the same `undefined` sortable id).
      nav_links: [
        { id: 'xinear-nav-home', label: 'Home', url: '/' },
        { id: 'xinear-nav-shop', label: 'Shop', url: '/shop' },
        // "Appoinment" is the actual spelling in the Figma source — kept
        // verbatim rather than corrected, since this is real source copy.
        { id: 'xinear-nav-appointment', label: 'Make an Appoinment', url: '/appointment' },
        { id: 'xinear-nav-reviews', label: 'Reviews', url: '/reviews' },
        { id: 'xinear-nav-contact', label: 'Contact Us', url: '/contact' },
        { id: 'xinear-nav-location', label: 'Location', url: '/location' },
        { id: 'xinear-nav-quote', label: 'Request Quote', url: '/quote' },
      ],
    },
    footer: {
      layout_variant: 'columns',
      logo_text: 'Xinear',
      logo_image: image('xinear-logo'),
      show_border: true,
      // Figma's visible footer icon row shows X/Instagram/Facebook/YouTube
      // (4 icons) — LinkedIn's icon component exists in the Figma file (see
      // socialIcons/linkedin.svg) but isn't part of the visible footer
      // instance in the reference screenshot, so it's intentionally left
      // out of Xinear's own social_links here (still available for any
      // future template's footer).
      social_links: [
        { id: 'xinear-social-x', platform: 'x', url: '#' },
        { id: 'xinear-social-instagram', platform: 'instagram', url: '#' },
        { id: 'xinear-social-facebook', platform: 'facebook', url: '#' },
        { id: 'xinear-social-youtube', platform: 'youtube', url: '#' },
      ],
      address_heading: 'Tangerang',
      address_body: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320',
      phone: '0858-3456-0890',
      email: 'xinear@gmail.com',
      link_columns: [
        {
          id: 'xinear-footer-category',
          heading: 'Category',
          links: [
            { id: 'xinear-footer-category-tops', label: 'Tops', url: '/shop' },
            { id: 'xinear-footer-category-bottom', label: 'Bottom', url: '/shop' },
            { id: 'xinear-footer-category-dress', label: 'Dress', url: '/shop' },
            { id: 'xinear-footer-category-shoes', label: 'Shoes', url: '/shop' },
            { id: 'xinear-footer-category-bags', label: 'Bags', url: '/shop' },
            { id: 'xinear-footer-category-parfumes', label: 'Parfumes', url: '/shop' },
          ],
        },
      ],
      copyright_text: '©2024 PT Xinear. All rights reserved.',
      show_social_icons: true,
    },
    media: media('xinear', [
      // logo-mark.svg's real intrinsic size, per its own viewBox/width/
      // height attributes (28x28) — the abstract "X" glyph next to the
      // "Xinear" wordmark in both header and footer.
      { key: 'logo', filename: 'logo-mark.svg', width: 28, height: 28 },
      { key: 'hero', filename: 'hero-banner.png', width: 1440, height: 620 },
      { key: 'appointment', filename: 'appointment-banner.png', width: 1440, height: 331 },
      { key: 'quote', filename: 'quote-banner.png', width: 1440, height: 524 },
      // contact-us.png: a real Figma asset, but contact_form has no image
      // field to attach it to — registered here for completeness/future use
      // only (see contact_form section below).
      { key: 'contact', filename: 'contact-us.png', width: 520, height: 520 },
      // store-map.png: a real Figma asset, but map_embed's Renderer always
      // draws a fixed gray placeholder box (no image field exists) — this
      // asset currently has nowhere to render. Registered for completeness/
      // future use only (see map_embed section below).
      { key: 'map', filename: 'store-map.png', width: 810, height: 320 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          // Figma shows a multi-dot (3-slide) carousel indicator, but only
          // one real slide image exists in the source — the extra slide
          // slots reuse that same asset rather than inventing new imagery,
          // just to reproduce the indicator/carousel behavior faithfully.
          defaultSection(
            'xinear-home-hero',
            'hero_banner',
            {
              background_image: image('xinear-hero'),
              extra_slides: [
                { id: 'xinear-hero-slide-2', image: image('xinear-hero') },
                { id: 'xinear-hero-slide-3', image: image('xinear-hero') },
              ],
              text_alignment: 'left',
              content_position: 'center',
            },
            [
              block('heading', { text: 'Pakain Terbaik Musim Panas' }),
              block('subheading', {
                text: 'Di sini kami akan memberikan berbagai macam produk menarik yang wajib kamu punya untuk musim panas 2024 nanti',
              }),
            ],
          ),
          defaultSection('xinear-home-categories', 'collection_list', {
            show_heading: false, display_style: 'circular',
            collections: [
              { id: 'xinear-cat-tops', handle: 'tops' },
              { id: 'xinear-cat-bottoms', handle: 'bottoms' },
              { id: 'xinear-cat-dresses', handle: 'dresses' },
              { id: 'xinear-cat-shoes', handle: 'shoes' },
              { id: 'xinear-cat-bags', handle: 'bags' },
              { id: 'xinear-cat-perfumes', handle: 'perfumes' },
            ],
          }),
          // Figma shows 5 products per row.
          defaultSection('xinear-home-tops', 'featured_products', {
            heading: 'Tops', columns_desktop: '5',
            products: defaultProductItems(['p5', 'p6', 'p7', 'p8', 'p9']),
          }),
          defaultSection('xinear-home-bottoms', 'featured_products', {
            heading: 'Bottoms', columns_desktop: '5',
            products: defaultProductItems(['p10', 'p11', 'p12', 'p13', 'p14']),
          }),
          defaultSection(
            'xinear-home-appointment',
            'hero_banner',
            {
              background_image: image('xinear-appointment'),
              overlay_opacity: 40,
              text_alignment: 'center',
              content_position: 'center',
            },
            [
              block('heading', { text: 'Book an Appointment!' }),
              block('subheading', {
                text: 'Schedule your visit to our store today! Discover the latest trends and exclusive collections tailored just for you.',
              }),
              block('button', { label: 'Book Now', url: '/appointment' }),
            ],
          ),
          defaultSection(
            'xinear-home-testimonials',
            'testimonials',
            { heading: 'What They Say', columns_desktop: '3' },
            [
              block('quote', {
                quote: 'Great materials and design especially considering the affordable price! I feel like a queen wearing the dresses you guys made! ',
                reviewer_name: 'John Doe',
                star_rating: '5',
              }),
              block('quote', {
                quote: 'Great materials and design especially considering the affordable price! I feel like a queen wearing the dresses you guys made! ',
                reviewer_name: 'Angelina CalDRenter',
                star_rating: '5',
              }),
              block('quote', {
                quote: 'Great materials and design especially considering the affordable price! I feel like a queen wearing the dresses you guys made! ',
                reviewer_name: 'Nichole Smith',
                star_rating: '5',
              }),
            ],
          ),
          // rating_form's own schema defaults already match Figma's copy —
          // no overrides needed.
          defaultSection('xinear-home-rating', 'rating_form'),
          // Figma shows this as a plain solid-gray banner with no photo —
          // no background_image, color_scheme: 'surface' renders the
          // theme's flat neutral surface color instead.
          defaultSection(
            'xinear-home-waitlist',
            'hero_banner',
            { color_scheme: 'surface', text_alignment: 'center', content_position: 'center' },
            [
              block('heading', { text: 'Join Waitlist' }),
              block('subheading', {
                text: "Can't Find a Slot? Join the waitlist and we'll notify you if an earlier appointment becomes available. Your time matters to us.",
              }),
              block('button', { label: 'Join Now', url: '/waitlist' }),
            ],
          ),
          // Sibling templates (clothing/fnb/manufacture) all seed
          // contact_form with no block overrides, relying on its
          // seedBlocks presets (3 generic form_field blocks) — matched here
          // for consistency rather than hand-authoring a heading/lead-text
          // block pair + custom-labeled Name/Email/Phone/Message fields
          // that no sibling template does either. contact-us.png is
          // registered in media above but unused (no image field exists).
          // Real Figma copy: "Contact Us" heading, lead text, and
          // Name/Email/Phone Number/Message fields (contact-us.png's portrait
          // photo has nowhere to go — contact_form has no image field, see
          // the media() registration below).
          defaultSection(
            'xinear-home-contact',
            'contact_form',
            { reply_to_email: '' },
            [
              block('heading', { text: 'Contact Us' }),
              block('text', { content: 'Contact us For further business inquiries or collaborations' }),
              block('form_field', { label: 'Name', field_type: 'text', required: true }),
              block('form_field', { label: 'Email', field_type: 'email', required: true }),
              block('form_field', { label: 'Phone Number', field_type: 'tel', required: false }),
              block('form_field', { label: 'Message', field_type: 'textarea', required: true }),
            ],
          ),
          defaultSection(
            'xinear-home-map',
            'map_embed',
            { address: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320' },
            [block('heading', { text: 'Visit Our Store!' }), block('text', { content: 'Find and shop your best clothing here' })],
          ),
          // quote_request_form's own schema defaults already match Figma's
          // copy exactly ("Request a Quote" / "Need a custom tailored
          // clothing..." / "Request a Quote" button) — no overrides needed.
          defaultSection('xinear-home-quote', 'quote_request_form'),
        ],
      },
    ],
  },
  {
    id: 'houzez',
    name: 'Houzez',
    // Sourced from Houzez's real Figma design (Labamu E-Commerce MVP 2,
    // node 81:71854 light / 81:72885 dark — see themes/houzez.js for the
    // matching --theme-* color/typography layer) and from the coded
    // reference prototype's own i18n copy (src/locales/en/website.json's
    // template_houzez namespace in ecom-from-bella), reused verbatim as
    // real source content. Like Xinear, this is a single home-page
    // storefront — the reference design has no separate about/contact
    // pages, every section lives on one anchor-navigated homepage.
    theme: {
      typography: { heading_font: 'Lato', body_font: 'Lato', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#ffffff', surface: '#e8f6ef', primary: '#16894b', primary_text: '#ffffff',
        accent: '#16894b', accent_text: '#ffffff', text_primary: '#1b1916', text_secondary: '#767573', border: '#e8e8e8',
      },
    },
    header: {
      layout_variant: 'inline',
      logo_text: 'Houzez',
      logo_image: image('houzez-logo'),
      show_border: true,
      show_language_switcher: true,
      // The reference prototype's language pill offers English/Indonesian.
      languages: [
        { id: 'houzez-lang-en', code: 'EN', label: 'English' },
        { id: 'houzez-lang-id', code: 'ID', label: 'Bahasa Indonesia' },
      ],
      show_search_icon: false,
      // enableCheckout defaults to false in the reference prototype's own
      // BASE_CONFIG (catalog/RFQ-first, not cart-first) — no cart icon by
      // default to match.
      show_cart_icon: false,
      // Reference nav (Home + 6 feature anchors) collapses into the "⋯"
      // overflow dropdown beyond 5 — matches the prototype's own overflow
      // behavior exactly (see HouzezPreview.jsx's displayedNav/overflowNav).
      nav_overflow_after: 5,
      nav_links: [
        { id: 'houzez-nav-home', label: 'Home', url: '/' },
        { id: 'houzez-nav-shop', label: 'Shop', url: '/shop' },
        { id: 'houzez-nav-appointment', label: 'Appointment', url: '/appointment' },
        { id: 'houzez-nav-reviews', label: 'Reviews', url: '/reviews' },
        { id: 'houzez-nav-contact', label: 'Contact', url: '/contact' },
        { id: 'houzez-nav-location', label: 'Location', url: '/location' },
        { id: 'houzez-nav-quote', label: 'Quote', url: '/quote' },
      ],
    },
    footer: {
      layout_variant: 'columns',
      logo_text: 'Houzez',
      logo_image: image('houzez-logo'),
      show_border: true,
      social_links: [
        { id: 'houzez-social-x', platform: 'x', url: '#' },
        { id: 'houzez-social-instagram', platform: 'instagram', url: '#' },
        { id: 'houzez-social-facebook', platform: 'facebook', url: '#' },
        { id: 'houzez-social-youtube', platform: 'youtube', url: '#' },
        { id: 'houzez-social-linkedin', platform: 'linkedin', url: '#' },
      ],
      address_heading: 'Tangerang',
      address_body: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320',
      phone: '0858-3456-0890',
      email: 'houzez@gmail.com',
      link_columns: [
        {
          id: 'houzez-footer-category',
          heading: 'Category',
          links: [
            { id: 'houzez-footer-category-house', label: 'House Construction', url: '/shop' },
            { id: 'houzez-footer-category-glass', label: 'Glass Pane', url: '/shop' },
            { id: 'houzez-footer-category-safety', label: 'Safety Tools', url: '/shop' },
            { id: 'houzez-footer-category-foundation', label: 'Foundation', url: '/shop' },
            { id: 'houzez-footer-category-paints', label: 'Paints and Flooring', url: '/shop' },
            { id: 'houzez-footer-category-roofing', label: 'Roofing', url: '/shop' },
            { id: 'houzez-footer-category-doors', label: 'Doors and Windows', url: '/shop' },
            { id: 'houzez-footer-category-excavation', label: 'Excavation', url: '/shop' },
          ],
        },
      ],
      copyright_text: '©2026 Houzez. All rights reserved.',
      show_social_icons: true,
    },
    media: media('houzez', [
      { key: 'logo', filename: 'assets/houzez-logo.png', width: 125, height: 45 },
      { key: 'banner', filename: 'assets/houzez-banner.png', width: 640, height: 419 },
      { key: 'appointment', filename: 'assets/houzez-appointment.png', width: 1440, height: 331 },
      { key: 'contact', filename: 'assets/houzez-contact.png', width: 520, height: 520 },
      // A real Figma/prototype asset, registered for completeness — like
      // Xinear's store-map.png, map_embed's Renderer always draws a Google
      // Maps iframe (or gray placeholder) and has no image field to attach
      // this to, so it currently has nowhere to render.
      { key: 'map', filename: 'assets/houzez-map.png', width: 730, height: 320 },
      // Same story as 'map' — a real asset with no home in
      // quote_request_form's current fixed-field schema (no image field).
      // Will have somewhere to go once quote_request_form grows an RFQ
      // hero/background per the RFQ-modal upgrade plan.
      { key: 'rfq', filename: 'assets/houzez-rfq.png', width: 1920, height: 1080 },
      // 8 category icons for the icon-circle Categories strip (category_grid).
      { key: 'cat-house', filename: 'catalog-categories/house-construction.png', width: 40, height: 40 },
      { key: 'cat-glass', filename: 'catalog-categories/glass-pane.png', width: 40, height: 40 },
      { key: 'cat-safety', filename: 'catalog-categories/safety-tools.png', width: 40, height: 40 },
      { key: 'cat-foundation', filename: 'catalog-categories/foundation.png', width: 40, height: 40 },
      { key: 'cat-paints', filename: 'catalog-categories/paints-and-flooring.png', width: 40, height: 40 },
      { key: 'cat-roofing', filename: 'catalog-categories/roofing.png', width: 40, height: 40 },
      { key: 'cat-doors', filename: 'catalog-categories/doors-and-windows.png', width: 40, height: 40 },
      { key: 'cat-excavation', filename: 'catalog-categories/excavation.png', width: 40, height: 40 },
      // 12 product photos for the two "Product Group" carousels (High-Rise
      // Needs / Safety Tools), real names/prices from the reference
      // prototype's en/website.json template_houzez.products namespace.
      { key: 'prod-ladder', filename: 'catalog/image-2.png', width: 200, height: 200 },
      { key: 'prod-level-kit', filename: 'catalog/image-3.png', width: 200, height: 200 },
      { key: 'prod-scaffold-metal', filename: 'catalog/image-4.png', width: 200, height: 200 },
      { key: 'prod-scaffold-tower', filename: 'catalog/image-5.png', width: 200, height: 200 },
      { key: 'prod-rammer', filename: 'catalog/image-6.png', width: 200, height: 200 },
      { key: 'prod-ladder-steel', filename: 'catalog/image-7.png', width: 200, height: 200 },
      { key: 'prod-helmet', filename: 'catalog/image-8.png', width: 200, height: 200 },
      { key: 'prod-harness', filename: 'catalog/image-9.png', width: 200, height: 200 },
      { key: 'prod-gloves', filename: 'catalog/image-10.png', width: 200, height: 200 },
      { key: 'prod-lifeline', filename: 'catalog/image-11.png', width: 200, height: 200 },
      { key: 'prod-helmet-2', filename: 'catalog/image-12.png', width: 200, height: 200 },
      { key: 'prod-gloves-heavy', filename: 'catalog/image-13.png', width: 200, height: 200 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection(
            'houzez-home-hero',
            'hero_banner',
            { background_image: image('houzez-banner'), text_alignment: 'left', content_position: 'center' },
            [
              block('heading', { text: 'Create your ideal home with us' }),
              block('subheading', { text: 'Everything you need to build your home, we provide.' }),
            ],
          ),
          // Icon-circle Categories strip — same 8 categories/icons/order as
          // the real design, at Houzez's own 8-column desktop layout.
          defaultSection('houzez-home-categories', 'category_grid', {
            show_heading: false, columns_desktop: '8', columns_mobile: '4',
            items: [
              { id: 'houzez-cat-house', label: 'House Construction', icon_image: image('houzez-cat-house'), url: '/shop' },
              { id: 'houzez-cat-glass', label: 'Glass Pane', icon_image: image('houzez-cat-glass'), url: '/shop' },
              { id: 'houzez-cat-safety', label: 'Safety Tools', icon_image: image('houzez-cat-safety'), url: '/shop' },
              { id: 'houzez-cat-foundation', label: 'Foundation', icon_image: image('houzez-cat-foundation'), url: '/shop' },
              { id: 'houzez-cat-paints', label: 'Paints and Flooring', icon_image: image('houzez-cat-paints'), url: '/shop' },
              { id: 'houzez-cat-roofing', label: 'Roofing', icon_image: image('houzez-cat-roofing'), url: '/shop' },
              { id: 'houzez-cat-doors', label: 'Doors and Windows', icon_image: image('houzez-cat-doors'), url: '/shop' },
              { id: 'houzez-cat-excavation', label: 'Excavation', icon_image: image('houzez-cat-excavation'), url: '/shop' },
            ],
          }),
          // Figma/prototype shows 6 per row — clamped to featured_products'
          // schema max of 5 (documented column-count gap).
          defaultSection('houzez-home-highrise', 'featured_products', {
            heading: 'High-Rise Needs', columns_desktop: '5',
            products: [
              { id: 'houzez-prod-ladder', source: 'custom', title: 'KRISBOW Ladder Rolling Multi PRLRM1108 1.1m 4...', image: image('houzez-prod-ladder'), price: 'Rp 4.200.000' },
              { id: 'houzez-prod-level-kit', source: 'custom', title: 'DEWALT Builders Level Kit DW090PK 1set', image: image('houzez-prod-level-kit'), price: 'Rp 16.000.000' },
              { id: 'houzez-prod-scaffold-metal', source: 'custom', title: 'METALTECH Portable Scaffold 6-11/64 ft.L Steel...', image: image('houzez-prod-scaffold-metal'), price: 'Rp 13.885.000' },
              { id: 'houzez-prod-scaffold-tower', source: 'custom', title: 'WERNER Scaffold Tower 75 H, 41D335', image: image('houzez-prod-scaffold-tower'), price: 'Rp 13.885.000' },
              { id: 'houzez-prod-rammer', source: 'custom', title: 'Hyundai Tamping Rammers HDCR 88H 1pc', image: image('houzez-prod-rammer'), price: 'Rp 23.330.000' },
              { id: 'houzez-prod-ladder-steel', source: 'custom', title: 'Cotterman Rolling Steel Ladder - 450-Lb. Capacit...', image: image('houzez-prod-ladder-steel'), price: 'Rp 53.196.000' },
            ],
          }),
          defaultSection('houzez-home-safety', 'featured_products', {
            heading: 'Safety Tools', columns_desktop: '5',
            products: [
              { id: 'houzez-prod-helmet', source: 'custom', title: 'Safety Helmet Construction Helmet Darl...', image: image('houzez-prod-helmet'), price: 'Rp 723.000' },
              { id: 'houzez-prod-harness', source: 'custom', title: 'Safety Full Body Harness Five Point Construction D...', image: image('houzez-prod-harness'), price: 'Rp 166.000' },
              { id: 'houzez-prod-gloves', source: 'custom', title: '48-22-8951 CUT 5 Dipped Safety Gloves Size M - 00...', image: image('houzez-prod-gloves'), price: 'Rp 185.000' },
              { id: 'houzez-prod-lifeline', source: 'custom', title: 'Rebel Self Retracting Lifeline - Stainless Cable...', image: image('houzez-prod-lifeline'), price: 'Rp 3.023.000' },
              { id: 'houzez-prod-helmet-2', source: 'custom', title: 'Safety Helmet Construction Helmet Darl...', image: image('houzez-prod-helmet-2'), price: 'Rp 2.100.000' },
              { id: 'houzez-prod-gloves-heavy', source: 'custom', title: 'SARUNG TANGAN SAFETY KONG HEAVY DUTY HIGH...', image: image('houzez-prod-gloves-heavy'), price: 'Rp 225.000' },
            ],
          }),
          // Reference design uses a solid-green gradient overlay (not a
          // dark photo scrim) behind this banner — hero_banner's overlay is
          // fixed to rgba(0,0,0,opacity), so a brand-green wash isn't
          // reproducible without a Renderer change (documented gap);
          // approximated here with a lighter dark overlay over the same
          // appointment photo instead.
          defaultSection(
            'houzez-home-appointment',
            'hero_banner',
            { background_image: image('houzez-appointment'), overlay_opacity: 40, text_alignment: 'left', content_position: 'center' },
            [
              block('heading', { text: 'Book an Appointment!' }),
              block('subheading', { text: 'Let’s meet and discuss further on your construction needs' }),
              block('button', { label: 'Book Now', url: '/appointment' }),
            ],
          ),
          defaultSection(
            'houzez-home-testimonials',
            'testimonials',
            { heading: 'What They Say', columns_desktop: '3' },
            [
              block('quote', {
                quote: 'Worked with Houzez on all my property. Never once I were disappointed because they are bomb',
                reviewer_name: 'John Doe',
                star_rating: '5',
              }),
              block('quote', {
                quote: 'Worked with Houzez on all my property. Never once I were disappointed because they are bomb',
                reviewer_name: 'Angelina Carpenter',
                star_rating: '5',
              }),
              block('quote', {
                quote: 'Worked with Houzez on all my property. Never once I were disappointed because they are bomb',
                reviewer_name: 'Nichole Smith',
                star_rating: '5',
              }),
            ],
          ),
          defaultSection('houzez-home-rating', 'rating_form', {
            heading: 'Leave us your thoughts on how do you like our service',
            name_field_label: 'Name', message_field_label: 'Review', button_label: 'Give Rating',
          }),
          defaultSection(
            'houzez-home-contact',
            'contact_form',
            { reply_to_email: '' },
            [
              block('heading', { text: 'Contact Us' }),
              block('text', { content: 'Contact us For further business inquiries or collaborations' }),
              block('form_field', { label: 'Name', field_type: 'text', required: true }),
              block('form_field', { label: 'Email', field_type: 'email', required: true }),
              block('form_field', { label: 'Phone Number', field_type: 'tel', required: false }),
              block('form_field', { label: 'Message', field_type: 'textarea', required: true }),
            ],
          ),
          defaultSection(
            'houzez-home-map',
            'map_embed',
            { address: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320' },
            [block('heading', { text: 'Visit Our Showroom!' }), block('text', { content: 'Come see our great craftmanship here.' })],
          ),
          // 'detailed' layout — a static preview of the real design's
          // structured RFQ request (customer info, product line items,
          // attachments, notes). Visual only for now, like every other form
          // section — a working modal (open/close, real add/remove line
          // items, real submission) is a follow-up once there's a backend
          // module to store submitted RFQs against.
          defaultSection('houzez-home-quote', 'quote_request_form', {
            heading: 'Request a Quote',
            subtext: 'Need an estimation of cost of you build? Drop us your request and we’ll reach you with a quote.',
            button_label: 'Request a Quote',
            layout: 'detailed',
          }),
        ],
      },
    ],
  },
];

export function siteTemplateById(id) {
  return SITE_TEMPLATES.find((t) => t.id === id) ?? null;
}

/**
 * Builds an illustrative preview (header/footer/sections/theme/media) from a
 * template's own default data — never a merchant's real content. Shared by
 * ThemeGallery's inactive-card previews and the standalone theme preview
 * route (ThemePreview.jsx) so both render exactly the same "what this theme
 * looks like out of the box" data from one source of truth.
 */
export function defaultPreviewDataFor(template) {
  const globals = createDefaultGlobals(template.pages);
  const theme = { ...defaultTheme, ...template.theme };
  const header = { ...globals.header, data: { ...globals.header.data, ...template.header } };
  const footer = { ...globals.footer, data: { ...globals.footer.data, ...template.footer } };
  return { header, footer, sections: template.pages[0]?.sections ?? [], theme, mediaLibrary: template.media };
}
