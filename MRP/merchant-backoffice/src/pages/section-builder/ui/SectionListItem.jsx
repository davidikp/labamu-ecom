import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { labelForType } from '../sections/registry';
import {
  sectionSupportsBlocks,
  blockTypeDef,
  isAtBlockMax,
  parseBlockSelection,
  blocksAtPath,
} from '../sections/blockHelpers';
import AddBlockControl from './AddBlockControl';

function blockSummary(block, sectionType, t) {
  const def = blockTypeDef(sectionType, block.type);
  const fields = def?.fields ?? {};
  const firstText = Object.keys(fields).find((k) => fields[k].type === 'text' || fields[k].type === 'textarea');
  const val = firstText ? block.data?.[firstText] : null;
  return val && String(val).trim() ? String(val) : def?.label ?? t('sectionBuilder:editor.blockList.add', 'Block');
}

/** Depth-first flattening of the block tree, used to resolve drag source/target containers. */
function flattenTree(blocks, sectionType, parentPath = []) {
  let out = [];
  for (const b of blocks) {
    const path = [...parentPath, b.id];
    const container = !!blockTypeDef(sectionType, b.type)?.container;
    out.push({ id: b.id, path, parentPath, container });
    if (container && b.blocks?.length) out = out.concat(flattenTree(b.blocks, sectionType, path));
  }
  return out;
}

/**
 * A single draggable block row in the sidebar sublist — recurses into its own
 * children when it's an expanded group, so nested blocks show up indented
 * underneath it (Shopify-style layers tree) instead of only one flat level.
 */
function BlockTreeRow({ block, sectionType, depth, path, selectedPath, expandedIds, onToggleExpand, onSelect }) {
  const { t } = useTranslation();
  const def = blockTypeDef(sectionType, block.type);
  const isContainer = !!def?.container;
  const parentPath = path.slice(0, -1);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { path, parentPath, container: isContainer },
  });
  const active = selectedPath && selectedPath.length === path.length && selectedPath.every((id, i) => id === path[i]);
  const isExpanded = expandedIds.has(block.id);
  const children = block.blocks ?? [];

  return (
    <>
      <li
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, paddingLeft: depth * 14 }}
        className={
          'group/blk flex items-center gap-1 rounded px-1 py-1.5 text-xs ' +
          (active ? 'bg-blue-50 text-blue-900' : 'text-gray-500 hover:bg-gray-50')
        }
      >
        <button
          type="button"
          aria-label={t('sectionBuilder:fields.repeaterField.dragToReorder')}
          className="cursor-grab touch-none text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={12} />
        </button>
        {isContainer ? (
          <button
            type="button"
            onClick={() => onToggleExpand(block.id)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            className="rounded text-gray-400 hover:text-gray-700"
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-3" />
        )}
        <button type="button" onClick={() => onSelect(path)} className="min-w-0 flex-1 truncate text-left">
          {blockSummary(block, sectionType, t)}
        </button>
      </li>

      {isContainer && isExpanded && (
        <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {children.map((child) => (
            <BlockTreeRow
              key={child.id}
              block={child}
              sectionType={sectionType}
              depth={depth + 1}
              path={[...path, child.id]}
              selectedPath={selectedPath}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </SortableContext>
      )}
    </>
  );
}

/**
 * Sortable sidebar row (US-3.1..US-3.3). Sections that support blocks expand
 * to reveal their blocks (drag-reorderable, like sections) + an inline "Add
 * block" row (Shopify-style). Drag handles show on hover/focus. Blocks nested
 * inside a group render as indented children of that group's row, and can be
 * dragged into/out of any group at any depth (single DndContext across the
 * whole tree so cross-container moves resolve in one drag).
 */
export default function SectionListItem({ section, selectedId, onSelect, onSelectBlock, onAddBlock, onMoveBlock }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const supportsBlocks = sectionSupportsBlocks(section.type);
  const blocks = useMemo(() => section.blocks ?? [], [section.blocks]);
  const blockSel = parseBlockSelection(selectedId);
  const sectionSelected = selectedId === section.id;
  const selectedPath = blockSel?.sectionId === section.id ? blockSel.path : null;

  const [expanded, setExpanded] = useState(false);
  const [manuallyExpandedIds, setManuallyExpandedIds] = useState(() => new Set());
  const isExpanded = expanded || Boolean(selectedPath?.length);
  const atMax = isAtBlockMax(section.type, blocks);

  // Every ancestor group of the current selection is always expanded (so a
  // deeply nested selected block stays visible), unioned with whatever the
  // user has expanded/collapsed by hand.
  const expandedIds = useMemo(() => {
    const next = new Set(manuallyExpandedIds);
    if (selectedPath) {
      for (let i = 0; i < selectedPath.length - 1; i += 1) next.add(selectedPath[i]);
    }
    return next;
  }, [manuallyExpandedIds, selectedPath]);

  const toggleExpand = (id) =>
    setManuallyExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const flat = useMemo(() => flattenTree(blocks, section.type), [blocks, section.type]);
  const flatById = useMemo(() => new Map(flat.map((e) => [e.id, e])), [flat]);
  const allBlockIds = useMemo(() => flat.map((e) => e.id), [flat]);

  // Separate DnD context for the block sublist so it doesn't interfere with
  // the outer section-reordering context. One context spans the whole nested
  // tree (not one per group) so a block can be dragged across containers.
  const blockSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleBlockDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const activeMeta = flatById.get(active.id);
    const overMeta = flatById.get(over.id);
    if (!activeMeta || !overMeta) return;

    const samePath = (a, b) => a.length === b.length && a.every((id, i) => id === b[i]);

    if (overMeta.container) {
      // Dropped directly on a group row — nest as the last child of that group.
      onMoveBlock(section.id, active.id, activeMeta.parentPath, overMeta.path, undefined);
      return;
    }

    const toParentPath = overMeta.parentPath;
    const siblingIds = blocksAtPath(blocks, toParentPath).map((b) => b.id);
    let toIndex = siblingIds.indexOf(over.id);
    if (samePath(activeMeta.parentPath, toParentPath)) {
      const fromIndex = siblingIds.indexOf(active.id);
      if (fromIndex !== -1 && fromIndex < toIndex) toIndex -= 1;
    }
    onMoveBlock(section.id, active.id, activeMeta.parentPath, toParentPath, toIndex);
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="rounded-md"
    >
      <div
        className={
          'group flex items-center gap-1 rounded-md px-2 py-2 text-sm ' +
          (sectionSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50')
        }
      >
        <button
          type="button"
          aria-label={t('sectionBuilder:editor.sectionListItem.dragAriaLabel')}
          className="cursor-grab touch-none text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        {supportsBlocks ? (
          <button
            type="button"
            onClick={() => setExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            className="rounded text-gray-400 hover:text-gray-700"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-3.5" />
        )}
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 truncate text-left">
          {labelForType(section.type)}
        </button>
      </div>

      {supportsBlocks && isExpanded && (
        <div className="mb-1 ml-6 mt-0.5 border-l border-gray-100 pl-2">
          <DndContext sensors={blockSensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
            <SortableContext items={allBlockIds} strategy={verticalListSortingStrategy}>
              <ul className="space-y-0.5">
                {blocks.map((block) => (
                  <BlockTreeRow
                    key={block.id}
                    block={block}
                    sectionType={section.type}
                    depth={0}
                    path={[block.id]}
                    selectedPath={selectedPath}
                    expandedIds={expandedIds}
                    onToggleExpand={toggleExpand}
                    onSelect={(path) => onSelectBlock(section.id, path)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          <div className="mt-0.5">
            <AddBlockControl
              sectionType={section.type}
              atMax={atMax}
              onAdd={(blockType) => onAddBlock(section.id, blockType)}
              variant="sidebar"
            />
          </div>
        </div>
      )}
    </li>
  );
}
