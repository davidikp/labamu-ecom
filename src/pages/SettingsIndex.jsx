import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScrollText, ChevronRight } from 'lucide-react';

/**
 * @module pages/SettingsIndex
 * @description Settings hub (`/settings`) — deliberately minimal per the
 * Settings > Policies plan (docs/plans/09-settings-policies.md): today it
 * hosts exactly one entry, Policies. Structured as a list of rows so more
 * settings can be added later (Shopify's own General/Plan/Billing/... list)
 * without reworking this page.
 */
const ENTRIES = [
  {
    key: 'policies',
    icon: ScrollText,
    to: '/settings/policies',
  },
];

export default function SettingsIndex() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full px-6 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">
        {t('settings:title', 'Settings')}
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {ENTRIES.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => navigate(entry.to)}
            className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50"
          >
            <entry.icon size={18} className="text-gray-500 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 m-0">
                {t(`settings:sidebar.${entry.key}`, 'Policies')}
              </p>
              <p className="text-xs text-gray-500 m-0">
                {t('settings:policies.subtitle', 'Return rules and written policies')}
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-400 shrink-0" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
