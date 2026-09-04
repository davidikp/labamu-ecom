import { memo } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EditableText from '../../ui/EditableText';
import BlockBoundary from '../../ui/BlockBoundary';
import BlockStream from '../../ui/BlockStream';
import AddBlockControl from '../../ui/AddBlockControl';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';

const COLS_CLASS = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-3' };
const STAR_COLOR = '#F59E0B'; // hardcoded per spec — universally recognised as a rating color

function TestimonialsRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx }) {
  const { t } = useTranslation();
  const colsClass = COLS_CLASS[data.columns_desktop] ?? COLS_CLASS['3'];
  const quotes = blocks.filter((b) => b.type === 'quote');
  const genericBlocks = blocks.filter((b) => b.type !== 'quote');
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;

  return (
    <section className="px-6">
      {data.show_heading !== false &&
        (onEdit ? (
          <EditableText
            as="h2"
            className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}
            value={data.heading}
            placeholder={t('sectionBuilder:sections.testimonials.defaultHeading')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          <h2 className={`mb-6 font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.testimonials.defaultHeading')}</h2>
        ))}

      {(genericBlocks.length > 0 || blockCtx) && (
        <BlockStream sectionType="testimonials" blocks={genericBlocks} theme={theme} mediaLibrary={mediaLibrary} blockCtx={blockCtx} hideAdd className="mb-6 flex flex-col gap-3" />
      )}

      {quotes.length === 0 && !blockCtx ? (
        <p className="text-sm text-gray-400">{t('sectionBuilder:sections.testimonials.emptyState')}</p>
      ) : (
        <div className={`grid grid-cols-1 gap-4 ${colsClass}`}>
          {quotes.map((b) => (
            <BlockBoundary
              key={b.id}
              selected={blockCtx?.selectedBlockId === b.id}
              onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
              label={t('sectionBuilder:sections.testimonials.blockLabel', 'Testimonial')}
            >
              <div className="h-full rounded-md border border-gray-200 bg-white p-4">
                <div className="mb-2 flex" style={{ color: STAR_COLOR }}>
                  {Array.from({ length: Number(b.data?.star_rating ?? 5) }).map((_, i) => (
                    <Star key={i} size={14} fill={STAR_COLOR} stroke={STAR_COLOR} />
                  ))}
                </div>
                {blockCtx ? (
                  <EditableText
                    as="p"
                    multiline
                    className="mb-2 text-sm text-gray-700"
                    value={b.data?.quote}
                    placeholder={t('sectionBuilder:sections.testimonials.defaultQuote')}
                    onCommit={(v) => blockCtx.onEdit(b.id, 'quote', v)}
                  />
                ) : (
                  <p className="mb-2 text-sm text-gray-700">"{b.data?.quote || t('sectionBuilder:sections.testimonials.defaultQuote')}"</p>
                )}
                {blockCtx ? (
                  <EditableText
                    className="text-xs font-medium text-gray-500"
                    value={b.data?.reviewer_name}
                    placeholder={t('sectionBuilder:sections.testimonials.defaultAuthor')}
                    onCommit={(v) => blockCtx.onEdit(b.id, 'reviewer_name', v)}
                  />
                ) : (
                  <p className="text-xs font-medium text-gray-500">{b.data?.reviewer_name || t('sectionBuilder:sections.testimonials.defaultAuthor')}</p>
                )}
              </div>
            </BlockBoundary>
          ))}
        </div>
      )}

      {blockCtx && (blockCtx.selectedBlockId || blockCtx.sectionActive) && !blockCtx.atMax && (
        <div className="mt-4"><AddBlockControl sectionType="testimonials" atMax={false} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" /></div>
      )}
    </section>
  );
}

export default memo(TestimonialsRenderer);
