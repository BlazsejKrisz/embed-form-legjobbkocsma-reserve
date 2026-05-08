export interface Country {
  code: string
  flag: string
  dial: string
  name: { hu: string; en: string }
}

export const COUNTRIES: Country[] = [
  { code: 'HU', flag: '🇭🇺', dial: '+36',  name: { hu: 'Magyarország',         en: 'Hungary' } },
  { code: 'AT', flag: '🇦🇹', dial: '+43',  name: { hu: 'Ausztria',             en: 'Austria' } },
  { code: 'DE', flag: '🇩🇪', dial: '+49',  name: { hu: 'Németország',          en: 'Germany' } },
  { code: 'GB', flag: '🇬🇧', dial: '+44',  name: { hu: 'Egyesült Királyság',   en: 'United Kingdom' } },
  { code: 'US', flag: '🇺🇸', dial: '+1',   name: { hu: 'Egyesült Államok',     en: 'United States' } },
  { code: 'CA', flag: '🇨🇦', dial: '+1',   name: { hu: 'Kanada',               en: 'Canada' } },
  { code: 'RO', flag: '🇷🇴', dial: '+40',  name: { hu: 'Románia',              en: 'Romania' } },
  { code: 'SK', flag: '🇸🇰', dial: '+421', name: { hu: 'Szlovákia',            en: 'Slovakia' } },
  { code: 'CZ', flag: '🇨🇿', dial: '+420', name: { hu: 'Csehország',           en: 'Czechia' } },
  { code: 'PL', flag: '🇵🇱', dial: '+48',  name: { hu: 'Lengyelország',        en: 'Poland' } },
  { code: 'HR', flag: '🇭🇷', dial: '+385', name: { hu: 'Horvátország',         en: 'Croatia' } },
  { code: 'SI', flag: '🇸🇮', dial: '+386', name: { hu: 'Szlovénia',            en: 'Slovenia' } },
  { code: 'RS', flag: '🇷🇸', dial: '+381', name: { hu: 'Szerbia',              en: 'Serbia' } },
  { code: 'UA', flag: '🇺🇦', dial: '+380', name: { hu: 'Ukrajna',              en: 'Ukraine' } },
  { code: 'IT', flag: '🇮🇹', dial: '+39',  name: { hu: 'Olaszország',          en: 'Italy' } },
  { code: 'FR', flag: '🇫🇷', dial: '+33',  name: { hu: 'Franciaország',        en: 'France' } },
  { code: 'ES', flag: '🇪🇸', dial: '+34',  name: { hu: 'Spanyolország',        en: 'Spain' } },
  { code: 'PT', flag: '🇵🇹', dial: '+351', name: { hu: 'Portugália',           en: 'Portugal' } },
  { code: 'NL', flag: '🇳🇱', dial: '+31',  name: { hu: 'Hollandia',            en: 'Netherlands' } },
  { code: 'BE', flag: '🇧🇪', dial: '+32',  name: { hu: 'Belgium',              en: 'Belgium' } },
  { code: 'CH', flag: '🇨🇭', dial: '+41',  name: { hu: 'Svájc',                en: 'Switzerland' } },
  { code: 'SE', flag: '🇸🇪', dial: '+46',  name: { hu: 'Svédország',           en: 'Sweden' } },
  { code: 'NO', flag: '🇳🇴', dial: '+47',  name: { hu: 'Norvégia',             en: 'Norway' } },
  { code: 'DK', flag: '🇩🇰', dial: '+45',  name: { hu: 'Dánia',                en: 'Denmark' } },
  { code: 'FI', flag: '🇫🇮', dial: '+358', name: { hu: 'Finnország',           en: 'Finland' } },
  { code: 'IE', flag: '🇮🇪', dial: '+353', name: { hu: 'Írország',             en: 'Ireland' } },
  { code: 'GR', flag: '🇬🇷', dial: '+30',  name: { hu: 'Görögország',          en: 'Greece' } },
  { code: 'BG', flag: '🇧🇬', dial: '+359', name: { hu: 'Bulgária',             en: 'Bulgaria' } },
  { code: 'TR', flag: '🇹🇷', dial: '+90',  name: { hu: 'Törökország',          en: 'Turkey' } },
  { code: 'IL', flag: '🇮🇱', dial: '+972', name: { hu: 'Izrael',               en: 'Israel' } },
  { code: 'AU', flag: '🇦🇺', dial: '+61',  name: { hu: 'Ausztrália',           en: 'Australia' } },
  { code: 'JP', flag: '🇯🇵', dial: '+81',  name: { hu: 'Japán',                en: 'Japan' } },
  { code: 'CN', flag: '🇨🇳', dial: '+86',  name: { hu: 'Kína',                 en: 'China' } },
]

export function findCountry(code: string): Country {
  return COUNTRIES.find(c => c.code === code) ?? COUNTRIES[0]
}
