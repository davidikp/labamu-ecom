import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveMedia } from '../../ui/fields/imageValue';
import EditableText from '../../ui/EditableText';
import BlockBoundary from '../../ui/BlockBoundary';
import BlockStream from '../../ui/BlockStream';
import AddBlockControl from '../../ui/AddBlockControl';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

const COLS_CLASS = { '1': 'grid-cols-1', '2': 'grid-cols-2', '3': 'grid-cols-3', '4': 'grid-cols-4' };

function ImageGalleryRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const items = blocks.filter((b) => b.type === 'image');
  const genericBlocks = blocks.filter((b) => b.type !== 'image');
  const isMasonry = data.layout_style === 'masonry';
  const colsClass = COLS_CLASS[mobile ? data.columns_mobile ?? '2' : data.columns_desktop ?? '3'] ?? 'grid-cols-2';
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;
  const aspectClass = ASPECT_RATIO_CLASS[data.image_aspect_ratio] ?? ASPECT_RATIO_CLASS.square;

  return (
    <section className="px-6">
      {onEdit ? (
        <EditableText
          as="h2"
          className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}
          value={data.heading}
          placeholder={t('sectionBuilder:sections.imageGallery.headingPlaceholder', 'Add a heading…')}
          onCommit={(v) => onEdit('heading', v)}
        />
      ) : (
        data.heading && <h2 className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading}</h2>
      )}
      {(genericBlocks.length > 0 || blockCtx) && (
        <BlockStream sectionType="image_gallery" blocks={genericBlocks} theme={theme} mediaLibrary={mediaLibrary} blockCtx={blockCtx} hideAdd className="mb-6 flex flex-col gap-3" isMobile={isMobile} />
      )}
      {items.length < 2 && !blockCtx ? (
        <p className="text-sm text-gray-400">{t('sectionBuilder:sections.imageGallery.emptyState')}</p>
      ) : isMasonry ? (
        <div className="columns-1 gap-4 sm:columns-3">
          {items.map((b) => {
            const image = resolveMedia(b.data?.image, mediaLibrary);
            return (
              <BlockBoundary
                key={b.id}
                selected={blockCtx?.selectedBlockId === b.id}
                onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
                label={t('sectionBuilder:sections.imageGallery.blockLabel', 'Image')}
              >
                <div className="mb-4 break-inside-avoid rounded-md bg-gray-100">
                  {image ? <img src={image.url} alt={b.data?.alt ?? b.data?.alt_text} className="w-full rounded-md" /> : <div className="flex aspect-square items-center justify-center text-xs text-gray-300">{t('sectionBuilder:sections.common.noImage')}</div>}
                </div>
              </BlockBoundary>
            );
          })}
        </div>
      ) : (
        <div className={`grid gap-4 ${colsClass}`}>
          {items.map((b) => {
            const image = resolveMedia(b.data?.image, mediaLibrary);
            return (
              <BlockBoundary
                key={b.id}
                selected={blockCtx?.selectedBlockId === b.id}
                onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
                label={t('sectionBuilder:sections.imageGallery.blockLabel', 'Image')}
              >
                <div className={`flex items-center justify-center rounded-md bg-gray-100 text-xs text-gray-300 ${aspectClass}`}>
                  {image ? <img src={image.url} alt={b.data?.alt ?? b.data?.alt_text} className="h-full w-full rounded-md object-cover" /> : t('sectionBuilder:sections.common.noImage')}
                </div>
              </BlockBoundary>
            );
          })}
        </div>
      )}

      {blockCtx && (blockCtx.selectedBlockId || blockCtx.sectionActive) && !blockCtx.atMax && (
        <div className="mt-4"><AddBlockControl sectionType="image_gallery" atMax={false} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" /></div>
      )}
    </section>
  );
}

export default memo(ImageGalleryRenderer);
