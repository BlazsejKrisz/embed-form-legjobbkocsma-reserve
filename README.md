# Legjobbkocsma Foglalási Embed – Dokumentáció

Beágyazható foglalási űrlap külső weboldalakhoz (WordPress, Webflow, egyedi landing oldalak). Egyetlen `<script>` tag tölt be mindent — stílust sima CSS-sel, a saját stíluslapodban adod meg.

---

## Tartalomjegyzék

1. [Beágyazás](#1-beágyazás)
2. [Konfiguráció – data attribútumok](#2-konfiguráció--data-attribútumok)
3. [CSS testreszabás](#3-css-testreszabás)
4. [Események](#4-események)
5. [Példák](#5-példák)
6. [Fejlesztés és build](#6-fejlesztés-és-build)

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

**2. `window.postMessage`** (backward compatibility, ha iframe-ben használod):
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

## 5. Példák

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

---

## 6. Fejlesztés és build

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

# iframe-alapú statikus build (kimenet: dist/)
npm run build

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
|----------------|--------------------|-----------------|---------------------------------------------------------------------------------------------|
| `venue`        | helyszín slug      | –               | Előre beállít egy helyszínt, elrejti a helyszínválasztót                                    |
| `venue_group`  | csoport slug       | –               | Csak az adott csoporthoz tartozó helyszíneket tölti be, megjelenik a helyszínválasztó       |
| `slots`        | `1` vagy `0`       | `0`             | `1` esetén valós idejű szabad időpont-lekérdezés az API-ból                                |
| `open`         | `ÓÓ:PP` formátum   | `10:00`         | Nyitási időpont – ettől az időponttól jelennek meg az időpontok a legördülőben              |
| `close`        | `ÓÓ:PP` formátum   | `23:00`         | Zárási időpont – az utolsó foglalható időpont: `zárás – minimális tartam` (venue beállítás) |

### Helyszín megadása

**Egyetlen helyszín** (helyszínválasztó elrejtve):
```
src="https://embed.legjobbkocsma.hu/?venue=legjobb-kocsma"
```

**Helyszíncsoport** (helyszínválasztó megjelenik, csak az adott csoport helyszíneivel):
```
src="https://embed.legjobbkocsma.hu/?venue_group=legjobb-group"
```

**Minden aktív helyszín** (sem `venue`, sem `venue_group` nincs megadva – helyszínválasztó megjelenik):
```
src="https://embed.legjobbkocsma.hu/"
```

### Időpontok és nyitvatartás

Az időpontválasztó 30 perces lépésekkel generálja az időpontokat `open` és `close` között. Az utolsó foglalható időpont számítása:

```
utolsó időpont = close − min_duration_minutes (helyszín beállításból)
```

Példa: ha `close=23:00` és a helyszín minimális tartama 60 perc, az utolsó időpont **22:00**.

Ha a mai napot választják, az `min_notice_minutes` (helyszín beállítás) percen belüli időpontok automatikusan ki vannak szűrve.

### Valós idejű szabad időpontok (`slots=1`)

Ha a `slots=1` paraméter meg van adva, az időpontválasztó az API-ból kéri le a szabad időpontokat a kiválasztott dátum és létszám alapján. Ha az API nem ad vissza szabad időpontot, vagy hiba lép fel, az űrlap visszaesik a generált időpontválasztóra.

---

## 4. CSS testreszabás

Az iframe-be ágyazott tartalom CSS osztályokkal és ID-kkel rendelkezik, amelyek segítségével a fogadó oldal stíluslapjából **nem** lehet közvetlenül célozni (cross-origin korlát). Az egyedi stílusokat az `src` URL témaparaméterei szabályozzák.

Ha viszont az embed-et saját domain alatt üzemeltetik (pl. subdomain-en), vagy CSS custom property-k átadása elegendő, az alábbi szelektorok állnak rendelkezésre az embed belső CSS-éhez.

### Strukturális szelektorok

| Elem                        | Szelektor              |
|-----------------------------|------------------------|
| Teljes form                 | `#lk-form`             |
| Dátum + létszám sor         | `.lk-row--date-party`  |
| E-mail + telefon sor        | `.lk-row--contact`     |

### Mező wrapperek (label + input együtt)

| Mező           | Szelektor               |
|----------------|-------------------------|
| Helyszín       | `.lk-field--venue`      |
| Dátum          | `.lk-field--date`       |
| Létszám        | `.lk-field--party-size` |
| Időpont        | `.lk-field--time`       |
| Teljes név     | `.lk-field--full-name`  |
| E-mail         | `.lk-field--email`      |
| Telefon        | `.lk-field--phone`      |
| Megjegyzés     | `.lk-field--message`    |
| Küldés terület | `.lk-field--submit`     |

### Feliratok (label)

Ugyanolyan névkonvenció, `lk-label--` előtaggal:

`.lk-label--venue`, `.lk-label--date`, `.lk-label--party-size`, `.lk-label--time`, `.lk-label--full-name`, `.lk-label--email`, `.lk-label--phone`, `.lk-label--message`

### Input elemek (ID-k alapján)

| Elem                     | Szelektor       |
|--------------------------|-----------------|
| Helyszínválasztó         | `#lk-venue`     |
| Dátummező                | `#lk-date`      |
| Létszám                  | `#lk-party`     |
| Időpont (select)         | `#lk-time`      |
| Teljes név               | `#lk-full-name` |
| E-mail                   | `#lk-email`     |
| Telefon                  | `#lk-phone`     |
| Megjegyzés               | `#lk-message`   |
| Küldés gomb              | `#lk-submit`    |

### Egyéb elemek

| Elem                              | Szelektor            |
|-----------------------------------|----------------------|
| Küldés gomb                       | `.lk-btn`            |
| API-ból betöltött időpont select  | `.lk-select--slots`  |
| Generált időpont select           | `.lk-select--time`   |
| Betöltési spinner                 | `.lk-spinner`        |
| Tájékoztató szöveg (szürke)       | `.lk-msg-muted`      |
| Hibaüzenet (piros)                | `.lk-msg-error`      |
| E-mail/telefon megjegyzés         | `.lk-note`           |
| Sikerképernyő wrapper             | `.lk-success`        |
| Sikerképernyő ikon                | `.lk-success-icon`   |
| Sikerképernyő cím                 | `.lk-success-title`  |
| Sikerképernyő szöveg              | `.lk-success-body`   |

---

## 5. postMessage események

Az embed két eseményt küld a szülő oldalnak `window.parent.postMessage` segítségével.

### `lk:resize` – magasság frissítés

Az iframe magasságát automatikusan igazítja a tartalom változásához. A fogadó oldalon a [Beágyazás](#1-beágyazás) szekcióban lévő script kezeli.

```js
{ type: 'lk:resize', height: 420 }
```

### `lk:confirmed` – sikeres foglalás

Foglalás beküldése után azonnal tüzel. Felhasználható konverziókövetésre (Google Analytics, Meta Pixel stb.).

```js
{ type: 'lk:confirmed', reservation_id: 42, status: 'confirmed' }
// vagy
{ type: 'lk:confirmed', reservation_id: 43, status: 'pending_manual_review' }
```

**Teljes példa konverziókövetéssel:**
```html
<script>
  window.addEventListener('message', function(e) {
    if (!e.data) return;

    if (e.data.type === 'lk:resize') {
      document.getElementById('legjobbkocsma-booking').style.height = e.data.height + 'px';
    }

    if (e.data.type === 'lk:confirmed') {
      // Google Analytics 4
      gtag('event', 'purchase', {
        transaction_id: e.data.reservation_id
      });

      // Meta Pixel
      fbq('track', 'Lead');
    }
  });
</script>
```

### Foglalás státuszok

| Státusz                  | Jelentés                                                                                  |
|--------------------------|-------------------------------------------------------------------------------------------|
| `confirmed`              | Asztal automatikusan kiosztva, visszaigazoló e-mail elküldve                              |
| `pending_manual_review`  | Nincs szabad asztal, a kolléga kézzel kezeli – ez is sikeres foglalás, nem hiba           |

Mindkét esetben HTTP 201 válasz érkezik, és a vendég visszaigazolást kap.

---

## 6. Példák

### Egyszerű beágyazás, egy helyszínnel

```html
<iframe
  id="legjobbkocsma-booking"
  src="https://embed.legjobbkocsma.hu/?venue=legjobb-kocsma&open=12:00&close=23:00"
  style="border:none; width:100%; overflow:hidden; display:block;"
  scrolling="no"
  allowtransparency="true">
</iframe>
```

### Témázott, piros gombokkal, lekerekített sarkokkal

```html
<iframe
  id="legjobbkocsma-booking"
  src="https://embed.legjobbkocsma.hu/?venue=legjobb-kocsma&primary=%23e74c3c&primary_fg=%23ffffff&radius=12px&font=Inter&open=12:00&close=23:00"
  style="border:none; width:100%; overflow:hidden; display:block;"
  scrolling="no"
  allowtransparency="true">
</iframe>
```

### Sötét hátterű oldalon

```html
<iframe
  id="legjobbkocsma-booking"
  src="https://embed.legjobbkocsma.hu/?venue=legjobb-kocsma&bg=%231a1a2e&text=%23ffffff&muted=%23a0a0b0&border=%23333355&primary=%23e74c3c&open=12:00&close=23:00"
  style="border:none; width:100%; overflow:hidden; display:block;"
  scrolling="no"
  allowtransparency="true">
</iframe>
```

### Valós idejű szabad időpontokkal (`slots=1`)

```html
<iframe
  id="legjobbkocsma-booking"
  src="https://embed.legjobbkocsma.hu/?venue=legjobb-kocsma&slots=1&open=12:00&close=23:00"
  style="border:none; width:100%; overflow:hidden; display:block;"
  scrolling="no"
  allowtransparency="true">
</iframe>
```

### Helyszíncsoport, helyszínválasztóval

```html
<iframe
  id="legjobbkocsma-booking"
  src="https://embed.legjobbkocsma.hu/?venue_group=legjobb-group&open=12:00&close=23:00"
  style="border:none; width:100%; overflow:hidden; display:block;"
  scrolling="no"
  allowtransparency="true">
</iframe>
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

# Produkciós build (kimenet: dist/)
npm run build

# Build előnézete lokálisan
npm run preview
```

### Tesztelés lokálisan

A fejlesztői szerveren az URL paramétereket közvetlenül a böngészőben lehet tesztelni:

```
http://localhost:5173/?venue=legjobb-kocsma&primary=%23e74c3c&open=12:00&close=23:00
```

### Deploy

A `dist/` mappa tartalma egy statikus weboldal, amely bármely statikus hostingra feltölthető:

- **Vercel:** `vercel deploy`
- **Netlify:** húzd be a `dist/` mappát a Netlify felületre
- **Cloudflare Pages:** kösd össze a GitHub repót, build command: `npm run build`, output: `dist`

A deploy után kapott URL kerül az iframe `src` attribútumába.
