<p align="center">
  <img src="https://img.shields.io/badge/MagicMirror%C2%B2-module-blueviolet" alt="MagicMirror² Module" />
  <img src="https://img.shields.io/badge/platform-Raspberry%20Pi-red" alt="Raspberry Pi" />
  <img src="https://img.shields.io/badge/BKK-FUT%C3%81R%20API-blue" alt="BKK FUTÁR API" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
</p>

# MMM-BKK-Futar

<p align="center">
  <strong>Display real-time Budapest public transport departures on your MagicMirror² using the BKK FUTÁR API.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#preview">Preview</a> •
  <a href="#installation">Installation</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#route-filtering">Route Filtering</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <strong><a href="README.hu.md">Magyar nyelvű leírás / Hungarian documentation</a></strong>
</p>

---

## Why this module?

You have a Raspberry Pi running [MagicMirror²](https://magicmirror.builders/) on your wall. You want to know exactly when the next bus, tram, or metro leaves from your nearest stop — without pulling out your phone.

**MMM-BKK-Futar** connects to the [BKK FUTÁR](https://futar.bkk.hu/) real-time transit API, fetches live departure data for your configured stops, and displays them in a clean, color-coded table. GPS-based predicted times are shown in blue, so you always know if a bus is running late.

Configure your stops, filter your routes → departure times appear on your mirror. That's it.

---

## Features

- **Multiple stops** — monitor several stops at once, each in a separate section
- **Route filtering** — show only specific routes per stop (e.g. only bus 9 and tram 47)
- **Real-time data** — GPS-based predicted arrival times when available
- **BKK color codes** — route numbers with official BKK brand colors
- **Colored vehicle type icons** — Font Awesome icons with BKK brand colors (bus: blue, tram: yellow, metro: red, suburban rail: green, trolleybus: red, ferry: light blue)
- **Imminent departure highlight** — rows blink when departure is within 2 minutes
- **Relative or absolute time** — "5 min" or "14:32" format
- **Fade effect** — list gradually fades towards the bottom
- **Bilingual** — Hungarian and English language support
- **No external dependencies** — uses only Node.js built-in `https` module

---

## Preview

```
┌──────────────────────────────────────────┐
│         MÓRICZ ZSIGMOND KÖRTÉR           │
│  🟡 ■  47   Deák Ferenc tér        2m   │  ← blinking, departing soon
│  🟡 ■  49   Deák Ferenc tér        5m   │  ← blue: real-time data
│  🔵 ■   7   Bosnyák tér           12m   │
│  🔵 ■ 133E  Népliget              18m   │
│                                          │
│            SZENT GELLÉRT TÉR             │
│  🟡 ■  19   Bécsi út / Vörösvári   3m   │
│  🔵 ■  86   Óbuda, Bogdáni út     10m   │
│  🔴 ■  M4   Keleti pályaudvar     14m   │
└──────────────────────────────────────────┘
  Icons: 🔵 bus  🟡 tram  🔴 metro  🟢 rail  🔴 trolley  🔵 ferry
```

| Element | Meaning |
|---------|---------|
| Blue time | Real-time (GPS-based) predicted departure |
| White time | Scheduled departure |
| Blinking row | Departure within 2 minutes |
| Orange "now" | Departing right now |
| Fading rows | List fades towards the bottom |
| Colored badge | Official BKK route color |
| Colored icon | Vehicle type with BKK brand color (Font Awesome) |

---

## Installation

### 1. Clone the module

```bash
cd ~/MagicMirror/modules
git clone https://github.com/bohemtucsok/MMM-BKK-Futar.git
```

> This module has **no external dependencies** — no `npm install` required.

### 2. Get a BKK API key (free)

1. Visit [BKK OpenData](https://opendata.bkk.hu/)
2. Click **Register** and create an account
3. After logging in, request an **API key**
4. Copy the key — you'll need it for the configuration

### 3. Find your stop IDs

1. Open the [BKK FUTÁR map](https://futar.bkk.hu/)
2. Find and click on your desired stop
3. The stop code is visible in the info panel or URL (e.g. `F02297`)
4. Use the **`BKK_` prefix** in the configuration: `BKK_F02297`

### 4. Configure MagicMirror

Add to your `~/MagicMirror/config/config.js`:

```javascript
{
  module: "MMM-BKK-Futar",
  position: "top_left",
  config: {
    apiKey: "your-bkk-api-key",
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

### 5. Restart MagicMirror

```bash
pm2 restart magicmirror
```

---

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `apiKey` | `""` | **Required.** BKK OpenData API key |
| `stops` | `[]` | **Required.** Array of stops to monitor (see below) |
| `updateInterval` | `60000` (1min) | Update frequency (ms) |
| `minutesAfter` | `30` | Time window for upcoming departures (min) |
| `maxResults` | `5` | Max departures shown per stop |
| `showRouteType` | `true` | Show vehicle type icon |
| `showMinutesOnly` | `true` | `true`: "5 min", `false`: "14:32" |
| `language` | `"hu"` | `"hu"` (Hungarian) or `"en"` (English) |
| `coloredRoutes` | `true` | Use official BKK color codes |
| `fadePoint` | `0.25` | List fade start point (0.0 - 1.0) |

### Stop configuration (`stops[]`)

| Field | Required | Description |
|-------|----------|-------------|
| `stopId` | Yes | Stop identifier, e.g. `"BKK_F02297"` |
| `stopName` | No | Custom display name (auto-fetched from API if omitted) |
| `routeIds` | No | Filter to these routes only (all routes if omitted) |

---

## Route filtering

Routes in the `routeIds` array can be specified in two ways:

| Method | Example | When to use |
|--------|---------|-------------|
| Route short name | `"9"`, `"47"`, `"M2"` | Simple and convenient |
| BKK route ID | `"BKK_0090"`, `"BKK_0470"` | Exact match when short name is ambiguous |

If `routeIds` is not specified, **all routes** at the given stop will be displayed.

<details>
<summary><strong>Example configurations</strong></summary>

**Single stop, all routes:**
```javascript
{
  module: "MMM-BKK-Futar",
  position: "top_right",
  config: {
    apiKey: "your-api-key",
    stops: [
      { stopId: "BKK_F02297", stopName: "Deák Ferenc tér" }
    ]
  }
}
```

**Multiple stops with route filtering:**
```javascript
{
  module: "MMM-BKK-Futar",
  position: "top_left",
  config: {
    apiKey: "your-api-key",
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
    language: "en"
  }
}
```

**Minimal, absolute time, no icons:**
```javascript
{
  module: "MMM-BKK-Futar",
  position: "bottom_left",
  config: {
    apiKey: "your-api-key",
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

| Layer | Technology |
|-------|-----------|
| Frontend | MagicMirror² Module API (DOM manipulation, fade effects) |
| Backend | Node.js node_helper (socket notifications) |
| API | BKK FUTÁR real-time transit API (REST/JSON) |
| HTTP Client | Node.js built-in `https` module |
| Data | OneBusAway-compatible stop times, routes, trips |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Stuck on "Loading..." | Verify your API key and network connectivity |
| Empty list | Check stop ID on the [FUTÁR map](https://futar.bkk.hu/). No departures in the time window? |
| Module not showing | Ensure folder name is exactly `MMM-BKK-Futar` and `module` value in `config.js` matches |
| Permission error (EACCES) | `sudo chown -R $USER:$USER ~/MagicMirror` then `npm install` |

Check the MagicMirror console (`~/.pm2/logs/` or browser DevTools) for errors prefixed with `MMM-BKK-Futar:`.

---

## API Reference

This module uses the [BKK FUTÁR Travel Planner API](https://bkkfutar.docs.apiary.io/) `arrivals-and-departures-for-stop` endpoint.

- **Endpoint:** `https://futar.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json`
- **Documentation:** [bkkfutar.docs.apiary.io](https://bkkfutar.docs.apiary.io/)
- **OpenData portal:** [opendata.bkk.hu](https://opendata.bkk.hu/)

---

## Supporters

<p align="center">
  <a href="https://infotipp.hu"><img src="https://raw.githubusercontent.com/bohemtucsok/MMM-NextcloudPhotos/main/docs/images/infotipp-logo.png" height="40" alt="Infotipp Rendszerház Kft." /></a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://brutefence.com"><img src="https://raw.githubusercontent.com/bohemtucsok/MMM-NextcloudPhotos/main/docs/images/brutefence.png" height="40" alt="BruteFence" /></a>
</p>

---

## License

[MIT](LICENSE) — use it, fork it, self-host it. Contributions welcome.
