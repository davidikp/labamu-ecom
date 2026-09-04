// ─── Mock orders data ────────────────────────────────────────────────────────
// Fully client-side mock data so local iteration doesn't depend on a backend.

async function mockDelay(ms = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

const DELIVERY_STEPS = ['Order in Process', 'Waiting for Pickup', 'On Delivery', 'Order Delivered'];
const PICKUP_STEPS = ['Order in Process', 'Waiting to be Collected', 'Order Collected'];
const STORE_ADDRESS = 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320';

const CUSTOMERS = [
  'Alex Juana', 'Sienna James', 'Sudarto Wijaya', 'Gabriela Jane', 'Anggieta Rapaday',
  'Joshia Budiman', 'Axelo Justice', 'Victoria Smith', 'Sabrina Kenzo', 'Prada',
  'Alexander David', 'Sisca Bunga', 'Lauren Lee', 'James Jordan', 'Michael Tanoto',
];

const PRODUCTS = [
  { product: 'Spaghetti Bolognese', notes: '+ Sedang\n+ Pakai (8.000)', price: 30000 },
  { product: 'Waffle', notes: '-', price: 30000 },
  { product: 'Iced Latte', notes: '-', price: 25000 },
  { product: 'Chicken Katsu', notes: '+ Pedas', price: 35000 },
];

function buildItems(seed) {
  const count = 1 + (seed % 2);
  return Array.from({ length: count }, (_, i) => {
    const p = PRODUCTS[(seed + i) % PRODUCTS.length];
    const quantity = 10;
    const discount = 10;
    const total = p.product === 'Waffle' ? 200000 : Math.round(p.price * quantity * (1 - discount / 100));
    return { ...p, quantity, discount, total };
  });
}

// One row per meaningful list-level scenario (order type × order status,
// including mid-flow states) instead of hundreds of randomly-generated rows —
// easier to exercise every case in the module by hand.
const SCENARIOS = [
  { orderType: 'Delivery', orderStatus: 'In Progress', stepIndex: 0, date: '2025-07-20T09:00:00' },
  { orderType: 'Delivery', orderStatus: 'In Progress', stepIndex: 1, date: '2025-07-21T11:30:00' },
  { orderType: 'Delivery', orderStatus: 'In Progress', stepIndex: 1, date: '2025-07-21T15:45:00', noDriverFound: true },
  { orderType: 'Delivery', orderStatus: 'In Progress', stepIndex: 2, date: '2025-07-22T08:15:00' },
  { orderType: 'Delivery', orderStatus: 'Completed', stepIndex: 3, date: '2025-07-18T13:00:00' },
  { orderType: 'Delivery', orderStatus: 'Cancelled', stepIndex: 0, date: '2025-07-17T10:20:00' },
  { orderType: 'Pickup', orderStatus: 'In Progress', stepIndex: 0, date: '2025-07-22T10:00:00' },
  { orderType: 'Pickup', orderStatus: 'In Progress', stepIndex: 1, date: '2025-07-20T16:10:00' },
  { orderType: 'Pickup', orderStatus: 'Completed', stepIndex: 2, date: '2025-07-19T12:40:00' },
  { orderType: 'Pickup', orderStatus: 'Cancelled', stepIndex: 0, date: '2025-07-16T09:50:00' },
];

function formatDateTime(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} | ${hh}:${min}`;
}

const _SEED_ORDERS = SCENARIOS.map((scenario, i) => {
  const seed = i + 1;
  const { orderType, orderStatus, stepIndex, date, noDriverFound } = scenario;
  const items = buildItems(seed);
  const subtotal = items.reduce((sum, it) => sum + it.total, 0);
  const tax = Math.round(subtotal * 0.1);
  const shippingCost = orderType === 'Delivery' ? 16000 : 0;
  const deliveryInsurance = orderType === 'Delivery' ? 3000 : 0;
  const totalTransaction = subtotal + tax + shippingCost + deliveryInsurance;
  const isBooked = orderType === 'Delivery' && stepIndex >= 1 && !noDriverFound;

  return {
    id: `order-${seed}`,
    order_id: `ORD-DIG-240101-${String(seed).padStart(3, '0')}`,
    order_number: `#${String(seed).padStart(3, '0')}`,
    date_time: formatDateTime(date),
    date_time_value: new Date(date).getTime(),
    order_time: '13 Mar 2022, 10:17 WIB',
    customer_name: CUSTOMERS[seed % CUSTOMERS.length],
    customer_phone: '+62823819283',
    customer_email: 'jamesjordan@gmail.com',
    customer_address: 'Jl. Sudirman Kav. 52-53, RT.5/RW.3, Senayan, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta 12190',
    customer_pinpoint: orderType === 'Delivery' ? { lat: -6.2251, lng: 106.7997 } : undefined,
    addressed_to: 'James Jordan',
    item_count: items.length * 5,
    items,
    total: totalTransaction,
    order_type: orderType,
    order_status: orderStatus,
    step_index: stepIndex,
    no_driver_found: !!noDriverFound,
    payment_status: 'Paid',
    order_note: 'Ini tolong makanan jangan kebalik2 ya',
    subtotal,
    tax,
    shipping_cost: shippingCost,
    delivery_insurance: deliveryInsurance,
    total_transaction: totalTransaction,
    awb: isBooked ? String(1000000000 + seed) : '-',
    delivery_service_type: orderType === 'Delivery' ? 'Scheduled Delivery' : undefined,
    fragile: orderType === 'Delivery' ? 'Yes' : undefined,
    courier_provider: orderType === 'Delivery' ? 'Lalamove' : undefined,
    tracking_code: isBooked ? String(2000000000 + seed) : '-',
    tracking_link: isBooked ? '#' : '-',
    proof_of_delivery_url: isBooked ? '#' : undefined,
    pickup_address: orderType === 'Pickup' ? STORE_ADDRESS : undefined,
    pickup_pinpoint: orderType === 'Pickup' ? { lat: -6.2246, lng: 106.6553 } : undefined,
    lalamove_booking: isBooked ? {
      pickUpTimeLabel: 'Now',
      paymentMethodLabel: 'Wallet',
      vehicleTypeLabel: 'Motorcycle',
      notesLabel: '-',
      feeBreakdown: [{ kind: 'base', key: 'deliveryFee', amount: 24000 }],
      total: 24000,
    } : undefined,
  };
});

function getSteps(orderType) {
  return orderType === 'Delivery' ? DELIVERY_STEPS : PICKUP_STEPS;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// "Last N days"/"Today" are computed relative to the newest mock order rather
// than the real wall-clock date, so the presets stay meaningful regardless of
// when this demo is actually run.
const REFERENCE_DAY = (() => {
  const max = Math.max(..._SEED_ORDERS.map(o => o.date_time_value));
  const d = new Date(max);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); }
function endOfDay(d) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x.getTime(); }

function matchesDate(order, datePreset, customDateFrom, customDateTo) {
  if (customDateFrom || customDateTo) {
    if (customDateFrom && order.date_time_value < startOfDay(customDateFrom)) return false;
    if (customDateTo && order.date_time_value > endOfDay(customDateTo)) return false;
    return true;
  }
  const rangeDays = { today: 1, last7: 7, last14: 14, last30: 30 }[datePreset];
  if (!rangeDays) return true; // no/unknown preset (including the custom-date sentinel with no dates yet) = no filter
  const windowStart = REFERENCE_DAY - (rangeDays - 1) * DAY_MS;
  const windowEnd = REFERENCE_DAY + DAY_MS;
  return order.date_time_value >= windowStart && order.date_time_value < windowEnd;
}

export async function fetchOrders(params = {}, signal) {
  await mockDelay();
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const {
    page = 1, pageSize = 25, datePreset, customDateFrom, customDateTo,
    orderTypes = [], orderStatuses = [], search, sortKey, sortDir,
  } = params;
  const kw = (search || '').trim().toLowerCase();

  let filtered = _SEED_ORDERS.filter(o => {
    if (!matchesDate(o, datePreset, customDateFrom, customDateTo)) return false;
    if (orderTypes.length && !orderTypes.includes(o.order_type)) return false;
    if (orderStatuses.length && !orderStatuses.includes(o.order_status)) return false;
    if (kw && !o.order_id.toLowerCase().includes(kw) && !o.customer_name.toLowerCase().includes(kw)) return false;
    return true;
  });

  if (sortKey && sortDir) {
    const dir = sortDir === 'asc' ? 1 : -1;
    filtered = [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, meta: { total } };
}

export async function fetchOrderById(id) {
  await mockDelay();
  const order = _SEED_ORDERS.find(o => o.id === id) || null;
  return { data: order ? { ...order, steps: getSteps(order.order_type) } : null };
}

export async function advanceOrderStatus(id) {
  await mockDelay(200);
  const order = _SEED_ORDERS.find(o => o.id === id);
  if (!order) return { data: null };

  const steps = getSteps(order.order_type);
  if (order.step_index < steps.length - 1) {
    order.step_index += 1;
  }
  order.order_status = order.step_index === steps.length - 1 ? 'Completed' : 'In Progress';

  return { data: { ...order, steps } };
}

// Manually-triggered demo failure: a Delivery order fails to find a driver
// while "Waiting for Pickup". Stays at the same step, flags `no_driver_found`,
// and requires the merchant to place a new courier order.
export async function simulateNoDriverFound(id) {
  await mockDelay(200);
  const order = _SEED_ORDERS.find(o => o.id === id);
  if (!order) return { data: null };

  order.no_driver_found = true;
  return { data: { ...order, steps: getSteps(order.order_type) } };
}

// ─── Place Order (courier booking) mock data ────────────────────────────────

export const PICKUP_PROFILE = {
  name: 'Charlie',
  phone: '+6281234567890',
  email: 'charlie@mail.com',
  country: 'Indonesia',
  province: 'Banten',
  city: 'Kota Tangerang',
  district: 'Kecamatan Pinang',
  region: 'Kuncoran',
  zip: '15320',
  address: 'Alam Sutera, Jl Jalur Sutera Boulevard No.45',
  pinpointAddress: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kuncoran, Kec. Pinang, Kota Tangerang, Banten 15320',
};

export const PAYMENT_METHODS = [
  { value: 'wallet', label: 'Wallet', description: 'IDR 0' },
];

export const VEHICLE_TYPES = [
  { value: 'motorcycle', label: 'Motorcycle', dims: '0.4 x 0.4 x 0.5 Meter - 20 kg', description: 'Express door-to-door delivery on small goods', tier: 'small', basePrice: 24000 },
  { value: 'sedan', label: 'Sedan', dims: '1.5 x 0.8 x 0.8 Meter - 100 kg', description: 'Ideal for small to medium item size and fragile goods', tier: 'small', basePrice: 45000 },
  { value: 'mpv', label: 'MPV', dims: '1.7 x 1 x 0.8 Meter - 200 kg', description: 'Ideal for multi-items delivery on delicate goods', tier: 'small', basePrice: 65000 },
  { value: 'van', label: 'Van', dims: '2.1 x 1.5 x 1.2 Meter - 600 kg', description: 'Ideal for bulk-items delivery on delicate goods including furniture', tier: 'small', basePrice: 120000 },
  { value: 'pickup-box-1t', label: 'Pickup Box (1 Ton)', dims: '2.4 x 1.6 x 1.2 Meter - 1000 kg', description: 'Ideal for big delicate item delivery including home appliances', tier: 'large', basePrice: 180000, supportsFrozenTruck: true },
  { value: 'engkel-box-2t', label: 'Engkel Box (2 Ton)', dims: '3.1 x 1.7 x 1.7 Meter - 2000 kg', description: 'Ideal for bulk and big items delivery including house moving', tier: 'large', basePrice: 260000 },
  { value: 'engkel-bak-2-5t', label: 'Engkel Bak (2.5 Ton)', dims: '3.1 x 1.7 x 1.7 Meter - 2500 kg', description: 'Ideal for large and bulky goods such as moving house', tier: 'large', basePrice: 300000 },
  { value: 'cdd-bak-5t', label: 'CDD Bak (5 Ton)', dims: '4.5 x 2 x 2 Meter - 5000 kg', description: 'Ideal for large and bulky goods, and huge materials', tier: 'large', basePrice: 420000 },
  { value: 'cdd-box-5t', label: 'CDD Box (5 Ton)', dims: '4.5 x 2 x 2 Meter - 5000 kg', description: 'Ideal for large and bulky goods, and huge materials', tier: 'large', basePrice: 440000 },
  { value: 'heavy-truck-open-8t', label: 'Heavy Truck Open (8 Ton)', dims: '5.7 x 2.5 x 2 Meter - 8000 kg', description: 'Ideal for your bulky and heavy item', tier: 'large', basePrice: 650000 },
  { value: 'heavy-truck-box-8t', label: 'Heavy Truck Box (8 Ton)', dims: '5.7 x 2.5 x 2 Meter - 8000 kg', description: 'Ideal for your bulky and heavy item', tier: 'large', basePrice: 680000 },
  { value: 'tronton-wing-box', label: 'Tronton Wing Box', dims: '9.6 x 2.4 x 2.4 Meter - 18000 kg', description: 'Ideal for large and heavy goods', tier: 'large', basePrice: 950000 },
];

// `code` mirrors Lalamove's real `specialRequests` enum (see developers.lalamove.com,
// Get City Info endpoint) so this mock stays traceable to actual Lalamove service names.
// `extraWaiting` and `frozenTruck` have no Lalamove equivalent — they're Figma-specific.
const COMMON_SERVICES = [
  { key: 'liftCarry', code: 'DOOR_TO_DOOR', label: 'Lift and carry assistance (door-to-door)', type: 'flat', amount: 10000 },
  { key: 'extraWaiting', code: null, label: 'Extra waiting time (exceeding to 1hr)', type: 'flat', amount: 12500 },
  { key: 'roundTrip', code: 'ROUND_TRIP', label: 'Round trip', type: 'percent', amount: 70 },
  { key: 'fragile', code: 'FRAGILE', label: 'Fragile handling', type: 'flat', amount: 5000 },
  { key: 'helpBuy', code: 'HELP_BUY', label: 'Help to buy (shopping assistance)', type: 'flat', amount: 15000 },
  { key: 'cod', code: 'COD', label: 'Cash on delivery', type: 'flat', amount: 5000 },
];

const SMALL_TIER_SERVICES = [...COMMON_SERVICES, { key: 'thermalBag', code: 'LALABAG', label: 'Thermal bag', type: 'flat', amount: 0 }];

const LARGE_TIER_SERVICES = [
  ...COMMON_SERVICES,
  { key: 'frozenTruck', code: null, label: 'Frozen truck', type: 'percent', amount: 40 },
  { key: 'extraLength1', code: 'EXTRA_LENGTH_1', label: 'Extra length (1 meter)', type: 'flat', amount: 15000 },
  { key: 'extraLength2', code: 'EXTRA_LENGTH_2', label: 'Extra length (2 meters)', type: 'flat', amount: 30000 },
];

export const TOLL_FEE_OPTIONS = [
  { key: 'tollIntraCity', code: 'TOLL_FEE', label: 'Toll Fee (Intra City)', amount: 25000 },
  { key: 'tollBandung', code: 'TOLL_FEE', label: 'Toll to Bandung', amount: 100000 },
  { key: 'tollCirebon', code: 'TOLL_FEE', label: 'Toll to Cirebon', amount: 198000 },
];

export function getServicesForVehicle(vehicleValue) {
  const vehicle = VEHICLE_TYPES.find(v => v.value === vehicleValue);
  if (!vehicle) return { services: [], hasToll: false };
  if (vehicle.tier !== 'large') return { services: SMALL_TIER_SERVICES, hasToll: false };

  const services = vehicle.supportsFrozenTruck
    ? LARGE_TIER_SERVICES
    : LARGE_TIER_SERVICES.filter(s => s.key !== 'frozenTruck');
  return { services, hasToll: true };
}

export async function fetchPlaceOrderOptions() {
  await mockDelay();
  return { data: { pickupProfile: PICKUP_PROFILE, paymentMethods: PAYMENT_METHODS, vehicleTypes: VEHICLE_TYPES } };
}

// Itemized breakdown used both for the live modal total and the post-booking
// "Lalamove Delivery" summary card, so both stay in sync.
export function getDeliveryFeeBreakdown(vehicleValue, selectedServiceKeys = [], selectedTollKeys = []) {
  const vehicle = VEHICLE_TYPES.find(v => v.value === vehicleValue);
  if (!vehicle) return { items: [], total: 0 };

  const { services } = getServicesForVehicle(vehicleValue);
  const items = [{ kind: 'base', key: 'deliveryFee', amount: vehicle.basePrice }];
  services.forEach(s => {
    if (!selectedServiceKeys.includes(s.key)) return;
    const amount = s.type === 'percent' ? Math.round(vehicle.basePrice * s.amount / 100) : s.amount;
    items.push({ kind: 'service', key: s.key, amount });
  });
  TOLL_FEE_OPTIONS.forEach(toll => {
    if (selectedTollKeys.includes(toll.key)) items.push({ kind: 'toll', key: toll.key, amount: toll.amount });
  });

  const total = items.reduce((sum, it) => sum + it.amount, 0);
  return { items, total };
}

export function computeDeliveryTotal(vehicleValue, selectedServiceKeys = [], selectedTollKeys = []) {
  const vehicle = VEHICLE_TYPES.find(v => v.value === vehicleValue);
  if (!vehicle) return null;
  return getDeliveryFeeBreakdown(vehicleValue, selectedServiceKeys, selectedTollKeys).total;
}

function randomDigits(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

// Confirms the courier booking collected in PlaceOrderModal: fills in the
// AWB/tracking fields, stores a "Lalamove Delivery" summary on the order, and
// advances the status stepper exactly like advanceOrderStatus does.
export async function confirmDeliveryBooking(id, bookingDetails) {
  await mockDelay(300);
  const order = _SEED_ORDERS.find(o => o.id === id);
  if (!order) return { data: null };

  const vehicle = VEHICLE_TYPES.find(v => v.value === bookingDetails.vehicle);
  const payment = PAYMENT_METHODS.find(p => p.value === bookingDetails.payment);
  const { items, total } = getDeliveryFeeBreakdown(bookingDetails.vehicle, bookingDetails.services, bookingDetails.toll);

  const isRetry = order.no_driver_found;

  order.awb = randomDigits(12);
  order.tracking_code = randomDigits(10);
  order.tracking_link = '#';
  order.no_driver_found = false;
  order.lalamove_booking = {
    pickUpTimeLabel: bookingDetails.timeLabel,
    paymentMethodLabel: payment?.label || '-',
    vehicleTypeLabel: vehicle?.label || '-',
    notesLabel: bookingDetails.notes || '-',
    feeBreakdown: items,
    total,
  };

  const steps = getSteps(order.order_type);
  // A retry after "no driver found" re-books the same step (Waiting for
  // Pickup) rather than advancing past it.
  if (!isRetry && order.step_index < steps.length - 1) order.step_index += 1;
  order.order_status = order.step_index === steps.length - 1 ? 'Completed' : 'In Progress';

  return { data: { ...order, steps } };
}
