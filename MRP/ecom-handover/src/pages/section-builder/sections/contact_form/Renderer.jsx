import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import BlockStream from '../../ui/BlockStream';

// TODO(backend): submission, email notification, and rate limiting (US-9.1's
// AC) need a real endpoint — this renders the form fields only.
function ContactFormRenderer({ blocks = [], theme, mediaLibrary, blockCtx }) {
  const { t } = useTranslation();

  return (
    <section className="px-6">
      <div className="relative max-w-md space-y-3">
        <BlockStream
          sectionType="contact_form"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className="flex flex-col gap-3"
        />
        <span className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">{t('sectionBuilder:sections.contactForm.sendButton')}</span>
      </div>
    </section>
  );
}

export default memo(ContactFormRenderer);
