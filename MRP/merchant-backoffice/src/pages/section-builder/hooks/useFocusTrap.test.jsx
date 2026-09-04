import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useFocusTrap } from './useFocusTrap';

function Dialog({ open, onEscape }) {
  const ref = useFocusTrap(open, onEscape);
  if (!open) return null;
  return (
    <div ref={ref} tabIndex={-1}>
      <button>First</button>
      <button>Last</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('focuses the first focusable element when opened', () => {
    const { getByText } = render(<Dialog open onEscape={() => {}} />);
    expect(document.activeElement).toBe(getByText('First'));
  });

  it('calls onEscape when Escape is pressed', () => {
    const onEscape = vi.fn();
    render(<Dialog open onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('wraps Tab from the last focusable element back to the first', () => {
    const { getByText } = render(<Dialog open onEscape={() => {}} />);
    getByText('Last').focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(getByText('First'));
  });

  it('wraps Shift+Tab from the first focusable element back to the last', () => {
    const { getByText } = render(<Dialog open onEscape={() => {}} />);
    getByText('First').focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(getByText('Last'));
  });
});
