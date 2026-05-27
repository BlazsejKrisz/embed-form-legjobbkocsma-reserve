# Legjobbkocsma Foglalási Embed – Dokumentáció

Beágyazható foglalási űrlap külső weboldalakhoz (WordPress, Webflow, Elementor, egyedi HTML oldalak, stb.). Egyetlen `<script>` tag tölt be mindent, és sima CSS-sel testreszabható a saját stíluslapodban.

---

## Tartalomjegyzék

1. [Beágyazás](#1-beágyazás)
2. [Konfiguráció – data attribútumok](#2-konfiguráció--data-attribútumok)
3. [Nyelv (HU / EN)](#3-nyelv-hu--en)
4. [CSS testreszabás](#4-css-testreszabás)
5. [Események és konverziómérés](#5-események-és-konverziómérés)
6. [Biztonság](#6-biztonság)
7. [Mezők és validáció](#7-mezők-és-validáció)
8. [Példák](#8-példák)
9. [Fejlesztés és build](#9-fejlesztés-és-build)

---

## 1. Beágyazás

**1. lépés** — Helyezd el a konténer divet az oldalon, ahol az űrlapot szeretnéd:

```html
<div data-lk-venue="legjobb-kocsma"></div>
```

**2. lépés** — Töltsd be a scriptet (egyszer, bárhol az oldalon, lehetőleg a `</body>` előtt):

```html
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

**3. lépés** — Stilizáld a saját CSS-eddel (nem kötelező):

```css
[data-lk-venue] {
  --lk-primary: #e74c3c;
  --lk-radius: 12px;
  max-width: 560px;
}
```

Kész. Nincs iframe, nincs URL paraméter, nincs konfigurációs JavaScript.

---

## 2. Konfiguráció – data attribútumok

A konténer `<div>`-en `data-lk-*` attribútumokkal adod meg a beállításokat.

| Attribútum             | Kötelező | Alapértelmezett   | Leírás                                                                                              |
|------------------------|----------|-------------------|-----------------------------------------------------------------------------------------------------|
| `data-lk-venue`        | igen *   | –                 | Helyszín slug; elrejti a helyszínválasztót                                                          |
| `data-lk-group`        | igen *   | –                 | Csak az adott csoporthoz tartozó helyszíneket tölt be; megjelenik a helyszínválasztó                |
| `data-lk-privacy-url`  | nem      | –                 | Adatkezelési tájékoztató URL — ha meg van adva, a kötelező GDPR checkbox szövegében linkként jelenik meg |
| `data-lk-form-id`      | nem      | `booking-form`    | A konverziós `enhanced_form_submission` esemény `formid` értéke                                     |

\* `data-lk-venue` vagy `data-lk-group` közül legalább egyiket meg kell adni. Ha egyiket sem adod meg, az összes aktív helyszín betöltődik és megjelenik a helyszínválasztó.

### A foglalható időpontok

Az időpontválasztó a helyszín **valós, naponkénti nyitvatartásából** generálja a 30 perces opciókat (a backend `/venues` válaszából, a helyszín időzónájában — alapból `Europe/Budapest`). Nincs `data-lk-open` / `data-lk-close` override: mindig a backend nyitvatartás az irányadó (az éjfél utáni zárás, pl. P–Szo 01:00, is helyesen kezelve).

```
utolsó foglalható időpont = zárás − default_duration_minutes (helyszín beállítás)
```

Így a teljes foglalás belefér a nyitvatartásba. Például: zárás 23:00 és 120 perces alap foglalási hossz → utolsó időpont **21:00**. (Ha 22:00-ig szeretnéd engedni, állítsd a `default_duration_minutes`-t 60-ra.)

A `min_notice_minutes` percen belüli időpontok abszolút idő alapján automatikusan ki vannak szűrve (időzóna-független), így a nap végén is marad a foglalás és a zárás között a megfelelő idő.

---

## 3. Nyelv (HU / EN)

Az embed automatikusan érzékeli az oldal nyelvét a `<html lang>` attribútumból:

- `lang="hu"` (vagy bármi ami `hu`-val kezdődik) → magyar felirat
- bármi más → angol felirat

```html
<html lang="hu">      <!-- magyar -->
<html lang="en">      <!-- angol -->
<html lang="de">      <!-- angol (hu-tól eltérő → en) -->
```

Az ország-választó listája is a kiválasztott nyelven jelenik meg (Magyarország / Hungary, Németország / Germany, stb.).

---

## 4. CSS testreszabás

A script közvetlenül az oldalba injektálja a formot, nincs iframe-korlát — bármilyen CSS szabály működik.

### CSS custom properties (ajánlott)

| CSS változó       | Alapértelmezett | Mit szabályoz                        |
|-------------------|-----------------|--------------------------------------|
| `--lk-primary`    | `#111827`       | Gomb háttérszíne, aktív elemek       |
| `--lk-primary-fg` | `#ffffff`       | Gomb szövegszíne                     |
| `--lk-font`       | `inherit`       | Betűtípus                            |
| `--lk-radius`     | `6px`           | Sarkok lekerekítése                  |
| `--lk-border`     | `#e5e7eb`       | Keretek és elválasztók színe         |
| `--lk-text`       | `#111827`       | Fő szöveg színe                      |
| `--lk-muted`      | `#6b7280`       | Feliratok és másodlagos szöveg színe |
| `--lk-bg`         | `transparent`   | Háttérszín                           |

```css
[data-lk-venue] {
  --lk-primary: #e74c3c;
  --lk-radius: 10px;
  --lk-font: 'Inter', sans-serif;
}
```

### Direkt szelektorok

**Strukturális:**

| Elem                | Szelektor             |
|---------------------|-----------------------|
| Teljes form         | `#lk-form`            |
| Dátum + létszám sor | `.lk-row--date-party` |
| Keresztnév + vezetéknév sor | `.lk-row--name` |
| E-mail + telefon sor| `.lk-row--contact`    |

**Mező wrapperek** (label + input együtt):

`.lk-field--venue`, `.lk-field--date`, `.lk-field--party-size`, `.lk-field--time`, `.lk-field--first-name`, `.lk-field--last-name`, `.lk-field--email`, `.lk-field--phone`, `.lk-field--message`, `.lk-field--submit`

**Feliratok:** ugyanaz `lk-label--` előtaggal: `.lk-label--venue`, `.lk-label--date`, stb.

**Input ID-k:**

`#lk-venue`, `#lk-date`, `#lk-party`, `#lk-time`, `#lk-first-name`, `#lk-last-name`, `#lk-email`, `#lk-phone`, `#lk-message`, `#lk-submit`

**Egyéb:**

| Elem                             | Szelektor               |
|----------------------------------|-------------------------|
| Küldés gomb                      | `.lk-btn`               |
| Időpont select                   | `.lk-select--time`      |
| Telefon ország-választó (zárt)   | `.lk-country-trigger`   |
| Telefon ország-választó (nyitott)| `.lk-country-dropdown`  |
| Ország-keresés mező              | `.lk-country-search`    |
| Egy ország opció                 | `.lk-country-option`    |
| Adatkezelési checkbox blokk      | `.lk-consent--gdpr`     |
| Hibaüzenet                       | `.lk-msg-error`         |
| Sikerképernyő                    | `.lk-success`           |

### Mezők elrejtése

Bármely mező elrejthető `display: none`-nal:

```css
.lk-field--message { display: none; }
```

Figyelem: kötelező mezőt (név, email, telefon, dátum, létszám, időpont, GDPR) ne rejts el — a validáció akkor sem fog átengedni.

### Mezők átrendezése

A `#lk-form` flexbox (`flex-direction: column`), tehát bármely mező bárhova helyezhető `order` property-vel:

```css
.lk-field--message { order: -1; }     /* megjegyzés a tetejére */
.lk-field--first-name { order: 99; }  /* keresztnév az utolsó helyre */
```

Alapértelmezett sorrend: helyszín → dátum + létszám → időpont → keresztnév + vezetéknév → e-mail + telefon → megjegyzés → adatkezelési checkbox → küldés gomb.

---

## 5. Események és konverziómérés

Sikeres foglalás után az embed **automatikusan push-ol egy `enhanced_form_submission` eseményt a `window.dataLayer`-be** (GTM / Google & Meta enhanced conversions), **és** tüzel egy `lk:confirmed` CustomEventet. A dataLayer eseményhez a host oldalnak nem kell kódolnia, csak GTM trigger.

### `enhanced_form_submission` – automatikus dataLayer push (GTM)

Ugyanaz a struktúra, mint a Habibi foglalási űrlapnál — a meglévő GTM tagjeid/triggereid változtatás nélkül működnek:

```js
window.dataLayer.push({
  event: 'enhanced_form_submission',
  firstname, lastname, email,           // normalizált (trim + lowercase)
  email_google, email_google_with_domain,
  phone, phone_e164, phone_no_plus,     // E.164, illetve + nélkül
  fbemailhashed, fbphonehashed,         // Meta-hoz hashelve
  hashedFirstName, hashedLastName, hashedEmail,
  hashedGoogleEmail, hashedPhone, hashedGoogleEmailWithDomain,
  party_size,                           // szám
  formid,                               // alapból 'booking-form' (data-lk-form-id-vel állítható)
  location,                             // a kiválasztott helyszín slug-ja
})
```

A nyers és a SHA-256 hashelt mezők is benne vannak; a normalizálás (lowercase email, E.164 telefon, gmail-kanonikalizálás) már megtörtént. Részletes mezőlista: lásd [INTEGRATION.md](INTEGRATION.md) 5. fejezet.

### `lk:confirmed` – sikeres foglalás

Foglalás után két módon tüzel:

**1. CustomEvent a konténer elemen** (ajánlott):

```js
document.querySelector('[data-lk-venue]').addEventListener('lk:confirmed', function(e) {
  console.log(e.detail.reservation_id, e.detail.status)

  // Google Analytics 4
  gtag('event', 'purchase', { transaction_id: e.detail.reservation_id })

  // Meta Pixel
  fbq('track', 'Lead')

  // Google Enhanced Conversions (hashelt email)
  if (e.detail.enhanced_conversions) {
    gtag('set', 'user_data', {
      sha256_email_address: e.detail.enhanced_conversions.email_sha256,
      sha256_phone_number: e.detail.enhanced_conversions.phone_sha256,
    })
  }
})
```

**2. `window.postMessage`** (iframe-es beágyazáshoz):

```js
window.addEventListener('message', function(e) {
  if (e.data?.type === 'lk:confirmed') {
    gtag('event', 'purchase', { transaction_id: e.data.reservation_id })
  }
})
```

### Esemény tartalma

```js
{
  reservation_id: 42,
  status: 'confirmed' | 'pending_manual_review',
  enhanced_conversions: {
    email_sha256: 'a665a45920422f9d...',  // SHA-256 hash a normalizált emailről
    phone_sha256: 'b14a7b8059d9c055...'   // SHA-256 hash az E.164 telefonszámról
  }
}
```

A hashelt értékek lehetővé teszik, hogy Google Enhanced Conversions vagy Meta Conversions API-ba elküldd a felhasználói adatokat anélkül, hogy a host oldal valaha látná a nyers emailt vagy telefont.

### Foglalás státuszok

| Státusz                  | Jelentés                                                                |
|--------------------------|-------------------------------------------------------------------------|
| `confirmed`              | Asztal automatikusan kiosztva, visszaigazoló e-mail elküldve            |
| `pending_manual_review`  | Nincs szabad asztal, a kolléga kézzel kezeli — ez is sikeres foglalás   |

Mindkét esetben HTTP 201 válasz érkezik, és a vendég visszaigazolást kap.

---

## 6. Biztonság

### Amit az embed véd

- **Input szanitizáció** — kontroll karakterek (`\x00–\x1F`) eltávolítása minden mezőből küldés előtt
- **Maxlength kényszer** — keresztnév/vezetéknév egyenként 60, e-mail 254, telefon 20, megjegyzés 1000 karakter
- **Email és telefon formátum-validáció** — regex-szel és `libphonenumber-js`-szel
- **Honeypot** — láthatatlan mező, amit botoktól csapdaként működik
- **Egész létszám** — 1–500 közötti egész szám
- **Kötelező GDPR checkbox** — a felhasználónak elfogadnia kell az adatkezelést

### Amit a backend véd

- **Per-venue domain whitelist** — minden helyszín csak az engedélyezett domainről fogadhat foglalást
- **Rate limiting** — IP-nként és e-mail-enként korlátozott kérésszám
- **Honeypot ellenőrzés** — kitöltött mező esetén csendes elvetés
- **Parameterized query** — SQL injection ellen az ORM véd

---

## 7. Mezők és validáció

### Kötelező mezők

- **Helyszín** (csak ha `data-lk-venue` nincs megadva)
- **Dátum** — alapból a mai nap, csak a foglalható tartomány (a `min_notice_minutes` és `max_advance_booking_days` figyelembe vételével)
- **Létszám** — egész szám, 1 és a helyszín maximuma között
- **Időpont** — a generált 30 perces opciók közül
- **Keresztnév** és **vezetéknév** — külön mező, egyenként max 60 karakter (a backend felé `full_name`-ként összefűzve megy)
- **E-mail** — érvényes formátum, max 254 karakter
- **Telefon** — ország-választó + nemzetközi formátum (`libphonenumber-js`-szel validált, E.164 formában küldve: `+36301234567`)
- **Adatkezelési hozzájárulás** — kötelező checkbox

### Opcionális mezők

- **Megjegyzés** — max 1000 karakter

### Telefon ország-választó

A telefon mező mellett ország-választó (zászló + ország-hívószám). Alapból Magyarország. Amikor a felhasználó beír egy számot, a kiválasztott országhoz tartozó hívószámmal kombinálódik és E.164 formátumban kerül a backendre. A `libphonenumber-js` validálja, hogy érvényes telefonszám-e az adott országban.

170+ ország szerepel a listában, kereshetők név vagy hívószám szerint.

---

## 8. Példák

### Alap beágyazás

```html
<div data-lk-venue="legjobb-kocsma"></div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Piros gombokkal, lekerekített sarkokkal

```html
<div
  data-lk-venue="legjobb-kocsma"
  style="--lk-primary:#e74c3c; --lk-radius:12px; --lk-font:'Inter',sans-serif; max-width:560px;">
</div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Adatkezelési tájékoztató linkkel

```html
<div
  data-lk-venue="legjobb-kocsma"
  data-lk-privacy-url="https://legjobbkocsma.hu/adatkezeles">
</div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Sötét hátterű oldalon (saját CSS-ből)

```html
<div class="booking-widget" data-lk-venue="legjobb-kocsma"></div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

```css
.booking-widget {
  --lk-bg: #1a1a2e;
  --lk-text: #ffffff;
  --lk-muted: #a0a0b0;
  --lk-border: #333355;
  --lk-primary: #e74c3c;
  max-width: 560px;
  padding: 24px;
  border-radius: 16px;
}
```

### Helyszíncsoport, helyszínválasztóval

```html
<div data-lk-group="legjobb-group"></div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Átrendezett mezők (megjegyzés előre, telefon elrejtve nem ajánlott — kötelező mező)

```html
<div class="custom-order" data-lk-venue="legjobb-kocsma"></div>
<style>
  .custom-order .lk-field--message { order: -1; }
</style>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Konverziómérés (Google Enhanced Conversions)

```html
<div id="booking" data-lk-venue="legjobb-kocsma"></div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
<script>
  document.getElementById('booking').addEventListener('lk:confirmed', function(e) {
    gtag('set', 'user_data', {
      sha256_email_address: e.detail.enhanced_conversions?.email_sha256,
      sha256_phone_number: e.detail.enhanced_conversions?.phone_sha256,
    })
    gtag('event', 'purchase', {
      transaction_id: e.detail.reservation_id,
      value: 0,
      currency: 'HUF',
    })
  })
</script>
```

---

## 9. Fejlesztés és build

### Környezeti változó

A projekt gyökerében hozz létre egy `.env` fájlt:

```
VITE_API_BASE=https://foglalas.legjobbkocsma.hu/api/public
```

Vercelen ezt az **Environment Variables** beállításnál kell hozzáadni.

### Parancsok

```bash
npm install                # függőségek telepítése
npm run dev                # fejlesztői szerver (http://localhost:5173)
npm run build:embed        # embed.js build (kimenet: dist-embed/)
npm run preview            # build előnézet
```

### Tesztelés lokálisan

`npm run dev` után az `index.html` automatikusan tölti az embedet `data-lk-venue` attribútum alapján.

A `form.html` egy minimális oldal, amit iframe-es teszteléshez használhatsz.

### Deploy

Vercel: a `vercel.json` és `scripts/post-build.mjs` automatikusan kezeli a build pipeline-t. A `dist-embed/embed.js` lesz a publikus URL-en elérhető.

A deploy után az ügyfeleknek csak ezt kell beilleszteniük:

```html
<div data-lk-venue="..."></div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```
