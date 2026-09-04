import { Trash2, MousePointerClick, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { labelForType } from '../sections/registry';
import { schemaForType } from '../sections/index';
import SchemaField from './fields/SchemaField';
import ContrastBadge from './fields/ContrastBadge';
import { groupFieldsInOrder, isFieldVisible, labelForGroup } from './fields/fieldHelpers';
import { resolveColor } from './fields/colorValue';

/**
 * Right settings panel (US-4.1, US-4.2, US-4.8, US-4.9). Generic — every
 * field type dispatches through SchemaField, so any section's (or block's)
 * schema plugs in without new panel code.
 *
 * Block editing reuses this same panel via the `schema`/`title`/`onBack`
 * overrides; the section case additionally renders a `footer` node (the
 * BlockList) between the fields and the remove button.
 */
export default function SettingsPanel({
  entity,
  schema: schemaOverride,
  title,
  onBack,
  footer,
  palette,
  onFieldChange,
  mediaLibrary,
  onAddMedia,
  onOpenLibrary,
  onRemove,
  removeLabel,
  activePage,
  viewport,
}) {
  const { t } = useTranslation();
  if (!entity) {
    return (
      <aside className="w-[280px] min-w-[240px] shrink-0 border-l border-gray-200 bg-white">
        <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
          <MousePointerClick size={28} className="text-gray-300" />
          <p className="text-sm font-medium text-gray-900">{t('sectionBuilder:editor.settingsPanel.emptyHeading')}</p>
          <p className="text-xs text-gray-500">
            {t('sectionBuilder:editor.settingsPanel.emptySubtext')}
          </p>
        </div>
      </aside>
    );
  }

  const schema = schemaOverride ?? schemaForType(entity.type);
  const heading = title ?? labelForType(entity.type);
  const data = entity.data ?? {};
  const groups = groupFieldsInOrder(schema);

  return (
    <aside className="w-[280px] min-w-[240px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          <ChevronLeft size={14} /> {t('sectionBuilder:editor.settingsPanel.backToSection', 'Back to section')}
        </button>
      )}
      <h2 className="mb-3 text-sm font-semibold text-gray-900">{heading}</h2>

      {groups.map((groupEntry, groupIndex) => (
        <div key={groupEntry.group}>
          {groupIndex > 0 && (
            <div className="mb-3 mt-5 border-t border-gray-100 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {labelForGroup(groupEntry.group)}
              </span>
            </div>
          )}
          <div className="space-y-4">
            {groupEntry.fields
              .filter(([, field]) => isFieldVisible(field, data))
              .map(([key, field]) => (
                <div key={key}>
                  <SchemaField
                    field={field}
                    value={data[key]}
                    onChange={(value) => onFieldChange(key, value, field)}
                    palette={palette}
                    mediaLibrary={mediaLibrary}
                    onAddMedia={onAddMedia}
                    onOpenLibrary={onOpenLibrary}
                    activePage={activePage}
                    viewport={viewport}
                  />
                  {field.contrastCheck && (
                    <ContrastBadge
                      hexA={resolveColor(data[key], palette)}
                      hexB={resolveColor(data[field.contrastCheck.against], palette)}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}

      {footer && <div className="mt-4 border-t border-gray-100 pt-4">{footer}</div>}

      {onRemove && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onRemove}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            {removeLabel ?? t('sectionBuilder:editor.settingsPanel.removeSection', 'Remove section')}
          </button>
        </div>
      )}
    </aside>
  );
}
