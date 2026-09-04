# Bulk Upload — English vs Bahasa Indonesia

Covers the Bulk Upload flow in both **Product Catalog** and **Materials** modules: list page, wizard (Upload → Mapping → Review), confirm modals, detail modal, field labels, and status/activity-log copy.

**How to read this doc:**
- Every string currently lives in the app as plain English (no Bahasa Indonesia version exists yet for the flow's own UI) — those rows have an **empty** Bahasa Indonesia column for you to fill in.
- The **Notifications** sections at the end of each module already have a Bahasa Indonesia translation in the codebase (`src/data/notification/notificationCatalog.js`) — those rows are pre-filled with the current translation so you can review/adjust rather than start from scratch.
- `{placeholder}` markers indicate a dynamic value substituted at runtime (file name, counts, etc.) — keep the placeholder token as-is when translating.

---

# Part 1 — Product Catalog Bulk Upload

## 1. Bulk Upload List page

`src/modules/product-catalog/pages/BulkUploadListPage.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Page title | Bulk Upload | Unggah Massal |
| Breadcrumb | Product Catalog | Katalog Produk |
| Breadcrumb | Bulk Upload | Unggah Massal |
| Button | New Upload | Unggah Baru |
| Filter label | Status | Status |
| Status option | Mapping | Pemetaan |
| Status option | Normalizing Data | Normalisasi Data |
| Status option | Review | Peninjauan |
| Status option | Processing | Diproses |
| Status option | Completed | Selesai |
| Status option | Cancelled | Dibatalkan |
| Search placeholder | Search by File Name or Upload ID | Cari berdasarkan Nama File atau ID Unggah |
| Column header | File Name | Nama File |
| Column header | Upload ID | ID Unggah |
| Column header | Created At | Dibuat Pada |
| Column header | Created By | Dibuat Oleh |
| Column header | Total Data | Total Data |
| Column header | Status | Status |
| Empty state title | No uploads found | Unggahan tidak ditemukan |
| Empty state description | Try adjusting your filters or search keywords. | Coba sesuaikan filter atau kata kunci pencarian Anda. |

## 2. Add New Upload — wizard chrome

`src/modules/product-catalog/pages/BulkUploadNewPage.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Page title | Add New Upload | Tambah Unggahan Baru |
| Breadcrumb | Product Catalog | Katalog Produk |
| Breadcrumb | Bulk Upload | Unggah Massal |
| Breadcrumb | Add New Upload | Tambah Unggahan Baru |
| Stepper step | Upload | Unggah |
| Stepper step | Mapping | Pemetaan |
| Stepper step | Review | Peninjauan |
| Footer button | Analyze File | Analisis File |
| Footer button (loading) | Analyzing... | Menganalisis... |
| Footer button | Cancel | Batal |
| Footer button | Normalize and Review | Normalisasi dan Tinjau |
| Footer button | Save as Draft | Simpan sebagai Draf |
| Footer button | Import Data | Impor Data |
| Toast | Field cannot be empty | Kolom tidak boleh kosong |
| Toast | No data found in this file | Tidak ada data dalam file ini |
| Toast | Failed to analyze file | Gagal menganalisis file |
| Toast | Upload cancelled | Unggahan dibatalkan |
| Toast | Upload saved as draft | Unggahan disimpan sebagai draf |
| Background screen title | Your file is being normalized | File Anda sedang dinormalisasi |
| Background screen message | We're also validating your data to prepare it for review. You can leave this page and we'll notify you by email when it's ready. | Kami juga memvalidasi data Anda agar siap ditinjau. Anda dapat meninggalkan halaman ini dan kami akan mengirimkan email saat data siap. |
| Background screen button | Back to Bulk Upload | Kembali ke Unggah Massal |
| Background screen secondary action | Skip Process | Lewati Proses |
| Background screen title | Your products are being imported | Produk Anda sedang diimpor |
| Background screen message | We're adding the reviewed data from "{fileName}" to your product catalog. You can leave this page and we'll notify you by email when it's ready. | Kami sedang menambahkan data yang telah ditinjau dari "{fileName}" ke katalog produk Anda. Anda dapat meninggalkan halaman ini dan kami akan mengirimkan email setelah proses selesai. |

## 3. Upload step

`src/modules/product-catalog/components/upload-steps/UploadStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Section title | Import Products | Impor Produk |
| Section description | Upload your product file in any spreadsheet format. We'll map and prepare the data for your product catalog. | Upload file produk dalam format spreadsheet. Kami akan memetakan dan menyiapkan data untuk katalog produk Anda. |
| Button | Download Template | Unduh Template |
| Upload field hint | Allowed formats (.csv, .xlsx, .xls) | Format yang didukung (.csv, .xlsx, .xls) |
| Loading title | Analyzing your file... | Menganalisis file Anda... |
| Loading description | We're reading your file and getting it ready for column mapping. This usually takes a few seconds. | Kami sedang membaca file Anda dan menyiapkannya untuk pemetaan kolom. Proses ini biasanya membutuhkan beberapa detik. |
| Demo panel label | Demo: simulate a failure | Demo: simulasikan kegagalan |
| Demo button | Simulate Timeout | Simulasikan Timeout |
| Demo button | Simulate Empty File | Simulasikan File Kosong |
| Auto-generated header | Untitled Column | Kolom Tanpa Nama |
| Auto-generated header (duplicate) | Untitled Column (1) | Kolom Tanpa Nama (1) |

## 4. Mapping step

`src/modules/product-catalog/components/upload-steps/MappingStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Info banner | Check that each product field matches the correct column from your file. Once everything looks right, continue to normalize and review your data. | Pastikan setiap kolom produk sesuai dengan kolom yang benar dari file Anda. Setelah semuanya sesuai, lanjutkan untuk menormalisasi dan meninjau data. |
| Column header | Product Field | Kolom Produk |
| Column header | Source Column | Kolom Sumber |
| Column header | Example Value | Contoh Nilai |
| Column header | AI Recommendation | Rekomendasi AI |
| Required badge | Required | Wajib |
| Dropdown placeholder / option | — Not mapped — | — Belum dipetakan — |
| Validation error | Field cannot be empty | Kolom tidak boleh kosong |
| Recommendation text | No match found | Tidak ada kecocokan |
| Recommendation text | Matched to "{sourceColumn}" | Cocok dengan "{sourceColumn}" |

## 5. Review step

`src/modules/product-catalog/components/upload-steps/ReviewStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Checkbox label | Show only products that need attention {(count)} | Tampilkan hanya produk yang perlu perhatian lebih {(count)} |
| Search placeholder | Search by SKU, Name, or Category | Cari berdasarkan SKU, Nama, atau Kategori |
| Button | New Row | Baris Baru |
| Normalization badge | {n} of {total} rows normalized by AI {(x skipped)} | {n} dari {total} baris dinormalisasi oleh AI {(x dilewati)} |
| Selection bar | {n} Selected | {n} Dipilih |
| Button | Delete | Hapus |
| Empty state title | No rows found | Baris tidak ditemukan |
| Empty state description | Try adjusting your search or the needs-attention filter. | Coba sesuaikan pencarian atau filter data yang perlu diperiksa. |
| Status dropdown placeholder | Select status | Pilih status |
| Status option | Active | Aktif |
| Status option | Inactive | Tidak Aktif |
| Lead Time unit placeholder | Select unit | Pilih satuan |
| Lead Time unit option | Day(s) | Hari |
| Lead Time unit option | Week(s) | Minggu |
| Lead Time unit option | Month(s) | Bulan |
| Field error | Field cannot be empty | Kolom tidak boleh kosong |
| Field error | Max. 100 characters. Extra text removed. | Maks. 100 karakter. Teks tambahan dihapus. |
| Field warning | Different currency detected. Value kept as is. | Mata uang berbeda terdeteksi. Nilai tetap digunakan. |
| Delete confirm title | Delete this row? | Hapus baris ini? |
| Delete confirm title (plural) | Delete {n} rows? | Hapus {n} baris? |
| Delete confirm description | These rows will be removed from this upload and won't be imported. | Baris ini akan dihapus dari upload dan tidak akan diimpor. |
| Delete confirm button | Cancel | Batal |
| Delete confirm button | Yes, Delete | Ya, Hapus |

## 6. Confirm modals

| Modal | Element | English | Bahasa Indonesia |
|---|---|---|---|
| Cancel Upload | Title | Cancel this upload? | Batalkan unggahan ini? |
| Cancel Upload | Description | You won't be able to continue this upload. It will remain in the Bulk Upload list with a Cancelled status. | Anda tidak dapat melanjutkan unggahan ini. Unggahan akan tetap ada di daftar Unggah Massal dengan status Dibatalkan. |
| Cancel Upload | Field label | Cancellation Reason | Alasan Pembatalan |
| Cancel Upload | Field placeholder | Add a reason for canceling this upload. | Tambahkan alasan pembatalan unggahan ini. |
| Cancel Upload | Field error | Field cannot be empty | Kolom tidak boleh kosong |
| Cancel Upload | Button | Keep Editing | Lanjutkan Mengedit |
| Cancel Upload | Button | Yes, Cancel | Ya, Batalkan |
| Discard Changes | Title | Discard changes? | Buang perubahan? |
| Discard Changes | Description | Any changes you made on this page will be lost. | Semua perubahan yang Anda buat di halaman ini akan hilang. |
| Discard Changes | Button | Keep Editing | Lanjutkan Mengedit |
| Discard Changes | Button | Yes, Discard | Ya, Buang |
| Invalid Data | Title | {n} product(s) need(s) attention | {n} produk perlu perhatian lebih |
| Invalid Data | Description | Some required information is missing. You can update these products now or continue importing the products that are ready. | Beberapa informasi wajib belum lengkap. Anda dapat memperbarui produk ini sekarang atau melanjutkan impor produk yang sudah siap. |
| Invalid Data | Button | Keep Editing | Lanjutkan Mengedit |
| Invalid Data | Button | Import Ready Products | Impor Produk yang Siap |
| Input Data (import confirm) | Title | Import {n} product(s)? | Impor {n} produk? |
| Input Data | Description | These products will be added to your product catalog. | Produk ini akan ditambahkan ke katalog produk Anda. |
| Input Data | Button | Cancel | Batal |
| Input Data | Button | Yes, Import Products | Ya, Impor Produk |
| Skip Normalization | Title | Skip normalization? | Lewati normalisasi? |
| Skip Normalization | Description | The remaining data won't be normalized by AI. Those rows will need your attention later in the Review step. | Data yang tersisa tidak akan dinormalisasi oleh AI. Baris tersebut perlu Anda periksa pada tahap Peninjauan. |
| Skip Normalization | Button | Keep Waiting | Tetap Tunggu |
| Skip Normalization | Button | Yes, Skip | Ya, Lewati |
| Use Template Suggestion | Title | Try uploading with our template | Coba unggah dengan template kami |
| Use Template Suggestion | Description | Use our template to organize your product data in a format that's easier to process. | Gunakan template kami untuk mengatur data produk dalam format yang lebih mudah diproses. |
| Use Template Suggestion | Button | Not Now | Nanti Saja |
| Use Template Suggestion | Button | Download Template | Unduh Template |
| No Data To Import | Title | No products to import | Tidak ada produk untuk diimpor |
| No Data To Import | Description | There are no products ready to import. Add or update your product data before continuing. | Belum ada produk yang siap diimpor. Tambahkan atau perbarui data produk sebelum melanjutkan. |
| No Data To Import | Button | Back to Review | Kembali ke Peninjauan |

## 7. Bulk Upload Detail modal

`src/modules/product-catalog/components/BulkUploadDetailModal.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Modal title | Bulk Upload Detail | Detail Unggahan Massal |
| Processing banner | **Import in progress:** Your products are being added to the product catalog. We'll notify you by email when it's complete. | **Proses impor sedang berlangsung:** Produk Anda sedang ditambahkan ke katalog produk. Kami akan memberi tahu Anda melalui email setelah selesai. |
| Field label | Created At | Dibuat Pada |
| Field label | Created By | Dibuat Oleh |
| Field label | Upload ID | ID Unggah |
| Field label | Total Data | Total Data |
| Field label | Imported Data | Data yang Diimpor |
| Field label | Invalid Data | Data yang Tidak Valid |
| Section title | Activity Logs | Log Aktivitas |
| Column header | Name | Nama |
| Column header | Email | Email |
| Column header | Activity | Aktivitas |
| Column header | Timestamp | Waktu |
| Empty state | No activity yet. | Belum ada aktivitas. |
| Button | Download Invalid Data | Unduh Data yang Tidak Valid |

## 8. Activity log status copy

`src/modules/product-catalog/mock/bulkUploadsStore.js`

| Log title | English description | Bahasa Indonesia |
|---|---|---|
| Upload Created | File "{fileName}" was uploaded ({n} products). | File "{fileName}" diunggah ({n} produk). |
| Normalization Started | The uploaded data is being normalized in the background. | Data yang diunggah sedang dinormalisasi di latar belakang. |
| Normalization Finished | Data is ready for review. | Data siap ditinjau. |
| Normalization Skipped | AI normalization was skipped by the user — remaining rows need attention. | Normalisasi AI dilewati oleh pengguna — baris yang tersisa perlu diperiksa. |
| Import Started | Reviewed products are being imported into the catalog. | Produk yang telah ditinjau sedang diimpor ke katalog. |
| Import Completed | Products were added to the product catalog. | Produk telah ditambahkan ke katalog produk. |
| Upload Cancelled | *(user-entered cancellation reason)* | |

## 9. Product field labels (Mapping / Review columns, CSV template)

`src/modules/product-catalog/mock/productFieldsConfig.js`

| Field key | English label | Bahasa Indonesia |
|---|---|---|
| sku | SKU | SKU |
| name | Name | Nama |
| categoryName | Category Name | Nama Kategori |
| status | Status | Status |
| leadTime | Lead Time | Waktu Tunggu |
| sellingPrice | Selling Price | Harga Jual |
| primaryMaterial | Primary Material | Material Utama |
| finishing | Finishing | Finishing |
| weightKg | Weight (Kg) | Berat (Kg) |
| finishedHeightCm | Finished Height (cm) | Tinggi Produk Jadi (cm) |
| finishedWidthCm | Finished Width (cm) | Lebar Produk Jadi (cm) |
| finishedLengthCm | Finished Length (cm) | Panjang Produk Jadi (cm) |
| packedHeightCm | Packed Height (cm) | Tinggi Kemasan (cm) |
| packedWidthCm | Packed Width (cm) | Lebar Kemasan (cm) |
| packedLengthCm | Packed Length (cm) | Panjang Kemasan (cm) |
| container20ft | Container 20ft (Qty) | Kontainer 20ft (Jml.) |
| container40ft | Container 40ft (Qty) | Kontainer 40ft (Jml.) |
| container40ftHighCube | Container 40ft High Cube (Qty) | Kontainer 40ft High Cube (Jml.) |

## 10. Notifications — `product_catalog` bulk upload

`src/data/notification/notificationCatalog.js` — already bilingual in code; shown here for reference/review.

| Trigger | Channel | English | Bahasa Indonesia (current) |
|---|---|---|---|
| bulk_upload_completed | In-app title | Bulk upload finished — {fileName} | Unggah massal selesai — {fileName} |
| bulk_upload_completed | In-app body | {fileName} finished processing — {n} product(s) added to your catalog. | {fileName} selesai diproses — {n} produk ditambahkan ke katalog Anda. |
| bulk_upload_completed | CTA | View Upload | Lihat Unggahan |
| bulk_upload_completed | Email subject | Bulk upload finished — {fileName} | Unggah massal selesai — {fileName} |
| bulk_upload_completed | Email body | Hi {requesterName}, {fileName} finished processing — {n} product(s) added to your catalog. | Halo {requesterName}, {fileName} selesai diproses — {n} produk ditambahkan ke katalog Anda. |
| bulk_upload_mapping_ready | In-app title | Mapping finished — {fileName} | Pemetaan selesai — {fileName} |
| bulk_upload_mapping_ready | In-app body | {fileName} finished mapping and is ready for review. | {fileName} selesai dipetakan dan siap untuk ditinjau. |
| bulk_upload_mapping_ready | CTA | Review | Tinjau |
| bulk_upload_mapping_ready | Email subject | Mapping finished — {fileName} | Pemetaan selesai — {fileName} |
| bulk_upload_mapping_ready | Email body | Hi {requesterName}, {fileName} finished mapping and is ready for review. | Halo {requesterName}, {fileName} selesai dipetakan dan siap untuk ditinjau. |
| bulk_upload_cancelled | In-app title | Bulk upload cancelled — {fileName} | Unggah massal dibatalkan — {fileName} |
| bulk_upload_cancelled | In-app body | {fileName} was cancelled before it finished processing. | {fileName} dibatalkan sebelum selesai diproses. |
| bulk_upload_cancelled | CTA | View Upload | Lihat Unggahan |
| bulk_upload_cancelled | Email subject | Bulk upload cancelled — {fileName} | Unggah massal dibatalkan — {fileName} |
| bulk_upload_cancelled | Email body | Hi {requesterName}, {fileName} was cancelled before it finished processing. | Halo {requesterName}, {fileName} dibatalkan sebelum selesai diproses. |

---

# Part 2 — Materials Bulk Upload

## 1. Bulk Upload List page

`src/modules/materials/pages/MaterialUploadListPage.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Page title | Bulk Upload | Unggah Massal |
| Breadcrumb | Materials | Material |
| Breadcrumb | Bulk Upload | Unggah Massal |
| Button | New Upload | Unggah Baru |
| Filter label | Status | Status |
| Status option | Mapping | Pemetaan |
| Status option | Normalizing Data | Normalisasi Data |
| Status option | Review | Peninjauan |
| Status option | Processing | Diproses |
| Status option | Completed | Selesai |
| Status option | Cancelled | Dibatalkan |
| Search placeholder | Search by File Name or Upload ID | Cari berdasarkan Nama File atau ID Unggah |
| Column header | File Name | Nama File |
| Column header | Upload ID | ID Unggah |
| Column header | Created At | Dibuat Pada |
| Column header | Created By | Dibuat Oleh |
| Column header | Total Data | Total Data |
| Column header | Status | Status |
| Empty state title | No uploads found | Unggahan tidak ditemukan |
| Empty state description | Try adjusting your filters or search keywords. | Coba sesuaikan filter atau kata kunci pencarian Anda. |

## 2. Add New Upload — wizard chrome

`src/modules/materials/pages/MaterialUploadNewPage.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Page title | Add New Upload | Tambah Unggahan Baru |
| Breadcrumb | Materials | Material |
| Breadcrumb | Bulk Upload | Unggah Massal |
| Breadcrumb | Add New Upload | Tambah Unggahan Baru |
| Stepper step | Upload | Unggah |
| Stepper step | Mapping | Pemetaan |
| Stepper step | Review | Peninjauan |
| Footer button | Analyze File | Analisis File |
| Footer button (loading) | Analyzing... | Menganalisis... |
| Footer button | Cancel | Batal |
| Footer button | Normalize and Review | Normalisasi dan Tinjau |
| Footer button | Save as Draft | Simpan sebagai Draf |
| Footer button | Import Data | Impor Data |
| Toast | Field cannot be empty | Kolom tidak boleh kosong |
| Toast | No data found in this file | Tidak ada data dalam file ini |
| Toast | Failed to analyze file | Gagal menganalisis file |
| Toast | Upload cancelled | Unggahan dibatalkan |
| Toast | Upload saved as draft | Unggahan disimpan sebagai draf |
| Background screen title | Your file is being normalized | File Anda sedang dinormalisasi |
| Background screen message | We're also validating your data to prepare it for review. You can leave this page and we'll notify you by email when it's ready. | Kami juga memvalidasi data Anda agar siap ditinjau. Anda dapat meninggalkan halaman ini dan kami akan mengirimkan email saat data siap. |
| Background screen button | Back to Bulk Upload | Kembali ke Unggah Massal |
| Background screen secondary action | Skip Process | Lewati Proses |
| Background screen title | Your materials are being imported | Material Anda sedang diimpor |
| Background screen message | We're adding the reviewed data from "{fileName}" to your material catalog. You can leave this page and we'll notify you by email when it's ready. | Kami sedang menambahkan data yang telah ditinjau dari "{fileName}" ke katalog material Anda. Anda dapat meninggalkan halaman ini dan kami akan mengirimkan email setelah proses selesai. |

## 3. Upload step

`src/modules/materials/components/upload-steps/UploadStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Section title | Import Materials | Impor Material |
| Section description | Upload your material file in any spreadsheet format. We'll map and prepare the data for your material catalog. | Upload file material dalam format spreadsheet. Kami akan memetakan dan menyiapkan data untuk katalog material Anda. |
| Button | Download Template | Unduh Template |
| Upload field hint | Allowed formats (.csv, .xlsx, .xls) | Format yang didukung (.csv, .xlsx, .xls) |
| Loading title | Analyzing your file... | Menganalisis file Anda... |
| Loading description | We're reading your file and getting it ready for column mapping. This usually takes a few seconds. | Kami sedang membaca file Anda dan menyiapkannya untuk pemetaan kolom. Proses ini biasanya membutuhkan beberapa detik. |
| Demo panel label | Demo: simulate a failure | Demo: simulasikan kegagalan |
| Demo button | Simulate Timeout | Simulasikan Timeout |
| Demo button | Simulate Empty File | Simulasikan File Kosong |
| Auto-generated header | Untitled Column | Kolom Tanpa Nama |
| Auto-generated header (duplicate) | Untitled Column (1) | Kolom Tanpa Nama (1) |

## 4. Mapping step

`src/modules/materials/components/upload-steps/MappingStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Info banner | Check that each material field matches the correct column from your file. Once everything looks right, continue to normalize and review your data. | Pastikan setiap kolom material sesuai dengan kolom yang benar dari file Anda. Setelah semuanya sesuai, lanjutkan untuk menormalisasi dan meninjau data. |
| Column header | Material Field | Kolom Material |
| Column header | Source Column | Kolom Sumber |
| Column header | Example Value | Contoh Nilai |
| Column header | AI Recommendation | Rekomendasi AI |
| Required badge | Required | Wajib |
| Dropdown placeholder / option | — Not mapped — | — Belum dipetakan — |
| Validation error | Field cannot be empty | Kolom tidak boleh kosong |
| Recommendation text | No match found | Tidak ada kecocokan |
| Recommendation text | Matched to "{sourceColumn}" | Cocok dengan "{sourceColumn}" |

## 5. Review step

`src/modules/materials/components/upload-steps/ReviewStep.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Checkbox label | Show only materials that need attention {(count)} | Tampilkan hanya material yang perlu diperiksa {(count)} |
| Search placeholder | Search by SKU, Name, or Category | Cari berdasarkan SKU, Nama, atau Kategori |
| Button | New Row | Baris Baru |
| Normalization badge | {n} of {total} rows normalized by AI {(x skipped)} | {n} dari {total} baris dinormalisasi oleh AI {(x dilewati)} |
| Selection bar | {n} Selected | {n} Dipilih |
| Button | Delete | Hapus |
| Empty state title | No rows found | Baris tidak ditemukan |
| Empty state description | Try adjusting your search or the needs-attention filter. | Coba sesuaikan pencarian atau filter data yang perlu diperiksa. |
| ABC Classification placeholder | Select classification | Pilih klasifikasi |
| Material Type placeholder | Select material type | Pilih jenis material |
| Material Type option | Raw Material | Material Belum Jadi |
| Material Type option | Semi-Finished Material | Material Setengah Jadi |
| Material Type option | Finished Material | Material Jadi |
| Status dropdown placeholder | Select status | Pilih status |
| Status option | Active | Aktif |
| Status option | Inactive | Tidak Aktif |
| Field error | Field cannot be empty | Kolom tidak boleh kosong |
| Field error | Max. 100 characters. Extra text removed. | Maks. 100 karakter. Teks tambahan dihapus. |
| Delete confirm title | Delete this row? | Hapus baris ini? |
| Delete confirm title (plural) | Delete {n} rows? | Hapus {n} baris? |
| Delete confirm description | These rows will be removed from this upload and won't be imported. | Baris ini akan dihapus dari upload dan tidak akan diimpor. |
| Delete confirm button | Cancel | Batal |
| Delete confirm button | Yes, Delete | Ya, Hapus |

## 6. Confirm modals

| Modal | Element | English | Bahasa Indonesia |
|---|---|---|---|
| Cancel Upload | Title | Cancel this upload? | Batalkan unggahan ini? |
| Cancel Upload | Description | You won't be able to continue this upload. It will remain in the Bulk Upload list with a Cancelled status. | Anda tidak dapat melanjutkan unggahan ini. Unggahan akan tetap ada di daftar Unggah Massal dengan status Dibatalkan. |
| Cancel Upload | Field label | Cancellation Reason | Alasan Pembatalan |
| Cancel Upload | Field placeholder | Add a reason for canceling this upload. | Tambahkan alasan pembatalan unggahan ini. |
| Cancel Upload | Field error | Field cannot be empty | Kolom tidak boleh kosong |
| Cancel Upload | Button | Keep Editing | Lanjutkan Mengedit |
| Cancel Upload | Button | Yes, Cancel | Ya, Batalkan |
| Discard Changes | Title | Discard changes? | Buang perubahan? |
| Discard Changes | Description | Any changes you made on this page will be lost. | Semua perubahan yang Anda buat di halaman ini akan hilang. |
| Discard Changes | Button | Keep Editing | Lanjutkan Mengedit |
| Discard Changes | Button | Yes, Discard | Ya, Buang |
| Invalid Data | Title | {n} material(s) need(s) attention | {n} material perlu diperiksa |
| Invalid Data | Description | Some required information is missing. You can update these materials now or continue importing the materials that are ready. | Beberapa informasi wajib belum lengkap. Anda dapat memperbarui material ini sekarang atau melanjutkan impor material yang sudah siap. |
| Invalid Data | Button | Keep Editing | Lanjutkan Mengedit |
| Invalid Data | Button | Import Ready Materials | Impor Material yang Siap |
| Input Data (import confirm) | Title | Import {n} material(s)? | Impor {n} material? |
| Input Data | Description | These materials will be added to your material catalog. | Material ini akan ditambahkan ke katalog material Anda. |
| Input Data | Button | Cancel | Batal |
| Input Data | Button | Yes, Import Materials | Ya, Impor Material |
| Skip Normalization | Title | Skip normalization? | Lewati normalisasi? |
| Skip Normalization | Description | The remaining data won't be normalized by AI. Those rows will need your attention later in the Review step. | Data yang tersisa tidak akan dinormalisasi oleh AI. Baris tersebut perlu Anda periksa pada tahap Peninjauan. |
| Skip Normalization | Button | Keep Waiting | Tetap Tunggu |
| Skip Normalization | Button | Yes, Skip | Ya, Lewati |
| Use Template Suggestion | Title | Try uploading with our template | Coba unggah dengan template kami |
| Use Template Suggestion | Description | Use our template to organize your material data in a format that's easier to process. | Gunakan template kami untuk mengatur data material dalam format yang lebih mudah diproses. |
| Use Template Suggestion | Button | Not Now | Nanti Saja |
| Use Template Suggestion | Button | Download Template | Unduh Template |
| No Data To Import | Title | No materials to import | Tidak ada material untuk diimpor |
| No Data To Import | Description | There are no materials ready to import. Add or update your material data before continuing. | Belum ada material yang siap diimpor. Tambahkan atau perbarui data material sebelum melanjutkan. |
| No Data To Import | Button | Back to Review | Kembali ke Peninjauan |

## 7. Material Upload Detail modal

`src/modules/materials/components/MaterialUploadDetailModal.jsx`

| Element | English | Bahasa Indonesia |
|---|---|---|
| Modal title | Bulk Upload Detail | Detail Unggahan Massal |
| Processing banner | **Import in progress:** Your materials are being added to the material catalog. We'll notify you by email when it's complete. | **Proses impor sedang berlangsung:** Material Anda sedang ditambahkan ke katalog material. Kami akan memberi tahu Anda melalui email setelah selesai. |
| Field label | Created At | Dibuat Pada |
| Field label | Created By | Dibuat Oleh |
| Field label | Upload ID | ID Unggah |
| Field label | Total Data | Total Data |
| Field label | Imported Data | Data yang Diimpor |
| Field label | Invalid Data | Data yang Tidak Valid |
| Section title | Activity Logs | Log Aktivitas |
| Column header | Name | Nama |
| Column header | Email | Email |
| Column header | Activity | Aktivitas |
| Column header | Timestamp | Waktu |
| Empty state | No activity yet. | Belum ada aktivitas. |
| Button | Download Invalid Data | Unduh Data yang Tidak Valid |

## 8. Activity log status copy

`src/modules/materials/mock/materialUploadsStore.js`

| Log title | English description | Bahasa Indonesia |
|---|---|---|
| Upload Created | File "{fileName}" was uploaded ({n} materials). | File "{fileName}" diunggah ({n} material). |
| Normalization Started | The uploaded data is being normalized in the background. | Data yang diunggah sedang dinormalisasi di latar belakang. |
| Normalization Finished | Data is ready for review. | Data siap ditinjau. |
| Normalization Skipped | AI normalization was skipped by the user — remaining rows need attention. | Normalisasi AI dilewati oleh pengguna — baris yang tersisa perlu diperiksa. |
| Import Started | Reviewed materials are being imported into the catalog. | Material yang telah ditinjau sedang diimpor ke katalog. |
| Import Completed | Materials were added to the material catalog. | Material telah ditambahkan ke katalog material. |
| Upload Cancelled | *(user-entered cancellation reason)* | |

## 9. Material field labels (Mapping / Review columns, CSV template)

`src/modules/materials/mock/materialFieldsConfig.js`

| Field key | English label | Bahasa Indonesia |
|---|---|---|
| sku | SKU | SKU |
| name | Material Name | Nama Material |
| category | Category | Kategori |
| abcClassification | ABC Classification | Klasifikasi ABC |
| materialType | Material Type | Jenis Material |
| uom | Unit of Measurement (UOM) | Satuan Ukur (UOM) |
| status | Status | Status |
| description | Description | Deskripsi |
| stockRisk | Stock Risk | Risiko Stok |

## 10. Notifications — `material_bulk_upload`

`src/data/notification/notificationCatalog.js` — already bilingual in code; shown here for reference/review.

| Trigger | Channel | English | Bahasa Indonesia (current) |
|---|---|---|---|
| bulk_upload_completed | In-app title | Bulk upload finished — {fileName} | Unggah massal selesai — {fileName} |
| bulk_upload_completed | In-app body | {fileName} finished processing — {n} material(s) added to your catalog. | {fileName} selesai diproses — {n} material ditambahkan ke katalog Anda. |
| bulk_upload_completed | CTA | View Upload | Lihat Unggahan |
| bulk_upload_completed | Email subject | Bulk upload finished — {fileName} | Unggah massal selesai — {fileName} |
| bulk_upload_completed | Email body | Hi {requesterName}, {fileName} finished processing — {n} material(s) added to your catalog. | Halo {requesterName}, {fileName} selesai diproses — {n} material ditambahkan ke katalog Anda. |
| bulk_upload_mapping_ready | In-app title | Mapping finished — {fileName} | Pemetaan selesai — {fileName} |
| bulk_upload_mapping_ready | In-app body | {fileName} finished mapping and is ready for review. | {fileName} selesai dipetakan dan siap untuk ditinjau. |
| bulk_upload_mapping_ready | CTA | Review | Tinjau |
| bulk_upload_mapping_ready | Email subject | Mapping finished — {fileName} | Pemetaan selesai — {fileName} |
| bulk_upload_mapping_ready | Email body | Hi {requesterName}, {fileName} finished mapping and is ready for review. | Halo {requesterName}, {fileName} selesai dipetakan dan siap untuk ditinjau. |
| bulk_upload_cancelled | In-app title | Bulk upload cancelled — {fileName} | Unggah massal dibatalkan — {fileName} |
| bulk_upload_cancelled | In-app body | {fileName} was cancelled before it finished processing. | {fileName} dibatalkan sebelum selesai diproses. |
| bulk_upload_cancelled | CTA | View Upload | Lihat Unggahan |
| bulk_upload_cancelled | Email subject | Bulk upload cancelled — {fileName} | Unggah massal dibatalkan — {fileName} |
| bulk_upload_cancelled | Email body | Hi {requesterName}, {fileName} was cancelled before it finished processing. | Halo {requesterName}, {fileName} dibatalkan sebelum selesai diproses. |
