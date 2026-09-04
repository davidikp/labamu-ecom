import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Trash2, Plus } from 'lucide-react';
import { Table, StatusBadge, MainBtn, Popup, DateTimeField } from '../../ce-ui';
import { loadDraft } from '../section-builder/state/storage';
import { createFreshState } from '../section-builder/state/useSectionBuilder';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { ACTIONS } from '../section-builder/state/builderReducer';
import ConfirmDialog from '../section-builder/ui/ConfirmDialog';
import { visibilityBucket, pageUrlFor } from '../section-builder/sections/pageHelpers';
import { formatRelativeTime } from './timeUtils';
import SimulateTrigger from './SimulateTrigger';
import CopyUrlButton from './CopyUrlButton';
import { storeDomainFor } from './storeDomain';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useCompany } from '../../contexts/CompanyContext';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry and
// ThemeGallery.jsx.
const STORE_ID = 'demo';

/**
 * Derives the "Content" column preview from the Page editor's persisted
 * `page.content` HTML (always present — even as `''` for untouched pages,
 * see createDefaultPages() and PageEditor.jsx's blankPage()).
 */
function stripHtmlAndTruncate(html, max) {
  const text = String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function contentPreview(page) {
  return page.content ? stripHtmlAndTruncate(page.content, 60) : '—';
}

function visibilityBadge(page, t) {
  const bucket = visibilityBucket(page);
  if (bucket === 'scheduled') {
    return <StatusBadge label={t('sectionBuilder:onlineStore.pages.scheduled', 'Scheduled')} color="blue" tone="soft" />;
  }
  if (bucket === 'hidden') {
    return <StatusBadge label={t('sectionBuilder:onlineStore.pages.hidden', 'Hidden')} color="grey" tone="soft" />;
  }
  return <StatusBadge label={t('sectionBuilder:onlineStore.pages.visible', 'Visible')} color="green" tone="soft" />;
}

/**
 * @module pages/online-store/PagesManagement
 * @description Online Store > Pages — Shopify-style table list of every page
 * on the site. This screen is read-only: it loads the persisted draft just to
 * render Title/Visibility/Content/Updated, then navigates into a dedicated
 * page-editor screen (`/online-store/pages/:pageId`, built in a later phase)
 * for every mutation — add/rename/delete/SEO/visibility all move there.
 */
export default function PagesManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { companyData } = useCompany();
  const storeDomain = storeDomainFor(companyData);
  const [draft, setDraft] = useState(() => loadDraft(STORE_ID) ?? createFreshState(STORE_ID));

  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Bulk Manage Pages — selection is tracked by id independently of the
  // current filter/sort/page, so it survives switching between filtered
  // views (Bulk Delete Pages' "selected across multiple filtered views"
  // case) while the header checkbox itself only ever (de)selects the rows
  // rendered on the current page (ce-ui Table's own behavior, matching
  // "only pages on the current page of results are selected").
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState(null);
  const [scheduleError, setScheduleError] = useState(null);

  // Simulate trigger — there's no real backend to fail a list load against,
  // so this is the escape hatch for exercising that negative state on
  // demand. Sticky: stays armed (showing the error placeholder in place of
  // the table) until switched off again.
  const [simulateLoadError, setSimulateLoadError] = useState(false);
  const [simulateNotFound, setSimulateNotFound] = useState(false);
  // 'none' | 'partial' | 'total' — same sticky simulate philosophy, but
  // mutually exclusive per bulk action (a select instead of a checkbox),
  // since an action can't be both partially and totally failing at once.
  const [simulateBulkDelete, setSimulateBulkDelete] = useState('none');
  const [simulateBulkVisibility, setSimulateBulkVisibility] = useState('none');

  // Retries the (simulated) load — re-reads the draft from local storage.
  // Doesn't touch `simulateLoadError` itself, so while that toggle is still
  // armed this deliberately keeps landing back on the same error state.
  const handleReloadPages = () => setDraft(loadDraft(STORE_ID) ?? createFreshState(STORE_ID));

  const pages = useMemo(() => draft.pages ?? [], [draft.pages]);

  const filteredPages = useMemo(() => {
    let rows = pages;
    if (visibilityFilter !== 'all') {
      rows = rows.filter((p) => visibilityBucket(p) === visibilityFilter);
    }
    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      rows = rows.filter((p) => (p.name ?? '').toLowerCase().includes(needle));
    }
    if (sortKey === 'name' && sortDirection) {
      rows = [...rows].sort((a, b) => {
        const cmp = String(a.name ?? '').localeCompare(String(b.name ?? ''));
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [pages, visibilityFilter, search, sortKey, sortDirection]);

  const pagedPages = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredPages.slice(start, start + perPage);
  }, [filteredPages, page, perPage]);

  // There's no real backend here to fail against — the same "type a magic
  // word to force the failure path" convention GenerateTextModal uses lets
  // the partial-success state actually be exercised (a page named e.g.
  // "Contact (fail test)") instead of leaving it entirely unbuilt.
  const partitionByFailureFlag = (ids) => {
    const ok = [];
    const failed = [];
    ids.forEach((id) => {
      const p = pages.find((pg) => pg.id === id);
      (p?.name?.toLowerCase().includes('fail') ? failed : ok).push(id);
    });
    return { ok, failed };
  };

  // Layers the "Simulate bulk delete/visibility" selector on top of the
  // real name-based convention above: 'total' fails every selected row no
  // matter what; 'partial' guarantees a split even if none of the selected
  // rows happen to be named with the "fail" marker (falls back to failing
  // just the first row so the partial-failure state is always reachable
  // with two or more rows selected, rather than only when you remember to
  // rename one first).
  const partitionForBulkAction = (ids, simulateMode) => {
    if (simulateMode === 'total') return { ok: [], failed: ids };
    if (simulateMode === 'partial') {
      const byName = partitionByFailureFlag(ids);
      if (byName.ok.length > 0 && byName.failed.length > 0) return byName;
      if (ids.length < 2) return { ok: [], failed: ids };
      return { ok: ids.slice(1), failed: [ids[0]] };
    }
    return partitionByFailureFlag(ids);
  };

  const handleBulkVisibility = (visibility, visibleFrom = null) => {
    const { ok, failed } = partitionForBulkAction(selectedIds, simulateBulkVisibility);
    if (ok.length > 0) {
      const next = runDraftAction(STORE_ID, { type: ACTIONS.BULK_UPDATE_PAGE_VISIBILITY, pageIds: ok, visibility, visibleFrom });
      setDraft(next);
    }
    setSelectedIds([]);

    if (failed.length === 0) {
      showSnackbar(
        t('sectionBuilder:onlineStore.pages.bulkVisibilitySuccess', 'Visibility for {{count}} pages successfully updated', {
          count: ok.length,
        }),
        'green'
      );
    } else if (ok.length === 0) {
      showSnackbar(t('sectionBuilder:onlineStore.pages.bulkVisibilityFailed', 'Failed to update page visibility'), 'red');
    } else {
      showSnackbar(
        t(
          'sectionBuilder:onlineStore.pages.bulkVisibilityPartialSuccess',
          'Visibility updated for {{successCount}} of {{totalCount}} pages. Please try again for the rest',
          { successCount: ok.length, totalCount: selectedIds.length }
        ),
        'grey'
      );
    }
  };

  const handleOpenScheduleModal = () => {
    setScheduleValue(null);
    setScheduleError(null);
    setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (!scheduleValue) {
      setScheduleError(t('sectionBuilder:onlineStore.pages.scheduleRequired', 'Select a publish date and time.'));
      return;
    }
    const timestamp = scheduleValue.getTime();
    if (Number.isNaN(timestamp) || timestamp <= Date.now()) {
      setScheduleError(t('sectionBuilder:onlineStore.pages.scheduleMustBeFuture', 'Choose a date and time in the future.'));
      return;
    }
    handleBulkVisibility('visible', timestamp);
    setScheduleModalOpen(false);
  };

  const handleBulkDeleteConfirm = () => {
    const { ok, failed } = partitionForBulkAction(selectedIds, simulateBulkDelete);
    if (ok.length > 0) {
      const next = runDraftAction(STORE_ID, { type: ACTIONS.BULK_DELETE_PAGES, pageIds: ok });
      setDraft(next);
    }
    setSelectedIds([]);
    setConfirmBulkDelete(false);

    if (failed.length === 0) {
      showSnackbar(
        t('sectionBuilder:onlineStore.pages.bulkDeleteSuccess', '{{count}} pages successfully deleted', { count: ok.length }),
        'green'
      );
    } else if (ok.length === 0) {
      showSnackbar(t('sectionBuilder:onlineStore.pages.bulkDeleteFailed', 'Failed to delete pages'), 'red');
    } else {
      showSnackbar(
        t(
          'sectionBuilder:onlineStore.pages.bulkDeletePartialSuccess',
          '{{successCount}} of {{totalCount}} pages deleted. Some pages couldn’t be deleted. Please try again',
          { successCount: ok.length, totalCount: selectedIds.length }
        ),
        'grey'
      );
    }
  };

  const columns = [
    {
      key: 'name',
      header: t('sectionBuilder:onlineStore.pages.columnTitle', 'Title'),
      sortable: true,
      render: (value) => <span style={{ fontWeight: 700, color: '#282828' }}>{value}</span>,
    },
    {
      key: 'visibility',
      header: t('sectionBuilder:onlineStore.pages.columnVisibility', 'Visibility'),
      render: (_value, row) => visibilityBadge(row, t),
    },
    {
      key: 'url',
      header: t('sectionBuilder:onlineStore.pages.columnUrl', 'URL'),
      render: (_value, row) => {
        const fullUrl = row.slug ? pageUrlFor(row, storeDomain) : null;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span
              title={fullUrl ?? undefined}
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: '#6B7280' }}
            >
              {/* Displayed without the protocol (matches Shopify's own
                  "storename.myshopify.com/handle" convention) — the copy
                  button still copies the full https:// URL. */}
              {fullUrl ? fullUrl.replace(/^https:\/\//, '') : '—'}
            </span>
            {fullUrl && <CopyUrlButton url={fullUrl} size={14} />}
          </div>
        );
      },
    },
    {
      key: 'sections',
      header: t('sectionBuilder:onlineStore.pages.columnContent', 'Content'),
      width: '50%',
      render: (_value, row) => (
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
          {contentPreview(row)}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: t('sectionBuilder:onlineStore.pages.columnUpdated', 'Updated'),
      width: 128,
      render: (value) => (value ? formatRelativeTime(value) : '—'),
    },
  ];

  // Both forced via the simulate panel below — there's no real list request
  // to fail (or route) against here (the draft is read synchronously from
  // local storage). Each takes over the whole screen (no "Pages"/"Add page"
  // header above it), same as PageEditor's own load-error/not-found states.
  // Checked in this order so the two toggles don't fight when both are on.
  const simulateOptions = [
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.pages.simulateLoadError', 'Simulate load error'),
      checked: simulateLoadError,
      onChange: setSimulateLoadError,
    },
    {
      type: 'checkbox',
      label: t('sectionBuilder:onlineStore.pages.simulateNotFound', 'Simulate page not found'),
      checked: simulateNotFound,
      onChange: setSimulateNotFound,
    },
    {
      type: 'select',
      label: t('sectionBuilder:onlineStore.pages.simulateBulkDelete', 'Bulk delete'),
      value: simulateBulkDelete,
      onChange: setSimulateBulkDelete,
      choices: [
        { value: 'none', label: t('sectionBuilder:onlineStore.pages.simulateNone', 'None') },
        { value: 'partial', label: t('sectionBuilder:onlineStore.pages.simulatePartialFailure', 'Partial failure') },
        { value: 'total', label: t('sectionBuilder:onlineStore.pages.simulateTotalFailure', 'Total failure') },
      ],
    },
    {
      type: 'select',
      label: t('sectionBuilder:onlineStore.pages.simulateBulkVisibility', 'Change visibility'),
      value: simulateBulkVisibility,
      onChange: setSimulateBulkVisibility,
      choices: [
        { value: 'none', label: t('sectionBuilder:onlineStore.pages.simulateNone', 'None') },
        { value: 'partial', label: t('sectionBuilder:onlineStore.pages.simulatePartialFailure', 'Partial failure') },
        { value: 'total', label: t('sectionBuilder:onlineStore.pages.simulateTotalFailure', 'Total failure') },
      ],
    },
  ];

  if (simulateNotFound) {
    return (
      <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
        <div className="flex h-full min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-1 text-xl font-bold text-gray-800">
            {t('sectionBuilder:onlineStore.pageEditor.notFoundTitle', 'Page not found')}
          </h1>
          <p className="mb-4 text-sm text-gray-500">
            {t('sectionBuilder:onlineStore.pageEditor.notFoundDescription', 'This page may have been deleted or is no longer available.')}
          </p>
          <MainBtn
            variant="secondary"
            size="sm"
            label={t('sectionBuilder:onlineStore.pageEditor.notFoundGoToList', 'Go to Page List')}
            onClick={() => setSimulateNotFound(false)}
          />
        </div>
        <SimulateTrigger options={simulateOptions} />
      </div>
    );
  }

  if (simulateLoadError) {
    return (
      <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
        <div className="flex h-full min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-1 text-xl font-bold text-gray-800">
            {t('sectionBuilder:onlineStore.pageEditor.loadErrorTitle', 'Couldn’t load this page')}
          </h1>
          <p className="mb-4 text-sm text-gray-500">
            {t('sectionBuilder:onlineStore.pageEditor.loadErrorDescription', 'Something went wrong while loading the page. Please try again.')}
          </p>
          <MainBtn
            variant="secondary"
            size="sm"
            label={t('sectionBuilder:onlineStore.pageEditor.loadErrorReload', 'Reload Page')}
            onClick={handleReloadPages}
          />
        </div>
        <SimulateTrigger options={simulateOptions} />
      </div>
    );
  }

  return (
    <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828' }}>
            {t('sectionBuilder:editor.pagesPanel.heading')}
          </h1>
          <MainBtn
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            label={t('sectionBuilder:onlineStore.pages.addPage', 'New Page')}
            onClick={() => navigate('/online-store/pages/new')}
          />
        </div>

        <div className="pages-table-wrapper" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', position: 'relative' }}>
          <Table
            columns={columns}
            data={pagedPages}
            onRowClick={(row) => navigate(`/online-store/pages/${row.id}`)}
            totalRows={filteredPages.length}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={(key, direction) => {
              setSortKey(key);
              setSortDirection(direction);
            }}
            hidePaginationOnSinglePage
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            toolbar={
              selectedIds.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#282828' }}>
                    {t('sectionBuilder:onlineStore.pages.bulkSelectedCount', '{{count}} selected', { count: selectedIds.length })}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MainBtn
                      variant="secondary"
                      size="sm"
                      label={t('sectionBuilder:onlineStore.pages.setVisible', 'Set as visible')}
                      onClick={() => handleBulkVisibility('visible')}
                    />
                    <MainBtn
                      variant="secondary"
                      size="sm"
                      label={t('sectionBuilder:onlineStore.pages.setHidden', 'Set as hidden')}
                      onClick={() => handleBulkVisibility('hidden')}
                    />
                    <MainBtn
                      variant="secondary"
                      size="sm"
                      label={t('sectionBuilder:onlineStore.pages.setSchedule', 'Set schedule visibility')}
                      onClick={handleOpenScheduleModal}
                    />
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setBulkMenuOpen((o) => !o)}
                        aria-label={t('sectionBuilder:onlineStore.pages.bulkMoreActions', 'More actions')}
                        style={{
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          border: '1px solid #E5E7EB',
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {bulkMenuOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 'calc(100% + 4px)',
                            zIndex: 30,
                            background: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: 8,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            minWidth: 160,
                            padding: '4px 0',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setBulkMenuOpen(false);
                              setConfirmBulkDelete(true);
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 12px',
                              fontSize: 13,
                              color: '#DA1E28',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            <Trash2 size={14} />
                            {t('sectionBuilder:onlineStore.pages.deletePages', 'Delete pages')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : undefined
            }
            filters={{
              search: {
                value: search,
                onChange: (value) => {
                  setSearch(value);
                  setPage(1);
                },
                placeholder: t('sectionBuilder:onlineStore.pages.searchPlaceholder', 'Search by page title'),
              },
              singleSelect: {
                label: t('sectionBuilder:onlineStore.pages.filterVisibility', 'Visibility'),
                options: [
                  { value: 'visible', label: t('sectionBuilder:onlineStore.pages.visible', 'Visible') },
                  { value: 'hidden', label: t('sectionBuilder:onlineStore.pages.hidden', 'Hidden') },
                  { value: 'scheduled', label: t('sectionBuilder:onlineStore.pages.scheduled', 'Scheduled') },
                ],
                value: visibilityFilter === 'all' ? undefined : visibilityFilter,
                onChange: (value) => {
                  setVisibilityFilter(value ?? 'all');
                  setPage(1);
                },
                allValue: 'all',
              },
              rowsPerPage: {
                onChange: (nextPerPage) => {
                  setPerPage(nextPerPage);
                  setPage(1);
                },
              },
            }}
            emptyStateTitle={t('sectionBuilder:onlineStore.pages.noPages', 'No pages yet')}
          />
        </div>
      </div>

      <SimulateTrigger options={simulateOptions} />
      {/*
        Table (ce-ui) already sets `hover:bg-lb-brand-light` + `cursor-pointer`
        on each <tr> when `onRowClick` is passed, but every <td> also paints
        its own opaque `bg-lb-surface`/`bg-lb-brand-light` background — which,
        being on the cell itself, fully occludes the row's hover background.
        Table exposes no `rowClassName`/`hoverable` prop to override this, so
        we target its actual rendered DOM (tbody > tr > td) from here with a
        higher-specificity scoped selector, matching this codebase's existing
        convention of inline `<style>` blocks with scoped class selectors
        (see ThemeGallery.jsx's `.template-card:hover`).
      */}
      <style>{`
        .pages-table-wrapper tbody tr:hover td {
          background-color: #F9FAFB;
        }
      `}</style>

      <ConfirmDialog
        open={confirmBulkDelete}
        danger
        title={t('sectionBuilder:onlineStore.pages.bulkDeleteConfirmTitle', 'Delete {{count}} pages?', { count: selectedIds.length })}
        description={t('sectionBuilder:onlineStore.pages.bulkDeleteConfirmDescription', 'This can’t be undone.')}
        confirmLabel={t('sectionBuilder:onlineStore.pages.deletePages', 'Delete pages')}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      <Popup
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        platform="tablet"
        align="left"
        title={t('sectionBuilder:onlineStore.pages.scheduleModalTitle', 'Set schedule visibility')}
        description={t('sectionBuilder:onlineStore.pages.scheduleModalDescription', '{{count}} pages will become visible at this date and time.', { count: selectedIds.length })}
        primaryAction={{
          label: t('sectionBuilder:onlineStore.pages.scheduleConfirm', 'Schedule'),
          onClick: handleConfirmSchedule,
        }}
        secondaryAction={{
          label: t('sectionBuilder:editor.common.cancel', 'Cancel'),
          onClick: () => setScheduleModalOpen(false),
        }}
      >
        {/*
          DateTimeField's own popover now portals to document.body (fixed
          positioning, clamped to the viewport) instead of being absolutely
          positioned inside this component's DOM subtree — otherwise it'd
          get clipped by Popup's own `overflow-hidden` panel.
        */}
        <DateTimeField
          label={t('sectionBuilder:onlineStore.pages.scheduleDateLabel', 'Publish date and time')}
          required
          size="md"
          value={scheduleValue}
          onChange={(date) => {
            setScheduleValue(date);
            setScheduleError(null);
          }}
          minDate={new Date()}
          errorText={scheduleError}
        />
      </Popup>
    </div>
  );
}
