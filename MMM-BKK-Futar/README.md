# MMM-BKK-Futar

MagicMirror² modul, amely valós idejű BKK FUTÁR indulási adatokat jelenít meg konfigurálható buszmegállókhoz.

## Funkciók

- Több megálló párhuzamos figyelése
- Járatszűrés megállónként (pl. csak 9-es busz)
- Valós idejű (predicted) és menetrend szerinti indulási idők
- BKK színkódok a járatszámokhoz
- Járat típus ikonok (busz, villamos, metró, HÉV, hajó, trolibusz)
- Hamarosan induló járatok kiemelése
- Magyar és angol nyelv

## Telepítés

1. Navigálj a MagicMirror `modules` könyvtárába:
   ```bash
   cd ~/MagicMirror/modules
   ```

2. Másold be az `MMM-BKK-Futar` mappát:
   ```bash
   cp -r /path/to/MMM-BKK-Futar .
   ```

3. A modulnak nincs külső függősége, nem kell `npm install`.

## API kulcs beszerzése

1. Látogass el a [BKK OpenData](https://opendata.bkk.hu/) oldalra
2. Regisztrálj egy ingyenes fiókot
3. Igényelj API kulcsot
4. Másold be a kulcsot a konfigurációba

## Megálló ID megkeresése

1. Nyisd meg a [BKK FUTÁR](https://futar.bkk.hu/) térképet
2. Kattints a kívánt megállóra
3. A megálló ID az URL-ben vagy az info panelen látható (pl. `F02297`)
4. A konfigurációban `BKK_` előtaggal használd: `BKK_F02297`

## Konfiguráció

Add hozzá a `config/config.js` fájlhoz:

```javascript
{
  module: "MMM-BKK-Futar",
  position: "top_left",
  config: {
    apiKey: "your-bkk-api-key",
    stops: [
      {
        stopId: "BKK_F02297",
        stopName: "Deák Ferenc tér",       // opcionális, ha nincs, API-ból jön
        routeIds: ["BKK_0090", "BKK_0470"] // opcionális, szűrés ezekre a járatokra
      },
      {
        stopId: "BKK_F00945",
        stopName: "Blaha Lujza tér"
        // routeIds nélkül minden járatot mutat
      }
    ],
    updateInterval: 60000,
    minutesAfter: 30,
    maxResults: 5
  }
}
```

## Konfigurációs opciók

| Opció | Típus | Alapértelmezett | Leírás |
|---|---|---|---|
| `apiKey` | String | `""` | BKK OpenData API kulcs (kötelező) |
| `stops` | Array | `[]` | Figyelni kívánt megállók tömbje |
| `stops[].stopId` | String | - | Megálló azonosító, pl. `"BKK_F02297"` |
| `stops[].stopName` | String | - | Megjelenített név (opcionális) |
| `stops[].routeIds` | Array | - | Járatszűrés: route ID-k vagy járatszámok |
| `updateInterval` | Number | `60000` | Frissítés gyakorisága ms-ben |
| `minutesAfter` | Number | `30` | Hány percen belüli indulásokat mutassa |
| `maxResults` | Number | `5` | Max. megjelenített indulás megállónként |
| `showRouteType` | Boolean | `true` | Járat típus ikon mutatása |
| `showMinutesOnly` | Boolean | `true` | Relatív idő ("5 perc") az abszolút helyett |
| `language` | String | `"hu"` | Nyelv: `"hu"` vagy `"en"` |
| `coloredRoutes` | Boolean | `true` | BKK színkódos járatszámok |
| `fadePoint` | Number | `0.25` | Lista elhalványulás kezdőpontja (0-1) |

## Járatszűrés

A `routeIds` tömbben megadhatod:
- A BKK route ID-t (pl. `"BKK_0090"` a 9-es buszhoz)
- Vagy a járat rövid nevét (pl. `"9"`, `"47"`, `"M2"`)

Ha a `routeIds` nincs megadva vagy üres, minden járat megjelenik az adott megállóból.

## Licence

MIT
