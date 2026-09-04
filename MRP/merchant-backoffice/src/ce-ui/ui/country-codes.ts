export interface CountryCode {
  /** ISO 3166-1 alpha-2 country code (e.g., "ID") */
  code: string
  /** Country name in English */
  name: string
  /** International dial code (e.g., "+62") */
  dialCode: string
  /** Flag emoji generated from ISO code */
  flag: string
}

/** Converts a 2-letter ISO country code to its flag emoji. */
const F = (c: string) =>
  [...c.toUpperCase()].map(ch => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65)).join("")

/**
 * Comprehensive list of countries with dial codes.
 * Southeast Asian countries are listed first (product-market fit),
 * followed by the rest in alphabetical order.
 */
export const COUNTRY_CODES: CountryCode[] = [
  // ── Southeast Asia (featured) ─────────────────────────────────────────────
  { code: "ID", name: "Indonesia",        dialCode: "+62",  flag: F("ID") },
  { code: "SG", name: "Singapore",        dialCode: "+65",  flag: F("SG") },
  { code: "MY", name: "Malaysia",         dialCode: "+60",  flag: F("MY") },
  { code: "PH", name: "Philippines",      dialCode: "+63",  flag: F("PH") },
  { code: "TH", name: "Thailand",         dialCode: "+66",  flag: F("TH") },
  { code: "VN", name: "Vietnam",          dialCode: "+84",  flag: F("VN") },
  { code: "MM", name: "Myanmar",          dialCode: "+95",  flag: F("MM") },
  { code: "KH", name: "Cambodia",         dialCode: "+855", flag: F("KH") },
  { code: "LA", name: "Laos",             dialCode: "+856", flag: F("LA") },
  { code: "BN", name: "Brunei",           dialCode: "+673", flag: F("BN") },
  { code: "TL", name: "Timor-Leste",      dialCode: "+670", flag: F("TL") },

  // ── A ─────────────────────────────────────────────────────────────────────
  { code: "AF", name: "Afghanistan",              dialCode: "+93",  flag: F("AF") },
  { code: "AL", name: "Albania",                  dialCode: "+355", flag: F("AL") },
  { code: "DZ", name: "Algeria",                  dialCode: "+213", flag: F("DZ") },
  { code: "AD", name: "Andorra",                  dialCode: "+376", flag: F("AD") },
  { code: "AO", name: "Angola",                   dialCode: "+244", flag: F("AO") },
  { code: "AG", name: "Antigua and Barbuda",      dialCode: "+1",   flag: F("AG") },
  { code: "AR", name: "Argentina",                dialCode: "+54",  flag: F("AR") },
  { code: "AM", name: "Armenia",                  dialCode: "+374", flag: F("AM") },
  { code: "AU", name: "Australia",                dialCode: "+61",  flag: F("AU") },
  { code: "AT", name: "Austria",                  dialCode: "+43",  flag: F("AT") },
  { code: "AZ", name: "Azerbaijan",               dialCode: "+994", flag: F("AZ") },

  // ── B ─────────────────────────────────────────────────────────────────────
  { code: "BS", name: "Bahamas",                  dialCode: "+1",   flag: F("BS") },
  { code: "BH", name: "Bahrain",                  dialCode: "+973", flag: F("BH") },
  { code: "BD", name: "Bangladesh",               dialCode: "+880", flag: F("BD") },
  { code: "BB", name: "Barbados",                 dialCode: "+1",   flag: F("BB") },
  { code: "BY", name: "Belarus",                  dialCode: "+375", flag: F("BY") },
  { code: "BE", name: "Belgium",                  dialCode: "+32",  flag: F("BE") },
  { code: "BZ", name: "Belize",                   dialCode: "+501", flag: F("BZ") },
  { code: "BJ", name: "Benin",                    dialCode: "+229", flag: F("BJ") },
  { code: "BT", name: "Bhutan",                   dialCode: "+975", flag: F("BT") },
  { code: "BO", name: "Bolivia",                  dialCode: "+591", flag: F("BO") },
  { code: "BA", name: "Bosnia and Herzegovina",   dialCode: "+387", flag: F("BA") },
  { code: "BW", name: "Botswana",                 dialCode: "+267", flag: F("BW") },
  { code: "BR", name: "Brazil",                   dialCode: "+55",  flag: F("BR") },
  { code: "BG", name: "Bulgaria",                 dialCode: "+359", flag: F("BG") },
  { code: "BF", name: "Burkina Faso",             dialCode: "+226", flag: F("BF") },
  { code: "BI", name: "Burundi",                  dialCode: "+257", flag: F("BI") },

  // ── C ─────────────────────────────────────────────────────────────────────
  { code: "CV", name: "Cape Verde",               dialCode: "+238", flag: F("CV") },
  { code: "CM", name: "Cameroon",                 dialCode: "+237", flag: F("CM") },
  { code: "CA", name: "Canada",                   dialCode: "+1",   flag: F("CA") },
  { code: "CF", name: "Central African Republic", dialCode: "+236", flag: F("CF") },
  { code: "TD", name: "Chad",                     dialCode: "+235", flag: F("TD") },
  { code: "CL", name: "Chile",                    dialCode: "+56",  flag: F("CL") },
  { code: "CN", name: "China",                    dialCode: "+86",  flag: F("CN") },
  { code: "CO", name: "Colombia",                 dialCode: "+57",  flag: F("CO") },
  { code: "KM", name: "Comoros",                  dialCode: "+269", flag: F("KM") },
  { code: "CD", name: "Congo (DR)",               dialCode: "+243", flag: F("CD") },
  { code: "CG", name: "Congo (Republic)",         dialCode: "+242", flag: F("CG") },
  { code: "CR", name: "Costa Rica",               dialCode: "+506", flag: F("CR") },
  { code: "HR", name: "Croatia",                  dialCode: "+385", flag: F("HR") },
  { code: "CU", name: "Cuba",                     dialCode: "+53",  flag: F("CU") },
  { code: "CY", name: "Cyprus",                   dialCode: "+357", flag: F("CY") },
  { code: "CZ", name: "Czech Republic",           dialCode: "+420", flag: F("CZ") },

  // ── D ─────────────────────────────────────────────────────────────────────
  { code: "DK", name: "Denmark",                  dialCode: "+45",  flag: F("DK") },
  { code: "DJ", name: "Djibouti",                 dialCode: "+253", flag: F("DJ") },
  { code: "DM", name: "Dominica",                 dialCode: "+1",   flag: F("DM") },
  { code: "DO", name: "Dominican Republic",       dialCode: "+1",   flag: F("DO") },

  // ── E ─────────────────────────────────────────────────────────────────────
  { code: "EC", name: "Ecuador",                  dialCode: "+593", flag: F("EC") },
  { code: "EG", name: "Egypt",                    dialCode: "+20",  flag: F("EG") },
  { code: "SV", name: "El Salvador",              dialCode: "+503", flag: F("SV") },
  { code: "GQ", name: "Equatorial Guinea",        dialCode: "+240", flag: F("GQ") },
  { code: "ER", name: "Eritrea",                  dialCode: "+291", flag: F("ER") },
  { code: "EE", name: "Estonia",                  dialCode: "+372", flag: F("EE") },
  { code: "SZ", name: "Eswatini",                 dialCode: "+268", flag: F("SZ") },
  { code: "ET", name: "Ethiopia",                 dialCode: "+251", flag: F("ET") },

  // ── F ─────────────────────────────────────────────────────────────────────
  { code: "FJ", name: "Fiji",                     dialCode: "+679", flag: F("FJ") },
  { code: "FI", name: "Finland",                  dialCode: "+358", flag: F("FI") },
  { code: "FR", name: "France",                   dialCode: "+33",  flag: F("FR") },

  // ── G ─────────────────────────────────────────────────────────────────────
  { code: "GA", name: "Gabon",                    dialCode: "+241", flag: F("GA") },
  { code: "GM", name: "Gambia",                   dialCode: "+220", flag: F("GM") },
  { code: "GE", name: "Georgia",                  dialCode: "+995", flag: F("GE") },
  { code: "DE", name: "Germany",                  dialCode: "+49",  flag: F("DE") },
  { code: "GH", name: "Ghana",                    dialCode: "+233", flag: F("GH") },
  { code: "GR", name: "Greece",                   dialCode: "+30",  flag: F("GR") },
  { code: "GD", name: "Grenada",                  dialCode: "+1",   flag: F("GD") },
  { code: "GT", name: "Guatemala",                dialCode: "+502", flag: F("GT") },
  { code: "GN", name: "Guinea",                   dialCode: "+224", flag: F("GN") },
  { code: "GW", name: "Guinea-Bissau",            dialCode: "+245", flag: F("GW") },
  { code: "GY", name: "Guyana",                   dialCode: "+592", flag: F("GY") },

  // ── H ─────────────────────────────────────────────────────────────────────
  { code: "HT", name: "Haiti",                    dialCode: "+509", flag: F("HT") },
  { code: "HN", name: "Honduras",                 dialCode: "+504", flag: F("HN") },
  { code: "HK", name: "Hong Kong",                dialCode: "+852", flag: F("HK") },
  { code: "HU", name: "Hungary",                  dialCode: "+36",  flag: F("HU") },

  // ── I ─────────────────────────────────────────────────────────────────────
  { code: "IS", name: "Iceland",                  dialCode: "+354", flag: F("IS") },
  { code: "IN", name: "India",                    dialCode: "+91",  flag: F("IN") },
  { code: "IR", name: "Iran",                     dialCode: "+98",  flag: F("IR") },
  { code: "IQ", name: "Iraq",                     dialCode: "+964", flag: F("IQ") },
  { code: "IE", name: "Ireland",                  dialCode: "+353", flag: F("IE") },
  { code: "IL", name: "Israel",                   dialCode: "+972", flag: F("IL") },
  { code: "IT", name: "Italy",                    dialCode: "+39",  flag: F("IT") },
  { code: "CI", name: "Ivory Coast",              dialCode: "+225", flag: F("CI") },

  // ── J ─────────────────────────────────────────────────────────────────────
  { code: "JM", name: "Jamaica",                  dialCode: "+1",   flag: F("JM") },
  { code: "JP", name: "Japan",                    dialCode: "+81",  flag: F("JP") },
  { code: "JO", name: "Jordan",                   dialCode: "+962", flag: F("JO") },

  // ── K ─────────────────────────────────────────────────────────────────────
  { code: "KZ", name: "Kazakhstan",               dialCode: "+7",   flag: F("KZ") },
  { code: "KE", name: "Kenya",                    dialCode: "+254", flag: F("KE") },
  { code: "KI", name: "Kiribati",                 dialCode: "+686", flag: F("KI") },
  { code: "KW", name: "Kuwait",                   dialCode: "+965", flag: F("KW") },
  { code: "KG", name: "Kyrgyzstan",               dialCode: "+996", flag: F("KG") },

  // ── L ─────────────────────────────────────────────────────────────────────
  { code: "LV", name: "Latvia",                   dialCode: "+371", flag: F("LV") },
  { code: "LB", name: "Lebanon",                  dialCode: "+961", flag: F("LB") },
  { code: "LS", name: "Lesotho",                  dialCode: "+266", flag: F("LS") },
  { code: "LR", name: "Liberia",                  dialCode: "+231", flag: F("LR") },
  { code: "LY", name: "Libya",                    dialCode: "+218", flag: F("LY") },
  { code: "LI", name: "Liechtenstein",            dialCode: "+423", flag: F("LI") },
  { code: "LT", name: "Lithuania",                dialCode: "+370", flag: F("LT") },
  { code: "LU", name: "Luxembourg",               dialCode: "+352", flag: F("LU") },

  // ── M ─────────────────────────────────────────────────────────────────────
  { code: "MO", name: "Macau",                    dialCode: "+853", flag: F("MO") },
  { code: "MG", name: "Madagascar",               dialCode: "+261", flag: F("MG") },
  { code: "MW", name: "Malawi",                   dialCode: "+265", flag: F("MW") },
  { code: "MV", name: "Maldives",                 dialCode: "+960", flag: F("MV") },
  { code: "ML", name: "Mali",                     dialCode: "+223", flag: F("ML") },
  { code: "MT", name: "Malta",                    dialCode: "+356", flag: F("MT") },
  { code: "MH", name: "Marshall Islands",         dialCode: "+692", flag: F("MH") },
  { code: "MR", name: "Mauritania",               dialCode: "+222", flag: F("MR") },
  { code: "MU", name: "Mauritius",                dialCode: "+230", flag: F("MU") },
  { code: "MX", name: "Mexico",                   dialCode: "+52",  flag: F("MX") },
  { code: "FM", name: "Micronesia",               dialCode: "+691", flag: F("FM") },
  { code: "MD", name: "Moldova",                  dialCode: "+373", flag: F("MD") },
  { code: "MC", name: "Monaco",                   dialCode: "+377", flag: F("MC") },
  { code: "MN", name: "Mongolia",                 dialCode: "+976", flag: F("MN") },
  { code: "ME", name: "Montenegro",               dialCode: "+382", flag: F("ME") },
  { code: "MA", name: "Morocco",                  dialCode: "+212", flag: F("MA") },
  { code: "MZ", name: "Mozambique",               dialCode: "+258", flag: F("MZ") },

  // ── N ─────────────────────────────────────────────────────────────────────
  { code: "NA", name: "Namibia",                  dialCode: "+264", flag: F("NA") },
  { code: "NR", name: "Nauru",                    dialCode: "+674", flag: F("NR") },
  { code: "NP", name: "Nepal",                    dialCode: "+977", flag: F("NP") },
  { code: "NL", name: "Netherlands",              dialCode: "+31",  flag: F("NL") },
  { code: "NZ", name: "New Zealand",              dialCode: "+64",  flag: F("NZ") },
  { code: "NI", name: "Nicaragua",                dialCode: "+505", flag: F("NI") },
  { code: "NE", name: "Niger",                    dialCode: "+227", flag: F("NE") },
  { code: "NG", name: "Nigeria",                  dialCode: "+234", flag: F("NG") },
  { code: "KP", name: "North Korea",              dialCode: "+850", flag: F("KP") },
  { code: "MK", name: "North Macedonia",          dialCode: "+389", flag: F("MK") },
  { code: "NO", name: "Norway",                   dialCode: "+47",  flag: F("NO") },

  // ── O ─────────────────────────────────────────────────────────────────────
  { code: "OM", name: "Oman",                     dialCode: "+968", flag: F("OM") },

  // ── P ─────────────────────────────────────────────────────────────────────
  { code: "PK", name: "Pakistan",                 dialCode: "+92",  flag: F("PK") },
  { code: "PW", name: "Palau",                    dialCode: "+680", flag: F("PW") },
  { code: "PS", name: "Palestine",                dialCode: "+970", flag: F("PS") },
  { code: "PA", name: "Panama",                   dialCode: "+507", flag: F("PA") },
  { code: "PG", name: "Papua New Guinea",         dialCode: "+675", flag: F("PG") },
  { code: "PY", name: "Paraguay",                 dialCode: "+595", flag: F("PY") },
  { code: "PE", name: "Peru",                     dialCode: "+51",  flag: F("PE") },
  { code: "PL", name: "Poland",                   dialCode: "+48",  flag: F("PL") },
  { code: "PT", name: "Portugal",                 dialCode: "+351", flag: F("PT") },

  // ── Q ─────────────────────────────────────────────────────────────────────
  { code: "QA", name: "Qatar",                    dialCode: "+974", flag: F("QA") },

  // ── R ─────────────────────────────────────────────────────────────────────
  { code: "RO", name: "Romania",                  dialCode: "+40",  flag: F("RO") },
  { code: "RU", name: "Russia",                   dialCode: "+7",   flag: F("RU") },
  { code: "RW", name: "Rwanda",                   dialCode: "+250", flag: F("RW") },

  // ── S ─────────────────────────────────────────────────────────────────────
  { code: "KN", name: "Saint Kitts and Nevis",    dialCode: "+1",   flag: F("KN") },
  { code: "LC", name: "Saint Lucia",              dialCode: "+1",   flag: F("LC") },
  { code: "VC", name: "Saint Vincent",            dialCode: "+1",   flag: F("VC") },
  { code: "WS", name: "Samoa",                    dialCode: "+685", flag: F("WS") },
  { code: "SM", name: "San Marino",               dialCode: "+378", flag: F("SM") },
  { code: "ST", name: "São Tomé and Príncipe",    dialCode: "+239", flag: F("ST") },
  { code: "SA", name: "Saudi Arabia",             dialCode: "+966", flag: F("SA") },
  { code: "SN", name: "Senegal",                  dialCode: "+221", flag: F("SN") },
  { code: "RS", name: "Serbia",                   dialCode: "+381", flag: F("RS") },
  { code: "SC", name: "Seychelles",               dialCode: "+248", flag: F("SC") },
  { code: "SL", name: "Sierra Leone",             dialCode: "+232", flag: F("SL") },
  { code: "SK", name: "Slovakia",                 dialCode: "+421", flag: F("SK") },
  { code: "SI", name: "Slovenia",                 dialCode: "+386", flag: F("SI") },
  { code: "SB", name: "Solomon Islands",          dialCode: "+677", flag: F("SB") },
  { code: "SO", name: "Somalia",                  dialCode: "+252", flag: F("SO") },
  { code: "ZA", name: "South Africa",             dialCode: "+27",  flag: F("ZA") },
  { code: "KR", name: "South Korea",              dialCode: "+82",  flag: F("KR") },
  { code: "SS", name: "South Sudan",              dialCode: "+211", flag: F("SS") },
  { code: "ES", name: "Spain",                    dialCode: "+34",  flag: F("ES") },
  { code: "LK", name: "Sri Lanka",                dialCode: "+94",  flag: F("LK") },
  { code: "SD", name: "Sudan",                    dialCode: "+249", flag: F("SD") },
  { code: "SR", name: "Suriname",                 dialCode: "+597", flag: F("SR") },
  { code: "SE", name: "Sweden",                   dialCode: "+46",  flag: F("SE") },
  { code: "CH", name: "Switzerland",              dialCode: "+41",  flag: F("CH") },
  { code: "SY", name: "Syria",                    dialCode: "+963", flag: F("SY") },

  // ── T ─────────────────────────────────────────────────────────────────────
  { code: "TW", name: "Taiwan",                   dialCode: "+886", flag: F("TW") },
  { code: "TJ", name: "Tajikistan",               dialCode: "+992", flag: F("TJ") },
  { code: "TZ", name: "Tanzania",                 dialCode: "+255", flag: F("TZ") },
  { code: "TG", name: "Togo",                     dialCode: "+228", flag: F("TG") },
  { code: "TO", name: "Tonga",                    dialCode: "+676", flag: F("TO") },
  { code: "TT", name: "Trinidad and Tobago",      dialCode: "+1",   flag: F("TT") },
  { code: "TN", name: "Tunisia",                  dialCode: "+216", flag: F("TN") },
  { code: "TR", name: "Turkey",                   dialCode: "+90",  flag: F("TR") },
  { code: "TM", name: "Turkmenistan",             dialCode: "+993", flag: F("TM") },
  { code: "TV", name: "Tuvalu",                   dialCode: "+688", flag: F("TV") },

  // ── U ─────────────────────────────────────────────────────────────────────
  { code: "UG", name: "Uganda",                   dialCode: "+256", flag: F("UG") },
  { code: "UA", name: "Ukraine",                  dialCode: "+380", flag: F("UA") },
  { code: "AE", name: "United Arab Emirates",     dialCode: "+971", flag: F("AE") },
  { code: "GB", name: "United Kingdom",           dialCode: "+44",  flag: F("GB") },
  { code: "US", name: "United States",            dialCode: "+1",   flag: F("US") },
  { code: "UY", name: "Uruguay",                  dialCode: "+598", flag: F("UY") },
  { code: "UZ", name: "Uzbekistan",               dialCode: "+998", flag: F("UZ") },

  // ── V ─────────────────────────────────────────────────────────────────────
  { code: "VU", name: "Vanuatu",                  dialCode: "+678", flag: F("VU") },
  { code: "VA", name: "Vatican City",             dialCode: "+39",  flag: F("VA") },
  { code: "VE", name: "Venezuela",                dialCode: "+58",  flag: F("VE") },

  // ── Y ─────────────────────────────────────────────────────────────────────
  { code: "YE", name: "Yemen",                    dialCode: "+967", flag: F("YE") },

  // ── Z ─────────────────────────────────────────────────────────────────────
  { code: "ZM", name: "Zambia",                   dialCode: "+260", flag: F("ZM") },
  { code: "ZW", name: "Zimbabwe",                 dialCode: "+263", flag: F("ZW") },
]
