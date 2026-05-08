export interface VenueSettings {
  booking_enabled: boolean
  min_notice_minutes: number
  max_advance_booking_days: number
  min_duration_minutes: number
  max_duration_minutes: number
  max_party_size: number
  open_time?: string
  close_time?: string
}

export interface Venue {
  id: number
  name: string
  slug: string
  venue_settings: VenueSettings
}

export interface ReservationPayload {
  venue_slug: string
  starts_at: string
  party_size: number
  customer: {
    full_name: string
    email: string
    phone: string
  }
  message?: string
  consents?: {
    reservation_data_processing: boolean
    reservation_data_processing_text: string
    privacy_url?: string
  }
  _hp?: string
}

export interface ReservationResult {
  reservation_id: number
  status: 'confirmed' | 'pending_manual_review'
  venue_name: string
  starts_at: string
  ends_at: string
  party_size: number
}

const base = (import.meta.env.VITE_API_BASE as string).replace(/\/$/, '')

export async function fetchVenues(groupSlug?: string): Promise<Venue[]> {
  const url = new URL(`${base}/venues`)
  if (groupSlug) url.searchParams.set('group_slug', groupSlug)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`venues:${res.status}`)
  const json = await res.json()
  return json.data as Venue[]
}

export async function submitReservation(payload: ReservationPayload): Promise<ReservationResult> {
  console.log('[lk] POST /reservations payload:', payload)
  const res = await fetch(`${base}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  console.log('[lk] response status:', res.status)
  if (!res.ok) {
    let body: unknown = null
    try { body = await res.json() } catch { /* empty */ }
    console.error('[lk] error body:', body)
    const message = (body as { message?: string; error?: string } | null)?.message
      ?? (body as { error?: string } | null)?.error
      ?? ''
    const err = new Error(message || String(res.status)) as Error & { status: number; body?: unknown }
    err.status = res.status
    err.body = body
    throw err
  }
  const json = await res.json()
  console.log('[lk] success body:', json)
  return json as ReservationResult
}

function getDomain(): string {
  try {
    return new URL(document.referrer).hostname
  } catch {
    return 'direct'
  }
}

export function toErrorReason(status: number, message: string): string {
  if (status === 429) return 'too_many_requests'
  if (status === 422 && message.includes('party size')) return 'party_size_exceeded'
  if (status === 422 && message.includes('not accepting')) return 'booking_disabled'
  if (status === 404) return 'venue_not_found'
  if (status === 400) return 'invalid_payload'
  return 'unknown'
}

export function track(event: string, extra: Record<string, unknown> = {}): void {
  const payload = { event, domain: getDomain(), ...extra }
  fetch(`${base}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => { /* fire-and-forget */ })
}
