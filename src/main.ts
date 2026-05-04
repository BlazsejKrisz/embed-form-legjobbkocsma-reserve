import './style.css'
import { applyTheme, getParam } from './theme'
import { sendResize } from './resize'
import {
  fetchVenues,
  fetchAvailability,
  submitReservation,
  track,
  toErrorReason,
} from './api'
import type { Venue, Slot, ReservationResult } from './api'

applyTheme()

// ── URL params ────────────────────────────────────────────────────────────────

const USE_SLOTS = getParam('slots') === '1'
const VENUE_PARAM = getParam('venue')
const VENUE_GROUP_PARAM = getParam('venue_group')
const OPEN_PARAM = getParam('open') ?? '10:00'   // opening time, e.g. "12:00"
const CLOSE_PARAM = getParam('close') ?? '23:00'  // closing time, e.g. "23:00"

// ── State ─────────────────────────────────────────────────────────────────────

let venues: Venue[] = []
let venuesLoading = false
let venuesError = false

let selectedVenueSlug = VENUE_PARAM ?? ''
let date = ''
let time = ''
let partySize = ''
let fullName = ''
let email = ''
let phone = ''
let message = ''

let slots: Slot[] = []
let slotsLoading = false
let slotsError = false
let slotsEmpty = false
let useSlotPicker = false
let slotsRequestId = 0

let submitting = false
let result: ReservationResult | null = null
let submitError: string | null = null

// ── Helpers ───────────────────────────────────────────────────────────────────

function getVenue(): Venue | null {
  return venues.find(v => v.slug === selectedVenueSlug) ?? null
}

function isValid(): boolean {
  if (!selectedVenueSlug) return false
  if (!date) return false
  if (!time) return false
  if (!partySize || Number(partySize) < 1) return false
  if (!fullName.trim()) return false
  if (!email.trim() && !phone.trim()) return false
  return true
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function dateMax(): string | null {
  const v = getVenue()
  if (!v) return null
  const d = new Date()
  d.setDate(d.getDate() + v.venue_settings.max_advance_booking_days)
  return d.toISOString().slice(0, 10)
}

// Generates 30-min-step options between opening and the last bookable slot.
// Last slot = close - min_duration_minutes (e.g. close 23:00, min 60 min → last 22:00).
// For today: slots within min_notice_minutes from now are filtered out.
function generateTimeSlots(): string[] {
  const venue = getVenue()
  const minDuration = venue?.venue_settings.min_duration_minutes ?? 60
  const minNotice = venue?.venue_settings.min_notice_minutes ?? 60

  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const openMin = toMin(OPEN_PARAM)
  const lastSlotMin = toMin(CLOSE_PARAM) - minDuration

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const isToday = date !== '' && date === todayStr
  const cutoffMin = isToday ? now.getHours() * 60 + now.getMinutes() + minNotice : -Infinity

  const result: string[] = []
  for (let m = openMin; m <= lastSlotMin; m += 30) {
    if (m <= cutoffMin) continue
    result.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return result
}

// ── Mount point ───────────────────────────────────────────────────────────────

const app = document.getElementById('app')!

// ── Top-level render ──────────────────────────────────────────────────────────

function render(): void {
  app.innerHTML = ''

  if (result) {
    renderSuccess()
    return
  }

  // Show loading / error only when the venue selector needs data
  if (!VENUE_PARAM && venuesLoading) {
    const el = document.createElement('div')
    el.className = 'lk-loading'
    el.textContent = 'Betöltés…'
    app.appendChild(el)
    sendResize()
    return
  }

  if (!VENUE_PARAM && venuesError) {
    const el = document.createElement('p')
    el.className = 'lk-msg-error'
    el.style.padding = '8px 0'
    el.textContent = 'Nem sikerült betölteni az adatokat. Frissítse az oldalt.'
    app.appendChild(el)
    sendResize()
    return
  }

  const form = buildForm()
  app.appendChild(form)
  updateTimeContent()
  updateSubmitBtn()
  sendResize()
}

function renderSuccess(): void {
  const r = result!
  const confirmed = r.status === 'confirmed'

  const wrap = document.createElement('div')
  wrap.className = 'lk-success'

  const icon = document.createElement('div')
  icon.className = 'lk-success-icon'
  icon.innerHTML =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
  wrap.appendChild(icon)

  const title = document.createElement('p')
  title.className = 'lk-success-title'
  title.textContent = confirmed ? 'Foglalás visszaigazolva!' : 'Köszönjük!'
  wrap.appendChild(title)

  const body = document.createElement('p')
  body.className = 'lk-success-body'
  body.textContent = confirmed
    ? `Visszaigazolót küldtünk emailben. (#${r.reservation_id})`
    : 'Foglalási igényét megkaptuk. Kollégáink hamarosan visszaigazolják az asztalt.'
  wrap.appendChild(body)

  app.appendChild(wrap)
  sendResize()
}

// ── Form builder ──────────────────────────────────────────────────────────────

function buildForm(): HTMLFormElement {
  const form = document.createElement('form')
  form.className = 'lk-form'
  form.id = 'lk-form'
  form.noValidate = true

  // Venue selector (hidden when venue is pre-set via URL param)
  if (!VENUE_PARAM) {
    form.appendChild(buildVenueField())
  }

  // Date + Party size
  const row1 = document.createElement('div')
  row1.className = 'lk-row lk-row--date-party'
  row1.appendChild(buildDateField())
  row1.appendChild(buildPartySizeField())
  form.appendChild(row1)

  // Time / slot picker
  form.appendChild(buildTimeField())

  // Full name
  form.appendChild(buildInputField('lk-full-name', 'Teljes név', 'text', 'Kiss János', true, () => fullName, v => { fullName = v }))

  // Email + Phone
  const row2 = document.createElement('div')
  row2.className = 'lk-row lk-row--contact'
  row2.appendChild(buildInputField('lk-email', 'E-mail', 'email', 'pelda@email.hu', false, () => email, v => { email = v }))
  row2.appendChild(buildInputField('lk-phone', 'Telefon', 'tel', '+36301234567', false, () => phone, v => { phone = v }))
  form.appendChild(row2)

  // Message
  form.appendChild(buildMessageField())

  // Note about email/phone requirement
  const note = document.createElement('p')
  note.className = 'lk-note'
  note.textContent = '* E-mail vagy telefonszám megadása kötelező.'
  form.appendChild(note)

  // Submit area
  const submitWrap = document.createElement('div')
  submitWrap.className = 'lk-field lk-field--submit'
  submitWrap.id = 'lk-submit-wrap'

  const btn = document.createElement('button')
  btn.type = 'submit'
  btn.className = 'lk-btn'
  btn.id = 'lk-submit'
  btn.textContent = 'Foglalás küldése'
  submitWrap.appendChild(btn)
  form.appendChild(submitWrap)

  form.addEventListener('submit', handleSubmit)
  return form
}

// ── Field builders ────────────────────────────────────────────────────────────

function buildVenueField(): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'lk-field lk-field--venue'

  const label = document.createElement('label')
  label.htmlFor = 'lk-venue'
  label.className = 'lk-label lk-label--venue'
  label.innerHTML = 'Helyszín <span class="lk-req">*</span>'
  wrap.appendChild(label)

  const select = document.createElement('select')
  select.className = 'lk-select'
  select.id = 'lk-venue'

  const placeholder = new Option('Válasszon helyszínt…', '')
  select.appendChild(placeholder)

  // Populate or show loading/error
  if (venuesLoading) {
    select.disabled = true
    placeholder.text = 'Betöltés…'
  } else if (venuesError) {
    select.disabled = true
    placeholder.text = 'Nem sikerült betölteni a helyszíneket.'
  } else {
    for (const v of venues) {
      select.appendChild(new Option(v.name, v.slug))
    }
    if (selectedVenueSlug) select.value = selectedVenueSlug
  }

  select.addEventListener('change', () => {
    selectedVenueSlug = select.value
    // Reset date/time/slots when venue changes
    date = ''
    time = ''
    slots = []
    slotsLoading = false
    slotsError = false
    slotsEmpty = false
    useSlotPicker = false
    render()
  })

  wrap.appendChild(select)
  return wrap
}

function buildDateField(): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'lk-field lk-field--date'

  const label = document.createElement('label')
  label.htmlFor = 'lk-date'
  label.className = 'lk-label lk-label--date'
  label.innerHTML = 'Dátum <span class="lk-req">*</span>'
  wrap.appendChild(label)

  const input = document.createElement('input')
  input.type = 'date'
  input.className = 'lk-input'
  input.id = 'lk-date'
  input.min = today()
  const max = dateMax()
  if (max) input.max = max
  if (date) input.value = date

  input.addEventListener('change', () => {
    date = input.value
    time = ''
    // Reset slots for new date
    slots = []
    slotsLoading = false
    slotsError = false
    slotsEmpty = false
    useSlotPicker = false
    maybeFetchSlots()
    updateTimeContent()
    updateSubmitBtn()
  })

  wrap.appendChild(input)
  return wrap
}

function buildPartySizeField(): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'lk-field lk-field--party-size'

  const label = document.createElement('label')
  label.htmlFor = 'lk-party'
  label.className = 'lk-label lk-label--party-size'
  label.innerHTML = 'Létszám <span class="lk-req">*</span>'
  wrap.appendChild(label)

  const input = document.createElement('input')
  input.type = 'number'
  input.className = 'lk-input'
  input.id = 'lk-party'
  input.min = '1'
  input.placeholder = '1'
  if (partySize) input.value = partySize
  const v = getVenue()
  if (v) input.max = String(v.venue_settings.max_party_size)

  input.addEventListener('input', () => {
    partySize = input.value
    time = ''
    slots = []
    slotsLoading = false
    slotsError = false
    slotsEmpty = false
    useSlotPicker = false
    maybeFetchSlots()
    updateTimeContent()
    updateSubmitBtn()
  })

  wrap.appendChild(input)
  return wrap
}

function buildTimeField(): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'lk-field lk-field--time'

  const label = document.createElement('label')
  label.htmlFor = 'lk-time'
  label.className = 'lk-label lk-label--time'
  label.innerHTML = 'Időpont <span class="lk-req">*</span>'
  wrap.appendChild(label)

  const content = document.createElement('div')
  content.id = 'lk-time-content'
  wrap.appendChild(content)

  return wrap
}

function buildInputField(
  id: string,
  labelText: string,
  type: string,
  placeholder: string,
  required: boolean,
  getValue: () => string,
  setValue: (v: string) => void,
): HTMLElement {
  const slug = id.replace('lk-', '')
  const wrap = document.createElement('div')
  wrap.className = `lk-field lk-field--${slug}`

  const label = document.createElement('label')
  label.htmlFor = id
  label.className = `lk-label lk-label--${slug}`
  label.innerHTML = required
    ? `${labelText} <span class="lk-req">*</span>`
    : labelText
  wrap.appendChild(label)

  const input = document.createElement('input')
  input.type = type
  input.className = 'lk-input'
  input.id = id
  input.placeholder = placeholder
  input.value = getValue()
  if (type === 'email') input.autocomplete = 'email'
  else if (type === 'tel') input.autocomplete = 'tel'
  else input.autocomplete = 'name'

  input.addEventListener('input', () => {
    setValue(input.value)
    updateSubmitBtn()
  })

  wrap.appendChild(input)
  return wrap
}

function buildMessageField(): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'lk-field lk-field--message'

  const label = document.createElement('label')
  label.htmlFor = 'lk-message'
  label.className = 'lk-label lk-label--message'
  label.textContent = 'Megjegyzés'
  wrap.appendChild(label)

  const textarea = document.createElement('textarea')
  textarea.className = 'lk-textarea'
  textarea.id = 'lk-message'
  textarea.placeholder = 'Különleges kérés, megjegyzés…'
  textarea.value = message

  textarea.addEventListener('input', () => {
    message = textarea.value
  })

  wrap.appendChild(textarea)
  return wrap
}

// ── Targeted updates (no full re-render) ──────────────────────────────────────

function updateTimeContent(): void {
  const content = document.getElementById('lk-time-content')
  if (!content) return
  content.innerHTML = ''

  if (USE_SLOTS && slotsLoading) {
    const wrap = document.createElement('div')
    wrap.className = 'lk-slots-loading'
    wrap.innerHTML = '<div class="lk-spinner"></div><span>Időpontok betöltése…</span>'
    content.appendChild(wrap)
    sendResize()
    return
  }

  if (USE_SLOTS && useSlotPicker && slots.length > 0) {
    const select = document.createElement('select')
    select.className = 'lk-select'
    select.id = 'lk-time'
    select.appendChild(new Option('Válasszon időpontot…', ''))

    for (const slot of slots) {
      const label = new Date(slot.starts_at).toLocaleTimeString('hu-HU', {
        hour: '2-digit',
        minute: '2-digit',
      })
      select.appendChild(new Option(label, slot.starts_at))
    }

    if (time) select.value = time

    select.addEventListener('change', () => {
      time = select.value
      updateSubmitBtn()
    })

    content.appendChild(select)
    sendResize()
    return
  }

  // Informational messages when slots=1 returns nothing usable
  if (USE_SLOTS && slotsEmpty) {
    const msg = document.createElement('p')
    msg.className = 'lk-msg-muted'
    msg.style.marginBottom = '6px'
    msg.textContent = 'Erre a napra nincs szabad időpont, de igényét így is elküldheti.'
    content.appendChild(msg)
  }

  if (USE_SLOTS && slotsError) {
    const msg = document.createElement('p')
    msg.className = 'lk-msg-error'
    msg.style.marginBottom = '6px'
    msg.textContent = 'Nem sikerült betölteni az időpontokat.'
    content.appendChild(msg)
  }

  // Generated 30-min-step select (default mode, or fallback when slots=1 fails/empty)
  const timeOptions = generateTimeSlots()

  if (timeOptions.length === 0) {
    const msg = document.createElement('p')
    msg.className = 'lk-msg-muted'
    msg.textContent = 'Erre a napra már nincs foglalható időpont.'
    content.appendChild(msg)
    sendResize()
    return
  }

  const select = document.createElement('select')
  select.className = 'lk-select lk-select--time'
  select.id = 'lk-time'
  select.appendChild(new Option('Válasszon időpontot…', ''))

  for (const t of timeOptions) {
    select.appendChild(new Option(t, t))
  }

  if (time && timeOptions.includes(time)) select.value = time

  select.addEventListener('change', () => {
    time = select.value
    updateSubmitBtn()
  })

  content.appendChild(select)
  sendResize()
}

function updateSubmitBtn(): void {
  const btn = document.getElementById('lk-submit') as HTMLButtonElement | null
  if (!btn) return
  btn.disabled = !isValid() || submitting
  btn.textContent = submitting ? 'Küldés…' : 'Foglalás küldése'
}

function setSubmitError(msg: string | null): void {
  const wrap = document.getElementById('lk-submit-wrap')
  if (!wrap) return

  const existing = wrap.querySelector('.lk-msg-error')
  if (existing) existing.remove()

  if (msg) {
    const el = document.createElement('p')
    el.className = 'lk-msg-error'
    el.textContent = msg
    wrap.appendChild(el)
    sendResize()
  }
}

// ── Slot fetch ────────────────────────────────────────────────────────────────

async function maybeFetchSlots(): Promise<void> {
  if (!USE_SLOTS) return

  const reqVenue = selectedVenueSlug
  const reqDate = date
  const reqParty = Number(partySize)

  if (!reqVenue || !reqDate || !reqParty || reqParty < 1) {
    // Not enough data yet — plain input already shown via updateTimeContent
    return
  }

  const reqId = ++slotsRequestId
  slotsLoading = true
  slotsError = false
  slotsEmpty = false
  useSlotPicker = false
  slots = []
  updateTimeContent()

  try {
    const fetched = await fetchAvailability(reqVenue, reqDate, reqParty)
    if (reqId !== slotsRequestId) return // Stale response

    slots = fetched
    slotsLoading = false

    if (fetched.length === 0) {
      slotsEmpty = true
      useSlotPicker = false
      track('slots_empty')
    } else {
      useSlotPicker = true
      track('slots_loaded', { slot_count: fetched.length })
    }
  } catch {
    if (reqId !== slotsRequestId) return

    slotsLoading = false
    slotsError = true
    useSlotPicker = false
    track('error', { code: 0, reason: 'unknown' })
  }

  updateTimeContent()
  updateSubmitBtn()
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function handleSubmit(e: Event): Promise<void> {
  e.preventDefault()
  if (!isValid() || submitting) return

  submitting = true
  submitError = null
  updateSubmitBtn()
  setSubmitError(null)

  // Slot picker gives a UTC ISO string from the API directly.
  // Manual input: "YYYY-MM-DD" + "HH:MM" parsed as local time → converted to UTC ISO with Z.
  const startsAt = USE_SLOTS && useSlotPicker
    ? time
    : new Date(`${date}T${time}:00`).toISOString()

  const payload = {
    venue_slug: selectedVenueSlug,
    starts_at: startsAt,
    party_size: Number(partySize),
    customer: {
      full_name: fullName.trim(),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
    },
    ...(message.trim() ? { message: message.trim() } : {}),
  }

  try {
    const res = await submitReservation(payload)
    submitting = false
    result = res

    track('submit', { status: res.status })
    window.parent.postMessage({ type: 'lk:confirmed', reservation_id: res.reservation_id, status: res.status }, '*')

    render()
  } catch (err: unknown) {
    submitting = false
    const e = err as Error & { status?: number }
    const status = e.status ?? 0
    const msg = e.message ?? ''
    const reason = toErrorReason(status, msg)

    track('error', { code: status, reason })

    if (reason === 'party_size_exceeded') {
      submitError = 'A megadott létszám meghaladja a helyszín maximumát.'
    } else if (reason === 'booking_disabled') {
      submitError = 'A helyszín jelenleg nem fogad foglalásokat.'
    } else if (reason === 'venue_not_found') {
      submitError = 'A helyszín nem található.'
    } else {
      submitError = 'Hiba történt. Kérjük, próbálja újra később.'
    }

    updateSubmitBtn()
    setSubmitError(submitError)
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init(): Promise<void> {
  track('load', VENUE_PARAM ? { venue_slug: VENUE_PARAM } : {})

  venuesLoading = true
  render() // Show loading state immediately

  try {
    // When venue is pre-set, fetch all venues (no group filter) to get venue settings.
    // When selector is shown, apply group filter if provided.
    const groupSlug = VENUE_PARAM ? undefined : (VENUE_GROUP_PARAM ?? undefined)
    venues = await fetchVenues(groupSlug)
    venuesLoading = false
  } catch {
    venuesLoading = false
    venuesError = true
  }

  render() // Re-render with venues loaded
}

init()
