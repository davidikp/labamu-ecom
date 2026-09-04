import { memo } from 'react';
import BlockStream from '../../ui/BlockStream';

function RichTextRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx }) {
  const width = data.content_width ?? '680';
  const centered = data.text_alignment === 'center';

  return (
    <div style={{ textAlign: data.text_alignment ?? 'left' }} className="px-6">
      <div className="relative" style={{ maxWidth: `${width}px`, margin: centered ? '0 auto' : undefined }}>
        <BlockStream
          sectionType="rich_text"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className="flex flex-col gap-4"
        />
      </div>
    </div>
  );
}

export default memo(RichTextRenderer);
