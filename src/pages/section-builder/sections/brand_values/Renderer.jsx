import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import EditableText from '../../ui/EditableText';
import BlockBoundary from '../../ui/BlockBoundary';
import BlockStream from '../../ui/BlockStream';
import AddBlockControl from '../../ui/AddBlockControl';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';

// Simplification: the spec calls for a curated 40-icon picker; no icon
// picker field type exists yet, so the merchant types an emoji instead.
function BrandValuesRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx }) {
  const { t } = useTranslation();
  const iconColor = resolveColor(data.icon_color, theme.colors);
  const items = blocks.filter((b) => b.type === 'value');
  const genericBlocks = blocks.filter((b) => b.type !== 'value');
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;

  return (
    <section className="px-6">
      {data.show_heading !== false && (
        onEdit ? (
          <EditableText
            as="h2"
            className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}
            value={data.heading}
            placeholder={t('sectionBuilder:sections.brandValues.defaultHeading')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          <h2 className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.brandValues.defaultHeading')}</h2>
        )
      )}
      {(genericBlocks.length > 0 || blockCtx) && (
        <BlockStream sectionType="brand_values" blocks={genericBlocks} theme={theme} mediaLibrary={mediaLibrary} blockCtx={blockCtx} hideAdd className="mb-6 flex flex-col gap-3" />
      )}
      {items.length === 0 && !blockCtx ? (
        <p className="text-sm text-gray-400">{t('sectionBuilder:sections.brandValues.emptyState')}</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          {items.map((b) => (
            <BlockBoundary
              key={b.id}
              selected={blockCtx?.selectedBlockId === b.id}
              onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
              label={t('sectionBuilder:sections.brandValues.blockLabel', 'Value')}
            >
              <div className="max-w-[180px] text-center">
                <span style={{ color: iconColor }} className="mb-2 block text-2xl">{b.data?.icon || '⭐'}</span>
                {blockCtx ? (
                  <EditableText
                    as="p"
                    className="text-sm font-medium text-gray-900"
                    value={b.data?.label}
                    placeholder={t('sectionBuilder:sections.brandValues.defaultValueLabel')}
                    onCommit={(v) => blockCtx.onEdit(b.id, 'label', v)}
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{b.data?.label || t('sectionBuilder:sections.brandValues.defaultValueLabel')}</p>
                )}
                {blockCtx ? (
                  <EditableText
                    as="p"
                    multiline
                    className="text-xs text-gray-500"
                    value={b.data?.description}
                    placeholder={t('sectionBuilder:sections.brandValues.descriptionPlaceholder', 'Add a description…')}
                    onCommit={(v) => blockCtx.onEdit(b.id, 'description', v)}
                  />
                ) : (
                  b.data?.description && <p className="text-xs text-gray-500">{b.data.description}</p>
                )}
              </div>
            </BlockBoundary>
          ))}
        </div>
      )}

      {blockCtx && (blockCtx.selectedBlockId || blockCtx.sectionActive) && !blockCtx.atMax && (
        <div className="mt-4"><AddBlockControl sectionType="brand_values" atMax={false} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" /></div>
      )}
    </section>
  );
}

export default memo(BrandValuesRenderer);
