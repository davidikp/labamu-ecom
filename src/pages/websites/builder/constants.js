import { ShoppingBag, FileText, Calendar, MapPin, Mail, MessageSquare } from 'lucide-react';

export const BASE_CONFIG = {
  heroTitle: '', heroSubtitle: '', heroEnabled: true, footerDesc: '',
  enableCheckout: true,
  featuredSections: [],   // [{id: string, name: string}] — up to 2 homepage featured categories
  nav: { home: '', shop: '', appointment: '', reviews: '', contact: '', location: '', quote: '' },
  cta: { title: '', subtitle: '', button: '' },
  categories: { house: '', glass: '', safety: '', foundation: '', paints: '', roofing: '', doors: '', excavation: '' },
  appointment: { title: '', subtitle: '', button: '' },
  sections: { highRise: '', safetyTools: '', seeAll: '' },
  productsData: {
    ladder: '', levelKit: '', scaffoldMetal: '', scaffoldTower: '', rammer: '',
    ladderSteel: '', helmet: '', harness: '', gloves: '', lifeline: '', glovesHeavy: ''
  },
  reviews: {
    title: '', formSubtitle: '', nameLabel: '', namePlaceholder: '',
    reviewLabel: '', reviewPlaceholder: '', ratingLabel: '', submit: ''
  },
  waitlist: { title: '', subtitle: '', button: '' },
  contact: {
    title: '',
    description: '',
    headerImage: '',
    requiredFields: { salutation: false, email: true, phone: true },
    businessEmail: '',
    confirmationMessage: '',
  },
  map: { title: '', subtitle: '', address: '' },
  rfq: {
    title: '', subtitle: '',
    bgImage: '',
    form: { namePlaceholder: '', emailPlaceholder: '', phonePlaceholder: '', messagePlaceholder: '', submit: '' }
  },
  footer: { location: '', address: '', phone: '', email: '', categoryTitle: '', categories: [], followUs: '' },
  customPages: {},
  previewOnly: '',
};

export const ALL_LANGUAGES = [
  { code: 'af', label: 'Afrikaans' },     { code: 'ar', label: 'Arabic' },
  { code: 'bn', label: 'Bengali' },       { code: 'bg', label: 'Bulgarian' },
  { code: 'ca', label: 'Catalan' },       { code: 'zh', label: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: 'Chinese (Traditional)' }, { code: 'hr', label: 'Croatian' },
  { code: 'cs', label: 'Czech' },         { code: 'da', label: 'Danish' },
  { code: 'nl', label: 'Dutch' },         { code: 'en', label: 'English' },
  { code: 'fi', label: 'Finnish' },       { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },        { code: 'el', label: 'Greek' },
  { code: 'hi', label: 'Hindi' },         { code: 'hu', label: 'Hungarian' },
  { code: 'id', label: 'Indonesian' },    { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' },      { code: 'ko', label: 'Korean' },
  { code: 'ms', label: 'Malay' },         { code: 'no', label: 'Norwegian' },
  { code: 'fa', label: 'Persian' },       { code: 'pl', label: 'Polish' },
  { code: 'pt', label: 'Portuguese' },    { code: 'ro', label: 'Romanian' },
  { code: 'ru', label: 'Russian' },       { code: 'sr', label: 'Serbian' },
  { code: 'sk', label: 'Slovak' },        { code: 'sl', label: 'Slovenian' },
  { code: 'es', label: 'Spanish' },       { code: 'sw', label: 'Swahili' },
  { code: 'sv', label: 'Swedish' },       { code: 'ta', label: 'Tamil' },
  { code: 'th', label: 'Thai' },          { code: 'tr', label: 'Turkish' },
  { code: 'uk', label: 'Ukrainian' },     { code: 'vi', label: 'Vietnamese' },
];

export const getTranslatedFeatures = (t) => [
  { id: 'shop',        title: t('template_houzez.nav.shop'),        description: t('studio.features.shopCatalogDesc'), icon: ShoppingBag },
  { id: 'quote',       title: t('template_houzez.nav.quote'),       description: t('studio.features.quoteDesc'),       icon: FileText },
  { id: 'appointment', title: t('template_houzez.nav.appointment'), description: t('studio.features.appointmentDesc'), icon: Calendar },
  { id: 'location',    title: t('template_houzez.nav.location'),    description: t('studio.features.locationDesc'),    icon: MapPin },
  { id: 'contact',     title: t('template_houzez.nav.contact'),     description: t('studio.features.contactDesc'),     icon: Mail },
  { id: 'reviews',     title: t('template_houzez.nav.reviews'),     description: t('studio.features.reviewsDesc'),     icon: MessageSquare },
];
