/**
 * @module mocks/company
 * @description In-memory mock for company REST endpoints.
 * Registered at app startup in main.jsx behind VITE_USE_MOCK_API guard.
 */
import { registerMock } from '../api/client.js';

const COMPANY_DETAIL = {
  "id": 478,
  "company_name": "TeakWorks",
  "company_official_name": "PT. TeakWorks Global Mandiri",
  "company_whatsapp": "+6282110989696",
  "company_uid": "bpo3ok",
  "company_slug": "teakworks-1",
  "company_address": "Jl. Raya Jepara No. 12",
  "company_city": "Kabupaten Jepara",
  "company_province": "Jawa Tengah",
  "company_district": "Kedung",
  "company_village": "Kedungmalang",
  "company_country": "Indonesia",
  "company_zipcode": "59463",
  "company_email_contact": "info@teakworks.id",
  "company_phone": "+6281298765432",
  "company_lat": -6.5891,
  "company_long": 110.6742,
  "company_tax_number": "08.230.138.0-130.021",
  "company_rt": "015",
  "company_rw": "002",
  "type": "OUTLET",
  "business_entity": {
    "name_en": "pt"
  },
  "company_product_types": {
    "name_id": "both"
  },
  "company_industry": {
    "id": 29,
    "name_id": "Manufaktur",
    "name_en": "Manufacturing"
  },
  "business_activity": {
    "business_activity": "offline"
  }
};

registerMock('GET', '/companies/:uid', (_params) => {
  return { data: COMPANY_DETAIL };
});

registerMock('PUT', '/companies/:uid', (_params, body) => {
  Object.assign(COMPANY_DETAIL, body);
  return { data: COMPANY_DETAIL };
});
