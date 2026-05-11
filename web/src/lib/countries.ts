export const COUNTRY_DATA: Record<string, { label: string; flag: string; lang: string; currency: string }> = {
  "AR": { label: "Argentina", flag: "🇦🇷", lang: "es-419", currency: "$" },
  "UY": { label: "Uruguay", flag: "🇺🇾", lang: "es-419", currency: "$" },
  "BR": { label: "Brazil", flag: "🇧🇷", lang: "pt-BR", currency: "R$" },
  "ES": { label: "Spain", flag: "🇪🇸", lang: "es-419", currency: "€" },
  "GE": { label: "Georgia", flag: "🇬🇪", lang: "ka", currency: "₾" },
  "TH": { label: "Thailand", flag: "🇹🇭", lang: "en", currency: "฿" },
  "RU": { label: "Russia", flag: "🇷🇺", lang: "ru", currency: "₽" },
  "MX": { label: "Mexico", flag: "🇲🇽", lang: "es-419", currency: "$" },
  "WW": { label: "Rest of the World", flag: "🌐", lang: "en", currency: "$" }
};

export const getCurrencySymbol = (countryCode: string) => {
  return COUNTRY_DATA[countryCode]?.currency || "$";
};
