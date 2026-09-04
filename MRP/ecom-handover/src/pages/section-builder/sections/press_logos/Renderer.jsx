import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveMedia } from '../../ui/fields/imageValue';
import EditableText from '../../ui/EditableText';
import BlockBoundary from '../../ui/BlockBoundary';
import BlockStream from '../../ui/BlockStream';
import AddBlockControl from '../../ui/AddBlockControl';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4', '5': 'grid-cols-5', '6': 'grid-cols-6' };

function PressLogosRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const items = blocks.filter((b) => b.type === 'logo');
  const genericBlocks = blocks.filter((b) => b.type !== 'logo');
  const colsClass = COLS_CLASS[mobile ? data.logos_per_row_mobile ?? '2' : data.logos_per_row_desktop ?? '4'] ?? 'grid-cols-2';
  const height = data.logo_height ?? 48;
  const grayscale = data.logo_style !== 'original';
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;

  return (
    <section className="px-6">
      {data.show_heading !== false && (
        onEdit ? (
          <EditableText
            as="h2"
            className={`mb-6 text-center font-semibold text-gray-900 ${headingSizeClass}`}
            value={data.heading}
            placeholder={t('sectionBuilder:sections.pressLogos.defaultHeading')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          <h2 className={`mb-6 text-center font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.pressLogos.defaultHeading')}</h2>
        )
      )}
      {(genericBlocks.length > 0 || blockCtx) && (
        <BlockStream sectionType="press_logos" blocks={genericBlocks} theme={theme} mediaLibrary={mediaLibrary} blockCtx={blockCtx} hideAdd className="mb-6 flex flex-col gap-3" isMobile={isMobile} />
      )}
      {items.length === 0 && !blockCtx ? (
        <p className="text-center text-sm text-gray-400">{t('sectionBuilder:sections.pressLogos.emptyState')}</p>
      ) : (
        <div className={`grid items-center gap-6 ${colsClass}`}>
          {items.map((b) => {
            const logo = resolveMedia(b.data?.logo, mediaLibrary);
            return (
              <BlockBoundary
                key={b.id}
                selected={blockCtx?.selectedBlockId === b.id}
                onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
                label={t('sectionBuilder:sections.pressLogos.blockLabel', 'Logo')}
              >
                <div className="flex items-center justify-center" style={{ height }}>
                  {logo ? (
                    <img src={logo.url} alt={b.data?.alt_text} style={{ height, filter: grayscale ? 'grayscale(100%)' : undefined }} className="object-contain" />
                  ) : (
                    <span className="text-xs text-gray-300">{t('sectionBuilder:sections.common.noImage')}</span>
                  )}
                </div>
              </BlockBoundary>
            );
          })}
        </div>
      )}

      {blockCtx && (blockCtx.selectedBlockId || blockCtx.sectionActive) && !blockCtx.atMax && (
        <div className="mt-4"><AddBlockControl sectionType="press_logos" atMax={false} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" /></div>
      )}
    </section>
  );
}

export default memo(PressLogosRenderer);
