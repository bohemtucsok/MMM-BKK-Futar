# MMM-BKK-Futar

> A MagicMirror² module for displaying real-time Budapest public transport departure information using the [BKK FUTÁR](https://futar.bkk.hu/) API.

**[Magyar nyelv (Hungarian)](MMM-BKK-Futar/README.hu.md)**

---

## Preview

```
┌──────────────────────────────────────┐
│       MÓRICZ ZSIGMOND KÖRTÉR         │
│  🚊  47   Deák Ferenc tér        2m │  ← blinking, departing soon
│  🚊  49   Deák Ferenc tér        5m │  ← blue: real-time data
│  🚍   7   Bosnyák tér           12m │
│  🚍 133E  Népliget              18m │
│                                      │
│          SZENT GELLÉRT TÉR           │
│  🚊  19   Bécsi út / Vörösvári  3m  │
│  🚍  86   Óbuda, Bogdáni út    10m  │
│  🚇  M4   Keleti pályaudvar    14m  │
└──────────────────────────────────────┘
```

## Features

- **Multiple stops** — monitor several stops at once, each displayed in a separate section
- **Route filtering** — show only specific routes per stop (e.g. only bus 9 and tram 47)
- **Real-time data** — uses BKK FUTÁR GPS-based predicted arrival times when available
- **BKK color codes** — route numbers displayed with official BKK brand colors
- **Vehicle type icons** — bus 🚍, tram 🚊, metro 🚇, suburban rail 🚆, trolleybus 🚎, ferry ⛴️
- **Imminent departure highlight** — rows blink when departure is within 2 minutes
- **Relative or absolute time** — display "5 min" or "14:32" format
- **Fade effect** — list gradually fades towards the bottom
- **Bilingual** — Hungarian and English language support
- **No external dependencies** — uses only Node.js built-in `https` module

---

## Installation

### 1. Download the module

Navigate to your MagicMirror `modules` directory and clone the repository:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/bohemtucsok/MMM-BKK-Futar.git
```

Or manually copy the `MMM-BKK-Futar` folder into the `modules/` directory.

> This module has **no external dependencies** — no `npm install` required.

### 2. Get a BKK API key

The module uses the BKK open data platform API. The API key is free.

1. Visit [BKK OpenData](https://opendata.bkk.hu/)
2. Click **Register** and create an account
3. After logging in, request an **API key**
4. Copy the key — you'll need it for the configuration

### 3. Find your stop IDs

Every stop has a unique identifier that can be found on the FUTÁR map:

1. Open the [BKK FUTÁR map](https://futar.bkk.hu/)
2. Find and click on your desired stop
3. The stop code is visible in the info panel or URL (e.g. `F02297`)
4. Use the **`BKK_` prefix** in the configuration: `BKK_F02297`

### 4. MagicMirror configuration

Add the module to the `modules` array in your `config/config.js`:

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

---

## Configuration

### Main options

| Option | Type | Default | Description |
|:-------|:-----|:-------:|:------------|
| `apiKey` | String | `""` | **Required.** BKK OpenData API key |
| `stops` | Array | `[]` | **Required.** Array of stops to monitor (see below) |
| `updateInterval` | Number | `60000` | Update frequency in milliseconds (default: 1 min) |
| `minutesAfter` | Number | `30` | Time window for upcoming departures in minutes |
| `maxResults` | Number | `5` | Maximum number of departures shown per stop |
| `showRouteType` | Boolean | `true` | Show vehicle type icon |
| `showMinutesOnly` | Boolean | `true` | `true`: "5 min", `false`: "14:32" format |
| `language` | String | `"hu"` | Language: `"hu"` (Hungarian) or `"en"` (English) |
| `coloredRoutes` | Boolean | `true` | Use official BKK color codes for route numbers |
| `fadePoint` | Number | `0.25` | Start point of list fade effect (0.0 - 1.0) |

### Stop configuration (`stops[]`)

| Field | Type | Required | Description |
|:------|:-----|:--------:|:------------|
| `stopId` | String | Yes | Stop identifier, e.g. `"BKK_F02297"` |
| `stopName` | String | No | Custom display name. If omitted, the name is fetched from the API |
| `routeIds` | Array | No | Filter to show only these routes. If empty or omitted, all routes are shown |

---

## Route filtering

Routes in the `routeIds` array can be specified in two ways:

| Method | Example | When to use |
|:-------|:--------|:------------|
| Route short name | `"9"`, `"47"`, `"M2"` | Simple and convenient |
| BKK route ID | `"BKK_0090"`, `"BKK_0470"` | Exact match when the short name is ambiguous |

**Example:** Show only bus 9 and tram 47:

```javascript
routeIds: ["9", "47"]
```

**Tip:** If `routeIds` is not specified, **all routes** at the given stop will be displayed.

---

## Visual guide

| Element | Description |
|:--------|:------------|
| Blue time | Real-time (GPS-based) predicted departure time |
| White time | Scheduled departure time |
| Blinking row | Departure within 2 minutes |
| Orange "now" | Departing right now |
| Fading rows | List gradually fades towards the bottom |
| Colored route number | Official BKK background color on the route badge |

---

## Architecture

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

1. The **frontend** (`MMM-BKK-Futar.js`) sends a `GET_DEPARTURES` message to the backend on start and periodically
2. The **backend** (`node_helper.js`) fetches data from the BKK API for all configured stops in parallel
3. It parses the response, resolves route/trip references, filters routes, and sends back a `DEPARTURES_RESULT` message
4. The frontend builds the DOM and renders the departure table

---

## File structure

```
MMM-BKK-Futar/
├── MMM-BKK-Futar.js    # Frontend module (MagicMirror Module class)
├── node_helper.js       # Backend (BKK API calls, data processing)
├── MMM-BKK-Futar.css    # Display styles
├── package.json         # Module metadata
├── README.md            # English documentation
└── README.hu.md         # Hungarian documentation
```

---

## Example configurations

### Single stop, all routes

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

### Multiple stops with route filtering

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

### Minimal, absolute time, no icons

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

---

## Troubleshooting

| Problem | Solution |
|:--------|:---------|
| Stuck on "Loading..." | Verify your API key and network connectivity |
| Empty list | Check the stop ID on the [FUTÁR map](https://futar.bkk.hu/). There may be no departures within the configured time window |
| Module not showing | Ensure the module folder is named exactly `MMM-BKK-Futar` and the `module` value in `config.js` matches |
| Permission error (EACCES) | Run `sudo chown -R $USER:$USER ~/MagicMirror` then `npm install` |

Check the MagicMirror console (`~/.pm2/logs/` or browser DevTools) for error messages prefixed with `MMM-BKK-Futar:`.

---

## API

This module uses the [BKK FUTÁR Travel Planner API](https://bkkfutar.docs.apiary.io/) `arrivals-and-departures-for-stop` endpoint.

- **Endpoint:** `https://futar.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json`
- **Documentation:** [bkkfutar.docs.apiary.io](https://bkkfutar.docs.apiary.io/)
- **OpenData portal:** [opendata.bkk.hu](https://opendata.bkk.hu/)

---

## License

MIT
