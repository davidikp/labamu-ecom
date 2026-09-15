import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '../../../../ce-ui';

/**
 * Content > Menus (US-Content.1) — `type: 'menu_reference'` field (see
 * header/schema.js's `nav_menu_ref`, footer/schema.js's equivalent).
 *
 * A real dropdown picking which of `state.menus` this header/footer's nav
 * reads from at render time (see header/Renderer.jsx, which resolves
 * `menus[data.nav_menu_ref.menuId].items`) — matching Shopify's own
 * header/footer panel pattern (a menu picker, not an inline add/remove/
 * reorder editor). A small secondary "Edit menu" link still opens the
 * dedicated `/content/menus` screen (MenusManagement.jsx) for actually
 * editing a menu's items.
 *
 * `menus` is `state.menus` (keyed by menu id), threaded down from
 * SectionBuilder.jsx via SettingsPanel/SchemaField — see those modules'
 * header comments for the prop-plumbing convention every other field
 * (`palette`, `mediaLibrary`, ...) already follows.
 *
 * `value` is this section's own stored `nav_menu_ref` setting
 * (`{ menuId }`) — `onChange` is called with a new `{ menuId }` object, the
 * same shape, so it round-trips through SchemaField/SettingsPanel's
 * `onFieldChange(key, value, field)` convention (see SelectField.jsx for
 * the same value/onChange contract on a plain `select` field) and lands in
 * `section.data.nav_menu_ref` via ACTIONS.UPDATE_GLOBAL_DATA.
 */
export default function MenuReferenceField({ field, value, onChange, menus }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const menuId = value?.menuId ?? field.menuId;
  const options = Object.values(menus ?? {}).map((menu) => ({ value: menu.id, label: menu.name }));

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">{field.label}</label>
      <Dropdown
        options={options}
        value={menuId}
        onChange={(newMenuId) => onChange({ menuId: newMenuId })}
        size="md"
      />
      <button
        type="button"
        onClick={() => navigate('/content/menus')}
        className="mt-1.5 text-xs font-medium text-blue-600 hover:underline"
      >
        {t('sectionBuilder:fields.menuReference.editMenu', 'Edit menu')}
      </button>
    </div>
  );
}
