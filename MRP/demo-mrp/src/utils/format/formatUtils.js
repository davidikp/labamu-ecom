export const formatNumberWithCommas = (val) => {
  if (val === null || val === undefined || val === "") return "";
  const numeric = Number(String(val).replace(/,/g, ""));
  if (Number.isNaN(numeric)) return "";
  return numeric.toLocaleString("en-US");
};

export const parseNumberFromCommas = (val) => {
  if (val === null || val === undefined || val === "") return "";
  const numeric = Number(String(val).replace(/,/g, ""));
  return Number.isNaN(numeric) ? 0 : numeric;
};

export const formatCurrency = (val, currencyCode = "IDR") => {
  if (isNaN(val) || val === null || val === undefined) return `${currencyCode} 0`;
  return `${currencyCode} ${formatNumberWithCommas(parseFloat(val).toFixed(0))}`;
};
