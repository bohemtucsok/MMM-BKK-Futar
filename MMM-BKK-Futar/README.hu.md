# MMM-BKK-Futar

> MagicMirror² modul budapesti tömegközlekedési indulási adatok valós idejű megjelenítéséhez a [BKK FUTÁR](https://futar.bkk.hu/) API-n keresztül.

---

## Megjelenés

```
┌──────────────────────────────────────┐
│         MÓRICZ ZSIGMOND KÖRTÉR       │
│  🚊  47   Deák Ferenc tér        2p │  ← villog, hamarosan indul
│  🚊  49   Deák Ferenc tér        5p │  ← kék: valós idejű adat
│  🚍   7   Bosnyák tér           12p │
│  🚍 133E  Népliget              18p │
│                                      │
│           SZENT GELLÉRT TÉR          │
│  🚊  19   Bécsi út / Vörösvári  3p  │
│  🚍  86   Óbuda, Bogdáni út    10p  │
│  🚇  M4   Keleti pályaudvar    14p  │
└──────────────────────────────────────┘
```

## Funkciók

- **Több megálló** figyelése egyszerre, megállónként külön szekcióban
- **Járatszűrés** megállónként (pl. csak a 9-es és 47-es járatot mutassa)
- **Valós idejű adatok** - a BKK FUTÁR GPS-alapú becsült érkezési idejét használja, ha elérhető
- **BKK színkódok** - a járatszámok a BKK hivatalos színeivel jelennek meg
- **Járat típus ikonok** - busz 🚍, villamos 🚊, metró 🚇, HÉV 🚆, trolibusz 🚎, hajó ⛴️
- **Hamarosan induló járatok** kiemelése villogással (2 percen belül)
- **Relatív vagy abszolút** időformátum ("5 perc" vagy "14:32")
- **Fade effekt** - a lista alja fokozatosan halványodik
- **Magyar és angol** nyelvi támogatás
- **Nincs külső függőség** - csak a Node.js beépített `https` modulját használja

---

## Telepítés

### 1. Modul letöltése

Navigálj a MagicMirror `modules` könyvtárába és klónozd a repót:

```bash
cd ~/MagicMirror/modules
git clone https://gitlab.onevps.hu/egyeb_fejlesztesek/magicmirror_bkk.git
```

Vagy másold be manuálisan az `MMM-BKK-Futar` mappát a `modules/` könyvtárba.

> A modulnak **nincs külső függősége**, nem kell `npm install`-t futtatni.

### 2. API kulcs beszerzése

A modul a BKK nyílt adatplatformjának API-ját használja. Az API kulcs ingyenes.

1. Nyisd meg a [BKK OpenData](https://opendata.bkk.hu/) oldalt
2. Kattints a **Regisztráció** gombra és hozz létre egy fiókot
3. Bejelentkezés után igényelj egy **API kulcsot**
4. Másold ki a kapott kulcsot - erre lesz szükség a konfigurációban

### 3. Megálló ID-k megkeresése

Minden megállónak egyedi azonosítója van, amit a FUTÁR térképről olvashatsz ki:

1. Nyisd meg a [BKK FUTÁR térképet](https://futar.bkk.hu/)
2. Keresd meg és kattints a kívánt megállóra
3. Az info panelen vagy az URL-ben látható a megálló kódja (pl. `F02297`)
4. A konfigurációban **`BKK_` előtaggal** add meg: `BKK_F02297`

### 4. MagicMirror konfiguráció

Add hozzá a modult a `config/config.js` fájl `modules` tömbjéhez:

```javascript
{
  module: "MMM-BKK-Futar",
  position: "top_left",
  config: {
    apiKey: "ide-jön-a-te-bkk-api-kulcsod",
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

---

## Konfiguráció

### Fő opciók

| Opció | Típus | Alapértelmezett | Leírás |
|:------|:------|:---------------:|:-------|
| `apiKey` | String | `""` | **Kötelező.** BKK OpenData API kulcs |
| `stops` | Array | `[]` | **Kötelező.** Figyelni kívánt megállók tömbje (lásd lent) |
| `updateInterval` | Number | `60000` | Frissítési gyakoriság milliszekundumban (1 perc) |
| `minutesAfter` | Number | `30` | Ennyi percen belüli indulásokat mutatja |
| `maxResults` | Number | `5` | Maximum megjelenített járat megállónként |
| `showRouteType` | Boolean | `true` | Járat típus ikon megjelenítése |
| `showMinutesOnly` | Boolean | `true` | `true`: "5 perc", `false`: "14:32" formátum |
| `language` | String | `"hu"` | Nyelv: `"hu"` (magyar) vagy `"en"` (angol) |
| `coloredRoutes` | Boolean | `true` | BKK hivatalos színkódok használata |
| `fadePoint` | Number | `0.25` | Lista halványulás kezdőpontja (0.0 - 1.0) |

### Megálló konfiguráció (`stops[]`)

| Mező | Típus | Kötelező | Leírás |
|:-----|:------|:--------:|:-------|
| `stopId` | String | Igen | Megálló azonosító, pl. `"BKK_F02297"` |
| `stopName` | String | Nem | Egyedi megjelenített név. Ha nincs megadva, az API-ból kapott nevet használja |
| `routeIds` | Array | Nem | Csak ezeket a járatokat mutassa. Ha üres vagy hiányzik, minden járat megjelenik |

---

## Járatszűrés

A `routeIds` tömbbe a járatok kétféleképpen adhatók meg:

| Megadás módja | Példa | Mikor használd |
|:--------------|:------|:---------------|
| Járat rövid neve | `"9"`, `"47"`, `"M2"` | Egyszerű, kényelmes |
| BKK route ID | `"BKK_0090"`, `"BKK_0470"` | Pontos egyezés, ha a rövid név nem egyedi |

**Példa:** Csak a 9-es buszt és a 47-es villamost mutassa:

```javascript
routeIds: ["9", "47"]
```

**Tipp:** Ha nem adod meg a `routeIds`-t, az adott megálló **összes járata** megjelenik.

---

## Megjelenítés részletei

| Vizuális elem | Leírás |
|:--------------|:-------|
| Kék idő | Valós idejű (GPS-alapú) becsült indulási idő |
| Fehér idő | Menetrend szerinti indulási idő |
| Villogó sor | A járat 2 percen belül indul |
| Narancssárga "most" | A járat éppen indul |
| Halványodó sorok | A lista alja fokozatosan elhalványodik (fade effekt) |
| Színes járatszám | BKK hivatalos háttérszín a járatszámon |

---

## Architektúra

```
┌─────────────────────┐     socket      ┌──────────────────┐
│  MMM-BKK-Futar.js   │◄──────────────►│  node_helper.js   │
│  (Frontend / DOM)    │  notification   │  (Backend / API)  │
└─────────────────────┘                 └────────┬─────────┘
                                                 │ HTTPS
                                                 ▼
                                        ┌──────────────────┐
                                        │  BKK FUTÁR API   │
                                        │  futar.bkk.hu    │
                                        └──────────────────┘
```

1. A **frontend** (`MMM-BKK-Futar.js`) induláskor és periodikusan `GET_DEPARTURES` üzenetet küld a backendnek
2. A **backend** (`node_helper.js`) minden megállóra párhuzamosan lekéri az adatokat a BKK API-ból
3. A válaszból kiszűri a járatokat, összekapcsolja a route/trip referenciákat, és `DEPARTURES_RESULT` üzenetben visszaküldi
4. A frontend felépíti a DOM-ot és megjeleníti az indulási táblázatot

---

## Fájlstruktúra

```
MMM-BKK-Futar/
├── MMM-BKK-Futar.js    # Frontend modul (MagicMirror Module osztály)
├── node_helper.js       # Backend (BKK API hívások, adatfeldolgozás)
├── MMM-BKK-Futar.css    # Megjelenítési stílusok
├── package.json         # Modul metaadatok
└── README.md            # Ez a fájl
```

---

## Példa konfigurációk

### Egy megálló, minden járat

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

### Több megálló, szűrt járatokkal

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

### Angol nyelv, abszolút idő

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

---

## Hibaelhárítás

| Probléma | Megoldás |
|:---------|:--------|
| "Betöltés..." marad | Ellenőrizd az API kulcsot és a hálózati kapcsolatot |
| Üres lista | Ellenőrizd a megálló ID-t a [FUTÁR térképen](https://futar.bkk.hu/). Lehet, hogy nincs járat a beállított időablakban |
| Nem jelenik meg a modul | Ellenőrizd, hogy a modul mappa neve pontosan `MMM-BKK-Futar` és a `config.js`-ben a `module` értéke is ez |
| Jogosultsági hiba (EACCES) | `sudo chown -R $USER:$USER ~/MagicMirror` majd `npm install` |

A MagicMirror konzolban (`~/.pm2/logs/` vagy böngésző DevTools) további hibaüzenetek jelenhetnek meg `MMM-BKK-Futar:` prefixszel.

---

## API

Ez a modul a [BKK FUTÁR Utazástervező API](https://bkkfutar.docs.apiary.io/) `arrivals-and-departures-for-stop` endpointját használja.

- **Endpoint:** `https://futar.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json`
- **Dokumentáció:** [bkkfutar.docs.apiary.io](https://bkkfutar.docs.apiary.io/)
- **OpenData portál:** [opendata.bkk.hu](https://opendata.bkk.hu/)

---

## Licenc

MIT
