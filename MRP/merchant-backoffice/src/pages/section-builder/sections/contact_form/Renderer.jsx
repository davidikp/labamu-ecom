import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import BlockStream from '../../ui/BlockStream';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';

// TODO(backend): submission, email notification, and rate limiting (US-9.1's
// AC) need a real endpoint — this renders the form fields only.
function ContactFormRenderer({ blocks = [], theme, mediaLibrary, blockCtx }) {
  const { t } = useTranslation();
  const buttonStyle = themedButtonStyle(theme.buttons, {
    primary: resolveColor({ slot: 'primary' }, theme.colors),
    primaryText: resolveColor({ slot: 'primary_text' }, theme.colors),
  });

  return (
    <StorefrontContainer as="section" theme={theme}>
      <div className="relative max-w-md space-y-3">
        <BlockStream
          sectionType="contact_form"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className="flex flex-col gap-3"
        />
        <span className="inline-block text-sm" style={buttonStyle}>{t('sectionBuilder:sections.contactForm.sendButton')}</span>
      </div>
    </StorefrontContainer>
  );
}

export default memo(ContactFormRenderer);
