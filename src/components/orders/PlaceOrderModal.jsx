import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, HelpCircle, Calendar, Check, ArrowRight } from 'lucide-react';
import {
  PICKUP_PROFILE, PAYMENT_METHODS, VEHICLE_TYPES, TOLL_FEE_OPTIONS,
  getServicesForVehicle, computeDeliveryTotal,
} from '../../services/orderService';
import { Popup, Checkbox, TextField, MainBtn } from '../../ce-ui';
// Deep-imported (not part of ce-ui's public index) so the calendar can be given
// a `minDate` — ce-ui's own DateTimePicker doesn't expose that, so past days
// couldn't otherwise be visually greyed out and disabled.
import { CalendarGrid, sameDay } from '../../ce-ui/ui/date-picker';
import lalamoveLogo from '../../assets/delivery/lalamove-logo.png';

const VEHICLE_GUIDE_URL = 'https://www.lalamove.com/id/id-lalamove-vehicle-comparison-en?embed=true';

function formatPrice(val) {
  return `IDR ${new Intl.NumberFormat('id-ID').format(val)}`;
}

function formatScheduled(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    + ', ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function FieldLabel({ required, children }) {
  return (
    <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 500, color: '#282828' }}>
      {required && <span style={{ color: '#D0021B' }}>* </span>}{children}
    </p>
  );
}

// Mirrors ce-ui's DateField trigger (button + flipped popover, outside-click/Escape
// to close) since ce-ui has no combined date+time field — swaps in DateTimePicker.
function fieldBorderColor({ error, open, hovered }) {
  if (error) return '#D0021B';
  if (open) return '#006BFF';
  if (hovered) return '#D1D5DB';
  return '#EDEDED';
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Minimal clone of ce-ui's internal TimeColumn (not part of its public index)
// with per-item `disabled` support, which ce-ui's TimePickerCore lacks — needed
// to grey out/disable already-past hours and minutes when "today" is selected.
function TimeColumn({ values, selectedIndex, disabledSet, onSelect }) {
  const ref = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const top = selectedIndex * 40;
    if (!mounted.current) { el.scrollTop = top; mounted.current = true; }
    else el.scrollTo({ top, behavior: 'smooth' });
  }, [selectedIndex]);

  return (
    <div ref={ref} style={{ overflowY: 'auto', flex: 1, minWidth: '64px', height: '240px' }}>
      {values.map((v, i) => {
        const disabled = disabledSet.has(i);
        const isSelected = i === selectedIndex;
        return (
          <button key={i} type="button" disabled={disabled} onClick={() => onSelect(i)}
            style={{ width: '100%', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', border: 'none', background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer' }}>
            <span style={{
              width: '100%', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontFamily: "'Lato', sans-serif", fontWeight: isSelected && !disabled ? 700 : 400,
              background: isSelected && !disabled ? '#006BFF' : 'transparent',
              color: disabled ? '#D1D5DB' : isSelected ? '#FFFFFF' : '#5C5C5C',
            }}>{v}</span>
          </button>
        );
      })}
    </div>
  );
}

// Combined date+time picker built from ce-ui's CalendarGrid (which does support
// `minDate`) plus a local TimeColumn, since ce-ui's own DateTimePicker doesn't
// expose a way to disable past days/hours/minutes.
function DateTimePickerNoPast({ value, onChange }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  const isToday = sameDay(value, now);
  const hours = Array.from({ length: 24 }, (_, i) => pad2(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad2(i));
  const disabledHours = new Set();
  const disabledMinutes = new Set();
  if (isToday) {
    for (let h = 0; h < now.getHours(); h++) disabledHours.add(h);
    if (value.getHours() === now.getHours()) {
      for (let m = 0; m < now.getMinutes(); m++) disabledMinutes.add(m);
    }
  }

  function handleDayClick(day) {
    const d = new Date(day);
    d.setHours(value.getHours(), value.getMinutes(), 0, 0);
    onChange(d);
  }
  function handleHour(i) {
    const d = new Date(value);
    d.setHours(i, d.getMinutes(), 0, 0);
    onChange(d);
  }
  function handleMinute(i) {
    const d = new Date(value);
    d.setMinutes(i, 0, 0);
    onChange(d);
  }

  return (
    <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E9E9E9', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
      <div style={{ padding: '16px' }}>
        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          isSelected={d => sameDay(d, value)}
          onDayClick={handleDayClick}
          onPrev={() => { if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); } else setViewMonth(m => m - 1); }}
          onNext={() => { if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); } else setViewMonth(m => m + 1); }}
          onMonthYearChange={(y, m) => { setViewYear(y); setViewMonth(m); }}
          minDate={startOfDay(now)}
        />
      </div>
      <div style={{ width: '1px', background: '#E9E9E9' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex' }}>
          <TimeColumn values={hours} selectedIndex={value.getHours()} disabledSet={disabledHours} onSelect={handleHour} />
          <div style={{ width: '1px', background: '#E9E9E9' }} />
          <TimeColumn values={minutes} selectedIndex={value.getMinutes()} disabledSet={disabledMinutes} onSelect={handleMinute} />
        </div>
        <div style={{ borderTop: '1px solid #E9E9E9' }}>
          <button type="button" onClick={() => onChange(new Date())}
            style={{ width: '100%', height: '44px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#5C5C5C' }}>
            Now
          </button>
        </div>
      </div>
    </div>
  );
}

function DateTimeField({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [defaultNow] = useState(() => new Date());
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: '10px', border: `1px solid ${fieldBorderColor({ error, open, hovered })}`,
          boxShadow: open ? '0 0 0 3px rgba(0,107,255,0.15)' : 'none',
          background: '#FFFFFF', cursor: 'pointer', fontSize: '14px', fontFamily: "'Lato', sans-serif", color: '#282828',
        }}>
        {value ? formatScheduled(value) : 'Now'}
        <Calendar size={16} color="#7E7E7E" />
      </button>
      {open && (
        <div role="dialog" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 30 }}>
          <DateTimePickerNoPast value={value ?? defaultNow} onChange={d => { onChange(d); setOpen(false); }} />
        </div>
      )}
      {error && <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#D0021B' }}>{error}</p>}
    </div>
  );
}

function VehicleSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);
  const selected = VEHICLE_TYPES.find(v => v.value === value);
  const filtered = VEHICLE_TYPES.filter(v => v.label.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(''); }
    }
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: '10px', border: `1px solid ${fieldBorderColor({ error, open, hovered })}`,
          boxShadow: open ? '0 0 0 3px rgba(0,107,255,0.15)' : 'none',
          background: '#FFFFFF', cursor: 'text', fontSize: '14px', fontFamily: "'Lato', sans-serif",
        }}>
        {open ? (
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClick={e => e.stopPropagation()}
            placeholder={selected ? selected.label : 'Select Vehicle'}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: '14px', fontFamily: "'Lato', sans-serif", color: '#282828', background: 'transparent' }}
          />
        ) : (
          <span style={{ color: selected ? '#282828' : '#9CA3AF' }}>{selected ? selected.label : 'Select Vehicle'}</span>
        )}
        <ChevronDown size={16} color="#7E7E7E" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </div>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
          background: '#FFFFFF', border: '1px solid #E9E9E9', borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: '280px', overflowY: 'auto',
        }}>
          {filtered.map((v, i) => (
            <div key={v.value} onClick={() => { onChange(v.value); setOpen(false); setQuery(''); }} style={{
              padding: '12px 14px', cursor: 'pointer',
              borderBottom: i < filtered.length - 1 ? '1px solid #F0F0F0' : 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#282828' }}>{v.label}</div>
              <div style={{ fontSize: '13px', color: '#7E7E7E', marginTop: '2px' }}>{v.dims}</div>
              <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>{v.description}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p style={{ margin: 0, padding: '16px', textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>No vehicles found</p>
          )}
        </div>
      )}
      {error && <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#D0021B' }}>{error}</p>}
    </div>
  );
}

function PaymentSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const selected = PAYMENT_METHODS.find(p => p.value === value);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: '10px', border: `1px solid ${fieldBorderColor({ error, open, hovered })}`,
          boxShadow: open ? '0 0 0 3px rgba(0,107,255,0.15)' : 'none',
          background: '#FFFFFF', cursor: 'pointer', fontSize: '14px', fontFamily: "'Lato', sans-serif",
          color: selected ? '#282828' : '#9CA3AF',
        }}>
        {selected ? selected.label : 'Select Method'}
        <ChevronDown size={16} color="#7E7E7E" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20,
          background: '#FFFFFF', border: '1px solid #E9E9E9', borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden',
        }}>
          {PAYMENT_METHODS.map((p, i) => (
            <div key={p.value} onClick={() => { onChange(p.value); setOpen(false); }} style={{
              padding: '10px 14px', cursor: 'pointer',
              borderBottom: i < PAYMENT_METHODS.length - 1 ? '1px solid #F0F0F0' : 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#282828' }}>{p.label}</div>
              {p.description && <div style={{ fontSize: '13px', color: '#7E7E7E', marginTop: '2px' }}>{p.description}</div>}
            </div>
          ))}
        </div>
      )}
      {error && <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#D0021B' }}>{error}</p>}
    </div>
  );
}

// ce-ui's Checkbox renders disabled+checked identically to disabled+unchecked
// (no fill, no checkmark), so a forced-selected row would look unselected —
// render a locked, visibly-filled box for that combination instead.
function LockedCheckbox({ label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'not-allowed' }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '4px', flexShrink: 0,
        background: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Check size={14} strokeWidth={3} color="#FFFFFF" />
      </div>
      <span style={{ fontSize: '14px', color: '#282828' }}>{label}</span>
    </div>
  );
}

function ServiceRow({ label, priceLabel, checked, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      {disabled && checked ? (
        <LockedCheckbox label={label} />
      ) : (
        <Checkbox checked={checked} onChange={onChange} label={label} disabled={disabled} />
      )}
      <span style={{ fontSize: '13px', color: '#7E7E7E', whiteSpace: 'nowrap' }}>{priceLabel}</span>
    </div>
  );
}

export default function PlaceOrderModal({ onClose, onSubmit, forceFragile, customerAddress, customerPaidAmount }) {
  const { t } = useTranslation();

  const [scheduledAt, setScheduledAt] = useState(null);
  const [payment, setPayment] = useState('wallet');
  const [notes, setNotes] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedToll, setSelectedToll] = useState([]);
  const [tollExpanded, setTollExpanded] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreeToCoverDifference, setAgreeToCoverDifference] = useState(false);

  const { services, hasToll } = vehicle ? getServicesForVehicle(vehicle) : { services: [], hasToll: false };
  const total = vehicle ? computeDeliveryTotal(vehicle, selectedServices, selectedToll) : null;
  const exceedsCustomerPaid = total != null && customerPaidAmount != null && total > customerPaidAmount;

  function toggleService(key) {
    if (forceFragile && key === 'fragile') return;
    setSelectedServices(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function handleVehicleChange(v) {
    setVehicle(v);
    setSelectedServices(forceFragile ? ['fragile'] : []);
    setSelectedToll([]);
    setErrors(e => ({ ...e, vehicle: undefined }));
  }
  function toggleToll(key) {
    setSelectedToll(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  function handleSubmit() {
    const nextErrors = {};
    if (!payment) nextErrors.payment = t('orders:placeOrder.required');
    if (!vehicle) nextErrors.vehicle = t('orders:placeOrder.required');
    if (exceedsCustomerPaid && !agreeToCoverDifference) nextErrors.agreeToCoverDifference = t('orders:placeOrder.required');
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({
      scheduledAt, payment, notes, vehicle,
      services: selectedServices, toll: selectedToll, total,
      timeLabel: formatScheduled(scheduledAt || new Date()),
    });
  }

  return (
    <Popup
      open
      onClose={onClose}
      platform="desktop"
      align="center"
      title={t('orders:placeOrder.title')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Lato', sans-serif" }}>
        {/* Pickup -> customer address */}
        <div style={{ border: '1px solid #E9E9E9', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <img src={lalamoveLogo} alt="Lalamove" style={{ height: '14px', width: 'auto', objectFit: 'contain' }} />
            <p style={{ margin: 0, fontSize: '13px', color: '#7E7E7E' }}>{t('orders:placeOrder.lalamoveDelivery')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#9CA3AF' }}>{t('orders:placeOrder.from')}:</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#282828', lineHeight: '18px' }}>{PICKUP_PROFILE.pinpointAddress}</p>
            </div>
            <ArrowRight size={16} color="#7E7E7E" style={{ flexShrink: 0, marginTop: '20px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#9CA3AF' }}>{t('orders:placeOrder.to')}:</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#282828', lineHeight: '18px' }}>{customerAddress || '-'}</p>
            </div>
          </div>
        </div>

        {/* Time + Payment */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <FieldLabel required>{t('orders:placeOrder.time')}</FieldLabel>
            <DateTimeField value={scheduledAt} onChange={setScheduledAt} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel required>{t('orders:placeOrder.payment')}</FieldLabel>
            <PaymentSelect
              value={payment}
              onChange={v => { setPayment(v); setErrors(e => ({ ...e, payment: undefined })); }}
              error={errors.payment}
            />
          </div>
        </div>

        {/* Notes to driver */}
        <TextField
          multiline
          rows={3}
          maxLength={500}
          showCount
          label={t('orders:placeOrder.notesToDriver')}
          placeholder={t('orders:placeOrder.inputNotes')}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        {/* Vehicle type */}
        <div>
          <FieldLabel required>{t('orders:placeOrder.vehicleType')}</FieldLabel>
          <VehicleSelect
            value={vehicle}
            onChange={handleVehicleChange}
            error={errors.vehicle}
          />
          <a href={VEHICLE_GUIDE_URL} target="_blank" rel="noreferrer"
            onMouseEnter={e => e.currentTarget.style.background = '#F3F7FE'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px',
              padding: '6px 10px', margin: '8px -10px 0', borderRadius: '8px',
              textDecoration: 'none', transition: 'background 0.15s',
            }}>
            <HelpCircle size={14} color="#006BFF" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#006BFF', cursor: 'pointer' }}>{t('orders:placeOrder.vehicleGuide')}</span>
          </a>
        </div>

        {/* Additional services */}
        {vehicle && (
          <div style={{ borderTop: '1px solid #E9E9E9', paddingTop: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#282828' }}>{t('orders:placeOrder.additionalServices')}</p>
            {services.map(s => (
              <ServiceRow
                key={s.key}
                label={t(`orders:placeOrder.services.${s.key}`)}
                priceLabel={s.type === 'percent' ? `+${s.amount}%` : `+${formatPrice(s.amount)}`}
                checked={selectedServices.includes(s.key)}
                onChange={() => toggleService(s.key)}
                disabled={forceFragile && s.key === 'fragile'}
              />
            ))}
            {hasToll && (
              <div>
                <div onClick={() => setTollExpanded(e => !e)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0', cursor: 'pointer' }}>
                  <ChevronDown size={16} color="#7E7E7E" style={{ transform: tollExpanded ? 'none' : 'rotate(-90deg)', transition: 'transform 0.15s' }} />
                  <span style={{ fontSize: '14px', color: '#282828' }}>{t('orders:placeOrder.tollFee')}</span>
                </div>
                {tollExpanded && (
                  <div style={{ paddingLeft: '22px' }}>
                    {TOLL_FEE_OPTIONS.map(toll => (
                      <ServiceRow
                        key={toll.key}
                        label={t(`orders:placeOrder.toll.${toll.key}`)}
                        priceLabel={`+${formatPrice(toll.amount)}`}
                        checked={selectedToll.includes(toll.key)}
                        onChange={() => toggleToll(toll.key)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Sticky total + actions, pinned to the bottom of the scrollable content */}
      <div style={{
        position: 'sticky', bottom: '-16px', marginTop: '20px', marginLeft: '-24px', marginRight: '-24px', marginBottom: '-16px',
        background: '#FFFFFF', borderTop: '1px solid #E9E9E9', padding: '16px 24px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {customerPaidAmount != null && (
            <span style={{ fontSize: '14px', color: '#7E7E7E' }}>
              {t('orders:placeOrder.customerPaid')}: {formatPrice(customerPaidAmount)}
            </span>
          )}
          <span style={{ marginLeft: 'auto', fontSize: '15px', fontWeight: 700, color: '#282828' }}>
            {t('orders:placeOrder.totalDelivery')}: {total != null ? formatPrice(total) : 'IDR -'}
          </span>
        </div>

        {exceedsCustomerPaid && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '8px', padding: '12px',
            }}>
              <Checkbox checked={agreeToCoverDifference} onChange={setAgreeToCoverDifference} />
              <span style={{ fontSize: '13px', color: '#C2410C', lineHeight: 1.5 }}>
                {t('orders:placeOrder.coverDifferenceNotice')}
              </span>
            </div>
            {errors.agreeToCoverDifference && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#D0021B' }}>{errors.agreeToCoverDifference}</p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <MainBtn className="flex-1" variant="secondary" size="lg" label={t('orders:placeOrder.cancel')} onClick={onClose} />
          <MainBtn className="flex-1" variant="primary" size="lg" label={t('orders:placeOrder.title')} onClick={handleSubmit} />
        </div>
      </div>
    </Popup>
  );
}
