import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus, Heading, Type, AlignLeft, MousePointerClick, Image as ImageIcon, MoveVertical,
  Quote, HelpCircle, Sparkles, User, Award, Megaphone, Folder, Package, FormInput, Link, List, Group,
} from 'lucide-react';
import { blockTypesForSection } from '../sections/blockHelpers';
import { blockDef } from '../sections/blocks/registry';

const ICONS = {
  Heading, Type, AlignLeft, MousePointerClick, Image: ImageIcon, MoveVertical,
  Quote, HelpCircle, Sparkles, User, Award, Megaphone, Folder, Package, FormInput, Link, List, Group,
};

const MENU_WIDTH = 208; // w-52
const MENU_MAX_HEIGHT = 320;

/**
 * Add-block affordance shared by the sidebar row, the settings-panel block
 * list, and the canvas. Single-type sections add directly; multi-type sections
 * open a picker popover.
 *
 * The popover is rendered in a portal with fixed positioning so it is never
 * clipped by a section's `overflow-hidden`, and it flips above the trigger
 * when there isn't room below the viewport.
 */
export default function AddBlockControl({ sectionType, types: typesProp, atMax, onAdd, variant = 'panel' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null); // { left, top, above }
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    // Reposition/close on scroll or resize (fixed positioning is viewport-anchored).
    const reclose = () => setOpen(false);
    window.addEventListener('scroll', reclose, true);
    window.addEventListener('resize', reclose);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', reclose, true);
      window.removeEventListener('resize', reclose);
    };
  }, [open]);

  const types = typesProp
    ? typesProp.map((k) => ({ type: k, ...blockDef(k) })).filter((d) => d.label)
    : blockTypesForSection(sectionType);
  const multi = types.length > 1;

  const triggerClass =
    variant === 'sidebar'
      ? 'flex w-full items-center gap-1 rounded px-2 py-1.5 text-left text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent'
      : variant === 'canvas'
      ? 'mt-4 flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40'
      : variant === 'insert'
      // Circular "+" (Easyblocks-style insert-between-items affordance) at a
      // boundary next to the currently *selected* block — BlockStream only
      // renders this control at all when that's the case (see its
      // `insertBefore`/trailing-zone gating), so no hover-reveal trick is
      // needed here; it's always fully opaque once mounted. Icon-only, no
      // label, sized to sit centered on its boundary strip.
      ? 'flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm'
      : 'flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40';

  const label = multi
    ? t('sectionBuilder:editor.blockList.add', 'Add block')
    : t('sectionBuilder:editor.blockList.addNamed', { name: types[0]?.label, defaultValue: `Add ${types[0]?.label}` });

  const openMenu = () => {
    const r = triggerRef.current.getBoundingClientRect();
    const estHeight = Math.min(MENU_MAX_HEIGHT, types.length * 40 + 12);
    const spaceBelow = window.innerHeight - r.bottom;
    const above = spaceBelow < estHeight + 8 && r.top > spaceBelow;
    // Clamp left so the menu never runs off the right edge.
    const left = Math.min(r.left, window.innerWidth - MENU_WIDTH - 8);
    setCoords({ left: Math.max(8, left), top: above ? r.top : r.bottom, above });
    setOpen(true);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (atMax) return;
    if (multi) (open ? setOpen(false) : openMenu());
    else onAdd(types[0]?.type);
  };

  return (
    <div ref={triggerRef} className={variant === 'sidebar' ? '' : 'inline-block'} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={atMax}
        onClick={handleClick}
        className={triggerClass}
        aria-label={variant === 'insert' ? (atMax ? t('sectionBuilder:editor.blockList.maxReached', 'Maximum reached') : label) : undefined}
      >
        <Plus size={variant === 'sidebar' ? 13 : variant === 'insert' ? 13 : 15} />
        {variant !== 'insert' && (atMax ? t('sectionBuilder:editor.blockList.maxReached', 'Maximum reached') : label)}
      </button>

      {open && multi && coords &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              left: coords.left,
              top: coords.top,
              width: MENU_WIDTH,
              maxHeight: MENU_MAX_HEIGHT,
              transform: coords.above ? 'translateY(-100%)' : 'translateY(4px)',
            }}
            className="z-[300] overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-xl"
          >
            {types.map((ty) => {
              const Icon = ICONS[ty.icon] ?? Plus;
              return (
                <button
                  key={ty.type}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(ty.type);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                >
                  <Icon size={15} className="text-gray-400" />
                  {ty.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
