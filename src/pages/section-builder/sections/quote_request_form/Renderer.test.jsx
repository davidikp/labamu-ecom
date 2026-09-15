import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor, within } from '@testing-library/react';
import QuoteRequestFormRenderer from './Renderer';
import { defaultTheme } from '../../state/defaultTheme';
import { submitRfq } from '../../../../services/rfqService';
import { HOUZEZ_PRODUCTS } from '../../mocks/houzezProducts';

// Mock the network boundary, not the component — same convention as the
// rest of the app's api/client.js mock pattern, just short-circuited here
// so tests never depend on a live service.
vi.mock('../../../../services/rfqService', () => ({ submitRfq: vi.fn() }));

const DETAILED_DATA = { layout: 'detailed', heading: 'Request a Quote' };

beforeEach(() => {
  submitRfq.mockReset();
});

describe('QuoteRequestFormRenderer — builder vs. published-storefront gating', () => {
  it('renders a static, disabled preview inside the interactive builder (onEdit present)', () => {
    const { container } = render(<QuoteRequestFormRenderer data={DETAILED_DATA} theme={defaultTheme} onEdit={() => {}} />);
    expect(container.querySelectorAll('input:not([disabled])')).toHaveLength(0);
    expect(container.querySelectorAll('input[disabled]').length).toBeGreaterThan(0);
  });

  it('renders a real, interactive form on the published storefront (no onEdit)', () => {
    const { container } = render(<QuoteRequestFormRenderer data={DETAILED_DATA} theme={defaultTheme} />);
    expect(container.querySelectorAll('input[disabled]')).toHaveLength(0);
    expect(container.querySelector('input[placeholder="Your full name"]')).toBeTruthy();
  });
});

describe('QuoteRequestFormRenderer — detailed layout line items', () => {
  it('adds a product line item and can remove it again', () => {
    render(<QuoteRequestFormRenderer data={DETAILED_DATA} theme={defaultTheme} />);
    const select = screen.getByDisplayValue('Select a product…');
    const firstOptionValue = select.querySelector('option[value]:not([value=""])').value;
    fireEvent.change(select, { target: { value: firstOptionValue } });
    fireEvent.click(screen.getByText('Add'));
    expect(screen.getByText(/Qty: 1/)).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Remove'));
    expect(screen.queryByText(/Qty: 1/)).toBeNull();
  });

  it('rejects a file over 5MB and shows an inline error instead of adding it', () => {
    const { container } = render(<QuoteRequestFormRenderer data={DETAILED_DATA} theme={defaultTheme} />);
    const fileInput = container.querySelector('input[type="file"]');
    const bigFile = new File([new Uint8Array(6 * 1024 * 1024)], 'huge.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [bigFile] } });
    expect(screen.getByText(/over 5MB/)).toBeTruthy();
    expect(screen.queryByText('huge.pdf')).toBeNull();
  });

  it('accepts a file under 5MB', () => {
    const { container } = render(<QuoteRequestFormRenderer data={DETAILED_DATA} theme={defaultTheme} />);
    const fileInput = container.querySelector('input[type="file"]');
    const smallFile = new File([new Uint8Array(1024)], 'plan.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [smallFile] } });
    expect(screen.getByText('plan.pdf')).toBeTruthy();
  });
});

describe('QuoteRequestFormRenderer — submission', () => {
  it('submits via the real rfqService and shows a success message', async () => {
    submitRfq.mockResolvedValueOnce({ data: { rfq_no: 'RFQ-DEMO-001' } });
    const { container } = render(<QuoteRequestFormRenderer data={DETAILED_DATA} theme={defaultTheme} />);
    fireEvent.change(container.querySelector('input[placeholder="Your full name"]'), { target: { value: 'Ada Lovelace' } });
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));

    await waitFor(() => expect(submitRfq).toHaveBeenCalledTimes(1));
    expect(submitRfq).toHaveBeenCalledWith(expect.objectContaining({ customer: expect.objectContaining({ customer_name: 'Ada Lovelace' }) }));
    await screen.findByText(/submitted/);
  });

  it('shows an error message when the submission fails', async () => {
    submitRfq.mockRejectedValueOnce(new Error('network down'));
    const { container } = render(<QuoteRequestFormRenderer data={DETAILED_DATA} theme={defaultTheme} />);
    fireEvent.change(container.querySelector('input[placeholder="Your full name"]'), { target: { value: 'Ada Lovelace' } });
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));

    await screen.findByText(/Failed to submit/);
  });

  it('disables submit until a name is entered', () => {
    const { container } = render(<QuoteRequestFormRenderer data={DETAILED_DATA} theme={defaultTheme} />);
    const submitButton = screen.getByText('Request a Quote', { selector: 'button' });
    expect(submitButton).toBeDisabled();
    fireEvent.change(container.querySelector('input[placeholder="Your full name"]'), { target: { value: 'A' } });
    expect(submitButton).not.toBeDisabled();
  });
});

describe('QuoteRequestFormRenderer — presentation: modal_trigger', () => {
  const MODAL_DATA = { presentation: 'modal_trigger', heading: 'Request a Quote', button_label: 'Request a Quote' };

  it('renders only a CTA button in-flow; the form is not in the document until opened', () => {
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} />);
    expect(screen.getByText('Request a Quote', { selector: 'button' })).toBeTruthy();
    expect(screen.queryByPlaceholderText('Your full name')).toBeNull();
  });

  it('opens the RFQ dialog on click, and it closes on backdrop click', () => {
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    expect(screen.getByPlaceholderText('Your full name')).toBeTruthy();

    const dialog = screen.getByTestId('rfq-modal');
    fireEvent.click(dialog.querySelector('.absolute.inset-0'));
    expect(screen.queryByPlaceholderText('Your full name')).toBeNull();
  });

  it('stays inert inside the interactive builder (onEdit present) — clicking the CTA does not open the dialog', () => {
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} onEdit={() => {}} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    expect(screen.queryByPlaceholderText('Your full name')).toBeNull();
  });

  it('adds a product via the nested Add Product dialog and shows it as a line item', () => {
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    fireEvent.click(screen.getByText('Add Product', { selector: 'button' }));

    const dialog = screen.getByTestId('rfq-add-product-modal');
    const select = dialog.querySelector('select');
    const firstOptionValue = select.querySelector('option[value]:not([value=""])').value;
    fireEvent.change(select, { target: { value: firstOptionValue } });
    fireEvent.click(within(dialog).getByText('Add Product', { selector: 'button' }));

    expect(screen.getByText(/Qty: 1/)).toBeTruthy();
  });

  it('submits via rfqService and closes the dialog on success', async () => {
    submitRfq.mockResolvedValueOnce({ data: { rfq_no: 'RFQ-DEMO-001' } });
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    fireEvent.change(screen.getByPlaceholderText('Your full name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.click(screen.getByText('Submit Request'));

    await waitFor(() => expect(submitRfq).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByPlaceholderText('Your full name')).toBeNull());
  });

  it('the same product cannot be selected twice — it drops out of the picker once added', () => {
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    fireEvent.click(screen.getByText('Add Product', { selector: 'button' }));
    let dialog = screen.getByTestId('rfq-add-product-modal');
    let select = dialog.querySelector('select');
    const firstOptionValue = select.querySelector('option[value]:not([value=""])').value;
    const firstOptionLabel = select.querySelector('option[value]:not([value=""])').textContent;
    fireEvent.change(select, { target: { value: firstOptionValue } });
    fireEvent.click(within(dialog).getByText('Add Product', { selector: 'button' }));

    fireEvent.click(screen.getByText('Add Product', { selector: 'button' }));
    dialog = screen.getByTestId('rfq-add-product-modal');
    select = dialog.querySelector('select');
    expect(within(select).queryByText(firstOptionLabel)).toBeNull();
  });

  it('quantity clamps to a minimum of 1', () => {
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    fireEvent.click(screen.getByText('Add Product', { selector: 'button' }));
    const dialog = screen.getByTestId('rfq-add-product-modal');
    const qtyInput = dialog.querySelector('input[type="number"]');
    fireEvent.change(qtyInput, { target: { value: '0' } });
    expect(qtyInput.value).toBe('1');
    fireEvent.change(qtyInput, { target: { value: '-5' } });
    expect(qtyInput.value).toBe('1');
  });

  it('carries per-product notes and files through to the line-item row', () => {
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    fireEvent.click(screen.getByText('Add Product', { selector: 'button' }));
    const dialog = screen.getByTestId('rfq-add-product-modal');
    const select = dialog.querySelector('select');
    fireEvent.change(select, { target: { value: select.querySelector('option[value]:not([value=""])').value } });
    fireEvent.change(within(dialog).getByPlaceholderText('Any specific requirements for this item…'), { target: { value: 'Handle with care' } });
    const draftFileInput = dialog.querySelector('input[type="file"]');
    const smallFile = new File([new Uint8Array(1024)], 'spec.pdf', { type: 'application/pdf' });
    fireEvent.change(draftFileInput, { target: { files: [smallFile] } });
    fireEvent.click(within(dialog).getByText('Add Product', { selector: 'button' }));

    expect(screen.getByText(/Handle with care/)).toBeTruthy();
    expect(screen.getByTitle('spec.pdf')).toBeTruthy();
  });

  it('removing a line item removes it from the list', () => {
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    fireEvent.click(screen.getByText('Add Product', { selector: 'button' }));
    const dialog = screen.getByTestId('rfq-add-product-modal');
    fireEvent.change(dialog.querySelector('select'), { target: { value: dialog.querySelector('select').querySelector('option[value]:not([value=""])').value } });
    fireEvent.click(within(dialog).getByText('Add Product', { selector: 'button' }));
    expect(screen.getByText(/Qty: 1/)).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Remove'));
    expect(screen.queryByText(/Qty: 1/)).toBeNull();
  });

  it('renders the shared PhoneInput component for the Phone field', () => {
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    expect(screen.getByPlaceholderText('Phone number')).toBeTruthy();
  });
});

describe('QuoteRequestFormRenderer — storefront product source', () => {
  const MODAL_DATA = { presentation: 'modal_trigger', heading: 'Request a Quote', button_label: 'Request a Quote' };

  it("without a theme.productCatalog, the product picker uses the generic demo catalog (backward compatible)", () => {
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={defaultTheme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    fireEvent.click(screen.getByText('Add Product', { selector: 'button' }));
    const dialog = screen.getByTestId('rfq-add-product-modal');
    const optionLabels = Array.from(dialog.querySelectorAll('option')).map((o) => o.textContent);
    expect(optionLabels.some((label) => HOUZEZ_PRODUCTS.some((p) => p.title === label))).toBe(false);
  });

  it('with theme.productCatalog set (Houzez), the product picker shows only that catalog — no clothing products leak in', () => {
    const theme = { ...defaultTheme, productCatalog: HOUZEZ_PRODUCTS };
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={theme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    fireEvent.click(screen.getByText('Add Product', { selector: 'button' }));
    const dialog = screen.getByTestId('rfq-add-product-modal');
    const optionLabels = Array.from(dialog.querySelectorAll('option')).map((o) => o.textContent).filter(Boolean);
    expect(optionLabels).toEqual(HOUZEZ_PRODUCTS.map((p) => p.title));
  });

  it('the selected line item and submission payload use the Houzez product id, not a clothing product id', async () => {
    submitRfq.mockResolvedValueOnce({ data: {} });
    const theme = { ...defaultTheme, productCatalog: HOUZEZ_PRODUCTS };
    render(<QuoteRequestFormRenderer data={MODAL_DATA} theme={theme} />);
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    fireEvent.change(screen.getByPlaceholderText('Your full name'), { target: { value: 'Ada Lovelace' } });
    fireEvent.click(screen.getByText('Add Product', { selector: 'button' }));
    const dialog = screen.getByTestId('rfq-add-product-modal');
    fireEvent.change(dialog.querySelector('select'), { target: { value: HOUZEZ_PRODUCTS[0].id } });
    fireEvent.click(within(dialog).getByText('Add Product', { selector: 'button' }));

    fireEvent.click(screen.getByText('Submit Request'));
    await waitFor(() => expect(submitRfq).toHaveBeenCalledTimes(1));
    expect(submitRfq).toHaveBeenCalledWith(
      expect.objectContaining({ rfq_items: [expect.objectContaining({ product_id: HOUZEZ_PRODUCTS[0].id })] })
    );
  });
});

describe('QuoteRequestFormRenderer — simple layout stays functional too', () => {
  it('submits the simple layout via the same rfqService', async () => {
    submitRfq.mockResolvedValueOnce({ data: {} });
    const { container } = render(<QuoteRequestFormRenderer data={{ layout: 'simple' }} theme={defaultTheme} />);
    fireEvent.change(container.querySelector('input[placeholder="Name"]'), { target: { value: 'Ada' } });
    fireEvent.click(screen.getByText('Request a Quote', { selector: 'button' }));
    await waitFor(() => expect(submitRfq).toHaveBeenCalledTimes(1));
  });
});
