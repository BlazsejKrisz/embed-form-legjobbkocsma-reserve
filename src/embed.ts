import rawCSS from './style.css?raw'
import {
  fetchVenues,
  submitReservation,
  track,
  toErrorReason,
} from './api'
import type { Venue, ReservationResult } from './api'
import { t, getLang } from './i18n'
import { COUNTRIES } from './countries'
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js/min'
import type { CountryCode } from 'libphonenumber-js/min'

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
  open: string
  close: string
  privacyUrl: string | null
}

function mountApp(container: HTMLElement, cfg: AppConfig): void {
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
  let phoneCountry = 'HU'
  let message = ''

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
    if (!v) return false
    try {
      return isValidPhoneNumber(v, phoneCountry as CountryCode)
    } catch {
      return false
    }
  }

  function phoneToE164(v: string): string | null {
    try {
      const parsed = parsePhoneNumberFromString(v, phoneCountry as CountryCode)
      return parsed?.isValid() ? parsed.format('E.164') : null
    } catch {
      return null
    }
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
    if (!em || !isEmailValid(em)) return false
    if (!ph || !isPhoneValid(ph)) return false
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
      el.textContent = t('loading')
      container.appendChild(el)
      return
    }

    if (!VENUE_PARAM && venuesError) {
      const el = document.createElement('p')
      el.className = 'lk-msg-error'
      el.style.padding = '8px 0'
      el.textContent = t('loadError')
      container.appendChild(el)
      return
    }

    if (venueNotFound) {
      const el = document.createElement('p')
      el.className = 'lk-msg-error'
      el.style.padding = '8px 0'
      el.textContent = `${t('venueNotFound')}: "${VENUE_PARAM}"`
      container.appendChild(el)
      return
    }

    if (venueGroupNotFound) {
      const el = document.createElement('p')
      el.className = 'lk-msg-error'
      el.style.padding = '8px 0'
      el.textContent = `${t('venueGroupNotFound')}: "${VENUE_GROUP_PARAM}"`
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
    title.textContent = confirmed ? t('successTitleConfirmed') : t('successTitlePending')
    wrap.appendChild(title)

    const body = document.createElement('p')
    body.className = 'lk-success-body'
    body.textContent = confirmed
      ? `${t('successBodyConfirmed')} (#${r.reservation_id})`
      : t('successBodyPending')
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
    form.appendChild(buildInputField('lk-full-name', t('fullNameLabel'), 'text', t('fullNamePlaceholder'), true, () => fullName, v => { fullName = v }))

    const row2 = document.createElement('div')
    row2.className = 'lk-row lk-row--contact'
    row2.appendChild(buildInputField('lk-email', t('emailLabel'), 'email', t('emailPlaceholder'), true, () => email, v => { email = v }))
    row2.appendChild(buildPhoneField())
    form.appendChild(row2)

    form.appendChild(buildMessageField())
    form.appendChild(buildGdprField())

    const submitWrap = document.createElement('div')
    submitWrap.className = 'lk-field lk-field--submit'
    submitWrap.id = 'lk-submit-wrap'

    const btn = document.createElement('button')
    btn.type = 'submit'
    btn.className = 'lk-btn'
    btn.id = 'lk-submit'
    btn.textContent = t('submitBtn')
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
    label.innerHTML = `${t('venueLabel')} <span class="lk-req">*</span>`
    wrap.appendChild(label)

    const select = document.createElement('select')
    select.className = 'lk-select'
    select.id = 'lk-venue'
    select.appendChild(new Option(t('venuePlaceholder'), ''))

    if (venuesLoading) {
      select.disabled = true
      select.options[0].text = t('loading')
    } else if (venuesError) {
      select.disabled = true
      select.options[0].text = t('venueLoadError')
    } else {
      for (const v of venues) select.appendChild(new Option(v.name, v.slug))
      if (selectedVenueSlug) select.value = selectedVenueSlug
    }

    select.addEventListener('change', () => {
      selectedVenueSlug = select.value
      date = ''; time = ''
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
    label.innerHTML = `${t('dateLabel')} <span class="lk-req">*</span>`
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
      time = ''
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
    label.innerHTML = `${t('partyLabel')} <span class="lk-req">*</span>`
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
    label.innerHTML = `${t('timeLabel')} <span class="lk-req">*</span>`
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

  function buildPhoneField(): HTMLElement {
    const wrap = document.createElement('div')
    wrap.className = 'lk-field lk-field--phone'

    const label = document.createElement('label')
    label.htmlFor = 'lk-phone'
    label.className = 'lk-label lk-label--phone'
    label.innerHTML = `${t('phoneLabel')} <span class="lk-req">*</span>`
    wrap.appendChild(label)

    const row = document.createElement('div')
    row.className = 'lk-phone-row'

    const lang = getLang()

    const picker = document.createElement('div')
    picker.className = 'lk-country-picker'
    picker.tabIndex = 0
    picker.setAttribute('role', 'combobox')
    picker.setAttribute('aria-expanded', 'false')
    picker.setAttribute('aria-haspopup', 'listbox')
    picker.setAttribute('aria-label', t('phoneLabel'))

    const trigger = document.createElement('div')
    trigger.className = 'lk-country-trigger'
    const triggerCurrent = COUNTRIES.find(c => c.code === phoneCountry) ?? COUNTRIES[0]
    trigger.innerHTML = `<span class="lk-country-flag">${triggerCurrent.flag}</span><span class="lk-country-dial">${triggerCurrent.dial}</span>`
    picker.appendChild(trigger)

    const dropdown = document.createElement('div')
    dropdown.className = 'lk-country-dropdown'
    dropdown.setAttribute('role', 'listbox')

    const search = document.createElement('input')
    search.type = 'text'
    search.className = 'lk-country-search'
    search.placeholder = lang === 'hu' ? 'Keresés…' : 'Search…'
    search.autocomplete = 'off'
    search.addEventListener('click', (e) => e.stopPropagation())
    search.addEventListener('input', () => filterOptions(search.value))
    dropdown.appendChild(search)

    const list = document.createElement('div')
    list.className = 'lk-country-list'
    dropdown.appendChild(list)

    const optionEls: HTMLButtonElement[] = []
    for (const c of COUNTRIES) {
      const opt = document.createElement('button')
      opt.type = 'button'
      opt.className = 'lk-country-option'
      opt.setAttribute('role', 'option')
      opt.dataset.code = c.code
      opt.dataset.search = `${c.name.hu} ${c.name.en} ${c.dial}`.toLowerCase()
      opt.innerHTML = `<span class="lk-country-flag">${c.flag}</span><span class="lk-country-name">${c.name[lang]}</span><span class="lk-country-dial">${c.dial}</span>`
      opt.addEventListener('click', () => {
        phoneCountry = c.code
        trigger.innerHTML = `<span class="lk-country-flag">${c.flag}</span><span class="lk-country-dial">${c.dial}</span>`
        closePicker()
        updateSubmitBtn()
      })
      list.appendChild(opt)
      optionEls.push(opt)
    }
    picker.appendChild(dropdown)

    function filterOptions(q: string): void {
      const needle = q.trim().toLowerCase()
      for (const el of optionEls) {
        const match = !needle || (el.dataset.search ?? '').includes(needle)
        el.style.display = match ? '' : 'none'
      }
    }

    function openPicker(): void {
      picker.classList.add('lk-country-picker--open')
      picker.setAttribute('aria-expanded', 'true')
      search.value = ''
      filterOptions('')
      setTimeout(() => search.focus(), 0)
    }
    function closePicker(): void {
      picker.classList.remove('lk-country-picker--open')
      picker.setAttribute('aria-expanded', 'false')
    }

    trigger.addEventListener('click', () => {
      if (picker.classList.contains('lk-country-picker--open')) closePicker()
      else openPicker()
    })

    picker.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePicker()
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (picker.classList.contains('lk-country-picker--open')) closePicker()
        else openPicker()
      }
    })

    document.addEventListener('click', (e) => {
      if (!picker.contains(e.target as Node)) closePicker()
    })

    row.appendChild(picker)

    const input = document.createElement('input')
    input.type = 'tel'
    input.className = 'lk-input lk-input--phone'
    input.id = 'lk-phone'
    input.placeholder = t('phonePlaceholder')
    input.value = phone
    input.autocomplete = 'tel'
    input.maxLength = 20
    input.addEventListener('input', () => {
      phone = input.value
      updateSubmitBtn()
    })
    row.appendChild(input)

    wrap.appendChild(row)
    return wrap
  }

  function buildMessageField(): HTMLElement {
    const wrap = document.createElement('div')
    wrap.className = 'lk-field lk-field--message'

    const label = document.createElement('label')
    label.htmlFor = 'lk-message'
    label.className = 'lk-label lk-label--message'
    label.textContent = t('messageLabel')
    wrap.appendChild(label)

    const textarea = document.createElement('textarea')
    textarea.className = 'lk-textarea'
    textarea.id = 'lk-message'
    textarea.placeholder = t('messagePlaceholder')
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

    label.append(t('consentLead'))
    if (PRIVACY_URL) {
      label.append(t('consentLinkPrefix'))
      const link = document.createElement('a')
      link.href = PRIVACY_URL
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.textContent = t('consentLinkText')
      label.appendChild(link)
      label.append(t('consentLinkSuffix'))
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
      msg.textContent = t('pickDateFirst')
      content.appendChild(msg)
      return
    }

    const timeOptions = generateTimeSlots()

    if (timeOptions.length === 0) {
      const msg = document.createElement('p')
      msg.className = 'lk-msg-muted'
      msg.textContent = t('noSlots')
      content.appendChild(msg)
      return
    }

    const select = document.createElement('select')
    select.className = 'lk-select lk-select--time'
    select.id = 'lk-time'
    select.appendChild(new Option(t('timePlaceholder'), ''))
    for (const opt of timeOptions) select.appendChild(new Option(opt, opt))
    if (time && timeOptions.includes(time)) select.value = time
    select.addEventListener('change', () => { time = select.value; updateSubmitBtn() })
    content.appendChild(select)
  }

  function updateSubmitBtn(): void {
    const btn = document.getElementById('lk-submit') as HTMLButtonElement | null
    if (!btn) return
    btn.disabled = !isValid() || submitting
    btn.textContent = submitting ? t('submitting') : t('submitBtn')
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

  // ── Submit ────────────────────────────────────────────────────────────

  async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault()
    if (!isValid() || submitting) return

    submitting = true
    submitError = null
    updateSubmitBtn()
    setSubmitError(null)

    const startsAt = new Date(`${date}T${time}:00`).toISOString()
    const phoneE164 = phoneToE164(phone) ?? sanitize(phone, 20)

    const payload = {
      venue_slug: selectedVenueSlug,
      starts_at: startsAt,
      party_size: Number(partySize),
      customer: {
        full_name: sanitize(fullName, 100),
        email: sanitize(email, 254),
        phone: phoneE164,
      },
      ...(message.trim() ? { message: sanitize(message, 1000) } : {}),
      consents: {
        reservation_data_processing: true,
        reservation_data_processing_text: `${t('consentLead')}.`,
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
      const e = err as Error & { status?: number; body?: unknown }
      const status = e.status ?? 0
      const msg = e.message ?? ''
      const reason = toErrorReason(status, msg)

      console.error('[lk] submit failed:', { status, message: msg, body: e.body, error: err })
      track('error', { code: status, reason })

      if (reason === 'party_size_exceeded') submitError = t('errParty')
      else if (reason === 'booking_disabled') submitError = t('errDisabled')
      else if (reason === 'venue_not_found') submitError = t('errVenue')
      else submitError = t('errGeneric')

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
