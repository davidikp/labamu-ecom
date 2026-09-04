import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchProductById, fetchCategories, fetchProductModifiers, saveWebsiteVisibility, saveFragileHandling, applyBulkEdits } from '../services/catalogService';
import { useSnackbar } from '../contexts/SnackbarContext';
import Button from '../components/ui/Button';
import { Breadcrumbs, StatusBadge, Infobox } from '../ce-ui';
import { ToggleCard, DeliveryPropertiesModal, HowToCalculateSizeModal } from '../components/catalog/DeliveryCards';
import ImagePlaceholder from '../components/catalog/ImagePlaceholder';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(val) {
  if (val == null) return '-';
  const n = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  return `IDR ${n}`;
}

// ─── Loading state ────────────────────────────────────────────────────────────
function LoadingState() {
  const bar = (w, h = '14px') => (
    <div style={{ height: h, width: w, background: '#E9E9E9', borderRadius: '6px', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
  );
  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px' }}>
      <div style={{ width: '280px', flexShrink: 0 }}>
        <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', background: '#E9E9E9', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
        {bar('28%', '20px')}
        {bar('72%', '28px')}
        {bar('40%', '14px')}
        {bar('30%', '20px')}
        {[0,1,2,3,4].map(i => <div key={i} style={{ display: 'flex', gap: '16px' }}>{bar('30%')}{bar('50%')}</div>)}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [imgError, setImgError]       = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isToggling, setIsToggling]   = useState(false);
  const [isFragile, setIsFragile]     = useState(false);
  const [isFragileSaving, setIsFragileSaving] = useState(false);
  const [deliveryModal, setDeliveryModal] = useState('none'); // 'none' | 'edit'
  const [showSizeInfo, setShowSizeInfo] = useState(false);
  const [modifiers, setModifiers] = useState([]);
  const [delivery, setDelivery]       = useState({ weight: '', length: '', width: '', height: '' });

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null); setImgError(false); setActiveImage(0);
      try {
        const res = await fetchProductById(id);
        setProduct(res.data);
        setIsFragile(!!res.data?.fragile);
        fetchProductModifiers(id)
          .then(m => setModifiers(m.data || []))
          .catch(() => setModifiers([]));
        setDelivery({
          weight: res.data?.gross_weight != null ? String(res.data.gross_weight) : '',
          length: res.data?.length != null ? String(res.data.length) : '',
          width:  res.data?.width != null ? String(res.data.width) : '',
          height: res.data?.height != null ? String(res.data.height) : '',
        });
        if (res.data?.category_id) {
          const catRes = await fetchCategories({ status: 'ACTIVE', size: 100 });
          const cat = (catRes.data || []).find(c => c.id === res.data.category_id);
          setCategoryName(cat?.name || res.data.category_id || '');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleTogglePublish() {
    if (isToggling || !product) return;
    const newVisible = product.platform_status !== 'published';
    const prev = product.platform_status;
    setProduct(p => ({ ...p, platform_status: newVisible ? 'published' : 'draft' }));
    setIsToggling(true);
    try {
      await saveWebsiteVisibility('catalog', product.id, newVisible);
      showSnackbar(newVisible ? t('catalog:products.shown') : t('catalog:products.hidden'), 'grey');
    } catch {
      setProduct(p => ({ ...p, platform_status: prev }));
      showSnackbar(t('catalog:common.failedChangeVisibility'), 'red');
    } finally {
      setIsToggling(false);
    }
  }

  async function handleToggleFragile() {
    if (isFragileSaving || !product) return;
    const newFragile = !isFragile;
    setIsFragile(newFragile);
    setIsFragileSaving(true);
    try {
      await saveFragileHandling('catalog', product.id, newFragile);
      showSnackbar(newFragile ? t('catalog:products.fragileEnabled') : t('catalog:products.fragileDisabled'), 'grey');
    } catch {
      setIsFragile(!newFragile);
      showSnackbar(t('catalog:common.failedChangeFragile'), 'red');
    } finally {
      setIsFragileSaving(false);
    }
  }

  const images = product?.image_attached || [];
  const activeUrl = images[activeImage]?.document_public_url || images[activeImage]?.url || '';
  const isPublished = product?.platform_status === 'published';
  const modifierCount = modifiers.length;
  const modifierLabel = modifierCount === 1 ? modifiers[0].name : `${modifierCount} Connected`;
  const isDeliveryEligible = !!(delivery.weight && delivery.length && delivery.width && delivery.height);
  const volume = (delivery.length && delivery.width && delivery.height)
    ? `${delivery.length} x ${delivery.width} x ${delivery.height} cm`
    : null;

  function handleSaveDelivery(draft) {
    setDelivery(draft);
    const weight = draft.weight === '' ? null : Number(draft.weight);
    const length = draft.length === '' ? null : Number(draft.length);
    const width  = draft.width  === '' ? null : Number(draft.width);
    const height = draft.height === '' ? null : Number(draft.height);
    setProduct(p => p ? { ...p, gross_weight: weight, length, width, height } : p);
    applyBulkEdits('catalog', [{ id: product.id, gross_weight: weight, weight, length, width, height }]);
    setDeliveryModal('none');
    showSnackbar(t('catalog:delivery.updated'), 'success');
  }

  return (
    <div style={{ padding: '24px', background: '#F4F4F4', fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        @keyframes skeleton-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes loading-dot { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1); opacity:1; } }
      `}</style>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
        <Breadcrumbs
          title={t('catalog:products.detailTitle')}
          breadcrumbs={[{ name: t('catalog:common.catalogLabel'), onClick: () => navigate('/catalog') }]}
          onBack={() => navigate('/catalog')}
        />

        {/* Edit Delivery Properties button */}
        {!loading && product && (
          <Button
            variant="secondary"
            size="small"
            onClick={() => setDeliveryModal('edit')}
          >
            {t('catalog:delivery.editButton')}
          </Button>
        )}

      </div>

      {/* ── Error state ───────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '64px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: '16px', color: '#D0021B' }}>{t('catalog:products.failedToLoad')}</p>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#7E7E7E' }}>{error}</p>
          <button onClick={() => navigate('/catalog')} style={{
            border: 'none', background: 'none', color: '#006BFF', cursor: 'pointer', fontSize: '14px', fontFamily: "'Lato', sans-serif",
          }}>{t('catalog:products.backToCatalog')}</button>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      {!error && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

          {/* Left column: main card */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', overflow: 'hidden' }}>
              {loading ? <LoadingState /> : !product ? (
                <div style={{ padding: '64px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '16px', color: '#7E7E7E' }}>{t('catalog:products.notFound')}</p>
                  <button onClick={() => navigate('/catalog')} style={{ border: 'none', background: 'none', color: '#006BFF', cursor: 'pointer', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}>{t('catalog:products.backToCatalog')}</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '24px', padding: '20px' }}>

                  {/* Image gallery */}
                  <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Main image */}
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden', background: '#F4F4F4' }}>
                      {!imgError && activeUrl ? (
                        <img src={activeUrl} alt={product.name} onError={() => setImgError(true)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <ImagePlaceholder size="100%" radius={14} />
                      )}
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {images.map((img, i) => {
                          const thumb = img.document_public_url || img.url || '';
                          return (
                            <div key={i} onClick={() => { setActiveImage(i); setImgError(false); }}
                              style={{
                                width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden',
                                border: activeImage === i ? '2px solid #A9A9A9' : '1px solid #F4F4F4',
                                cursor: 'pointer', background: '#F4F4F4', flexShrink: 0,
                              }}>
                              <img src={thumb} alt={`${product.name} ${i + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: activeImage === i ? 0.5 : 0.9 }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Category chip + meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {categoryName && (
                        <span style={{
                          background: '#F4F4F4', borderRadius: '8px', padding: '4px 12px',
                          fontSize: '14px', fontWeight: 700, color: '#282828',
                          fontFamily: "'Lato', sans-serif", whiteSpace: 'nowrap',
                        }}>
                          {categoryName}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.18px', lineHeight: 1.3 }}>
                      {product.name}
                    </h2>

                    {/* Price */}
                    <p style={{ margin: 0, fontSize: '16px', color: '#282828', fontFamily: "'Lato', sans-serif", lineHeight: '22px', letterSpacing: '0.11px' }}>
                      {formatPrice(product.selling_price ?? product.price)}
                    </p>

                    {/* Modifier */}
                    <div
                      onClick={modifierCount > 0 ? () => navigate(`/catalog/${product.id}/modifiers`) : undefined}
                      style={{
                        marginTop: 'auto', width: '100%', background: '#FFFFFF', border: '1px solid #E9E9E9',
                        borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column',
                        gap: '4px', cursor: modifierCount > 0 ? 'pointer' : 'default',
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '12px', color: '#A9A9A9', fontFamily: "'Lato', sans-serif", letterSpacing: '0.0825px' }}>
                        {t('catalog:products.modifierLabel')}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: modifierCount > 0 ? '#006BFF' : '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.096px' }}>
                        {modifierCount > 0 ? modifierLabel : '-'}
                      </p>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* E-Commerce Delivery — separate card */}
            {!loading && product && (
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <p style={{ margin: 0, flex: 1, fontSize: '14px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.096px' }}>
                    {t('catalog:delivery.title')}
                  </p>
                  <StatusBadge tone="soft" color={isDeliveryEligible ? 'blue' : 'red'} label={isDeliveryEligible ? t('catalog:delivery.eligible') : t('catalog:delivery.pickupOnly')} />
                </div>
                {!isDeliveryEligible && (
                  <Infobox variant="info" message={t('catalog:delivery.addWeightVolumeInfo')} />
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E', fontFamily: "'Lato', sans-serif", letterSpacing: '0.096px' }}>{t('catalog:delivery.totalWeightLabel')}</p>
                    <p style={{ margin: 0, fontSize: '16px', color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.11px' }}>
                      {delivery.weight ? `${delivery.weight} gr` : '-'}
                    </p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E', fontFamily: "'Lato', sans-serif", letterSpacing: '0.096px' }}>{t('catalog:common.volumeLabel')}</p>
                    <p style={{ margin: 0, fontSize: '16px', color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.11px' }}>
                      {volume || '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column: publish controls */}
          <div style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Show on Website toggle card */}
            {!loading && product && (
              <ToggleCard
                title={t('catalog:common.showOnWebsiteTitle')}
                subtitle={t('catalog:products.showOnWebsiteDesc')}
                on={isPublished}
                onClick={handleTogglePublish}
                loading={isToggling}
              />
            )}

            {/* Fragile Handling toggle card (UI-only, not yet wired to backend) */}
            {!loading && product && (
              <ToggleCard
                title={t('catalog:common.fragileHandlingTitle')}
                subtitle={t('catalog:products.fragileHandlingDesc')}
                on={isFragile}
                onClick={handleToggleFragile}
                loading={isFragileSaving}
              />
            )}

            {/* Loading skeleton for right panel */}
            {loading && [0, 1].map(i => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E9E9E9', borderRadius: '12px', padding: '16px', height: '80px', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>

        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {deliveryModal === 'edit' && (
        <DeliveryPropertiesModal
          initial={delivery}
          onClose={() => setDeliveryModal('none')}
          onSave={handleSaveDelivery}
          onLearnMore={() => setShowSizeInfo(true)}
        />
      )}
      {showSizeInfo && (
        <HowToCalculateSizeModal onClose={() => setShowSizeInfo(false)} />
      )}
    </div>
  );
}
