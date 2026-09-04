import { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import EditableText from '../../ui/EditableText';
import BlockBoundary from '../../ui/BlockBoundary';
import BlockStream from '../../ui/BlockStream';
import AddBlockControl from '../../ui/AddBlockControl';
import { HEADING_SIZE_CLASS } from '../shared/headingSize';

function FaqItem({ block, open, onToggle, blockCtx }) {
  const { t } = useTranslation();
  return (
    <div className="border-b border-gray-100 py-3">
      <div className="flex w-full items-center justify-between text-left text-sm font-medium text-gray-900">
        {blockCtx ? (
          <EditableText
            className="flex-1"
            value={block.data?.question}
            placeholder={t('sectionBuilder:sections.faqAccordion.defaultQuestion')}
            onCommit={(v) => blockCtx.onEdit(block.id, 'question', v)}
          />
        ) : (
          <button
            type="button"
            aria-expanded={open}
            onClick={onToggle}
            className="flex flex-1 items-center justify-between text-left"
          >
            {block.data?.question || t('sectionBuilder:sections.faqAccordion.defaultQuestion')}
          </button>
        )}
        <button type="button" aria-expanded={open} onClick={onToggle} className="ml-2 text-gray-400">
          {open ? '−' : '+'}
        </button>
      </div>
      {open && (
        <div
          className="prose prose-sm mt-2 text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: block.data?.answer || `<p>${t('sectionBuilder:sections.faqAccordion.defaultAnswer')}</p>` }}
        />
      )}
    </div>
  );
}

// TODO(security): sanitize `block.data.answer` before public rendering — same
// caveat as rich_text/Renderer.jsx.
function FaqAccordionRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx }) {
  const { t } = useTranslation();
  const items = blocks.filter((b) => b.type === 'faq');
  const genericBlocks = blocks.filter((b) => b.type !== 'faq');
  const [openIds, setOpenIds] = useState(() => (data.open_first_by_default && items[0] ? new Set([items[0].id]) : new Set()));
  const headingSizeClass = HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium;

  const toggle = (id) =>
    setOpenIds((prev) => {
      const allowMultiple = data.allow_multiple_open;
      const next = allowMultiple ? new Set(prev) : new Set();
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className="px-6">
      {data.show_heading !== false && (
        onEdit ? (
          <EditableText
            as="h2"
            className={`mb-4 font-semibold text-gray-900 ${headingSizeClass}`}
            value={data.heading}
            placeholder={t('sectionBuilder:sections.faqAccordion.defaultHeading')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          <h2 className={`mb-4 font-semibold text-gray-900 ${headingSizeClass}`}>{data.heading || t('sectionBuilder:sections.faqAccordion.defaultHeading')}</h2>
        )
      )}
      {(genericBlocks.length > 0 || blockCtx) && (
        <BlockStream sectionType="faq_accordion" blocks={genericBlocks} theme={theme} mediaLibrary={mediaLibrary} blockCtx={blockCtx} hideAdd className="mb-6 flex flex-col gap-3" />
      )}
      {items.length === 0 && !blockCtx ? (
        <p className="text-sm text-gray-400">{t('sectionBuilder:sections.faqAccordion.emptyState')}</p>
      ) : (
        <div>
          {items.map((b) => (
            <BlockBoundary
              key={b.id}
              selected={blockCtx?.selectedBlockId === b.id}
              onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
              label={t('sectionBuilder:sections.faqAccordion.blockLabel', 'FAQ')}
            >
              <FaqItem block={b} open={openIds.has(b.id)} onToggle={() => toggle(b.id)} blockCtx={blockCtx} />
            </BlockBoundary>
          ))}
        </div>
      )}

      {blockCtx && (blockCtx.selectedBlockId || blockCtx.sectionActive) && !blockCtx.atMax && (
        <div className="mt-4"><AddBlockControl sectionType="faq_accordion" atMax={false} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" /></div>
      )}
    </section>
  );
}

export default memo(FaqAccordionRenderer);
