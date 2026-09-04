import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import BlockStream from '../../ui/BlockStream';
import EditableText from '../../ui/EditableText';
import { useSectionChrome } from '../../ui/SectionChromeContext';

// TODO(backend): submission/validation/rate-limiting/customer-list storage
// (US-9.1's AC) needs a real endpoint — this renders the form only.
function NewsletterSignupRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx }) {
  const { t } = useTranslation();
  // Reused below as the subscribe button's text color (a white button whose
  // label matches the section's own background reads correctly against it).
  // SectionShell (the wrapper this Renderer always mounts under) already
  // resolved data.color_scheme once — read it from context instead of
  // importing resolveSectionScheme and recomputing it here.
  const { background: bg } = useSectionChrome();
  const isSplit = data.layout_style === 'split';

  return (
    <section className={`px-6 ${isSplit ? '' : 'text-center'}`}>
      <div className={isSplit ? 'relative flex items-center justify-between gap-6' : 'relative mx-auto max-w-md'}>
        <BlockStream
          sectionType="newsletter_signup"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className="flex flex-col gap-1"
        />
        <div className="mt-4 flex gap-2">
          <input
            disabled
            placeholder={t('sectionBuilder:sections.newsletterSignup.emailPlaceholder')}
            className="flex-1 rounded-md border border-white/30 bg-white/10 px-3 py-2 text-sm placeholder:text-current/60"
          />
          <span style={themedButtonStyle(theme.buttons, { primary: '#ffffff', primaryText: bg })}>
            {onEdit ? (
              <EditableText
                value={data.button_label}
                placeholder={t('sectionBuilder:sections.newsletterSignup.subscribeButton')}
                onCommit={(v) => onEdit('button_label', v)}
              />
            ) : (
              data.button_label || t('sectionBuilder:sections.newsletterSignup.subscribeButton')
            )}
          </span>
        </div>
        {data.show_disclaimer !== false && (
          onEdit ? (
            <EditableText
              as="p"
              className="mt-2 text-xs opacity-70"
              value={data.disclaimer_text}
              placeholder={t('sectionBuilder:sections.newsletterSignup.disclaimer')}
              onCommit={(v) => onEdit('disclaimer_text', v)}
            />
          ) : (
            <p className="mt-2 text-xs opacity-70">{data.disclaimer_text || t('sectionBuilder:sections.newsletterSignup.disclaimer')}</p>
          )
        )}
      </div>
    </section>
  );
}

export default memo(NewsletterSignupRenderer);
