import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, X } from 'lucide-react';
import { MainBtn, IconBtn } from '../../../../ce-ui';
import SchemaField from './SchemaField';
import { defaultsForSchema as defaultsForItemSchema } from '../../sections/schemaDefaults';
import { isFieldVisible } from './fieldHelpers';

function summaryFor(item, itemSchema) {
  const firstTextKey = Object.keys(itemSchema).find((k) => itemSchema[k].type === 'text');
  if (firstTextKey) {
    const summary = item[firstTextKey];
    if (summary && String(summary).trim().length > 0) return summary;
  }
  // No text field (e.g. an item that's just a collection/handle picker) —
  // fall back to the selected option's label so items still read as
  // something meaningful rather than a generic "Item 1", "Item 2". A field
  // can opt out via excludeFromSummary (e.g. a source/mode toggle whose own
  // label, like "From catalog", isn't a useful item summary).
  const firstSelectKey = Object.keys(itemSchema).find((k) => itemSchema[k].type === 'select' && !itemSchema[k].excludeFromSummary);
  if (firstSelectKey) {
    const option = itemSchema[firstSelectKey].options?.find((o) => o.value === item[firstSelectKey]);
    if (option) return option.label;
  }
  return null;
}

function RepeaterItem({ item, index, itemSchema, expanded, onToggle, onChange, onRemove, palette, mediaLibrary, onAddMedia, onOpenLibrary }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const summary = summaryFor(item, itemSchema);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="rounded-md border border-gray-200"
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span
          aria-label={t('sectionBuilder:fields.repeaterField.dragToReorder')}
          className="cursor-grab touch-none text-gray-300"
          {...attributes}
          {...listeners}
        >
          ⠿
        </span>
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 truncate text-left text-sm font-medium text-gray-900">
          {summary ?? t('sectionBuilder:fields.repeaterField.itemLabel', { n: index + 1 })}
        </button>
        <IconBtn
          icon={<X size={14} />}
          variant="danger-ghost"
          size="sm"
          aria-label={t('sectionBuilder:fields.repeaterField.removeItem')}
          onClick={onRemove}
        />
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-gray-100 p-2">
          {Object.entries(itemSchema)
            .filter(([, field]) => isFieldVisible(field, item))
            .map(([key, field]) => (
              <SchemaField
                key={key}
                field={field}
                value={item[key]}
                onChange={(v) => onChange({ ...item, [key]: v })}
                palette={palette}
                mediaLibrary={mediaLibrary}
                onAddMedia={onAddMedia}
                onOpenLibrary={onOpenLibrary}
              />
            ))}
        </div>
      )}
    </li>
  );
}

/** US-4.7 — add/remove/reorder items, each collapsible, sub-fields pre-filled with defaults. */
export default function RepeaterField({ field, value, onChange, palette, mediaLibrary, onAddMedia, onOpenLibrary, activePage }) {
  const { t } = useTranslation();
  const items = value ?? [];
  // Collapsed by default — a repeater with several items (e.g. header
  // nav_links) previously opened every item's full field set at once,
  // which reads as a wall of inputs rather than a scannable list. Newly
  // added items still auto-expand (see addItem below) so there's no extra
  // click needed right after adding one.
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const atMax = field.maxItems != null && items.length >= field.maxItems;

  const addItem = () => {
    const newItem = { id: crypto.randomUUID(), ...defaultsForItemSchema(field.itemSchema) };
    // Nav-style repeaters (e.g. header.nav_links) default a new link's URL
    // to whichever page is currently active in the builder — more useful
    // than always defaulting to "/" regardless of what the merchant is
    // looking at when they click "Add item".
    if (field.autofillUrlFromActivePage && 'url' in newItem && activePage?.slug) {
      newItem.url = activePage.slug;
    }
    setExpandedIds((prev) => new Set(prev).add(newItem.id));
    onChange([...items, newItem]);
  };

  const updateItem = (id, nextItem) => onChange(items.map((i) => (i.id === id ? nextItem : i)));
  const removeItem = (id) => onChange(items.filter((i) => i.id !== id));
  const toggleExpanded = (id) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const ids = items.map((i) => i.id);
    onChange(arrayMove(items, ids.indexOf(active.id), ids.indexOf(over.id)));
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">{field.label}</label>

      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {items.map((item, index) => (
                <RepeaterItem
                  key={item.id}
                  item={item}
                  index={index}
                  itemSchema={field.itemSchema}
                  expanded={expandedIds.has(item.id)}
                  onToggle={() => toggleExpanded(item.id)}
                  onChange={(next) => updateItem(item.id, next)}
                  onRemove={() => removeItem(item.id)}
                  palette={palette}
                  mediaLibrary={mediaLibrary}
                  onAddMedia={onAddMedia}
                  onOpenLibrary={onOpenLibrary}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <MainBtn
        label={atMax ? t('sectionBuilder:fields.repeaterField.maxItemsReached', { n: field.maxItems }) : t('sectionBuilder:fields.repeaterField.addItem')}
        leftIcon={atMax ? undefined : <Plus size={16} />}
        variant="secondary"
        size="sm"
        disabled={atMax}
        onClick={addItem}
        className="mt-2 w-full"
      />
    </div>
  );
}
