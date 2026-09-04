import { memo } from 'react';
import BlockStream from '../../ui/BlockStream';

function AnnouncementBarRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx }) {
  return (
    <div
      style={{ textAlign: data.text_alignment ?? 'center' }}
      className="relative px-4 text-sm"
    >
      <BlockStream
        sectionType="announcement_bar"
        blocks={blocks}
        theme={theme}
        mediaLibrary={mediaLibrary}
        blockCtx={blockCtx}
        className="flex flex-col items-center gap-1"
      />
    </div>
  );
}

export default memo(AnnouncementBarRenderer);
