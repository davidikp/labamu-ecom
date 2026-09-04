// ─── Mock catalog data ───────────────────────────────────────────────────────
// Products and categories are fully client-side mock data (ported from the
// former FastAPI demo seed) so local iteration doesn't depend on a backend.

function sp(idr) {
  return [
    { currency_code: 'IDR', price: idr },
    { currency_code: 'USD', price: Math.round(idr / 16000) },
    { currency_code: 'EUR', price: Math.round(idr / 17500) },
  ];
}
function img(sku) {
  return [{
    document_id: 'placeholder',
    document_original_name: 'product.jpg',
    document_public_url: `https://placehold.co/600x400?text=${sku}`,
    is_primary: true,
  }];
}
function daysAgoIso(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

const _SEED_PRODUCTS = [
  // cat-001 — Solid Wood Furniture · lead_time: 30 days
  { id: 'prod-1001', sku: 'MFG-1001', name: 'Teak Dining Table 6-Seater', description: 'Solid teak dining table with hand-finished surface, seats six comfortably.', price: 8500000, category_id: 'cat-001', status: 'ACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'published', days_ago: 5, lead_time: '30 days', selling_price: 8500000, primary_material: 'Teak' },
  { id: 'prod-1002', sku: 'MFG-1002', name: 'Mahogany Bed Frame King', description: 'King-size bed frame in solid mahogany with carved headboard detail.', price: 12000000, category_id: 'cat-001', status: 'ACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'published', days_ago: 12, lead_time: '30 days', selling_price: 12000000, primary_material: 'Mahogany' },
  { id: 'prod-1003', sku: 'MFG-1003', name: 'Teak Bookshelf 5-Tier', description: 'Five-tier freestanding bookshelf in kiln-dried teak, natural oil finish.', price: 4500000, category_id: 'cat-001', status: 'INACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'draft', days_ago: 20, lead_time: '30 days', selling_price: 4500000, primary_material: 'Teak' },
  { id: 'prod-1004', sku: 'MFG-1004', name: 'Solid Wood Coffee Table', description: 'Rectangular coffee table in solid teak with lower shelf for storage.', price: 3200000, category_id: 'cat-001', status: 'ACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'published', days_ago: 30, lead_time: '30 days', selling_price: 3200000, primary_material: 'Teak' },
  { id: 'prod-1005', sku: 'MFG-1005', name: 'Mahogany Wardrobe 3-Door', description: 'Three-door wardrobe in solid mahogany with internal hanging rail and shelves.', price: 9800000, category_id: 'cat-001', status: 'INACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'archived', days_ago: 45, lead_time: '30 days', selling_price: 9800000, primary_material: 'Mahogany' },
  // cat-002 — Custom Order Furniture · lead_time: 45-60 days
  { id: 'prod-2001', sku: 'MFG-2001', name: 'Custom Carved Dining Chair', description: 'Handcarved dining chair with custom motif, made to order in teak or mahogany.', price: 2100000, category_id: 'cat-002', status: 'ACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'draft', days_ago: 8, lead_time: '45-60 days', selling_price: 2100000, primary_material: 'Teak' },
  { id: 'prod-2002', sku: 'MFG-2002', name: 'Bespoke TV Cabinet', description: 'Custom-built TV cabinet with cable management and adjustable shelving.', price: 5600000, category_id: 'cat-002', status: 'ACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'draft', days_ago: 15, lead_time: '45-60 days', selling_price: 5600000, primary_material: 'Teak' },
  { id: 'prod-2003', sku: 'MFG-2003', name: 'Custom Writing Desk', description: 'Handcrafted writing desk with drawers, built to customer dimensions.', price: 4200000, category_id: 'cat-002', status: 'INACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'archived', days_ago: 55, lead_time: '45-60 days', selling_price: 4200000, primary_material: 'Teak' },
  { id: 'prod-2004', sku: 'MFG-2004', name: 'Carved Headboard King', description: 'Ornate king-size headboard with traditional Jepara carving motifs.', price: 3800000, category_id: 'cat-002', status: 'ACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'published', days_ago: 25, lead_time: '45-60 days', selling_price: 3800000, primary_material: 'Mahogany' },
  { id: 'prod-2005', sku: 'MFG-2005', name: 'Custom Display Cabinet', description: 'Glass-front display cabinet built to specification, available in all sizes.', price: 6500000, category_id: 'cat-002', status: 'INACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'draft', days_ago: 70, lead_time: '45-60 days', selling_price: 6500000, primary_material: 'Teak' },
  // cat-003 — Outdoor & Garden Furniture · lead_time: 21 days
  { id: 'prod-3001', sku: 'MFG-3001', name: 'Teak Garden Dining Set 4-Seater', description: 'Four-seater outdoor dining set in grade-A teak, weather-resistant.', price: 11000000, category_id: 'cat-003', status: 'ACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'published', days_ago: 3, lead_time: '21 days', selling_price: 11000000, primary_material: 'Teak' },
  { id: 'prod-3002', sku: 'MFG-3002', name: 'Teak Sun Lounger', description: 'Adjustable teak sun lounger with stainless steel bolts, FSC certified.', price: 3800000, category_id: 'cat-003', status: 'ACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'published', days_ago: 18, lead_time: '21 days', selling_price: 3800000, primary_material: 'Teak' },
  { id: 'prod-3003', sku: 'MFG-3003', name: 'Outdoor Bench Teak 2m', description: 'Two-metre garden bench in solid teak, no maintenance required.', price: 2900000, category_id: 'cat-003', status: 'INACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'archived', days_ago: 80, lead_time: '21 days', selling_price: 2900000, primary_material: 'Teak' },
  { id: 'prod-3004', sku: 'MFG-3004', name: 'Teak Folding Chair', description: 'Folding teak garden chair, lightweight and compact for easy storage.', price: 1200000, category_id: 'cat-003', status: 'INACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'draft', days_ago: 40, lead_time: '21 days', selling_price: 1200000, primary_material: 'Teak' },
  { id: 'prod-3005', sku: 'MFG-3005', name: 'Garden Coffee Table Teak', description: 'Square outdoor coffee table in solid teak with hidden drainage channels.', price: 2400000, category_id: 'cat-003', status: 'INACTIVE', product_source: 'STANDARD_CATALOG', platform_status: 'archived', days_ago: 90, lead_time: '21 days', selling_price: 2400000, primary_material: 'Teak' },
];

const MOCK_PRODUCTS = _SEED_PRODUCTS.map(row => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  description: row.description,
  price: row.price,
  category_id: row.category_id,
  status: row.status,
  product_source: row.product_source,
  platform_status: row.platform_status,
  updated_at: daysAgoIso(row.days_ago),
  created_at: daysAgoIso(row.days_ago),
  synced_at: null,
  lead_time: row.lead_time,
  selling_price: row.selling_price,
  primary_material: row.primary_material,
  gross_weight: null,
  image_attached: img(row.sku),
  sales_price: sp(row.price),
}));

const MOCK_CATEGORIES = [
  { id: 'cat-001', name: 'Solid Wood Furniture', description: 'Teak and mahogany dining sets, beds and living room pieces', status: 'ACTIVE', days_ago: 10 },
  { id: 'cat-002', name: 'Custom Order Furniture', description: 'Bespoke handcrafted pieces made to specification', status: 'ACTIVE', days_ago: 25 },
  { id: 'cat-003', name: 'Outdoor & Garden Furniture', description: 'Teak garden sets, sun loungers and outdoor dining', status: 'ACTIVE', days_ago: 40 },
  { id: 'cat-004', name: 'Wood Components & Panels', description: 'Raw timber components, panels and structural wood parts', status: 'ACTIVE', days_ago: 60 },
  { id: 'cat-005', name: 'Finishing & Hardware', description: 'Wood stains, varnishes, hinges, handles and fittings', status: 'INACTIVE', days_ago: 85 },
].map(c => ({ ...c, created_at: daysAgoIso(c.days_ago), updated_at: daysAgoIso(c.days_ago) }));

// ─── Bulk-edit overrides (in-memory, session-persistent) ─────────────────────
// The catalog API has no endpoint for weight/dimensions/visibility, and packages
// are mock. Bulk edits are stored here and merged onto fetched rows so the list
// reflects saved values after navigating back (resets on a full page reload).
const productOverrides = new Map();
const packageOverrides = new Map();

export function applyBulkEdits(kind, edits) {
  const map = kind === 'package' ? packageOverrides : productOverrides;
  edits.forEach(e => { map.set(e.id, { ...(map.get(e.id) || {}), ...e }); });
}

// Simulated save with latency. Fails deterministically on every 4th call so the
// error snackbars are reproducible/visible in the demo (no real backend for these).
let _saveTick = 0;
function simulateSave() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      _saveTick += 1;
      if (_saveTick % 4 === 0) reject(new Error('Simulated save failure'));
      else resolve();
    }, 400);
  });
}

export async function saveWebsiteVisibility(kind, id, visible) {
  await simulateSave();
  applyBulkEdits(kind, [{ id, platform_status: visible ? 'published' : 'draft' }]);
}

export async function saveFragileHandling(kind, id, fragile) {
  await simulateSave();
  applyBulkEdits(kind, [{ id, fragile }]);
}

function mergeOverride(map, item) {
  if (!item) return item;
  const o = map.get(item.id);
  return o ? { ...item, ...o } : item;
}

// ─── Random demo images ──────────────────────────────────────────────────────
// Give items a spread of image counts (0..5) seeded by id — so detail galleries
// demonstrate every case. Keeps any real image intact.
function seedOf(id) {
  return String(id).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}
// A genuine image — not the backend's "placeholder" graphic (placehold.co).
function isRealImage(i) {
  const url = i?.document_public_url || i?.url;
  if (!url) return false;
  if (i?.document_id === 'placeholder') return false;
  if (url.includes('placehold.co') || url.includes('placeholder.com')) return false;
  return true;
}
function withRandomImage(item) {
  if (!item) return item;
  const hasReal = Array.isArray(item.image_attached) && item.image_attached.some(isRealImage);
  if (hasReal) return item; // keep genuine images
  // No real image (empty or a backend placeholder) → give it 0..5 demo images.
  const seed = seedOf(item.id);
  const count = seed % 6; // 0..5
  const image_attached = Array.from({ length: count }, (_, i) => ({
    document_public_url: `https://picsum.photos/seed/lbm-${seed}-${i}/480/480`,
  }));
  return { ...item, image_attached };
}

async function mockDelay(ms = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

const _ALLOWED_PRODUCT_SORT_FIELDS = new Set(['id', 'name', 'sku', 'price', 'status', 'updated_at', 'created_at']);
const _ALLOWED_CATEGORY_SORT_FIELDS = new Set(['id', 'name', 'status', 'updated_at', 'created_at']);

function parseSort(sort, allowedFields) {
  const [field, dir] = String(sort || '').split(':');
  if (!allowedFields.has(field)) return ['updated_at', 'desc'];
  return [field, (dir || '').toLowerCase() === 'asc' ? 'asc' : 'desc'];
}
function sortRows(rows, field, direction) {
  const sorted = [...rows].sort((a, b) => {
    const av = a[field], bv = b[field];
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}
function paginate(rows, page, size) {
  const start = (page - 1) * size;
  return rows.slice(start, start + size);
}
function ilikeIncludes(haystack, needle) {
  return String(haystack || '').toLowerCase().includes(String(needle).toLowerCase());
}

export async function fetchProducts(params = {}, signal) {
  await mockDelay();
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const page = Number(params.page) || 1;
  const size = Number(params.size) || 10;
  const categoryId = params.categoryId ?? params.category_id;
  const platformStatus = params.platformStatus ?? params.platform_status;

  let rows = MOCK_PRODUCTS.filter(p => {
    if (params.name && !ilikeIncludes(p.name, params.name)) return false;
    if (params.status && p.status !== params.status) return false;
    if (params.productSource && p.product_source !== params.productSource) return false;
    if (platformStatus && p.platform_status !== platformStatus) return false;
    if (params.published === true && p.platform_status !== 'published') return false;
    if (params.published === false && p.platform_status === 'published') return false;
    if (categoryId && p.category_id !== categoryId) return false;
    if (params.sku && !ilikeIncludes(p.sku, params.sku)) return false;
    if (params.keyword && !(ilikeIncludes(p.sku, params.keyword) || ilikeIncludes(p.name, params.keyword))) return false;
    return true;
  });

  const total = rows.length;
  const [field, direction] = parseSort(params.sort, _ALLOWED_PRODUCT_SORT_FIELDS);
  rows = paginate(sortRows(rows, field, direction), page, size);

  return {
    data: rows.map(p => withRandomImage(mergeOverride(productOverrides, p))),
    meta: { page, size, total, total_pages: size > 0 ? Math.ceil(total / size) : 0 },
  };
}

export async function fetchProductById(id) {
  await mockDelay();
  const product = MOCK_PRODUCTS.find(p => p.id === id) || null;
  if (!product) return { data: null };
  return { data: withRandomImage(mergeOverride(productOverrides, product)) };
}

export async function fetchCategories(params = {}, signal) {
  await mockDelay();
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const page = Number(params.page) || 1;
  const size = Number(params.size) || 10;

  let rows = MOCK_CATEGORIES.filter(c => {
    if (params.name && !ilikeIncludes(c.name, params.name)) return false;
    if (params.status && c.status !== params.status) return false;
    if (params.keyword && !(ilikeIncludes(c.name, params.keyword) || ilikeIncludes(c.description, params.keyword))) return false;
    if (params.has_published === true) {
      const hasPublished = MOCK_PRODUCTS.some(p => p.category_id === c.id && p.platform_status === 'published');
      if (!hasPublished) return false;
    }
    return true;
  });

  const total = rows.length;
  const [field, direction] = parseSort(params.sort, _ALLOWED_CATEGORY_SORT_FIELDS);
  rows = paginate(sortRows(rows, field, direction), page, size);

  return {
    data: rows,
    meta: { page, size, total, total_pages: size > 0 ? Math.ceil(total / size) : 0 },
  };
}

export async function updateProductPlatformStatus(id, platformStatus) {
  await mockDelay();
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  if (!product) return { data: null };
  product.platform_status = platformStatus;
  product.updated_at = new Date().toISOString();
  return { data: withRandomImage(mergeOverride(productOverrides, product)) };
}

// ─── Connected modifiers (MOCK) ─────────────────────────────────────────────
// No backend endpoint exists for per-product modifiers yet. This returns mock
// data with a small async delay so it mirrors the real fetch pattern and can be
// swapped for a real `GET /products/:id/modifiers` call later.
const MOCK_MODIFIER_GROUPS = [
  {
    id: 'mg-sugar', name: 'Sugar', required: false, max: 1,
    options: [
      { id: 'o1', name: 'Brown Sugar', price: 15000 },
      { id: 'o2', name: 'No Sugar', price: 0 },
    ],
  },
  {
    id: 'mg-milk', name: 'Milk', required: false, max: 2,
    options: [
      { id: 'o3', name: 'Full Cream', price: 0 },
      { id: 'o4', name: 'Low Fat', price: 15000 },
      { id: 'o5', name: 'Oat Milk', price: 15000 },
    ],
  },
  {
    id: 'mg-ice', name: 'Ice & Temperature', required: true, max: 1,
    options: [
      { id: 'o6', name: 'Hot', price: 0 },
      { id: 'o7', name: 'Iced', price: 0 },
    ],
  },
  {
    id: 'mg-espresso', name: 'Espresso Strength', required: false, max: 1,
    options: [
      { id: 'o8', name: 'Extra Shot', price: 15000 },
      { id: 'o9', name: 'Ristretto', price: 15000 },
    ],
  },
  {
    id: 'mg-coldfoam', name: 'Cold Foam', required: false, max: 3,
    options: [
      { id: 'o10', name: 'Sweet Cream', price: 10000 },
      { id: 'o11', name: 'Salted Caramel', price: 10000 },
    ],
  },
  {
    id: 'mg-syrups', name: 'Flavor Syrups', required: true, max: 3,
    options: [
      { id: 'o12', name: 'Vanilla', price: 10000 },
      { id: 'o13', name: 'Caramel', price: 10000 },
      { id: 'o14', name: 'Hazelnut', price: 10000 },
    ],
  },
];

// Deterministic per-product subset so different products demonstrate the
// 6 / 2 / 1 / 0 modifier states without any backend.
function mockModifiersForId(id) {
  const seed = String(id).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const counts = [6, 2, 1, 0];
  return MOCK_MODIFIER_GROUPS.slice(0, counts[seed % counts.length]);
}

export async function fetchProductModifiers(id) {
  await mockDelay();
  return { data: mockModifiersForId(id) };
}

// ─── Modifier module (MOCK) — catalog-wide list + detail ─────────────────────
// No backend endpoint yet. Each modifier has options (name/price/available) and
// a list of connected catalogs. Swap for `GET /modifiers` + `/modifiers/:id`.
const MOCK_MODIFIERS = [
  { id: 'md-karbo', name: 'Karbohidrat',
    options: [{ name: 'Nasi Putih', price: 0 }, { name: 'Nasi Goreng', price: 5000 }],
    connected: ['Nasi Ayam Bakar', 'Nasi Ayam Cincang'] },
  { id: 'md-leveles', name: 'Level Es',
    options: [{ name: 'Normal', price: 50000 }, { name: 'Half Sugar', price: 30000 }, { name: 'Less Sugar', price: 10000 }, { name: 'No Sugar', price: 0 }],
    connected: ['Teh Vietnam', 'Kopi Susu', 'Jus Buah'] },
  { id: 'md-levelgula', name: 'Level Gula',
    options: [{ name: 'No Sugar', price: 0 }, { name: 'Less Sugar', price: 0 }, { name: '50% Sugar', price: 0 }, { name: '75% Sugar', price: 0 }, { name: '100% Sugar', price: 0 }],
    connected: ['Teh Vietnam', 'Kopi Susu', 'Jus Buah'] },
  { id: 'md-protein', name: 'Protein',
    options: [{ name: 'Chicken Breast', price: 15000 }, { name: 'Wagyu A5', price: 50000 }],
    connected: ['Salad Bowl', 'Rice Set 2'] },
  { id: 'md-bakpao', name: 'Rasa Bakpao',
    options: [{ name: 'Telur Asin', price: 5000 }, { name: 'Chasiu', price: 8000 }, { name: 'Soysauce', price: 3000 }],
    connected: ['Bakpao Steam 3 Pcs'] },
  { id: 'md-serat', name: 'Serat',
    options: [{ name: 'Brokoli', price: 5000 }, { name: 'Pakcoy', price: 5000 }, { name: 'Horenzo', price: 7000 }],
    connected: [] },
  { id: 'md-sereal', name: 'Sereal',
    options: [{ name: 'Coco Crunch', price: 8000 }, { name: 'Fruit Loops', price: 8000 }],
    connected: ['Breakfast Set'] },
  { id: 'md-kematangan', name: 'Tingkat Kematangan',
    options: [{ name: 'Rare', price: 0 }, { name: 'Medium Rare', price: 0 }, { name: 'Medium', price: 0 }, { name: 'Well Done', price: 0 }],
    connected: ['Ribeye Steak'] },
  { id: 'md-pedas', name: 'Tingkat Pedas',
    options: [{ name: 'Tidak Pedas', price: 0 }, { name: 'Sedikit Pedas', price: 0 }, { name: 'Sedang', price: 0 }, { name: 'Pedas', price: 0 }],
    connected: ['Nasi Goreng', 'Mie Rebus', 'Mie Goreng', 'Bihun Goreng', 'Bihun Kuah'] },
  { id: 'md-indomie', name: 'Tipe Indomie',
    options: [{ name: 'Kuah', price: 0 }, { name: 'Goreng', price: 0 }],
    connected: ['Indomie', 'Indomie Double'] },
  { id: 'md-topping', name: 'Topping',
    options: [{ name: 'Boba', price: 5000 }, { name: 'Jelly', price: 4000 }, { name: 'Cincau', price: 4000 }, { name: 'Grass Jelly', price: 4000 }],
    connected: ['Milk Tea', 'Oolong Tea', 'Apple Tea'] },
  { id: 'md-toppingbuah', name: 'Topping Buah',
    options: [{ name: 'Ceri', price: 6000 }, { name: 'Leci', price: 6000 }, { name: 'Rambutan', price: 6000 }],
    connected: ['Yogurt Light', 'Yogurt Black', 'Yogurt Sakura'] },
  { id: 'md-ukuranminuman', name: 'Ukuran Minuman',
    options: [{ name: 'Small', price: 0 }, { name: 'Medium', price: 3000 }, { name: 'Large', price: 6000 }],
    connected: ['Teh Vietnam', 'Kopi Susu'] },
  { id: 'md-ukurannasi', name: 'Ukuran Nasi',
    options: [{ name: 'Small', price: 0 }, { name: 'Regular', price: 3000 }],
    connected: ['Chicken Set with Rice'] },
];

export async function fetchModifiers(params = {}) {
  await mockDelay();
  const kw = (params.keyword || '').trim().toLowerCase();
  const filtered = kw ? MOCK_MODIFIERS.filter(m => m.name.toLowerCase().includes(kw)) : MOCK_MODIFIERS;
  return { data: filtered, meta: { total: filtered.length } };
}

export async function fetchModifierById(id) {
  await mockDelay();
  return { data: MOCK_MODIFIERS.find(m => m.id === id) || null };
}

// ─── Units (MOCK) ────────────────────────────────────────────────────────────
// No backend endpoint for catalog units yet. Mock data with a small async delay,
// mirroring the real fetch pattern; swap for `GET /units` later.
const MOCK_UNITS = [
  { id: 'u1', name: 'Pcs', catalogCount: 10 },
  { id: 'u2', name: 'Karton', catalogCount: 15 },
  { id: 'u3', name: 'Gram', catalogCount: 20 },
  { id: 'u4', name: 'Kilogram', catalogCount: 20 },
  { id: 'u5', name: 'Box', catalogCount: 11 },
  { id: 'u6', name: 'Liter', catalogCount: 12 },
  { id: 'u7', name: 'Meter', catalogCount: 13 },
  { id: 'u8', name: 'Roll', catalogCount: 8 },
  { id: 'u9', name: 'Pack', catalogCount: 8 },
  { id: 'u10', name: 'Set', catalogCount: 13 },
  { id: 'u11', name: 'Dozen', catalogCount: 8 },
  { id: 'u12', name: 'Sheet', catalogCount: 12 },
  { id: 'u13', name: 'Bottle', catalogCount: 6 },
  { id: 'u14', name: 'Bag', catalogCount: 9 },
  { id: 'u15', name: 'Pair', catalogCount: 7 },
  { id: 'u16', name: 'Unit', catalogCount: 5 },
];

export async function fetchUnits() {
  await mockDelay();
  return { data: MOCK_UNITS, meta: { total: MOCK_UNITS.length } };
}

// ─── Packages (MOCK) ─────────────────────────────────────────────────────────
// No backend endpoint for packages (bundles) yet. Mock data mirroring the
// product shape, plus a `catalog_items` list of the products inside each bundle.
const PACKAGE_CATALOG_ITEMS = [
  { id: 'ci1', name: 'Iced Strawberry Latte', qty: 1, price: 32000, out_of_stock: false },
  { id: 'ci2', name: 'Strawberry Mille Crepes with Rasberry Chunks', qty: 1, price: 60000, out_of_stock: true },
  { id: 'ci3', name: 'Strawberry Pudding', qty: 1, price: 60000, out_of_stock: false },
];

const MOCK_PACKAGES = Array.from({ length: 13 }, (_, i) => {
  const letter = String.fromCharCode(65 + i); // A..M
  const hasDims = i % 4 !== 1; // some rows missing weight/volume
  return {
    id: `pkg-${i + 1}`,
    name: i === 0 ? 'Strawberry Special' : `Bundle ${letter}`,
    sku: `PKG-${1000 + i}`,
    selling_price: 36000,
    platform_status: i % 3 === 1 ? 'draft' : 'published',
    gross_weight: hasDims ? 200 + i * 100 : null,
    length: hasDims ? 12 + i : null,
    width: hasDims ? 18 + i : null,
    height: hasDims ? 12 + i : null,
    sold_count: i === 0 ? 200 : (i * 7) % 90,
    image_attached: [],
    catalog_items: PACKAGE_CATALOG_ITEMS,
  };
});

export async function fetchPackages(params = {}, signal) {
  await mockDelay();
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const kw = (params.keyword || '').trim().toLowerCase();
  const filtered = (kw ? MOCK_PACKAGES.filter(p => p.name.toLowerCase().includes(kw)) : MOCK_PACKAGES)
    .map(p => withPackageImages(mergeOverride(packageOverrides, p)));
  return { data: filtered, meta: { total: filtered.length } };
}

export async function fetchPackageById(id) {
  await mockDelay();
  const pkg = MOCK_PACKAGES.find(p => p.id === id) || null;
  return { data: withPackageImages(mergeOverride(packageOverrides, pkg)) };
}

// Give packages a spread of image counts (0,1,2,3,4,5 …) by their position in
// the mock list, so the detail gallery demonstrates each case.
const PACKAGE_INDEX = new Map(MOCK_PACKAGES.map((p, i) => [p.id, i]));
function withPackageImages(pkg) {
  if (!pkg) return pkg;
  const count = (PACKAGE_INDEX.get(pkg.id) ?? 0) % 6; // 0..5
  const seed = seedOf(pkg.id);
  const image_attached = Array.from({ length: count }, (_, i) => ({
    document_public_url: `https://picsum.photos/seed/lbm-${seed}-${i}/480/480`,
  }));
  return { ...pkg, image_attached };
}
