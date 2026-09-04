import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../../../../contexts/SnackbarContext';
import PreviewLayout from '../../PreviewLayout';
import PhoneInput from '../../../../components/ui/PhoneInput';
import Dropdown from '../../../../components/ui/Dropdown';
import { submitRfq } from '../../../../services/rfqService';
import ShopPage from '../../shared/ShopPage';
import { fetchProducts, fetchCategories } from '../../../../services/catalogService';
import { Dropdown as CeDropdown, TextField, NumberField } from '../../../../ce-ui';
import useRegions from '../../../../hooks/useRegions';
import { fetchZipCode } from '../../../../services/regions';
import StaticMapPreview from '../../../../components/StaticMapPreview';
import lalamoveLogo from '../../../../assets/delivery/lalamove-logo.png';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SALUTATION_OPTIONS = [
  { id: 'mr',  label: 'Mr.'  },
  { id: 'mrs', label: 'Mrs.' },
  { id: 'ms',  label: 'Ms.'  },
  { id: 'dr',  label: 'Dr.'  },
];

// Demo-only phone lookup — no backend yet.
const MOCK_CUSTOMERS_DB = {
  '81234567890': {
    name: 'Charlie',
    phone: '81234567890',
    email: 'charlie@mail.com',
    country: 'Indonesia',
    province: 'Banten',
    city: 'Kota Tangerang',
    district: 'Pinang',
    region: 'Kunciran',
    zip: '15320',
    address: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45',
    pinpointAddress: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45',
    notes: 'Drop at receptionist',
  },
};

function formatRp(value) {
  if (value == null || value === '') return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

const Field = ({ label, required, children }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '12px', fontWeight: 400, color: '#374151' }}>
      {required && <span style={{ color: '#DC2626' }}>* </span>}{label}
    </label>
    {children}
  </div>
);

// Mock place search results — stand-in for the Google Places Autocomplete API.
const CUSTOMER_PLACE_SUGGESTIONS = [
  { id: 'p1', country: 'Indonesia', label: 'Jalan Taman Surya 2 I No. 23, Pegadungan, Kalideres', lat: -6.1352, lng: 106.7104 },
  { id: 'p2', country: 'Indonesia', label: 'Jalan Sudirman Kav. 52-53, Senayan, Jakarta Selatan', lat: -6.2245, lng: 106.8090 },
  { id: 'p3', country: 'Indonesia', label: 'Jalan Braga No. 1, Braga, Bandung', lat: -6.9166, lng: 107.6083 },
  { id: 'p4', country: 'Indonesia', label: 'Jalan Malioboro No. 52-58, Yogyakarta', lat: -7.7925, lng: 110.3654 },
  { id: 'p5', country: 'Indonesia', label: 'Jalan Tunjungan No. 1, Surabaya', lat: -7.2621, lng: 112.7378 },
];

const LALAMOVE_DELIVERY_OPTIONS = [
  { id: 'lalamove', label: 'Lalamove', cost: 24000 },
];

// Demo-only Lalamove coverage check — no real courier coverage API wired up yet.
const LALAMOVE_COVERED_CITIES = ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur', 'Bandung', 'Surabaya', 'Yogyakarta'];

const SHOP_SORT_MAP = {
  newest:     'updated_at:desc',
  oldest:     'updated_at:asc',
  price_asc:  'price:asc',
  price_desc: 'price:desc',
};

const NavButton = ({ children, active, onClick }) => (
  <button 
    onClick={onClick} 
    style={{ 
      background: 'none', 
      border: 'none', 
      cursor: 'pointer', 
      color: '#16894B', 
      fontWeight: active ? 700 : 500, 
      fontSize: 'inherit',
      transition: 'all 0.1s ease',
      padding: 0
    }}
  >
    {children}
  </button>
);

export function HouzezPreview({
  isMobile: isMobileProp = false,
  builderConfig = null,
  isBuilderMode = false,
  previewLanguages = [],
  builderActiveLang = 'en',
  selectedFeatures = new Set(['shop', 'contact', 'quote', 'location', 'social']),
  featureOrder = ['shop', 'contact', 'quote', 'appointment', 'location', 'social', 'reviews', 'custom']
}) {
  const { t, i18n } = useTranslation();
  const { showSnackbar } = useSnackbar();

  // Auto-detect viewport width when not controlled by TemplateBuilder
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    if (isBuilderMode) return; // builder controls isMobile via prop
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [isBuilderMode]);
  const isMobile = isMobileProp || (!isBuilderMode && windowWidth < 768);

  const [activeSection, setActiveSection] = useState('home');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [phoneStr, setPhoneStr] = useState('');
  const [salutationVal, setSalutationVal] = useState('');
  const [rfqName, setRfqName]               = useState('');
  const [rfqEmail, setRfqEmail]             = useState('');
  const [rfqPhoneStr, setRfqPhoneStr]       = useState('');
  const [rfqMessage, setRfqMessage]         = useState('');
  const [rfqAddress, setRfqAddress]         = useState('');
  const [rfqItems, setRfqItems]             = useState([]);
  const [rfqProducts, setRfqProducts]       = useState([]);
  const [rfqSubmitting, setRfqSubmitting]   = useState(false);
  const [rfqModalOpen, setRfqModalOpen]     = useState(false);
  const [rfqAttachments, setRfqAttachments] = useState([]);  // [{ name, url, type, size }]
  const [rfqAddProductOpen, setRfqAddProductOpen] = useState(false);
  const [rfqProductDraft, setRfqProductDraft]     = useState(null); // { product, qty, notes, files }
  const rfqAttachInputRef   = useRef(null);
  const rfqProductFilesRef  = useRef(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Client-side only cart — there is no order/checkout backend yet.
  const [cartItems, setCartItems] = useState([]);
  const [orderNotesEnabled, setOrderNotesEnabled] = useState(false);
  const [orderNotesText, setOrderNotesText] = useState('');
  const [shippingMethod, setShippingMethod] = useState('delivery'); // 'delivery' | 'pickup'
  const [deliveryOption, setDeliveryOption] = useState(null); // null | 'lalamove'
  const [customerInfo, setCustomerInfo] = useState(null); // { name, phone, email, address, ... } | null
  const [customerModalStep, setCustomerModalStep] = useState(null); // null | 'phone' | 'detail'
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  const [customerDetailDraft, setCustomerDetailDraft] = useState(null);
  const [customerDetailErrors, setCustomerDetailErrors] = useState({});
  const [customerLookupError, setCustomerLookupError] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerZipLoading, setCustomerZipLoading] = useState(false);
  const [customerPinpointOptions, setCustomerPinpointOptions] = useState([]);
  const [customerPinpointLoading, setCustomerPinpointLoading] = useState(false);
  const [customerSelectedPlace, setCustomerSelectedPlace] = useState(null);
  const [, setPickupLocationRetryCount] = useState(0);
  const customerPinpointTimeoutRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailQty, setDetailQty] = useState(1);

  const cartHasPickupOnlyItem = React.useMemo(
    () => cartItems.some(i => i.fulfillmentType === 'pickup'),
    [cartItems]
  );

  useEffect(() => {
    if (cartHasPickupOnlyItem) setShippingMethod('pickup');
  }, [cartHasPickupOnlyItem]);

  const cartSubtotal = React.useMemo(
    () => cartItems.reduce((sum, i) => sum + (i.price || 0) * i.qty, 0),
    [cartItems]
  );

  const [deliveryOptionCosts, setDeliveryOptionCosts] = useState(
    () => Object.fromEntries(LALAMOVE_DELIVERY_OPTIONS.map(o => [o.id, o.cost]))
  );
  const [shippingCalculatedSignature, setShippingCalculatedSignature] = useState(null);

  const cartSignature = cartItems.map(i => `${i.id}:${i.qty}`).join('|');

  useEffect(() => {
    if (shippingMethod === 'delivery' && customerInfo && shippingCalculatedSignature === null) {
      setShippingCalculatedSignature(cartSignature);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingMethod, customerInfo, shippingCalculatedSignature]);

  const isOutOfLalamoveCoverage = shippingMethod === 'delivery' && !!customerInfo?.city
    && !LALAMOVE_COVERED_CITIES.some(c => customerInfo.city.toLowerCase().includes(c.toLowerCase()));

  const isShippingStale = shippingMethod === 'delivery' && !!customerInfo && !!deliveryOption && !isOutOfLalamoveCoverage
    && shippingCalculatedSignature !== null && shippingCalculatedSignature !== cartSignature;

  function handleRecalculateShipping() {
    const totalQty = cartItems.reduce((sum, i) => sum + i.qty, 0);
    const surcharge = Math.max(0, totalQty - 1) * 2000;
    setDeliveryOptionCosts(Object.fromEntries(LALAMOVE_DELIVERY_OPTIONS.map(o => [o.id, o.cost + surcharge])));
    setShippingCalculatedSignature(cartSignature);
  }

  const shippingCost = shippingMethod === 'delivery' && deliveryOption && !isOutOfLalamoveCoverage
    ? (deliveryOptionCosts[deliveryOption] || 0)
    : 0;

  const { countries: customerCountries, provinces: customerProvinces, cities: customerCities, districts: customerDistricts, villages: customerVillages } = useRegions(
    customerDetailDraft?.country, customerDetailDraft?.province, customerDetailDraft?.city, customerDetailDraft?.district
  );

  function scopedCustomerPlaces(query) {
    const country = customerDetailDraft?.country;
    const scoped = country ? CUSTOMER_PLACE_SUGGESTIONS.filter(p => p.country === country) : CUSTOMER_PLACE_SUGGESTIONS;
    const q = query.trim().toLowerCase();
    return q ? scoped.filter(p => p.label.toLowerCase().includes(q)) : scoped;
  }

  function handleCustomerPinpointSearch(query) {
    setCustomerPinpointLoading(true);
    window.clearTimeout(customerPinpointTimeoutRef.current);
    customerPinpointTimeoutRef.current = window.setTimeout(() => {
      setCustomerPinpointOptions(scopedCustomerPlaces(query).map(p => ({ value: p.id, label: p.label })));
      setCustomerPinpointLoading(false);
    }, 300);
  }

  function handleCustomerSelectPlace(placeId) {
    const place = CUSTOMER_PLACE_SUGGESTIONS.find(p => p.id === placeId);
    setCustomerSelectedPlace(place ?? null);
    if (place) setCustomerDetailDraft(d => ({ ...d, pinpointAddress: place.label, address: d?.address || place.label }));
  }

  useEffect(() => {
    if (customerModalStep !== 'detail') return;
    const base = scopedCustomerPlaces('').map(p => ({ value: p.id, label: p.label }));
    setCustomerPinpointOptions(
      customerSelectedPlace && !base.some(o => o.value === customerSelectedPlace.id)
        ? [{ value: customerSelectedPlace.id, label: customerSelectedPlace.label }, ...base]
        : base
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerModalStep, customerDetailDraft?.country]);

  useEffect(() => {
    if (!customerDetailDraft?.region || customerDetailDraft?.country !== 'Indonesia') return;
    let cancelled = false;
    setCustomerZipLoading(true);
    fetchZipCode(customerDetailDraft.region, customerDetailDraft.district).then(({ data }) => {
      if (cancelled) return;
      setCustomerZipLoading(false);
      setCustomerDetailDraft(d => (d ? { ...d, zip: data ?? '' } : d));
    });
    return () => { cancelled = true; };
  }, [customerDetailDraft?.region, customerDetailDraft?.district, customerDetailDraft?.country]);

  // Client-side only appointment booking — no backend yet.
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [apptName, setApptName] = useState('');
  const [apptPhoneStr, setApptPhoneStr] = useState('');
  const [apptDate, setApptDate] = useState('');

  // Client-side only reviews — submitted reviews are appended for this session only.
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState([]);

  // Client-side only contact form — no backend yet.
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const [activeView, setActiveView] = useState('home'); // 'home' | 'shop' | 'detail' | 'cart'
  // Online checkout: honor the merchant's saved toggle when a config exists;
  // default to ON in the plain showcase demo (no saved config at all) so the
  // cart flow is visible out of the box.
  const checkoutEnabled = builderConfig ? builderConfig.enableCheckout === true : true;
  const [shopInitialCategory, setShopInitialCategory] = useState('all');

  // Shop API state — only populated in builder mode
  const [shopProducts,       setShopProducts]       = useState([]);
  const [shopCategories,     setShopCategories]     = useState([]);
  const [shopTotal,          setShopTotal]          = useState(0);
  const [shopPage,           setShopPage]           = useState(1);
  const [shopLoading,        setShopLoading]        = useState(false);
  const [shopCategoryFilter, setShopCategoryFilter] = useState(undefined);
  const [shopSort,           setShopSort]           = useState('updated_at:desc');
  const [homepageSectionProducts, setHomepageSectionProducts] = useState({});

  // Derive primitive boolean — avoids Set reference churn in useEffect deps
  const shopFeatureEnabled = selectedFeatures.has('shop');

  const banners = builderConfig?.banners?.length > 0 ? builderConfig.banners : ['/assets/templates/houzez/assets/houzez-banner.png'];
  const bAddr = builderConfig?.businessAddress;
  const formattedAddress = bAddr && (bAddr.street || bAddr.city)
    ? [bAddr.street, bAddr.city, bAddr.province, bAddr.postalCode, bAddr.country].filter(Boolean).join(', ')
    : null;

  useEffect(() => {
    const savedLang = localStorage.getItem('lb_lang');
    if (savedLang && i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);


  useEffect(() => {
    if (!isBuilderMode) return;          // showcase uses static asset products
    if (!shopFeatureEnabled) return;     // shop disabled, skip fetch
    if (activeView !== 'shop') return;   // only fetch when shop view is active

    const controller = new AbortController();
    setShopLoading(true);

    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetchProducts({
            size: 16,
            page: shopPage,
            platform_status: 'published',
            sort: shopSort,
            ...(shopCategoryFilter ? { category_id: shopCategoryFilter } : {}),
          }, controller.signal),
          fetchCategories({ status: 'ACTIVE', has_published: true, size: 100 }, controller.signal),
        ]);
        setShopProducts((prodRes.data || []).map(p => ({
          id: p.id,
          name: p.name,
          price: p.selling_price ?? p.price,
          image_url:
            p.image_attached?.find(i => i.is_primary)?.document_public_url
            ?? p.image_attached?.[0]?.document_public_url
            ?? null,
          category_id: p.category_id,
        })));
        // Raw categories only — ShopPage's CategorySidebar prepends 'All Categories' internally
        setShopCategories((catRes.data || []).map(c => ({ id: c.id, name: c.name })));
        setShopTotal(prodRes.meta?.total ?? 0);
      } catch (e) {
        if (e.name === 'AbortError') return;
        console.error('Shop data fetch failed:', e);
        setShopProducts([]);
        setShopTotal(0);
      } finally {
        setShopLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [isBuilderMode, shopPage, shopCategoryFilter, shopSort, shopFeatureEnabled, activeView]);

  // Fetch products for homepage featured sections (builder mode only)
  useEffect(() => {
    if (!isBuilderMode) return;
    const featured = builderConfig?.featuredSections;
    if (!featured?.length) { setHomepageSectionProducts({}); return; }

    const controller = new AbortController();
    const formatPrice = (val) => new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(val);

    Promise.all(
      featured.map(sec =>
        fetchProducts({ size: 6, category_id: sec.id, platform_status: 'published' }, controller.signal)
          .then(r => ({
            id: sec.id,
            items: (r.data || []).map(p => ({
              id: p.id,
              name: p.name,
              price: formatPrice(p.selling_price ?? p.price),
              img: p.image_attached?.find(i => i.is_primary)?.document_public_url
                ?? p.image_attached?.[0]?.document_public_url ?? null,
            })),
          }))
      )
    ).then(results => {
      const map = {};
      results.forEach(r => { map[r.id] = r.items; });
      setHomepageSectionProducts(map);
    }).catch(() => {});

    return () => controller.abort();
  }, [isBuilderMode, builderConfig?.featuredSections]);

  const toggleLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lb_lang', lang);
    setShowLangMenu(false);
  };

  const hpT = (key, def) => t(`website:template_houzez.${key}`, def);

  const content = React.useMemo(() => ({
    nav: {
      home: builderConfig?.nav?.home || hpT('nav.home', 'Home'),
      shop: builderConfig?.nav?.shop || hpT('nav.shop', 'Shop'),
      appointment: builderConfig?.nav?.appointment || hpT('nav.appointment', 'Make an Appointment'),
      reviews: builderConfig?.nav?.reviews || hpT('nav.reviews', 'Reviews'),
      contact: builderConfig?.nav?.contact || hpT('nav.contact', 'Contact Us'),
      location: builderConfig?.nav?.location || hpT('nav.location', 'Location'),
      quote: builderConfig?.nav?.quote || hpT('nav.quote', 'Request Quote')
    },
    hero: {
      title: builderConfig?.heroTitle || hpT('hero.title', 'Create your ideal home with us'),
      subtitle: builderConfig?.heroSubtitle || hpT('hero.subtitle', 'Everything you need to build your home, we provide.')
    },
    cta: {
      title: builderConfig?.cta?.title || hpT('cta.title', 'Book an Appointment!'),
      subtitle: builderConfig?.cta?.subtitle || hpT('cta.subtitle', 'Visit our showroom or request a professional consultation at your site today.'),
      button: builderConfig?.cta?.button || hpT('cta.button', 'Book Now')
    },
    appointment: {
      title: builderConfig?.appointment?.title || hpT('appointment.title', 'Book an Appointment!'),
      subtitle: builderConfig?.appointment?.subtitle || hpT('appointment.subtitle', 'Let’s meet and discuss further on your construction needs'),
      button: builderConfig?.appointment?.button || hpT('appointment.button', 'Book Now')
    },
    categories: {
      house: builderConfig?.categories?.house || hpT('categories.house', 'House Construction'),
      glass: builderConfig?.categories?.glass || hpT('categories.glass', 'Glass Pane'),
      safety: builderConfig?.categories?.safety || hpT('categories.safety', 'Safety Tools'),
      foundation: builderConfig?.categories?.foundation || hpT('categories.foundation', 'Foundation'),
      paints: builderConfig?.categories?.paints || hpT('categories.paints', 'Paints and Flooring'),
      roofing: builderConfig?.categories?.roofing || hpT('categories.roofing', 'Roofing'),
      doors: builderConfig?.categories?.doors || hpT('categories.doors', 'Doors and Windows'),
      excavation: builderConfig?.categories?.excavation || hpT('categories.excavation', 'Excavation')
    },
    sections: {
      highRise: builderConfig?.sections?.highRise || hpT('sections.highRise', 'High-Rise Needs'),
      safetyTools: builderConfig?.sections?.safetyTools || hpT('sections.safetyTools', 'Safety Tools'),
      seeAll: builderConfig?.sections?.seeAll || hpT('sections.seeAll', 'See All')
    },
    productsData: {
      ladder: builderConfig?.productsData?.ladder || hpT('products.ladder', 'KRISBOW Ladder Rolling Multi PRLRM1108 1.1m 4-Step'),
      levelKit: builderConfig?.productsData?.levelKit || hpT('products.levelKit', 'DEWALT Builders Level Kit DW090PK 1set'),
      scaffoldMetal: builderConfig?.productsData?.scaffoldMetal || hpT('products.scaffoldMetal', 'METALTECH Portable Scaffold 6-11/64 ft.L Steel Platform'),
      scaffoldTower: builderConfig?.productsData?.scaffoldTower || hpT('products.scaffoldTower', 'WERNER Scaffold Tower 75 H, 41D335'),
      rammer: builderConfig?.productsData?.rammer || hpT('products.rammer', 'Hyundai Tamping Rammers HDCR 88H 1pc'),
      ladderSteel: builderConfig?.productsData?.ladderSteel || hpT('products.ladderSteel', 'Cotterman Rolling Steel Ladder 450-Lb. Capacity'),
      helmet: builderConfig?.productsData?.helmet || hpT('products.helmet', 'Safety Helmet Construction Hard Hat Dark Blue'),
      harness: builderConfig?.productsData?.harness || hpT('products.harness', 'Safety Full Body Harness Five Point Construction Double Hook'),
      gloves: builderConfig?.productsData?.gloves || hpT('products.gloves', '48-22-8951 CUT 5 Dipped Safety Gloves Size M'),
      lifeline: builderConfig?.productsData?.lifeline || hpT('products.lifeline', 'Rebel Self Retracting Lifeline Stainless Cable 30ft'),
      glovesHeavy: builderConfig?.productsData?.glovesHeavy || hpT('products.glovesHeavy', 'SARUNG TANGAN SAFETY KONG HEAVY DUTY HIGH VISIBILITY')
    },
    reviewsSection: {
      title: builderConfig?.reviews?.title || hpT('reviews.title', 'What They Say'),
      formSubtitle: builderConfig?.reviews?.formSubtitle || hpT('reviews.form.subtitle', 'Leave us your thoughts on how do you like our service'),
      nameLabel: builderConfig?.reviews?.nameLabel || hpT('reviews.form.nameLabel', 'Name'),
      namePlaceholder: builderConfig?.reviews?.namePlaceholder || hpT('reviews.form.namePlaceholder', 'Input your name'),
      reviewLabel: builderConfig?.reviews?.reviewLabel || hpT('reviews.form.reviewLabel', 'Review'),
      reviewPlaceholder: builderConfig?.reviews?.reviewPlaceholder || hpT('reviews.form.reviewPlaceholder', 'Write your review'),
      ratingLabel: builderConfig?.reviews?.ratingLabel || hpT('reviews.form.ratingLabel', 'Rating'),
      submit: builderConfig?.reviews?.submit || hpT('reviews.form.submit', 'Give Rating'),
      items: [
        { name: 'John Doe', text: builderConfig?.reviews?.itemsTitle1 || hpT('reviews.items.0.text', '“Worked with Houzez on all my property. Never once I were disappointed because they are bomb”') },
        { name: 'Angelina Carpenter', text: builderConfig?.reviews?.itemsTitle2 || hpT('reviews.items.1.text', '“Worked with Houzez on all my property. Never once I were disappointed because they are bomb”') },
        { name: 'Nichole Smith', text: builderConfig?.reviews?.itemsTitle3 || hpT('reviews.items.2.text', '“Worked with Houzez on all my property. Never once I were disappointed because they are bomb”') }
      ]
    },
    waitlist: {
      title: builderConfig?.waitlist?.title || hpT('waitlist.title', 'Join Waitlist'),
      subtitle: builderConfig?.waitlist?.subtitle || hpT('waitlist.subtitle', "Can't Find a Slot? Join the waitlist and we'll notify you if an earlier appointment becomes available. Your time matters to us."),
      button: builderConfig?.waitlist?.button || hpT('waitlist.button', 'Join Now')
    },
    contact: {
      title: builderConfig?.contact?.title || hpT('contact.title', 'Contact Us'),
      subtitle: builderConfig?.contact?.subtitle || hpT('contact.subtitle', 'Contact us For further business inquiries or collaborations'),
      form: {
        namePlaceholder: builderConfig?.contact?.form?.namePlaceholder || hpT('contact.form.namePlaceholder', 'Name'),
        emailPlaceholder: builderConfig?.contact?.form?.emailPlaceholder || hpT('contact.form.emailPlaceholder', 'Email'),
        phonePlaceholder: builderConfig?.contact?.form?.phonePlaceholder || hpT('contact.form.phonePlaceholder', 'Phone Number'),
        messagePlaceholder: builderConfig?.contact?.form?.messagePlaceholder || hpT('contact.form.messagePlaceholder', 'Message'),
        submit: builderConfig?.contact?.form?.submit || hpT('contact.form.submit', 'Send Message')
      }
    },
    map: {
      title: builderConfig?.map?.title || hpT('map.title', 'Visit Our Showroom!'),
      subtitle: builderConfig?.map?.subtitle || hpT('map.subtitle', 'Come see our great craftmanship here.'),
      address: formattedAddress || builderConfig?.map?.address || hpT('map.address', 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320')
    },
    rfq: {
      title: builderConfig?.rfq?.title || hpT('rfq.title', 'Request a Quote'),
      subtitle: builderConfig?.rfq?.subtitle || hpT('rfq.subtitle', 'Need an estimation of cost of you build? Drop us your request and we\'ll reach you with a quote.'),
      form: {
        namePlaceholder: builderConfig?.rfq?.form?.namePlaceholder || hpT('rfq.form.namePlaceholder', 'Name'),
        emailPlaceholder: builderConfig?.rfq?.form?.emailPlaceholder || hpT('rfq.form.emailPlaceholder', 'Email'),
        phonePlaceholder: builderConfig?.rfq?.form?.phonePlaceholder || hpT('rfq.form.phonePlaceholder', 'Phone Number'),
        messagePlaceholder: builderConfig?.rfq?.form?.messagePlaceholder || hpT('rfq.form.messagePlaceholder', 'Message or Request'),
        submit: builderConfig?.rfq?.form?.submit || hpT('rfq.form.submit', 'Request a Quote')
      },
      modal: {
        title:              hpT('rfq.modal.title', 'Request a Quote'),
        customerInfo:       hpT('rfq.modal.customerInfo', 'Customer Information'),
        nameLabel:          hpT('rfq.modal.nameLabel', 'Name'),
        namePlaceholder:    hpT('rfq.modal.namePlaceholder', 'Your full name'),
        emailLabel:         hpT('rfq.modal.emailLabel', 'Email'),
        phoneLabel:         hpT('rfq.modal.phoneLabel', 'Phone'),
        phonePlaceholder:   hpT('rfq.modal.phonePlaceholder', 'Phone number'),
        addressLabel:       hpT('rfq.modal.addressLabel', 'Address'),
        addressPlaceholder: hpT('rfq.modal.addressPlaceholder', 'Your address (optional)'),
        productsLabel:      hpT('rfq.modal.productsLabel', 'Products'),
        addProduct:         hpT('rfq.modal.addProduct', 'Add Product'),
        noProducts:         hpT('rfq.modal.noProducts', 'No products added yet. Click "Add Product" to specify items.'),
        addAnotherProduct:  hpT('rfq.modal.addAnotherProduct', 'Add another product'),
        attachments:        hpT('rfq.modal.attachments', 'Attachments'),
        attachmentsHint:    hpT('rfq.modal.attachmentsHint', 'PDF, image, or Word documents (max 5MB each)'),
        uploadFiles:        hpT('rfq.modal.uploadFiles', 'Click to upload files'),
        additionalInfo:     hpT('rfq.modal.additionalInfo', 'Additional Information'),
        notesLabel:         hpT('rfq.modal.notesLabel', 'Customer Notes'),
        notesPlaceholder:   hpT('rfq.modal.notesPlaceholder', 'Any additional notes or requirements…'),
        cancel:             hpT('rfq.modal.cancel', 'Cancel'),
        submitting:         hpT('rfq.modal.submitting', 'Submitting…'),
      },
      addProduct: {
        title:           hpT('rfq.addProduct.title', 'Add Product to RFQ'),
        noProducts:      hpT('rfq.addProduct.noProducts', 'No published products available to add.'),
        productLabel:    hpT('rfq.addProduct.productLabel', 'Product'),
        qtyLabel:        hpT('rfq.addProduct.qtyLabel', 'Quantity'),
        notesLabel:      hpT('rfq.addProduct.notesLabel', 'Notes'),
        notesPlaceholder:hpT('rfq.addProduct.notesPlaceholder', 'Additional notes for this product (optional)'),
        documentsLabel:  hpT('rfq.addProduct.documentsLabel', 'Documents'),
        uploadDocuments: hpT('rfq.addProduct.uploadDocuments', 'Upload documents'),
        cancel:          hpT('rfq.addProduct.cancel', 'Cancel'),
        add:             hpT('rfq.addProduct.add', 'Add Product'),
      }
    },
      footer: {
        location: builderConfig?.footer?.location || hpT('footer.location', 'Tangerang'),
        address: formattedAddress || builderConfig?.footerAddress || hpT('footer.address', 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320'),
        phone: builderConfig?.footerPhone || hpT('footer.phone', '0858-3456-0890'),
        email: builderConfig?.footerEmail || hpT('footer.email', 'houzez@gmail.com'),
        desc: builderConfig?.footerDesc || hpT('footer.desc', 'Helping you build your dream home since 1990.'),
        categoryTitle: builderConfig?.footer?.categoryTitle || hpT('footer.categoryTitle', 'Category'),
        categories: builderConfig?.footer?.categories?.length > 0 ? builderConfig.footer.categories : [
          hpT('footer.categories.0', 'House Construction'),
          hpT('footer.categories.1', 'Glass Pane'),
          hpT('footer.categories.2', 'Safety Tools'),
          hpT('footer.categories.3', 'Foundation'),
          hpT('footer.categories.4', 'Paints and Flooring'),
          hpT('footer.categories.5', 'Roofing'),
          hpT('footer.categories.6', 'Doors and Windows'),
          hpT('footer.categories.7', 'Excavation')
        ],
        followUs: builderConfig?.footer?.followUs || hpT('footer.followUs', 'Follow Us')
      },
    previewOnly: builderConfig?.previewOnly || hpT('previewOnly', 'Demo Preview Only')
  }), [t, i18n.language, builderConfig]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveSection(id);
    }
  };

  // Pre-compute nav items so the JSX below can safely reference displayedNav / overflowNav
  const allNavItems = React.useMemo(() => {
    // Defensive coercion: featureOrder may be a Set or undefined during
    // transient drag-and-drop state, always normalise to an array first.
    const orderArr = Array.isArray(featureOrder) ? featureOrder : Array.from(featureOrder || []);
    const featSet = selectedFeatures instanceof Set ? selectedFeatures : new Set(selectedFeatures || []);

    const goSection = (sectionId) => {
      setActiveView('home');
      setTimeout(() => scrollTo(sectionId), 50);
    };

    const navMap = {
      shop:        { label: builderConfig?.nav?.shop || content.nav.shop, id: 'shop',        action: () => { setShopInitialCategory('all'); setActiveView('shop'); } },
      appointment: { label: content.nav.appointment, id: 'appointment', action: () => goSection('appointment') },
      reviews:     { label: content.nav.reviews,     id: 'reviews',     action: () => goSection('reviews') },
      contact:     { label: content.nav.contact,     id: 'contact',     action: () => goSection('contact') },
      location:    { label: content.nav.location,    id: 'location',    action: () => goSection('map') },
      quote:       { label: content.nav.quote,       id: 'quote',       action: () => goSection('rfq') },
    };

    const items = [
      { label: content.nav.home, id: 'home', action: () => { setActiveView('home'); scrollTo('home'); } },
      ...orderArr
        .filter(fid => fid && typeof fid === 'string' && featSet.has(fid))
        .map(fid => {
          if (fid.startsWith('custom_')) {
            return {
              label: builderConfig?.customPages?.[fid] ?? 'Custom Page',
              id: fid,
              action: () => showSnackbar(hpT('customPageNotAvailable', 'This custom page has no content configured yet.'), 'gray'),
            };
          }
          return navMap[fid] || null;
        })
        .filter(Boolean),
    ];

    return items;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, featureOrder, selectedFeatures, builderConfig]);

  const displayedNav = allNavItems.slice(0, 5);
  const overflowNav  = allNavItems.slice(5);

  // Guard: if overflowNav becomes empty while menu is open, close it
  useEffect(() => {
    if (overflowNav.length === 0 && showMoreMenu) {
      setShowMoreMenu(false);
    }
  }, [overflowNav.length, showMoreMenu]);

  const products = React.useMemo(() => ({
    highRise: [
      { id: 1, name: content.productsData.ladder, price: 'Rp 4.200.000', img: '/assets/templates/houzez/catalog/image-2.png', weight: 18, volume: 120000 },
      { id: 2, name: content.productsData.levelKit, price: 'Rp 16.000.000', img: '/assets/templates/houzez/catalog/image-3.png', weight: 6, volume: 40000 },
      { id: 3, name: content.productsData.scaffoldMetal, price: 'Rp 13.885.000', img: '/assets/templates/houzez/catalog/image-4.png', weight: 65, volume: 300000 },
      { id: 4, name: content.productsData.scaffoldTower, price: 'Rp 13.885.000', img: '/assets/templates/houzez/catalog/image-5.png', weight: 70, volume: 320000 },
      { id: 5, name: content.productsData.rammer, price: 'Rp 23.330.000', img: '/assets/templates/houzez/catalog/image-6.png', weight: 90, volume: 150000 },
      { id: 6, name: content.productsData.ladderSteel, price: 'Rp 53.196.000', img: '/assets/templates/houzez/catalog/image-7.png', weight: 22, volume: 130000 }
    ],
    safety: [
      { id: 7, name: content.productsData.helmet, price: 'Rp 723.000', img: '/assets/templates/houzez/catalog/image-8.png', weight: 0.4, volume: 5000 },
      // No weight/volume on file for this item — treated as not shippable, pickup only.
      { id: 8, name: content.productsData.harness, price: 'Rp 166.000', img: '/assets/templates/houzez/catalog/image-9.png' },
      { id: 9, name: content.productsData.gloves, price: 'Rp 185.000', img: '/assets/templates/houzez/catalog/image-10.png', weight: 0.2, volume: 1000 },
      { id: 10, name: content.productsData.lifeline, price: 'Rp 3.023.000', img: '/assets/templates/houzez/catalog/image-11.png', weight: 3, volume: 8000 },
      { id: 11, name: content.productsData.helmet, price: 'Rp 2.100.000', img: '/assets/templates/houzez/catalog/image-12.png', weight: 0.4, volume: 5000 },
      { id: 12, name: content.productsData.glovesHeavy, price: 'Rp 225.000', img: '/assets/templates/houzez/catalog/image-13.png', weight: 0.3, volume: 1200 }
    ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [content.productsData]);

  useEffect(() => {
    if (!isBuilderMode) {
      setRfqProducts([...products.highRise, ...products.safety]);
      return;
    }
    fetchProducts({ platform_status: 'published', size: 100 })
      .then(r => setRfqProducts(r.data || []))
      .catch(() => {});
  }, [isBuilderMode, products]);

  async function handleRfqSubmit() {
    if (rfqSubmitting) return;
    setRfqSubmitting(true);
    try {
      await submitRfq({
        customer: {
          customer_name: rfqName,
          customer_email: rfqEmail,
          customer_phone: rfqPhoneStr,
          customer_address: rfqAddress,
        },
        notes: rfqMessage,
        rfq_items: rfqItems.map(item => ({
          line_type: 'CATALOG',
          product_id: item.product.id,
          qty: item.qty,
          notes: item.notes || '',
        })),
      });
      showSnackbar(
        (isBuilderMode || !builderConfig)
          ? 'Quote submitted (preview only — no real request was sent).'
          : 'Your quote request has been submitted!',
        'green',
      );
      setRfqModalOpen(false);
      setRfqName('');
      setRfqEmail('');
      setRfqPhoneStr('');
      setRfqMessage('');
      setRfqAddress('');
      setRfqItems([]);
      setRfqAttachments([]);
    } catch {
      showSnackbar('Failed to submit request. Please try again.', 'red');
    } finally {
      setRfqSubmitting(false);
    }
  }

  function addToCart(product, qty = 1) {
    const numericPrice = typeof product.price === 'number'
      ? product.price
      : Number(String(product.price).replace(/[^0-9]/g, '')) || 0;
    // A product with no recorded weight/volume can't be handed to a courier for shipping —
    // it can only be fulfilled via in-store pickup. An explicit fulfillmentType still wins.
    const hasWeight = Number(product.weight) > 0;
    const hasVolume = Number(product.volume) > 0;
    const fulfillmentType = product.fulfillmentType || ((hasWeight && hasVolume) ? 'both' : 'pickup');
    const item = {
      id: product.id,
      name: product.name,
      image: product.image_url || product.img || '',
      price: numericPrice,
      fulfillmentType,
    };
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
    showSnackbar(hpT('cart.added', 'Added to cart'), 'green');
  }

  function removeFromCart(id) {
    setCartItems(prev => prev.filter(i => i.id !== id));
  }

  function openProductDetail(product) {
    setSelectedProduct(product);
    setDetailQty(1);
    setActiveView('detail');
  }

  function updateCartQty(id, delta) {
    setCartItems(prev => prev
      .map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
      .filter(Boolean)
    );
  }

  function buildFullAddress(info) {
    return [info?.address, info?.region, info?.district, info?.city, info?.province, info?.zip].filter(Boolean).join(', ');
  }

  function updateCustomerDraft(field, value, extraPatch = {}) {
    setCustomerDetailDraft(d => ({ ...d, [field]: value, ...extraPatch }));
    setCustomerDetailErrors(errs => {
      if (!errs[field] && !Object.keys(extraPatch).some(k => errs[k])) return errs;
      const next = { ...errs };
      delete next[field];
      Object.keys(extraPatch).forEach(k => delete next[k]);
      return next;
    });
  }

  function openCustomerModal() {
    setCustomerDetailErrors({});
    if (customerInfo) {
      // Editing an already-saved customer — go straight to the detail form, prefilled.
      setIsEditingCustomer(true);
      setCustomerDetailDraft({ ...customerInfo });
      setCustomerSelectedPlace(
        customerInfo.pinpointAddress
          ? { id: 'existing', label: customerInfo.pinpointAddress, lat: customerInfo.lat, lng: customerInfo.lng }
          : null
      );
      setCustomerModalStep('detail');
    } else {
      setCustomerPhoneInput('');
      setCustomerLookupError('');
      setCustomerModalStep('phone');
    }
  }

  function closeCustomerModal() {
    setCustomerModalStep(null);
    setCustomerDetailDraft(null);
    setCustomerDetailErrors({});
    setCustomerLookupError('');
    setIsEditingCustomer(false);
  }

  function handleCustomerPhoneContinue() {
    let cleanPhone = customerPhoneInput.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('62')) cleanPhone = cleanPhone.slice(2);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);
    if (!cleanPhone) {
      setCustomerLookupError(hpT('checkout.customer.phoneRequired', 'Please enter your phone number'));
      return;
    }
    const found = MOCK_CUSTOMERS_DB[cleanPhone];
    if (found) {
      setCustomerInfo({ ...found, fullAddress: buildFullAddress(found) });
      closeCustomerModal();
    } else {
      setIsEditingCustomer(false);
      setCustomerDetailDraft({
        name: '', phone: cleanPhone, email: '',
        country: 'Indonesia', province: '', city: '', district: '', region: '',
        zip: '', address: '', pinpointAddress: '', notes: '',
      });
      setCustomerDetailErrors({});
      setCustomerSelectedPlace(null);
      setCustomerModalStep('detail');
    }
  }

  const CUSTOMER_ADDRESS_FIELDS = ['country', 'province', 'city', 'district', 'region', 'zip', 'address', 'pinpointAddress'];

  function handleCustomerDetailSave() {
    const requiredFields = shippingMethod === 'pickup'
      ? ['name', 'phone']
      : ['name', 'phone', ...CUSTOMER_ADDRESS_FIELDS];
    const errors = {};
    requiredFields.forEach(field => {
      if (!String(customerDetailDraft?.[field] || '').trim()) {
        errors[field] = hpT('checkout.customer.fieldRequired', 'Field cannot be empty');
      }
    });
    const draftPhone = String(customerDetailDraft?.phone || '').trim();
    if (!errors.phone && draftPhone && draftPhone !== customerInfo?.phone && MOCK_CUSTOMERS_DB[draftPhone]) {
      errors.phone = hpT('checkout.customer.phoneAlreadyRegistered', 'This phone number is already registered');
    }
    setCustomerDetailErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setCustomerInfo({ ...customerDetailDraft, fullAddress: buildFullAddress(customerDetailDraft) });
    closeCustomerModal();
  }

  function handlePurchase() {
    if (!customerInfo) {
      showSnackbar(hpT('checkout.customer.required', 'Please add customer information first'), 'gray');
      return;
    }
    if (isOutOfLalamoveCoverage) {
      showSnackbar(hpT('checkout.shipping.outOfCoverage', "Your address is outside the merchant's delivery area. Please use a different delivery address."), 'gray');
      return;
    }
    showSnackbar(hpT('checkout.purchase.success', 'Order placed (demo only — no real order was created).'), 'green');
    setCartItems([]);
    setActiveView('shop');
  }

  function handleAppointmentSubmit(e) {
    e.preventDefault();
    if (!apptName.trim() || !apptDate) return;
    showSnackbar(hpT('appointment.received', "Appointment request received! We'll be in touch to confirm."), 'green');
    setShowAppointmentModal(false);
    setApptName('');
    setApptPhoneStr('');
    setApptDate('');
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) return;
    setSubmittedReviews(prev => [{ name: reviewName, text: reviewText, rating }, ...prev]);
    showSnackbar(hpT('reviews.thanks', 'Thanks for your review!'), 'green');
    setReviewName('');
    setReviewText('');
    setRating(0);
  }

  function handleContactSubmit(e) {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim()) return;
    if (builderConfig?.contact?.requiredFields?.email && !contactEmail.trim()) return;
    if (builderConfig?.contact?.requiredFields?.phone && !phoneStr.trim()) return;
    showSnackbar(hpT('contact.sent', "Message sent! We'll get back to you soon."), 'green');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setPhoneStr('');
    setSalutationVal('');
  }

  function openRfqModal() {
    setRfqName('');
    setRfqEmail('');
    setRfqPhoneStr('');
    setRfqMessage('');
    setRfqAddress('');
    setRfqItems([]);
    setRfqAttachments([]);
    setRfqModalOpen(true);
  }

  function closeRfqModal() {
    rfqAttachments.forEach(a => URL.revokeObjectURL(a.url));
    setRfqAttachments([]);
    setRfqModalOpen(false);
    setRfqAddProductOpen(false);
    setRfqProductDraft(null);
  }

  function openAddProduct() {
    const usedIds = new Set(rfqItems.map(i => i.product.id));
    const first = rfqProducts.find(p => !usedIds.has(p.id)) || rfqProducts[0] || null;
    setRfqProductDraft({ product: first, qty: 1, notes: '', files: [] });
    setRfqAddProductOpen(true);
  }

  function handleRfqAttachSelect(e) {
    Array.from(e.target.files || []).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} exceeds 5MB`); return; }
      setRfqAttachments(prev => [...prev, { name: file.name, url: URL.createObjectURL(file), type: file.type, size: file.size }]);
    });
    e.target.value = '';
  }

  function handleProductFilesSelect(e) {
    const newFiles = Array.from(e.target.files || []).filter(f => {
      if (f.size > 5 * 1024 * 1024) { alert(`${f.name} exceeds 5MB`); return false; }
      return true;
    }).map(f => ({ name: f.name, file: f }));
    setRfqProductDraft(prev => ({ ...prev, files: [...(prev?.files || []), ...newFiles] }));
    e.target.value = '';
  }

  return (
    <div style={{ 
      fontFamily: "'Inter', sans-serif", 
      color: '#1F2937', 
      scrollBehavior: 'smooth',
      '--focus-color': '#16894B' 
    }}>
      <nav style={{ 
        position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 100, 
        borderBottom: '1px solid #F3F4F6',
        height: '84px'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          width: isMobile ? '100%' : 'calc(100% - 80px)',
          height: '100%',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: isMobile ? '0 16px' : '0'
        }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={builderConfig?.headerLogo || "/assets/templates/houzez/assets/houzez-logo.png"} alt="Houzez" style={{ height: '42px', objectFit: 'contain' }} />
        </div>
        
        {/* Menu Items logic */}
        {isMobile ? (
          <></>
        ) : (
          <div style={{ display: 'flex', gap: '36px', fontSize: '14px', letterSpacing: '-0.3px', alignItems: 'center' }}>
            {displayedNav.map((item, idx) => (
              <NavButton
                key={item?.id ? `${item.id}-main` : `main-${idx}`}
                active={activeView === 'shop' ? item?.id === 'shop' : activeSection === item?.id}
                onClick={item?.action}
              >
                {item?.label}
              </NavButton>
            ))}
            
            {overflowNav.length > 0 && (
              <div 
                onMouseEnter={() => setShowMoreMenu(true)} 
                onMouseLeave={() => setShowMoreMenu(false)}
                style={{ position: 'relative' }}
              >
                <button style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', padding: '8px', color: activeSection === 'more' ? '#16894B' : '#4B5563',
                  transition: 'all 0.2s'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
                
                {showMoreMenu && (
                  <div style={{ 
                    position: 'absolute', top: '100%', right: 0, 
                    background: '#FFFFFF', border: '1px solid #F3F4F6', 
                    borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', 
                    minWidth: '200px', padding: '8px', zIndex: 1000 
                  }}>
                    {overflowNav.map((item, idx) => (
                      <div 
                        key={item?.id ? `${item.id}-more` : `more-${idx}`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item?.action) item.action();
                          setShowMoreMenu(false);
                        }} 
                        style={{ 
                          padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', 
                          textAlign: 'left', fontSize: '13px', fontWeight: 500,
                          color: (activeView === 'shop' ? item?.id === 'shop' : activeSection === item?.id) ? '#16894B' : '#4B5563',
                          background: (activeView === 'shop' ? item?.id === 'shop' : activeSection === item?.id) ? '#F0FDF4' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { if (item?.id && activeSection !== item.id) e.currentTarget.style.background = '#F9FAFB'; }}
                        onMouseLeave={e => { if (item?.id && activeSection !== item.id) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {item?.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px' }}>
            {/* Cart Icon - Only if Shop feature is enabled AND online checkout is ON */}
            {selectedFeatures.has('shop') && checkoutEnabled && (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setActiveView('cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A', padding: isMobile ? 0 : '', display: 'flex', position: 'relative' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    {cartItems.length > 0 && (
                      <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#16894B', color: '#FFF', fontSize: '10px', fontWeight: 700, borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {cartItems.reduce((sum, i) => sum + i.qty, 0)}
                      </span>
                    )}
                </button>
              </div>
            )}
            
            {isMobile && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A', padding: 0, display: 'flex', zIndex: 50, position: 'relative' }}
              >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ transition: 'all 0.2s' }}>
                    {isMobileMenuOpen ? (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </>
                    ) : (
                      <>
                        <line x1="4" x2="20" y1="12" y2="12" />
                        <line x1="4" x2="20" y1="6" y2="6" />
                        <line x1="4" x2="20" y1="18" y2="18" />
                      </>
                    )}
                  </svg>
              </button>
            )}

            {!isMobile && (
              <React.Fragment>
              {(() => {
                const currentLangCode = isBuilderMode ? builderActiveLang : i18n.language;
                const languagesList = isBuilderMode && previewLanguages.length > 0 
                  ? previewLanguages 
                  : [ { code: 'en', label: 'English' }, { code: 'id', label: 'Indonesia' } ];
                
                if (languagesList.length <= 1) return null;

                const getFlagCode = (c) => {
                  if (c === 'en') return 'us';
                  if (c === 'ja') return 'jp';
                  if (c === 'ko') return 'kr';
                  if (c === 'zh' || c === 'zh-TW') return 'cn';
                  return c;
                };

                return (
                  <div style={{ position: 'relative' }}>
                    <div 
                      onClick={() => setShowLangMenu(!showLangMenu)}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', 
                        fontSize: '14px', border: '1.2px solid #E5E7EB', height: '44px', width: '90px',
                        borderRadius: '12px', color: '#1A1A1A', cursor: 'pointer', background: '#FFFFFF',
                        fontWeight: 600, transition: 'all 0.2s ease', padding: '0 8px'
                      }}
                    >
                        <img src={`https://flagcdn.com/${getFlagCode(currentLangCode)}.svg`}
                          onError={(e) => { e.target.style.display='none'; }} 
                          alt="flag" style={{ width: '22px', height: '14px', objectFit: 'cover', borderRadius: '2px' }} 
                        />
                        <span style={{ minWidth: '22px' }}>{currentLangCode.toUpperCase()}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" style={{ transition: 'transform 0.2s', transform: showLangMenu ? 'rotate(180deg)' : 'none' }}><path d="m6 9 6 6 6-6"/></svg>
                    </div>

                    {showLangMenu && (
                      <div style={{ 
                        position: 'absolute', top: 'calc(100% + 10px)', right: 0, 
                        background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', 
                        boxShadow: '0 10px 40px rgba(0,0,0,0.06)', overflow: 'hidden', minWidth: '160px',
                        zIndex: 1000, padding: '6px'
                      }}>
                        {languagesList.map((lang) => (
                          <div 
                            key={lang.code}
                            onClick={() => toggleLang(lang.code)} 
                            style={{ 
                              padding: '10px 12px', cursor: 'pointer', fontSize: '14px', 
                              display: 'flex', alignItems: 'center', gap: '10px',
                              color: currentLangCode === lang.code ? '#16894B' : '#4B5563',
                              fontWeight: currentLangCode === lang.code ? 600 : 500,
                              borderRadius: '8px', transition: 'all 0.15s ease',
                              background: currentLangCode === lang.code ? '#F0FDF4' : 'transparent',
                              marginBottom: '2px'
                            }}
                            onMouseEnter={(e) => { if (currentLangCode !== lang.code) e.currentTarget.style.background = '#F9FAFB'; }}
                            onMouseLeave={(e) => { if (currentLangCode !== lang.code) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <img src={`https://flagcdn.com/${getFlagCode(lang.code)}.svg`} 
                              onError={(e) => { e.target.style.display='none'; }}
                              alt={lang.code} style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px' }} 
                            />
                            <span style={{ flex: 1 }}>{lang.label}</span>
                            {currentLangCode === lang.code && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
              </React.Fragment>
            )}
        </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && isMobile && (
        <div style={{
          position: 'absolute',
          top: '64px',
          left: 0,
          width: '100%',
          background: '#FFFFFF',
          padding: '24px 20px',
          zIndex: 40,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderTop: '1px solid #F3F4F6',
          animation: 'slideDown 0.2s ease-out'
        }}>
          {allNavItems.map((item, idx) => (
            <NavButton
              key={item?.id ? `${item.id}-mobile` : `mobile-${idx}`}
              active={activeView === 'shop' ? item?.id === 'shop' : activeSection === item?.id}
              onClick={() => { if (item?.action) item.action(); setIsMobileMenuOpen(false); }}
            >
              {item?.label}
            </NavButton>
          ))}
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* ── Home view: hero, product groups, feature sections, footer ── */}
      {activeView === 'home' && (
      <React.Fragment>

      {/* Hero Section */}
      <section id="home" style={{
        padding: isMobile ? '12px' : '24px 0',
        background: '#FFFFFF'
      }}>
        <div style={{
          position: 'relative',
          background: '#EDF3F0',
          borderRadius: isMobile ? '16px' : '24px',
          height: isMobile ? '160px' : '480px',
          display: 'flex',
          alignItems: 'center',
          maxWidth: '1280px',
          margin: '0 auto',
          width: isMobile ? '100%' : 'calc(100% - 80px)'
        }}>
          {/* Content Left */}
            <div style={{
              flex: isMobile ? '0 0 45%' : '0 0 48%',
              maxWidth: isMobile ? '45%' : '48%',
              padding: isMobile ? '0 12px' : '0 80px',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <h1 style={{ 
                fontSize: isMobile ? '18px' : '56px', 
                fontWeight: 800, 
                color: '#1A1A1A', 
                lineHeight: 1.1, 
                marginBottom: isMobile ? '8px' : '20px',
                maxWidth: isMobile ? '100%' : '500px'
              }}>
                {builderConfig?.heroTitle || content.hero.title}
              </h1>
              <p style={{ 
                fontSize: isMobile ? '9px' : '18px', 
                color: '#4B5563', 
                marginBottom: '0',
                maxWidth: isMobile ? '100%' : '600px',
                lineHeight: 1.4
              }}>
                {builderConfig?.heroSubtitle || content.hero.subtitle}
              </p>
            </div>

          {/* Image panel — extends past centre so gradient has room to blend */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: isMobile ? '70%' : '60%',
            backgroundImage: `url("${banners[activeBanner]}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderTopRightRadius: isMobile ? '16px' : '24px',
            borderBottomRightRadius: isMobile ? '16px' : '24px',
            transition: 'background-image 0.3s ease-in-out'
          }} />

          {/* Gradient overlay: matches container border-radius, wide fade zone */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: isMobile ? '16px' : '24px',
            background: isMobile
              ? 'linear-gradient(to right, #EDF3F0 0%, #EDF3F0 32%, rgba(237,243,240,0) 70%)'
              : 'linear-gradient(to right, #EDF3F0 0%, #EDF3F0 43%, rgba(237,243,240,0) 85%)',
            pointerEvents: 'none'
          }} />

          {/* Navigation Arrows */}
          {!isMobile && banners.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveBanner(prev => (prev === 0 ? banners.length - 1 : prev - 1)); }}
                style={{ 
                  position: 'absolute', left: '0', top: '50%', transform: 'translate(-50%, -50%)',
                  width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #10B981',
                  background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#10B981', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); setActiveBanner(prev => (prev === banners.length - 1 ? 0 : prev + 1)); }}
                style={{ 
                  position: 'absolute', right: '0', top: '50%', transform: 'translate(50%, -50%)',
                  width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #10B981',
                  background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#10B981', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m9 6 6 6-6 6"/></svg>
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {banners.length > 1 && (
            <div style={{ 
              position: 'absolute', bottom: isMobile ? '-14px' : '24px', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: isMobile ? '4px' : '8px', zIndex: 10
            }}>
              {banners.map((_, i) => (
                <div 
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveBanner(i); }} 
                  style={{ 
                    width: isMobile ? '6px' : '10px', height: isMobile ? '6px' : '10px', 
                    borderRadius: '50%', 
                    background: i === activeBanner ? '#059669' : '#D1D5DB', 
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <div style={{ 
        background: '#FFFFFF',
        padding: isMobile ? '24px 0' : '50px 0 30px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(8, 1fr)', 
          gap: isMobile ? '16px 8px' : '14px', 
          maxWidth: '1280px',
          margin: '0 auto',
          width: isMobile ? '100%' : 'calc(100% - 80px)',
          padding: isMobile ? '0 16px' : 0
        }}>
        {[
          { label: content.categories.house, icon: '/assets/templates/houzez/catalog-categories/house-construction.png' },
          { label: content.categories.glass, icon: '/assets/templates/houzez/catalog-categories/glass-pane.png' },
          { label: content.categories.safety, icon: '/assets/templates/houzez/catalog-categories/safety-tools.png' },
          { label: content.categories.foundation, icon: '/assets/templates/houzez/catalog-categories/foundation.png' },
          { label: content.categories.paints, icon: '/assets/templates/houzez/catalog-categories/paints-and-flooring.png' },
          { label: content.categories.roofing, icon: '/assets/templates/houzez/catalog-categories/roofing.png' },
          { label: content.categories.doors, icon: '/assets/templates/houzez/catalog-categories/doors-and-windows.png' },
          { label: content.categories.excavation, icon: '/assets/templates/houzez/catalog-categories/excavation.png' }
        ].map((item, idx) => (
            <div key={idx} style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                 onClick={() => { setShopInitialCategory('all'); setActiveView('shop'); }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ 
                  width: isMobile ? '64px' : '84px', 
                  height: isMobile ? '64px' : '84px', 
                  background: '#EDF3F0', 
                  borderRadius: '50%', 
                  margin: isMobile ? '0 auto 8px' : '0 auto 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                    <img src={item.icon} alt={item.label} style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', objectFit: 'contain' }} />
                </div>
                <span style={{ 
                  fontSize: isMobile ? '10px' : '13px', 
                  fontWeight: 500, 
                  color: '#1A1A1A', 
                  display: 'block',
                  lineHeight: '1.4'
                }}>
                  {item.label}
                </span>
            </div>
        ))}
        </div>
      </div>


      {/* Dynamic Sections based on featureOrder */}
      {(Array.isArray(featureOrder) ? featureOrder : []).filter(fid => fid && typeof fid === 'string' && selectedFeatures.has(fid)).map((featureId) => {
        switch (featureId) {
          case 'shop': {
            const enableCheckout = checkoutEnabled;
            const featuredSections = builderConfig?.featuredSections;
            const useFeatured = isBuilderMode && featuredSections?.length > 0;

            if (isBuilderMode && !useFeatured) {
              // Builder mode, no sections configured — show nothing
              return null;
            }

            if (useFeatured) {
              // Only render groups that have at least one published product
              const visibleSections = featuredSections.filter(
                sec => (homepageSectionProducts[sec.id]?.length ?? 1) > 0
              );
              if (visibleSections.length === 0) return null;
              return (
                <React.Fragment key={featureId}>
                  {visibleSections.map((sec, idx) => (
                    <ProductGroup
                      key={sec.id}
                      id={idx === 0 ? 'shop' : undefined}
                      title={sec.name}
                      items={homepageSectionProducts[sec.id] || []}
                      onDemo={(p) => { if (enableCheckout) { openProductDetail(p); } else { setShopInitialCategory(sec.id); setActiveView('shop'); } }}
                      onQuickAdd={enableCheckout ? addToCart : undefined}
                      onSeeAll={() => { setShopInitialCategory(sec.id); setActiveView('shop'); }}
                      seeAllLabel={content.sections.seeAll}
                      isMobile={isMobile}
                    />
                  ))}
                </React.Fragment>
              );
            }

            // Showcase / demo mode — use static dummy groups
            return (
              <React.Fragment key={featureId}>
                <ProductGroup
                  id="shop"
                  title={content.sections.highRise}
                  items={products.highRise}
                  onDemo={(p) => { if (enableCheckout) { openProductDetail(p); } else { setShopInitialCategory('cat-highrise'); setActiveView('shop'); } }}
                  onQuickAdd={enableCheckout ? addToCart : undefined}
                  onSeeAll={() => { setShopInitialCategory('cat-highrise'); setActiveView('shop'); }}
                  seeAllLabel={content.sections.seeAll}
                  isMobile={isMobile}
                />
                <ProductGroup
                  title={content.sections.safetyTools}
                  items={products.safety}
                  onDemo={(p) => { if (enableCheckout) { openProductDetail(p); } else { setShopInitialCategory('cat-safety'); setActiveView('shop'); } }}
                  onQuickAdd={enableCheckout ? addToCart : undefined}
                  onSeeAll={() => { setShopInitialCategory('cat-safety'); setActiveView('shop'); }}
                  seeAllLabel={content.sections.seeAll}
                  isMobile={isMobile}
                />
              </React.Fragment>
            );
          }

          case 'appointment':
            return (
              <section key={featureId} id="appointment" style={{ 
                width: '100%', 
                height: isMobile ? 'auto' : '400px',
                minHeight: '400px',
                margin: isMobile ? '32px 0' : '60px 0',
                position: 'relative',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'url("/assets/templates/houzez/assets/houzez-appointment.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: isMobile ? 'center' : 'right center',
                  zIndex: 1
                }} />
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, bottom: 0,
                  width: isMobile ? '100%' : '60%',
                  background: isMobile 
                    ? 'linear-gradient(to right, rgba(22, 137, 75, 0.95) 0%, rgba(22, 137, 75, 0.9) 100%)' 
                    : 'linear-gradient(to right, #16894B 0%, #16894B 75%, rgba(22, 137, 75, 0.8) 85%, rgba(22, 137, 75, 0) 100%)',
                  zIndex: 2
                }} />
                <div style={{ 
                  maxWidth: '1280px', 
                  margin: '0 auto', 
                  width: isMobile ? '100%' : 'calc(100% - 80px)',
                  position: 'relative',
                  zIndex: 3,
                  padding: isMobile ? '40px 24px' : '0 40px',
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px', maxWidth: '600px', lineHeight: 1.2 }}>{content.appointment.title}</h2>
                  <p style={{ fontSize: '18px', color: '#FFFFFF', opacity: 0.9, marginBottom: '32px', maxWidth: '500px', lineHeight: 1.5 }}>{content.appointment.subtitle}</p>
                  <button 
                    onClick={() => setShowAppointmentModal(true)}
                    style={{ 
                      background: '#FFFFFF', color: '#16894B', padding: '14px 36px', borderRadius: '12px', 
                      border: 'none', fontWeight: 600, fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s ease', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {content.appointment.button}
                  </button>
                </div>
              </section>
            );

          case 'reviews':
            return (
              <section key={featureId} id="reviews" style={{ padding: isMobile ? '40px 16px 40px 16px' : '80px 0 40px 0', maxWidth: '1280px', margin: '0 auto', width: isMobile ? '100%' : 'calc(100% - 80px)' }}>
                <h2 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 800, color: '#1A1A1A', marginBottom: '32px' }}>{content.reviewsSection.title}</h2>
                <div style={{ display: isMobile ? 'flex' : 'grid', gridTemplateColumns: isMobile ? 'none' : 'repeat(3, 1fr)', flexDirection: isMobile ? 'column' : 'row', gap: '24px', marginBottom: '40px' }}>
                  {[...submittedReviews, ...content.reviewsSection.items].map((review, idx) => (
                    <div key={idx} style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', background: '#FFFFFF' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg key={star} width="24" height="24" viewBox="0 0 24 24" fill={star <= (review.rating ?? 5) ? '#FACC15' : 'none'} stroke="#FACC15" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ))}
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '12px' }}>{review.name}</h3>
                      <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6' }}>{review.text}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '16px', color: '#4B5563', marginBottom: '24px' }}>{content.reviewsSection.formSubtitle}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr', gap: '16px', alignItems: isMobile ? 'flex-start' : 'end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#4B5563' }}>{content.reviewsSection.nameLabel}</label>
                      <input type="text" value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder={content.reviewsSection.namePlaceholder} style={{ height: '48px', padding: '0 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#4B5563' }}>{content.reviewsSection.reviewLabel}</label>
                      <input type="text" value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder={content.reviewsSection.reviewPlaceholder} style={{ height: '48px', padding: '0 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#4B5563' }}>{content.reviewsSection.ratingLabel}</label>
                      <div style={{ height: '48px', padding: '0 16px', border: '1px solid #E5E7EB', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg key={star} onClick={() => setRating(star)} style={{ cursor: 'pointer', transition: 'all 0.2s ease', color: star <= rating ? '#FACC15' : '#D1D5DB' }} width="28" height="28" viewBox="0 0 24 24" fill={star <= rating ? 'currentColor' : 'transparent'} stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button onClick={handleReviewSubmit} style={{ background: '#16894B', color: '#FFFFFF', padding: '14px 28px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                      {content.reviewsSection.submit}
                    </button>
                  </div>
                </div>
              </section>
            );

          case 'contact':
            return (
              <section key={featureId} id="contact" style={{ padding: isMobile ? '40px 16px' : '80px 0', maxWidth: '1280px', margin: '0 auto', width: isMobile ? '100%' : 'calc(100% - 80px)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(400px, 1fr) minmax(500px, 1fr)', gap: isMobile ? '32px' : '64px', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#1A1A1A', marginBottom: '16px' }}>{content.contact.title}</h2>
                    <p style={{ fontSize: '16px', color: '#4B5563', marginBottom: '40px' }}>{content.contact.subtitle}</p>
                      {/* Form Fields */}
                      <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Salutation Field */}
                        {builderConfig?.contact?.requiredFields?.salutation && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                              {t('website:shop.salutation')}
                              <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
                            </label>
                            <Dropdown
                              options={SALUTATION_OPTIONS}
                              selected={salutationVal}
                              onSelect={setSalutationVal}
                              placeholder={t('website:shop.selectSalutation')}
                              hideSearch
                              style={{ height: '48px', borderRadius: '8px' }}
                            />
                          </div>
                        )}
                        {/* Name Field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                            {content.contact.form.namePlaceholder}
                            <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
                          </label>
                          <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder={content.contact.form.namePlaceholder} style={{ height: '48px', padding: '0 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                        </div>

                        {/* Email Field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                            {content.contact.form.emailPlaceholder}
                            {builderConfig?.contact?.requiredFields?.email && (
                              <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
                            )}
                          </label>
                          <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder={content.contact.form.emailPlaceholder} style={{ height: '48px', padding: '0 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
                        </div>

                        {/* Phone Field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                            {content.contact.form.phonePlaceholder}
                            {builderConfig?.contact?.requiredFields?.phone && (
                              <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
                            )}
                          </label>
                          <PhoneInput value={phoneStr} onChange={setPhoneStr} placeholder={content.contact.form.phonePlaceholder} isMobile={isMobile} height="48px" />
                        </div>

                        {/* Message Field */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                            {content.contact.form.messagePlaceholder}
                            <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
                          </label>
                          <textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} placeholder={content.contact.form.messagePlaceholder} style={{ height: '80px', minHeight: '80px', maxHeight: '300px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '15px', outline: 'none', resize: 'vertical' }} />
                        </div>

                        <button type="submit" style={{ background: '#16894B', color: '#FFFFFF', padding: '14px 28px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '15px', cursor: 'pointer', alignSelf: 'flex-start', transition: 'background 0.2s', marginTop: '10px' }} onMouseEnter={e => e.currentTarget.style.background = '#126d3b'} onMouseLeave={e => e.currentTarget.style.background = '#16894B'}>
                          {content.contact.form.submit}
                        </button>
                      </form>
                  </div>
                  <div style={{ width: '100%', height: isMobile ? 'auto' : '600px', aspectRatio: isMobile ? '1/1' : 'auto', borderRadius: '16px', overflow: 'hidden' }}>
                    <img src="/assets/templates/houzez/assets/houzez-contact.png" alt="Contact" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              </section>
            );

          case 'location':
            return (
              <section key={featureId} id="map" style={{ padding: isMobile ? '40px 16px' : '80px 0', maxWidth: '1280px', margin: '0 auto', width: isMobile ? '100%' : 'calc(100% - 80px)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(400px, 1.2fr) minmax(300px, 1fr)', gap: isMobile ? '32px' : '64px', alignItems: 'center' }}>
                  <div style={{ width: '100%', height: '360px', borderRadius: '4px', overflow: 'hidden', background: '#F9FAFB', zIndex: 0, order: isMobile ? 2 : 1 }}>
                    <MapContainer center={[-6.225, 106.652]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 1 }} zoomControl={true}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors' />
                      <Marker position={[-6.225, 106.652]} />
                    </MapContainer>
                  </div>
                  <div style={{ order: isMobile ? 1 : 2 }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#1A1A1A', marginBottom: '16px' }}>{content.map.title}</h2>
                    <p style={{ fontSize: '15px', color: '#4B5563', marginBottom: '32px' }}>{content.map.subtitle}</p>
                    <p style={{ fontSize: '15px', color: '#1A1A1A', lineHeight: '1.6' }}>{content.map.address}</p>
                  </div>
                </div>
              </section>
            );

          case 'quote':
            return (
              <React.Fragment key={featureId}>
                <section id="rfq" style={{ position: 'relative', width: '100%', minHeight: isMobile ? 'auto' : '600px', padding: isMobile ? '60px 16px' : '80px 0', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `url(${builderConfig?.rfq?.bgImage || '/assets/templates/houzez/assets/houzez-rfq.png'}) left center / cover no-repeat`, transform: 'scaleX(-1)', zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: isMobile ? 'linear-gradient(90deg, #FFFFFF 60%, rgba(255,255,255,0.9) 80%, rgba(255,255,255,0.2) 100%)' : 'linear-gradient(90deg, #FFFFFF 40%, rgba(255,255,255,0.8) 55%, rgba(255,255,255,0) 80%)', zIndex: 0 }} />
                  <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', width: isMobile ? '100%' : 'calc(100% - 80px)' }}>
                    <div style={{ maxWidth: '600px' }}>
                      <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#1A1A1A', marginBottom: '16px' }}>{content.rfq.title}</h2>
                      <p style={{ fontSize: '15px', color: '#4B5563', marginBottom: '40px', lineHeight: '1.6' }}>{content.rfq.subtitle}</p>
                      <button
                        onClick={openRfqModal}
                        style={{ background: '#16894B', color: '#FFF', padding: '14px 28px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#126d3b'}
                        onMouseLeave={e => e.currentTarget.style.background = '#16894B'}
                      >
                        {content.rfq.form.submit}
                      </button>
                    </div>
                  </div>
                </section>

                {/* ── RFQ Main Modal ── */}
                {rfqModalOpen && createPortal(
                  <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div onClick={closeRfqModal} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
                    <div style={{ position: 'relative', zIndex: 1, background: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: "'Inter', sans-serif" }}>

                      {/* Modal header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{content.rfq.modal.title}</div>
                        <button onClick={closeRfqModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#6B7280' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                      </div>

                      {/* Modal body */}
                      <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px', flex: 1 }}>

                        {/* ── Customer Information ── */}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #F3F4F6' }}>{content.rfq.modal.customerInfo}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                <span style={{ color: '#EF4444', marginRight: '2px' }}>*</span>{content.rfq.modal.nameLabel}
                              </label>
                              <input
                                type="text" value={rfqName} onChange={e => setRfqName(e.target.value)}
                                placeholder={content.rfq.modal.namePlaceholder}
                                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                              />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{content.rfq.modal.emailLabel}</label>
                                <input
                                  type="email" value={rfqEmail} onChange={e => setRfqEmail(e.target.value)}
                                  placeholder="your@email.com"
                                  style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{content.rfq.modal.phoneLabel}</label>
                                <PhoneInput value={rfqPhoneStr} onChange={setRfqPhoneStr} placeholder={content.rfq.modal.phonePlaceholder} isMobile={isMobile} height="44px" />
                              </div>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{content.rfq.modal.addressLabel}</label>
                              <input
                                type="text" value={rfqAddress} onChange={e => setRfqAddress(e.target.value)}
                                placeholder={content.rfq.modal.addressPlaceholder}
                                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ── Products ── */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #F3F4F6' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{content.rfq.modal.productsLabel}</div>
                            {rfqItems.length < Math.max(rfqProducts.length, 999) && (
                              <button onClick={openAddProduct} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#16894B', fontSize: '13px', fontWeight: 600, padding: '4px 0' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                                {content.rfq.modal.addProduct}
                              </button>
                            )}
                          </div>
                          {rfqItems.length === 0 ? (
                            <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '16px', border: '1.5px dashed #E5E7EB', borderRadius: '8px', textAlign: 'center' }}>
                              {content.rfq.modal.noProducts}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {rfqItems.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FAFAFA' }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{item.product.name}</div>
                                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span>{t('website:shop.qty')} {item.qty}</span>
                                      {item.notes && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>· {item.notes}</span>}
                                      {item.files?.length > 0 && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                                          {item.files.length}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button onClick={() => setRfqItems(rfqItems.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {rfqItems.length > 0 && rfqItems.length < Math.max(rfqProducts.length, 999) && (
                            <button onClick={openAddProduct} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', marginTop: '8px', padding: '10px', border: '1.5px dashed #D1D5DB', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#6B7280' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                              {content.rfq.modal.addAnotherProduct}
                            </button>
                          )}
                        </div>

                        {/* ── Attachments ── */}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '4px', paddingBottom: '8px', borderBottom: '1px solid #F3F4F6' }}>{content.rfq.modal.attachments}</div>
                          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' }}>{content.rfq.modal.attachmentsHint}</div>
                          <input ref={rfqAttachInputRef} type="file" multiple accept="image/*,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{ display: 'none' }} onChange={handleRfqAttachSelect} />
                          <div
                            onClick={() => rfqAttachInputRef.current?.click()}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', border: '1.5px dashed #D1D5DB', borderRadius: '8px', cursor: 'pointer', color: '#6B7280', fontSize: '13px', transition: 'border-color 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#9CA3AF'}
                            onMouseOut={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            {content.rfq.modal.uploadFiles}
                          </div>
                          {rfqAttachments.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                              {rfqAttachments.map((att, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: '#F3F4F6', borderRadius: '6px', fontSize: '12px', color: '#374151', maxWidth: '200px' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                                  <button onClick={() => { URL.revokeObjectURL(att.url); setRfqAttachments(prev => prev.filter((_, i) => i !== idx)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* ── Additional Information ── */}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #F3F4F6' }}>{content.rfq.modal.additionalInfo}</div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{content.rfq.modal.notesLabel}</label>
                          <textarea
                            value={rfqMessage} onChange={e => setRfqMessage(e.target.value)}
                            placeholder={content.rfq.modal.notesPlaceholder}
                            rows={4}
                            style={{ width: '100%', padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>
                      </div>

                      {/* Modal footer */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #F3F4F6', flexShrink: 0 }}>
                        <button onClick={closeRfqModal} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFF', fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                          {content.rfq.modal.cancel}
                        </button>
                        <button
                          onClick={handleRfqSubmit}
                          disabled={rfqSubmitting || !rfqName.trim()}
                          style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: rfqSubmitting || !rfqName.trim() ? '#9CA3AF' : '#16894B', color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: rfqSubmitting || !rfqName.trim() ? 'default' : 'pointer', transition: 'background 0.2s' }}
                          onMouseEnter={e => { if (!rfqSubmitting && rfqName.trim()) e.currentTarget.style.background = '#126d3b'; }}
                          onMouseLeave={e => { if (!rfqSubmitting && rfqName.trim()) e.currentTarget.style.background = '#16894B'; }}
                        >
                          {rfqSubmitting ? content.rfq.modal.submitting : content.rfq.form.submit}
                        </button>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}

                {/* ── Add Product Sub-Modal ── */}
                {rfqAddProductOpen && rfqProductDraft && createPortal(
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div onClick={() => { setRfqAddProductOpen(false); setRfqProductDraft(null); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
                    <div style={{ position: 'relative', zIndex: 1, background: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: "'Inter', sans-serif" }}>

                      {/* Sub-modal header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{content.rfq.addProduct.title}</div>
                        <button onClick={() => { setRfqAddProductOpen(false); setRfqProductDraft(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: '#6B7280' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                      </div>

                      {/* Sub-modal body */}
                      <div style={{ overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                        {rfqProducts.length === 0 ? (
                          <div style={{ fontSize: '13px', color: '#9CA3AF', padding: '24px 16px', textAlign: 'center' }}>
                            {content.rfq.addProduct.noProducts}
                          </div>
                        ) : (
                          <React.Fragment>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                <span style={{ color: '#EF4444', marginRight: '2px' }}>*</span>{content.rfq.addProduct.productLabel}
                              </label>
                              <Dropdown
                                options={rfqProducts.filter(p => {
                                  const usedIds = new Set(rfqItems.map(i => i.product.id));
                                  return !usedIds.has(p.id) || p.id === rfqProductDraft.product?.id;
                                }).map(p => ({ id: p.id, label: p.name }))}
                                selected={rfqProductDraft.product?.id}
                                onSelect={id => {
                                  const p = rfqProducts.find(x => x.id === id);
                                  if (p) setRfqProductDraft(prev => ({ ...prev, product: p }));
                                }}
                                hideSearch={rfqProducts.length <= 10}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                <span style={{ color: '#EF4444', marginRight: '2px' }}>*</span>{content.rfq.addProduct.qtyLabel}
                              </label>
                              <input
                                type="number" min="1" value={rfqProductDraft.qty}
                                onChange={e => setRfqProductDraft(prev => ({ ...prev, qty: Math.max(1, Number(e.target.value)) }))}
                                style={{ width: '100%', height: '44px', padding: '0 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{content.rfq.addProduct.notesLabel}</label>
                              <textarea
                                value={rfqProductDraft.notes}
                                onChange={e => setRfqProductDraft(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder={content.rfq.addProduct.notesPlaceholder}
                                rows={3}
                                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{content.rfq.addProduct.documentsLabel}</label>
                              <input ref={rfqProductFilesRef} type="file" multiple accept="image/*,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{ display: 'none' }} onChange={handleProductFilesSelect} />
                              <div
                                onClick={() => rfqProductFilesRef.current?.click()}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '1.5px dashed #D1D5DB', borderRadius: '8px', cursor: 'pointer', color: '#6B7280', fontSize: '13px', transition: 'border-color 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.borderColor = '#9CA3AF'}
                                onMouseOut={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                {content.rfq.addProduct.uploadDocuments}
                              </div>
                              {rfqProductDraft.files.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                  {rfqProductDraft.files.map((f, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#F3F4F6', borderRadius: '6px', fontSize: '12px', color: '#374151', maxWidth: '180px' }}>
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                                      <button onClick={() => setRfqProductDraft(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </React.Fragment>
                        )}
                      </div>

                      {/* Sub-modal footer */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', borderTop: '1px solid #F3F4F6', flexShrink: 0 }}>
                        <button onClick={() => { setRfqAddProductOpen(false); setRfqProductDraft(null); }} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFF', fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                          {content.rfq.addProduct.cancel}
                        </button>
                        <button
                          disabled={!rfqProductDraft.product}
                          onClick={() => {
                            if (!rfqProductDraft.product) return;
                            setRfqItems(prev => [...prev, { ...rfqProductDraft }]);
                            setRfqAddProductOpen(false);
                            setRfqProductDraft(null);
                          }}
                          style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: rfqProductDraft.product ? '#16894B' : '#9CA3AF', color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: rfqProductDraft.product ? 'pointer' : 'default', transition: 'background 0.2s' }}
                          onMouseEnter={e => { if (rfqProductDraft.product) e.currentTarget.style.background = '#126d3b'; }}
                          onMouseLeave={e => { if (rfqProductDraft.product) e.currentTarget.style.background = '#16894B'; }}
                        >
                          {content.rfq.addProduct.add}
                        </button>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
              </React.Fragment>
            );

          default:
            return null;
        }
      })}

      <footer style={{ background: '#FFFFFF', padding: isMobile ? '40px 16px' : '80px 0', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: isMobile ? '100%' : 'calc(100% - 80px)' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 1.5fr) 2fr 1fr', 
            gap: isMobile ? '40px' : '64px' 
          }}>
            
            {/* Column 1: Brand & Contact Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                  <img src={builderConfig?.headerLogo || "/assets/templates/houzez/assets/houzez-logo.png"} alt="Houzez" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
              </div>
              
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>{content.footer.location}</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
                {content.footer.desc}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#4B5563' }}>
                <span style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                   <span>{content.footer.phone}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                   <span>{content.footer.email}</span>
                </span>
                {(builderConfig?.footerAddress) && (
                  <span style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                     <span style={{ whiteSpace: 'pre-wrap' }}>{builderConfig.footerAddress}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Column 2 & 3: Categories */}
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '24px' }}>{content.footer.categoryTitle}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {content.footer.categories.slice(0, 4).map((cat, idx) => (
                      <span key={idx} style={{ fontSize: '13px', color: '#6B7280' }}>{cat}</span>
                    ))}
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {content.footer.categories.slice(4).map((cat, idx) => (
                      <span key={idx} style={{ fontSize: '13px', color: '#6B7280' }}>{cat}</span>
                    ))}
                 </div>
              </div>
            </div>

            {/* Column 4: Follow Us */}
            {selectedFeatures.has('social') && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A', marginBottom: '24px' }}>{content.footer.followUs}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src="/assets/social-media-icons/Twitter.png" alt="X" style={{ height: '24px', width: '24px', objectFit: 'contain' }} />
                  <img src="/assets/social-media-icons/Instagram.png" alt="Instagram" style={{ height: '24px', width: '24px', objectFit: 'contain' }} />
                  <img src="/assets/social-media-icons/Facebook.png" alt="Facebook" style={{ height: '24px', width: '24px', objectFit: 'contain' }} />
                  <img src="/assets/social-media-icons/Youtube.png" alt="Youtube" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
                  <img src="/assets/social-media-icons/Linkedin.png" alt="LinkedIn" style={{ height: '24px', width: '24px', objectFit: 'contain' }} />
                </div>
              </div>
            )}

          </div>
        </div>
      </footer>

      </React.Fragment>)}

      {/* ── Shop view: full catalog rendered when Shop nav is active ── */}
      {activeView === 'shop' && shopFeatureEnabled && (() => {
        const enableCheckout = checkoutEnabled;
        const sortKeyDisplay = Object.keys(SHOP_SORT_MAP).find(k => SHOP_SORT_MAP[k] === shopSort) || 'newest';

        // Showcase mode: reuse the same static demo products shown on the homepage
        // so the grid layout is visible without a live API.
        const demoCategories = [
          { id: 'cat-highrise', name: content.sections.highRise || 'High-Rise Needs' },
          { id: 'cat-safety',   name: content.sections.safetyTools || 'Safety Tools' },
        ];
        const demoProducts = [
          ...products.highRise.map(p => ({
            id: String(p.id), name: p.name,
            price: Number(p.price.replace(/[^0-9]/g, '')),
            image_url: p.img, category_id: 'cat-highrise',
          })),
          ...products.safety.map(p => ({
            id: String(p.id), name: p.name,
            price: Number(p.price.replace(/[^0-9]/g, '')),
            image_url: p.img, category_id: 'cat-safety',
          })),
        ];

        if (isBuilderMode && shopLoading && shopProducts.length === 0) {
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '320px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #E6F0FF', borderTopColor: '#006BFF', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
            </div>
          );
        }

        return (
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            width: isMobile ? '100%' : 'calc(100% - 80px)',
          }}>
            <ShopPage
              key={shopInitialCategory}
              initialCategory={shopInitialCategory}
              products={isBuilderMode ? shopProducts : demoProducts}
              categories={isBuilderMode ? shopCategories : demoCategories}
              totalCount={isBuilderMode ? shopTotal : demoProducts.length}
              currentPage={isBuilderMode ? shopPage : 1}
              pageSize={16}
              sortKey={sortKeyDisplay}
              enableCheckout={enableCheckout}
              onPageChange={isBuilderMode ? (p) => setShopPage(p) : undefined}
              onCategoryChange={isBuilderMode ? (catId) => {
                setShopPage(1);
                setShopCategoryFilter(catId === 'all' ? undefined : catId);
              } : undefined}
              onSortChange={isBuilderMode ? (key) => {
                setShopPage(1);
                setShopSort(SHOP_SORT_MAP[key] || 'updated_at:desc');
              } : undefined}
              accentColor={builderConfig?.accentColor || '#16894B'}
              isMobile={isMobile}
              handleDemoAction={enableCheckout ? addToCart : undefined}
              onOpenDetail={openProductDetail}
            />
          </div>
        );
      })()}

      {activeView === 'detail' && selectedProduct && (() => {
        const p = selectedProduct;
        const image = p.image_url || p.img || '';
        const numericPrice = typeof p.price === 'number'
          ? p.price
          : Number(String(p.price).replace(/[^0-9]/g, '')) || 0;
        const otherPicks = [...products.highRise, ...products.safety]
          .filter(item => item.id !== p.id)
          .slice(0, 4);

        return (
          <div style={{ maxWidth: '1280px', margin: '0 auto', width: isMobile ? '100%' : 'calc(100% - 80px)', padding: isMobile ? '24px 16px' : '40px 0' }}>
            <button onClick={() => setActiveView('shop')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '13px', padding: 0, marginBottom: '20px' }}>
              {hpT('shop.title', 'Shop')} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg> {p.name}
            </button>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '40px' }}>
              <div style={{ flex: isMobile ? 'none' : '0 0 480px', width: isMobile ? '100%' : '480px' }}>
                <div style={{ width: '100%', aspectRatio: '1/1', background: '#F9FAFB', borderRadius: '12px', overflow: 'hidden' }}>
                  {image && <img src={image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 700, color: '#1A1A1A' }}>{p.name}</h1>
                <p style={{ margin: '0 0 24px', fontSize: '22px', fontWeight: 700, color: '#1A1A1A' }}>{formatRp(numericPrice)}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => setDetailQty(q => Math.max(1, q - 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#F3F4F6', cursor: 'pointer', fontSize: '16px' }}>−</button>
                    <span style={{ fontSize: '16px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{detailQty}</span>
                    <button onClick={() => setDetailQty(q => q + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#1A1A1A', color: '#FFF', cursor: 'pointer', fontSize: '16px' }}>+</button>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>{hpT('detail.subtotal', 'Subtotal')}</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>{formatRp(numericPrice * detailQty)}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
                  <button
                    onClick={() => { addToCart(p, detailQty); setActiveView('cart'); }}
                    style={{ flex: 1, height: '48px', borderRadius: '8px', border: '1.5px solid #1A1A1A', background: '#FFF', color: '#1A1A1A', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                  >
                    {hpT('detail.buyNow', 'Buy Now')}
                  </button>
                  <button
                    onClick={() => addToCart(p, detailQty)}
                    style={{ flex: 1, height: '48px', borderRadius: '8px', border: 'none', background: '#1A1A1A', color: '#FFF', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                  >
                    {hpT('detail.addToCart', 'Add to Cart')}
                  </button>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: '#1A1A1A', borderBottom: '2px solid #1A1A1A', display: 'inline-block', paddingBottom: '6px' }}>
                    {hpT('detail.description', 'Description')}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', lineHeight: 1.7 }}>
                    {hpT('detail.descriptionPlaceholder', 'No description available for this product yet.')}
                  </p>
                </div>
              </div>
            </div>

            {otherPicks.length > 0 && (
              <div style={{ marginTop: '48px' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: '#1A1A1A' }}>{hpT('detail.otherPicks', 'Other picks')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '20px' }}>
                  {otherPicks.map(item => (
                    <div key={item.id} onClick={() => openProductDetail(item)} style={{ cursor: 'pointer' }}>
                      <div style={{ width: '100%', aspectRatio: '1/1', background: '#F9FAFB', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px' }}>
                        <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#1A1A1A' }}>{item.name}</p>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {activeView === 'cart' && (
        <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: isMobile ? '100%' : 'calc(100% - 80px)', padding: isMobile ? '24px 16px' : '40px 0', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px', alignItems: 'flex-start' }}>
          {/* Left: line items */}
          <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
            <button onClick={() => setActiveView('shop')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#1A1A1A', fontSize: '20px', fontWeight: 700, padding: 0, marginBottom: '24px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
              {hpT('cart.pageTitle', 'Cart')}
            </button>

            {cartItems.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#6B7280' }}>{hpT('cart.empty', 'Your cart is empty.')}</p>
            ) : (
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
                {cartItems.map((item, idx) => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', paddingBottom: '20px', marginBottom: idx < cartItems.length - 1 ? '20px' : 0, borderBottom: idx < cartItems.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', background: '#F9FAFB', flexShrink: 0 }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1A1A1A' }}>{item.name}</h4>
                        {item.fulfillmentType === 'pickup' && (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', whiteSpace: 'nowrap' }}>{hpT('cart.pickupOnly', 'Pickup Only')}</span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 12px', fontSize: '13px', color: '#6B7280' }}>{formatRp(item.price)}</p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>{formatRp(item.price * item.qty)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button onClick={() => removeFromCart(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6B7280', fontSize: '12px', cursor: 'pointer', padding: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
                          {hpT('cart.remove', 'Remove from cart')}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button onClick={() => updateCartQty(item.id, -1)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: '#F3F4F6', cursor: 'pointer', fontSize: '14px' }}>−</button>
                          <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: '#1A1A1A', color: '#FFF', cursor: 'pointer', fontSize: '14px' }}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: customer info / shipping / summary */}
          <div style={{ width: isMobile ? '100%' : '360px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#374151' }}>{hpT('checkout.customer.title', 'Customer Information')}</h4>
                {customerInfo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => { setCustomerInfo(null); setDeliveryOption(null); setShippingCalculatedSignature(null); }}
                      style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      {hpT('checkout.customer.reset', 'Reset')}
                    </button>
                    <button onClick={openCustomerModal} style={{ background: 'none', border: 'none', color: '#16894B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      {hpT('checkout.customer.edit', 'Edit')}
                    </button>
                  </div>
                )}
              </div>
              {customerInfo ? (
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{customerInfo.name}</p>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#4B5563' }}>+62{customerInfo.phone}{customerInfo.email ? ` | ${customerInfo.email}` : ''}</p>
                  {(customerInfo.fullAddress || customerInfo.address) && <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6B7280' }}>{customerInfo.fullAddress || customerInfo.address}</p>}
                  {customerInfo.pinpointAddress && (
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {hpT('checkout.customer.pinnedLabel', 'Pinpoint Address')}
                    </p>
                  )}
                  {customerInfo.notes && <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>{hpT('checkout.customer.notesLabel', 'Notes')}: {customerInfo.notes}</p>}
                </div>
              ) : (
                <button onClick={openCustomerModal} style={{ width: '100%', border: '1.5px dashed #D1D5DB', borderRadius: '8px', background: 'none', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                  {hpT('checkout.customer.add', 'Add Customer Information')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              )}
            </div>

            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>{hpT('checkout.shipping.title', 'Shipping Options')}</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    disabled={cartHasPickupOnlyItem}
                    onClick={() => setShippingMethod('delivery')}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px',
                      border: shippingMethod === 'delivery' ? '1.5px solid #1A1A1A' : '1px solid #E5E7EB',
                      background: cartHasPickupOnlyItem ? '#F9FAFB' : '#FFF',
                      color: cartHasPickupOnlyItem ? '#9CA3AF' : '#1A1A1A',
                      cursor: cartHasPickupOnlyItem ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600
                    }}
                  >
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid currentColor', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {shippingMethod === 'delivery' && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'currentColor' }} />}
                    </span>
                    {hpT('checkout.shipping.delivery', 'Delivery')}
                  </button>
                  <button
                    onClick={() => setShippingMethod('pickup')}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px',
                      border: shippingMethod === 'pickup' ? '1.5px solid #1A1A1A' : '1px solid #E5E7EB',
                      background: '#FFF', color: '#1A1A1A', cursor: 'pointer', fontSize: '13px', fontWeight: 600
                    }}
                  >
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid currentColor', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {shippingMethod === 'pickup' && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'currentColor' }} />}
                    </span>
                    {hpT('checkout.shipping.pickup', 'Pick Up')}
                  </button>
                </div>
                {shippingMethod === 'delivery' && !customerInfo && (
                  <div style={{ marginTop: '12px', border: '1.5px dashed #D1D5DB', borderRadius: '8px', padding: '20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
                      {hpT('checkout.shipping.courierNeedsCustomer', 'Add customer information to see courier options.')}
                    </p>
                  </div>
                )}
                {shippingMethod === 'delivery' && customerInfo && isOutOfLalamoveCoverage && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                    <p style={{ margin: 0, fontSize: '12px', color: '#C2410C', lineHeight: 1.5 }}>
                      {hpT('checkout.shipping.outOfCoverage', "Your address is outside the merchant's delivery area. Please use a different delivery address.")}
                    </p>
                  </div>
                )}
                {shippingMethod === 'delivery' && customerInfo && !isOutOfLalamoveCoverage && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column' }}>
                    {LALAMOVE_DELIVERY_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setDeliveryOption(option.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                          padding: '10px 2px', textAlign: 'left', cursor: 'pointer',
                          border: 'none', borderTop: '1px solid #F3F4F6', background: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{
                            width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                            border: '1.5px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {deliveryOption === option.id && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#1A1A1A' }} />}
                          </span>
                          <img src={lalamoveLogo} alt="Lalamove" style={{ height: '16px', width: 'auto', objectFit: 'contain' }} />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{option.label}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', whiteSpace: 'nowrap' }}>{formatRp(deliveryOptionCosts[option.id])}</span>
                      </button>
                    ))}
                  </div>
                )}
                {shippingMethod === 'pickup' && (
                  builderConfig?.storeAddress ? (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#F9FAFB', borderRadius: '8px', padding: '12px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{hpT('checkout.shipping.pickupLocationLabel', 'Pick Up Purchase in Store')}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{builderConfig.storeAddress}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#FFF', border: '1px solid #DC2626', borderRadius: '8px', padding: '12px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{hpT('checkout.shipping.pickupLocationLabel', 'Pick Up Purchase in Store')}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 700, color: '#DC2626' }}>{hpT('checkout.shipping.pickupLocationError', 'Unable to load pickup location')}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPickupLocationRetryCount(c => c + 1)}
                        style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 16v-4h4"/></svg>
                        {hpT('checkout.shipping.reloadLocation', 'Reload Location')}
                      </button>
                    </div>
                  )
                )}
              </div>

            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#374151' }}>{hpT('checkout.notes.title', 'Order Notes')}</h4>
              <button
                onClick={() => setOrderNotesEnabled(v => !v)}
                style={{ width: '38px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer', background: orderNotesEnabled ? '#16894B' : '#E5E7EB', position: 'relative', transition: 'background 0.2s' }}
              >
                <span style={{ position: 'absolute', top: '2px', left: orderNotesEnabled ? '18px' : '2px', width: '18px', height: '18px', borderRadius: '50%', background: '#FFF', transition: 'left 0.2s' }} />
              </button>
            </div>
            {orderNotesEnabled && (
              <textarea
                value={orderNotesText}
                onChange={e => setOrderNotesText(e.target.value)}
                placeholder={hpT('checkout.notes.placeholder', 'Add a note for this order')}
                style={{ width: '100%', minHeight: '70px', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            )}

            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>{hpT('checkout.summary.title', 'Order Summary')}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4B5563', marginBottom: '8px' }}>
                <span>{hpT('checkout.summary.subtotal', 'Subtotal')}</span><span>{formatRp(cartSubtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4B5563', marginBottom: shippingCost > 0 ? '8px' : '12px', paddingBottom: shippingCost > 0 ? 0 : '12px', borderBottom: shippingCost > 0 ? 'none' : '1px solid #F3F4F6' }}>
                <span>{hpT('checkout.summary.tax', 'Tax (11%)')}</span><span>{formatRp(Math.round(cartSubtotal * 0.11))}</span>
              </div>
              {shippingCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4B5563', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
                  <span>{hpT('checkout.summary.shipping', 'Shipping Cost')}</span><span>{formatRp(shippingCost)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>
                <span>{hpT('checkout.summary.total', 'Total Shopping')}</span><span>{formatRp(cartSubtotal + Math.round(cartSubtotal * 0.11) + shippingCost)}</span>
              </div>
              {isShippingStale && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                  <p style={{ margin: 0, fontSize: '12px', color: '#C2410C', lineHeight: 1.5 }}>
                    {hpT('checkout.shipping.staleNotice', 'The shipping cost must be recalculated because your cart has changed. Recalculate it before placing your order.')}
                  </p>
                </div>
              )}
              <button
                onClick={isShippingStale ? handleRecalculateShipping : handlePurchase}
                disabled={cartItems.length === 0 || isOutOfLalamoveCoverage}
                style={{ width: '100%', background: (cartItems.length === 0 || isOutOfLalamoveCoverage) ? '#D1D5DB' : '#1A1A1A', color: '#FFF', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 600, fontSize: '14px', cursor: (cartItems.length === 0 || isOutOfLalamoveCoverage) ? 'not-allowed' : 'pointer' }}
              >
                {isShippingStale ? hpT('checkout.shipping.recalculate', 'Recalculate Shipping Cost') : hpT('checkout.purchase.button', 'Purchase')}
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {customerModalStep && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={closeCustomerModal}>
          {customerModalStep === 'phone' ? (
            <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '520px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1A1A1A' }}>{hpT('checkout.customer.modalTitle', 'Customer Information')}</h3>
                <button onClick={closeCustomerModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>✕</button>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B7280' }}>{hpT('checkout.customer.modalSubtitle', 'Please enter your phone number to process the order')}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <PhoneInput value={customerPhoneInput} onChange={setCustomerPhoneInput} height="48px" />
                </div>
                <button onClick={handleCustomerPhoneContinue} style={{ background: '#1A1A1A', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0 22px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                  {hpT('checkout.customer.continue', 'Continue')}
                </button>
              </div>
              {customerLookupError && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#DC2626' }}>{customerLookupError}</p>}
            </div>
          ) : (
            <div onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
              {/* Sticky header */}
              <div style={{ flexShrink: 0, padding: '24px 24px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1A1A1A' }}>
                    {isEditingCustomer
                      ? hpT('checkout.customer.editTitle', 'Edit Customer Information')
                      : hpT('checkout.customer.detailTitle', 'Add Customer Information')}
                  </h3>
                  <button onClick={closeCustomerModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>✕</button>
                </div>
                <p style={{ margin: isEditingCustomer ? 0 : '0 0 12px', fontSize: '13px', color: '#6B7280' }}>{hpT('checkout.customer.detailSubtitle', 'Make sure the information entered is valid for order processing.')}</p>
                {!isEditingCustomer && (
                  <div style={{ background: '#F3F4F6', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#374151' }}>
                    {hpT('checkout.customer.firstTimeNotice', "It looks like this is your first time here. Please provide your name to continue your order")}
                  </div>
                )}
              </div>

              {/* Scrollable form body */}
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <TextField
                    label={hpT('checkout.customer.field.name', 'Name')}
                    required
                    showCount
                    maxLength={100}
                    placeholder={hpT('checkout.customer.field.namePlaceholder', 'Input Name')}
                    value={customerDetailDraft?.name || ''}
                    onChange={e => updateCustomerDraft('name', e.target.value)}
                    errorText={customerDetailErrors.name}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <Field label={hpT('checkout.customer.field.phone', 'Phone')} required>
                      <PhoneInput value={customerDetailDraft?.phone || ''} onChange={v => updateCustomerDraft('phone', v)} height="46px" error={customerDetailErrors.phone} />
                    </Field>
                    <TextField
                      label={hpT('checkout.customer.field.email', 'Email')}
                      placeholder={hpT('checkout.customer.field.emailPlaceholder', 'Input Email')}
                      value={customerDetailDraft?.email || ''}
                      onChange={e => updateCustomerDraft('email', e.target.value)}
                    />
                  </div>

                  {shippingMethod !== 'pickup' && (<>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <CeDropdown
                      label={hpT('checkout.customer.field.country', 'Country')}
                      required
                      size="lg"
                      searchable
                      disabled
                      placeholder={hpT('checkout.customer.field.countryPlaceholder', 'Select Country')}
                      options={customerCountries.map(c => ({ value: c.label, label: c.label }))}
                      value={customerDetailDraft?.country || ''}
                      onChange={v => updateCustomerDraft('country', v, { province: '', city: '', district: '', region: '', zip: '' })}
                      error={!!customerDetailErrors.country}
                      errorText={customerDetailErrors.country}
                    />
                    <CeDropdown
                      label={hpT('checkout.customer.field.province', 'Province')}
                      required
                      size="lg"
                      searchable
                      disabled={!customerDetailDraft?.country}
                      placeholder={hpT('checkout.customer.field.provincePlaceholder', 'Select Province')}
                      options={customerProvinces.map(p => ({ value: p.label, label: p.label }))}
                      value={customerDetailDraft?.province || ''}
                      onChange={v => updateCustomerDraft('province', v, { city: '', district: '', region: '', zip: '' })}
                      error={!!customerDetailErrors.province}
                      errorText={customerDetailErrors.province}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <CeDropdown
                      label={hpT('checkout.customer.field.city', 'City')}
                      required
                      size="lg"
                      searchable
                      disabled={!customerDetailDraft?.province}
                      placeholder={hpT('checkout.customer.field.cityPlaceholder', 'Select City')}
                      options={customerCities.map(c => ({ value: c.label, label: c.label }))}
                      value={customerDetailDraft?.city || ''}
                      onChange={v => updateCustomerDraft('city', v, { district: '', region: '', zip: '' })}
                      error={!!customerDetailErrors.city}
                      errorText={customerDetailErrors.city}
                    />
                    <CeDropdown
                      label={hpT('checkout.customer.field.district', 'District')}
                      required
                      size="lg"
                      searchable
                      disabled={!customerDetailDraft?.city || customerDetailDraft?.country !== 'Indonesia'}
                      placeholder={hpT('checkout.customer.field.districtPlaceholder', 'Select District')}
                      options={customerDistricts.map(d => ({ value: d.label, label: d.label }))}
                      value={customerDetailDraft?.district || ''}
                      onChange={v => updateCustomerDraft('district', v, { region: '', zip: '' })}
                      error={!!customerDetailErrors.district}
                      errorText={customerDetailErrors.district}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    <CeDropdown
                      label={hpT('checkout.customer.field.region', 'Region')}
                      required
                      size="lg"
                      searchable
                      disabled={!customerDetailDraft?.district || customerDetailDraft?.country !== 'Indonesia'}
                      placeholder={hpT('checkout.customer.field.regionPlaceholder', 'Select Region')}
                      options={customerVillages.map(v => ({ value: v.label, label: v.label }))}
                      value={customerDetailDraft?.region || ''}
                      onChange={v => updateCustomerDraft('region', v)}
                      error={!!customerDetailErrors.region}
                      errorText={customerDetailErrors.region}
                    />
                    <NumberField
                      label={hpT('checkout.customer.field.zip', 'ZIP/Postal Code')}
                      required
                      allowNegative={false}
                      decimalPlaces={0}
                      disabled={customerZipLoading}
                      placeholder={customerZipLoading ? hpT('checkout.customer.field.zipLoading', 'Loading...') : hpT('checkout.customer.field.zipPlaceholder', 'e.g. 12345')}
                      value={customerDetailDraft?.zip || ''}
                      onChange={e => updateCustomerDraft('zip', e.target.value)}
                      errorText={customerDetailErrors.zip}
                    />
                  </div>

                  <TextField
                    label={hpT('checkout.customer.field.address', 'Address')}
                    required
                    multiline
                    rows={2}
                    showCount
                    maxLength={400}
                    placeholder={hpT('checkout.customer.field.addressPlaceholder', 'e.g. Jalan Mawar No.1')}
                    value={customerDetailDraft?.address || ''}
                    onChange={e => updateCustomerDraft('address', e.target.value)}
                    errorText={customerDetailErrors.address}
                  />

                  <CeDropdown
                    label={hpT('checkout.customer.field.pinpoint', 'Pinpoint Address')}
                    required
                    size="lg"
                    searchable
                    placeholder={hpT('checkout.customer.field.pinpointPlaceholder', 'Street name, building, house number')}
                    options={customerPinpointOptions}
                    loading={customerPinpointLoading}
                    value={customerSelectedPlace?.id ?? ''}
                    onSearch={handleCustomerPinpointSearch}
                    onChange={handleCustomerSelectPlace}
                    error={!!customerDetailErrors.pinpointAddress}
                    errorText={customerDetailErrors.pinpointAddress}
                  />

                  {customerSelectedPlace && customerSelectedPlace.lat != null && customerSelectedPlace.lng != null && (
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{hpT('checkout.customer.pinInstructionTitle', 'Pin the right point')}</p>
                      <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#6B7280' }}>{hpT('checkout.customer.pinInstructionSubtitle', "We'll deliver to the map address. Please verify the point and adjust if necessary.")}</p>
                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                      <StaticMapPreview lat={customerSelectedPlace.lat} lng={customerSelectedPlace.lng} width={592} height={200} />
                      <div
                        style={{
                          position: 'absolute', insetInline: 0, top: 0, padding: '12px 16px',
                          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                          background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0) 100%)',
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{hpT('checkout.customer.pinTitle', 'Pinned location')}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#4B5563' }}>{customerSelectedPlace.label}</p>
                      </div>
                    </div>
                    </div>
                  )}
                  </>)}

                  <TextField
                    label={hpT('checkout.customer.field.notes', 'Notes')}
                    multiline
                    rows={2}
                    showCount
                    maxLength={400}
                    placeholder={hpT('checkout.customer.field.notesPlaceholder', 'e.g. Drop at receptionist')}
                    value={customerDetailDraft?.notes || ''}
                    onChange={e => updateCustomerDraft('notes', e.target.value)}
                  />
                </div>
              </div>

              {/* Sticky footer */}
              <div style={{ flexShrink: 0, padding: '16px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!customerDetailDraft?.saveForNext} onChange={e => setCustomerDetailDraft(d => ({ ...d, saveForNext: e.target.checked }))} />
                  {hpT('checkout.customer.saveForNext', 'Save data for the next order')}
                </label>
                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                  <button onClick={() => (isEditingCustomer ? closeCustomerModal() : setCustomerModalStep('phone'))} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFF', fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                    {hpT('checkout.customer.back', 'Back')}
                  </button>
                  <button onClick={handleCustomerDetailSave} style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#1A1A1A', color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    {isEditingCustomer ? hpT('checkout.customer.saveChanges', 'Save Changes') : hpT('checkout.customer.save', 'Save')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {showAppointmentModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowAppointmentModal(false)}>
          <form onSubmit={handleAppointmentSubmit} onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1A1A1A' }}>{content.appointment.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{hpT('appointment.form.name', 'Name')}</label>
              <input type="text" value={apptName} onChange={e => setApptName(e.target.value)} required style={{ height: '48px', padding: '0 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{hpT('appointment.form.phone', 'Phone Number')}</label>
              <PhoneInput value={apptPhoneStr} onChange={setApptPhoneStr} height="48px" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{hpT('appointment.form.date', 'Preferred Date')}</label>
              <input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} required style={{ height: '48px', padding: '0 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '15px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowAppointmentModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFF', fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                {content.rfq.modal.cancel}
              </button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#16894B', color: '#FFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                {content.appointment.button}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
}

const ProductGroup = ({ id, title, items, onDemo, onQuickAdd, onSeeAll, seeAllLabel, isMobile }) => {
  const { t } = useTranslation();
  return (
  <section id={id} style={{ padding: isMobile ? '16px 16px' : '30px 0', maxWidth: '1280px', margin: '0 auto', width: isMobile ? '100%' : 'calc(100% - 80px)', overflow: 'hidden' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, color: '#1A1A1A' }}>{title}</h2>
      <button
        onClick={onSeeAll || onDemo}
        style={{ 
          background: 'none', border: 'none', color: '#16894B', 
          fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px'
        }}
      >
        {seeAllLabel} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>

    <div style={{ 
      display: isMobile ? 'flex' : 'grid', 
      gridTemplateColumns: isMobile ? 'none' : 'repeat(6, 1fr)', 
      gap: isMobile ? '16px' : '20px',
      overflowX: isMobile ? 'auto' : 'visible',
      scrollSnapType: isMobile ? 'x mandatory' : 'none',
      paddingBottom: isMobile ? '12px' : 0,
      WebkitOverflowScrolling: 'touch'
    }}>
      {items.map(p => (
        <div key={p.id} onClick={() => onDemo?.(p)} style={{
          background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', 
          border: '1px solid #F3F4F6', cursor: 'pointer', transition: 'all 0.3s ease',
          display: 'flex', flexDirection: 'column',
          flexShrink: 0,
          width: isMobile ? '140px' : 'auto',
          scrollSnapAlign: 'start'
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
          <div style={{ width: '100%', aspectRatio: '1/1', background: '#F9FAFB', overflow: 'hidden', position: 'relative' }}>
            <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            {/* Quick add to cart — only shown when online checkout is enabled */}
            {onQuickAdd && (
              <button
                onClick={(e) => { e.stopPropagation(); onQuickAdd(p); }}
                style={{
                  position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px',
                  borderRadius: '50%', border: '1px solid #E5E7EB', background: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                }}
                aria-label={t('website:shop.addToCart')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </button>
            )}
          </div>
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{
              fontSize: '13px', fontWeight: 500, color: '#4B5563', marginBottom: '8px',
              height: '40px', overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.5'
            }}>{p.name}</h3>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A', marginTop: 'auto' }}>{p.price}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
  );
};

export default HouzezPreview;
