import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { StatusBadge } from '../../ce-ui';
import { loadOrSeedDemoDraft } from '../section-builder/state/demoBootstrap';
import { POLICY_SYSTEM_TYPES, mergeRequiredSystemPages, requiredSystemPages } from '../section-builder/state/defaultTheme';
import { useCompany } from '../../contexts/CompanyContext';
import PolicyEditorModal from './PolicyEditorModal';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used across the section-builder pages
// (PagesManagement.jsx, ThemeGallery.jsx, Layout.jsx's builder entry).
const STORE_ID = 'demo';

/**
 * @module pages/settings/PoliciesSettings
 * @description Settings > Policies (`/settings/policies`) — mirrors
 * Shopify's own Settings > Policies layout: a "Return and cancellation
 * rules" card (Coming Soon — no rule engine exists yet, see
 * docs/plans/09-settings-policies.md) and a "Written policies" list of the
 * six reserved policy pages (POLICY_SYSTEM_TYPES, seeded in
 * state/defaultTheme.js — includes Contact information, edited the same way
 * as the other five).
 *
 * Each row opens PolicyEditorModal — a per-row modal (template banner +
 * disclaimer + rich-text editor, matching Shopify's own UI), not the full
 * Page editor. The same reserved pages are still reachable/editable from
 * Online Store > Pages (badged "Policy") via the full Page editor too.
 */
function policyBadge(page, t) {
  if (page.systemType === 'policy_privacy' && page.automated) {
    return <StatusBadge label={t('settings:policies.written.automated', 'Automated')} color="green" tone="soft" />;
  }
  const hasContent = Boolean(page.content?.trim());
  if (hasContent) {
    return <StatusBadge label={t('settings:policies.written.set', 'Set')} color="green" tone="soft" />;
  }
  // Contact information's empty state reads "Required" (matches Shopify —
  // it's flagged as a compliance requirement, not just unfilled content);
  // every other policy's empty state reads "No policy set".
  return page.systemType === 'policy_contact' ? (
    <StatusBadge label={t('settings:policies.written.required', 'Required')} color="yellow" tone="soft" />
  ) : (
    <StatusBadge label={t('settings:policies.written.noPolicySet', 'No policy set')} color="grey" tone="soft" />
  );
}

export default function PoliciesSettings() {
  const { t } = useTranslation();
  const { companyData } = useCompany();
  const [activePolicyId, setActivePolicyId] = useState(null);

  // Same merge-on-load safety net as useSectionBuilder.js/PreviewLive.jsx —
  // a draft persisted before POLICY_SYSTEM_TYPES existed won't have these
  // pages yet, so backfill them here rather than showing a blank list.
  const [draft, setDraft] = useState(() => {
    const loaded = loadOrSeedDemoDraft(STORE_ID);
    return { ...loaded, pages: mergeRequiredSystemPages(loaded.pages, requiredSystemPages()) };
  });
  const policyPages = useMemo(
    () => POLICY_SYSTEM_TYPES.map((systemType) => draft.pages.find((p) => p.systemType === systemType)).filter(Boolean),
    [draft]
  );
  const activePolicy = policyPages.find((p) => p.id === activePolicyId) ?? null;

  return (
    <div className="w-full px-6 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">
        {t('settings:policies.title', 'Policies')}
      </h1>

      {/* Return and cancellation rules — Coming Soon, no rule engine built. */}
      <div className="mt-5 bg-white rounded-xl border border-gray-200 lb-card-pad opacity-60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 m-0">
              {t('settings:policies.rules.title', 'Return and cancellation rules')}
            </h2>
            <p className="text-xs text-gray-500 mt-1 mb-0">
              {t('settings:policies.rules.subtitle', 'Set conditions and fees for return and cancellation requests')}
            </p>
          </div>
          <StatusBadge label={t('settings:policies.rules.comingSoon', 'Coming soon')} color="grey" tone="soft" />
        </div>
      </div>

      {/* Written policies */}
      <div className="mt-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">
          {t('settings:policies.written.title', 'Written policies')}
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          {t(
            'settings:policies.written.subtitle',
            'Policies are linked in the footer of checkout and can be added to your online store menu'
          )}
        </p>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {policyPages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setActivePolicyId(page.id)}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 m-0">{page.name}</p>
              </div>
              {policyBadge(page, t)}
              <ChevronRight size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <PolicyEditorModal
        key={activePolicy?.id ?? 'none'}
        open={Boolean(activePolicy)}
        page={activePolicy}
        companyData={companyData}
        onClose={() => setActivePolicyId(null)}
        onSaved={(next) => {
          setDraft(next);
          setActivePolicyId(null);
        }}
      />
    </div>
  );
}
