import { memo } from 'react';
import { Star } from 'lucide-react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import EditableText from '../../ui/EditableText';

const STAR_COLOR = '#F59E0B'; // hardcoded per spec — same convention as testimonials/Renderer.jsx

// Demo-only: a real rating-submission flow needs a backend endpoint this
// codebase doesn't have yet, so the 5 stars below are a static, unfilled,
// non-interactive preview (no rating has been "selected"), and the button
// doesn't submit anything.
function RatingFormRenderer({ data, theme, onEdit }) {
  return (
    <section className="px-6">
      {onEdit ? (
        <EditableText
          as="h2"
          className="mb-6 text-2xl font-bold"
          value={data.heading}
          placeholder="Leave us your thoughts on how do you like our products."
          onCommit={(v) => onEdit('heading', v)}
        />
      ) : (
        <h2 className="mb-6 text-2xl font-bold">{data.heading || 'Leave us your thoughts on how do you like our products.'}</h2>
      )}

      <div className="mb-4 flex" style={{ color: STAR_COLOR }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={20} fill="none" stroke={STAR_COLOR} />
        ))}
      </div>

      <div className="flex max-w-md flex-col gap-3">
        <input
          type="text"
          disabled
          placeholder={data.name_field_label || 'Name'}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <textarea
          disabled
          placeholder={data.message_field_label || 'Message'}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          rows={3}
        />
        <span
          style={themedButtonStyle(theme.buttons, { primary: resolveColor({ slot: 'primary' }, theme.colors), primaryText: resolveColor({ slot: 'primary_text' }, theme.colors) })}
          className="w-fit"
        >
          {onEdit ? (
            <EditableText value={data.button_label} placeholder="Give Rating" onCommit={(v) => onEdit('button_label', v)} />
          ) : (
            data.button_label || 'Give Rating'
          )}
        </span>
      </div>
    </section>
  );
}

export default memo(RatingFormRenderer);
