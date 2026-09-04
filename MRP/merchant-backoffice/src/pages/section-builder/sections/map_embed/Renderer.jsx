import { memo } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BlockStream from '../../ui/BlockStream';
import EditableText from '../../ui/EditableText';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

// Google's no-API-key iframe embed (?q=<address>&output=embed) geocodes the
// typed address itself — no lat/lng fields, no backend, no API key. Falls
// back to a plain placeholder when there's no address yet to geocode.
function mapEmbedSrc(address, zoom) {
  if (!address?.trim()) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom ?? 14}&output=embed`;
}

function MapEmbedRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const height = mobile ? data.map_height_mobile ?? 250 : data.map_height ?? 400;
  const mapSrc = mapEmbedSrc(data.address, data.zoom_level);

  const hasAddressDetails = onEdit || data.address || data.store_hours || data.phone_number;

  return (
    <section className="px-6">
      {/* Xinear-style split layout — text (heading/subtext/address) on the
          left, the map on the right, both centered on the same row; stacks
          to text-above-map on mobile, matching Figma's "Visit Our Store!"
          reference. */}
      <div className="flex flex-col gap-8 md:flex-row md:items-center">
        <div className="relative flex w-full flex-col gap-4 md:w-[35%]">
          <BlockStream
            sectionType="map_embed"
            blocks={blocks}
            theme={theme}
            mediaLibrary={mediaLibrary}
            blockCtx={blockCtx}
            className="flex flex-col gap-1"
            isMobile={isMobile}
          />
          {data.show_address_text !== false && hasAddressDetails && (
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin size={18} className="mt-0.5 shrink-0" aria-hidden />
                {onEdit ? (
                  <EditableText
                    as="p"
                    multiline
                    value={data.address}
                    placeholder={t('sectionBuilder:sections.mapEmbed.addressPlaceholder', 'Add your address…')}
                    onCommit={(v) => onEdit('address', v)}
                  />
                ) : (
                  data.address && <p>{data.address}</p>
                )}
              </div>
              {onEdit ? (
                <EditableText
                  as="p"
                  multiline
                  className="whitespace-pre-line"
                  value={data.store_hours}
                  placeholder={t('sectionBuilder:sections.mapEmbed.storeHoursPlaceholder', 'Add store hours…')}
                  onCommit={(v) => onEdit('store_hours', v)}
                />
              ) : (
                data.store_hours && <p className="whitespace-pre-line">{data.store_hours}</p>
              )}
              {onEdit ? (
                <EditableText
                  as="p"
                  value={data.phone_number}
                  placeholder={t('sectionBuilder:sections.mapEmbed.phonePlaceholder', 'Add a phone number…')}
                  onCommit={(v) => onEdit('phone_number', v)}
                />
              ) : (
                data.phone_number && <p>{data.phone_number}</p>
              )}
            </div>
          )}
        </div>
        <div className="relative w-full overflow-hidden rounded-md bg-gray-200 md:w-[60%]" style={{ height: `${height}px` }}>
          {mapSrc ? (
            <>
              <iframe
                key={mapSrc}
                src={mapSrc}
                title={t('sectionBuilder:sections.mapEmbed.mapAriaLabel')}
                loading="lazy"
                className="h-full w-full border-0"
              />
              {/* In the editor, an iframe would swallow clicks before they
                  reach Canvas.jsx's section-select handler (iframe content is
                  a separate document — clicks inside it never bubble to the
                  parent). This transparent overlay keeps the map visible as a
                  live preview while still letting the merchant click through
                  to select the section; the published storefront (no onEdit)
                  renders the iframe fully interactive/pannable. */}
              {onEdit && <div className="absolute inset-0" aria-hidden="true" />}
            </>
          ) : (
            <div className="flex h-full items-center justify-center gap-1.5 text-sm text-gray-400">
              <MapPin size={16} aria-hidden /> {t('sectionBuilder:sections.mapEmbed.noAddress')}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(MapEmbedRenderer);
