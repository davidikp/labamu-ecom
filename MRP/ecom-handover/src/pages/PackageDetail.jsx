import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchPackageById, saveWebsiteVisibility, saveFragileHandling, applyBulkEdits } from '../services/catalogService';
import { useSnackbar } from '../contexts/SnackbarContext';
import Button from '../components/ui/Button';
import { Breadcrumbs, StatusBadge, Infobox } from '../ce-ui';
import { ToggleCard, DeliveryPropertiesModal, HowToCalculateSizeModal } from '../components/catalog/DeliveryCards';
import ImagePlaceholder from '../components/catalog/ImagePlaceholder';

function formatPrice(val) {
  if (val == null) return '-';
  return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
}


export default function PackageDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [pkg, setPkg]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isFragile, setIsFragile] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isFragileSaving, setIsFragileSaving] = useState(false);
  const [deliveryModal, setDeliveryModal] = useState('none'); // 'none' | 'edit'
  const [showSizeInfo, setShowSizeInfo] = useState(false);
  const [delivery, setDelivery] = useState({ weight: '', length: '', width: '', height: '' });

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null); setActiveImage(0);
      try {
        const res = await fetchPackageById(id);
        setPkg(res.data);
        setIsFragile(!!res.data?.fragile);
        setDelivery({
          weight: res.data?.gross_weight != null ? String(res.data.gross_weight) : '',
          length: res.data?.length != null ? String(res.data.length) : '',
          width:  res.data?.width != null ? String(res.data.width) : '',
          height: res.data?.height != null ? String(res.data.height) : '',
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleTogglePublish() {
    if (isToggling || !pkg) return;
    const newVisible = pkg.platform_status !== 'published';
    const prev = pkg.platform_status;
    setPkg(p => ({ ...p, platform_status: newVisible ? 'published' : 'draft' }));
    setIsToggling(true);
    try {
      await saveWebsiteVisibility('package', pkg.id, newVisible);
      showSnackbar(newVisible ? t('catalog:packages.shown') : t('catalog:packages.hidden'), 'grey');
    } catch {
      setPkg(p => ({ ...p, platform_status: prev }));
      showSnackbar(t('catalog:common.failedChangeVisibility'), 'red');
    } finally {
      setIsToggling(false);
    }
  }

  async function handleToggleFragile() {
    if (isFragileSaving || !pkg) return;
    const newFragile = !isFragile;
    setIsFragile(newFragile);
    setIsFragileSaving(true);
    try {
      await saveFragileHandling('package', pkg.id, newFragile);
      showSnackbar(newFragile ? t('catalog:packages.fragileEnabled') : t('catalog:packages.fragileDisabled'), 'grey');
    } catch {
      setIsFragile(!newFragile);
      showSnackbar(t('catalog:common.failedChangeFragile'), 'red');
    } finally {
      setIsFragileSaving(false);
    }
  }

  function handleSaveDelivery(draft) {
    setDelivery(draft);
    const gross_weight = draft.weight === '' ? null : Number(draft.weight);
    const length = draft.length === '' ? null : Number(draft.length);
    const width  = draft.width  === '' ? null : Number(draft.width);
    const height = draft.height === '' ? null : Number(draft.height);
    setPkg(p => p ? { ...p, gross_weight, length, width, height } : p);
    applyBulkEdits('package', [{ id: pkg.id, gross_weight, length, width, height }]);
    setDeliveryModal('none');
    showSnackbar(t('catalog:delivery.updated'), 'success');
  }

  const images = pkg?.image_attached || [];
  const isPublished = pkg?.platform_status === 'published';
  const isDeliveryEligible = !!(delivery.weight && delivery.length && delivery.width && delivery.height);
  const volume = (delivery.length && delivery.width && delivery.height)
    ? `${delivery.length} x ${delivery.width} x ${delivery.height} cm` : null;

  return (
    <div style={{ padding: '24px', background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <style>{`@keyframes skeleton-pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
        <Breadcrumbs
          title={t('catalog:packages.detailTitle')}
          breadcrumbs={[{ name: t('catalog:common.catalogLabel'), onClick: () => navigate('/catalog/package') }]}
          onBack={() => navigate('/catalog/package')}
        />
        {!loading && pkg && (
          <Button variant="secondary" size="small" onClick={() => setDeliveryModal('edit')}>{t('catalog:delivery.editButton')}</Button>
        )}
      </div>

      {error && !loading && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '64px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: '16px', color: '#D0021B' }}>{t('catalog:packages.failedToLoadSingle')}</p>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#7E7E7E' }}>{error}</p>
        </div>
      )}

      {!error && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

          {/* Left: image gallery */}
          <div style={{ width: '320px', flexShrink: 0, background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '20px' }}>
            {loading ? (
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: '14px', background: '#E9E9E9', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden' }}>
                  {images[activeImage]?.document_public_url
                    ? <img src={images[activeImage].document_public_url} alt={pkg?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <ImagePlaceholder size="100%" radius={14} />}
                </div>
                {/* Thumbnail selector — only when there is more than one image */}
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {images.map((img, i) => (
                      <div key={i} onClick={() => setActiveImage(i)} style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: activeImage === i ? '2px solid #A9A9A9' : '1px solid #F4F4F4', flexShrink: 0 }}>
                        <img src={img.document_public_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: activeImage === i ? 0.6 : 1 }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: info + delivery + catalog list */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Info card */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['40%','25%','30%'].map((w, i) => <div key={i} style={{ height: '20px', width: w, background: '#E9E9E9', borderRadius: '6px', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />)}
                </div>
              ) : pkg ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828', letterSpacing: '0.18px' }}>{pkg.name}</h2>
                    <p style={{ margin: 0, fontSize: '16px', color: '#282828', letterSpacing: '0.11px' }}>{formatPrice(pkg.selling_price)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#7E7E7E' }}>
                      <span>{t('catalog:packages.sku')} <span style={{ color: '#282828' }}>{pkg.sku}</span></span>
                      <span style={{ color: '#E9E9E9' }}>|</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7E7E7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        <span style={{ color: '#282828', fontWeight: 700 }}>{t('catalog:packages.soldTimes', { count: pkg.sold_count })}</span>
                      </span>
                    </div>
                  </div>
                  <div style={{ height: '1px', background: '#E9E9E9' }} />
                  <ToggleCard bordered={false} title={t('catalog:common.showOnWebsiteTitle')}
                    subtitle={t('catalog:packages.showOnWebsiteDesc')}
                    on={isPublished} onClick={handleTogglePublish} loading={isToggling} />
                  <div style={{ height: '1px', background: '#E9E9E9' }} />
                  <ToggleCard bordered={false} title={t('catalog:common.fragileHandlingTitle')}
                    subtitle={t('catalog:packages.fragileHandlingDesc')}
                    on={isFragile} onClick={handleToggleFragile} loading={isFragileSaving} />
                </>
              ) : (
                <p style={{ margin: 0, fontSize: '16px', color: '#7E7E7E' }}>{t('catalog:packages.notFound')}</p>
              )}
            </div>

            {/* E-Commerce Delivery */}
            {!loading && pkg && (
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <p style={{ margin: 0, flex: 1, fontSize: '14px', fontWeight: 700, color: '#282828', letterSpacing: '0.096px' }}>{t('catalog:delivery.title')}</p>
                  <StatusBadge tone="soft" color={isDeliveryEligible ? 'blue' : 'red'} label={isDeliveryEligible ? t('catalog:delivery.eligible') : t('catalog:delivery.pickupOnly')} />
                </div>
                {!isDeliveryEligible && (
                  <Infobox variant="info" message={t('catalog:delivery.addWeightVolumeInfo')} />
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E', letterSpacing: '0.096px' }}>{t('catalog:delivery.totalWeightLabel')}</p>
                    <p style={{ margin: 0, fontSize: '16px', color: '#282828', letterSpacing: '0.11px' }}>{delivery.weight ? `${delivery.weight} gr` : '-'}</p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E', letterSpacing: '0.096px' }}>{t('catalog:common.volumeLabel')}</p>
                    <p style={{ margin: 0, fontSize: '16px', color: '#282828', letterSpacing: '0.11px' }}>{volume || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog List (package contents) */}
            {!loading && pkg?.catalog_items?.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#282828', letterSpacing: '0.096px' }}>{t('catalog:packages.catalogListTitle')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pkg.catalog_items.map(item => {
                    const dim = item.out_of_stock ? '#A9A9A9' : '#282828';
                    return (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ImagePlaceholder size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#7E7E7E' }}>{item.qty}x {formatPrice(item.price)}</p>
                        </div>
                        {item.out_of_stock && (
                          <span style={{ fontSize: '12px', color: '#A9A9A9', fontWeight: 700, whiteSpace: 'nowrap' }}>{t('catalog:packages.outOfStock')}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {deliveryModal === 'edit' && (
        <DeliveryPropertiesModal
          initial={delivery}
          onClose={() => setDeliveryModal('none')}
          onSave={handleSaveDelivery}
          onLearnMore={() => setShowSizeInfo(true)}
        />
      )}
      {showSizeInfo && <HowToCalculateSizeModal onClose={() => setShowSizeInfo(false)} />}
    </div>
  );
}
