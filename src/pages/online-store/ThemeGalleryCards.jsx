import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Eye, Lock, MoreVertical, X } from 'lucide-react';
import { MainBtn, IconBtn, Tooltip } from '../../ce-ui';
import { formatRelativeTime } from './timeUtils';

// Shopify itself caps theme names at 40 chars — matched here for the same
// reason (keeps the gallery's name column/row from being dominated by one
// runaway title).
const MAX_THEME_NAME_LENGTH = 40;

/**
 * @module online-store/ThemeGalleryCards
 * @description Card/row sub-components for the rebuilt ThemeGallery.jsx
 * (Shopify-style "Online Store > Themes" screen): the big published-theme
 * card, compact draft-theme rows, discover-theme cards, and the small
 * "More" menu shared by the published card and each draft row. Split out of
 * ThemeGallery.jsx purely to keep that file from growing unwieldy — these
 * are presentational only, all state/persistence lives in the parent.
 */

/** Small "More" popover menu — a plain absolutely-positioned list, not
 * ce-ui's Dropdown itself (that component is a form select — a bordered
 * field trigger with a chevron and a selected value/placeholder — not an
 * icon-only "⋮" menu trigger), but its option rows borrow Dropdown's own
 * Tailwind tokens (rounded-lb-sm, hover:bg-lb-surface-grey, font-lb, ...)
 * so the popover reads as the same design system rather than ad-hoc CSS.
 * Closes on outside click and Escape. Portaled to document.body and
 * positioned from the trigger's bounding rect (rather than living inside
 * the trigger's own relatively-positioned wrapper) so it isn't clipped by
 * a scrollable ancestor like .draft-theme-list. */
export function MoreMenu({ items, disabled }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleClick(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target)
        && menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', () => setOpen(false), true);
    window.addEventListener('resize', () => setOpen(false));
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={triggerRef} style={{ display: 'inline-block' }}>
      <IconBtn
        icon={<MoreVertical size={16} />}
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="More actions"
      />
      {!disabled && open && coords && createPortal(
        <div
          ref={menuRef}
          className="bg-lb-surface border border-lb-line-2 rounded-lb-sm shadow-lb-filter flex flex-col p-1 min-w-[160px]"
          style={{ position: 'fixed', top: coords.top, right: coords.right, zIndex: 1000 }}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`w-full flex items-center rounded-lb-sm font-lb text-left px-3 py-2.5 min-h-10 text-[14px] leading-[20px] border-none cursor-pointer transition-colors duration-[120ms] ${
                item.disabled
                  ? 'text-lb-on-surface-3 cursor-not-allowed'
                  : item.danger
                    ? 'bg-transparent text-lb-red hover:bg-lb-red-bg'
                    : 'bg-transparent text-lb-on-surface font-lb-regular hover:bg-lb-surface-grey'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

/** Inline rename control — a lightweight text input swapped in for the
 * theme name, chosen over a full modal per the spec's "whichever is less
 * invasive to build" call. Renders only the input (+ length counter); the
 * Save/Cancel icon buttons live in the parent row/card so they can replace
 * that row's other actions, and target this form by id (a plain HTML
 * `form` attribute works even though the buttons sit outside the `<form>`
 * element) rather than needing the input's text lifted up to the parent. No
 * more save-on-blur, either — that raced with clicking Cancel (blur fires
 * first and would silently save right before the cancel click landed).
 */
export function RenameField({ formId, value, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [text, setText] = useState(value);
  // Local, inline-only validation (empty name) lives here since it never
  // needs to reach the parent — the parent-level checks below (duplicate
  // name, simulated failures) are reported via a red snackbar instead of
  // inline text, since they represent the save actually being rejected by
  // "the backend" rather than the field's own input being malformed.
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError(t('sectionBuilder:onlineStore.themes.nameRequired', 'Field cannot be empty'));
      return;
    }
    setError(null);
    // onSubmit returning `false` means the parent rejected the save (e.g.
    // duplicate name, simulated error) and already surfaced its own red
    // snackbar — revert the field to what it held before this edit, per the
    // "reverted back to the previous edit" spec, and stay open so the
    // merchant can try again. A truthy/undefined return means it succeeded
    // and the parent has already exited rename mode (isRenaming flips
    // false, unmounting this field), so there's nothing left to reset here.
    const ok = onSubmit(trimmed);
    if (ok === false) setText(value);
  }

  return (
    <form id={formId} onSubmit={handleSubmit} style={{ position: 'relative' }}>
      <input
        autoFocus
        value={text}
        maxLength={MAX_THEME_NAME_LENGTH}
        onChange={(e) => { setText(e.target.value.slice(0, MAX_THEME_NAME_LENGTH)); setError(null); }}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        style={{
          fontSize: '16px', fontWeight: 400, color: '#282828',
          border: `1px solid ${error ? '#DC2626' : '#006BFF'}`,
          borderRadius: '6px', padding: '4px 52px 4px 8px', width: '100%',
        }}
      />
      {/* Suffix inside the field itself (not a caption below it) — sized to
          fit "40/40" at its widest so the input's own right padding above
          never lets typed text run under it. */}
      <span style={{
        position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)',
        fontSize: '11px', color: '#9CA3AF', pointerEvents: 'none',
      }}>
        {text.length}/{MAX_THEME_NAME_LENGTH}
      </span>
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#DC2626' }}>{error}</p>
      )}
    </form>
  );
}

/** The Cancel/Save icon-button pair swapped in for a row's normal actions
 * while renaming — Cancel (red, danger) sits left and just calls onCancel
 * directly; Save (blue, primary) sits right and submits `formId`'s form
 * from outside it. Each wrapped in a Tooltip naming its action, since an
 * icon-only button has no visible label of its own. */
function RenameActions({ formId, onCancel }) {
  const { t } = useTranslation();
  return (
    <>
      <Tooltip content={t('sectionBuilder:onlineStore.themes.cancelRename', 'Cancel')}>
        <IconBtn
          type="button"
          icon={<X size={16} />}
          variant="ghost"
          size="sm"
          className="rename-cancel-btn"
          onClick={onCancel}
          aria-label={t('sectionBuilder:onlineStore.themes.cancelRename', 'Cancel')}
        />
      </Tooltip>
      <Tooltip content={t('sectionBuilder:onlineStore.themes.saveRename', 'Save')}>
        <IconBtn
          type="submit"
          form={formId}
          icon={<Check size={16} />}
          variant="primary"
          size="sm"
          aria-label={t('sectionBuilder:onlineStore.themes.saveRename', 'Save')}
        />
      </Tooltip>
    </>
  );
}

/** CSS-ellipsizes a saved (non-editing) theme name once it's wider than its
 * row/card column allows — width-based, not a character-count cutoff, since
 * the 40-char cap enforced while renaming can still overflow a narrow
 * column — and wraps it in ce-ui's Tooltip with the full name, but *only*
 * when it's actually truncated (an untruncated name has nothing more to
 * reveal on hover).
 *
 * Getting there needs a bit of measuring: ce-ui's Tooltip renders its own
 * `position: relative inline-flex` wrapper div around its child, which has
 * no bounded width of its own — a percentage `width`/`max-width` on the
 * name span inside it has nothing definite to resolve against, so it can
 * never actually clamp regardless of class ordering. The fix is to never
 * ask Tooltip's wrapper to do any sizing: an *outer* plain block div (always
 * 100% of its real flex/block parent, unaffected by whatever Tooltip does
 * inside it) is measured via ResizeObserver, and that measured pixel width
 * — a hard number, not a percentage — is applied directly to the name span.
 * A child with an explicit pixel width dictates Tooltip's shrink-to-fit
 * wrapper size regardless of the wrapper's own display value, so the
 * ellipsis holds however deep the Tooltip nests it.
 */
function TruncatedName({ name, style }) {
  const outerRef = useRef(null);
  const spanRef = useRef(null);
  const [width, setWidth] = useState(null);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return undefined;
    const measure = () => {
      setWidth(outer.clientWidth);
      const span = spanRef.current;
      if (span) setTruncated(span.scrollWidth > span.clientWidth + 1);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    return () => observer.disconnect();
  }, [name]);

  const span = (
    <span
      ref={spanRef}
      style={{
        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        width: width != null ? `${width}px` : '100%',
      }}
    >
      {name}
    </span>
  );

  return (
    <div ref={outerRef} style={{ width: '100%', minWidth: 0, ...style }}>
      {truncated ? <Tooltip content={name}>{span}</Tooltip> : span}
    </div>
  );
}

/**
 * Published theme's Public/Private badge — a clickable trigger (icon +
 * label + chevron) instead of a plain StatusBadge, opening a small popover
 * of the two visibility options. Selecting the option that's already
 * active is a no-op (no confirm dialog, no snackbar) since nothing would
 * actually change; the parent (ThemeGallery.jsx) owns confirming and
 * persisting an actual change. Popover mechanics (portal, outside-click/
 * Escape to close, fixed-position coords from the trigger's own rect) are
 * the same approach MoreMenu above already uses, just with a badge-shaped
 * trigger instead of an icon-only "⋮" button and two fixed items instead
 * of an arbitrary list.
 */
export function PublishedVisibilityBadge({ visibility, onSelect }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 6, left: rect.left });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleClick(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target)
        && menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  // Records that predate this field (or a stale/unknown value) read as
  // Public — the same default a freshly published theme gets (see
  // ThemeGallery.jsx's handlePublishConfirm).
  const isPrivate = visibility === 'private';
  const options = [
    { value: 'public', label: t('sectionBuilder:onlineStore.themes.visibilityPublic', 'Public'), icon: Eye },
    { value: 'private', label: t('sectionBuilder:onlineStore.themes.visibilityPrivate', 'Private'), icon: Lock },
  ];
  const TriggerIcon = isPrivate ? Lock : Eye;

  return (
    <div ref={triggerRef} style={{ display: 'inline-block', position: 'relative' }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '2px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: '14px', fontWeight: 400, lineHeight: '18px', letterSpacing: '0.0825px',
          background: isPrivate ? '#E5E7EB' : '#006BFF',
          color: isPrivate ? '#374151' : '#FFFFFF',
        }}
      >
        <TriggerIcon size={14} />
        {isPrivate
          ? t('sectionBuilder:onlineStore.themes.visibilityPrivate', 'Private')
          : t('sectionBuilder:onlineStore.themes.visibilityPublic', 'Public')}
        <ChevronDown size={14} />
      </button>
      {open && coords && createPortal(
        <div
          ref={menuRef}
          className="bg-lb-surface border border-lb-line-2 rounded-lb-sm shadow-lb-filter flex flex-col p-1 min-w-[160px]"
          style={{ position: 'fixed', top: coords.top, left: coords.left, zIndex: 1000 }}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt) => {
            const active = opt.value === (isPrivate ? 'private' : 'public');
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (!active) onSelect(opt.value);
                }}
                className="w-full flex items-center gap-2 rounded-lb-sm font-lb text-left px-3 py-2.5 min-h-10 text-[14px] leading-[20px] border-none cursor-pointer transition-colors duration-[120ms] bg-transparent text-lb-on-surface font-lb-regular hover:bg-lb-surface-grey"
              >
                <opt.icon size={14} />
                <span style={{ flex: 1 }}>{opt.label}</span>
                {active && <Check size={14} />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

export function PublishedThemeCard({
  theme, domain, previewData, isRenaming, onEdit, onPreview, onRenameStart, onRenameSubmit, onRenameCancel, onVisibilityChange,
}) {
  const { t } = useTranslation();
  const renameFormId = useId();
  return (
    <div className="published-theme-card">
      <div className="published-theme-card__preview">
        {previewData}
      </div>
      <div className="published-theme-card__footer">
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#282828', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{domain}</span>
            <PublishedVisibilityBadge visibility={theme.visibility} onSelect={onVisibilityChange} />
          </p>
          {isRenaming ? (
            <RenameField formId={renameFormId} value={theme.name} onSubmit={onRenameSubmit} onCancel={onRenameCancel} />
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', display: 'flex', minWidth: 0 }}>
              <TruncatedName name={theme.name} style={{ flex: '0 1 auto', minWidth: 0, width: 'auto' }} />
              <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                &nbsp;&middot; {t('sectionBuilder:onlineStore.themes.lastSaved', 'Last saved: {{time}}', { time: formatRelativeTime(theme.lastSavedAt ?? theme.publishedAt) })}
              </span>
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
          {isRenaming ? (
            <RenameActions formId={renameFormId} onCancel={onRenameCancel} />
          ) : (
            <>
              <MainBtn variant="secondary" size="sm" label={t('sectionBuilder:onlineStore.themes.editThemePublished', 'Edit Theme')} onClick={onEdit} />
              <MoreMenu
                items={[
                  { label: t('sectionBuilder:onlineStore.themes.preview', 'Preview'), onClick: onPreview },
                  { label: t('sectionBuilder:onlineStore.themes.rename', 'Rename'), onClick: onRenameStart },
                ]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function DraftThemeRow({
  theme, previewData, isRenaming, isPublishing, isInstalling, installingLabel, isDuplicating,
  onPublish, onEdit, onPreview, onRenameStart, onRenameSubmit, onRenameCancel, onDuplicate, onDelete,
}) {
  const { t } = useTranslation();
  const renameFormId = useId();
  return (
    <div className="draft-theme-row">
      <div className="draft-theme-row__thumb">
        {isInstalling ? <div className="theme-install-spinner" aria-hidden="true" /> : previewData}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        {isRenaming ? (
          <RenameField formId={renameFormId} value={theme.name} onSubmit={onRenameSubmit} onCancel={onRenameCancel} />
        ) : (
          <>
            <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#282828' }}>
              <TruncatedName name={theme.name} />
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
              {isInstalling
                ? (installingLabel ?? t('sectionBuilder:onlineStore.themes.installing', 'Installing theme'))
                : t('sectionBuilder:onlineStore.themes.added', 'Added: {{time}}', { time: formatRelativeTime(theme.addedAt) })}
            </p>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
        {isRenaming ? (
          <RenameActions formId={renameFormId} onCancel={onRenameCancel} />
        ) : (
          <>
            <MainBtn
              variant="secondary"
              size="sm"
              label={isPublishing ? t('sectionBuilder:onlineStore.themes.publishing', 'Publishing…') : t('sectionBuilder:onlineStore.themes.publish', 'Publish')}
              onClick={onPublish}
              disabled={isPublishing || isInstalling}
            />
            <MainBtn variant="secondary" size="sm" label={t('sectionBuilder:onlineStore.themes.editDraft', 'Edit')} onClick={onEdit} disabled={isInstalling} />
            <MoreMenu
              disabled={isInstalling}
              items={[
                { label: t('sectionBuilder:onlineStore.themes.preview', 'Preview'), onClick: onPreview },
                { label: t('sectionBuilder:onlineStore.themes.rename', 'Rename'), onClick: onRenameStart },
                {
                  label: isDuplicating
                    ? t('sectionBuilder:onlineStore.themes.duplicating', 'Duplicating…')
                    : t('sectionBuilder:onlineStore.themes.duplicate', 'Duplicate'),
                  onClick: onDuplicate,
                  // Belt-and-suspenders alongside the parent's own
                  // duplicatingIds guard (see handleDraftDuplicate) — this
                  // keeps a spammed click from even reaching the handler in
                  // the first place once a duplicate for this row is already
                  // in flight.
                  disabled: isDuplicating,
                },
                { label: t('sectionBuilder:onlineStore.themes.delete', 'Delete'), onClick: onDelete, danger: true },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Ported from ecom-from-bella's WebsiteTemplates.jsx theme-card design: a
 * rounded-2xl card that lifts with a blue border/shadow on hover, a 4:3
 * thumbnail, and a hover overlay carrying the Preview action (their overlay
 * also carries the primary action — Edit — but here Add stays inline below
 * the card next to the name, matching this app's previous layout, rather
 * than requiring a hover to find it). Coming-soon stubs opt out of the hover
 * lift/border/overlay entirely (`discover-card--static`) — there's genuinely
 * nothing to preview yet, just a dimmed preview image.
 */
export function DiscoverCard({ item, previewData, isAdding, comingSoon, onAdd, onPreview }) {
  const { t } = useTranslation();
  return (
    <div className="discover-card-container">
      <div className={`discover-card${comingSoon ? ' discover-card--static' : ''}`}>
        <div className={`discover-card__preview${comingSoon ? '' : ' template-overlay-container'}`}>
          {previewData ?? <div className="discover-card__placeholder">{item.name}</div>}
          {comingSoon && <div className="discover-card__coming-soon-overlay" />}
          {/* No hover overlay for coming-soon stubs — there is genuinely
              nothing to preview yet. Real entries (Xinear) keep the Preview
              button even though the preview is currently just a
              placeholder; Add lives in the footer row below instead. */}
          {!comingSoon && (
            <div className="template-overlay">
              <button
                type="button"
                className="discover-overlay-btn discover-overlay-btn--secondary"
                onClick={(e) => { e.stopPropagation(); onPreview(item); }}
              >
                {t('sectionBuilder:onlineStore.themes.preview', 'Preview')}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="discover-card__footer">
        <p className="discover-card__name">{item.name}</p>
        <MainBtn
          variant="secondary"
          size="sm"
          label={
            comingSoon
              ? t('sectionBuilder:onlineStore.themes.comingSoon', 'Coming soon')
              : isAdding
                ? t('sectionBuilder:onlineStore.themes.adding', 'Adding…')
                : t('sectionBuilder:onlineStore.themes.add', 'Add')
          }
          onClick={() => onAdd(item)}
          disabled={isAdding || comingSoon}
        />
      </div>
    </div>
  );
}
