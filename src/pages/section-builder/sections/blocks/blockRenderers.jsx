import { useState } from 'react';
import { resolveColor } from '../../ui/fields/colorValue';
import { resolveMedia } from '../../ui/fields/imageValue';
import { themedButtonStyle, themedButtonHoverStyle } from '../shared/themedButtonStyle';
import EditableText from '../../ui/EditableText';
import BlockStream from '../../ui/BlockStream';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';
import { resolveHeroRecipe } from '../shared/heroRecipes';
import { resolveFormRecipe } from '../shared/formRecipes';

/**
 * Renderers for the shared/generic and bespoke block types (see registry.js).
 * Each receives `{ block, theme, mediaLibrary, onEdit }`; `onEdit(key, value)`
 * commits a change to this block's own data (present only in builder mode).
 */

// 'xlarge' — a big, above-the-fold hero headline size (Barger's Figma hero
// heading is 120px), bigger than 'large' had any option for; responsive
// (48px mobile / 72px tablet / 96px desktop) rather than one fixed size, so
// it stays legible on narrow viewports. Generic/reusable, same as the other
// three sizes — not a Barger-only block.
//
// The Tailwind `md:`/`lg:` prefixes here are a real-browser progressive
// enhancement ONLY — they never fire correctly for the builder/preview's
// simulated device frame (a fixed-width div inside the real, usually much
// wider, browser window; `md:`/`lg:` evaluate against that real width, not
// the frame's — same root cause useResponsiveMobile's own doc comment
// describes for `sm:`). Whenever a `breakpoint` is explicitly known (the
// builder canvas/preview always passes one), XLARGE_SIZE_PX below overrides
// this via inline style instead, which wins over the class regardless of
// what the real window width happens to be.
const HEADING_SIZE = { small: 'text-xl', medium: 'text-3xl', large: 'text-5xl', xlarge: 'text-5xl md:text-7xl lg:text-8xl' };
const XLARGE_SIZE_PX = { mobile: '48px', tablet: '72px', desktop: '96px', largeDesktop: '96px', fit: '96px' };
const HEADING_WEIGHT = { normal: 'font-normal', bold: 'font-bold' };
const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' };

// Two opt-in hero typography contexts, each keyed to its own slot in the
// theme's recipe (see heroRecipes.js's `typography.hero`/`typography.heroCta`):
//   'hero'     -> the split_panel Main Hero's heading/subtitle.
//   'hero_cta' -> a 'background'-layout hero used as a branded CTA banner
//                 (e.g. the Appointment section — see hero_banner/Renderer.jsx).
// Every existing call site (normal section content, and hero_banner's own
// ordinary 'background' layout) never passes `context`, so it renders
// through the unchanged `HEADING_SIZE`/`ALIGN` path exactly as before.
// Values themselves are never hardcoded here — they come from the theme's
// recipe (Houzez) or the generic DEFAULT_HERO_RECIPE (every other theme).
const HERO_TYPOGRAPHY_SLOT = { hero: 'hero', hero_cta: 'heroCta' };

// 'section': a prominent, bold content-section heading (32px/800, 16px
// bottom margin) — a plain, theme-agnostic size step (like HEADING_SIZE's
// own small/medium/large, not a per-theme recipe), only its *color* is
// theme-driven (`theme.colors.text_primary`). Reusable by any section that
// pairs a heading with supporting body copy (Location today; Contact has
// the same golden-reference value but isn't touched in this task).
const SECTION_HEADING_STYLE = { fontSize: '32px', fontWeight: 800, marginBottom: '16px' };
const SECTION_SUBTITLE_STYLE = { fontSize: '15px', marginBottom: '32px' };

export function HeadingBlock({ block, onEdit, onSelect, theme, context, isMobile, breakpoint }) {
  const d = block.data ?? {};
  const mobile = useResponsiveMobile(isMobile);
  const slot = HERO_TYPOGRAPHY_SLOT[context];
  if (slot) {
    const t = resolveHeroRecipe(theme).typography[slot].heading;
    const style = {
      fontSize: mobile ? t.fontSizeMobile : t.fontSizeDesktop,
      fontWeight: t.fontWeight,
      lineHeight: t.lineHeight,
      maxWidth: mobile ? undefined : t.maxWidthDesktop,
      color: t.color,
    };
    return onEdit ? (
      <EditableText as="h2" style={style} value={d.text} placeholder="Heading" onCommit={(v) => onEdit('text', v)} onFocusSelect={onSelect} />
    ) : (
      <h2 style={style}>{d.text || 'Heading'}</h2>
    );
  }
  if (context === 'section') {
    const style = { ...SECTION_HEADING_STYLE, color: theme?.colors?.text_primary };
    return onEdit ? (
      <EditableText as="h2" style={style} className={theme?.colors?.text_primary ? '' : 'text-gray-900'} value={d.text} placeholder="Heading" onCommit={(v) => onEdit('text', v)} onFocusSelect={onSelect} />
    ) : (
      <h2 style={style} className={theme?.colors?.text_primary ? '' : 'text-gray-900'}>{d.text || 'Heading'}</h2>
    );
  }
  // `weight` defaults to 'bold' — every existing heading block predates
  // this field and rendered bold unconditionally, so omitting it (the
  // common case) stays byte-identical to before.
  const cls = `${HEADING_SIZE[d.size] ?? HEADING_SIZE.medium} ${ALIGN[d.alignment] ?? ''} ${HEADING_WEIGHT[d.weight] ?? HEADING_WEIGHT.bold}`;
  // 'xlarge' + an explicit `breakpoint` (the builder canvas/preview always
  // passes one — see BlockStream.jsx) -> inline style wins over the
  // (real-browser-only) Tailwind md:/lg: classes above, so the builder's
  // mobile/tablet/desktop device toggle actually resizes the text instead
  // of it staying stuck at whatever the real window width resolves to.
  // Single-line only from 'tablet' up — mobile keeps free wrapping so a
  // long headline never overflows/clips a narrow frame.
  const xlargeStyle = d.size === 'xlarge' && breakpoint
    ? { fontSize: XLARGE_SIZE_PX[breakpoint] ?? XLARGE_SIZE_PX.desktop, whiteSpace: breakpoint === 'mobile' ? 'normal' : 'nowrap' }
    : undefined;
  return onEdit ? (
    <EditableText as="h2" className={cls} style={xlargeStyle} value={d.text} placeholder="Heading" onCommit={(v) => onEdit('text', v)} onFocusSelect={onSelect} />
  ) : (
    <h2 className={cls} style={xlargeStyle}>{d.text || 'Heading'}</h2>
  );
}

export function SubheadingBlock({ block, onEdit, onSelect, theme, context, isMobile }) {
  const d = block.data ?? {};
  const mobile = useResponsiveMobile(isMobile);
  const slot = HERO_TYPOGRAPHY_SLOT[context];
  if (slot) {
    const t = resolveHeroRecipe(theme).typography[slot].subtitle;
    const style = {
      fontSize: mobile ? t.fontSizeMobile : t.fontSizeDesktop,
      lineHeight: t.lineHeight,
      maxWidth: mobile ? undefined : t.maxWidthDesktop,
      color: t.color,
      opacity: t.opacity,
    };
    return onEdit ? (
      <EditableText as="p" style={style} value={d.text} placeholder="Subheading" onCommit={(v) => onEdit('text', v)} onFocusSelect={onSelect} />
    ) : (
      d.text && <p style={style}>{d.text}</p>
    );
  }
  if (context === 'section') {
    const style = { ...SECTION_SUBTITLE_STYLE, color: theme?.colors?.text_secondary };
    return onEdit ? (
      <EditableText as="p" style={style} className={theme?.colors?.text_secondary ? '' : 'text-gray-600'} value={d.text} placeholder="Subheading" onCommit={(v) => onEdit('text', v)} onFocusSelect={onSelect} />
    ) : (
      d.text && <p style={style} className={theme?.colors?.text_secondary ? '' : 'text-gray-600'}>{d.text}</p>
    );
  }
  return onEdit ? (
    <EditableText as="p" className="text-lg opacity-80" value={d.text} placeholder="Subheading" onCommit={(v) => onEdit('text', v)} onFocusSelect={onSelect} />
  ) : (
    d.text && <p className="text-lg opacity-80">{d.text}</p>
  );
}

export function TextBlock({ block, onEdit, onSelect }) {
  const d = block.data ?? {};
  return onEdit ? (
    <EditableText as="p" multiline className="text-sm leading-relaxed opacity-90" value={d.content} placeholder="Add text…" onCommit={(v) => onEdit('content', v)} onFocusSelect={onSelect} />
  ) : (
    d.content && <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: d.content }} />
  );
}

const BUTTON_STYLE_VARIANT = { secondary: 'outline', inverted: 'inverted' };

// `context === 'hero_cta'` is the only opt-in path to CTA-button geometry —
// a plain 'inverted' button elsewhere never passes this context, so it
// keeps resolving through theme.buttons exactly as before. The geometry
// itself is never hardcoded here — it comes from the theme's recipe
// (Houzez) or `null` (every other theme, i.e. no override at all).
export function ButtonBlock({ block, theme, context, onEdit, onSelect }) {
  const d = block.data ?? {};
  const [hovered, setHovered] = useState(false);
  const variant = BUTTON_STYLE_VARIANT[d.style] ?? 'filled';
  const ctaOverride = context === 'hero_cta' ? resolveHeroRecipe(theme).ctaButton : undefined;
  const primary = resolveColor({ slot: 'primary' }, theme.colors);
  const style = themedButtonStyle(theme.buttons, {
    variant,
    primary,
    primaryText: resolveColor({ slot: 'primary_text' }, theme.colors),
    override: ctaOverride ?? undefined,
  });
  // theme.buttons.hover_effect was a schema field with no consumer anywhere
  // — every button rendered with zero hover feedback regardless of the
  // merchant's choice. See themedButtonHoverStyle's own doc comment.
  const hoverStyle = hovered ? themedButtonHoverStyle(theme.buttons, style, primary) : null;
  return (
    <span
      style={hoverStyle ? { ...style, ...hoverStyle } : style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {onEdit ? (
        <EditableText value={d.label} placeholder="Button" onCommit={(v) => onEdit('label', v)} onFocusSelect={onSelect} />
      ) : (
        d.label || 'Button'
      )}
    </span>
  );
}

export function ImageBlock({ block, mediaLibrary }) {
  const d = block.data ?? {};
  const image = resolveMedia(d.image, mediaLibrary);
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md bg-gray-100 text-sm text-gray-300">
      {image ? <img src={image.url} alt={d.alt || image.filename} className="h-full w-full object-cover" /> : 'No image'}
    </div>
  );
}

export function SpacerBlock({ block }) {
  return <div style={{ height: `${block.data?.height ?? 32}px` }} />;
}

// ── Bespoke ──────────────────────────────────────────────────────────────
const STAR_COLOR = '#F59E0B';

export function QuoteBlock({ block, onEdit, onSelect }) {
  const d = block.data ?? {};
  return (
    <div className="h-full rounded-md border border-gray-200 bg-white p-4">
      <div className="mb-2 text-sm" style={{ color: STAR_COLOR }}>{'★'.repeat(Number(d.star_rating ?? 5))}</div>
      {onEdit ? (
        <EditableText as="p" multiline className="mb-2 text-sm text-gray-700" value={d.quote} placeholder="Quote…" onCommit={(v) => onEdit('quote', v)} onFocusSelect={onSelect} />
      ) : (
        <p className="mb-2 text-sm text-gray-700">"{d.quote || 'Quote'}"</p>
      )}
      {onEdit ? (
        <EditableText className="text-xs font-medium text-gray-500" value={d.reviewer_name} placeholder="Reviewer" onCommit={(v) => onEdit('reviewer_name', v)} onFocusSelect={onSelect} />
      ) : (
        <p className="text-xs font-medium text-gray-500">{d.reviewer_name || 'Reviewer'}</p>
      )}
    </div>
  );
}

export function FaqBlock({ block, onEdit, onSelect }) {
  const d = block.data ?? {};
  return (
    <div className="border-b border-gray-200 py-3">
      {onEdit ? (
        <EditableText className="font-medium text-gray-900" value={d.question} placeholder="Question" onCommit={(v) => onEdit('question', v)} onFocusSelect={onSelect} />
      ) : (
        <p className="font-medium text-gray-900">{d.question || 'Question'}</p>
      )}
      {d.answer && <div className="prose prose-sm mt-1 max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: d.answer }} />}
    </div>
  );
}

export function ValueBlock({ block, theme, onEdit, onSelect }) {
  const d = block.data ?? {};
  const iconColor = resolveColor({ slot: 'accent' }, theme.colors);
  return (
    <div className="text-center">
      <div style={{ color: iconColor }} className="mb-2 text-2xl">{d.icon || '⭐'}</div>
      {onEdit ? (
        <EditableText className="block font-semibold text-gray-900" value={d.label} placeholder="Label" onCommit={(v) => onEdit('label', v)} onFocusSelect={onSelect} />
      ) : (
        <p className="font-semibold text-gray-900">{d.label || 'Label'}</p>
      )}
      {onEdit ? (
        <EditableText as="p" multiline className="mt-1 text-sm text-gray-500" value={d.description} placeholder="Description" onCommit={(v) => onEdit('description', v)} onFocusSelect={onSelect} />
      ) : (
        d.description && <p className="mt-1 text-sm text-gray-500">{d.description}</p>
      )}
    </div>
  );
}

export function MemberBlock({ block, mediaLibrary, onEdit, onSelect }) {
  const d = block.data ?? {};
  const photo = resolveMedia(d.photo, mediaLibrary);
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex aspect-square w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs text-gray-300">
        {photo ? <img src={photo.url} alt={d.name} className="h-full w-full object-cover" /> : 'Photo'}
      </div>
      {onEdit ? (
        <EditableText className="block font-semibold text-gray-900" value={d.name} placeholder="Name" onCommit={(v) => onEdit('name', v)} onFocusSelect={onSelect} />
      ) : (
        <p className="font-semibold text-gray-900">{d.name || 'Name'}</p>
      )}
      {onEdit ? (
        <EditableText className="block text-sm text-gray-500" value={d.role} placeholder="Role" onCommit={(v) => onEdit('role', v)} onFocusSelect={onSelect} />
      ) : (
        d.role && <p className="text-sm text-gray-500">{d.role}</p>
      )}
    </div>
  );
}

export function LogoBlock({ block, mediaLibrary }) {
  const d = block.data ?? {};
  const logo = resolveMedia(d.logo, mediaLibrary);
  return (
    <div className="flex h-12 items-center justify-center text-gray-300">
      {logo ? <img src={logo.url} alt={d.alt_text} className="max-h-full max-w-full object-contain" /> : (d.alt_text || 'Logo')}
    </div>
  );
}

export function AnnouncementBlock({ block, onEdit, onSelect }) {
  const d = block.data ?? {};
  return (
    <span className="inline-flex items-center gap-2">
      {onEdit ? (
        <EditableText value={d.message} placeholder="Announcement" onCommit={(v) => onEdit('message', v)} onFocusSelect={onSelect} />
      ) : (
        d.message || 'Announcement'
      )}
      {d.link_label && <span className="underline">{d.link_label}</span>}
    </span>
  );
}

function CardBlock({ block, mediaLibrary, onEdit, onSelect, fallbackTitle }) {
  const d = block.data ?? {};
  const image = resolveMedia(d.image, mediaLibrary);
  return (
    <div>
      <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-md bg-gray-100 text-xs text-gray-300">
        {image ? <img src={image.url} alt={d.title} className="h-full w-full object-cover" /> : 'No image'}
      </div>
      {onEdit ? (
        <EditableText className="block text-sm font-medium text-gray-800" value={d.title} placeholder={fallbackTitle} onCommit={(v) => onEdit('title', v)} onFocusSelect={onSelect} />
      ) : (
        <p className="text-sm font-medium text-gray-800">{d.title || fallbackTitle}</p>
      )}
      {d.price && <p className="text-sm text-gray-500">{d.price}</p>}
    </div>
  );
}

export function CollectionBlock(props) {
  return <CardBlock {...props} fallbackTitle="Collection" />;
}
export function ProductBlock(props) {
  return <CardBlock {...props} fallbackTitle="Product" />;
}

// `context === 'themed_form'` is the only opt-in path to recipe-driven
// field styling (see shared/formRecipes.js) — every existing call site
// (contact_form's default 'form_only' layout, quote_request_form, any other
// section using form_field blocks) never passes it, so it renders through
// the unchanged hardcoded classes exactly as before.
export function FormFieldBlock({ block, theme, context }) {
  const d = block.data ?? {};
  const themed = context === 'themed_form';
  const recipe = themed ? resolveFormRecipe(theme) : null;
  const isTextarea = d.field_type === 'textarea';
  const fieldStyle = themed
    ? { height: isTextarea ? '80px' : `${recipe.field.height}px`, borderRadius: `${recipe.field.radius}px`, fontSize: `${recipe.field.fontSize}px`, borderColor: recipe.field.borderColor }
    : undefined;
  const fieldClass = themed
    ? `w-full border px-4 outline-none ${recipe.field.borderColor ? '' : 'border-gray-300'} ${isTextarea ? 'py-3' : ''}`
    : 'w-full rounded-md border border-gray-200 px-3 py-2 text-sm';
  const labelClass = themed
    ? `mb-1 block font-semibold ${recipe.label.color ? '' : 'text-gray-700'}`
    : 'mb-1 block text-xs font-medium text-gray-600';
  const labelStyle = themed ? { fontSize: `${recipe.label.fontSize}px`, color: recipe.label.color } : undefined;
  const options = (d.options || '').split('\n').map((o) => o.trim()).filter(Boolean);

  return (
    <div className={themed ? '' : 'mb-3'}>
      <label className={labelClass} style={labelStyle}>
        {d.label || 'Field'}
        {d.required && (themed ? <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span> : ' *')}
      </label>
      {isTextarea ? (
        <textarea disabled rows={3} placeholder={d.placeholder} className={fieldClass} style={fieldStyle} />
      ) : d.field_type === 'select' ? (
        <select disabled className={fieldClass} style={fieldStyle}>
          <option value="">{d.placeholder || 'Select…'}</option>
          {options.map((opt) => <option key={opt}>{opt}</option>)}
        </select>
      ) : (
        <input disabled type={d.field_type || 'text'} placeholder={d.placeholder} className={fieldClass} style={fieldStyle} />
      )}
    </div>
  );
}

export function NavLinkBlock({ block, onEdit, onSelect }) {
  const d = block.data ?? {};
  return onEdit ? (
    <EditableText className="text-sm" value={d.label} placeholder="Link" onCommit={(v) => onEdit('label', v)} onFocusSelect={onSelect} />
  ) : (
    <span className="text-sm">{d.label || 'Link'}</span>
  );
}

export function MenuColumnBlock({ block }) {
  const d = block.data ?? {};
  const links = (d.links || '').split('\n').filter(Boolean);
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{d.heading || 'Links'}</p>
      <ul className="space-y-1 text-sm opacity-80">
        {links.length ? links.map((l, i) => <li key={i}>{l}</li>) : <li className="opacity-50">Link</li>}
      </ul>
    </div>
  );
}

// Single source of truth for what a group block accepts as children —
// registry.js's `group.childTypes` imports this same constant instead of
// hardcoding its own copy, so the canvas's on-canvas "Add block" control
// (below) and the sidebar/settings-panel one (which reads registry.js) can
// never drift out of sync.
export const GROUP_CHILD_TYPES = ['heading', 'subheading', 'text', 'button', 'image', 'group'];

const DIRECTION_CLASS = { horizontal: 'flex-row', vertical: 'flex-col' };
const ALIGN_CLASS = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' };
const DISTRIBUTE_CLASS = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around' };
const WIDTH_CLASS = { fill: 'w-full', fit: 'w-fit', custom: 'w-full' };

/**
 * Groups predate the flex/container/mobile fields below (they only had a
 * `columns` select). Old saved data has no `direction` key at all — freshly
 * created groups always get the full schema defaults written in at creation
 * time (schemaDefaults.js), so `direction === undefined` reliably means
 * legacy data, not "using the default". Map it to a sensible flex equivalent
 * at render time rather than migrating stored data.
 */
function withLegacyDefaults(d) {
  if (d.direction !== undefined || d.columns === undefined) return d;
  return { ...d, direction: 'horizontal', direction_mobile: 'vertical', wrap: true, gap: 16, gap_mobile: 8 };
}

export function GroupBlock({ block, theme, mediaLibrary, childCtx, isMobile, breakpoint }) {
  const d = withLegacyDefaults(block.data ?? {});
  const children = block.blocks ?? [];
  const empty = children.length === 0;
  // JS-driven rather than CSS `sm:` media queries — the builder canvas's
  // "Mobile" preview is a fixed-width div inside the real (wide) browser
  // window, so a real media query never reflects it. useResponsiveMobile
  // falls back to a real matchMedia check when `isMobile` isn't passed
  // (e.g. the published storefront), so this is correct in both contexts.
  const mobile = useResponsiveMobile(isMobile);

  const direction = mobile ? d.direction_mobile ?? 'vertical' : d.direction ?? 'horizontal';
  const align = mobile ? d.align_mobile ?? d.align ?? 'stretch' : d.align ?? 'stretch';
  const distribute = mobile ? d.distribute_mobile ?? d.distribute ?? 'start' : d.distribute ?? 'start';
  const gap = mobile ? d.gap_mobile ?? d.gap ?? 16 : d.gap ?? 16;
  const padding = mobile ? d.padding_mobile ?? d.padding ?? 0 : d.padding ?? 0;
  const widthMode = d.widthMode ?? 'fill';
  const borderWidth = d.borderWidth ?? 0;
  const radius = d.radius ?? 0;

  const bg = resolveMedia(d.backgroundImage, mediaLibrary);
  const borderColor = borderWidth > 0 ? resolveColor(d.borderColor, theme?.colors) : undefined;
  const bgColor = d.backgroundColor ? resolveColor(d.backgroundColor, theme?.colors) : undefined;

  const className = [
    'relative', // positioning context for BlockStream's trailing insert-zone (see below)
    'flex',
    DIRECTION_CLASS[direction] ?? 'flex-row',
    ALIGN_CLASS[align] ?? 'items-stretch',
    DISTRIBUTE_CLASS[distribute] ?? 'justify-start',
    d.wrap ? 'flex-wrap' : '',
    WIDTH_CLASS[widthMode] ?? 'w-full',
  ].filter(Boolean).join(' ');

  const style = {
    gap: `${gap}px`,
    padding: `${padding}px`,
    ...(widthMode === 'custom' ? { maxWidth: `${d.maxWidth ?? 600}px` } : {}),
    ...(borderWidth > 0 ? { borderWidth: `${borderWidth}px`, borderStyle: 'solid', borderColor } : {}),
    ...(radius > 0 ? { borderRadius: `${radius}px` } : {}),
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    ...(bg ? { backgroundImage: `url(${bg.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
  };

  return (
    <div className={className} style={style}>
      {empty && !childCtx ? null : (
        <BlockStream
          addTypes={GROUP_CHILD_TYPES}
          blocks={children}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={childCtx}
          gated={false}
          className="contents"
          isMobile={isMobile}
          breakpoint={breakpoint}
          // Easyblocks-style hover "+" between items instead of one
          // end-of-list Add button (see BlockStream.jsx/InsertZone.jsx).
          // `direction` matches this group's own current (possibly
          // mobile-overridden) flex direction so the hover strips orient
          // correctly. An empty group still falls back to a normal,
          // always-visible Add button inside BlockStream (nothing to hover
          // near yet).
          insertBetween
          direction={direction}
        />
      )}
    </div>
  );
}
