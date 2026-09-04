import { memo } from 'react';
import { Plus, Paperclip, UploadCloud, X } from 'lucide-react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import EditableText from '../../ui/EditableText';

// Demo-only: this is a presentational, static preview of a quote-request
// form — there's no real submission backend, so every field/button below
// just looks like a control (disabled inputs, non-interactive rows) rather
// than functioning. Matches every other form section's convention
// (contact_form, rating_form).

function FieldLabel({ children, required }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-gray-700">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none';

// Two illustrative line items — not editable, purely to show the shape a
// real RFQ line-item list would take once this is wired up for real.
const SAMPLE_ITEMS = [
  { name: 'KRISBOW Ladder Rolling Multi PRLRM1108 1.1m', qty: 2, notes: 'Need by next week' },
  { name: 'Safety Helmet Construction Helmet', qty: 10 },
];

function DetailedPreview({ buttonStyle, buttonLabel, primaryColor }) {
  return (
    <div className="max-w-xl rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <p className="text-base font-bold text-gray-900">Request a Quote</p>
      </div>
      <div className="flex flex-col gap-6 px-6 py-5">
        <div>
          <p className="mb-3 border-b border-gray-100 pb-2 text-sm font-bold text-gray-900">Customer Information</p>
          <div className="flex flex-col gap-3">
            <div>
              <FieldLabel required>Name</FieldLabel>
              <input disabled placeholder="Your full name" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Email</FieldLabel>
                <input disabled placeholder="your@email.com" className={inputClass} />
              </div>
              <div>
                <FieldLabel>Phone</FieldLabel>
                <input disabled placeholder="Phone number" className={inputClass} />
              </div>
            </div>
            <div>
              <FieldLabel>Address</FieldLabel>
              <input disabled placeholder="Your address (optional)" className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
            <p className="text-sm font-bold text-gray-900">Products</p>
            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: primaryColor }}>
              <Plus size={14} /> Add Product
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {SAMPLE_ITEMS.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    Qty: {item.qty}
                    {item.notes && ` · ${item.notes}`}
                  </p>
                </div>
                <X size={14} className="shrink-0 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-bold text-gray-900">Attachments</p>
          <p className="mb-3 text-xs text-gray-400">PDF, image, or Word documents (max 5MB each)</p>
          <div className="flex items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3.5 text-sm text-gray-500">
            <UploadCloud size={16} /> Click to upload files
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700">
              <Paperclip size={12} /> site-plan.pdf
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-gray-900">Additional Information</p>
          <FieldLabel>Customer Notes</FieldLabel>
          <textarea disabled rows={3} placeholder="Any additional notes or requirements…" className={inputClass} />
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <span className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700">Cancel</span>
        <span style={buttonStyle}>{buttonLabel}</span>
      </div>
    </div>
  );
}

function QuoteRequestFormRenderer({ data, theme, onEdit }) {
  const primaryColor = resolveColor({ slot: 'primary' }, theme.colors);
  const buttonStyle = themedButtonStyle(theme.buttons, {
    primary: primaryColor,
    primaryText: resolveColor({ slot: 'primary_text' }, theme.colors),
  });
  const buttonLabel = data.button_label || 'Request a Quote';

  return (
    <section className="px-6">
      {onEdit ? (
        <EditableText
          as="h2"
          className="mb-2 text-2xl font-bold"
          value={data.heading}
          placeholder="Request a Quote"
          onCommit={(v) => onEdit('heading', v)}
        />
      ) : (
        <h2 className="mb-2 text-2xl font-bold">{data.heading || 'Request a Quote'}</h2>
      )}
      {onEdit ? (
        <EditableText
          as="p"
          multiline
          className="mb-6 text-sm opacity-80"
          value={data.subtext}
          placeholder="Need a custom tailored clothing for special events? Just let us know what you need!"
          onCommit={(v) => onEdit('subtext', v)}
        />
      ) : (
        <p className="mb-6 text-sm opacity-80">{data.subtext || 'Need a custom tailored clothing for special events? Just let us know what you need!'}</p>
      )}

      {data.layout === 'detailed' ? (
        <DetailedPreview buttonStyle={buttonStyle} buttonLabel={buttonLabel} primaryColor={primaryColor} />
      ) : (
        <div className="flex max-w-md flex-col gap-3">
          <input type="text" disabled placeholder="Name" className={inputClass} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <input type="email" disabled placeholder="Email" className={inputClass} />
            <input type="tel" disabled placeholder="Phone" className={inputClass} />
          </div>
          <textarea disabled placeholder="Message" rows={3} className={inputClass} />
          <span style={buttonStyle} className="w-fit">
            {onEdit ? (
              <EditableText value={data.button_label} placeholder="Request a Quote" onCommit={(v) => onEdit('button_label', v)} />
            ) : (
              buttonLabel
            )}
          </span>
        </div>
      )}
    </section>
  );
}

export default memo(QuoteRequestFormRenderer);
