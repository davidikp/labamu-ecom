import { NodeViewWrapper } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

/**
 * @module pages/online-store/richTextNodeViews
 * @description Tiptap React node views for Rich Text Editor's two atom
 * media nodes — the stock `Image` extension (extended in RichTextEditor.jsx
 * to use `ImageNodeView` below) and the custom `VideoEmbed` node
 * (videoEmbedExtension.js, which renders through `VideoEmbedNodeView`
 * itself). Both exist for one reason: a top-right "X" that removes just
 * that node — the plain HTML `renderHTML` output either extension would
 * otherwise use has no way to attach that kind of interactive chrome, only
 * a node view (a real React component tiptap mounts in place of the node)
 * does.
 *
 * The "X" shows either on hover, or — more discoverably — once the node is
 * *selected* (a plain click on an atom node already creates a Tiptap
 * NodeSelection with no extra wiring needed here; `selected` below is that
 * state, provided automatically by ReactNodeViewRenderer). Selection also
 * gets its own visible ring, so "this is the thing about to be deleted" is
 * unambiguous even before the merchant's cursor is anywhere near the "X".
 */

function DeleteButton({ onDelete, label, selected }) {
  return (
    <button
      type="button"
      // mousedown (not click), with both propagation and the default
      // prevented — a plain click first lets the editor's own mousedown
      // handler move the selection/blur this node, which can unmount this
      // button (its hover/selected-only visibility) before a click event
      // ever gets to fire on it.
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete();
      }}
      aria-label={label}
      className={`absolute right-1.5 top-1.5 z-10 h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 ${
        selected ? 'flex' : 'hidden group-hover:flex'
      }`}
    >
      <X size={14} />
    </button>
  );
}

export function ImageNodeView({ node, selected, deleteNode }) {
  const { t } = useTranslation();
  return (
    // `as="span"` — Image is an inline node (sits within a paragraph), so
    // the wrapper has to stay inline too or it'd break out into its own
    // block and invalidate the surrounding paragraph's content model.
    // `contentEditable={false}` keeps the wrapper itself out of the text
    // selection/caret flow, same as the atom node's default (non-node-view)
    // rendering already behaved.
    <NodeViewWrapper
      as="span"
      className={`group relative inline-block align-middle ${selected ? 'ring-2 ring-[#006BFF] ring-offset-2' : ''}`}
      contentEditable={false}
    >
      <img src={node.attrs.src} alt={node.attrs.alt || ''} title={node.attrs.title || undefined} style={{ maxWidth: '100%' }} />
      <DeleteButton
        onDelete={deleteNode}
        selected={selected}
        label={t('sectionBuilder:onlineStore.pageEditor.richText.removeImage', 'Remove image')}
      />
    </NodeViewWrapper>
  );
}

export function VideoEmbedNodeView({ node, selected, deleteNode }) {
  const { t } = useTranslation();
  return (
    <NodeViewWrapper
      className={`group relative ${selected ? 'ring-2 ring-[#006BFF]' : ''}`}
      contentEditable={false}
      style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, background: '#000' }}
    >
      <iframe
        src={node.attrs.src}
        frameBorder="0"
        allowFullScreen
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
      />
      <DeleteButton
        onDelete={deleteNode}
        selected={selected}
        label={t('sectionBuilder:onlineStore.pageEditor.richText.removeVideo', 'Remove video')}
      />
    </NodeViewWrapper>
  );
}
