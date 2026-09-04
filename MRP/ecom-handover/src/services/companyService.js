import { INDUSTRY_IDS, INDUSTRY_LABELS } from '../constants/industries.js';

// ─── Mock company data ───────────────────────────────────────────────────────
// Ported from the former FastAPI demo seed so local iteration doesn't depend
// on a backend. `synced_at` is mutated in place on sync(), mirroring the
// real endpoint's "update timestamp" behavior (resets on a full page reload).
const MOCK_COMPANY = {
  id: 'company-001',
  tenant_id: 'tenant-001',
  company_name: 'TeakWorks',
  company_official_name: 'PT. TeakWorks Global Mandiri',
  company_whatsapp: '+6282110989696',
  company_uid: 'bpo3ok',
  company_slug: 'teakworks-1',
  company_address: 'Jl. Raya Jepara No. 12',
  company_city: 'Kabupaten Jepara',
  company_province: 'Jawa Tengah',
  company_district: 'Kedung',
  company_village: 'Kedungmalang',
  company_country: 'Indonesia',
  company_zipcode: '59463',
  company_email_contact: 'info@teakworks.id',
  company_phone: '+6281298765432',
  company_lat: -6.5891,
  company_long: 110.6742,
  company_tax_number: '08.230.138.0-130.021',
  company_rt: '015',
  company_rw: '002',
  company_type: 'OUTLET',
  business_entity_name_en: 'pt',
  company_product_types_name_id: 'both',
  company_industry_id: 29,
  company_industry_name_id: 'Manufaktur',
  company_industry_name_en: 'Manufacturing',
  business_activity: 'offline',
  membership: 'pro',
  logo_url: '/assets/teakworks-logo.png',
  synced_at: null,
};

const mapApiResponse = (data) => {
  if (!data) return null;

  const industryKey = INDUSTRY_IDS[data.company_industry_id] ?? 'other';

  return {
    // ── Identity ──────────────────────────────────────────────────
    id: data.id,
    businessName: data.company_official_name || data.company_name,
    legalName: data.company_official_name || data.company_name,
    brandName: data.company_name,
    uid: data.company_uid,
    slug: data.company_slug,

    // ── Contact ───────────────────────────────────────────────────
    address: data.company_address,
    city: data.company_city,
    province: data.company_province,
    district: data.company_district || '',
    region: data.company_village || '',
    rt: data.company_rt || '',
    rw: data.company_rw || '',
    provinceEn: data.company_province,
    country: data.company_country,
    countryEn: data.company_country,
    postalCode: data.company_zipcode,
    email: data.company_email_contact,
    phone: data.company_phone,
    whatsapp: data.company_whatsapp,
    lat: data.company_lat,
    long: data.company_long,

    // ── Tax ───────────────────────────────────────────────────────
    businessNpwp: data.company_tax_number,
    personalNpwp: data.company_tax_number, // TODO engineer: split into separate API fields when Labamu Core exposes them separately

    // ── Classifications ──────────────────────────────────────────
    entity: data.business_entity_name_en || 'pt',

    type: data.company_product_types_name_id || 'both',

    industryId: data.company_industry_id,
    industry: industryKey,
    industryLabelKey: INDUSTRY_LABELS[industryKey] ?? '',
    industryLabelEn: data.company_industry_name_en,
    industryLabel: data.company_industry_name_id,

    activity: data.business_activity || 'offline',

    membership: data.membership || 'pro',
    logoUrl: data.logo_url || '/assets/teakworks-logo.png',
    syncedAt: data.synced_at,
  };
};

async function mockDelay(ms = 300) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export async function getCompanyInfo() {
  await mockDelay();
  return mapApiResponse(MOCK_COMPANY);
}

export async function syncCompanyInfo() {
  await mockDelay();
  MOCK_COMPANY.synced_at = new Date().toISOString();
  return mapApiResponse(MOCK_COMPANY);
}
