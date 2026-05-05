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

export interface Slot {
  starts_at: string
  ends_at: string
}

export interface ReservationPayload {
  venue_slug: string
  starts_at: string
  party_size: number
  customer: {
    full_name: string
    email?: string
    phone?: string
  }
  message?: string
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

export async function fetchAvailability(
  venueSlug: string,
  date: string,
  partySize: number,
): Promise<Slot[]> {
  const url = new URL(`${base}/availability`)
  url.searchParams.set('venue_slug', venueSlug)
  url.searchParams.set('date', date)
  url.searchParams.set('party_size', String(partySize))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`availability:${res.status}`)
  const json = await res.json()
  return json.slots as Slot[]
}

export async function submitReservation(payload: ReservationPayload): Promise<ReservationResult> {
  const res = await fetch(`${base}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let message = ''
    try {
      const json = await res.json()
      message = (json.message as string) ?? (json.error as string) ?? ''
    } catch { /* empty */ }
    const err = new Error(message || String(res.status)) as Error & { status: number }
    err.status = res.status
    throw err
  }
  return res.json() as Promise<ReservationResult>
}

function getDomain(): string {
  try {
    return new URL(document.referrer).hostname
  } catch {
    return 'direct'
  }
}

export function toErrorReason(status: number, message: string): string {
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
