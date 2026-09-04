import { memo } from 'react';
import { resolveMedia } from '../../ui/fields/imageValue';
import BlockStream from '../../ui/BlockStream';

const POSITION_CLASS = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' };

// Simplification: no real video playback in this prototype (no backend to
// host uploaded video files) — the poster image stands in for the video
// frame, matching the PRD's own "poster image shown while video loads /
// on devices that block autoplay" fallback behavior.
function VideoBannerRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx }) {
  const poster = resolveMedia(data.poster_image, mediaLibrary);
  const position = POSITION_CLASS[data.text_position] ?? POSITION_CLASS.center;

  return (
    <section
      className="relative flex justify-center overflow-hidden bg-cover bg-center px-6"
      style={{
        backgroundImage: poster ? `url(${poster.url})` : undefined,
        minHeight: `${data.section_height ?? 560}px`,
      }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${(data.overlay_opacity ?? 40) / 100})` }} />
      {data.text_overlay !== false && (
        <div className="relative z-10 flex max-w-lg flex-col justify-center">
          <BlockStream
            sectionType="video_banner"
            blocks={blocks}
            theme={theme}
            mediaLibrary={mediaLibrary}
            blockCtx={blockCtx}
            className={`flex flex-col gap-4 ${position}`}
          />
        </div>
      )}
    </section>
  );
}

export default memo(VideoBannerRenderer);
