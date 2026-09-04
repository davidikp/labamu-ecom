import { memo } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import { starFillPercent, formatRating } from './starMath';
import BlockStream from '../../ui/BlockStream';
import EditableText from '../../ui/EditableText';

const STARS = [0, 1, 2, 3, 4];

function StarRow({ rating, color }) {
  const fillPercent = starFillPercent(rating);
  return (
    <span className="relative inline-flex leading-none" aria-hidden="true">
      <span className="flex">
        {STARS.map((i) => (
          <Star key={i} size={18} className="text-gray-300" fill="none" />
        ))}
      </span>
      <span className="absolute left-0 top-0 flex overflow-hidden" style={{ width: `${fillPercent}%` }}>
        {STARS.map((i) => (
          <Star key={i} size={18} style={{ color }} fill={color} stroke={color} className="shrink-0" />
        ))}
      </span>
    </span>
  );
}

function StarRatingBarRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx }) {
  const { t } = useTranslation();
  const starColor = resolveColor(data.star_color ?? { hex: '#F59E0B' }, theme.colors);
  const rating = data.overall_rating ?? 4.8;

  return (
    <section className="relative px-6 text-sm">
      <BlockStream
        sectionType="star_rating_bar"
        blocks={blocks}
        theme={theme}
        mediaLibrary={mediaLibrary}
        blockCtx={blockCtx}
        className="mb-3 flex flex-col gap-1"
      />
      <div className="flex flex-wrap items-center gap-3">
      <StarRow rating={rating} color={starColor} />
      {data.show_rating_number !== false && <span className="font-semibold">{formatRating(rating)}</span>}
      {data.show_review_count !== false && (
        onEdit ? (
          <span className="text-gray-500">
            (
            <EditableText
              value={data.total_reviews_count}
              placeholder={t('sectionBuilder:sections.starRatingBar.reviewsCountPlaceholder', '2,400+')}
              onCommit={(v) => onEdit('total_reviews_count', v)}
            />
            )
          </span>
        ) : (
          data.total_reviews_count && <span className="text-gray-500">({data.total_reviews_count})</span>
        )
      )}
      {onEdit ? (
        <EditableText
          className="text-gray-500"
          value={data.tagline}
          placeholder={t('sectionBuilder:sections.starRatingBar.taglinePlaceholder', 'Add a tagline…')}
          onCommit={(v) => onEdit('tagline', v)}
        />
      ) : (
        data.tagline && <span className="text-gray-500">{data.tagline}</span>
      )}
      {data.show_read_reviews_link && (
        <span className="font-medium underline">{t('sectionBuilder:sections.starRatingBar.defaultLinkLabel')}</span>
      )}
      </div>
    </section>
  );
}

export default memo(StarRatingBarRenderer);
