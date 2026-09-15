import TextField from './TextField';
import RichTextField from './RichTextField';
import ColorField from './ColorField';
import ImageField from './ImageField';
import SelectField from './SelectField';
import RangeField from './RangeField';
import BooleanField from './BooleanField';
import RepeaterField from './RepeaterField';
import MenuReferenceField from './MenuReferenceField';
import ResponsiveFieldWrapper from './ResponsiveFieldWrapper';

const FIELD_COMPONENTS = {
  text: TextField,
  textarea: TextField,
  richtext: RichTextField,
  color: ColorField,
  image: ImageField,
  select: SelectField,
  range: RangeField,
  boolean: BooleanField,
  repeater: RepeaterField,
  menu_reference: MenuReferenceField,
};

/**
 * Dispatches a schema field definition to its concrete input component.
 * Fields marked `responsive: true` (Phase 1 — see themes/breakpoints.js) are
 * wrapped so the control edits/displays the value for whichever breakpoint
 * `viewport` (the canvas's current device) is showing.
 */
export default function SchemaField({ field, value, onChange, palette, mediaLibrary, onAddMedia, onOpenLibrary, activePage, viewport, menus }) {
  const Component = FIELD_COMPONENTS[field.type];
  if (!Component) return null;

  if (field.responsive) {
    return (
      <ResponsiveFieldWrapper viewport={viewport} value={value} onChange={onChange}>
        {(resolvedValue, handleChange) => (
          <Component
            field={field}
            value={resolvedValue}
            onChange={handleChange}
            palette={palette}
            mediaLibrary={mediaLibrary}
            onAddMedia={onAddMedia}
            onOpenLibrary={onOpenLibrary}
            activePage={activePage}
            menus={menus}
          />
        )}
      </ResponsiveFieldWrapper>
    );
  }

  return (
    <Component
      field={field}
      value={value}
      onChange={onChange}
      palette={palette}
      mediaLibrary={mediaLibrary}
      onAddMedia={onAddMedia}
      onOpenLibrary={onOpenLibrary}
      activePage={activePage}
      menus={menus}
    />
  );
}
