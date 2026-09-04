import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Custom Tiptap node for Rich Text Editor — Insert Video. Renders as a
 * wrapped, non-editable <iframe> (an "atom" node, like Image) so it can be
 * selected/replaced/removed as a single unit instead of having its markup
 * edited inline. Only `src` is kept — the rest of a pasted embed snippet
 * (width/height/allow attrs) is dropped in favor of a fixed, responsive
 * 16:9 frame, which is what actually needs to render sanely inside a page's
 * prose column regardless of what the original snippet specified.
 */
export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-video-embed]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-video-embed': 'true',
        style: 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#000;',
      }),
      [
        'iframe',
        {
          src: node.attrs.src,
          frameborder: '0',
          allowfullscreen: 'true',
          style: 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;',
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideoEmbed:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export default VideoEmbed;
