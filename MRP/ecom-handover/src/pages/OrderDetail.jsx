import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Copy, MessageCircle, Check, Printer } from 'lucide-react';
import { fetchOrderById, advanceOrderStatus, confirmDeliveryBooking, simulateNoDriverFound } from '../services/orderService';
import { useSnackbar } from '../contexts/SnackbarContext';
import Button from '../components/ui/Button';
import PlaceOrderModal from '../components/orders/PlaceOrderModal';
import { Breadcrumbs, StatusBadge, Popup } from '../ce-ui';

function formatPrice(val) {
  if (val == null) return '-';
  return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
}

function formatIDR(val) {
  return `IDR ${new Intl.NumberFormat('id-ID').format(val)}`;
}

function feeItemLabel(t, item) {
  if (item.kind === 'base') return t('orders:detail.deliveryFee');
  if (item.kind === 'toll') return t(`orders:placeOrder.toll.${item.key}`);
  return t(`orders:placeOrder.services.${item.key}`);
}

function maskPhone(phone) {
  if (!phone) return phone;
  const prefixLen = (phone.startsWith('+') ? 1 : 0) + 4;
  const visibleStart = phone.slice(0, prefixLen);
  const visibleEnd = phone.slice(-3);
  const maskedLen = Math.max(phone.length - prefixLen - 3, 0);
  return visibleStart + '*'.repeat(maskedLen) + visibleEnd;
}

const ORDER_STATUS_BADGE = {
  'In Progress': { color: 'orange', tone: 'soft' },
  Completed: { color: 'green', tone: 'soft' },
  Cancelled: { color: 'red', tone: 'soft' },
};

const STATUS_LABEL_KEYS = {
  'In Progress': 'orders:detail.status.inProgress',
  Completed: 'orders:detail.status.completed',
  Cancelled: 'orders:detail.status.cancelled',
};

const STEP_LABEL_KEYS = {
  'Order in Process': 'orders:detail.steps.orderInProcess',
  'Waiting for Pickup': 'orders:detail.steps.waitingForPickup',
  'On Delivery': 'orders:detail.steps.onDelivery',
  'Order Delivered': 'orders:detail.steps.orderDelivered',
  'Waiting to be Collected': 'orders:detail.steps.waitingToBeCollected',
  'Order Collected': 'orders:detail.steps.orderCollected',
};

function translateStep(t, step) {
  return STEP_LABEL_KEYS[step] ? t(STEP_LABEL_KEYS[step]) : step;
}

function Stepper({ steps, activeIndex, failed }) {
  const n = steps.length;
  const inset = 50 / n; // % offset from each edge to the first/last circle's center
  const trackWidth = 100 - inset * 2; // % width spanning first circle center to last circle center
  const progress = n > 1 ? trackWidth * (activeIndex / (n - 1)) : 0;
  const CIRCLE_ROW_HEIGHT = 24;
  const activeColor = failed ? '#D0021B' : '#006BFF';
  const doneColor = failed ? '#D0021B' : '#16A34A';

  return (
    <div style={{ padding: '4px 4px 8px' }}>
      <div style={{ position: 'relative', width: '100%', height: `${CIRCLE_ROW_HEIGHT}px` }}>
        <div style={{
          position: 'absolute', top: '50%', left: `${inset}%`, width: `${trackWidth}%`, height: '3px',
          borderRadius: '2px', background: '#E5E7EB', transform: 'translateY(-50%)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: `${inset}%`, width: `${progress}%`, height: '3px',
          borderRadius: '2px', background: doneColor, transform: 'translateY(-50%)', transition: 'width 0.25s ease',
        }} />
        <div style={{ position: 'relative', display: 'flex', width: '100%', height: '100%' }}>
          {steps.map((label, i) => {
            const isActive = i === activeIndex;
            const isDone = i < activeIndex;
            return (
              <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: isActive ? '22px' : '20px',
                  height: isActive ? '22px' : '20px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${isActive ? activeColor : isDone ? doneColor : '#D4D4D4'}`,
                  background: isDone ? doneColor : '#FFFFFF',
                  boxShadow: isActive ? `0 0 0 4px ${failed ? 'rgba(208,2,27,0.15)' : 'rgba(0,107,255,0.15)'}` : 'none',
                  transition: 'all 0.25s ease',
                }}>
                  {isDone && <Check size={12} strokeWidth={3} color="#FFFFFF" />}
                  {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeColor }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', width: '100%', marginTop: '10px' }}>
        {steps.map((label, i) => {
          const isActive = i === activeIndex;
          const isDone = i < activeIndex;
          return (
            <span key={label} style={{
              flex: 1, fontSize: '13px', lineHeight: '17px', textAlign: 'center',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? activeColor : isDone ? '#282828' : '#9CA3AF',
            }}>{label}</span>
          );
        })}
      </div>
    </div>
  );
}

function InfoRow({ label, value, dense }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: dense ? 0 : '10px 0' }}>
      <span style={{ fontSize: '14px', color: '#7E7E7E' }}>{label}</span>
      <span style={{ fontSize: '14px', color: '#282828', fontWeight: 500 }}>{value ?? '-'}</span>
    </div>
  );
}

export default function OrderDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // null | 'markReady' | 'confirmPickup'
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(4);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await fetchOrderById(id);
        if (alive) setOrder(res.data);
      } catch (e) {
        if (alive) setError(e.message || t('orders:detail.failedToLoad'));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [id]);

  // Once a Delivery order's courier is booked, the rest of the flow advances
  // on its own every 4s instead of requiring a "Mark as ..." click for every
  // step. Pickup orders stay fully manual (merchant confirms each step).
  // Ticks every 1s so the countdown shown in the header stays in sync with
  // the actual advance call. The remaining-seconds count lives in a ref (not
  // a setState updater) so React StrictMode's double-invoke of updater
  // functions can't call advanceOrderStatus twice and skip a step.
  const autoAdvanceRemainingRef = useRef(4);
  useEffect(() => {
    if (!order || order.order_type !== 'Delivery') return;
    const done = order.step_index === order.steps.length - 1;
    const isFirstStep = order.step_index === 0;
    if (done || order.no_driver_found || isFirstStep) return;
    autoAdvanceRemainingRef.current = 4;
    setAutoAdvanceCountdown(4);
    const tick = setInterval(() => {
      autoAdvanceRemainingRef.current -= 1;
      if (autoAdvanceRemainingRef.current <= 0) {
        clearInterval(tick);
        advanceOrderStatus(order.id).then(res => setOrder(res.data));
      } else {
        setAutoAdvanceCountdown(autoAdvanceRemainingRef.current);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [order?.id, order?.order_type, order?.step_index, order?.no_driver_found, order?.steps?.length]);

  async function runAdvance() {
    setAdvancing(true);
    try {
      const res = await advanceOrderStatus(order.id);
      setOrder(res.data);
    } catch {
      showSnackbar(t('orders:detail.failedToAdvance'), 'red');
    } finally {
      setAdvancing(false);
    }
  }

  async function handleSimulateNoDriver() {
    if (advancing || !order) return;
    setAdvancing(true);
    try {
      const res = await simulateNoDriverFound(order.id);
      setOrder(res.data);
      showSnackbar(t('orders:detail.noDriverFoundNotice'), 'red');
    } catch {
      showSnackbar(t('orders:detail.failedToAdvance'), 'red');
    } finally {
      setAdvancing(false);
    }
  }

  function handleAdvance() {
    if (advancing || !order) return;
    if (order.order_type === 'Delivery' && (order.step_index === 0 || order.no_driver_found)) {
      setShowPlaceOrderModal(true);
      return;
    }
    if (order.order_type === 'Pickup') {
      setConfirmAction(order.step_index === 0 ? 'markReady' : 'confirmPickup');
      return;
    }
    runAdvance();
  }

  async function handleConfirmAction() {
    const wasConfirmingPickup = confirmAction === 'confirmPickup';
    setConfirmAction(null);
    await runAdvance();
    if (wasConfirmingPickup) {
      showSnackbar(t('orders:detail.pickupConfirmedSuccess'), 'green');
    }
  }

  async function handlePlaceOrderSubmit(bookingDetails) {
    setShowPlaceOrderModal(false);
    setAdvancing(true);
    try {
      const res = await confirmDeliveryBooking(order.id, bookingDetails);
      setOrder(res.data);
      showSnackbar(t('orders:detail.orderPlacedSuccess'), 'green');
    } catch {
      showSnackbar(t('orders:detail.failedToAdvance'), 'red');
    } finally {
      setAdvancing(false);
    }
  }

  function handleCopyOrderId() {
    if (!order) return;
    navigator.clipboard?.writeText(order.order_id);
    showSnackbar(t('orders:detail.orderIdCopied'), 'grey');
  }

  function handlePrintShippingLabel() {
    showSnackbar(t('orders:detail.shippingLabelDownloaded'), 'grey');
  }

  function handleTrackOrder() {
    showSnackbar(t('orders:detail.trackOrderDemo'), 'grey');
  }

  function handleViewProof() {
    showSnackbar(t('orders:detail.documentDemoNotice'), 'grey');
  }

  function handleViewPinpoint() {
    showSnackbar(t('orders:detail.pinpointDemoNotice'), 'grey');
  }

  if (error && !loading) {
    return (
      <div style={{ padding: '24px', background: '#F4F4F4', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '64px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: '16px', color: '#D0021B' }}>{t('orders:detail.failedToLoad')}</p>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#7E7E7E' }}>{error}</p>
        </div>
      </div>
    );
  }

  const isDelivery = order?.order_type === 'Delivery';
  const isCancelled = order?.order_status === 'Cancelled';
  const isNoDriverFound = isDelivery && !!order?.no_driver_found;
  const isDone = order && order.step_index === order.steps.length - 1;
  const actionLabel = isDelivery
    ? (order?.step_index === 0 || isNoDriverFound ? t('orders:detail.placeOrder') : t('orders:detail.nextStep', { step: translateStep(t, order?.steps?.[order.step_index + 1]) || '' }))
    : (order?.step_index === 0 ? t('orders:detail.markAsReady') : t('orders:detail.confirmPickupButton'));
  const displaySteps = (isNoDriverFound
    ? order.steps.map((s, i) => i === order.step_index ? t('orders:detail.noDriverStep') : s)
    : order?.steps
  )?.map(s => translateStep(t, s));
  // Delivery orders auto-advance through the middle steps (Waiting for Pickup,
  // On Delivery) with no merchant action needed, so the footer is hidden then.
  const isAutoAdvancing = order && isDelivery && !isNoDriverFound
    && order.step_index > 0 && order.step_index < order.steps.length - 1;

  return (
    <div style={{ padding: '24px', paddingBottom: '96px', background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <Breadcrumbs
          title={t('orders:detail.pageTitle')}
          breadcrumbs={[{ name: t('orders:list.pageTitle'), onClick: () => navigate('/orders') }]}
          onBack={() => navigate('/orders')}
        />
        {isAutoAdvancing && (
          <span style={{ marginTop: '4px', fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
            {t('orders:detail.autoUpdatingCountdown', { seconds: autoAdvanceCountdown })}
          </span>
        )}
      </div>

      {!error && !loading && order && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          {/* Left card */}
          <div style={{ width: '400px', flexShrink: 0, background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', overflow: 'hidden' }}>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t(isDelivery ? 'orders:detail.deliveryInfo' : 'orders:detail.pickupInfo')}
                </p>
                {isDelivery && order.step_index === 1 && !isNoDriverFound && (
                  <button type="button" onClick={handleSimulateNoDriver} disabled={advancing}
                    onMouseEnter={e => e.currentTarget.style.background = '#F4F4F4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{
                      border: 'none', background: 'transparent', padding: '4px 8px', borderRadius: '6px',
                      fontSize: '12px', fontWeight: 700, color: '#7E7E7E', cursor: advancing ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s', textTransform: 'none', letterSpacing: 0,
                    }}>
                    {t('orders:detail.simulateNoDriver')}
                  </button>
                )}
              </div>
              {!isCancelled && (
                <Stepper steps={displaySteps} activeIndex={order.step_index} failed={isNoDriverFound} />
              )}

              {isDelivery && (
                <div style={{ marginTop: '8px', borderTop: '1px solid #E9E9E9', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <InfoRow dense label={t('orders:detail.fragile')} value={order.fragile === 'Yes' ? t('orders:detail.yes') : order.fragile === 'No' ? t('orders:detail.no') : order.fragile} />
                  <InfoRow dense label={t('orders:detail.courierProvider')} value={order.courier_provider} />
                  <InfoRow dense label={t('orders:detail.trackingCode')} value={order.tracking_code} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#7E7E7E' }}>{t('orders:detail.trackingLink')}</span>
                    {order.tracking_link && order.tracking_link !== '-' ? (
                      <span onClick={handleTrackOrder} style={{ fontSize: '14px', color: '#006BFF', fontWeight: 700, cursor: 'pointer' }}>
                        {t('orders:detail.trackOrder')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '14px', color: '#282828', fontWeight: 500 }}>-</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#7E7E7E' }}>{t('orders:detail.proofOfDelivery')}</span>
                    {order.proof_of_delivery_url ? (
                      <span onClick={handleViewProof} style={{ fontSize: '14px', color: '#006BFF', fontWeight: 700, cursor: 'pointer' }}>
                        {t('orders:detail.viewDocument')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '14px', color: '#282828', fontWeight: 500 }}>-</span>
                    )}
                  </div>
                </div>
              )}

              {!isDelivery && order.pickup_address && (
                <div style={{ marginTop: '8px', borderTop: '1px solid #E9E9E9', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#7E7E7E', flexShrink: 0 }}>{t('orders:detail.pickupAddress')}</span>
                    <span style={{ fontSize: '14px', color: '#282828', fontWeight: 500, textAlign: 'right' }}>{order.pickup_address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#7E7E7E' }}>{t('orders:detail.pinpointAddress')}</span>
                    {order.pickup_pinpoint ? (
                      <span onClick={handleViewPinpoint} style={{ fontSize: '14px', color: '#006BFF', fontWeight: 700, cursor: 'pointer' }}>
                        {t('orders:detail.viewPinpoint')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '14px', color: '#282828', fontWeight: 500 }}>-</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #E9E9E9' }} />

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#7E7E7E' }}>{t('orders:detail.orderInfo')}</span>
                <StatusBadge label={STATUS_LABEL_KEYS[order.order_status] ? t(STATUS_LABEL_KEYS[order.order_status]) : order.order_status} {...(ORDER_STATUS_BADGE[order.order_status] || {})} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#7E7E7E' }}>{t('orders:detail.orderId')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#282828', fontWeight: 500 }}>
                    {order.order_id}
                    <Copy size={14} style={{ cursor: 'pointer', color: '#7E7E7E' }} onClick={handleCopyOrderId} />
                  </span>
                </div>
                <InfoRow dense label={t('orders:detail.orderType')} value={isDelivery ? t('orders:list.delivery') : t('orders:list.pickup')} />
                <InfoRow dense label={t('orders:detail.orderNumber')} value={order.order_number} />
                <InfoRow dense label={t('orders:detail.orderTime')} value={order.order_time} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#7E7E7E' }}>{t('orders:detail.paymentStatus')}</span>
                  <StatusBadge label={order.payment_status === 'Paid' ? t('orders:detail.paid') : order.payment_status} color="green" tone="soft" />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {t('orders:detail.addressedTo')}
                </p>
                <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#282828' }}>{order.addressed_to}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E' }}>{maskPhone(order.customer_phone)} | {order.customer_email}</p>
                {isDelivery && order.customer_address && (
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#7E7E7E', maxWidth: '360px' }}>{order.customer_address}</p>
                )}
                {isDelivery && order.customer_pinpoint && (
                  <span onClick={handleViewPinpoint} style={{ display: 'inline-block', marginTop: '6px', fontSize: '14px', color: '#006BFF', fontWeight: 700, cursor: 'pointer' }}>
                    {t('orders:detail.viewPinpoint')}
                  </span>
                )}
              </div>
              <a href={`https://wa.me/${order.customer_phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer"
                style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="small" leftIcon={<MessageCircle size={16} />}>
                  {t('orders:detail.contactWhatsapp')}
                </Button>
              </a>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700, color: '#282828', borderBottom: '1px solid #D4D4D4' }}>{t('orders:detail.product')}</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 700, color: '#282828', borderBottom: '1px solid #D4D4D4' }}>{t('orders:detail.notes')}</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#282828', borderBottom: '1px solid #D4D4D4' }}>{t('orders:detail.pricePerItem')}</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#282828', borderBottom: '1px solid #D4D4D4' }}>{t('orders:detail.quantity')}</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#282828', borderBottom: '1px solid #D4D4D4' }}>{t('orders:detail.discount')}</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 700, color: '#282828', borderBottom: '1px solid #D4D4D4' }}>{t('orders:detail.totalPrice')}</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, i) => (
                  <tr key={i}>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #F0F0F0', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 500, color: '#282828' }}>{it.product}</div>
                      {it.notes && it.notes !== '-' && (
                        <div style={{ fontSize: '12px', color: '#9CA3AF', whiteSpace: 'pre-line', marginTop: '2px' }}>{it.notes}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #F0F0F0', color: '#7E7E7E' }}>-</td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #F0F0F0', textAlign: 'right' }}>{formatPrice(it.price)}</td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #F0F0F0', textAlign: 'right' }}>{it.quantity}</td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #F0F0F0', textAlign: 'right' }}>{it.discount} %</td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid #F0F0F0', textAlign: 'right', fontWeight: 500 }}>{formatPrice(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#282828' }}>{t('orders:detail.notes')}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E' }}>{order.order_note}</p>
              </div>
              <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#7E7E7E' }}>
                  <span>{t('orders:detail.subtotal')}</span><span>{formatPrice(order.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#7E7E7E' }}>
                  <span>{t('orders:detail.pb1')}</span><span>{formatPrice(order.tax)}</span>
                </div>
                {isDelivery && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#7E7E7E' }}>
                      <span>{t('orders:detail.shippingCost')}</span><span>{formatPrice(order.shipping_cost)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#7E7E7E' }}>
                      <span>{t('orders:detail.deliveryInsurance')}</span><span>{formatPrice(order.delivery_insurance)}</span>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#282828', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E9E9E9' }}>
                  <span>{t('orders:detail.totalTransaction')}</span><span>{formatPrice(order.total_transaction)}</span>
                </div>
              </div>
            </div>
          </div>

          {isDelivery && order.lalamove_booking && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '20px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: '#7E7E7E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t('orders:detail.lalamoveDelivery')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#7E7E7E' }}>{t('orders:detail.pickUpTime')}</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#282828', overflowWrap: 'break-word' }}>{order.lalamove_booking.pickUpTimeLabel}</p>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#7E7E7E' }}>{t('orders:detail.paymentMethod')}</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#282828', overflowWrap: 'break-word' }}>{order.lalamove_booking.paymentMethodLabel}</p>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#7E7E7E' }}>{t('orders:detail.vehicleType')}</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#282828', overflowWrap: 'break-word' }}>{order.lalamove_booking.vehicleTypeLabel}</p>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#7E7E7E' }}>{t('orders:placeOrder.notesToDriver')}</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#282828', overflowWrap: 'break-word' }}>{order.lalamove_booking.notesLabel || '-'}</p>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #E9E9E9', paddingTop: '12px' }}>
                {order.lalamove_booking.feeBreakdown.map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#7E7E7E' }}>
                    <span>{feeItemLabel(t, item)}</span><span>{formatIDR(item.amount)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: '#282828', marginTop: '8px' }}>
                  <span>{t('orders:detail.total')}</span><span>{formatIDR(order.lalamove_booking.total)}</span>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {!error && !loading && order && !isDone && !isCancelled && !isAutoAdvancing && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderTop: '1px solid #E9E9E9', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', zIndex: 10 }}>
          {order.lalamove_booking && !isNoDriverFound && (
            <Button variant="secondary" onClick={handlePrintShippingLabel} leftIcon={<Printer size={16} />}>
              {t('orders:detail.printShippingLabel')}
            </Button>
          )}
          <Button variant="primary" onClick={handleAdvance} disabled={advancing}>
            {actionLabel}
          </Button>
        </div>
      )}

      {showPlaceOrderModal && (
        <PlaceOrderModal
          onClose={() => setShowPlaceOrderModal(false)}
          onSubmit={handlePlaceOrderSubmit}
          forceFragile={order.fragile === 'Yes'}
          customerAddress={order.customer_address}
          customerPaidAmount={order.shipping_cost}
        />
      )}

      {confirmAction && (
        <Popup
          open
          onClose={() => setConfirmAction(null)}
          platform="tablet"
          title={t(confirmAction === 'markReady' ? 'orders:detail.markReadyConfirmTitle' : 'orders:detail.confirmPickupTitle')}
          description={t(confirmAction === 'markReady' ? 'orders:detail.markReadyConfirmDesc' : 'orders:detail.confirmPickupDesc')}
          primaryAction={{
            label: t(confirmAction === 'markReady' ? 'orders:detail.markReadyConfirmYes' : 'orders:detail.confirmPickupYes'),
            onClick: handleConfirmAction,
          }}
          secondaryAction={{ label: t('orders:placeOrder.cancel'), onClick: () => setConfirmAction(null) }}
        />
      )}
    </div>
  );
}
