import rawCSS from './style.css?raw'
import {
  fetchVenues,
  fetchAvailability,
  submitReservation,
  track,
  toErrorReason,
} from './api'
import type { Venue, Slot, ReservationResult } from './api'

// Inject styles once per page load
if (!document.getElementById('lk-embed-styles')) {
  const styleEl = document.createElement('style')
  styleEl.id = 'lk-embed-styles'
  styleEl.textContent = rawCSS
  document.head.appendChild(styleEl)
}

interface AppConfig {
  venueSlug: string | null
  venueGroup: string | null
  useSlots: boolean
  open: string
  close: string
  privacyUrl: string | null
}

function mountApp(container: HTMLElement, cfg: AppConfig): void {
  const USE_SLOTS = cfg.useSlots
  const VENUE_PARAM = cfg.venueSlug
  const VENUE_GROUP_PARAM = cfg.venueGroup
  const OPEN_PARAM = cfg.open
  const CLOSE_PARAM = cfg.close
  const PRIVACY_URL = cfg.privacyUrl

  // ── State ─────────────────────────────────────────────────────────────

  let venues: Venue[] = []
  let venuesLoading = false
  let venuesError = false

  let selectedVenueSlug = VENUE_PARAM ?? ''
  let date = todayStr()
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

  let honeypot = ''
  let gdprAccepted = false
  let venueNotFound = false
  let venueGroupNotFound = false

  let submitting = false
  let result: ReservationResult | null = null
  let submitError: string | null = null

  // ── Helpers ───────────────────────────────────────────────────────────

  function getVenue(): Venue | null {
    return venues.find(v => v.slug === selectedVenueSlug) ?? null
  }

  // Removes ASCII control characters (null bytes, etc.) and trims to max length.
  // Not a replacement for backend sanitization — just a first line of defence.
  function sanitize(s: string, max: number): string {
    // eslint-disable-next-line no-control-regex
    return s.trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, max)
  }

  function isEmailValid(v: string): boolean {
    return v === '' || /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(v)
  }

  function isPhoneValid(v: string): boolean {
    return v === '' || /^\+?[\d\s\-(). ]{6,20}$/.test(v)
  }

  function isValid(): boolean {
    if (!selectedVenueSlug) return false
    if (!date) return false
    if (!time) return false
    if (!gdprAccepted) return false
    const ps = Number(partySize)
    if (!partySize || !Number.isInteger(ps) || ps < 1 || ps > 500) return false
    if (!fullName.trim() || fullName.trim().length > 100) return false
    const em = email.trim()
    const ph = phone.trim()
    if (!em && !ph) return false
    if (em && !isEmailValid(em)) return false
    if (ph && !isPhoneValid(ph)) return false
    return true
  }

  function todayStr(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function dateMax(): string | null {
    const v = getVenue()
    if (!v) return null
    const d = new Date()
    d.setDate(d.getDate() + v.venue_settings.max_advance_booking_days)
    return d.toISOString().slice(0, 10)
  }

  function generateTimeSlots(): string[] {
    const venue = getVenue()
    const minDuration = venue?.venue_settings.min_duration_minutes ?? 60
    const minNotice = venue?.venue_settings.min_notice_minutes ?? 60

    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }

    const open = venue?.venue_settings.open_time ?? OPEN_PARAM
    const close = venue?.venue_settings.close_time ?? CLOSE_PARAM
    const openMin = toMin(open)
    const lastSlotMin = toMin(close) - minDuration

    const now = new Date()
    const isToday = date !== '' && date === todayStr()
    const cutoffMin = isToday ? now.getHours() * 60 + now.getMinutes() + minNotice : -Infinity

    const out: string[] = []
    for (let m = openMin; m <= lastSlotMin; m += 30) {
      if (m <= cutoffMin) continue
      out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
    }
    return out
  }

  function emit(type: string, detail: Record<string, unknown>): void {
    container.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }))
    // Also fire postMessage for iframe consumers
    window.parent.postMessage({ type, ...detail }, '*')
  }

  async function sha256Hex(value: string): Promise<string | null> {
    if (!window.crypto?.subtle) return null
    const bytes = new TextEncoder().encode(value)
    const digest = await window.crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  async function buildEnhancedConversions(): Promise<Record<string, string>> {
    const out: Record<string, string> = {}
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPhone = phone.trim().replace(/[^\d+]/g, '')

    if (normalizedEmail) {
      const emailHash = await sha256Hex(normalizedEmail)
      if (emailHash) out.email_sha256 = emailHash
    }

    if (normalizedPhone) {
      const phoneHash = await sha256Hex(normalizedPhone)
      if (phoneHash) out.phone_sha256 = phoneHash
    }

    return out
  }

  // ── Render ────────────────────────────────────────────────────────────

  function render(): void {
    container.innerHTML = ''

    if (result) {
      renderSuccess()
      return
    }

    if (venuesLoading) {
      const el = document.createElement('div')
      el.className = 'lk-loading'
      el.textContent = 'Betöltés…'
      container.appendChild(el)
      return
    }

    if (!VENUE_PARAM && venuesError) {
      const el = document.createElement('p')
      el.className = 'lk-msg-error'
      el.style.padding = '8px 0'
      el.textContent = 'Nem sikerült betölteni az adatokat. Frissítse az oldalt.'
      container.appendChild(el)
      return
    }

    if (venueNotFound) {
      const el = document.createElement('p')
      el.className = 'lk-msg-error'
      el.style.padding = '8px 0'
      el.textContent = `Helyszín nem található: "${VENUE_PARAM}"`
      container.appendChild(el)
      return
    }

    if (venueGroupNotFound) {
      const el = document.createElement('p')
      el.className = 'lk-msg-error'
      el.style.padding = '8px 0'
      el.textContent = `Helyszíncsoport nem található: "${VENUE_GROUP_PARAM}"`
      container.appendChild(el)
      return
    }

    container.appendChild(buildForm())
    updateTimeContent()
    updateSubmitBtn()
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

    container.appendChild(wrap)
  }

  // ── Form builder ──────────────────────────────────────────────────────

  function buildForm(): HTMLFormElement {
    const form = document.createElement('form')
    form.className = 'lk-form'
    form.id = 'lk-form'
    form.noValidate = true

    if (!VENUE_PARAM) form.appendChild(buildVenueField())

    const row1 = document.createElement('div')
    row1.className = 'lk-row lk-row--date-party'
    row1.appendChild(buildDateField())
    row1.appendChild(buildPartySizeField())
    form.appendChild(row1)

    form.appendChild(buildTimeField())
    form.appendChild(buildInputField('lk-full-name', 'Teljes név', 'text', 'Kiss János', true, () => fullName, v => { fullName = v }))

    const row2 = document.createElement('div')
    row2.className = 'lk-row lk-row--contact'
    row2.appendChild(buildInputField('lk-email', 'E-mail', 'email', 'pelda@email.hu', false, () => email, v => { email = v }))
    row2.appendChild(buildInputField('lk-phone', 'Telefon', 'tel', '+36301234567', false, () => phone, v => { phone = v }))
    form.appendChild(row2)

    form.appendChild(buildMessageField())
    form.appendChild(buildGdprField())

    const note = document.createElement('p')
    note.className = 'lk-note'
    note.textContent = '* E-mail vagy telefonszám megadása kötelező.'
    form.appendChild(note)

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

    form.appendChild(buildHoneypotField())
    form.addEventListener('submit', handleSubmit)
    return form
  }

  function buildHoneypotField(): HTMLElement {
    const wrap = document.createElement('div')
    wrap.className = 'lk-hp'
    wrap.setAttribute('aria-hidden', 'true')

    const label = document.createElement('label')
    label.htmlFor = 'lk-website'
    label.textContent = 'Website'
    wrap.appendChild(label)

    const input = document.createElement('input')
    input.type = 'text'
    input.id = 'lk-website'
    input.name = 'website'
    input.tabIndex = -1
    input.autocomplete = 'off'
    input.addEventListener('input', () => { honeypot = input.value })
    wrap.appendChild(input)

    return wrap
  }

  // ── Field builders ────────────────────────────────────────────────────

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
    select.appendChild(new Option('Válasszon helyszínt…', ''))

    if (venuesLoading) {
      select.disabled = true
      select.options[0].text = 'Betöltés…'
    } else if (venuesError) {
      select.disabled = true
      select.options[0].text = 'Nem sikerült betölteni a helyszíneket.'
    } else {
      for (const v of venues) select.appendChild(new Option(v.name, v.slug))
      if (selectedVenueSlug) select.value = selectedVenueSlug
    }

    select.addEventListener('change', () => {
      selectedVenueSlug = select.value
      date = ''; time = ''; slots = []
      slotsLoading = false; slotsError = false; slotsEmpty = false; useSlotPicker = false
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
    input.min = todayStr()
    const max = dateMax()
    if (max) input.max = max
    if (date) input.value = date

    input.addEventListener('change', () => {
      date = input.value
      time = ''; slots = []
      slotsLoading = false; slotsError = false; slotsEmpty = false; useSlotPicker = false
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
      time = ''; slots = []
      slotsLoading = false; slotsError = false; slotsEmpty = false; useSlotPicker = false
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
    if (type === 'email') { input.autocomplete = 'email'; input.maxLength = 254 }
    else if (type === 'tel') { input.autocomplete = 'tel'; input.maxLength = 20 }
    else { input.autocomplete = 'name'; input.maxLength = 100 }

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
    textarea.maxLength = 1000
    textarea.value = message

    textarea.addEventListener('input', () => { message = textarea.value })

    wrap.appendChild(textarea)
    return wrap
  }

  function buildGdprField(): HTMLElement {
    const wrap = document.createElement('div')
    wrap.className = 'lk-consent lk-consent--gdpr'

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.className = 'lk-checkbox'
    input.id = 'lk-gdpr'
    input.checked = gdprAccepted

    const label = document.createElement('label')
    label.className = 'lk-consent-label'
    label.htmlFor = 'lk-gdpr'

    label.append('Elfogadom, hogy a foglalás kezeléséhez a megadott adataimat kezeljék')
    if (PRIVACY_URL) {
      label.append(' az ')
      const link = document.createElement('a')
      link.href = PRIVACY_URL
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.textContent = 'adatkezelési tájékoztató'
      label.appendChild(link)
      label.append(' szerint')
    }
    label.append('.')

    input.addEventListener('change', () => {
      gdprAccepted = input.checked
      updateSubmitBtn()
    })

    wrap.appendChild(input)
    wrap.appendChild(label)
    return wrap
  }

  // ── Targeted updates ──────────────────────────────────────────────────

  function updateTimeContent(): void {
    const content = document.getElementById('lk-time-content')
    if (!content) return
    content.innerHTML = ''

    if (!date) {
      const msg = document.createElement('p')
      msg.className = 'lk-msg-muted'
      msg.textContent = 'Először válasszon dátumot.'
      content.appendChild(msg)
      return
    }

    if (USE_SLOTS && slotsLoading) {
      const wrap = document.createElement('div')
      wrap.className = 'lk-slots-loading'
      wrap.innerHTML = '<div class="lk-spinner"></div><span>Időpontok betöltése…</span>'
      content.appendChild(wrap)
      return
    }

    if (USE_SLOTS && useSlotPicker && slots.length > 0) {
      const select = document.createElement('select')
      select.className = 'lk-select lk-select--slots'
      select.id = 'lk-time'
      select.appendChild(new Option('Válasszon időpontot…', ''))

      for (const slot of slots) {
        const label = new Date(slot.starts_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })
        select.appendChild(new Option(label, slot.starts_at))
      }

      if (time) select.value = time
      select.addEventListener('change', () => { time = select.value; updateSubmitBtn() })
      content.appendChild(select)
      return
    }

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

    // Generated 30-min select
    const timeOptions = generateTimeSlots()

    if (timeOptions.length === 0) {
      const msg = document.createElement('p')
      msg.className = 'lk-msg-muted'
      msg.textContent = 'Erre a napra már nincs foglalható időpont.'
      content.appendChild(msg)
      return
    }

    const select = document.createElement('select')
    select.className = 'lk-select lk-select--time'
    select.id = 'lk-time'
    select.appendChild(new Option('Válasszon időpontot…', ''))
    for (const t of timeOptions) select.appendChild(new Option(t, t))
    if (time && timeOptions.includes(time)) select.value = time
    select.addEventListener('change', () => { time = select.value; updateSubmitBtn() })
    content.appendChild(select)
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
    wrap.querySelector('.lk-msg-error')?.remove()
    if (msg) {
      const el = document.createElement('p')
      el.className = 'lk-msg-error'
      el.textContent = msg
      wrap.appendChild(el)
    }
  }

  // ── Slot fetch ────────────────────────────────────────────────────────

  async function maybeFetchSlots(): Promise<void> {
    if (!USE_SLOTS) return

    const reqVenue = selectedVenueSlug
    const reqDate = date
    const reqParty = Number(partySize)

    if (!reqVenue || !reqDate || !reqParty || reqParty < 1) return

    const reqId = ++slotsRequestId
    slotsLoading = true; slotsError = false; slotsEmpty = false; useSlotPicker = false; slots = []
    updateTimeContent()

    try {
      const fetched = await fetchAvailability(reqVenue, reqDate, reqParty)
      if (reqId !== slotsRequestId) return

      slots = fetched
      slotsLoading = false

      if (fetched.length === 0) {
        slotsEmpty = true; useSlotPicker = false
        track('slots_empty')
      } else {
        useSlotPicker = true
        track('slots_loaded', { slot_count: fetched.length })
      }
    } catch {
      if (reqId !== slotsRequestId) return
      slotsLoading = false; slotsError = true; useSlotPicker = false
      track('error', { code: 0, reason: 'unknown' })
    }

    updateTimeContent()
    updateSubmitBtn()
  }

  // ── Submit ────────────────────────────────────────────────────────────

  async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault()
    if (!isValid() || submitting) return

    submitting = true
    submitError = null
    updateSubmitBtn()
    setSubmitError(null)

    const startsAt = USE_SLOTS && useSlotPicker
      ? time
      : new Date(`${date}T${time}:00`).toISOString()

    const payload = {
      venue_slug: selectedVenueSlug,
      starts_at: startsAt,
      party_size: Number(partySize),
      customer: {
        full_name: sanitize(fullName, 100),
        ...(email.trim() ? { email: sanitize(email, 254) } : {}),
        ...(phone.trim() ? { phone: sanitize(phone, 20) } : {}),
      },
      ...(message.trim() ? { message: sanitize(message, 1000) } : {}),
      consents: {
        reservation_data_processing: true,
        reservation_data_processing_text: 'Elfogadom, hogy a foglalás kezeléséhez a megadott adataimat kezeljék.',
        ...(PRIVACY_URL ? { privacy_url: PRIVACY_URL } : {}),
      },
      _hp: honeypot,
    }

    try {
      const res = await submitReservation(payload)
      submitting = false
      result = res

      track('submit', { status: res.status })
      const enhancedConversions = await buildEnhancedConversions()
      emit('lk:confirmed', {
        reservation_id: res.reservation_id,
        status: res.status,
        ...(Object.keys(enhancedConversions).length > 0
          ? { enhanced_conversions: enhancedConversions }
          : {}),
      })

      render()
    } catch (err: unknown) {
      submitting = false
      const e = err as Error & { status?: number }
      const status = e.status ?? 0
      const msg = e.message ?? ''
      const reason = toErrorReason(status, msg)

      track('error', { code: status, reason })

      if (reason === 'party_size_exceeded') submitError = 'A megadott létszám meghaladja a helyszín maximumát.'
      else if (reason === 'booking_disabled') submitError = 'A helyszín jelenleg nem fogad foglalásokat.'
      else if (reason === 'venue_not_found') submitError = 'A helyszín nem található.'
      else submitError = 'Hiba történt. Kérjük, próbálja újra később.'

      updateSubmitBtn()
      setSubmitError(submitError)
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────

  async function init(): Promise<void> {
    track('load', VENUE_PARAM ? { venue_slug: VENUE_PARAM } : {})

    venuesLoading = true
    render()

    try {
      const groupSlug = VENUE_PARAM ? undefined : (VENUE_GROUP_PARAM ?? undefined)
      venues = await fetchVenues(groupSlug)
      venuesLoading = false
      if (VENUE_PARAM && !venues.find(v => v.slug === VENUE_PARAM)) {
        venueNotFound = true
      } else if (VENUE_GROUP_PARAM && !VENUE_PARAM && venues.length === 0) {
        venueGroupNotFound = true
      }
    } catch {
      venuesLoading = false
      venuesError = true
    }

    render()
  }

  init()
}

// ── Auto-mount ────────────────────────────────────────────────────────────────

function autoMount(): void {
  document.querySelectorAll<HTMLElement>('[data-lk-venue], [data-lk-group], [data-lk]').forEach(el => {
    if (el.dataset.lkMounted) return
    el.dataset.lkMounted = '1'

    mountApp(el, {
      venueSlug: el.dataset.lkVenue ?? null,
      venueGroup: el.dataset.lkGroup ?? null,
      useSlots: el.dataset.lkSlots === '1',
      open: el.dataset.lkOpen ?? '10:00',
      close: el.dataset.lkClose ?? '23:00',
      privacyUrl: el.dataset.lkPrivacyUrl ?? null,
    })
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoMount)
} else {
  autoMount()
}
