"use client"

import * as React from "react"
import { cn, toTestId } from "../lib/utils"
import Breadcrumbs, { type BreadcrumbItem } from "./breadcrumbs"
import { MainBtn } from "./main-btn"
import { Chip } from "./chip"
import { Card } from "./card"
import { ImageCarousel, type CarouselImage } from "./image-carousel"
import { Toggle } from "./toggle"
import { Table, type TableColumn, type TableFiltersConfig, type SortDirection } from "./table"

// ── Action types ──────────────────────────────────────────────────────────────

export interface DetailProductAction {
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg" | "xl"
  disabled?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// ── Product info ──────────────────────────────────────────────────────────────

export interface ProductModifierBox {
  title: string
  content?: React.ReactNode
  emptyText?: string
}

export interface DetailProductInfo {
  /** At least one image, max five. */
  images: CarouselImage[]
  /** Category label rendered as a chip above the product name. */
  category?: string
  name: string
  /** Supports React nodes for inline bold/styled text. */
  description?: React.ReactNode
  /** Formatted price range string, e.g. "IDR 30.000 - 60.000". */
  priceRange?: string
  /** Unit label rendered next to the price range, e.g. "/Pcs". */
  priceUnit?: string
  /** Catalog cost label, e.g. "Catalog Cost: IDR 25.000". */
  catalogCost?: string
  modifiers?: ProductModifierBox[]
}

// ── Toggle panel items ────────────────────────────────────────────────────────

export interface DetailProductToggleItem {
  title: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

// ── Section types ─────────────────────────────────────────────────────────────

export interface DetailProductField {
  title: string
  value: React.ReactNode
}

interface DetailProductBaseSection {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Optional node rendered to the left of the action button (e.g. StatusBadge). */
  status?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
    variant?: "primary" | "secondary"
    size?: "sm" | "md" | "lg" | "xl"
    disabled?: boolean
    loading?: boolean
    leftIcon?: React.ReactNode
  }
}

export interface DetailProductInfoSection extends DetailProductBaseSection {
  type: "info"
  fields: DetailProductField[]
  /** Number of columns in the fields grid. Defaults to 4. */
  gridColumns?: 2 | 3 | 4
}

export interface DetailProductTableSection extends DetailProductBaseSection {
  type: "table"
  tableColumns: TableColumn<any>[]
  tableData: { id: string | number; [key: string]: any }[]
  loading?: boolean
  totalRows?: number
  page?: number
  perPage?: number
  onPageChange?: (page: number) => void
  filters?: TableFiltersConfig
  onRowClick?: (row: any) => void
  selectedRowId?: string | number | null
  selectable?: boolean
  selectedIds?: (string | number)[]
  onSelectionChange?: (ids: (string | number)[]) => void
  sortKey?: string | number | null
  sortDirection?: SortDirection
  onSortChange?: (key: any, direction: SortDirection) => void
  footerStart?: React.ReactNode
  footerTotal?: React.ReactNode
  emptyStateTitle?: string
  emptyStateDescription?: string
  emptyStateAction?: React.ReactNode
  tableClassName?: string
}

export type DetailProductSection = DetailProductInfoSection | DetailProductTableSection

// ── Screen props ──────────────────────────────────────────────────────────────

export interface DetailProductScreenProps {
  // ── Header ──────────────────────────────────────────────────────────────────
  title: string
  breadcrumbs: BreadcrumbItem[]
  titleOnBreadcrumb?: string
  onBack?: () => void
  showBackButton?: boolean
  /** Page-level action buttons. Last item defaults to "primary", rest to "secondary". */
  actions?: DetailProductAction[]

  // ── Product card ─────────────────────────────────────────────────────────────
  product: DetailProductInfo

  // ── Bottom sections ──────────────────────────────────────────────────────────
  sections?: DetailProductSection[]

  // ── Right toggle panel ────────────────────────────────────────────────────────
  toggleItems?: DetailProductToggleItem[]

  // ── Layout ──────────────────────────────────────────────────────────────────
  className?: string
  contentClassName?: string
  testId?: string
}

// ── Internal: grid columns map ────────────────────────────────────────────────

const GRID_COLS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
}

// ── Internal: info section body ───────────────────────────────────────────────

function InfoSectionBody({ section }: { section: DetailProductInfoSection }) {
  return (
    <div className={cn("grid gap-x-6 gap-y-5 px-4 pb-5", GRID_COLS[section.gridColumns ?? 4])}>
      {section.fields.map((field, i) => (
        <div key={i} className="flex flex-col gap-0.5 min-w-0">
          <span className="font-lb text-[12px] text-lb-on-surface-3 leading-[18px]">
            {field.title}
          </span>
          <div className="font-lb text-[14px] font-lb-bold text-lb-on-surface leading-[20px] break-words">
            {field.value}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Internal: table section body ──────────────────────────────────────────────

function TableSectionBody({ section }: { section: DetailProductTableSection }) {
  return (
    <Table
      className={section.tableClassName}
      columns={section.tableColumns}
      data={section.tableData}
      loading={section.loading}
      totalRows={section.totalRows ?? section.tableData.length}
      page={section.page}
      perPage={section.perPage}
      onPageChange={section.onPageChange}
      filters={section.filters}
      onRowClick={section.onRowClick}
      selectedRowId={section.selectedRowId}
      selectable={section.selectable}
      selectedIds={section.selectedIds}
      onSelectionChange={section.onSelectionChange}
      sortKey={section.sortKey as any}
      sortDirection={section.sortDirection}
      onSortChange={section.onSortChange}
      footerStart={section.footerStart}
      footerTotal={section.footerTotal}
      emptyStateTitle={section.emptyStateTitle}
      emptyStateDescription={section.emptyStateDescription}
      emptyStateAction={section.emptyStateAction}
    />
  )
}

// ── Internal: section card ────────────────────────────────────────────────────

function SectionCard({ section }: { section: DetailProductSection }) {
  const sectionActions =
    section.status || section.action ? (
      <>
        {section.status}
        {section.action && (
          <MainBtn
            variant={section.action.variant ?? "primary"}
            size={section.action.size ?? "sm"}
            label={section.action.label}
            leftIcon={section.action.leftIcon}
            disabled={section.action.disabled}
            loading={section.action.loading}
            onClick={section.action.onClick}
          />
        )}
      </>
    ) : undefined

  return (
    <Card
      title={section.title}
      description={section.description}
      actions={sectionActions}
      showAccent={false}
    >
      {section.type === "info" && <InfoSectionBody section={section} />}
      {section.type === "table" && <TableSectionBody section={section} />}
    </Card>
  )
}

// ── Internal: product card ────────────────────────────────────────────────────

function ProductCard({ product }: { product: DetailProductInfo }) {
  const images = product.images as [CarouselImage, ...CarouselImage[]] & {
    length: 1 | 2 | 3 | 4 | 5
  }

  return (
    <Card showAccent={false}>
      <div className="flex gap-6 p-4">
        {/* Image carousel */}
        <div className="w-[260px] shrink-0">
          <ImageCarousel images={images} />
        </div>

        {/* Product details */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {product.category && (
            <div>
              <Chip label={product.category} />
            </div>
          )}

          <h2 className="text-[24px] font-bold text-lb-on-surface leading-[32px]">
            {product.name}
          </h2>

          {product.description && (
            <p className="text-[14px] text-lb-on-surface-2 leading-[22px]">
              {product.description}
            </p>
          )}

          {product.priceRange && (
            <div className="flex flex-col gap-0.5">
              <p className="text-[18px] font-bold text-lb-on-surface leading-[26px]">
                {product.priceRange}
                {product.priceUnit && (
                  <span className="text-[14px] font-normal text-lb-on-surface-3 ml-1">
                    {product.priceUnit}
                  </span>
                )}
              </p>
              {product.catalogCost && (
                <p className="text-[14px] text-lb-on-surface-3">{product.catalogCost}</p>
              )}
            </div>
          )}

          {product.modifiers?.map((modifier, i) => (
            <div key={i} className="border border-lb-line-1 rounded-lb-card p-4">
              <p className="text-[14px] font-bold text-lb-on-surface mb-2">{modifier.title}</p>
              {modifier.content ?? (
                <p className="text-[14px] text-lb-on-surface-3">
                  {modifier.emptyText ?? "No content"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ── Internal: toggle panel ────────────────────────────────────────────────────

function TogglePanel({ items }: { items: DetailProductToggleItem[] }) {
  return (
    <Card showAccent={false}>
      <div className="flex flex-col divide-y divide-lb-line-1 px-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-lb-on-surface leading-[20px]">
                {item.title}
              </p>
              {item.description && (
                <p className="text-[12px] text-lb-on-surface-3 leading-[18px] mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
            <Toggle
              checked={item.checked}
              onChange={item.onChange}
              disabled={item.disabled}
            />
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── DetailProductScreen ───────────────────────────────────────────────────────

export const DetailProductScreen: React.FC<DetailProductScreenProps> = ({
  title,
  breadcrumbs,
  titleOnBreadcrumb,
  onBack,
  showBackButton = true,
  actions = [],
  product,
  sections = [],
  toggleItems = [],
  className,
  contentClassName,
  testId,
}) => {
  return (
    <div
      data-testid={toTestId(testId, "detail_product_screen")}
      className={cn("flex flex-col gap-4 h-full min-h-0", className)}
    >
      {/* ── Header ── */}
      <div className="flex-none flex items-start justify-between gap-4">
        <Breadcrumbs
          title={title}
          titleOnBreadcrumb={titleOnBreadcrumb}
          breadcrumbs={breadcrumbs}
          onBack={onBack}
          showBackButton={showBackButton}
        />
        {actions.length > 0 && (
          <div className="flex items-center gap-3 shrink-0 pt-1">
            {actions.map((action, i) => (
              <MainBtn
                key={action.label}
                variant={action.variant ?? (i === actions.length - 1 ? "primary" : "secondary")}
                size={action.size ?? "sm"}
                label={action.label}
                leftIcon={action.leftIcon}
                rightIcon={action.rightIcon}
                disabled={action.disabled}
                loading={action.loading}
                onClick={action.onClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className={cn("flex gap-4 flex-1 min-h-0 overflow-y-auto", contentClassName)}>
        {/* Left: product card + info/table sections */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <ProductCard product={product} />
          {sections.map((section, i) => (
            <SectionCard key={i} section={section} />
          ))}
        </div>

        {/* Right: toggle panel */}
        {toggleItems.length > 0 && (
          <div className="w-[320px] shrink-0">
            <TogglePanel items={toggleItems} />
          </div>
        )}
      </div>
    </div>
  )
}

export default DetailProductScreen
