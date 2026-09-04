"use client"

import * as React from "react"
import { CloudUpload } from "lucide-react"
import { cn, toTestId } from "../lib/utils"
import { useLocale } from "../locale"
import { getFileTypeIcon } from "../icons/file-type-icons"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UploadedDocument {
  id: string
  /** Present for locally picked files; absent for API-sourced documents */
  file?: File
  /** Display name — required. For local files derive it from file.name; for API files set it from the response */
  name: string
  /** Download / preview URL — present for documents that come from an API response */
  url?: string
  description: string
}

export interface DocumentUploadFieldProps {
  files: UploadedDocument[]
  /** Max number of files. Default: 10 */
  maxFiles?: number
  /** Max file size in MB per file. Default: 30 */
  maxSizeMB?: number
  /** Accepted MIME types / extensions. Default: "*" */
  accept?: string
  /** Max characters for description. Default: 40 */
  descriptionMaxLength?: number
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
  onDescriptionChange: (id: string, description: string) => void
  label?: string
  required?: boolean
  className?: string
  testId?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getExt(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "file"
}

function FileTypeIcon({ filename }: { filename: string }) {
  const Icon = getFileTypeIcon(filename)
  const ext = getExt(filename)

  if (Icon) {
    return (
      <div className="w-10 h-12 flex items-center justify-center shrink-0">
        <Icon width={40} height={48} />
      </div>
    )
  }

  return (
    <div className="w-10 h-12 rounded-lb-sm flex items-end justify-center pb-1 shrink-0 bg-lb-on-surface-3 text-white">
      <span className="text-[9px] font-lb font-lb-bold uppercase leading-none">
        {ext.length > 4 ? ext.slice(0, 4) : ext}
      </span>
    </div>
  )
}

// ── DocumentUploadField ───────────────────────────────────────────────────────

export const DocumentUploadField: React.FC<DocumentUploadFieldProps> = ({
  files,
  maxFiles = 10,
  maxSizeMB = 30,
  accept = "*",
  descriptionMaxLength = 40,
  onAdd,
  onRemove,
  onDescriptionChange,
  label,
  required,
  className,
  testId,
}) => {
  const locale = useLocale()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const canAdd = files.length < maxFiles

  const processFiles = (incoming: FileList | null) => {
    if (!incoming || !canAdd) return
    const allowed = maxFiles - files.length
    const picked = Array.from(incoming).slice(0, allowed)
    onAdd(picked)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      data-testid={toTestId(testId, "document_upload_field")}
    >
      {label && (
        <div className="flex items-center gap-0.5">
          {required && (
            <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>
          )}
          <span className="font-lb text-[12px] text-lb-on-surface leading-[18px] tracking-[0.0825px]">
            {label}
          </span>
        </div>
      )}

      {/* Drop zone */}
      {canAdd && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload files"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={cn(
            "w-full rounded-lb-card border-2 border-dashed cursor-pointer",
            "flex flex-col items-center justify-center gap-2 py-8 px-6",
            "transition-colors duration-150",
            isDragging
              ? "border-lb-brand bg-lb-brand-light"
              : "border-lb-brand bg-lb-surface hover:bg-lb-brand-light"
          )}
        >
          <CloudUpload
            size={36}
            className={cn(
              "transition-colors",
              isDragging ? "text-lb-brand" : "text-lb-brand"
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="flex flex-col items-center gap-0.5 text-center">
            <span className="font-lb text-[13px] text-lb-on-surface-3 leading-[18px]">
              Max {maxFiles} files, {maxSizeMB}MB each
            </span>
            <span className="font-lb text-[13px] text-lb-on-surface-3 leading-[18px]">
              Accepts any file type
            </span>
            <span className="font-lb text-[14px] text-lb-on-surface font-lb-semibold leading-[20px]">
              Drag file or{" "}
              <span className="text-lb-brand underline-offset-2 hover:underline">
                browse file
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-3">
          {files.map((doc) => (
            <FileItem
              key={doc.id}
              doc={doc}
              descriptionMaxLength={descriptionMaxLength}
              onRemove={onRemove}
              onDescriptionChange={onDescriptionChange}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── FileItem ──────────────────────────────────────────────────────────────────

interface FileItemProps {
  doc: UploadedDocument
  descriptionMaxLength: number
  onRemove: (id: string) => void
  onDescriptionChange: (id: string, description: string) => void
  locale: ReturnType<typeof useLocale>
}

const FileItem: React.FC<FileItemProps> = ({
  doc,
  descriptionMaxLength,
  onRemove,
  onDescriptionChange,
}) => {
  const charCount = doc.description.length
  const isOver = charCount > descriptionMaxLength

  return (
    <div className="w-full rounded-lb-card border border-lb-line-1 bg-lb-surface p-4 flex flex-col gap-3">
      {/* File row */}
      <div className="flex items-center gap-3">
        <FileTypeIcon filename={doc.name} />

        {doc.url ? (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 font-lb text-[14px] text-lb-brand leading-[20px] truncate hover:underline underline-offset-2"
          >
            {doc.name}
          </a>
        ) : (
          <span className="flex-1 font-lb text-[14px] text-lb-on-surface leading-[20px] truncate">
            {doc.name}
          </span>
        )}

        <button
          type="button"
          onClick={() => onRemove(doc.id)}
          className={cn(
            "shrink-0 h-9 px-4 rounded-lb-sm",
            "border border-lb-red text-lb-red",
            "font-lb text-[14px] leading-[20px]",
            "hover:bg-lb-red hover:text-lb-surface transition-colors duration-150",
          )}
        >
          Remove
        </button>
      </div>

      {/* Description field */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <span className="font-lb text-[14px] font-lb-bold text-lb-red">*</span>
            <span className="font-lb text-[12px] text-lb-on-surface leading-[18px] tracking-[0.0825px]">
              File Description
            </span>
          </div>
          <span
            className={cn(
              "font-lb text-[12px] leading-[18px]",
              isOver ? "text-lb-red" : "text-lb-on-surface-3"
            )}
          >
            {charCount}/{descriptionMaxLength}
          </span>
        </div>

        <input
          type="text"
          value={doc.description}
          maxLength={descriptionMaxLength + 20}
          placeholder="Enter File Description"
          onChange={(e) => onDescriptionChange(doc.id, e.target.value)}
          className={cn(
            "w-full h-12 px-4 font-lb rounded-lb-input border",
            "text-[16px] leading-[22px] tracking-[0.11px]",
            "placeholder:text-lb-on-surface-3 text-lb-on-surface",
            "transition-all duration-200 outline-none bg-lb-surface",
            isOver
              ? "border-lb-red hover:border-lb-red focus:border-lb-red focus:shadow-[0_0_0_3px_theme(colors.lb-red-bg)]"
              : "border-lb-line-1 hover:border-lb-line-2 focus:border-lb-brand focus:shadow-[0_0_0_3px_theme(colors.lb-brand-light)]"
          )}
        />
      </div>
    </div>
  )
}

export default DocumentUploadField
