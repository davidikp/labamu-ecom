import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveMedia } from '../../ui/fields/imageValue';
import BlockStream from '../../ui/BlockStream';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

// Stacking order is independently configurable per breakpoint (image_position
// for desktop left/right, image_position_mobile for above/below text) — JS
// driven (not `sm:` classes) since the builder canvas's "Mobile" preview is a
// fixed-width div inside the real (wide) browser window, so a real CSS media
// query never reflects it. useResponsiveMobile falls back to a real
// matchMedia check when `isMobile` isn't passed (e.g. the published
// storefront), so this stays correct there too.
function ImageWithTextRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const image = resolveMedia(data.image, mediaLibrary);
  const aspectClass = ASPECT_RATIO_CLASS[data.image_aspect_ratio] ?? ASPECT_RATIO_CLASS.landscape;
  const imageFirst = mobile ? (data.image_position_mobile ?? 'top') === 'top' : (data.image_position ?? 'left') === 'left';
  const imageOrder = imageFirst ? 'order-1' : 'order-2';
  const textOrder = imageFirst ? 'order-2' : 'order-1';

  return (
    <section className={`grid gap-6 px-6 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
      <div className={`flex items-center justify-center overflow-hidden rounded-md bg-gray-100 text-gray-300 ${aspectClass} ${imageOrder}`}>
        {image ? <img src={image.url} alt={image.filename} className="h-full w-full object-cover" /> : t('sectionBuilder:sections.common.noImage')}
      </div>
      <div className={`relative flex flex-col justify-center ${textOrder}`}>
        <BlockStream
          sectionType="image_with_text"
          blocks={blocks}
          theme={theme}
          mediaLibrary={mediaLibrary}
          blockCtx={blockCtx}
          className="flex flex-col gap-3"
          isMobile={isMobile}
        />
      </div>
    </section>
  );
}

export default memo(ImageWithTextRenderer);
