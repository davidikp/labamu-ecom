import { memo, useState } from 'react';
import { Star } from 'lucide-react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle, useThemedButtonHover } from '../shared/themedButtonStyle';
import { resolveFormRecipe } from '../shared/formRecipes';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import EditableText from '../../ui/EditableText';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

// Default falls back to the previous hardcoded value (a universally-
// recognised rating color) when a theme doesn't set `colors.rating` — same
// convention as testimonials/Renderer.jsx.
const DEFAULT_STAR_COLOR = '#F59E0B';

// Demo-only: a real rating-submission flow needs a backend endpoint this
// codebase doesn't have yet, so no rating is ever actually "selected" and
// the button doesn't submit anything — true of both layouts below. The
// stacked layout's star row does still fill on hover (a plain visual
// affordance, not a stateful selection) so it doesn't read as inert.
function RatingFormRenderer({ data, theme, onEdit, isMobile, breakpoint }) {
  // Called unconditionally (rules-of-hooks) even though only the 'inline'
  // layout below actually needs it.
  const mobile = useResponsiveMobile(isMobile);
  const [hoveredStar, setHoveredStar] = useState(0);
  const starColor = theme?.colors?.rating ?? DEFAULT_STAR_COLOR;
  const buttonPrimary = resolveColor({ slot: 'primary' }, theme.colors);
  const restingButtonStyle = themedButtonStyle(theme.buttons, {
    primary: buttonPrimary,
    primaryText: resolveColor({ slot: 'primary_text' }, theme.colors),
  });
  const { style: buttonStyle, hoverHandlers: buttonHoverHandlers } = useThemedButtonHover(theme.buttons, restingButtonStyle, buttonPrimary);

  const buttonEl = (
    <span style={buttonStyle} className="w-fit" {...buttonHoverHandlers}>
      {onEdit ? (
        <EditableText value={data.button_label} placeholder="Give Rating" onCommit={(v) => onEdit('button_label', v)} />
      ) : (
        data.button_label || 'Give Rating'
      )}
    </span>
  );

  if (data.layout !== 'inline') {
    // 'stacked' layout — centered column: stars row first, then a plain
    // (not bold-heading-weight) subtitle line, then full-width Name/Review
    // fields and a centered button. Field geometry/colors come from the
    // theme's own form recipe (see formRecipes.js) — Barger's own reference
    // (node 96:126625) is a flat surface-2 field with a visible border and
    // muted placeholder, not the borderless/white generic default every
    // other theme still gets via DEFAULT_FORM_RECIPE.
    const recipe = resolveFormRecipe(theme);
    const stackedFieldStyle = {
      height: `${recipe.field.height}px`,
      borderRadius: `${recipe.field.radius}px`,
      fontSize: `${recipe.field.fontSize}px`,
      borderColor: recipe.field.borderColor,
      backgroundColor: recipe.field.background,
      color: recipe.field.placeholderColor,
    };
    const stackedFieldClass = `w-full border px-4 ${recipe.field.borderColor ? '' : 'border-gray-300'}`;
    const starIdleColor = recipe.starIdleColor ?? starColor;
    const stackedHeading = onEdit ? (
      <EditableText
        as="p"
        className="mb-6 max-w-xl text-center text-lg"
        value={data.heading}
        placeholder="Leave us your thoughts on how do you like our products."
        onCommit={(v) => onEdit('heading', v)}
      />
    ) : (
      <p className="mb-6 max-w-xl text-center text-lg">{data.heading || 'Leave us your thoughts on how do you like our products.'}</p>
    );
    return (
      <section className="flex flex-col items-center px-6 text-center">
        <div className="mb-2 flex gap-1" onMouseLeave={() => setHoveredStar(0)}>
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < hoveredStar;
            return (
              <Star
                key={i}
                size={recipe.starSize}
                fill={filled ? starColor : 'none'}
                stroke={filled ? starColor : starIdleColor}
                className="cursor-pointer transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredStar(i + 1)}
              />
            );
          })}
        </div>
        {stackedHeading}
        <div className="flex w-full max-w-2xl flex-col" style={{ gap: `${recipe.stackedGap}px` }}>
          <input type="text" disabled placeholder={data.name_field_label || 'Name'} className={stackedFieldClass} style={stackedFieldStyle} />
          <input type="text" disabled placeholder={data.message_field_label || 'Review'} className={stackedFieldClass} style={stackedFieldStyle} />
          <div className="flex justify-center">{buttonEl}</div>
        </div>
      </section>
    );
  }

  const heading = onEdit ? (
    <EditableText
      as="h2"
      className="mb-6 text-base font-normal"
      value={data.heading}
      placeholder="Leave us your thoughts on how do you like our products."
      onCommit={(v) => onEdit('heading', v)}
    />
  ) : (
    <h2 className="mb-6 text-base font-normal">{data.heading || 'Leave us your thoughts on how do you like our products.'}</h2>
  );

  // 'inline' layout: Name | Review | Rating side by side on desktop,
  // stacking to one column on mobile — that responsive collapse is
  // structural to what "inline" means (any theme opting into it gets the
  // same behavior), while the desktop column ratio/field geometry comes
  // from the theme's recipe (Houzez's golden-reference values, or the
  // generic default for any other theme). The builder/preview canvas
  // simulates each device as a fixed-width frame inside a real (usually
  // wide) browser, so a `md:` Tailwind breakpoint never reflects the
  // selected device there (see useResponsiveMobile.js) — stack on tablet
  // too, driven by the `breakpoint`/`isMobile` props instead of CSS.
  const stacked = mobile || breakpoint === 'tablet';
  const recipe = resolveFormRecipe(theme);
  const fieldStyle = {
    height: `${recipe.field.height}px`,
    borderRadius: `${recipe.field.radius}px`,
    fontSize: `${recipe.field.fontSize}px`,
    borderColor: recipe.field.borderColor,
  };
  const fieldClass = `w-full border px-4 outline-none ${recipe.field.borderColor ? '' : 'border-gray-300'}`;
  const labelStyle = { fontSize: `${recipe.label.fontSize}px`, color: recipe.label.color };
  const labelClass = `mb-1 block ${recipe.label.color ? '' : 'text-gray-600'}`;

  return (
    <StorefrontContainer as="section" theme={theme}>
      {/* Left rule (a blockquote-style accent, not a themed-field border) —
          spans the heading and the field row beneath it, not the button. */}
      <div className="border-l-2 border-gray-200 pl-4">
        {heading}
        <div
          className={`grid gap-4 ${stacked ? 'items-start' : 'items-end'}`}
          style={{ gridTemplateColumns: stacked ? '1fr' : recipe.inlineColumns, gap: `${recipe.inlineGap}px` }}
        >
          <div>
            <label className={labelClass} style={labelStyle}>{data.name_field_label || 'Name'}</label>
            <input type="text" disabled placeholder={data.name_field_label || 'Name'} className={fieldClass} style={fieldStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>{data.message_field_label || 'Review'}</label>
            <input type="text" disabled placeholder={data.message_field_label || 'Review'} className={fieldClass} style={fieldStyle} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Rating</label>
            {/* Same field-height bordered box as the Name/Review inputs
                beside it, so the rating reads as one of this row's fields
                rather than a bare row of icons — the stars themselves stay
                hoverable (same fill-on-hover affordance as the 'stacked'
                layout above), just inside that box instead of floating
                free of it. */}
            <div
              className={`flex h-full items-center gap-2 border px-4 ${recipe.field.borderColor ? '' : 'border-gray-300'}`}
              style={{ ...fieldStyle, color: starColor }}
              onMouseLeave={() => setHoveredStar(0)}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={recipe.starSize}
                  fill={i < hoveredStar ? starColor : 'none'}
                  stroke={starColor}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredStar(i + 1)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">{buttonEl}</div>
    </StorefrontContainer>
  );
}

export default memo(RatingFormRenderer);
