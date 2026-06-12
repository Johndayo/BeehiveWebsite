import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enLocale);

const COUNTRY_OVERRIDES: Record<string, string> = {
  'Cabo Verde': 'CV',
  'Congo (DRC)': 'CD',
  'Congo (Republic)': 'CG',
  'East Timor': 'TL',
  'Ivory Coast': 'CI',
  'Kosovo': 'XK',
  'North Korea': 'KP',
  'South Korea': 'KR',
  'South Sudan': 'SS',
  'Taiwan': 'TW',
  'United Kingdom': 'GB',
  'United States': 'US',
  'Vatican City': 'VA',
  'Palestine': 'PS',
  'Czech Republic': 'CZ',
  'Republic of the Congo': 'CG',
  'Democratic Republic of the Congo': 'CD',
};

export function getCountryIsoCode(countryName: string): string | null {
  if (!countryName) return null;
  const override = COUNTRY_OVERRIDES[countryName];
  if (override) return override;

  const code = countries.getAlpha2Code(countryName, 'en');
  return code || null;
}

export function getFlagUrl(countryName: string): string {
  const code = getCountryIsoCode(countryName);
  if (!code) return '';
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

export function getFlagSrcSet(countryName: string): string {
  const code = getCountryIsoCode(countryName);
  if (!code) return '';
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`;
}
