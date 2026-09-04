/**
 * @module section-builder/ui/primitives/Stack
 * @description Shared vertical-flex-with-gap primitive, so sections stop
 * each independently choosing a `flex flex-col gap-*` literal for the same
 * "list of things, evenly spaced" pattern.
 */
// eslint-disable-next-line no-unused-vars -- `Tag` is used as a JSX tag name below; this project's eslint config has no react plugin to track that as a reference.
export default function Stack({ gap = 16, as: Tag = 'div', className = '', style, children, ...rest }) {
  return (
    <Tag className={`flex flex-col ${className}`} style={{ gap, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
