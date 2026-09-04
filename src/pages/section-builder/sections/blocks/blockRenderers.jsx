import { resolveColor } from '../../ui/fields/colorValue';
import { resolveMedia } from '../../ui/fields/imageValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import EditableText from '../../ui/EditableText';
import BlockStream from '../../ui/BlockStream';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

/**
 * Renderers for the shared/generic and bespoke block types (see registry.js).
 * Each receives `{ block, theme, mediaLibrary, onEdit }`; `onEdit(key, value)`
 * commits a change to this block's own data (present only in builder mode).
 */

const HEADING_SIZE = { small: 'text-xl', medium: 'text-3xl', large: 'text-5xl' };
const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' };

export function HeadingBlock({ block, onEdit, onSelect }) {
  const d = block.data ?? {};
  const cls = `${HEADING_SIZE[d.size] ?? HEADING_SIZE.medium} ${ALIGN[d.alignment] ?? ''} font-bold`;
  return onEdit ? (
    <EditableText as="h2" className={cls} value={d.text} placeholder="Heading" onCommit={(v) => onEdit('text', v)} onFocusSelect={onSelect} />
  ) : (
    <h2 className={cls}>{d.text || 'Heading'}</h2>
  );
}

export function SubheadingBlock({ block, onEdit, onSelect }) {
  const d = block.data ?? {};
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

export function ButtonBlock({ block, theme, onEdit, onSelect }) {
  const d = block.data ?? {};
  const variant = d.style === 'secondary' ? 'outline' : 'filled';
  const style = themedButtonStyle(theme.buttons, {
    variant,
    primary: resolveColor({ slot: 'primary' }, theme.colors),
    primaryText: resolveColor({ slot: 'primary_text' }, theme.colors),
  });
  return (
    <span style={style}>
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

export function FormFieldBlock({ block }) {
  const d = block.data ?? {};
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-medium text-gray-600">
        {d.label || 'Field'}{d.required ? ' *' : ''}
      </label>
      {d.field_type === 'textarea' ? (
        <textarea disabled rows={3} placeholder={d.placeholder} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
      ) : (
        <input disabled type={d.field_type || 'text'} placeholder={d.placeholder} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
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

export function GroupBlock({ block, theme, mediaLibrary, childCtx, isMobile }) {
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
