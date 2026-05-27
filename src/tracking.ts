// Enhanced conversion tracking — mirrors the Habibi reservation form spec so the
// same GTM tags/triggers (event: "enhanced_form_submission") work for both forms.
// The form is injected directly into the host page (no iframe), so window.dataLayer
// here IS the host page's dataLayer.

export type TrackingIdentity = {
  firstName: string
  lastName: string
  email: string
  phone: string // E.164, e.g. +36301234567
  partySize: number
  formId: string
  location?: string
}

async function sha256Hex(input: string): Promise<string | null> {
  // crypto.subtle requires a secure context (https) — host pages always are.
  if (!window.crypto?.subtle) return null
  const data = new TextEncoder().encode(input)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function splitEmailVariants(email: string): {
  emailForMeta: string
  emailForGoogle: string
  emailForGoogleWithDomain: string
} {
  const emailLower = email.trim().toLowerCase()
  const parts = emailLower.split('@')
  if (parts.length !== 2) {
    return {
      emailForMeta: emailLower,
      emailForGoogle: emailLower,
      emailForGoogleWithDomain: emailLower,
    }
  }

  const [localPartRaw, domain] = parts
  const localPart = localPartRaw.trim()
  const localPartCanonical =
    domain === 'gmail.com' || domain === 'googlemail.com'
      ? localPart.split('+')[0].replace(/\./g, '')
      : localPart

  const emailForGoogleWithDomain = `${localPartCanonical}@${domain}`
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // PPC requirement: Google variant without domain for gmail/googlemail.
    return {
      emailForMeta: emailLower,
      emailForGoogle: localPartCanonical,
      emailForGoogleWithDomain,
    }
  }

  return {
    emailForMeta: emailLower,
    emailForGoogle: emailLower,
    emailForGoogleWithDomain,
  }
}

function normalizePhoneE164(phone: string): string {
  return phone.trim().replace(/[\s().-]/g, '')
}

function sanitizePhoneForMeta(phoneE164: string): string {
  return phoneE164.replace(/^\+/, '')
}

export async function pushEnhancedFormSubmission(data: TrackingIdentity): Promise<void> {
  if (typeof window === 'undefined') return

  const firstNameNorm = data.firstName.trim().toLowerCase()
  const lastNameNorm = data.lastName.trim().toLowerCase()
  const emailNorm = data.email.trim().toLowerCase()
  const { emailForMeta, emailForGoogle, emailForGoogleWithDomain } = splitEmailVariants(emailNorm)
  const phoneE164 = normalizePhoneE164(data.phone)
  const metaPhone = sanitizePhoneForMeta(phoneE164)

  const [
    hashedFirstName,
    hashedLastName,
    hashedEmail,
    hashedGoogleEmail,
    hashedPhone,
    hashedMetaPhone,
    hashedMetaEmail,
    hashedGoogleEmailWithDomain,
  ] = await Promise.all([
    sha256Hex(firstNameNorm),
    sha256Hex(lastNameNorm),
    sha256Hex(emailNorm),
    sha256Hex(emailForGoogle),
    sha256Hex(phoneE164),
    sha256Hex(metaPhone),
    sha256Hex(emailForMeta),
    sha256Hex(emailForGoogleWithDomain),
  ])

  const w = window as Window & {
    dataLayer?: Array<Record<string, unknown>>
  }

  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({
    event: 'enhanced_form_submission',
    firstname: firstNameNorm,
    lastname: lastNameNorm,
    email: emailNorm,
    email_google: emailForGoogle,
    email_google_with_domain: emailForGoogleWithDomain,
    fbemailhashed: hashedMetaEmail,
    phone: phoneE164,
    phone_e164: phoneE164,
    phone_no_plus: metaPhone,
    fbphone: metaPhone,
    fbphonehashed: hashedMetaPhone,
    hashedFirstName,
    hashedLastName,
    hashedEmail,
    hashedGoogleEmail,
    hashedPhone,
    hashedGoogleEmailWithDomain,
    party_size: data.partySize,
    formid: data.formId,
    location: data.location,
  })
}
