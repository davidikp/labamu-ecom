import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * @module section-builder/sections/shared/HeroCarouselControls
 * @description Shared hero-carousel arrow/dot controls, in two visual
 * styles — not a merchant-facing setting, driven by the hero's own
 * `layout_variant`:
 *  - 'minimal': small translucent text arrows + white bar dots. The
 *    original (and still default) `hero_banner` 'background' variant look —
 *    byte-identical to what hero_banner/Renderer.jsx hand-rolled inline
 *    before this was extracted, so existing sections don't regress.
 *  - 'bordered': circular 48px bordered buttons + a themed active/inactive
 *    dot pair, colored from `theme.colors.primary`. The golden-reference
 *    Houzez treatment — reusable by any theme that opts into the
 *    'split_panel' hero layout, not gated to Houzez specifically.
 * Geometry (48px, border width, dot size) is fixed per style, not exposed
 * as a merchant control — see hero_banner/schema.js's `layout_variant`.
 */
export function HeroArrow({ direction, variant = 'minimal', onClick, theme }) {
  const label = direction === 'prev' ? 'Previous slide' : 'Next slide';
  if (variant === 'bordered') {
    const primary = theme?.colors?.primary ?? '#111827';
    const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white transition-transform hover:scale-105"
        style={{ border: `1px solid ${primary}`, color: primary, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      >
        <Icon size={20} strokeWidth={1.5} />
      </button>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className="text-white/70 transition-colors hover:text-white">
      {direction === 'prev' ? '‹' : '›'}
    </button>
  );
}

export function HeroDots({ count, active, onSelect, variant = 'minimal', theme }) {
  if (variant === 'bordered') {
    const primary = theme?.colors?.primary ?? '#111827';
    return (
      <div className="flex items-center gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            onClick={() => onSelect(i)}
            className="h-2.5 w-2.5 rounded-full transition-colors"
            style={{ backgroundColor: i === active ? primary : '#D1D5DB' }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === active}
          onClick={() => onSelect(i)}
          className={`h-1.5 rounded-full bg-white transition-all ${i === active ? 'w-6 opacity-100' : 'w-1.5 opacity-50'}`}
        />
      ))}
    </div>
  );
}
