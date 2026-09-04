"use client"

import * as React from "react"

// ── Locale interface ──────────────────────────────────────────────────────────

export interface LabmuLocale {
  loading: {
    label: string
    title: string
    description: string
  }
  table: {
    searchPlaceholder: string
    loadingLabel: string
    emptyTitle: string
    rowsPerPagePlaceholder: string
    fromRows: (total: number) => string
    totalData: (total: number) => string
  }
  dropdown: {
    placeholder: string
    searchPlaceholder: string
    noResults: string
    multiSelected: (count: number) => string
    addNewLabel: string
    addNewTitle: string
    addNewInputPlaceholder: string
    addNewSubmitLabel: string
    addNewCancelLabel: string
  }
  filterPill: {
    clearFilter: string
    searchPlaceholder: string
    noResults: (search: string) => string
    customDateLabel: string
  }
  breadcrumbs: {
    allPeriod: string
  }
  textField: {
    inlinePlaceholder: string
  }
  datePicker: {
    weekDays: readonly [string, string, string, string, string, string, string]
    monthNames: readonly [string, string, string, string, string, string, string, string, string, string, string, string]
    monthNamesShort: readonly [string, string, string, string, string, string, string, string, string, string, string, string]
    weekLabel: string
    prevYear: string
    nextYear: string
    prevYears: string
    nextYears: string
    prevMonth: string
    nextMonth: string
    todayLabel: string
  }
  dateField: {
    selectDate: string
    selectDateRange: string
  }
  timePicker: {
    hoursLabel: string
    minutesLabel: string
    secondsLabel: string
    amLabel: string
    pmLabel: string
    nowLabel: string
  }
  otpPopup: {
    title: string
    subtitle: (recipient: string) => string
    noOtp: string
    resendIn: (time: string) => string
    resend: string
    close: string
  }
  imageCrop: {
    title: string
    description: string
    saveLabel: string
  }
  phoneField: {
    placeholder: string
    searchPlaceholder: string
    noResults: string
  }
}

// ── Built-in locales ──────────────────────────────────────────────────────────

export const idLocale: LabmuLocale = {
  loading: {
    label: "Sedang memuat data",
    title: "Sedang memuat data",
    description: "Tunggu sebentar ya",
  },
  table: {
    searchPlaceholder: "Cari...",
    loadingLabel: "Memuat data tabel",
    emptyTitle: "Tidak ada data",
    rowsPerPagePlaceholder: "Pilih...",
    fromRows: (total) => `dari ${total} data`,
    totalData: (total) => `${total} total data`,
  },
  dropdown: {
    placeholder: "Pilih...",
    searchPlaceholder: "Cari...",
    noResults: "Kata kunci tidak ditemukan",
    multiSelected: (count) => `${count} dipilih`,
    addNewLabel: "Tambah unit baru",
    addNewTitle: "Tambah Unit Baru",
    addNewInputPlaceholder: "Ketik nama unit",
    addNewSubmitLabel: "Tambah",
    addNewCancelLabel: "Batal",
  },
  filterPill: {
    clearFilter: "Hapus Filter",
    searchPlaceholder: "Cari...",
    noResults: (search) => `"${search}" tidak ditemukan.`,
    customDateLabel: "Tanggal kustom",
  },
  breadcrumbs: {
    allPeriod: "Semua Periode",
  },
  textField: {
    inlinePlaceholder: "Klik untuk edit",
  },
  datePicker: {
    weekDays: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
    monthNames: ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    weekLabel: "Pekan",
    prevYear: "Tahun sebelumnya",
    nextYear: "Tahun berikutnya",
    prevYears: "Tahun-tahun sebelumnya",
    nextYears: "Tahun-tahun berikutnya",
    prevMonth: "Bulan sebelumnya",
    nextMonth: "Bulan berikutnya",
    todayLabel: "Hari Ini",
  },
  dateField: {
    selectDate: "Pilih tanggal",
    selectDateRange: "Pilih rentang tanggal",
  },
  timePicker: {
    hoursLabel: "Jam",
    minutesLabel: "Menit",
    secondsLabel: "Detik",
    amLabel: "AM",
    pmLabel: "PM",
    nowLabel: "Sekarang",
  },
  otpPopup: {
    title: "Masukkan Kode OTP",
    subtitle: (recipient) => `Kode OTP telah dikirim ke ${recipient}`,
    noOtp: "Tidak dapat kode OTP?",
    resendIn: (time) => `Kirim Ulang dalam ${time}`,
    resend: "Kirim Ulang",
    close: "Tutup",
  },
  imageCrop: {
    title: "Pratinjau Gambar",
    description: "Pastikan gambar terlihat penuh dan berada dalam area.",
    saveLabel: "Simpan",
  },
  phoneField: {
    placeholder: "Nomor telepon",
    searchPlaceholder: "Cari negara...",
    noResults: "Negara tidak ditemukan",
  },
}

export const enLocale: LabmuLocale = {
  loading: {
    label: "Loading data",
    title: "Loading data",
    description: "Please wait a moment",
  },
  table: {
    searchPlaceholder: "Search...",
    loadingLabel: "Loading table data",
    emptyTitle: "No data",
    rowsPerPagePlaceholder: "Select...",
    fromRows: (total) => `from ${total} rows`,
    totalData: (total) => `${total} total data`,
  },
  dropdown: {
    placeholder: "Select...",
    searchPlaceholder: "Search...",
    noResults: "No results found",
    multiSelected: (count) => `${count} selected`,
    addNewLabel: "Add new unit",
    addNewTitle: "Add New Unit",
    addNewInputPlaceholder: "Type unit name",
    addNewSubmitLabel: "Add Unit",
    addNewCancelLabel: "Cancel",
  },
  filterPill: {
    clearFilter: "Clear Filter",
    searchPlaceholder: "Search...",
    noResults: (search) => `"${search}" not found.`,
    customDateLabel: "Custom date",
  },
  breadcrumbs: {
    allPeriod: "All Period",
  },
  textField: {
    inlinePlaceholder: "Click to edit",
  },
  datePicker: {
    weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    monthNames: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    weekLabel: "Week",
    prevYear: "Previous year",
    nextYear: "Next year",
    prevYears: "Previous years",
    nextYears: "Next years",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    todayLabel: "Today",
  },
  dateField: {
    selectDate: "Select date",
    selectDateRange: "Select date range",
  },
  timePicker: {
    hoursLabel: "Hour",
    minutesLabel: "Min",
    secondsLabel: "Sec",
    amLabel: "AM",
    pmLabel: "PM",
    nowLabel: "Now",
  },
  otpPopup: {
    title: "Enter OTP Code",
    subtitle: (recipient) => `OTP code has been sent to ${recipient}`,
    noOtp: "Didn't receive the OTP?",
    resendIn: (time) => `Resend in ${time}`,
    resend: "Resend",
    close: "Close",
  },
  imageCrop: {
    title: "Preview Image",
    description: "Make sure the image is fully visible and within the area.",
    saveLabel: "Save",
  },
  phoneField: {
    placeholder: "Phone number",
    searchPlaceholder: "Search country...",
    noResults: "No country found",
  },
}

// ── Context ───────────────────────────────────────────────────────────────────

const LocaleContext = React.createContext<LabmuLocale>(idLocale)

export interface LocaleProviderProps {
  /**
   * Pass a built-in locale shorthand ("id" | "en") or a full LabmuLocale
   * object for custom / partially-overridden translations.
   */
  locale: LabmuLocale | "id" | "en"
  children: React.ReactNode
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ locale, children }) => {
  const resolved = locale === "id" ? idLocale : locale === "en" ? enLocale : locale
  return <LocaleContext.Provider value={resolved}>{children}</LocaleContext.Provider>
}

export const useLocale = (): LabmuLocale => React.useContext(LocaleContext)
