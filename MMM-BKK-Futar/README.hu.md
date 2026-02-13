<p align="center">
  <img src="https://img.shields.io/badge/MagicMirror%C2%B2-modul-blueviolet" alt="MagicMirror² Modul" />
  <img src="https://img.shields.io/badge/platform-Raspberry%20Pi-red" alt="Raspberry Pi" />
  <img src="https://img.shields.io/badge/BKK-FUT%C3%81R%20API-blue" alt="BKK FUTÁR API" />
  <img src="https://img.shields.io/badge/licenc-MIT-green" alt="MIT Licenc" />
</p>

# MMM-BKK-Futar

<p align="center">
  <strong>Valós idejű budapesti tömegközlekedési indulási adatok megjelenítése MagicMirror²-n a BKK FUTÁR API-n keresztül.</strong>
</p>

<p align="center">
  <a href="#funkciók">Funkciók</a> •
  <a href="#előnézet">Előnézet</a> •
  <a href="#telepítés">Telepítés</a> •
  <a href="#konfiguráció">Konfiguráció</a> •
  <a href="#járatszűrés">Járatszűrés</a> •
  <a href="#hibaelhárítás">Hibaelhárítás</a> •
  <a href="#licenc">Licenc</a>
</p>

<p align="center">
  <strong><a href="README.md">English documentation</a></strong>
</p>

---

## Miért ez a modul?

Van egy Raspberry Pi-d a falon, rajta [MagicMirror²](https://magicmirror.builders/). Szeretnéd tudni, mikor megy a következő busz, villamos vagy metró a legközelebbi megállóból — anélkül, hogy elővennéd a telefonod.

Az **MMM-BKK-Futar** csatlakozik a [BKK FUTÁR](https://futar.bkk.hu/) valós idejű közlekedési API-hoz, lekéri az élő indulási adatokat a konfigurált megállóidból, és egy letisztult, színkódolt táblázatban jeleníti meg. A GPS-alapú becsült időket kéken mutatja, így mindig tudod, ha egy busz késik.

Megállók beállítása, járatok szűrése → indulási idők a tükrödön. Ennyi.

---

## Funkciók

- **Több megálló** — egyszerre több megálló figyelése, külön szekcióban
- **Járatszűrés** — megállónként csak adott járatok mutatása (pl. csak 9-es busz és 47-es villamos)
- **Valós idejű adatok** — GPS-alapú becsült érkezési idők, ha elérhetők
- **BKK színkódok** — járatszámok a BKK hivatalos színeivel
- **Járat típus ikonok** — busz 🚍, villamos 🚊, metró 🚇, HÉV 🚆, trolibusz 🚎, hajó ⛴️
- **Hamarosan induló járatok** — villogó sorok 2 percen belüli indulásnál
- **Relatív vagy abszolút idő** — "5 perc" vagy "14:32" formátum
- **Fade effekt** — a lista alja fokozatosan halványodik
- **Kétnyelvű** — magyar és angol nyelvtámogatás
- **Nincs külső függőség** — csak a Node.js beépített `https` modulját használja

---

## Előnézet

```
┌──────────────────────────────────────┐
│       MÓRICZ ZSIGMOND KÖRTÉR         │
│  🚊  47   Deák Ferenc tér      2 p  │  ← villog, hamarosan indul
│  🚊  49   Deák Ferenc tér      5 p  │  ← kék: valós idejű adat
│  🚍   7   Bosnyák tér         12 p  │
│  🚍 133E  Népliget            18 p  │
│                                      │
│          SZENT GELLÉRT TÉR           │
│  🚊  19   Bécsi út / Vörösvári 3 p  │
│  🚍  86   Óbuda, Bogdáni út  10 p  │
│  🚇  M4   Keleti pályaudvar  14 p  │
└──────────────────────────────────────┘
```

| Elem | Jelentés |
|------|----------|
| Kék idő | Valós idejű (GPS-alapú) becsült indulás |
| Fehér idő | Menetrend szerinti indulás |
| Villogó sor | Indulás 2 percen belül |
| Narancssárga "most" | Éppen indul |
| Halványodó sorok | A lista alja fokozatosan elhalványodik |
| Színes járatszám | BKK hivatalos háttérszín |

---

## Telepítés

### 1. Modul letöltése

```bash
cd ~/MagicMirror/modules
git clone https://github.com/bohemtucsok/MMM-BKK-Futar.git
```

> A modulnak **nincs külső függősége** — nem kell `npm install`.

### 2. BKK API kulcs beszerzése (ingyenes)

1. Látogass el a [BKK OpenData](https://opendata.bkk.hu/) oldalra
2. Kattints a **Regisztráció** gombra és hozz létre egy fiókot
3. Bejelentkezés után igényelj egy **API kulcsot**
4. Másold ki a kulcsot — szükséged lesz rá a konfigurációban

### 3. Megálló ID-k megkeresése

1. Nyisd meg a [BKK FUTÁR térképet](https://futar.bkk.hu/)
2. Keresd meg és kattints a kívánt megállóra
3. A megálló kódja az info panelen vagy az URL-ben látható (pl. `F02297`)
4. A konfigurációban **`BKK_` előtaggal** add meg: `BKK_F02297`

### 4. MagicMirror konfiguráció

Add hozzá a `~/MagicMirror/config/config.js` fájlhoz:

```javascript
{
  module: "MMM-BKK-Futar",
  position: "top_left",
  config: {
    apiKey: "a-te-bkk-api-kulcsod",
    stops: [
      {
        stopId: "BKK_F02297",
        stopName: "Deák Ferenc tér",
        routeIds: ["9", "47"]
      },
      {
        stopId: "BKK_F00945"
      }
    ]
  }
}
```

### 5. MagicMirror újraindítása

```bash
pm2 restart magicmirror
```

---

## Konfiguráció

| Opció | Alapértelmezett | Leírás |
|-------|-----------------|--------|
| `apiKey` | `""` | **Kötelező.** BKK OpenData API kulcs |
| `stops` | `[]` | **Kötelező.** Figyelni kívánt megállók tömbje (lásd lent) |
| `updateInterval` | `60000` (1 perc) | Frissítési gyakoriság (ms) |
| `minutesAfter` | `30` | Időablak a közelgő indulásokhoz (perc) |
| `maxResults` | `5` | Maximum megjelenített járat megállónként |
| `showRouteType` | `true` | Járat típus ikon mutatása |
| `showMinutesOnly` | `true` | `true`: "5 perc", `false`: "14:32" |
| `language` | `"hu"` | `"hu"` (magyar) vagy `"en"` (angol) |
| `coloredRoutes` | `true` | BKK hivatalos színkódok használata |
| `fadePoint` | `0.25` | Lista halványulás kezdőpontja (0.0 - 1.0) |

### Megálló konfiguráció (`stops[]`)

| Mező | Kötelező | Leírás |
|------|----------|--------|
| `stopId` | Igen | Megálló azonosító, pl. `"BKK_F02297"` |
| `stopName` | Nem | Egyedi megjelenített név (ha nincs, API-ból jön) |
| `routeIds` | Nem | Csak ezeket a járatokat mutassa (ha üres, mindent mutat) |

---

## Járatszűrés

A `routeIds` tömbbe a járatok kétféleképpen adhatók meg:

| Megadás módja | Példa | Mikor használd |
|---------------|-------|----------------|
| Járat rövid neve | `"9"`, `"47"`, `"M2"` | Egyszerű, kényelmes |
| BKK route ID | `"BKK_0090"`, `"BKK_0470"` | Pontos egyezés, ha a rövid név nem egyedi |

Ha a `routeIds` nincs megadva, az adott megálló **összes járata** megjelenik.

<details>
<summary><strong>Példa konfigurációk</strong></summary>

**Egy megálló, minden járat:**
```javascript
{
  module: "MMM-BKK-Futar",
  position: "top_right",
  config: {
    apiKey: "az-api-kulcsod",
    stops: [
      { stopId: "BKK_F02297", stopName: "Deák Ferenc tér" }
    ]
  }
}
```

**Több megálló, szűrt járatokkal:**
```javascript
{
  module: "MMM-BKK-Futar",
  position: "top_left",
  config: {
    apiKey: "az-api-kulcsod",
    stops: [
      {
        stopId: "BKK_F02297",
        stopName: "Deák tér",
        routeIds: ["47", "49"]
      },
      {
        stopId: "BKK_F00945",
        stopName: "Blaha Lujza tér",
        routeIds: ["M2"]
      }
    ],
    updateInterval: 30000,
    minutesAfter: 45,
    maxResults: 8,
    language: "hu"
  }
}
```

**Minimális, abszolút idő, ikonok nélkül:**
```javascript
{
  module: "MMM-BKK-Futar",
  position: "bottom_left",
  config: {
    apiKey: "az-api-kulcsod",
    stops: [
      { stopId: "BKK_F02297" }
    ],
    language: "en",
    showMinutesOnly: false,
    coloredRoutes: false,
    showRouteType: false
  }
}
```

</details>

---

## Tech Stack

| Réteg | Technológia |
|-------|-------------|
| Frontend | MagicMirror² Module API (DOM manipuláció, fade effektek) |
| Backend | Node.js node_helper (socket notification-ök) |
| API | BKK FUTÁR valós idejű közlekedési API (REST/JSON) |
| HTTP kliens | Node.js beépített `https` modul |
| Adat | OneBusAway-kompatibilis menetrend, járat, útvonal adatok |

---

## Hibaelhárítás

| Probléma | Megoldás |
|----------|----------|
| "Betöltés..." marad | Ellenőrizd az API kulcsot és a hálózati kapcsolatot |
| Üres lista | Ellenőrizd a megálló ID-t a [FUTÁR térképen](https://futar.bkk.hu/). Nincs járat az időablakban? |
| Nem jelenik meg a modul | A mappa neve pontosan `MMM-BKK-Futar` legyen, és a `config.js`-ben a `module` értéke is ez |
| Jogosultsági hiba (EACCES) | `sudo chown -R $USER:$USER ~/MagicMirror` majd `npm install` |

A MagicMirror konzolban (`~/.pm2/logs/` vagy böngésző DevTools) `MMM-BKK-Futar:` prefixszel jelennek meg a hibaüzenetek.

---

## API referencia

Ez a modul a [BKK FUTÁR Utazástervező API](https://bkkfutar.docs.apiary.io/) `arrivals-and-departures-for-stop` endpointját használja.

- **Endpoint:** `https://futar.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json`
- **Dokumentáció:** [bkkfutar.docs.apiary.io](https://bkkfutar.docs.apiary.io/)
- **OpenData portál:** [opendata.bkk.hu](https://opendata.bkk.hu/)

---

## Támogatók

<p align="center">
  <a href="https://infotipp.hu"><img src="https://raw.githubusercontent.com/bohemtucsok/MMM-NextcloudPhotos/main/docs/images/infotipp-logo.png" height="40" alt="Infotipp Rendszerház Kft." /></a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://brutefence.com"><img src="https://raw.githubusercontent.com/bohemtucsok/MMM-NextcloudPhotos/main/docs/images/brutefence.png" height="40" alt="BruteFence" /></a>
</p>

---

## Licenc

[MIT](LICENSE) — használd, forkold, hostold magadnál. Hozzájárulásokat szívesen fogadunk.
