import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreVertical } from 'lucide-react';
import { MainBtn, CTAButton, IconBtn } from '../../ce-ui';
import { formatRelativeTime } from './timeUtils';

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
 * ce-ui's Dropdown (that component is a form select, not a menu trigger).
 * Closes on outside click and Escape. */
export function MoreMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
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

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <IconBtn
        icon={<MoreVertical size={16} />}
        variant="ghost"
        size="sm"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="More actions"
      />
      {open && (
        <div
          className="more-menu-popover"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className="more-menu-item"
              disabled={item.disabled}
              onClick={() => { setOpen(false); item.onClick(); }}
              style={item.danger ? { color: '#DC2626' } : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Inline rename control — a lightweight text input swapped in for the
 * theme name, chosen over a full modal per the spec's "whichever is less
 * invasive to build" call. */
export function RenameField({ value, onSubmit, onCancel }) {
  const [text, setText] = useState(value);
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(text.trim() || value); }}
      style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
    >
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        onBlur={() => onSubmit(text.trim() || value)}
        style={{ fontSize: '16px', fontWeight: 700, color: '#282828', border: '1px solid #006BFF', borderRadius: '6px', padding: '4px 8px', flex: 1 }}
      />
    </form>
  );
}

export function PublishedThemeCard({
  theme, domain, previewData, isRenaming, onEdit, onPreview, onRenameStart, onRenameSubmit, onRenameCancel,
}) {
  const { t } = useTranslation();
  return (
    <div className="published-theme-card">
      <div className="published-theme-card__preview">
        {previewData}
        <span className="published-badge">{t('sectionBuilder:onlineStore.themes.publishedBadge', 'Published Theme')}</span>
      </div>
      <div className="published-theme-card__footer">
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#282828' }}>{domain}</p>
          {isRenaming ? (
            <RenameField value={theme.name} onSubmit={onRenameSubmit} onCancel={onRenameCancel} />
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
              {theme.name} &middot; {t('sectionBuilder:onlineStore.themes.lastSaved', 'Last saved: {{time}}', { time: formatRelativeTime(theme.lastSavedAt ?? theme.publishedAt) })}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
          <MainBtn variant="secondary" size="sm" label={t('sectionBuilder:onlineStore.themes.editTheme', 'Edit theme')} onClick={onEdit} />
          <MoreMenu
            items={[
              { label: t('sectionBuilder:onlineStore.themes.preview', 'Preview'), onClick: onPreview },
              { label: t('sectionBuilder:onlineStore.themes.rename', 'Rename'), onClick: onRenameStart },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function DraftThemeRow({
  theme, previewData, isRenaming, isPublishing,
  onPublish, onEdit, onPreview, onRenameStart, onRenameSubmit, onRenameCancel, onDuplicate, onDelete,
}) {
  const { t } = useTranslation();
  return (
    <div className="draft-theme-row">
      <div className="draft-theme-row__thumb">{previewData}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        {isRenaming ? (
          <RenameField value={theme.name} onSubmit={onRenameSubmit} onCancel={onRenameCancel} />
        ) : (
          <>
            <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#282828' }}>{theme.name}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
              {t('sectionBuilder:onlineStore.themes.added', 'Added: {{time}}', { time: formatRelativeTime(theme.addedAt) })}
            </p>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
        <MainBtn
          variant="secondary"
          size="sm"
          label={isPublishing ? t('sectionBuilder:onlineStore.themes.publishing', 'Publishing…') : t('sectionBuilder:onlineStore.themes.publish', 'Publish')}
          onClick={onPublish}
          disabled={isPublishing}
        />
        <CTAButton variant="primary" size="sm" label={t('sectionBuilder:onlineStore.themes.editTheme', 'Edit theme')} onClick={onEdit} />
        <MoreMenu
          items={[
            { label: t('sectionBuilder:onlineStore.themes.preview', 'Preview'), onClick: onPreview },
            { label: t('sectionBuilder:onlineStore.themes.rename', 'Rename'), onClick: onRenameStart },
            { label: t('sectionBuilder:onlineStore.themes.duplicate', 'Duplicate'), onClick: onDuplicate },
            { label: t('sectionBuilder:onlineStore.themes.delete', 'Delete'), onClick: onDelete, danger: true },
          ]}
        />
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
 * nothing to preview yet, only the badge.
 */
export function DiscoverCard({ item, previewData, isAdding, comingSoon, onAdd, onPreview }) {
  const { t } = useTranslation();
  return (
    <div className="discover-card-container">
      <div className={`discover-card${comingSoon ? ' discover-card--static' : ''}`}>
        <div className={`discover-card__preview${comingSoon ? '' : ' template-overlay-container'}`}>
          {previewData ?? <div className="discover-card__placeholder">{item.name}</div>}
          {comingSoon && (
            <span className="discover-card__coming-soon-badge">
              {t('sectionBuilder:onlineStore.themes.comingSoon', 'Coming soon')}
            </span>
          )}
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
