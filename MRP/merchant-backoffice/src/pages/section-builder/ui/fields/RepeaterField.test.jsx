import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RepeaterField from './RepeaterField';

const NAV_LINKS_FIELD = {
  type: 'repeater',
  label: 'Nav links',
  maxItems: 8,
  autofillUrlFromActivePage: true,
  itemSchema: {
    label: { type: 'text', label: 'Label', maxLength: 100, default: '' },
    url: { type: 'text', label: 'URL', default: '/' },
  },
};

describe('RepeaterField — autofillUrlFromActivePage', () => {
  it('defaults a new nav link\'s URL to the currently active page\'s slug', () => {
    const onChange = vi.fn();
    render(
      <RepeaterField
        field={NAV_LINKS_FIELD}
        value={[]}
        onChange={onChange}
        activePage={{ id: 'about', name: 'About', slug: '/about' }}
      />
    );
    fireEvent.click(screen.getByTestId('main_btn'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [items] = onChange.mock.calls[0];
    expect(items[0].url).toBe('/about');
  });

  it('falls back to the schema default ("/") when there is no active page', () => {
    const onChange = vi.fn();
    render(<RepeaterField field={NAV_LINKS_FIELD} value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('main_btn'));
    const [items] = onChange.mock.calls[0];
    expect(items[0].url).toBe('/');
  });

  it('does not autofill for repeater fields without the flag set', () => {
    const onChange = vi.fn();
    const plainField = { ...NAV_LINKS_FIELD, autofillUrlFromActivePage: false };
    render(<RepeaterField field={plainField} value={[]} onChange={onChange} activePage={{ id: 'about', slug: '/about' }} />);
    fireEvent.click(screen.getByTestId('main_btn'));
    const [items] = onChange.mock.calls[0];
    expect(items[0].url).toBe('/');
  });
});
