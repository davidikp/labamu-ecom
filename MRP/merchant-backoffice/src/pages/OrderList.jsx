import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchOrders } from '../services/orderService';
import { Table, StatusBadge, FilterPill, SearchBar } from '../ce-ui';

const DATE_PRESET_OPTIONS = [
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last14', label: 'Last 14 Days' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'today', label: 'Today' },
];

const ORDER_TYPE_OPTIONS = [
  { value: 'Delivery', label: 'Delivery' },
  { value: 'Pickup', label: 'Pick-Up' },
];

const ORDER_STATUS_OPTIONS = [
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const STATUS_BADGE = {
  'In Progress': { color: 'orange', tone: 'soft' },
  Completed: { color: 'green', tone: 'soft' },
  Cancelled: { color: 'red', tone: 'soft' },
};

function formatPrice(val) {
  if (val == null) return '-';
  return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
}

export default function OrderList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [datePreset, setDatePreset] = useState('');
  const [customDateFrom, setCustomDateFrom] = useState(null);
  const [customDateTo, setCustomDateTo] = useState(null);
  const [orderTypes, setOrderTypes] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await fetchOrders({
          page, pageSize: size, datePreset, customDateFrom, customDateTo,
          orderTypes, orderStatuses, search, sortKey, sortDir,
        });
        if (alive) { setOrders(res.data || []); setTotal(res.meta?.total || 0); }
      } catch (e) {
        if (alive) setError(e.message || t('orders:list.failedToLoad'));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [page, size, datePreset, customDateFrom, customDateTo, orderTypes, orderStatuses, search, sortKey, sortDir]);

  const columns = [
    {
      key: 'order_number',
      header: t('orders:list.columns.orderId'),
      render: (val, row) => <span style={{ color: '#006BFF', fontWeight: 500 }}>{val ?? row.order_number}</span>,
    },
    {
      key: 'date_time_value',
      header: t('orders:list.columns.dateTime'),
      sortable: true,
      render: (_val, row) => row.date_time,
    },
    { key: 'customer_name', header: t('orders:list.columns.customer') },
    {
      key: 'item_count',
      header: t('orders:list.columns.items'),
      sortable: true,
      render: val => `${val} Items`,
    },
    {
      key: 'total_transaction',
      header: t('orders:list.columns.total'),
      sortable: true,
      render: val => formatPrice(val),
    },
    {
      key: 'order_type',
      header: t('orders:list.columns.orderType'),
      render: val => (val === 'Pickup' ? 'Pick-Up' : 'Delivery'),
    },
    {
      key: 'order_status',
      header: t('orders:list.columns.orderStatus'),
      render: val => <StatusBadge label={val} {...(STATUS_BADGE[val] || {})} />,
    },
  ];

  return (
    <div style={{ background: '#F4F4F4', height: 'calc(100vh - 56px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <h1 style={{ margin: '0 0 20px', fontSize: '26px', fontWeight: 700, color: '#282828', flexShrink: 0 }}>{t('orders:list.pageTitle')}</h1>

        <div style={{ flex: 1, minHeight: 0 }}>
          {error && !isLoading ? (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '40px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444', marginBottom: '8px' }}>{t('orders:list.failedToLoad')}</p>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>{error}</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={orders}
              loading={isLoading}
              onRowClick={row => navigate(`/orders/${row.id}`)}
              totalRows={total}
              page={page}
              perPage={size}
              onPageChange={setPage}
              sortKey={sortKey}
              sortDirection={sortDir}
              onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); setPage(1); }}
              emptyStateTitle={t('orders:list.emptyTitle')}
              emptyStateDescription={t('orders:list.emptySub')}
              toolbar={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <FilterPill
                      label={t('orders:list.filters.date')}
                      options={DATE_PRESET_OPTIONS}
                      value={datePreset}
                      onChange={v => { setDatePreset(v); setCustomDateFrom(null); setCustomDateTo(null); setPage(1); }}
                      customDateEnabled
                      customDateFrom={customDateFrom}
                      customDateTo={customDateTo}
                      onCustomDateChange={(from, to) => { setCustomDateFrom(from); setCustomDateTo(to); setPage(1); }}
                      searchable={false}
                    />
                    <FilterPill
                      label={t('orders:list.filters.orderType')}
                      options={ORDER_TYPE_OPTIONS}
                      multiple
                      values={orderTypes}
                      onChangeMultiple={v => { setOrderTypes(v); setPage(1); }}
                      searchable={false}
                    />
                    <FilterPill
                      label={t('orders:list.filters.orderStatus')}
                      options={ORDER_STATUS_OPTIONS}
                      multiple
                      values={orderStatuses}
                      onChangeMultiple={v => { setOrderStatuses(v); setPage(1); }}
                      searchable={false}
                    />
                  </div>
                  <SearchBar
                    className="w-full min-w-0 sm:w-72 sm:max-w-sm sm:shrink-0"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder={t('orders:list.searchPlaceholder')}
                  />
                </div>
              }
              filters={{
                rowsPerPage: {
                  onChange: n => { setSize(n); setPage(1); },
                  options: [10, 25, 50],
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
