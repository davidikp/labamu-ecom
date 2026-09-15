/**
 * @module section-builder/ui/primitives/Grid
 * @description Shared CSS-grid-with-gap primitive. `columnsClassName` stays
 * a caller-supplied Tailwind class (e.g. responsive column-count) rather
 * than a prop this primitive tries to compute, since column counts are a
 * section-specific merchant setting (category_grid's 8/4, testimonials'
 * 3/2, ...), not a layout-primitive concern.
 */
// eslint-disable-next-line no-unused-vars -- `Tag` is used as a JSX tag name below; this project's eslint config has no react plugin to track that as a reference.
export default function Grid({ gap = 16, columnsClassName = '', as: Tag = 'div', className = '', style, children, ...rest }) {
  return (
    <Tag className={`grid ${columnsClassName} ${className}`} style={{ gap, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
