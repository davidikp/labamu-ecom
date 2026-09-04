import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '../contexts/SnackbarContext';
import Button from '../components/ui/Button';
import { Dropdown as CeDropdown, Toggle, Checkbox, Breadcrumbs, Infobox, NumberField, Popup } from '../ce-ui';
import { applyBulkEdits } from '../services/catalogService';

function useVisibilityOptions(t) {
  return [
    { value: 'show', label: t('catalog:common.showOnWebsiteTitle') },
    { value: 'hide', label: t('catalog:common.hideFromWebsite') },
  ];
}

// ─── Number field with trailing unit (ce-ui NumberField) ─────────────────────
function NumField({ value, onChange, placeholder, unit }) {
  return (
    <NumberField
      size="md"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rightAddon={unit}
      allowNegative={false}
      className="w-full"
    />
  );
}

const TH = { padding: '16px 12px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#282828', background: '#FFFFFF', borderBottom: '1px solid #D4D4D4', whiteSpace: 'nowrap', fontFamily: "'Lato', sans-serif" };
const TD = { padding: '12px', borderBottom: '1px solid #E9E9E9', fontSize: '14px', color: '#282828', fontFamily: "'Lato', sans-serif", verticalAlign: 'middle' };

export default function BulkEditCatalog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const VISIBILITY_OPTIONS = useVisibilityOptions(t);

  const kind = location.state?.kind === 'package' ? 'package' : 'catalog';
  const backTo = location.state?.backTo || (kind === 'package' ? '/catalog/package' : '/catalog');
  const label = kind === 'package' ? t('catalog:common.packageLabel') : t('catalog:common.catalogLabel');
  const initialItems = location.state?.items;

  // Draft rows (editable copies of the selected items).
  const makeInitialRows = () => (initialItems || []).map(it => ({
    id: it.id,
    name: it.name,
    // Catalog rows carry `weight`; packages/detail carry `gross_weight`.
    weight: (it.gross_weight ?? it.weight) != null ? String(it.gross_weight ?? it.weight) : '',
    length: it.length != null ? String(it.length) : '',
    width:  it.width != null ? String(it.width) : '',
    height: it.height != null ? String(it.height) : '',
    visible: it.platform_status === 'published',
  }));
  const [rows, setRows] = useState(makeInitialRows);
  const [initialRows] = useState(makeInitialRows);
  const [selectedIds, setSelectedIds] = useState(() => new Set((initialItems || []).map(it => it.id)));
  const [discardTarget, setDiscardTarget] = useState(null);
  const [noChangesOpen, setNoChangesOpen] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(rows) !== JSON.stringify(initialRows), [rows, initialRows]);

  function goBack(target) {
    if (isDirty) {
      setDiscardTarget(target);
    } else {
      navigate(target);
    }
  }

  // Apply-to-selected inputs
  const [applyWeight, setApplyWeight] = useState('');
  const [applyLength, setApplyLength] = useState('');
  const [applyWidth, setApplyWidth]   = useState('');
  const [applyHeight, setApplyHeight] = useState('');
  const [applyVisibility, setApplyVisibility] = useState('');

  const missingWeightOrVolume = useMemo(
    () => rows.some(r => !r.weight || !r.length || !r.width || !r.height),
    [rows],
  );

  // No selection state (e.g. page opened directly) → send the user back.
  if (!initialItems || initialItems.length === 0) {
    return (
      <div style={{ padding: '24px', background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
        <p style={{ fontSize: '15px', color: '#7E7E7E' }}>{t('catalog:bulkEdit.noItemsSelected')}</p>
        <button onClick={() => navigate(backTo)} style={{ border: 'none', background: 'none', color: '#006BFF', cursor: 'pointer', fontSize: '14px' }}>{t('catalog:bulkEdit.backToLabel', { label })}</button>
      </div>
    );
  }

  const allSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.id));
  const someSelected = rows.some(r => selectedIds.has(r.id));

  function toggleRowSelect(id) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(rows.map(r => r.id)));
  }
  function setField(id, field, value) {
    setRows(list => list.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  const applyHasValue = applyWeight || applyLength || applyWidth || applyHeight || applyVisibility;

  function applyToSelected() {
    if (!applyHasValue || selectedIds.size === 0) return;
    setRows(list => list.map(r => {
      if (!selectedIds.has(r.id)) return r;
      return {
        ...r,
        weight: applyWeight !== '' ? applyWeight : r.weight,
        length: applyLength !== '' ? applyLength : r.length,
        width:  applyWidth !== '' ? applyWidth : r.width,
        height: applyHeight !== '' ? applyHeight : r.height,
        visible: applyVisibility ? applyVisibility === 'show' : r.visible,
      };
    }));
    // Reset the bulk fields back to their default state.
    setApplyWeight(''); setApplyLength(''); setApplyWidth(''); setApplyHeight(''); setApplyVisibility('');
    showSnackbar(t('catalog:bulkEdit.appliedToSelected'), 'success');
  }

  function handleSave() {
    if (!isDirty) {
      setNoChangesOpen(true);
      return;
    }
    // Persist to the in-memory override layer so the list reflects the changes
    // after navigating back (no backend endpoint for these fields yet).
    const edits = rows.map(r => {
      const weight = r.weight === '' ? null : Number(r.weight);
      return {
        id: r.id,
        // Set both field names so the catalog list (`weight`) and package/detail
        // (`gross_weight`) all reflect the change.
        weight,
        gross_weight: weight,
        length: r.length === '' ? null : Number(r.length),
        width:  r.width === '' ? null : Number(r.width),
        height: r.height === '' ? null : Number(r.height),
        platform_status: r.visible ? 'published' : 'draft',
      };
    });
    applyBulkEdits(kind, edits);
    showSnackbar(t('catalog:bulkEdit.changesSaved'), 'success');
    navigate(backTo);
  }

  return (
    <div style={{ background: '#F4F4F4', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <Breadcrumbs
            title={t('catalog:bulkEdit.title', { label })}
            breadcrumbs={[{ name: label, onClick: () => goBack(backTo) }]}
            onBack={() => goBack(backTo)}
          />
        </div>

        {/* Weight / Volume banner */}
        {missingWeightOrVolume && (
          <div style={{ marginBottom: '20px' }}>
            <Infobox variant="info" title={t('catalog:weightVolume.requiredTitle')}
              description={t('catalog:weightVolume.requiredDesc')} />
          </div>
        )}

        {/* Card — fills remaining height; only the table body scrolls */}
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Apply-to-selected row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderBottom: '1px solid #E9E9E9', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}><NumField value={applyWeight} onChange={setApplyWeight} placeholder={t('catalog:bulkEdit.placeholders.weight')} unit="gr" /></div>
            <div style={{ flex: 1, minWidth: 0 }}><NumField value={applyLength} onChange={setApplyLength} placeholder={t('catalog:bulkEdit.placeholders.length')} unit="cm" /></div>
            <span style={{ color: '#A9A9A9', flexShrink: 0 }}>x</span>
            <div style={{ flex: 1, minWidth: 0 }}><NumField value={applyWidth} onChange={setApplyWidth} placeholder={t('catalog:bulkEdit.placeholders.width')} unit="cm" /></div>
            <span style={{ color: '#A9A9A9', flexShrink: 0 }}>x</span>
            <div style={{ flex: 1, minWidth: 0 }}><NumField value={applyHeight} onChange={setApplyHeight} placeholder={t('catalog:bulkEdit.placeholders.height')} unit="cm" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <CeDropdown options={VISIBILITY_OPTIONS} value={applyVisibility} onChange={setApplyVisibility} placeholder={t('catalog:bulkEdit.selectWebVisibility')} size="md" searchable={false} />
            </div>
            <button onClick={applyToSelected} disabled={!applyHasValue || !someSelected}
              style={{ flexShrink: 0, padding: '10px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif", whiteSpace: 'nowrap',
                background: (applyHasValue && someSelected) ? '#006BFF' : '#F4F4F4',
                color: (applyHasValue && someSelected) ? '#FFFFFF' : '#A9A9A9',
                cursor: (applyHasValue && someSelected) ? 'pointer' : 'default' }}>
              {t('catalog:bulkEdit.applyToSelected')}
            </button>
          </div>

          {/* Table — scrollable body */}
          <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: '14px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ ...TH, width: '44px', padding: '16px 12px 16px 20px' }}>
                    <Checkbox checked={allSelected ? true : someSelected ? 'indeterminate' : false} onChange={toggleSelectAll} />
                  </th>
                  <th style={{ ...TH, width: '180px' }}>{t('catalog:bulkEdit.nameColumn', { label })}</th>
                  <th style={TH}>{t('catalog:common.weightLabel')}</th>
                  <th style={TH}>{t('catalog:common.lengthLabel')}</th>
                  <th style={TH}>{t('catalog:common.widthLabel')}</th>
                  <th style={TH}>{t('catalog:common.heightLabel')}</th>
                  <th style={{ ...TH, textAlign: 'right', width: '144px' }}>{t('catalog:common.websiteVisibility')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td style={{ ...TD, padding: '12px 12px 12px 20px', width: '44px' }}>
                      <Checkbox checked={selectedIds.has(r.id)} onChange={() => toggleRowSelect(r.id)} />
                    </td>
                    <td style={{ ...TD, color: '#006BFF', fontWeight: 500, whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.name}>{r.name}</td>
                    <td style={TD}><NumField value={r.weight} onChange={v => setField(r.id, 'weight', v)} placeholder={t('catalog:bulkEdit.placeholders.weight')} unit="gr" /></td>
                    <td style={TD}><NumField value={r.length} onChange={v => setField(r.id, 'length', v)} placeholder={t('catalog:bulkEdit.placeholders.length')} unit="cm" /></td>
                    <td style={TD}><NumField value={r.width} onChange={v => setField(r.id, 'width', v)} placeholder={t('catalog:bulkEdit.placeholders.width')} unit="cm" /></td>
                    <td style={TD}><NumField value={r.height} onChange={v => setField(r.id, 'height', v)} placeholder={t('catalog:bulkEdit.placeholders.height')} unit="cm" /></td>
                    <td style={{ ...TD, textAlign: 'right', width: '144px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Toggle checked={r.visible} onChange={checked => setField(r.id, 'visible', checked)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card footer */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #E9E9E9', flexShrink: 0 }}>
            <span style={{ fontSize: '14px', color: '#282828', opacity: 0.5 }}>{t('catalog:common.showFromRows', { shown: rows.length, total: rows.length })}</span>
          </div>
        </div>
      </div>

      {/* Pinned action bar */}
      <div style={{ flexShrink: 0, background: '#FFFFFF', borderTop: '1px solid #E9E9E9', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => goBack(backTo)} style={{ border: 'none', background: 'none', color: '#D0021B', fontSize: '14px', fontWeight: 700, fontFamily: "'Lato', sans-serif", cursor: 'pointer' }}>{t('catalog:bulkEdit.cancelEdit')}</button>
        <Button variant="primary" size="medium" onClick={handleSave}>{t('catalog:bulkEdit.saveChanges')}</Button>
      </div>

      <Popup
        open={discardTarget !== null}
        onClose={() => setDiscardTarget(null)}
        title={t('catalog:bulkEdit.discardTitle')}
        platform="desktop"
        primaryAction={{ label: t('catalog:common.yesDiscard'), onClick: () => navigate(discardTarget) }}
        secondaryAction={{ label: t('catalog:common.cancel'), onClick: () => setDiscardTarget(null) }}
      />

      <Popup
        open={noChangesOpen}
        onClose={() => setNoChangesOpen(false)}
        title={t('catalog:bulkEdit.noChangesTitle')}
        description={t('catalog:bulkEdit.noChangesDesc')}
        platform="desktop"
        primaryAction={{ label: t('catalog:common.okay'), onClick: () => setNoChangesOpen(false) }}
      />
    </div>
  );
}
