import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

const TILE_SIZE = 256;

function lonLatToTileXY(lon, lat, zoom) {
  const n = 2 ** zoom;
  const x = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

function buildTileGrid({ lat, lng, zoom, width, height }) {
  const n = 2 ** zoom;
  const { x: xTileF, y: yTileF } = lonLatToTileXY(lng, lat, zoom);
  const originWorldPxX = xTileF * TILE_SIZE - width / 2;
  const originWorldPxY = yTileF * TILE_SIZE - height / 2;
  const startTileX = Math.floor(originWorldPxX / TILE_SIZE);
  const startTileY = Math.floor(originWorldPxY / TILE_SIZE);
  const offsetX = originWorldPxX - startTileX * TILE_SIZE;
  const offsetY = originWorldPxY - startTileY * TILE_SIZE;
  const tilesX = Math.ceil((width + offsetX) / TILE_SIZE) + 1;
  const tilesY = Math.ceil((height + offsetY) / TILE_SIZE) + 1;

  const tiles = [];
  for (let i = 0; i < tilesX; i += 1) {
    for (let j = 0; j < tilesY; j += 1) {
      const tileY = startTileY + j;
      if (tileY < 0 || tileY >= n) continue;
      const tileX = ((startTileX + i) % n + n) % n;
      tiles.push({
        x: tileX,
        y: tileY,
        left: i * TILE_SIZE - offsetX,
        top: j * TILE_SIZE - offsetY,
      });
    }
  }
  return tiles;
}

export default function StaticMapPreview({ lat, lng, width = 600, height = 260, zoom = 16, className = '' }) {
  const { t } = useTranslation('delivery');
  const tiles = useMemo(
    () => buildTileGrid({ lat, lng, zoom, width, height }),
    [lat, lng, zoom, width, height]
  );

  return (
    <div
      className={`relative overflow-hidden rounded-lb-sm border border-lb-line-1 bg-lb-surface-grey ${className}`}
      style={{ width: '100%', maxWidth: width, height }}
    >
      {tiles.map((tile) => (
        <img
          key={`${tile.x}-${tile.y}`}
          src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`}
          alt=""
          draggable={false}
          style={{ position: 'absolute', left: tile.left, top: tile.top, width: TILE_SIZE, height: TILE_SIZE }}
        />
      ))}
      <MapPin
        size={32}
        fill="#006BFF"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        className="absolute"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -100%)', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.35))' }}
        aria-hidden="true"
      />
      <span className="absolute right-1 bottom-0.5 text-[9px] font-lb text-lb-on-surface-2 bg-white/70 px-1 rounded-sm">
        {t('map.attribution')}
      </span>
    </div>
  );
}
