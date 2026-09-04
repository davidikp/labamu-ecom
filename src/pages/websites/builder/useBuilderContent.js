import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompany } from '../../../contexts/CompanyContext';
import { translateContent } from '../../../utils/translator';
import { BASE_CONFIG, ALL_LANGUAGES } from './constants';
import { loadStorefrontConfig } from './storefrontStorage';

const findLang = (code) =>
  ALL_LANGUAGES.find(l => l.code === code) ?? { code, label: code.toUpperCase() };

export function useBuilderContent() {
  const { t, i18n } = useTranslation('website');
  const { companyData } = useCompany();

  const bannerFileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);
  const quoteBgFileInputRef = useRef(null);

  const primaryCode = i18n.language === 'id' ? 'id' : 'en';

  // Resume editing whatever was last saved, so re-opening the builder doesn't
  // silently discard a merchant's published storefront config.
  const saved = useMemo(() => loadStorefrontConfig(), []);

  const [configs, setConfigs] = useState(() => saved?.configs ?? { [primaryCode]: { ...BASE_CONFIG } });
  const [sharedConfig, setSharedConfig] = useState(() => saved?.sharedConfig ?? {
    headerLogo: '',
    banners: [],
    businessName: '',
    footerPhone: '',
    footerEmail: '',
    businessAddress: { street: '', city: '', province: '', postalCode: '', country: '' },
  });
  const [languages, setLanguages] = useState(() => saved?.languages ?? [findLang(primaryCode)]);
  const [activeLang, setActiveLang] = useState(() => saved?.activeLang ?? primaryCode);
  const [isTranslating, setIsTranslating] = useState(false);
  const [cropModal, setCropModal] = useState({
    open: false, imageSrc: null, aspectRatio: 4 / 3, onSave: null,
  });

  // Refs used by stable callbacks to read current state without stale closures
  const activeLangRef = useRef(activeLang);
  activeLangRef.current = activeLang;
  const languagesRef = useRef(languages);
  languagesRef.current = languages;
  const configsRef = useRef(configs);
  configsRef.current = configs;
  const sharedConfigRef = useRef(sharedConfig);
  sharedConfigRef.current = sharedConfig;

  // Pre-fill from company profile; respects user overrides (only fills empty fields)
  useEffect(() => {
    if (!companyData) return;
    setSharedConfig(prev => ({
      ...prev,
      businessName: prev.businessName || companyData.businessName || '',
      footerPhone:  prev.footerPhone  || companyData.whatsapp || companyData.phone || '',
      footerEmail:  prev.footerEmail  || companyData.email || '',
      businessAddress: prev.businessAddress.street ? prev.businessAddress : {
        street:     companyData.address    || '',
        city:       companyData.city       || '',
        province:   companyData.province   || '',
        postalCode: companyData.postalCode || '',
        country:    companyData.country    || '',
      },
    }));
  }, [companyData]);

  // ── Derived ──────────────────────────────────────────────────────────────

  const currentConfig =
    configs[activeLang] ?? configs[languages[0]?.code] ?? BASE_CONFIG;

  // ── Config updaters ──────────────────────────────────────────────────────

  // activeLang is intentionally in deps: writing to the wrong language on a
  // stale closure would silently corrupt data.
  const updateConfig = useCallback((key, value) => {
    setConfigs(prev => ({
      ...prev,
      [activeLangRef.current]: { ...prev[activeLangRef.current], [key]: value },
    }));
  }, []); // reads activeLang via ref — stable reference, always current value

  const updateSharedConfig = useCallback((key, value) => {
    setSharedConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Syncs featuredSections across ALL language configs simultaneously.
  const handleSetFeaturedSections = useCallback((sections) => {
    setConfigs(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(lang => {
        next[lang] = { ...next[lang], featuredSections: sections };
      });
      return next;
    });
  }, []);

  // Syncs enableCheckout + nav.shop label across ALL language configs simultaneously.
  const handleSetCheckout = useCallback((val) => {
    setConfigs(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(lang => {
        next[lang] = {
          ...next[lang],
          enableCheckout: val,
          nav: {
            ...next[lang].nav,
            shop: val
              ? (lang === 'id' ? 'Toko'    : 'Shop')
              : (lang === 'id' ? 'Katalog' : 'Catalog'),
          },
        };
      });
      return next;
    });
  }, []);

  // ── Language management ──────────────────────────────────────────────────

  const handleAddLanguage = useCallback((val) => {
    const code = val?.target ? val.target.value : val;
    if (!code) return;
    const langs = languagesRef.current;
    const langObj = findLang(code);
    if (!langObj || langs.find(l => l.code === code)) return;
    if (langs.length >= 5) { alert('Language limit reached.'); return; }

    const primaryConfig = configsRef.current[langs[0]?.code] ?? {};
    setConfigs(prev => ({ ...prev, [code]: { ...BASE_CONFIG, ...primaryConfig } }));
    setLanguages(prev => [...prev, langObj]);
    setActiveLang(code);
  }, []);

  const handleRemoveLanguage = useCallback((codeToRemove, e) => {
    e?.stopPropagation();
    const langs = languagesRef.current;
    if (langs.length <= 1) return;
    const remaining = langs.filter(l => l.code !== codeToRemove);
    if (activeLangRef.current === codeToRemove) setActiveLang(remaining[0].code);
    setLanguages(remaining);
    setConfigs(prev => { const next = { ...prev }; delete next[codeToRemove]; return next; });
  }, []);

  // Reads current state via refs so the callback reference stays stable.
  // Stale values at call-time are not a concern because the user triggers this
  // from an interactive button (not from an effect).
  const handleAutoTranslate = useCallback(async () => {
    const lang = activeLangRef.current;
    const langs = languagesRef.current;
    const cfgs  = configsRef.current;
    const pCode = langs[0]?.code;
    if (lang === pCode) return;

    setIsTranslating(true);
    try {
      const targetLabel = langs.find(l => l.code === lang)?.label ?? lang;
      const translated = await translateContent({ ...cfgs[pCode] }, targetLabel);
      setConfigs(prev => ({ ...prev, [lang]: { ...prev[lang], ...translated } }));
      alert(`Successfully merged translations for ${targetLabel}!`);
    } catch (e) {
      alert(`Translation failed: ${e.message}\n\nMake sure VITE_GEMINI_API_KEY is in your .env.local file.`);
    } finally {
      setIsTranslating(false);
    }
  }, []); // stable — reads state via refs at invocation time

  // ── Custom-page config callbacks (called by useBuilderFeatures) ──────────

  const handleCustomPageAdd = useCallback((id, defaultName) => {
    setConfigs(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(lang => {
        next[lang] = {
          ...next[lang],
          customPages: { ...(next[lang].customPages || {}), [id]: defaultName },
        };
      });
      return next;
    });
  }, []);

  const handleCustomPageRemove = useCallback((id) => {
    setConfigs(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(lang => {
        const { [id]: _, ...rest } = next[lang].customPages || {};
        next[lang] = { ...next[lang], customPages: rest };
      });
      return next;
    });
  }, []);

  const handleCustomPageRename = useCallback((id, name) => {
    setConfigs(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(lang => {
        next[lang] = {
          ...next[lang],
          customPages: { ...(next[lang].customPages || {}), [id]: name },
        };
      });
      return next;
    });
  }, []);

  // ── Crop modal ────────────────────────────────────────────────────────────

  const openCropModal = useCallback((imageSrc, aspectRatio, onSave) => {
    setCropModal({ open: true, imageSrc, aspectRatio, onSave });
  }, []);

  const closeCropModal = useCallback(() => {
    setCropModal({ open: false, imageSrc: null, aspectRatio: 4 / 3, onSave: null });
  }, []);

  // ── Media upload handlers ─────────────────────────────────────────────────

  const handleBannerUpload = useCallback(() => {
    if (sharedConfigRef.current.banners.length < 3) bannerFileInputRef.current?.click();
  }, []);

  const handleBannerFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      openCropModal(ev.target.result, 4 / 3, (croppedUrl) => {
        setSharedConfig(prev => {
          if (prev.banners.length >= 3) return prev;
          return { ...prev, banners: [...prev.banners, croppedUrl] };
        });
        closeCropModal();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [openCropModal, closeCropModal]);

  const handleBannerRemove = useCallback((idx) => {
    setSharedConfig(prev => ({
      ...prev,
      banners: prev.banners.filter((_, i) => i !== idx),
    }));
  }, []);

  const handleQuoteBgUpload = useCallback(() => {
    quoteBgFileInputRef.current?.click();
  }, []);

  const handleQuoteBgFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      openCropModal(ev.target.result, 8 / 3, (croppedUrl) => {
        setConfigs(prev => {
          const updated = {};
          Object.keys(prev).forEach(lang => {
            updated[lang] = { ...prev[lang], rfq: { ...prev[lang].rfq, bgImage: croppedUrl } };
          });
          return updated;
        });
        closeCropModal();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [openCropModal, closeCropModal]);

  const handleLogoFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      openCropModal(ev.target.result, 1, (croppedUrl) => {
        setSharedConfig(prev => ({ ...prev, headerLogo: croppedUrl }));
        closeCropModal();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [openCropModal, closeCropModal]);

  // Updates a single field inside sharedConfig.businessAddress
  const updateAddress = useCallback((field, value) => {
    setSharedConfig(prev => ({
      ...prev,
      businessAddress: { ...prev.businessAddress, [field]: value },
    }));
  }, []);

  // ── Convenience bundle for LangPillsBar ──────────────────────────────────
  // Memoized so passing it as a prop to React.memo panels is stable when
  // unrelated config fields change (e.g. typing in a text input).
  const langBarProps = useMemo(() => ({
    languages,
    activeLang,
    setActiveLang,
    onAutoTranslate: handleAutoTranslate,
    isTranslating,
    t,
  }), [languages, activeLang, setActiveLang, handleAutoTranslate, isTranslating, t]);

  return {
    // State
    configs,
    sharedConfig,
    languages,
    activeLang,
    setActiveLang,
    isTranslating,
    cropModal,
    // Refs (passed to JSX hidden inputs)
    bannerFileInputRef,
    logoFileInputRef,
    quoteBgFileInputRef,
    // Derived
    currentConfig,
    langBarProps,
    companyData,
    // Config updaters
    updateConfig,
    updateSharedConfig,
    updateAddress,
    handleSetCheckout,
    handleSetFeaturedSections,
    // Language management
    handleAddLanguage,
    handleRemoveLanguage,
    handleAutoTranslate,
    // Custom page callbacks
    handleCustomPageAdd,
    handleCustomPageRemove,
    handleCustomPageRename,
    // Media
    handleBannerUpload,
    handleBannerFileSelect,
    handleBannerRemove,
    handleLogoFileSelect,
    handleQuoteBgUpload,
    handleQuoteBgFileSelect,
    // Crop modal
    openCropModal,
    closeCropModal,
  };
}
