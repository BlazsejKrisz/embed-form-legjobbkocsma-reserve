# Foglalási Embed – Beágyazási útmutató

Ez az útmutató azoknak szól, akik a foglalási űrlapot szeretnék beilleszteni egy weboldalra (WordPress, Webflow, Elementor, egyedi HTML, stb.). Egyetlen `<script>` taggel telepíthető, és sima CSS-sel testreszabható a saját stíluslapodban.

---

## Tartalomjegyzék

1. [Beágyazás](#1-beágyazás)
2. [Konfiguráció](#2-konfiguráció)
3. [Nyelv (HU / EN)](#3-nyelv-hu--en)
4. [Megjelenés testreszabása](#4-megjelenés-testreszabása)
5. [Konverziómérés](#5-konverziómérés)
6. [Példák](#6-példák)
7. [GYIK / Hibaelhárítás](#7-gyik--hibaelhárítás)

---

## 1. Beágyazás

Három lépés, és kész.

**1. lépés** — Tedd a konténer divet oda, ahol az űrlapot szeretnéd:

```html
<div data-lk-venue="legjobb-kocsma"></div>
```

**2. lépés** — Töltsd be a scriptet (egyszer az oldalon, lehetőleg a `</body>` előtt):

```html
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

**3. lépés** — Igazítsd a saját CSS-ed alá (nem kötelező):

```css
[data-lk-venue] {
  --lk-primary: #e74c3c;
  --lk-radius: 12px;
  max-width: 560px;
}
```

Kész. Az űrlap betölti a helyszín adatait (nyitvatartás, létszám, stb.), és kezeli az adatok küldését.

---

## 2. Konfiguráció

A konténer `<div>`-en `data-lk-*` attribútumokkal állítható minden.

| Attribútum             | Kötelező | Leírás                                                                                              |
|------------------------|----------|-----------------------------------------------------------------------------------------------------|
| `data-lk-venue`        | igen *   | Helyszín slug. Ha meg van adva, a helyszínválasztó nem jelenik meg.                                |
| `data-lk-group`        | igen *   | Helyszíncsoport slug. Csak az adott csoport helyszínei közül lehet választani.                     |
| `data-lk-privacy-url`  | nem      | Adatkezelési tájékoztató URL — ekkor a kötelező GDPR checkbox szövegében linkként jelenik meg.     |
| `data-lk-form-id`      | nem      | A konverziós `enhanced_form_submission` esemény `formid` mezőjének értéke (alapértelmezett: `booking-form`). |

\* `data-lk-venue` vagy `data-lk-group` közül legalább egyiket kell megadni. Ha egyiket sem, az összes aktív helyszínt felajánlja az űrlap.

### Példák a slug használatára

```html
<!-- Egyetlen helyszín -->
<div data-lk-venue="legjobb-kocsma"></div>

<!-- Helyszínválasztóval -->
<div data-lk-group="legjobb-group"></div>

<!-- Adatkezelési linkkel -->
<div data-lk-venue="legjobb-kocsma" data-lk-privacy-url="https://legjobbkocsma.hu/adatkezeles"></div>
```

A slug-okat (helyszín és csoport azonosítók) az üzemeltetőtől kapod meg.

---

## 3. Nyelv (HU / EN)

Az embed automatikusan érzékeli az oldal nyelvét a `<html lang>` attribútumból:

- `lang="hu"` (vagy bármi `hu`-val kezdődő) → **magyar** felirat
- bármi más → **angol** felirat

```html
<html lang="hu">      <!-- magyar -->
<html lang="en">      <!-- angol -->
<html lang="de">      <!-- angol (hu-tól eltérő → en) -->
```

Az ország-választó listája is a kiválasztott nyelven jelenik meg.

---

## 4. Megjelenés testreszabása

Az űrlap közvetlenül a host oldalba kerül (nincs iframe), így bármilyen CSS-szabály működik. Két szintű testreszabás van: gyors `--lk-*` változókkal, vagy precíz CSS szelektorokkal.

### CSS változók (a leggyorsabb módja)

```css
[data-lk-venue] {
  --lk-primary: #e74c3c;
  --lk-radius: 10px;
  --lk-font: 'Inter', sans-serif;
}
```

| CSS változó       | Alapértelmezett | Mit szabályoz                        |
|-------------------|-----------------|--------------------------------------|
| `--lk-primary`    | `#111827`       | Gomb háttérszíne, aktív elemek       |
| `--lk-primary-fg` | `#ffffff`       | Gomb szövegszíne                     |
| `--lk-font`       | `inherit`       | Betűtípus                            |
| `--lk-radius`     | `6px`           | Sarkok lekerekítése                  |
| `--lk-border`     | `#e5e7eb`       | Keretek színe                        |
| `--lk-text`       | `#111827`       | Fő szöveg színe                      |
| `--lk-muted`      | `#6b7280`       | Másodlagos szöveg színe              |
| `--lk-bg`         | `transparent`   | Háttérszín                           |

### Direkt CSS szelektorok

Ha pontosabb kontroll kell — pl. egyetlen mezőt másképp formáznál — minden elemnek van egyértelmű azonosítója.

**Mező wrapperek** (label + input együtt):

`.lk-field--venue`, `.lk-field--date`, `.lk-field--party-size`, `.lk-field--time`, `.lk-field--first-name`, `.lk-field--last-name`, `.lk-field--email`, `.lk-field--phone`, `.lk-field--message`, `.lk-field--submit`

**Feliratok:** ugyanaz `lk-label--` előtaggal: `.lk-label--venue`, `.lk-label--date`, stb.

**Input ID-k:** `#lk-venue`, `#lk-date`, `#lk-party`, `#lk-time`, `#lk-first-name`, `#lk-last-name`, `#lk-email`, `#lk-phone`, `#lk-message`, `#lk-submit`

**Egyéb elemek:**

| Elem                              | Szelektor               |
|-----------------------------------|-------------------------|
| Teljes form                       | `#lk-form`              |
| Dátum + létszám sor               | `.lk-row--date-party`   |
| Keresztnév + vezetéknév sor       | `.lk-row--name`         |
| E-mail + telefon sor              | `.lk-row--contact`      |
| Küldés gomb                       | `.lk-btn`               |
| Időpont select                    | `.lk-select--time`      |
| Telefon ország-választó (zárt)    | `.lk-country-trigger`   |
| Telefon ország-választó (nyitott) | `.lk-country-dropdown`  |
| Adatkezelési checkbox blokk       | `.lk-consent--gdpr`     |
| Hibaüzenet                        | `.lk-msg-error`         |
| Sikerképernyő                     | `.lk-success`           |

### Mezők elrejtése

```css
/* Pl. megjegyzés mező nem kell */
.lk-field--message { display: none; }
```

> **Figyelem:** Kötelező mezőt (név, email, telefon, dátum, létszám, időpont, GDPR) **ne rejts el** — a validáció akkor sem engedi át a foglalást.

### Mezők átrendezése

A form belül flexbox, így az `order` property-vel bármelyik mező bárhova mozdítható:

```css
.lk-field--message { order: -1; }    /* megjegyzés a tetejére */
.lk-field--full-name { order: 99; }  /* név az utolsó helyre */
```

Alapértelmezett sorrend: helyszín → dátum + létszám → időpont → keresztnév + vezetéknév → e-mail + telefon → megjegyzés → adatkezelési checkbox → küldés gomb.

---

## 5. Konverziómérés

Sikeres foglalás után az embed **két** dolgot csinál:

1. **Automatikusan push-ol egy `enhanced_form_submission` eseményt a `window.dataLayer`-be** (GTM-hez, Google/Meta enhanced conversions-höz) — ehhez a host oldalnak **nem kell semmit kódolnia**, csak a GTM trigger.
2. Tüzel egy **`lk:confirmed`** CustomEventet a konténer elemen — ezt kézzel kötheted rá bármilyen mérőeszközre.

### Automatikus dataLayer esemény (GTM)

Ez ugyanaz a struktúra, mint a Habibi foglalási űrlapnál — a meglévő GTM tagjeid/triggereid változtatás nélkül működnek. A foglalás (és a manuális kezelésre váró igény) után az embed ezt push-olja:

```js
window.dataLayer.push({
  event: 'enhanced_form_submission',
  firstname: 'jános',                 // normalizált (trim + lowercase)
  lastname: 'kiss',
  email: 'pelda@email.hu',
  email_google: 'pelda@email.hu',     // gmail/googlemail esetén kanonikalizált (pont/+tag nélkül, domain nélkül)
  email_google_with_domain: 'pelda@email.hu',
  fbemailhashed: 'a665a459…',         // SHA-256(email)
  phone: '+36301234567',              // E.164
  phone_e164: '+36301234567',
  phone_no_plus: '36301234567',
  fbphone: '36301234567',
  fbphonehashed: 'b14a7b80…',         // SHA-256(telefon + nélkül)
  hashedFirstName: '…',               // SHA-256(firstname)
  hashedLastName: '…',
  hashedEmail: '…',                   // SHA-256(email)
  hashedGoogleEmail: '…',             // SHA-256(email_google)
  hashedPhone: '…',                   // SHA-256(phone_e164)
  hashedGoogleEmailWithDomain: '…',
  party_size: 4,
  formid: 'booking-form',             // felülírható a data-lk-form-id attribútummal
  location: 'legjobb-kocsma',         // a kiválasztott helyszín slug-ja
})
```

A nyers (firstname, lastname, email, phone) és a hashelt mezők is benne vannak, hogy a GTM-ben szabadon választhass — a Google/Meta enhanced conversions a hashelt változatokat várja, a normalizálás (lowercase email, E.164 telefon, gmail-kanonikalizálás) már megtörtént.

> A `data-lk-form-id` attribútummal állíthatod a `formid` értéket, ha a GTM triggered ez alapján szűr.

### Alap konverzióesemény (lk:confirmed)

```js
document.querySelector('[data-lk-venue]').addEventListener('lk:confirmed', function(e) {
  // Google Analytics 4
  gtag('event', 'purchase', { transaction_id: e.detail.reservation_id })

  // Meta Pixel
  fbq('track', 'Lead')
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

### Foglalás státuszok

| Státusz                  | Jelentés                                                              |
|--------------------------|-----------------------------------------------------------------------|
| `confirmed`              | Asztal automatikusan kiosztva, visszaigazoló email elküldve           |
| `pending_manual_review`  | Nincs szabad asztal, az üzemeltető kézzel kezeli — ez is sikeres      |

Mindkét esetben hasznos „lead/conversion"-ként rögzíteni — a foglalási igény mindenképp megérkezett.

### Google Enhanced Conversions / Meta Conversions API

Ha hashelt emailt vagy telefont szeretnél küldeni a Google-nek vagy a Metának (pl. javítja a hirdetésekhez kapcsolódó konverziók pontosságát):

```js
document.querySelector('[data-lk-venue]').addEventListener('lk:confirmed', function(e) {
  if (e.detail.enhanced_conversions) {
    gtag('set', 'user_data', {
      sha256_email_address: e.detail.enhanced_conversions.email_sha256,
      sha256_phone_number: e.detail.enhanced_conversions.phone_sha256,
    })
  }
  gtag('event', 'purchase', {
    transaction_id: e.detail.reservation_id,
    value: 0,
    currency: 'HUF',
  })
})
```

A hash már SHA-256 formátumban van — pont úgy, ahogy a Google és a Meta várja. A nyers email/telefon **soha nem kerül a host oldalra**, így GDPR-szempontból is rendben van.

---

## 6. Példák

### Alap beágyazás

```html
<div data-lk-venue="legjobb-kocsma"></div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Piros gombokkal, lekerekített sarkokkal

```html
<div
  data-lk-venue="legjobb-kocsma"
  style="--lk-primary:#e74c3c; --lk-radius:12px; max-width:560px;">
</div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Sötét hátterű oldalon

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

### Egyedi betűtípus + márkaszín + tájékoztató link

```html
<div
  class="booking"
  data-lk-venue="legjobb-kocsma"
  data-lk-privacy-url="https://legjobbkocsma.hu/adatkezeles">
</div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

```css
.booking {
  --lk-primary: #c2410c;
  --lk-font: 'Playfair Display', serif;
  --lk-radius: 4px;
  max-width: 480px;
}
```

### Helyszíncsoport, helyszínválasztóval

```html
<div data-lk-group="legjobb-group"></div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Konverziómérés Google Tag Manager-rel

```html
<div id="booking" data-lk-venue="legjobb-kocsma"></div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
<script>
  document.getElementById('booking').addEventListener('lk:confirmed', function(e) {
    dataLayer.push({
      event: 'reservation_confirmed',
      reservation_id: e.detail.reservation_id,
      reservation_status: e.detail.status,
    })
  })
</script>
```

### Megjegyzés mező a tetejére, név alatti elválasztóval

```html
<div class="custom-form" data-lk-venue="legjobb-kocsma"></div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

```css
.custom-form .lk-field--message { order: -1; }
.custom-form .lk-field--full-name {
  border-bottom: 1px solid #ddd;
  padding-bottom: 12px;
}
```

---

## 7. GYIK / Hibaelhárítás

### Az űrlap nem jelenik meg

- Ellenőrizd, hogy a `<script>` tag betöltődött-e (Network panel a böngészőben)
- A `data-lk-venue` slug helyes-e — ha helytelen, hibaüzenet jelenik meg az űrlap helyén
- A weboldalad domainje szerepel-e az engedélyezett listán az üzemeltetőnél (CORS-védelem)

### „Helyszín nem található" üzenet

A `data-lk-venue` attribútumban megadott slug nem található az üzemeltetőnél. Ellenőrizd a slug helyességét.

### „Túl sok próbálkozás" üzenet

Rate limit. Várj 1 percet, és próbáld újra.

### A foglalás után hová megy az email?

A vendég automatikusan kap visszaigazoló emailt a backenden generálva — ehhez a host oldalnak nem kell csinálnia semmit.

### Saját adatkezelési tájékoztatóra hivatkozás

Add hozzá a `data-lk-privacy-url` attribútumot a konténer divhez, a megfelelő URL-lel. A kötelező GDPR checkbox szövegében linkként fog megjelenni.

```html
<div
  data-lk-venue="legjobb-kocsma"
  data-lk-privacy-url="https://sajatoldal.hu/adatkezeles">
</div>
```

### Mobilon furcsán fest

Az embed reszponzív alapból, de ha kontextusfüggően másképp kell megjeleníteni:

```css
@media (max-width: 480px) {
  [data-lk-venue] {
    --lk-radius: 4px;
    padding: 16px;
  }
}
```

### A telefon ország-választó túl széles

Alapból ~110px, csak a zászlót és a hívószámot mutatja. Ha keskenyebb kell:

```css
.lk-country-trigger {
  padding-left: 8px;
  padding-right: 22px;
  font-size: 14px;
}
```

---

## Kapcsolat

Ha bármi nem világos vagy egyedi integrációs igényed van, fordulj az üzemeltetőhöz.
