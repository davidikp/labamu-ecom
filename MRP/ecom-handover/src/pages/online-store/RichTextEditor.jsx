import { useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Image } from '@tiptap/extension-image';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { CellSelection, TableMap } from '@tiptap/pm/tables';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { useTranslation } from 'react-i18next';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Code,
  ChevronDown,
  List,
  ListOrdered,
  IndentIncrease,
  IndentDecrease,
  Eraser,
  Code2,
  Sparkles,
} from 'lucide-react';
import { Tooltip } from '../../ce-ui';
import { VideoEmbed } from './videoEmbedExtension';
import SelectImageModal from './SelectImageModal';
import InsertVideoModal, { extractIframeSrc } from './InsertVideoModal';
import InsertLinkModal from './InsertLinkModal';
import GenerateTextModal from './GenerateTextModal';

const PARAGRAPH_STYLES = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
];

const TEXT_COLORS = ['#282828', '#DA1E28', '#F1820C', '#0E8A00', '#006BFF', '#8A3FFC'];
const BACKGROUND_COLORS = ['#FEF3C7', '#FCE7F3', '#DCFCE7', '#DBEAFE', '#EDE9FE', '#FEE2E2'];

// Strips <script> tags before HTML entered in Code view is fed back into the
// rich-text editor (Rich Text Editor — HTML View's "script tag pasted"
// negative case) — a DOM-based sanitize rather than a regex, so it survives
// malformed/unbalanced markup instead of corrupting it further.
function sanitizeHtml(html) {
  try {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    doc.body.querySelectorAll('script').forEach((el) => el.remove());
    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

// Clears the text content of every cell in the row or column the current
// selection sits inside, leaving the table's row/column structure intact —
// mirrors prosemirror-tables' own "select cells, then delete" behavior via a
// synthesized CellSelection instead of removing rows/columns outright.
function clearTableLine(editor, mode) {
  const { state, dispatch } = editor.view;
  const { doc, selection } = state;
  const $pos = selection.$anchor;

  // tableDepthAt is declared further below (function declarations hoist),
  // shared with the context-menu's own "did this click land in a table"
  // check so the two don't drift on how that's determined.
  const tableDepth = tableDepthAt($pos);
  if (tableDepth === -1) return;

  const table = $pos.node(tableDepth);
  const tableStart = $pos.before(tableDepth) + 1;

  let cellRelPos = null;
  for (let d = $pos.depth; d > tableDepth; d -= 1) {
    const role = $pos.node(d).type.spec.tableRole;
    if (role === 'cell' || role === 'header_cell') {
      cellRelPos = $pos.before(d) - tableStart;
      break;
    }
  }
  if (cellRelPos == null) return;

  try {
    const map = TableMap.get(table);
    const rect = map.findCell(cellRelPos);
    const firstIdx = mode === 'row' ? rect.top * map.width : rect.left;
    const lastIdx = mode === 'row' ? rect.top * map.width + (map.width - 1) : (map.height - 1) * map.width + rect.left;
    const $anchorCell = doc.resolve(tableStart + map.map[firstIdx]);
    const $headCell = doc.resolve(tableStart + map.map[lastIdx]);
    const cellSelection = mode === 'row' ? CellSelection.rowSelection($anchorCell, $headCell) : CellSelection.colSelection($anchorCell, $headCell);
    dispatch(state.tr.setSelection(cellSelection).deleteSelection());
  } catch {
    // Table shape didn't match expectations — leave the table untouched
    // rather than risk corrupting it.
  }
}

// Closes an open dropdown/popover when a pointer-down happens outside its
// `ref` element — shared by every toolbar popover below (color picker,
// paragraph style, table menu) so clicking elsewhere in the page dismisses
// whichever one is open, instead of only closing via its own toggle button.
function useCloseOnOutsideClick(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, ref, onClose]);
}

function ToolbarButton({ active, disabled, title, onClick, children }) {
  const button = (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : active
          ? 'bg-[#E6F0FF] text-[#006BFF]'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
  if (!title) return button;
  return (
    <Tooltip content={title} placement="top">
      {button}
    </Tooltip>
  );
}

function ParagraphStyleDropdown({ editor }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  useCloseOnOutsideClick(containerRef, open, () => setOpen(false));
  if (!editor) return null;

  const current =
    PARAGRAPH_STYLES.find((s) => s.value !== 'paragraph' && editor.isActive('heading', { level: Number(s.value[1]) }))
      ?.label ?? 'Paragraph';

  const applyStyle = (value) => {
    if (value === 'paragraph') editor.chain().focus().setParagraph().run();
    else editor.chain().focus().toggleHeading({ level: Number(value[1]) }).run();
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        className="h-8 px-2.5 flex items-center gap-1 rounded-md text-sm text-gray-700 hover:bg-gray-100 border border-transparent"
      >
        {current}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 min-w-[140px] bg-white border border-gray-200 rounded-md shadow-lg py-1">
          {PARAGRAPH_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyStyle(s.value)}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// #abc / #aabbcc, with or without the leading #.
const HEX_COLOR_RE = /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i;

function normalizeHex(value) {
  const trimmed = value.trim();
  if (!HEX_COLOR_RE.test(trimmed)) return null;
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function ColorPicker({ editor }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('text');
  const [hexInput, setHexInput] = useState('');
  const [hexError, setHexError] = useState(false);
  const containerRef = useRef(null);
  useCloseOnOutsideClick(containerRef, open, () => setOpen(false));
  if (!editor) return null;

  const applyColor = (color) => {
    if (tab === 'text') editor.chain().focus().setColor(color).run();
    else editor.chain().focus().toggleHighlight({ color }).run();
    setOpen(false);
  };

  const applyHex = () => {
    const normalized = normalizeHex(hexInput);
    if (!normalized) {
      setHexError(true);
      return;
    }
    setHexError(false);
    setHexInput('');
    applyColor(normalized);
  };

  return (
    <div className="relative" ref={containerRef}>
      <ToolbarButton title="Text color" onClick={() => setOpen((o) => !o)}>
        <Palette size={16} />
      </ToolbarButton>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 w-[220px] bg-white border border-gray-200 rounded-md shadow-lg p-2">
          <div className="flex gap-1 mb-2 border-b border-gray-100 pb-2">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setTab('text');
                setHexError(false);
              }}
              className={`px-2 py-1 text-xs rounded ${tab === 'text' ? 'bg-[#E6F0FF] text-[#006BFF]' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Text
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setTab('background');
                setHexError(false);
              }}
              className={`px-2 py-1 text-xs rounded ${tab === 'background' ? 'bg-[#E6F0FF] text-[#006BFF]' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Background
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(tab === 'text' ? TEXT_COLORS : BACKGROUND_COLORS).map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor(color)}
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 border-t border-gray-100 pt-2">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => {
                setHexInput(e.target.value);
                setHexError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && applyHex()}
              placeholder="#006BFF"
              className={`w-full h-7 rounded border px-2 text-xs text-gray-800 outline-none ${
                hexError ? 'border-red-400' : 'border-gray-300 focus:border-[#006BFF]'
              }`}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={applyHex}
              disabled={!hexInput.trim()}
              className="h-7 shrink-0 rounded bg-[#006BFF] px-2.5 text-xs font-medium text-white disabled:opacity-40"
            >
              Apply
            </button>
          </div>
          {hexError && <p className="mt-1 text-[11px] text-red-600">Enter a valid hex color, e.g. #006BFF.</p>}
        </div>
      )}
    </div>
  );
}

// Shared by the toolbar's Table dropdown and the cell right-click context
// menu (see TableContextMenu below) — one list so the two entry points can
// never drift on which operations exist or what they do.
function tableMenuItems(editor, insideTable) {
  return insideTable
    ? [
        { label: 'Insert row above', run: () => editor.chain().focus().addRowBefore().run() },
        { label: 'Insert row below', run: () => editor.chain().focus().addRowAfter().run() },
        { label: 'Insert column before', run: () => editor.chain().focus().addColumnBefore().run() },
        { label: 'Insert column after', run: () => editor.chain().focus().addColumnAfter().run() },
        { label: 'Clear row', run: () => clearTableLine(editor, 'row') },
        { label: 'Clear column', run: () => clearTableLine(editor, 'column') },
        { label: 'Delete row', run: () => editor.chain().focus().deleteRow().run() },
        { label: 'Delete column', run: () => editor.chain().focus().deleteColumn().run() },
        { label: 'Delete table', run: () => editor.chain().focus().deleteTable().run() },
      ]
    : [
        {
          label: 'Insert table',
          run: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        },
      ];
}

function TableMenu({ editor }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  useCloseOnOutsideClick(containerRef, open, () => setOpen(false));
  if (!editor) return null;

  const insideTable = editor.isActive('table');
  const items = tableMenuItems(editor, insideTable);

  return (
    <div className="relative" ref={containerRef}>
      <ToolbarButton title="Table" active={insideTable} onClick={() => setOpen((o) => !o)}>
        <TableIcon size={16} />
      </ToolbarButton>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-20 min-w-[180px] bg-white border border-gray-200 rounded-md shadow-lg py-1">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                item.run();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Finds the table depth (if any) a resolved doc position sits inside —
// shared by clearTableLine above and the context-menu position check below,
// which needs to know *before* deciding whether to preventDefault the
// browser's native menu.
function tableDepthAt($pos) {
  for (let d = $pos.depth; d > 0; d -= 1) {
    if ($pos.node(d).type.spec.tableRole === 'table') return d;
  }
  return -1;
}

/**
 * Right-click-on-a-cell context menu — the "when I right click the option is
 * shown" / cell-focus-state expectation from the table-editing AC. Reuses
 * the exact same operations list as the toolbar's Table dropdown
 * (tableMenuItems) so both entry points can never disagree. Only intercepts
 * the browser's native context menu when the right-click actually landed
 * inside a table cell — everywhere else in the editor, the default menu
 * (copy/paste/etc.) still shows.
 */
const TABLE_CONTEXT_MENU_WIDTH = 200;

function TableContextMenu({ editor }) {
  const [menu, setMenu] = useState(null); // { x, y } in viewport coords, or null
  const menuRef = useRef(null);
  useCloseOnOutsideClick(menuRef, Boolean(menu), () => setMenu(null));

  useEffect(() => {
    if (!editor) return undefined;
    const dom = editor.view.dom;

    function handleContextMenu(e) {
      const pos = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (!pos) return;
      const $pos = editor.state.doc.resolve(pos.pos);
      if (tableDepthAt($pos) === -1) return; // not inside a table — let the native menu show
      e.preventDefault();
      // Move the editor's own selection into the clicked cell first, so the
      // table commands below (which all act on the current selection, same
      // as the toolbar dropdown) operate on the right cell.
      editor.commands.setTextSelection(pos.pos);
      // Clamp so a right-click near the right edge doesn't render the menu
      // partly off-screen.
      const x = Math.max(8, Math.min(e.clientX, window.innerWidth - TABLE_CONTEXT_MENU_WIDTH - 8));
      setMenu({ x, y: e.clientY });
    }

    dom.addEventListener('contextmenu', handleContextMenu);
    return () => dom.removeEventListener('contextmenu', handleContextMenu);
  }, [editor]);

  if (!menu) return null;
  const items = tableMenuItems(editor, true);

  return (
    <div
      ref={menuRef}
      // Explicit pixel width (not just a Tailwind min-width class) — a
      // `position: fixed` element with only `left`/`top` set should already
      // shrink-to-fit its content, but this guarantees a compact,
      // consistent size regardless of what's fighting it.
      style={{ position: 'fixed', left: menu.x, top: menu.y, zIndex: 50, width: TABLE_CONTEXT_MENU_WIDTH }}
      className="rounded-md border border-gray-200 bg-white py-1 shadow-lg"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            item.run();
            setMenu(null);
          }}
          className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// Notion-style: highlights whichever table cell the cursor/selection is
// currently inside, recomputed on every selection/doc change via a
// ProseMirror decoration — not a CSS `:hover` rule, so it stays lit while
// you're working inside the cell (typing, arrow-key navigation) regardless
// of where the mouse happens to be, and clears entirely once the selection
// leaves the table.
const cellFocusPluginKey = new PluginKey('cellFocusHighlight');

const CellFocusHighlight = Extension.create({
  name: 'cellFocusHighlight',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: cellFocusPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            if (!tr.docChanged && !tr.selectionSet) return old;
            const $pos = tr.selection.$from;
            let cellDepth = -1;
            for (let d = $pos.depth; d > 0; d -= 1) {
              const role = $pos.node(d).type.spec.tableRole;
              if (role === 'cell' || role === 'header_cell') {
                cellDepth = d;
                break;
              }
            }
            if (cellDepth === -1) return DecorationSet.empty;
            const from = $pos.before(cellDepth);
            const to = $pos.after(cellDepth);
            return DecorationSet.create(tr.doc, [Decoration.node(from, to, { class: 'is-cell-focused' })]);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

/**
 * @component RichTextEditor
 * @description Tiptap-based WYSIWYG editor for the Page editor screen's
 * Content field. Covers the PRD's Rich Text Editor requirements: text
 * formatting, lists/indent, image insert (via the shared media library),
 * video embed, tables, an HTML/code view, and simulated "Generate text with
 * Labamu AI".
 *
 * `mediaLibrary`/`onUploadMedia` wire the Insert Image modal to the same
 * draft-level media store Section Builder uses, so uploads here are shared.
 */
export default function RichTextEditor({ value, onChange, placeholder, mediaLibrary = [], onUploadMedia }) {
  const { t } = useTranslation();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlDraft, setHtmlDraft] = useState('');

  const editor = useEditor({
    // Tiptap v3 no longer re-renders the component on every transaction by
    // default (only on the initial mount) — without this, every toolbar
    // button's active/disabled state (bold, link, "inside a table", ...)
    // reads a stale snapshot from whenever the editor was first created and
    // only happens to refresh when something ELSE (e.g. onChange) causes
    // this component's parent to re-render.
    shouldRerenderOnTransaction: true,
    extensions: [
      // StarterKit already bundles Link and Underline — disable its copies so
      // the explicitly-configured ones below (openOnClick/autolink options)
      // don't collide with them (duplicate extension names crash the editor).
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, underline: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      VideoEmbed,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CellFocusHighlight,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content prose prose-sm max-w-none min-h-[220px] px-4 py-3 outline-none',
        'data-placeholder': placeholder || '',
      },
    },
    onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
  });

  // Keep the editor in sync when `value` is replaced from outside (e.g. a
  // fresh page load) without fighting the user's own typing.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && (value || '') !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const existingLinkUrl = editor?.isActive('link') ? editor.getAttributes('link').href : null;

  const handleApplyLink = (url) => {
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleRemoveLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  const clearFormatting = () => {
    editor?.chain().focus().unsetAllMarks().unsetHighlight().clearNodes().run();
  };

  const existingVideoSrc = editor?.isActive('videoEmbed') ? editor.getAttributes('videoEmbed').src : null;

  const handleInsertVideo = (src) => {
    if (!editor) return;
    if (editor.isActive('videoEmbed')) {
      editor.chain().focus().updateAttributes('videoEmbed', { src }).run();
    } else {
      editor.chain().focus().setVideoEmbed({ src }).run();
    }
  };

  const handleRemoveVideo = () => {
    editor?.chain().focus().deleteNode('videoEmbed').run();
  };

  const enterHtmlMode = () => {
    setHtmlDraft(editor?.getHTML() ?? '');
    setHtmlMode(true);
  };

  const exitHtmlMode = () => {
    const clean = sanitizeHtml(htmlDraft);
    editor?.commands.setContent(clean, { emitUpdate: true });
    setHtmlMode(false);
  };

  const hasExistingContent = useMemo(() => Boolean(editor?.getText().trim()), [editor, value]);

  const handleGenerateApply = (text, insertMode) => {
    if (!editor) return;
    if (insertMode === 'insert') {
      editor.chain().focus('end').insertContent(text).run();
    } else {
      editor.commands.setContent(text, { emitUpdate: true });
    }
  };

  if (htmlMode) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5 bg-gray-50">
          <span className="text-xs font-medium text-gray-500">
            {t('sectionBuilder:onlineStore.pageEditor.htmlViewLabel', 'HTML')}
          </span>
          <button
            type="button"
            onClick={exitHtmlMode}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-[#006BFF] hover:bg-[#E6F0FF]"
          >
            {t('sectionBuilder:onlineStore.pageEditor.showEditor', 'Show editor')}
          </button>
        </div>
        <textarea
          autoFocus
          value={htmlDraft}
          onChange={(e) => setHtmlDraft(e.target.value)}
          className="min-h-[220px] w-full resize-y px-4 py-3 font-mono text-xs text-gray-800 outline-none"
        />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-2 py-1.5 bg-gray-50">
        <ParagraphStyleDropdown editor={editor} />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton
          title="Bold"
          active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ColorPicker editor={editor} />
        <ToolbarButton title="Clear formatting" onClick={clearFormatting}>
          <Eraser size={16} />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton
          title="Align left"
          active={editor?.isActive({ textAlign: 'left' })}
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Align center"
          active={editor?.isActive({ textAlign: 'center' })}
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Align right"
          active={editor?.isActive({ textAlign: 'right' })}
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Justify"
          active={editor?.isActive({ textAlign: 'justify' })}
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustify size={16} />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton
          title="Bulleted list"
          active={editor?.isActive('bulletList')}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor?.isActive('orderedList')}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Indent"
          disabled={!editor?.can().sinkListItem('listItem')}
          onClick={() => editor?.chain().focus().sinkListItem('listItem').run()}
        >
          <IndentIncrease size={16} />
        </ToolbarButton>
        <ToolbarButton
          title="Outdent"
          disabled={!editor?.can().liftListItem('listItem')}
          onClick={() => editor?.chain().focus().liftListItem('listItem').run()}
        >
          <IndentDecrease size={16} />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton
          title={editor?.state.selection.empty ? 'Select text first to add a link' : 'Link'}
          disabled={editor?.state.selection.empty && !editor?.isActive('link')}
          active={editor?.isActive('link')}
          onClick={() => setLinkModalOpen(true)}
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Image" onClick={() => setImageModalOpen(true)}>
          <ImageIcon size={16} />
        </ToolbarButton>
        <ToolbarButton title="Video" active={editor?.isActive('videoEmbed')} onClick={() => setVideoModalOpen(true)}>
          <Video size={16} />
        </ToolbarButton>
        <TableMenu editor={editor} />
        <ToolbarButton
          title="Code block"
          active={editor?.isActive('codeBlock')}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <Code size={16} />
        </ToolbarButton>
        <ToolbarButton title="HTML view" onClick={enterHtmlMode}>
          <Code2 size={16} />
        </ToolbarButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton title="Generate text with Labamu AI" onClick={() => setGenerateOpen(true)}>
          <Sparkles size={16} className="text-[#8A3FFC]" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      {/* Right-click-on-a-cell menu — see TableContextMenu's own doc
          comment for why this is a separate entry point from the toolbar's
          Table dropdown rather than folded into it. */}
      <TableContextMenu editor={editor} />
      {/*
        Tiptap's table extensions ship zero default styling — an inserted
        table is real content (`insertTable` definitely lands in the doc),
        it's just borderless/paddingless <td>s, indistinguishable from
        surrounding text. Scoped like PagesManagement.jsx's own inline
        <style> convention rather than reaching for a global stylesheet.
      */}
      <style>{`
        .rich-text-editor-content table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0.5rem 0;
        }
        .rich-text-editor-content td,
        .rich-text-editor-content th {
          border: 1px solid #D1D5DB;
          padding: 6px 10px;
          vertical-align: top;
          position: relative;
          transition: background-color 0.1s ease, box-shadow 0.1s ease;
        }
        .rich-text-editor-content th {
          background: #F9FAFB;
          font-weight: 600;
          text-align: left;
        }
        /* Notion-style: the cell the cursor/selection is currently inside,
           via the CellFocusHighlight ProseMirror decoration (see that
           extension's own doc comment) — not :hover. Stays lit while
           you're actually working in the cell, not just passing the mouse
           over it, and clears once the selection leaves the table. */
        .rich-text-editor-content .is-cell-focused {
          background-color: rgba(0, 107, 255, 0.06);
          box-shadow: inset 0 0 0 1.5px #006BFF;
        }
        /* @tailwindcss/typography's default link color is near-black (it
           reuses the body text color), not brand blue — override so an
           inserted link is actually recognizable as a hyperlink. */
        .rich-text-editor-content a {
          color: #006BFF;
        }
      `}</style>

      <SelectImageModal
        open={imageModalOpen}
        mediaLibrary={mediaLibrary}
        onUpload={(item) => onUploadMedia?.(item)}
        onPick={(url) => editor?.chain().focus().setImage({ src: url }).run()}
        onClose={() => setImageModalOpen(false)}
      />

      <InsertLinkModal
        open={linkModalOpen}
        existingUrl={existingLinkUrl}
        onApply={handleApplyLink}
        onRemove={handleRemoveLink}
        onClose={() => setLinkModalOpen(false)}
      />

      <InsertVideoModal
        open={videoModalOpen}
        existingSrc={existingVideoSrc}
        onInsert={handleInsertVideo}
        onRemove={handleRemoveVideo}
        onClose={() => setVideoModalOpen(false)}
      />

      <GenerateTextModal
        open={generateOpen}
        mode="content"
        hasExisting={hasExistingContent}
        onApply={handleGenerateApply}
        onClose={() => setGenerateOpen(false)}
      />
    </div>
  );
}

// Re-exported so PageEditor.jsx's HTML-view "script tag" sanitize step and
// the Title field's own generate flow can reuse the same logic/snippet
// parser without duplicating it.
export { sanitizeHtml, extractIframeSrc };
