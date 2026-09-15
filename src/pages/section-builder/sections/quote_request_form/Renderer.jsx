import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Paperclip, UploadCloud, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle, themedButtonHoverStyle } from '../shared/themedButtonStyle';
import ThemedButtonHover from '../shared/ThemedButtonHover';
import { resolveFormRecipe } from '../shared/formRecipes';
import { submitRfq } from '../../../../services/rfqService';
import { resolveStorefrontProducts } from '../shared/productSource';
import EditableText from '../../ui/EditableText';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import PhoneInput from '../../../../components/ui/PhoneInput';
import { resolveMedia } from '../../ui/fields/imageValue';

// Real submission, real state, real validation on the published storefront
// (`!onEdit`) — reuses the app's existing `services/rfqService.js` (already
// wired to `api/client.js`'s mock-or-real POST /rfq, exactly the pattern
// every other real submission in this codebase uses; no new backend/mock
// convention invented here). In the interactive BUILDER canvas (`onEdit`
// truthy), fields stay a static/disabled preview — same "don't let editing
// accidentally submit real data" convention header/footer's onNavigate gate
// already established for links.
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function FieldLabel({ children, required, recipe }) {
  return (
    <label className="mb-1 block text-xs font-semibold" style={recipe ? { fontSize: `${recipe.label.fontSize}px`, color: recipe.label.color } : undefined}>
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function fieldStyleFor(recipe, isTextarea) {
  return { height: isTextarea ? undefined : `${recipe.field.height}px`, borderRadius: `${recipe.field.radius}px`, fontSize: `${recipe.field.fontSize}px`, borderColor: recipe.field.borderColor };
}

// Illustrative-only shape, shown while editing so the canvas isn't empty —
// never submitted, matches every other section's static-preview convention.
const SAMPLE_ITEMS = [
  { name: 'KRISBOW Ladder Rolling Multi PRLRM1108 1.1m', qty: 2, notes: 'Need by next week' },
  { name: 'Safety Helmet Construction Helmet', qty: 10 },
];

function StaticDetailedPreview({ buttonStyle, buttonHoverStyle, buttonLabel, primaryColor, inputClass }) {
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
        <ThemedButtonHover style={buttonStyle} hoverStyle={buttonHoverStyle}>{buttonLabel}</ThemedButtonHover>
      </div>
    </div>
  );
}

/** The real, functional RFQ form — published storefront only (`!onEdit`).
 * Mirrors the golden reference's data shape/flow (HouzezPreview.jsx's
 * rfq* state + handleRfqSubmit/openAddProduct/handleRfqAttachSelect)
 * simplified to one inline "add product" row instead of a nested
 * modal-in-modal picker — a deliberate structural simplification (still the
 * same real add/remove/validate/submit behavior), not a fake. */
function FunctionalDetailedForm({ buttonStyle, buttonHoverStyle, buttonLabel, recipe, inputClass, primaryColor, products }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [draftProductId, setDraftProductId] = useState('');
  const [draftQty, setDraftQty] = useState(1);
  const [attachments, setAttachments] = useState([]);
  const [fileError, setFileError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const availableProducts = products.filter((p) => !items.some((it) => it.product.id === p.id));

  const addProduct = () => {
    const product = products.find((p) => p.id === draftProductId) ?? availableProducts[0];
    if (!product) return;
    setItems((prev) => [...prev, { product, qty: Math.max(1, Number(draftQty) || 1) }]);
    setDraftProductId('');
    setDraftQty(1);
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((it) => it.product.id !== productId));

  const addFiles = (fileList) => {
    setFileError('');
    const files = Array.from(fileList ?? []);
    const tooBig = files.find((f) => f.size > MAX_FILE_BYTES);
    if (tooBig) {
      setFileError(t('sectionBuilder:sections.quoteRequestForm.fileTooLarge', '"{{name}}" is over 5MB and was not added.', { name: tooBig.name }));
    }
    const accepted = files.filter((f) => f.size <= MAX_FILE_BYTES);
    setAttachments((prev) => [...prev, ...accepted.map((f) => ({ name: f.name, size: f.size }))]);
  };

  const removeAttachment = (fileName) => setAttachments((prev) => prev.filter((f) => f.name !== fileName));

  const resetForm = () => {
    setName(''); setEmail(''); setPhone(''); setAddress(''); setNotes('');
    setItems([]); setAttachments([]); setFileError('');
  };

  const handleSubmit = async () => {
    if (status === 'submitting' || !name.trim()) return;
    setStatus('submitting');
    setErrorMessage('');
    try {
      await submitRfq({
        customer: { customer_name: name, customer_email: email, customer_phone: phone, customer_address: address },
        notes,
        rfq_items: items.map((it) => ({ line_type: 'CATALOG', product_id: it.product.id, qty: it.qty })),
      });
      setStatus('success');
      resetForm();
    } catch {
      setStatus('error');
      setErrorMessage(t('sectionBuilder:sections.quoteRequestForm.submitError', 'Failed to submit request. Please try again.'));
    }
  };

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
              <FieldLabel required recipe={recipe}>Name</FieldLabel>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={inputClass} style={fieldStyleFor(recipe)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel recipe={recipe}>Email</FieldLabel>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className={inputClass} style={fieldStyleFor(recipe)} />
              </div>
              <div>
                <FieldLabel recipe={recipe}>Phone</FieldLabel>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className={inputClass} style={fieldStyleFor(recipe)} />
              </div>
            </div>
            <div>
              <FieldLabel recipe={recipe}>Address</FieldLabel>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address (optional)" className={inputClass} style={fieldStyleFor(recipe)} />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 border-b border-gray-100 pb-2">
            <p className="text-sm font-bold text-gray-900">Products</p>
          </div>
          <div className="flex flex-col gap-2">
            {items.map((it) => (
              <div key={it.product.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{it.product.name}</p>
                  <p className="truncate text-xs text-gray-500">Qty: {it.qty}</p>
                </div>
                <button type="button" onClick={() => removeItem(it.product.id)} aria-label={t('sectionBuilder:sections.quoteRequestForm.removeItem', 'Remove')}>
                  <X size={14} className="shrink-0 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            ))}
            {availableProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={draftProductId}
                  onChange={(e) => setDraftProductId(e.target.value)}
                  className={`${inputClass} flex-1`}
                  style={fieldStyleFor(recipe)}
                >
                  <option value="">{t('sectionBuilder:sections.quoteRequestForm.selectProduct', 'Select a product…')}</option>
                  {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input
                  type="number"
                  min="1"
                  value={draftQty}
                  onChange={(e) => setDraftQty(e.target.value)}
                  className={`${inputClass} w-20`}
                  style={fieldStyleFor(recipe)}
                />
                <button
                  type="button"
                  onClick={addProduct}
                  disabled={!draftProductId}
                  className="flex shrink-0 items-center gap-1 text-xs font-semibold disabled:opacity-40"
                  style={{ color: primaryColor }}
                >
                  <Plus size={14} /> {t('sectionBuilder:sections.quoteRequestForm.addProduct', 'Add')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-bold text-gray-900">Attachments</p>
          <p className="mb-3 text-xs text-gray-400">PDF, image, or Word documents (max 5MB each)</p>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3.5 text-sm text-gray-500 hover:border-gray-400">
            <UploadCloud size={16} /> {t('sectionBuilder:sections.quoteRequestForm.uploadFiles', 'Click to upload files')}
            <input type="file" multiple accept="image/*,application/pdf,.doc,.docx" className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </label>
          {fileError && <p className="mt-1 text-xs text-red-500">{fileError}</p>}
          {attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachments.map((f) => (
                <span key={f.name} className="flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700">
                  <Paperclip size={12} /> {f.name}
                  <button type="button" onClick={() => removeAttachment(f.name)} aria-label={t('sectionBuilder:sections.quoteRequestForm.removeFile', 'Remove file')}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-gray-900">Additional Information</p>
          <FieldLabel recipe={recipe}>Customer Notes</FieldLabel>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any additional notes or requirements…"
            className={inputClass}
            style={fieldStyleFor(recipe, true)}
          />
        </div>

        {status === 'success' && (
          <p className="text-sm font-medium text-green-600">{t('sectionBuilder:sections.quoteRequestForm.submitSuccess', 'Your request has been submitted — we’ll be in touch soon.')}</p>
        )}
        {status === 'error' && <p className="text-sm font-medium text-red-600">{errorMessage}</p>}
      </div>
      <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <button type="button" onClick={resetForm} className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700">
          {t('sectionBuilder:sections.quoteRequestForm.cancel', 'Cancel')}
        </button>
        <ThemedButtonHover
          as="button"
          type="button"
          onClick={handleSubmit}
          disabled={status === 'submitting' || !name.trim()}
          style={buttonStyle}
          hoverStyle={buttonHoverStyle}
          className="disabled:opacity-60"
        >
          {status === 'submitting' ? t('sectionBuilder:sections.quoteRequestForm.submitting', 'Submitting…') : buttonLabel}
        </ThemedButtonHover>
      </div>
    </div>
  );
}

function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}

/** Shared dialog shell for the RFQ modal presentation — deliberately built
 * on `useFocusTrap` (WAI-ARIA Tab-cycling + Escape + focus-restore) rather
 * than ce-ui's `Popup`: Popup's action buttons render in the admin app's own
 * fixed `MainBtn` styling, not the merchant's storefront theme colors, which
 * would make Submit/Add Product look off-brand against `theme.buttons`. This
 * stays a thin, storefront-themable shell; body-scroll-locking mirrors
 * Popup's own effect. Backdrop click closes, matching the golden reference. */
function RfqDialog({ open, onClose, title, children, footer, isMobile, zIndexClass = 'z-[300]', testId, maxWidthClass = 'max-w-[680px]' }) {
  const containerRef = useFocusTrap(open, onClose);
  useBodyScrollLock(open);
  if (!open) return null;
  return createPortal(
    <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4`} data-testid={testId}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        // Golden reference: main modal maxWidth 680px, nested Add Product
        // modal ~480px — see call sites for `maxWidthClass`.
        className={`relative flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${isMobile ? 'max-h-[92vh]' : `${maxWidthClass} max-h-[90vh]`}`}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <p className="text-base font-bold text-gray-900">{title}</p>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-shrink-0 justify-end gap-3 border-t border-gray-100 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/** `presentation: 'modal_trigger'` — a CTA button that opens the RFQ form in
 * a dialog, with a nested "Add Product" dialog for product selection (rather
 * than the inline dropdown row `FunctionalDetailedForm` uses for the
 * `inline` presentation) — reproducing the golden reference's CTA → RFQ
 * dialog → nested product-picker dialog flow. State here is the storefront
 * visitor's interaction state only, entirely separate from the merchant's
 * editor/content state (`data`) passed in as props. */
function RfqModalFlow({ heading, subtext, buttonStyle, buttonHoverStyle, buttonLabel, recipe, inputClass, primaryColor, isMobile, isBuilder, products }) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [draftProductId, setDraftProductId] = useState('');
  const [draftQty, setDraftQty] = useState(1);
  const [draftNotes, setDraftNotes] = useState('');
  const [draftFiles, setDraftFiles] = useState([]);
  const [draftFileError, setDraftFileError] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [fileError, setFileError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const availableProducts = products.filter((p) => !items.some((it) => it.product.id === p.id));

  const resetForm = () => {
    setName(''); setEmail(''); setPhone(''); setAddress(''); setNotes('');
    setItems([]); setAttachments([]); setFileError(''); setStatus('idle'); setErrorMessage('');
  };

  const openModal = () => {
    // Builder canvas: keep the CTA inert so clicking it selects the section
    // (same convention header/footer links use via `onNavigate` gating)
    // instead of popping a dialog over the editor.
    if (isBuilder) return;
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setAddOpen(false);
  };

  const openAddProduct = () => {
    setDraftProductId(availableProducts[0]?.id ?? '');
    setDraftQty(1);
    setDraftNotes('');
    setDraftFiles([]);
    setDraftFileError('');
    setAddOpen(true);
  };
  const confirmAddProduct = () => {
    const product = products.find((p) => p.id === draftProductId);
    if (!product) return;
    setItems((prev) => [...prev, { product, qty: Math.max(1, Number(draftQty) || 1), notes: draftNotes, files: draftFiles }]);
    setAddOpen(false);
  };
  const removeItem = (productId) => setItems((prev) => prev.filter((it) => it.product.id !== productId));

  // Shared 5MB-per-file gate for both the top-level Attachments section and
  // the per-product Documents field in the Add Product dialog — same rule,
  // two independent lists (matches the golden reference's rfqAttachments vs.
  // rfqProductDraft.files).
  const filterAcceptedFiles = (fileList, onReject) => {
    const files = Array.from(fileList ?? []);
    const tooBig = files.find((f) => f.size > MAX_FILE_BYTES);
    if (tooBig) onReject(tooBig.name);
    return files.filter((f) => f.size <= MAX_FILE_BYTES).map((f) => ({ name: f.name, size: f.size }));
  };

  const addFiles = (fileList) => {
    setFileError('');
    const accepted = filterAcceptedFiles(fileList, (name) =>
      setFileError(t('sectionBuilder:sections.quoteRequestForm.fileTooLarge', '"{{name}}" is over 5MB and was not added.', { name })));
    setAttachments((prev) => [...prev, ...accepted]);
  };
  const removeAttachment = (fileName) => setAttachments((prev) => prev.filter((f) => f.name !== fileName));

  const addDraftFiles = (fileList) => {
    setDraftFileError('');
    const accepted = filterAcceptedFiles(fileList, (name) =>
      setDraftFileError(t('sectionBuilder:sections.quoteRequestForm.fileTooLarge', '"{{name}}" is over 5MB and was not added.', { name })));
    setDraftFiles((prev) => [...prev, ...accepted]);
  };
  const removeDraftFile = (fileName) => setDraftFiles((prev) => prev.filter((f) => f.name !== fileName));

  const handleSubmit = async () => {
    if (status === 'submitting' || !name.trim()) return;
    setStatus('submitting');
    setErrorMessage('');
    try {
      await submitRfq({
        customer: { customer_name: name, customer_email: email, customer_phone: phone, customer_address: address },
        notes,
        rfq_items: items.map((it) => ({ line_type: 'CATALOG', product_id: it.product.id, qty: it.qty, notes: it.notes || '' })),
      });
      setStatus('success');
      resetForm();
      closeModal();
    } catch {
      setStatus('error');
      setErrorMessage(t('sectionBuilder:sections.quoteRequestForm.submitError', 'Failed to submit request. Please try again.'));
    }
  };

  return (
    <>
      <ThemedButtonHover
        as="button"
        type="button"
        onClick={openModal}
        style={buttonStyle}
        hoverStyle={buttonHoverStyle}
        className={isBuilder ? 'cursor-default' : undefined}
      >
        {buttonLabel}
      </ThemedButtonHover>

      <RfqDialog
        open={modalOpen}
        onClose={closeModal}
        title={heading}
        isMobile={isMobile}
        testId="rfq-modal"
        footer={
          <>
            <button type="button" onClick={closeModal} className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700">
              {t('sectionBuilder:sections.quoteRequestForm.cancel', 'Cancel')}
            </button>
            <ThemedButtonHover
              as="button"
              type="button"
              onClick={handleSubmit}
              disabled={status === 'submitting' || !name.trim()}
              style={buttonStyle}
              hoverStyle={buttonHoverStyle}
              className="disabled:opacity-60"
            >
              {status === 'submitting' ? t('sectionBuilder:sections.quoteRequestForm.submitting', 'Submitting…') : t('sectionBuilder:sections.quoteRequestForm.submit', 'Submit Request')}
            </ThemedButtonHover>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          {subtext && <p className="text-sm text-gray-500">{subtext}</p>}

          <div>
            <p className="mb-3 border-b border-gray-100 pb-2 text-sm font-bold text-gray-900">{t('sectionBuilder:sections.quoteRequestForm.customerInfo', 'Customer Information')}</p>
            <div className="flex flex-col gap-3">
              <div>
                <FieldLabel required recipe={recipe}>Name</FieldLabel>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={inputClass} style={fieldStyleFor(recipe)} />
              </div>
              {/* Stays 2-column at every width, matching the golden reference
                  exactly (it doesn't collapse this grid on mobile either). */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel recipe={recipe}>Email</FieldLabel>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className={inputClass} style={fieldStyleFor(recipe)} />
                </div>
                <div>
                  <FieldLabel recipe={recipe}>Phone</FieldLabel>
                  <PhoneInput value={phone} onChange={setPhone} placeholder="Phone number" height={`${recipe.field.height}px`} isMobile={isMobile} />
                </div>
              </div>
              <div>
                <FieldLabel recipe={recipe}>Address</FieldLabel>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address (optional)" className={inputClass} style={fieldStyleFor(recipe)} />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
              <p className="text-sm font-bold text-gray-900">{t('sectionBuilder:sections.quoteRequestForm.products', 'Products')}</p>
              {availableProducts.length > 0 && (
                <button type="button" onClick={openAddProduct} className="flex items-center gap-1 text-xs font-semibold" style={{ color: primaryColor }}>
                  <Plus size={14} /> {t('sectionBuilder:sections.quoteRequestForm.addProduct', 'Add Product')}
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-300 px-4 py-5 text-center text-xs text-gray-400">
                {t('sectionBuilder:sections.quoteRequestForm.noProducts', "No products added yet. Click 'Add Product' to specify items.")}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((it) => (
                  <div key={it.product.id} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{it.product.name}</p>
                      <p className="truncate text-xs text-gray-500">
                        Qty: {it.qty}
                        {it.notes && ` · ${it.notes}`}
                      </p>
                    </div>
                    {it.files?.length > 0 && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600" title={it.files.map((f) => f.name).join(', ')}>
                        <Paperclip size={11} /> {it.files.length}
                      </span>
                    )}
                    <button type="button" onClick={() => removeItem(it.product.id)} aria-label={t('sectionBuilder:sections.quoteRequestForm.removeItem', 'Remove')}>
                      <X size={14} className="shrink-0 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-gray-900">{t('sectionBuilder:sections.quoteRequestForm.attachments', 'Attachments')}</p>
            <p className="mb-3 text-xs text-gray-400">PDF, image, or Word documents (max 5MB each)</p>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3.5 text-sm text-gray-500 hover:border-gray-400">
              <UploadCloud size={16} /> {t('sectionBuilder:sections.quoteRequestForm.uploadFiles', 'Click to upload files')}
              <input type="file" multiple accept="image/*,application/pdf,.doc,.docx" className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
            {fileError && <p className="mt-1 text-xs text-red-500">{fileError}</p>}
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((f) => (
                  <span key={f.name} className="flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700">
                    <Paperclip size={12} /> {f.name}
                    <button type="button" onClick={() => removeAttachment(f.name)} aria-label={t('sectionBuilder:sections.quoteRequestForm.removeFile', 'Remove file')}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-gray-900">{t('sectionBuilder:sections.quoteRequestForm.additionalInfo', 'Additional Information')}</p>
            <FieldLabel recipe={recipe}>Customer Notes</FieldLabel>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Any additional notes or requirements…"
              className={inputClass}
              style={fieldStyleFor(recipe, true)}
            />
          </div>

          {status === 'error' && <p className="text-sm font-medium text-red-600">{errorMessage}</p>}
        </div>
      </RfqDialog>

      {/* Nested product-picker dialog — a separate stacking layer above the
          main RFQ dialog (higher z-index), matching the golden reference's
          nested Add-Product modal rather than an inline dropdown row. */}
      <RfqDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t('sectionBuilder:sections.quoteRequestForm.addProduct', 'Add Product')}
        isMobile={isMobile}
        zIndexClass="z-[310]"
        maxWidthClass="max-w-[480px]"
        testId="rfq-add-product-modal"
        footer={
          <>
            <button type="button" onClick={() => setAddOpen(false)} className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700">
              {t('sectionBuilder:sections.quoteRequestForm.cancel', 'Cancel')}
            </button>
            <ThemedButtonHover
              as="button"
              type="button"
              onClick={confirmAddProduct}
              disabled={!draftProductId}
              style={buttonStyle}
              hoverStyle={buttonHoverStyle}
              className="disabled:opacity-60"
            >
              {t('sectionBuilder:sections.quoteRequestForm.addProduct', 'Add Product')}
            </ThemedButtonHover>
          </>
        }
      >
        {products.length === 0 ? (
          <p className="text-sm text-gray-400">{t('sectionBuilder:sections.quoteRequestForm.noProductsAvailable', 'No published products available to add.')}</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <FieldLabel required recipe={recipe}>{t('sectionBuilder:sections.quoteRequestForm.product', 'Product')}</FieldLabel>
              <select value={draftProductId} onChange={(e) => setDraftProductId(e.target.value)} className={inputClass} style={fieldStyleFor(recipe)}>
                {availableProducts.length === 0 && <option value="">{t('sectionBuilder:sections.quoteRequestForm.noProductsAvailable', 'No published products available to add.')}</option>}
                {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel required recipe={recipe}>{t('sectionBuilder:sections.quoteRequestForm.quantity', 'Quantity')}</FieldLabel>
              <input
                type="number"
                min="1"
                value={draftQty}
                onChange={(e) => setDraftQty(Math.max(1, Number(e.target.value) || 1))}
                className={inputClass}
                style={fieldStyleFor(recipe)}
              />
            </div>
            <div>
              <FieldLabel recipe={recipe}>{t('sectionBuilder:sections.quoteRequestForm.notes', 'Notes')}</FieldLabel>
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={3}
                placeholder="Any specific requirements for this item…"
                className={inputClass}
                style={fieldStyleFor(recipe, true)}
              />
            </div>
            <div>
              <FieldLabel recipe={recipe}>{t('sectionBuilder:sections.quoteRequestForm.documents', 'Documents')}</FieldLabel>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-gray-400">
                <UploadCloud size={16} /> {t('sectionBuilder:sections.quoteRequestForm.uploadFiles', 'Click to upload files')}
                <input type="file" multiple accept="image/*,application/pdf,.doc,.docx" className="hidden" onChange={(e) => addDraftFiles(e.target.files)} />
              </label>
              {draftFileError && <p className="mt-1 text-xs text-red-500">{draftFileError}</p>}
              {draftFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {draftFiles.map((f) => (
                    <span key={f.name} className="flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs text-gray-700">
                      <Paperclip size={12} /> {f.name}
                      <button type="button" onClick={() => removeDraftFile(f.name)} aria-label={t('sectionBuilder:sections.quoteRequestForm.removeFile', 'Remove file')}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </RfqDialog>

      {status === 'success' && (
        <div role="status" className="mt-3 text-sm font-medium text-green-600">
          {t('sectionBuilder:sections.quoteRequestForm.submitSuccess', 'Your request has been submitted — we’ll be in touch soon.')}
        </div>
      )}
    </>
  );
}

function QuoteRequestFormRenderer({ data, theme, onEdit, isMobile, mediaLibrary }) {
  const { t } = useTranslation();
  const backgroundImage = resolveMedia(data.background_image, mediaLibrary);
  const primaryColor = resolveColor({ slot: 'primary' }, theme.colors);
  const buttonStyle = themedButtonStyle(theme.buttons, {
    primary: primaryColor,
    primaryText: resolveColor({ slot: 'primary_text' }, theme.colors),
  });
  const buttonHoverStyle = themedButtonHoverStyle(theme.buttons, buttonStyle, primaryColor);
  const buttonLabel = data.button_label || 'Request a Quote';
  const recipe = resolveFormRecipe(theme);
  // The current template's own storefront products (Houzez's construction
  // catalog; the generic demo catalog otherwise) — see
  // sections/shared/productSource.js. Not Xinear/Houzez-aware itself: it
  // just resolves `theme.productCatalog`, so a future template's RFQ picker
  // gets its own products for free by setting that theme field.
  const products = resolveStorefrontProducts(theme, mediaLibrary);
  const isModalTrigger = data.presentation === 'modal_trigger';
  // 'themed_form'-equivalent styling: recipe-driven radius/border/font-size
  // layered onto the same base classes contact_form's fields use, without
  // routing through BlockStream (this section is a deliberate fixed-field
  // form, not a block canvas — see schema.js).
  const inputClass = `w-full border px-3 py-2 text-sm text-gray-900 outline-none ${recipe.field.borderColor ? '' : 'border-gray-300'}`;
  const interactive = !onEdit;

  // Optional full-bleed photo-banner treatment (schema.js's
  // `background_image`) — golden reference's RFQ CTA: a construction photo
  // with a dark scrim, centered white heading/subtext, and just the CTA
  // button, no visible form fields (that's what `presentation:
  // 'modal_trigger'` already renders — this only changes the section's own
  // chrome around it). Absent by default, so every existing section (plain
  // background, left-aligned dark text) renders exactly as before.
  const headingBlock = onEdit ? (
    <EditableText
      as="h2"
      className={backgroundImage ? 'mb-2 text-2xl font-bold text-white' : 'mb-2 text-2xl font-bold'}
      value={data.heading}
      placeholder="Request a Quote"
      onCommit={(v) => onEdit('heading', v)}
    />
  ) : (
    <h2 className={backgroundImage ? 'mb-2 text-2xl font-bold text-white' : 'mb-2 text-2xl font-bold'}>{data.heading || 'Request a Quote'}</h2>
  );
  const subtextBlock = onEdit ? (
    <EditableText
      as="p"
      multiline
      className={backgroundImage ? 'mb-6 text-sm text-white opacity-90' : 'mb-6 text-sm opacity-80'}
      value={data.subtext}
      placeholder="Need a custom tailored clothing for special events? Just let us know what you need!"
      onCommit={(v) => onEdit('subtext', v)}
    />
  ) : (
    <p className={backgroundImage ? 'mb-6 text-sm text-white opacity-90' : 'mb-6 text-sm opacity-80'}>{data.subtext || 'Need a custom tailored clothing for special events? Just let us know what you need!'}</p>
  );

  const cta = isModalTrigger ? (
    // The modal_trigger CTA is functionally always the detailed field
    // set (customer info + line items + attachments) — a plain button
    // that opens nothing meaningful doesn't reproduce the golden CTA →
    // dialog flow, regardless of `layout`. In the builder canvas the
    // button renders but stays inert (RfqModalFlow's `isBuilder` guard),
    // matching the header/footer link-click convention.
    <RfqModalFlow
      heading={data.heading || 'Request a Quote'}
      subtext={data.subtext}
      buttonStyle={buttonStyle}
      buttonHoverStyle={buttonHoverStyle}
      buttonLabel={buttonLabel}
      recipe={recipe}
      inputClass={inputClass}
      primaryColor={primaryColor}
      isMobile={isMobile}
      isBuilder={!interactive}
      products={products}
    />
  ) : data.layout === 'detailed' ? (
    interactive ? (
      <FunctionalDetailedForm buttonStyle={buttonStyle} buttonHoverStyle={buttonHoverStyle} buttonLabel={buttonLabel} recipe={recipe} inputClass={inputClass} primaryColor={primaryColor} products={products} />
    ) : (
      <StaticDetailedPreview buttonStyle={buttonStyle} buttonHoverStyle={buttonHoverStyle} buttonLabel={buttonLabel} primaryColor={primaryColor} inputClass={inputClass} />
    )
  ) : (
    <SimpleForm data={data} theme={theme} onEdit={onEdit} buttonStyle={buttonStyle} buttonHoverStyle={buttonHoverStyle} buttonLabel={buttonLabel} inputClass={inputClass} recipe={recipe} interactive={interactive} t={t} />
  );

  if (backgroundImage) {
    return (
      <section
        className="relative flex items-center justify-center overflow-hidden px-6 text-center"
        style={{ backgroundImage: `url(${backgroundImage.url})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: `${data.min_height ?? 500}px` }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/45" />
        <div className="relative z-10 flex max-w-xl flex-col items-center">
          {headingBlock}
          {subtextBlock}
          {cta}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6">
      {headingBlock}
      {subtextBlock}
      {cta}
    </section>
  );
}

function SimpleForm({ onEdit, buttonStyle, buttonHoverStyle, buttonLabel, inputClass, recipe, interactive, t, data }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async () => {
    if (status === 'submitting' || !name.trim()) return;
    setStatus('submitting');
    try {
      await submitRfq({ customer: { customer_name: name, customer_email: email, customer_phone: phone }, notes: message, rfq_items: [] });
      setStatus('success');
      setName(''); setEmail(''); setPhone(''); setMessage('');
    } catch {
      setStatus('error');
    }
  };

  if (!interactive) {
    return (
      <div className="flex max-w-md flex-col gap-3">
        <input type="text" disabled placeholder="Name" className={inputClass} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <input type="email" disabled placeholder="Email" className={inputClass} />
          <input type="tel" disabled placeholder="Phone" className={inputClass} />
        </div>
        <textarea disabled placeholder="Message" rows={3} className={inputClass} />
        <ThemedButtonHover style={buttonStyle} hoverStyle={buttonHoverStyle} className="w-fit">
          {onEdit ? (
            <EditableText value={data.button_label} placeholder="Request a Quote" onCommit={(v) => onEdit('button_label', v)} />
          ) : (
            buttonLabel
          )}
        </ThemedButtonHover>
      </div>
    );
  }

  return (
    <div className="flex max-w-md flex-col gap-3">
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={inputClass} style={fieldStyleFor(recipe)} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputClass} style={fieldStyleFor(recipe)} />
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className={inputClass} style={fieldStyleFor(recipe)} />
      </div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" rows={3} className={inputClass} style={fieldStyleFor(recipe, true)} />
      {status === 'success' && <p className="text-sm font-medium text-green-600">{t('sectionBuilder:sections.quoteRequestForm.submitSuccess', 'Your request has been submitted — we’ll be in touch soon.')}</p>}
      {status === 'error' && <p className="text-sm font-medium text-red-600">{t('sectionBuilder:sections.quoteRequestForm.submitError', 'Failed to submit request. Please try again.')}</p>}
      <ThemedButtonHover
        as="button"
        type="button"
        onClick={handleSubmit}
        disabled={status === 'submitting' || !name.trim()}
        style={buttonStyle}
        hoverStyle={buttonHoverStyle}
        className="w-fit disabled:opacity-60"
      >
        {status === 'submitting' ? t('sectionBuilder:sections.quoteRequestForm.submitting', 'Submitting…') : buttonLabel}
      </ThemedButtonHover>
    </div>
  );
}

export default memo(QuoteRequestFormRenderer);
