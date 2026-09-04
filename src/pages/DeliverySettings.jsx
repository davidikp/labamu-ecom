import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Truck, ChevronRight } from 'lucide-react';
import {
  Tabs, Checkbox, TextField, NumberField, Dropdown, PhoneField, MainBtn, Infobox, Popup,
} from '../ce-ui';
import useRegions from '../hooks/useRegions';
import { fetchZipCode } from '../services/regions';
import { useSnackbar } from '../contexts/SnackbarContext';
import StaticMapPreview from '../components/StaticMapPreview';
import { loadDeliverySettings, saveDeliverySettings } from './deliverySettingsStorage';
import lalamoveLogo from '../assets/delivery/lalamove-logo.png';
import stepPartnerPortal from '../assets/delivery/step-partner-portal.png';
import stepApiKeys from '../assets/delivery/step-api-keys.png';

const DEFAULT_PURCHASABILITY = { pickup: true, delivery: true };

// Mock place search results — stand-in for the Google Places Autocomplete API
// (no API key/billing wired up yet). Swap handlePinpointSearch's body for a
// real Places Autocomplete call and this list becomes unnecessary.
const PLACE_SUGGESTIONS = [
  { id: 'p1', country: 'Indonesia', label: 'Jalan Taman Surya 2 I No. 23, Pegadungan, Kalideres', lat: -6.1352, lng: 106.7104 },
  { id: 'p2', country: 'Indonesia', label: 'Jalan Sudirman Kav. 52-53, Senayan, Jakarta Selatan', lat: -6.2245, lng: 106.8090 },
  { id: 'p3', country: 'Indonesia', label: 'Jalan Braga No. 1, Braga, Bandung', lat: -6.9166, lng: 107.6083 },
  { id: 'p4', country: 'Indonesia', label: 'Jalan Malioboro No. 52-58, Yogyakarta', lat: -7.7925, lng: 110.3654 },
  { id: 'p5', country: 'Indonesia', label: 'Jalan Tunjungan No. 1, Surabaya', lat: -7.2621, lng: 112.7378 },
  { id: 'p6', country: 'Singapore', label: '1 Raffles Place, Singapore', lat: 1.2838, lng: 103.8515 },
  { id: 'p7', country: 'Malaysia', label: 'Jalan Bukit Bintang, Kuala Lumpur', lat: 3.1466, lng: 101.7115 },
];

function ToggleCard({ icon: Icon, label, description, checked, onChange }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!checked); } }}
      className={`w-full flex items-center gap-4 text-left rounded-xl border px-4 py-4 transition-colors cursor-pointer outline-none bg-lb-surface ${
        checked ? 'border-lb-brand' : 'border-lb-line-1 hover:border-lb-line-2'
      }`}
    >
      <Checkbox checked={checked} onChange={onChange} />
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <Icon size={20} className="text-lb-on-surface" aria-hidden="true" />
          <p className="font-lb font-lb-bold text-[14px] text-lb-on-surface m-0">{label}</p>
        </div>
        <p className="font-lb text-[14px] text-lb-on-surface-2 m-0">{description}</p>
      </div>
    </div>
  );
}

function DeliveryInfoTab({
  t, purchasability, onPurchasabilityChange, showPurchasabilityError,
  contactName, onContactNameChange, phone, onPhoneChange,
  country, onCountryChange, province, onProvinceChange, city, onCityChange,
  district, onDistrictChange, region, onRegionChange, zip, onZipChange,
  address, onAddressChange, selectedPlace, onSelectedPlaceChange,
}) {
  const [zipLoading, setZipLoading] = useState(false);
  const [pinpointOptions, setPinpointOptions] = useState([]);
  const [pinpointLoading, setPinpointLoading] = useState(false);
  const pinpointSearchTimeout = useRef(null);

  const { countries, provinces, cities, districts, villages } = useRegions(country, province, city, district);

  const scopedPlaces = (query) => {
    const scoped = country ? PLACE_SUGGESTIONS.filter((p) => p.country === country) : PLACE_SUGGESTIONS;
    const q = query.trim().toLowerCase();
    return q ? scoped.filter((p) => p.label.toLowerCase().includes(q)) : scoped;
  };

  const handlePinpointSearch = (query) => {
    setPinpointLoading(true);
    window.clearTimeout(pinpointSearchTimeout.current);
    pinpointSearchTimeout.current = window.setTimeout(() => {
      setPinpointOptions(scopedPlaces(query).map((p) => ({ value: p.id, label: p.label })));
      setPinpointLoading(false);
    }, 300);
  };

  const handleSelectPlace = (placeId) => {
    const place = PLACE_SUGGESTIONS.find((p) => p.id === placeId);
    onSelectedPlaceChange(place ?? null);
    if (place) onAddressChange(place.label);
  };

  useEffect(() => {
    setPinpointOptions(scopedPlaces('').map((p) => ({ value: p.id, label: p.label })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  useEffect(() => () => window.clearTimeout(pinpointSearchTimeout.current), []);

  useEffect(() => {
    if (!region || country !== 'Indonesia') {
      // No region to derive a ZIP from — leave whatever the user typed alone.
      return;
    }
    let cancelled = false;
    setZipLoading(true);
    fetchZipCode(region, district).then(({ data }) => {
      if (cancelled) return;
      setZipLoading(false);
      onZipChange(data ?? '');
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, district, country]);

  const toOptions = (items) => items.map((i) => ({ value: i.label, label: i.label }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-5 py-6 w-full">
      <div className="border border-lb-line-1 rounded-xl p-6 flex flex-col gap-6">
        <div>
          <h3 className="font-lb font-lb-bold text-[16px] text-lb-on-surface m-0">{t('purchasability.title')}</h3>
          <p className="font-lb text-[14px] text-lb-on-surface-2 mt-1 mb-0">{t('purchasability.subtitle')}</p>
        </div>
        {showPurchasabilityError && (
          <p className="font-lb text-[12px] text-lb-red m-0">{t('purchasability.selectAtLeastOne', 'Select at least one option')}</p>
        )}
        <div className="flex flex-col gap-4">
          <ToggleCard
            icon={Store}
            label={t('purchasability.pickup.label')}
            description={t('purchasability.pickup.description')}
            checked={purchasability.pickup}
            onChange={(checked) => onPurchasabilityChange((prev) => ({ ...prev, pickup: checked }))}
          />
          <ToggleCard
            icon={Truck}
            label={t('purchasability.delivery.label')}
            description={t('purchasability.delivery.description')}
            checked={purchasability.delivery}
            onChange={(checked) => onPurchasabilityChange((prev) => ({ ...prev, delivery: checked }))}
          />
        </div>
      </div>

      <div className="border border-lb-line-1 rounded-xl p-6 flex flex-col gap-6">
        <div>
          <h3 className="font-lb font-lb-bold text-[16px] text-lb-on-surface m-0">{t('pickupInfo.title')}</h3>
          <p className="font-lb text-[14px] text-lb-on-surface-2 mt-1 mb-0">{t('pickupInfo.subtitle')}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label={t('pickupInfo.contactName')}
              required
              showCount
              maxLength={100}
              placeholder={t('pickupInfo.contactNamePlaceholder')}
              value={contactName}
              onChange={(e) => onContactNameChange(e.target.value)}
            />
            <PhoneField
              label={t('pickupInfo.contactNumber')}
              required
              defaultCountryCode="ID"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Dropdown
              label={t('pickupInfo.country')}
              required
              size="lg"
              searchable
              disabled
              placeholder={t('pickupInfo.countryPlaceholder')}
              options={toOptions(countries)}
              value={country}
              onChange={(v) => { onCountryChange(v); onProvinceChange(''); onCityChange(''); onDistrictChange(''); onRegionChange(''); }}
            />
            <Dropdown
              label={t('pickupInfo.province')}
              required
              size="lg"
              searchable
              placeholder={t('pickupInfo.provincePlaceholder')}
              options={toOptions(provinces)}
              value={province}
              disabled={!country}
              onChange={(v) => { onProvinceChange(v); onCityChange(''); onDistrictChange(''); onRegionChange(''); }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Dropdown
              label={t('pickupInfo.city')}
              required
              size="lg"
              searchable
              placeholder={t('pickupInfo.cityPlaceholder')}
              options={toOptions(cities)}
              value={city}
              disabled={!province}
              onChange={(v) => { onCityChange(v); onDistrictChange(''); onRegionChange(''); }}
            />
            <Dropdown
              label={t('pickupInfo.district')}
              required
              size="lg"
              searchable
              placeholder={t('pickupInfo.districtPlaceholder')}
              options={toOptions(districts)}
              value={district}
              disabled={!city || country !== 'Indonesia'}
              onChange={(v) => { onDistrictChange(v); onRegionChange(''); }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Dropdown
              label={t('pickupInfo.region')}
              required
              size="lg"
              searchable
              placeholder={t('pickupInfo.regionPlaceholder')}
              options={toOptions(villages)}
              value={region}
              disabled={!district || country !== 'Indonesia'}
              onChange={onRegionChange}
            />
            <NumberField
              label={t('pickupInfo.zip')}
              required
              allowNegative={false}
              decimalPlaces={0}
              disabled={zipLoading}
              placeholder={zipLoading ? t('pickupInfo.zipLoading', 'Loading...') : t('pickupInfo.zipInputPlaceholder')}
              value={zip}
              onChange={(e) => onZipChange(e.target.value)}
            />
          </div>

          <TextField
            label={t('pickupInfo.address')}
            required
            multiline
            rows={2}
            showCount
            maxLength={400}
            placeholder={t('pickupInfo.addressPlaceholder')}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />

          <Dropdown
            label={t('pickupInfo.pinpointAddress')}
            required
            size="lg"
            searchable
            placeholder={t('pickupInfo.pinpointAddressPlaceholder')}
            options={pinpointOptions}
            loading={pinpointLoading}
            value={selectedPlace?.id ?? ''}
            onSearch={handlePinpointSearch}
            onChange={handleSelectPlace}
          />

          {selectedPlace && (
            <div className="relative rounded-lb-sm overflow-hidden">
              <StaticMapPreview lat={selectedPlace.lat} lng={selectedPlace.lng} width={600} height={260} />
              <div
                className="absolute inset-x-0 top-0 px-4 py-3 backdrop-blur-md"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0) 100%)',
                }}
              >
                <p className="font-lb font-lb-bold text-[15px] text-lb-on-surface m-0">{t('pickupInfo.pinTitle')}</p>
                <p className="font-lb text-[13px] text-lb-on-surface-2 m-0 mt-0.5">{t('pickupInfo.pinSubtitle')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LinkedListItem({ before, linkText, href, after }) {
  return (
    <li>
      {before}
      <a href={href} target="_blank" rel="noreferrer" className="text-lb-on-surface underline hover:text-lb-brand">
        {linkText}
      </a>
      {after}
    </li>
  );
}

const STATUS_DOT_CLASS = {
  idle: 'bg-lb-on-surface-3',
  connecting: 'bg-lb-orange',
  connected: 'bg-lb-green',
  failed: 'bg-lb-red',
};

// Demo-only Lalamove coverage check — no real courier coverage API wired up yet.
const LALAMOVE_COVERED_CITIES = ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur', 'Bandung', 'Surabaya', 'Yogyakarta'];

function CourierServiceTab({
  t, country, city,
  lalamoveEnabled, onLalamoveEnabledChange,
  apiKey, onApiKeyChange, apiSecret, onApiSecretChange,
  savedApiKey, onSavedApiKeyChange, savedApiSecret, onSavedApiSecretChange,
  connectionStatus, onConnectionStatusChange,
}) {
  const { showSnackbar } = useSnackbar();
  const isOutOfCoverage = country === 'Indonesia' && !!city
    && !LALAMOVE_COVERED_CITIES.some((c) => city.toLowerCase().includes(c.toLowerCase()));
  const [isEditing, setIsEditing] = useState(false);
  const [disconnectModal, setDisconnectModal] = useState('none'); // none | checking | confirm | blocked
  const connected = connectionStatus === 'connected';
  const fieldsMasked = connected && !isEditing;
  const fieldsDisabled = connectionStatus === 'connecting' || fieldsMasked || isOutOfCoverage;

  const handleSaveAndConnect = () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      showSnackbar(t('courier.connectMissingFields'), 'red');
      return;
    }
    onConnectionStatusChange('connecting');
    window.setTimeout(() => {
      const succeeded = Math.random() >= 0.2;
      if (succeeded) {
        onConnectionStatusChange('connected');
        setIsEditing(false);
        onSavedApiKeyChange(apiKey);
        onSavedApiSecretChange(apiSecret);
        showSnackbar(t('courier.connectSuccess'), 'green');
      } else {
        onConnectionStatusChange('failed');
        showSnackbar(t('courier.savedSuccess'), 'green');
        window.setTimeout(() => showSnackbar(t('courier.connectFailed'), 'red'), 2500);
      }
    }, 1200);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    onApiKeyChange(savedApiKey);
    onApiSecretChange(savedApiSecret);
    setIsEditing(false);
  };

  const handleDisconnectClick = () => {
    setDisconnectModal('checking');
    window.setTimeout(() => {
      const hasOngoingDelivery = Math.random() < 0.5;
      setDisconnectModal(hasOngoingDelivery ? 'blocked' : 'confirm');
    }, 600);
  };

  const handleConfirmDisconnect = () => {
    const succeeded = Math.random() >= 0.2;
    if (succeeded) {
      onConnectionStatusChange('idle');
      onApiKeyChange('');
      onApiSecretChange('');
      onSavedApiKeyChange('');
      onSavedApiSecretChange('');
      setIsEditing(false);
      showSnackbar(t('courier.disconnectSuccess'), 'grey');
    } else {
      showSnackbar(t('courier.disconnectFailed'), 'red');
    }
    setDisconnectModal('none');
  };

  const closeDisconnectModal = () => setDisconnectModal('none');

  const handleToggleLalamove = (checked) => {
    onLalamoveEnabledChange(checked);
  };

  return (
    <div className="flex flex-row gap-5 px-5 py-6 w-full items-start">
      <div className="flex flex-col gap-4 w-[320px] shrink-0">
        <div className={`rounded-xl border p-4 flex flex-col gap-4 w-full bg-lb-surface ${lalamoveEnabled && !isOutOfCoverage ? 'border-lb-brand' : 'border-lb-line-1'}`}>
          <div className="flex items-center gap-2">
            <Checkbox checked={lalamoveEnabled && !isOutOfCoverage} disabled={isOutOfCoverage} onChange={handleToggleLalamove} />
            <img src={lalamoveLogo} alt={t('courier.lalamoveName')} className="h-5 w-auto object-contain" />
            <span className="font-lb font-lb-bold text-[16px] text-lb-on-surface">{t('courier.lalamoveName')}</span>
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT_CLASS[connectionStatus]}`} aria-hidden="true" />
            <span className="flex-1" />
            <ChevronRight size={20} className="text-lb-on-surface-3 shrink-0" aria-hidden="true" />
          </div>
          {isOutOfCoverage && (
            <>
              <div className="h-px bg-lb-line-1" />
              <Infobox variant="warning" description={t('courier.outOfCoverage', "Your address is outside the courier's coverage area. Please use a different delivery address.")} />
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 rounded-xl border border-lb-line-1 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={lalamoveLogo} alt={t('courier.lalamoveName')} className="h-7 w-auto object-contain" />
            <span className="font-lb font-lb-bold text-[18px] text-lb-on-surface">{t('courier.lalamoveName')}</span>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT_CLASS[connectionStatus]}`} aria-hidden="true" />
              <span className="font-lb text-[14px] text-lb-on-surface">
                {t(`courier.status.${connectionStatus}`)}
              </span>
            </span>
          </div>
          {connected && !isEditing ? (
            <div className="flex items-center gap-2">
              <MainBtn
                label={t('courier.disconnect')}
                size="sm"
                variant="danger"
                loading={disconnectModal === 'checking'}
                onClick={handleDisconnectClick}
              />
              <MainBtn label={t('courier.edit')} size="sm" variant="secondary" onClick={handleEdit} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isEditing && (
                <MainBtn label={t('courier.cancel')} size="sm" variant="secondary" onClick={handleCancelEdit} />
              )}
              <MainBtn
                label={t('courier.saveAndConnect')}
                size="sm"
                onClick={handleSaveAndConnect}
                disabled={connectionStatus === 'connecting' || isOutOfCoverage}
              />
            </div>
          )}
        </div>

        <div className="h-px bg-lb-line-1" />

        <Infobox variant="info" description={t('courier.productionNotice')} />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label={t('courier.apiKey')}
            required
            type={fieldsMasked ? 'password' : 'text'}
            state={fieldsDisabled ? 'disabled' : 'default'}
            placeholder={t('courier.apiKeyPlaceholder')}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
          />
          <TextField
            label={t('courier.apiSecret')}
            required
            type={fieldsMasked ? 'password' : 'text'}
            state={fieldsDisabled ? 'disabled' : 'default'}
            placeholder={t('courier.apiSecretPlaceholder')}
            value={apiSecret}
            onChange={(e) => onApiSecretChange(e.target.value)}
          />
        </div>

        <div className="h-px bg-lb-line-1" />

        <h4 className="font-lb font-lb-bold text-[16px] text-lb-on-surface m-0">{t('courier.howToConnect')}</h4>

        <div className="flex flex-col gap-2">
          <p className="font-lb font-lb-bold text-[14px] text-lb-on-surface m-0">{t('courier.prerequisites.title')}</p>
          <p className="font-lb text-[14px] text-lb-on-surface m-0">{t('courier.prerequisites.intro')}</p>
          <ul className="font-lb text-[14px] text-lb-on-surface pl-5 m-0 list-disc">
            <LinkedListItem
              before={t('courier.prerequisites.item1Before')}
              linkText={t('courier.prerequisites.item1LinkText')}
              href="https://www.lalamove.com/en-ph/blog/register-lalamove-for-business-3pl"
              after={t('courier.prerequisites.item1After')}
            />
            <li>{t('courier.prerequisites.item2')}</li>
          </ul>

          <img src={stepPartnerPortal} alt={t('courier.lalamovePartnerPortalLoginAlt')} className="w-full max-w-[400px] rounded-lb-sm border border-lb-line-1 mt-2" />

          <p className="font-lb font-lb-bold text-[14px] text-lb-on-surface m-0 mt-2">{t('courier.stepByStep.title')}</p>
          <ol className="font-lb text-[14px] text-lb-on-surface pl-5 m-0 flex flex-col gap-1 list-decimal">
            <li>
              {t('courier.stepByStep.step1.title')}
              <ul className="list-disc pl-5">
                <LinkedListItem
                  before={t('courier.stepByStep.step1.item1Before')}
                  linkText={t('courier.stepByStep.step1.item1LinkText')}
                  href="https://partnerportal.lalamove.com/login?redirect=/records"
                  after={t('courier.stepByStep.step1.item1After')}
                />
                <li>{t('courier.stepByStep.step1.item2')}</li>
                <li>{t('courier.stepByStep.step1.item3')}</li>
              </ul>
            </li>
            <li>
              {t('courier.stepByStep.step2.title')}
              <ul className="list-disc pl-5">
                <li>{t('courier.stepByStep.step2.item1')}</li>
                <li>{t('courier.stepByStep.step2.item2')}</li>
              </ul>
            </li>
            <li>
              {t('courier.stepByStep.step3.title')}
              <ul className="list-disc pl-5">
                <li>{t('courier.stepByStep.step3.item1')}</li>
                <li>{t('courier.stepByStep.step3.item2')}</li>
                <li>{t('courier.stepByStep.step3.item3')}</li>
              </ul>
            </li>
          </ol>

          <img src={stepApiKeys} alt={t('courier.lalamoveApiKeysPageAlt')} className="w-full max-w-[400px] rounded-lb-sm border border-lb-line-1 mt-2" />
        </div>
      </div>

      <Popup
        open={disconnectModal === 'confirm'}
        onClose={closeDisconnectModal}
        platform="desktop"
        title={t('courier.disconnectTitle')}
        description={t('courier.disconnectDescription')}
        secondaryAction={{ label: t('courier.disconnectCancel'), onClick: closeDisconnectModal }}
        primaryAction={{ label: t('courier.disconnectConfirm'), onClick: handleConfirmDisconnect, destructive: true }}
      />

      <Popup
        open={disconnectModal === 'blocked'}
        onClose={closeDisconnectModal}
        platform="desktop"
        title={t('courier.disconnectBlockedTitle')}
        description={t('courier.disconnectBlockedDescription')}
        primaryAction={{ label: t('courier.disconnectBlockedButton'), onClick: closeDisconnectModal }}
      />
    </div>
  );
}

export default function DeliverySettings() {
  const { t } = useTranslation('delivery');
  const { showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState('info');

  // Everything below is lifted out of the two tabs (rather than living as
  // local state inside them) for two reasons: only one tab is mounted at a
  // time, so "Save Changes" — which lives outside both tabs — needs a single
  // always-alive place to read every field from; and the Courier Service tab
  // needs to see the Delivery Info tab's pickup city/country even when that
  // tab isn't mounted, to run its coverage check.
  const saved = loadDeliverySettings();

  const [purchasability, setPurchasability] = useState(saved?.purchasability ?? DEFAULT_PURCHASABILITY);
  const [showPurchasabilityError, setShowPurchasabilityError] = useState(false);
  const [noCourierModalOpen, setNoCourierModalOpen] = useState(false);
  const [contactName, setContactName] = useState(saved?.contactName ?? '');
  const [phone, setPhone] = useState(saved?.phone ?? '');
  const [pickupCountry, setPickupCountry] = useState(saved?.country ?? 'Indonesia');
  const [province, setProvince] = useState(saved?.province ?? '');
  const [pickupCity, setPickupCity] = useState(saved?.city ?? '');
  const [district, setDistrict] = useState(saved?.district ?? '');
  const [region, setRegion] = useState(saved?.region ?? '');
  const [zip, setZip] = useState(saved?.zip ?? '');
  const [address, setAddress] = useState(saved?.address ?? '');
  const [selectedPlace, setSelectedPlace] = useState(saved?.selectedPlace ?? null);

  const [lalamoveEnabled, setLalamoveEnabled] = useState(saved?.lalamoveEnabled ?? true);
  const [apiKey, setApiKey] = useState(saved?.apiKey ?? '');
  const [apiSecret, setApiSecret] = useState(saved?.apiSecret ?? '');
  const [savedApiKey, setSavedApiKey] = useState(saved?.savedApiKey ?? '');
  const [savedApiSecret, setSavedApiSecret] = useState(saved?.savedApiSecret ?? '');
  const [connectionStatus, setConnectionStatus] = useState(saved?.connectionStatus ?? 'idle');

  const tabs = [
    { id: 'info', label: t('tabs.deliveryInfo') },
    { id: 'courier', label: t('tabs.courierService') },
  ];

  const commitSave = (effectivePurchasability) => {
    if (!effectivePurchasability.pickup && !effectivePurchasability.delivery) {
      setPurchasability(effectivePurchasability);
      setShowPurchasabilityError(true);
      setActiveTab('info');
      showSnackbar(t('purchasability.selectAtLeastOne', 'Select at least one option'), 'red');
      return;
    }
    setPurchasability(effectivePurchasability);
    setShowPurchasabilityError(false);
    saveDeliverySettings({
      purchasability: effectivePurchasability, contactName, phone,
      country: pickupCountry, province, city: pickupCity, district, region, zip, address, selectedPlace,
      lalamoveEnabled, apiKey, apiSecret, savedApiKey, savedApiSecret, connectionStatus,
    });
    showSnackbar(t('saveSuccess'), 'green');
  };

  const handleSaveChanges = () => {
    if (purchasability.delivery && connectionStatus !== 'connected') {
      setNoCourierModalOpen(true);
      return;
    }
    commitSave(purchasability);
  };

  const handleNoCourierCancel = () => setNoCourierModalOpen(false);

  const handleNoCourierContinue = () => {
    setNoCourierModalOpen(false);
    commitSave({ ...purchasability, delivery: false });
  };

  return (
    <div className="flex flex-col" style={{ background: '#F4F4F4', height: 'calc(100vh - 56px)' }}>
      <div className="flex-1 overflow-y-auto p-6 pb-6">
        <h1 className="font-lb font-lb-bold text-[26px] text-lb-on-surface mb-5">{t('title')}</h1>

        <div className="bg-lb-surface rounded-2xl shadow-sm overflow-visible">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="px-6 rounded-t-2xl" />
          {activeTab === 'info' ? (
            <DeliveryInfoTab
              t={t}
              purchasability={purchasability} onPurchasabilityChange={setPurchasability}
              showPurchasabilityError={showPurchasabilityError}
              contactName={contactName} onContactNameChange={setContactName}
              phone={phone} onPhoneChange={setPhone}
              country={pickupCountry} onCountryChange={setPickupCountry}
              province={province} onProvinceChange={setProvince}
              city={pickupCity} onCityChange={setPickupCity}
              district={district} onDistrictChange={setDistrict}
              region={region} onRegionChange={setRegion}
              zip={zip} onZipChange={setZip}
              address={address} onAddressChange={setAddress}
              selectedPlace={selectedPlace} onSelectedPlaceChange={setSelectedPlace}
            />
          ) : (
            <CourierServiceTab
              t={t}
              country={pickupCountry} city={pickupCity}
              lalamoveEnabled={lalamoveEnabled} onLalamoveEnabledChange={setLalamoveEnabled}
              apiKey={apiKey} onApiKeyChange={setApiKey}
              apiSecret={apiSecret} onApiSecretChange={setApiSecret}
              savedApiKey={savedApiKey} onSavedApiKeyChange={setSavedApiKey}
              savedApiSecret={savedApiSecret} onSavedApiSecretChange={setSavedApiSecret}
              connectionStatus={connectionStatus} onConnectionStatusChange={setConnectionStatus}
            />
          )}
        </div>
      </div>

      <div className="bg-lb-surface border-t-2 border-lb-line-1 px-6 py-4 flex justify-end">
        <MainBtn label={t('saveChanges')} onClick={handleSaveChanges} />
      </div>

      <Popup
        open={noCourierModalOpen}
        onClose={handleNoCourierCancel}
        platform="desktop"
        title={t('noCourierModal.title', 'No Delivery Service Connected')}
        description={t('noCourierModal.description', 'Delivery is enabled, but no delivery service is connected. If you continue, the Delivery option will be turned off automatically. You can connect a delivery service and enable it again anytime.')}
        secondaryAction={{ label: t('noCourierModal.cancel', 'Cancel'), onClick: handleNoCourierCancel }}
        primaryAction={{ label: t('noCourierModal.continue', 'Continue'), onClick: handleNoCourierContinue }}
      />
    </div>
  );
}
