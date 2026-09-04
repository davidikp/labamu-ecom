import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enWebsite from './locales/en/website.json';
import enCommon from './locales/en/common.json';
import enDelivery from './locales/en/delivery.json';
import enCatalog from './locales/en/catalog.json';
import enSectionBuilder from './locales/en/sectionBuilder.json';
import enOrders from './locales/en/orders.json';

import idAuth from './locales/id/auth.json';
import idDashboard from './locales/id/dashboard.json';
import idWebsite from './locales/id/website.json';
import idCommon from './locales/id/common.json';
import idDelivery from './locales/id/delivery.json';
import idCatalog from './locales/id/catalog.json';
import idSectionBuilder from './locales/id/sectionBuilder.json';
import idOrders from './locales/id/orders.json';

const resources = {
  en: {
    auth: enAuth,
    dashboard: enDashboard,
    website: enWebsite,
    common: enCommon,
    delivery: enDelivery,
    catalog: enCatalog,
    sectionBuilder: enSectionBuilder,
    orders: enOrders,
  },
  id: {
    auth: idAuth,
    dashboard: idDashboard,
    website: idWebsite,
    common: idCommon,
    delivery: idDelivery,
    catalog: idCatalog,
    sectionBuilder: idSectionBuilder,
    orders: idOrders,
  }
};

// Retrieve saved language from localStorage or default to ID
const savedLang = localStorage.getItem('lb_lang') || 'id';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'id',
    // We bind default namespace to 'dashboard' just in case, but we explicit target 'auth:key' in components
    defaultNS: 'dashboard',
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
