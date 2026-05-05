# Legjobbkocsma Foglalási Embed – Dokumentáció

Beágyazható foglalási űrlap külső weboldalakhoz (WordPress, Webflow, egyedi landing oldalak). Egyetlen `<script>` tag tölt be mindent — stílust sima CSS-sel, a saját stíluslapodban adod meg.

---

## Tartalomjegyzék

1. [Beágyazás](#1-beágyazás)
2. [Konfiguráció – data attribútumok](#2-konfiguráció--data-attribútumok)
3. [CSS testreszabás](#3-css-testreszabás)
4. [Események](#4-események)
5. [Biztonság](#5-biztonság)
6. [Példák](#6-példák)
7. [Fejlesztés és build](#7-fejlesztés-és-build)

---

## 1. Beágyazás

**1. lépés** — Helyezd el a konténer divet ott, ahol az űrlapot szeretnéd:

```html
<div
  data-lk-venue="legjobb-kocsma"
  data-lk-open="12:00"
  data-lk-close="23:00">
</div>
```

**2. lépés** — Töltsd be a scriptet (egyszer, bárhol az oldalon, lehetőleg `</body>` előtt):

```html
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

**3. lépés** — Stilizáld a saját CSS-eddel:

```css
[data-lk-venue] {
  --lk-primary: #e74c3c;
  --lk-radius: 12px;
  max-width: 560px;
}
```

Kész. Nincs iframe, nincs URL-kódolt szín, nincs extra JavaScript.

---

## 2. Konfiguráció – data attribútumok

A konténer `<div>`-en `data-lk-*` attribútumokkal adod meg a beállításokat.

| Attribútum       | Kötelező | Alapértelmezett | Leírás                                                                                     |
|------------------|----------|-----------------|--------------------------------------------------------------------------------------------|
| `data-lk-venue`  | igen *   | –               | Helyszín slug; elrejti a helyszínválasztót                                                 |
| `data-lk-group`  | igen *   | –               | Csak az adott csoporthoz tartozó helyszíneket tölt be; megjelenik a helyszínválasztó       |
| `data-lk-slots`  | nem      | `0`             | `1` esetén valós idejű szabad időpont-lekérdezés az API-ból                               |
| `data-lk-open`   | nem      | `10:00`         | Nyitási időpont — ettől jelennek meg az időpontok                                          |
| `data-lk-close`  | nem      | `23:00`         | Zárási időpont — utolsó foglalható időpont: `zárás − minimális tartam` (venue beállítás)  |

\* `data-lk-venue` vagy `data-lk-group` közül legalább egyiket meg kell adni. Ha egyik sem szerepel, az összes aktív helyszín betöltődik és megjelenik a helyszínválasztó.

### Az utolsó foglalható időpont

Az időpontválasztó 30 perces lépésekkel generálja az opciókat, az utolsó időpont számítása:

```
utolsó időpont = data-lk-close − min_duration_minutes (a helyszín API-beállításából)
```

Például: `data-lk-close="23:00"` és 60 perces minimális tartam → utolsó időpont **22:00**.

Ha a mai napot választják, a `min_notice_minutes` percen belüli időpontok automatikusan ki vannak szűrve.

---

## 3. CSS testreszabás

A script közvetlenül az oldalba injektálja a formot, így bármilyen CSS-szel stilizálható — nincs iframe-korlát.

### CSS custom properties (ajánlott)

| CSS változó       | Alapértelmezett | Mit szabályoz                        |
|-------------------|-----------------|--------------------------------------|
| `--lk-primary`    | `#111827`       | Gomb háttérszíne, aktív elemek       |
| `--lk-primary-fg` | `#ffffff`       | Gomb szövegszíne                     |
| `--lk-font`       | `inherit`       | Betűtípus                            |
| `--lk-radius`     | `6px`           | Sarkok lekerekítése (input, gomb)    |
| `--lk-border`     | `#e5e7eb`       | Keretek és elválasztók színe         |
| `--lk-text`       | `#111827`       | Fő szöveg színe                      |
| `--lk-muted`      | `#6b7280`       | Feliratok és másodlagos szöveg színe |
| `--lk-bg`         | `transparent`   | Háttérszín                           |

```css
[data-lk-venue] {
  --lk-primary: #e74c3c;
  --lk-primary-fg: #ffffff;
  --lk-radius: 10px;
  --lk-font: 'Inter', sans-serif;
}
```

### Direkten targetálható szelektorok

Mivel a form az oldal DOM-jában él, bármilyen CSS szabály működik.

**Strukturális:**

| Elem                | Szelektor             |
|---------------------|-----------------------|
| Teljes form         | `#lk-form`            |
| Dátum + létszám sor | `.lk-row--date-party` |
| E-mail + telefon sor| `.lk-row--contact`    |

**Mező wrapperek** (label + input együtt):

`.lk-field--venue`, `.lk-field--date`, `.lk-field--party-size`, `.lk-field--time`, `.lk-field--full-name`, `.lk-field--email`, `.lk-field--phone`, `.lk-field--message`, `.lk-field--submit`

**Feliratok:** ugyanaz `lk-label--` előtaggal: `.lk-label--venue`, `.lk-label--date`, stb.

**Input elemek ID-k alapján:**

`#lk-venue`, `#lk-date`, `#lk-party`, `#lk-time`, `#lk-full-name`, `#lk-email`, `#lk-phone`, `#lk-message`, `#lk-submit`

**Egyéb:**

| Elem                             | Szelektor           |
|----------------------------------|---------------------|
| Küldés gomb                      | `.lk-btn`           |
| API-ból betöltött időpont select | `.lk-select--slots` |
| Generált időpont select          | `.lk-select--time`  |
| Betöltési spinner                | `.lk-spinner`       |
| Tájékoztató szöveg               | `.lk-msg-muted`     |
| Hibaüzenet                       | `.lk-msg-error`     |
| E-mail/telefon megjegyzés        | `.lk-note`          |
| Sikerképernyő wrapper            | `.lk-success`       |
| Sikerképernyő ikon               | `.lk-success-icon`  |
| Sikerképernyő cím                | `.lk-success-title` |
| Sikerképernyő szöveg             | `.lk-success-body`  |

### Mezők elrejtése

Bármely mező elrejthető `display: none`-nal. Ha egy mező el van rejtve, az input értéke üres marad, és a validáció nem várja meg az értéket (opcionális mezőknél).

```css
/* Megjegyzés mező elrejtése */
.lk-field--message { display: none; }

/* Helyszínválasztó elrejtése (ha data-lk-group van beállítva, de nem kell választó) */
.lk-field--venue { display: none; }
```

### Mezők sorrendjének megváltoztatása

A `#lk-form` flexbox (`flex-direction: column`), ezért az `order` property-vel bármely mező bárhova helyezhető:

```css
/* Megjegyzés mező a form tetejére */
.lk-field--message { order: -1; }

/* Név mező az utolsó helyre */
.lk-field--full-name { order: 99; }
```

Alapértelmezett sorrend (DOM-ban): helyszín → dátum+létszám sor → időpont → teljes név → e-mail+telefon sor → megjegyzés → küldés gomb.

---

## 4. Események

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
})
```

**2. `window.postMessage`** (ha iframe-ben is használod):
```js
window.addEventListener('message', function(e) {
  if (e.data?.type === 'lk:confirmed') {
    gtag('event', 'purchase', { transaction_id: e.data.reservation_id })
  }
})
```

### Foglalás státuszok

| Státusz                  | Jelentés                                                               |
|--------------------------|------------------------------------------------------------------------|
| `confirmed`              | Asztal automatikusan kiosztva, visszaigazoló e-mail elküldve          |
| `pending_manual_review`  | Nincs szabad asztal, a kolléga kézzel kezeli — ez is sikeres foglalás |

Mindkét esetben HTTP 201 válasz érkezik, és a vendég visszaigazolást kap.

---

## 5. Biztonság

### Amit az embed véd

Az embed kliens oldali védelmi rétegeket tartalmaz:

- **Input szanitizáció** — kontroll karakterek (`\x00–\x1F`) eltávolítása minden mezőből küldés előtt
- **Maxlength kényszer** — HTML attribútum szinten: név 100, e-mail 254, telefon 20, megjegyzés 1000 karakter
- **Formátum validáció** — e-mail és telefonszám regex-szel ellenőrzött, hibás formátumnál a gomb le van tiltva
- **Honeypot** — egy CSS-sel elrejtett, botoktól csapdaként működő mező; ha ki van töltve, a backend csendben elveti a kérést
- **Egész létszám** — a `party_size` mező csak 1–500 közötti egész számot fogad el

### Amit a backendnek kell megcsinálni

Az embed önmagában nem elég — a valódi védelem a backend feladata:

| Védelmi réteg | Leírás |
|---|---|
| **CORS + per-venue domain whitelist** | Minden helyszín regisztrálja az engedélyezett domaineket; a backend az `Origin` headert ellenőrzi |
| **Rate limiting** | IP-nként és e-mail-enként korlátozott kérésszám percenként/naponta |
| **Honeypot ellenőrzés** | Ha `_hp` mező nem üres a payloadban → csendesen elveti (HTTP 200, de nem menti) |
| **Parameterized query** | SQL injection ellen az ORM/adatbázis réteg véd, nem az embed |

### Amit az embed nem tud megvédeni

Bárki, aki megnézi a bundle-t, látja az API URL-t, és direktben hívhatja curl-lel — a frontend validációt megkerülve. Ezért a rate limiting és a domain whitelist nélkülözhetetlen a backenden.

---

## 6. Példák

### Alap beágyazás

```html
<div
  data-lk-venue="legjobb-kocsma"
  data-lk-open="12:00"
  data-lk-close="23:00">
</div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Piros gombokkal, lekerekített sarkokkal

```html
<div
  data-lk-venue="legjobb-kocsma"
  data-lk-open="12:00"
  data-lk-close="23:00"
  style="--lk-primary:#e74c3c; --lk-radius:12px; --lk-font:'Inter',sans-serif; max-width:560px;">
</div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Sötét hátterű oldalon (CSS-ből)

```html
<div class="booking-widget" data-lk-venue="legjobb-kocsma" data-lk-open="12:00" data-lk-close="23:00"></div>
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

### Valós idejű szabad időpontokkal

```html
<div
  data-lk-venue="legjobb-kocsma"
  data-lk-slots="1"
  data-lk-open="12:00"
  data-lk-close="23:00">
</div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Helyszíncsoport, helyszínválasztóval

```html
<div
  data-lk-group="legjobb-group"
  data-lk-open="12:00"
  data-lk-close="23:00">
</div>
<script src="https://embed.legjobbkocsma.hu/embed.js"></script>
```

### Átrendezett mezők (megjegyzés előre, telefon elrejtve)

```css
.lk-field--message { order: -1; }
.lk-field--phone   { display: none; }
```

---

## 7. Fejlesztés és build

### Környezeti változók

Hozz létre egy `.env` fájlt a projekt gyökerében (a `.env.example` alapján):

```
VITE_API_BASE=https://reservations.legjobbkocsma.hu/api/public
```

### Parancsok

```bash
# Függőségek telepítése
npm install

# Fejlesztői szerver indítása (http://localhost:5173)
npm run dev

# Script-alapú embed build (kimenet: dist-embed/embed.js)
npm run build:embed

# Build előnézete lokálisan
npm run preview
```

### Tesztelés lokálisan

Nyisd meg `http://localhost:5173` — az `index.html` tartalmaz egy tesztkonténert `data-lk-venue` attribútummal, amelybe az embed automatikusan tölt.

### Deploy

A `dist-embed/embed.js` fájlt töltsd fel statikus hostingra:

- **Vercel / Netlify / Cloudflare Pages:** kösd össze a GitHub repót, build command: `npm run build:embed`, output: `dist-embed`

A deploy után kapott `embed.js` URL kerül a `<script src="...">` tagbe.
