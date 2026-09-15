import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Popup, Toggle } from '../../ce-ui';
import RichTextEditor from '../online-store/RichTextEditor';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { ACTIONS } from '../section-builder/state/builderReducer';
import { syncSectionsWithContent } from '../section-builder/sections/pageContentSync';
import { templateFor, buildAutomatedPrivacyPolicy, TEMPLATE_DISCLAIMER } from './policyTemplates';

const STORE_ID = 'demo';

/**
 * @module pages/settings/PolicyEditorModal
 * @description Per-row modal editor for a written policy (Settings >
 * Policies), matching Shopify's own modal layout: a template-insert banner
 * with a collapsible disclaimer, the rich-text editor, and Cancel/Save —
 * plus, for Privacy only, a "Use automated policy" toggle.
 *
 * Saving dispatches the same ACTIONS.UPDATE_PAGE the full Page editor uses,
 * and re-syncs the same auto-managed rich_text section (see
 * pageContentSync.js) so the policy renders at its slug in the live
 * storefront preview exactly like a page saved from PageEditor.jsx.
 *
 * The caller must remount this component per policy (e.g. `key={page.id}`)
 * so its content/automated state re-initializes from the newly-opened page
 * instead of carrying over the previous one — see PoliciesSettings.jsx.
 */
function initialContentFor(page, companyData) {
  const isPrivacy = page?.systemType === 'policy_privacy';
  if (isPrivacy && page?.automated) return buildAutomatedPrivacyPolicy(companyData);
  return page?.content ?? '';
}

export default function PolicyEditorModal({ open, page, companyData, onClose, onSaved }) {
  const { t } = useTranslation();
  const isPrivacy = page?.systemType === 'policy_privacy';

  const [content, setContent] = useState(() => initialContentFor(page, companyData));
  const [automated, setAutomated] = useState(Boolean(page?.automated));
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!open || !page) return null;

  const dirty = automated !== Boolean(page.automated) || content !== (page.content ?? '');

  // Toggling automated on regenerates content from store data (view-only —
  // see the `editable={!automated}` RichTextEditor below); toggling it off
  // hands the merchant that same generated text as an editable starting
  // point, rather than dropping them into a blank editor.
  const handleToggleAutomated = (next) => {
    setAutomated(next);
    if (next) setContent(buildAutomatedPrivacyPolicy(companyData));
  };

  const handleInsertTemplate = () => {
    const templateHtml = templateFor(page.systemType, companyData);
    if (templateHtml) setContent(templateHtml);
  };

  const handleSave = () => {
    if (isSaving) return;
    setIsSaving(true);
    const next = runDraftAction(STORE_ID, {
      type: ACTIONS.UPDATE_PAGE,
      pageId: page.id,
      patch: {
        content,
        automated,
        sections: syncSectionsWithContent(page.sections, page.id, { name: page.name, content }),
      },
    });
    setIsSaving(false);
    onSaved?.(next);
  };

  return (
    <Popup
      open={open}
      onClose={onClose}
      title={page.name}
      platform="desktop"
      align="left"
      secondaryAction={{ label: t('settings:policies.modal.cancel', 'Cancel'), onClick: onClose }}
      primaryAction={{
        label: t('settings:policies.modal.save', 'Save'),
        onClick: handleSave,
        disabled: !dirty || isSaving,
        loading: isSaving,
      }}
    >
      <div className="pb-4">
        {isPrivacy && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900 m-0">
                {t('settings:policies.modal.useAutomated', 'Use automated policy')}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 mb-0">
                {t('settings:policies.modal.useAutomatedHelp', 'Keep policy content in sync with store settings and latest templates')}
              </p>
            </div>
            <Toggle checked={automated} onChange={handleToggleAutomated} />
          </div>
        )}

        {!automated && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs text-gray-600 m-0">
                {t('settings:policies.modal.templateBanner', "Templates aren't legal advice. By using policy templates, you agree that you've read and agree to the")}{' '}
                <button
                  type="button"
                  onClick={() => setDisclaimerOpen((v) => !v)}
                  className="inline-flex items-center gap-0.5 text-blue-600 font-medium hover:underline"
                >
                  {t('settings:policies.modal.disclaimer', 'disclaimer')}
                  <ChevronDown size={12} className={disclaimerOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
              </p>
              {templateFor(page.systemType, companyData) && (
                <button
                  type="button"
                  onClick={handleInsertTemplate}
                  className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                >
                  {t('settings:policies.modal.insertTemplate', 'Insert template')}
                </button>
              )}
            </div>
            {disclaimerOpen && <p className="text-xs text-gray-500 mt-2 mb-0">{TEMPLATE_DISCLAIMER}</p>}
          </div>
        )}

        <RichTextEditor value={content} onChange={setContent} editable={!automated} />
      </div>
    </Popup>
  );
}
