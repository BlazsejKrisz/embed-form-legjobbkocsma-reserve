type Lang = 'hu' | 'en'

const STRINGS = {
  loading: { hu: 'Betöltés…', en: 'Loading…' },
  loadError: { hu: 'Nem sikerült betölteni az adatokat. Frissítse az oldalt.', en: 'Failed to load data. Please refresh the page.' },
  venueNotFound: { hu: 'Helyszín nem található', en: 'Venue not found' },
  venueGroupNotFound: { hu: 'Helyszíncsoport nem található', en: 'Venue group not found' },

  venueLabel: { hu: 'Helyszín', en: 'Venue' },
  venuePlaceholder: { hu: 'Válasszon helyszínt…', en: 'Choose a venue…' },
  venueLoadError: { hu: 'Nem sikerült betölteni a helyszíneket.', en: 'Failed to load venues.' },

  dateLabel: { hu: 'Dátum', en: 'Date' },
  partyLabel: { hu: 'Létszám', en: 'Party size' },
  timeLabel: { hu: 'Időpont', en: 'Time' },
  timePlaceholder: { hu: 'Válasszon időpontot…', en: 'Choose a time…' },
  pickDateFirst: { hu: 'Először válasszon dátumot.', en: 'Please choose a date first.' },
  noSlots: { hu: 'Erre a napra már nincs foglalható időpont.', en: 'No bookable times available for this day.' },

  fullNameLabel: { hu: 'Teljes név', en: 'Full name' },
  fullNamePlaceholder: { hu: 'Kiss János', en: 'John Smith' },
  emailLabel: { hu: 'E-mail', en: 'Email' },
  emailPlaceholder: { hu: 'pelda@email.hu', en: 'example@email.com' },
  phoneLabel: { hu: 'Telefon', en: 'Phone' },
  phonePlaceholder: { hu: '30 123 4567', en: '30 123 4567' },
  messageLabel: { hu: 'Megjegyzés', en: 'Message' },
  messagePlaceholder: { hu: 'Különleges kérés, megjegyzés…', en: 'Special request, comment…' },

  submitBtn: { hu: 'Foglalás küldése', en: 'Send reservation' },
  submitting: { hu: 'Küldés…', en: 'Sending…' },

  consentLead: { hu: 'Elfogadom, hogy a foglalás kezeléséhez a megadott adataimat kezeljék', en: 'I agree that my submitted data may be processed for handling the reservation' },
  consentLinkPrefix: { hu: ' az ', en: ' according to the ' },
  consentLinkText: { hu: 'adatkezelési tájékoztató', en: 'privacy policy' },
  consentLinkSuffix: { hu: ' szerint', en: '' },

  successTitleConfirmed: { hu: 'Foglalás visszaigazolva!', en: 'Reservation confirmed!' },
  successTitlePending: { hu: 'Köszönjük!', en: 'Thank you!' },
  successBodyConfirmed: { hu: 'Visszaigazolót küldtünk emailben.', en: 'We sent a confirmation email.' },
  successBodyPending: { hu: 'Foglalási igényét megkaptuk. Kollégáink hamarosan visszaigazolják az asztalt.', en: 'We received your request. Our team will confirm your table shortly.' },

  errParty: { hu: 'A megadott létszám meghaladja a helyszín maximumát.', en: 'The party size exceeds the venue maximum.' },
  errDisabled: { hu: 'A helyszín jelenleg nem fogad foglalásokat.', en: 'The venue is currently not accepting reservations.' },
  errVenue: { hu: 'A helyszín nem található.', en: 'Venue not found.' },
  errRateLimit: { hu: 'Túl sok próbálkozás. Kérjük, várjon egy percet és próbálja újra.', en: 'Too many attempts. Please wait a minute and try again.' },
  errGeneric: { hu: 'Hiba történt. Kérjük, próbálja újra később.', en: 'An error occurred. Please try again later.' },
} as const

const detected: Lang = (document.documentElement.lang ?? '').toLowerCase().startsWith('hu') ? 'hu' : 'en'

export function t(key: keyof typeof STRINGS): string {
  return STRINGS[key][detected]
}

export function getLang(): Lang {
  return detected
}
