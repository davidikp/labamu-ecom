import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import FooterRenderer from './Renderer';

const DATA = {
  link_columns: [
    { id: 'col1', heading: 'Shop', links: [{ id: 'l1', label: 'About', url: '/about' }] },
  ],
};

describe('FooterRenderer — nav link clicking', () => {
  it('renders links as plain text (no onNavigate) inside the interactive builder', () => {
    const { container } = render(<FooterRenderer data={DATA} />);
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(container.textContent).toContain('About');
  });

  it('renders links as clickable anchors and calls onNavigate with the link URL, without a real page navigation', () => {
    const onNavigate = vi.fn();
    const { getByText } = render(<FooterRenderer data={DATA} onNavigate={onNavigate} />);
    const link = getByText('About');
    expect(link.tagName).toBe('A');
    const event = fireEvent.click(link);
    expect(onNavigate).toHaveBeenCalledWith('/about');
    expect(event).toBe(false);
  });
});
