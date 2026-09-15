import { resolveGutter, resolveContainerWidth } from '../../sections/shared/themedLayout';

/**
 * @module section-builder/ui/primitives/StorefrontContainer
 * @description Shared page-container primitive. Applies the theme's
 * horizontal gutter (`theme.layout.container_gutter`) and, when `maxWidth`
 * is set, its max content width (`theme.layout.container_width`).
 * Renderers should reach for this instead of hardcoding their own
 * `px-*`/`max-w-*` literals — one themeable place decides page gutters
 * instead of every section deciding independently.
 *
 * `maxWidth` defaults to false: most call sites only need the gutter
 * (SectionShell already owns the outer max-width wrap for non-full-width
 * sections), so applying it again here by default would double-constrain
 * full-width sections that intentionally bleed edge-to-edge today.
 */
// eslint-disable-next-line no-unused-vars -- `Tag` is used as a JSX tag name below; this project's eslint config has no react plugin to track that as a reference.
export default function StorefrontContainer({ theme, maxWidth = false, as: Tag = 'div', className = '', style, children, ...rest }) {
  const layout = theme?.layout ?? {};
  const gutter = resolveGutter(layout);

  return (
    <Tag
      className={`mx-auto w-full px-[var(--sb-gutter-m)] md:px-[var(--sb-gutter-t)] lg:px-[var(--sb-gutter-d)] ${className}`}
      style={{
        '--sb-gutter-m': `${gutter.mobile}px`,
        '--sb-gutter-t': `${gutter.tablet}px`,
        '--sb-gutter-d': `${gutter.desktop}px`,
        maxWidth: maxWidth ? resolveContainerWidth(layout) : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
