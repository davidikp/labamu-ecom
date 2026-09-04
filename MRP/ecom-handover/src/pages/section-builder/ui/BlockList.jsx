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
import { X, GripVertical, ChevronRight } from 'lucide-react';
import { blockTypeDef } from '../sections/blockHelpers';
import AddBlockControl from './AddBlockControl';

function blockSummary(block, sectionType) {
  const def = blockTypeDef(sectionType, block.type);
  const fields = def?.fields ?? {};
  const firstText = Object.keys(fields).find((k) => fields[k].type === 'text' || fields[k].type === 'textarea');
  const val = firstText ? block.data?.[firstText] : null;
  return val && String(val).trim() ? String(val) : def?.label ?? 'Block';
}

function BlockRow({ block, sectionType, onSelect, onRemove }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1.5"
    >
      <span
        aria-label={t('sectionBuilder:fields.repeaterField.dragToReorder')}
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </span>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-1 text-left text-sm text-gray-700">
        <span className="truncate">{blockSummary(block, sectionType)}</span>
      </button>
      <button
        type="button"
        onClick={onSelect}
        aria-label={t('sectionBuilder:editor.blockList.edit', 'Edit block')}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      >
        <ChevronRight size={15} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('sectionBuilder:editor.blockList.remove', 'Remove block')}
        className="rounded p-1 text-red-500 hover:bg-red-50"
      >
        <X size={14} />
      </button>
    </li>
  );
}

/**
 * Block manager shown in the section settings panel: add / remove / reorder /
 * open blocks. Operates purely through callbacks (state lives in the reducer).
 */
export default function BlockList({ sectionType, addTypes, blocks, atMax, onAdd, onRemove, onReorder, onSelect }) {
  const { t } = useTranslation();
  const items = blocks ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const ids = items.map((b) => b.id);
    onReorder(arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id)));
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {t('sectionBuilder:editor.blockList.heading', 'Blocks')}
      </label>

      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {items.map((block) => (
                <BlockRow
                  key={block.id}
                  block={block}
                  sectionType={sectionType}
                  onSelect={() => onSelect(block.id)}
                  onRemove={() => onRemove(block.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-2">
        <AddBlockControl sectionType={sectionType} types={addTypes} atMax={atMax} onAdd={onAdd} variant="panel" />
      </div>
    </div>
  );
}
