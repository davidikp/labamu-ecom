import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const MAX_W = 302;
const MAX_H = 350;
const MIN_FACTOR = 0.3; // smallest the crop box can be = 30% of max

function getDisplaySize(imageAR) {
  const byWidth = [MAX_W, MAX_W / imageAR];
  if (byWidth[1] <= MAX_H) return { dw: MAX_W, dh: Math.round(MAX_W / imageAR) };
  return { dw: Math.round(MAX_H * imageAR), dh: MAX_H };
}

// Maximum crop-box dimensions that fit inside the display at the target ratio.
function getMaxCropBox(ar, dw, dh) {
  if (dw / ar <= dh) return { maxW: dw, maxH: dw / ar };
  return { maxW: dh * ar, maxH: dh };
}

const PhotoIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="#9CA3AF" stroke="none" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// L-shaped corner brackets drawn inside the crop box.
const CornerBrackets = () => {
  const L = 14, T = 3, C = '#006BFF';
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: L, height: T, background: C }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: T, height: L, background: C }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: L, height: T, background: C }} />
      <div style={{ position: 'absolute', top: 0, right: 0, width: T, height: L, background: C }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: L, height: T, background: C }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: T, height: L, background: C }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: L, height: T, background: C }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: T, height: L, background: C }} />
    </>
  );
};

export default function ImageCropModal({
  imageSrc,
  aspectRatio = 216 / 68.77,
  title,
  subtitle,
  onSave,
  onClose,
}) {
  const { t } = useTranslation('common');
  const resolvedTitle = title ?? t('imageCropModal.defaultTitle');
  const resolvedSubtitle = subtitle ?? t('imageCropModal.defaultSubtitle');
  const imgRef = useRef(null);
  // dragRef: tracks the active drag gesture
  const dragRef = useRef({ on: false, sx: 0, sy: 0, sp: { x: 0, y: 0 } });
  // liveRef: always-fresh layout values for the mousemove closure
  const liveRef = useRef({ cropW: MAX_W, cropH: 50, dw: MAX_W, dh: MAX_H });

  const [nat, setNat] = useState({ w: 1, h: 1 });
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 }); // top-left of crop box in display coords
  const [zoom, setZoom] = useState(100); // 100 = largest crop box
  const [dragging, setDragging] = useState(false);

  // --- Derived layout ---
  const imageAR = nat.w / (nat.h || 1);
  const { dw, dh } = getDisplaySize(imageAR);
  const { maxW, maxH } = getMaxCropBox(aspectRatio, dw, dh);

  // Zoom slider: right (100) = large crop box, left (0) = small (zoomed-in selection)
  const factor = MIN_FACTOR + (zoom / 100) * (1 - MIN_FACTOR);
  const cropW = maxW * factor;
  const cropH = maxH * factor;

  // Clamp crop box so it stays within the display
  const px = Math.max(0, Math.min(dw - cropW, cropPos.x));
  const py = Math.max(0, Math.min(dh - cropH, cropPos.y));

  // Keep liveRef current so the once-mounted mousemove handler sees fresh values
  liveRef.current = { cropW, cropH, dw, dh };

  // --- Image rendering (static, fills the display container) ---
  const imgScale = Math.min(dw / (nat.w || 1), dh / (nat.h || 1));
  const sw = (nat.w || 1) * imgScale;
  const sh = (nat.h || 1) * imgScale;
  const il = (dw - sw) / 2; // horizontal offset (usually 0 since AR is matched)
  const it = (dh - sh) / 2; // vertical offset

  // Centre the crop box when a new image loads
  useEffect(() => {
    if (nat.w === 1 && nat.h === 1) return;
    const ar = nat.w / nat.h;
    const { dw: _dw, dh: _dh } = getDisplaySize(ar);
    const { maxW: mw, maxH: mh } = getMaxCropBox(aspectRatio, _dw, _dh);
    setZoom(100);
    setCropPos({ x: Math.max(0, (_dw - mw) / 2), y: Math.max(0, (_dh - mh) / 2) });
  }, [nat, aspectRatio]);

  // Global mouse handlers (attached once) — read fresh values via liveRef
  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.on) return;
      const { sx, sy, sp } = dragRef.current;
      const { cropW: cw, cropH: ch, dw: w, dh: h } = liveRef.current;
      setCropPos({
        x: Math.max(0, Math.min(w - cw, sp.x + e.clientX - sx)),
        y: Math.max(0, Math.min(h - ch, sp.y + e.clientY - sy)),
      });
    };
    const onUp = () => { dragRef.current.on = false; setDragging(false); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const onImgLoad = (e) => {
    setNat({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  };

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    const outW = 1440;
    const outH = Math.round(outW / aspectRatio);
    canvas.width = outW;
    canvas.height = outH;
    // Map display crop-box position → natural image coordinates
    const toNatX = nat.w / sw;
    const toNatY = nat.h / sh;
    canvas.getContext('2d').drawImage(
      imgRef.current,
      (px - il) * toNatX, (py - it) * toNatY,
      cropW * toNatX,     cropH * toNatY,
      0, 0, outW, outH
    );
    onSave(canvas.toDataURL('image/jpeg', 0.92));
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', width: MAX_W + 48, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative', fontFamily: "'Lato', sans-serif" }}>

        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
          onMouseOver={e => e.currentTarget.style.color = '#6B7280'}
          onMouseOut={e => e.currentTarget.style.color = '#9CA3AF'}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', textAlign: 'center', margin: '0 0 6px' }}>{resolvedTitle}</h2>
        <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', margin: '0 0 16px', lineHeight: 1.5 }}>{resolvedSubtitle}</p>

        {/* Display area: image is STATIC, crop box MOVES */}
        <div style={{ width: dw, height: dh, position: 'relative', overflow: 'hidden', background: '#4A4A4A', borderRadius: 8, userSelect: 'none', margin: '0 auto' }}>

          {/* Static image */}
          <img
            ref={imgRef}
            src={imageSrc}
            onLoad={onImgLoad}
            draggable={false}
            style={{ position: 'absolute', width: sw, height: sh, left: il, top: it, pointerEvents: 'none', display: 'block' }}
          />

          {/* Dim overlays — 4 rects surrounding the crop box */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: py, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: py + cropH, bottom: 0, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: py, left: 0, width: px, height: cropH, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: py, left: px + cropW, right: 0, height: cropH, background: 'rgba(0,0,0,0.45)', pointerEvents: 'none' }} />

          {/* Draggable crop box */}
          <div
            style={{ position: 'absolute', left: px, top: py, width: cropW, height: cropH, border: '2px solid #006BFF', borderRadius: 6, boxSizing: 'border-box', cursor: dragging ? 'grabbing' : 'move' }}
            onMouseDown={e => {
              e.preventDefault();
              dragRef.current = { on: true, sx: e.clientX, sy: e.clientY, sp: { x: px, y: py } };
              setDragging(true);
            }}
          >
            <CornerBrackets />
          </div>
        </div>

        {/* Slider: left = smaller crop (zoom in), right = larger crop (zoom out) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
          <PhotoIcon size={16} />
          <input
            type="range" min={0} max={100} value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#006BFF', cursor: 'pointer' }}
          />
          <PhotoIcon size={22} />
        </div>

        <button
          onClick={handleSave}
          style={{ width: '100%', padding: 13, background: '#006BFF', color: '#FFF', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Lato', sans-serif" }}
          onMouseOver={e => e.currentTarget.style.background = '#0057E0'}
          onMouseOut={e => e.currentTarget.style.background = '#006BFF'}
        >
          {t('action.save')}
        </button>
      </div>
    </div>
  );
}
