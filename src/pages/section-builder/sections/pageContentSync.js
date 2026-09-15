import { schemaForType } from './index';
import { defaultsForSchema } from './schemaDefaults';
import { makeBlock } from './blockHelpers';

/**
 * @module section-builder/sections/pageContentSync
 * @description Shared logic for keeping a page's auto-managed `rich_text`
 * section in sync with its Title/Content fields — used by both
 * PageEditor.jsx (Online Store > Pages) and PolicyEditorModal.jsx
 * (Settings > Policies), so a policy edited from either entry point ends up
 * with the same section-builder-renderable content, which is what makes it
 * actually render at its slug in the live storefront preview
 * (PreviewLive.jsx's generic Canvas branch renders `page.sections`).
 */

// Stable id for the single auto-generated `rich_text` section that mirrors
// this page's Title+Content fields — keyed off the page id so it can be
// found/replaced idempotently on every save (never duplicated) instead of
// being regenerated with a random uuid each time.
export function contentSyncSectionId(pageId) {
  return `${pageId}-content-sync`;
}

// Splits the RichTextEditor's Tiptap HTML into plain-text paragraphs, one
// per block-level element (<p>, <h1-6>, <li>, ...). The section-builder's
// own text-block editor (`EditableText`) is a plain contenteditable field,
// not an HTML renderer — feeding it raw HTML would show literal "<p>" tags
// while editing (it only gets interpreted as HTML in the site's read-only
// render). Stripping tags per-paragraph keeps paragraph breaks (as separate
// blocks) while avoiding that literal-markup artifact in the editor.
export function splitContentIntoParagraphs(html) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const blocks = Array.from(doc.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li'));
  const source = blocks.length ? blocks : [doc.body];
  return source
    .map((el) => el.textContent.trim())
    .filter(Boolean);
}

// Builds/refreshes the auto-managed rich_text section mirroring a page's
// name (heading block) + content (one text block per paragraph) so "Edit in
// Editor" and the section-builder preview show something in sync with the
// authored fields, not an empty canvas.
export function buildContentSyncSection(pageId, { name, content }) {
  const headingBlock = makeBlock('rich_text', 'heading');
  headingBlock.data = { ...headingBlock.data, text: name };

  const paragraphs = splitContentIntoParagraphs(content);
  const textBlocks = (paragraphs.length ? paragraphs : ['']).map((text) => {
    const block = makeBlock('rich_text', 'text');
    block.data = { ...block.data, content: text };
    return block;
  });

  return {
    id: contentSyncSectionId(pageId),
    type: 'rich_text',
    data: defaultsForSchema(schemaForType('rich_text')),
    blocks: [headingBlock, ...textBlocks],
  };
}

// Replaces (or inserts) the auto-managed content-sync section within an
// existing sections array — kept as the FIRST section (matching the natural
// reading order of a page's own Title/Content, ahead of any other authored
// sections), leaving every other section untouched.
export function syncSectionsWithContent(sections, pageId, { name, content }) {
  const syncId = contentSyncSectionId(pageId);
  const withoutSync = (sections ?? []).filter((s) => s.id !== syncId);
  return [buildContentSyncSection(pageId, { name, content }), ...withoutSync];
}
