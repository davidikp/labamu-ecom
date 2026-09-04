import { describe, it, expect } from 'vitest';
import { themedButtonStyle } from './themedButtonStyle';

const buttons = {
  corner_radius: 8,
  padding_horizontal: 20,
  padding_vertical: 10,
  font_weight: '600',
  text_transform: 'uppercase',
  letter_spacing: 'wide',
  border_width: 0,
};

describe('themedButtonStyle', () => {
  it('maps theme.buttons fields to CSS for the filled variant', () => {
    const style = themedButtonStyle(buttons, { primary: '#111', primaryText: '#fff' });
    expect(style.borderRadius).toBe('8px');
    expect(style.backgroundColor).toBe('#111');
    expect(style.color).toBe('#fff');
    expect(style.letterSpacing).toBe('0.08em');
  });

  it('outline variant uses transparent background and at least 1px border', () => {
    const style = themedButtonStyle(buttons, { variant: 'outline', primary: '#111' });
    expect(style.backgroundColor).toBe('transparent');
    expect(style.borderWidth).toBe('1px');
  });

  it('text variant has no border and no horizontal padding', () => {
    const style = themedButtonStyle(buttons, { variant: 'text', primary: '#111' });
    expect(style.borderWidth).toBe(0);
    expect(style.paddingLeft).toBe(0);
  });
});
