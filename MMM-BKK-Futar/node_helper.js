const NodeHelper = require("node_helper");
const https = require("https");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-BKK-Futar helper started...");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_DEPARTURES") {
      this.fetchDepartures(payload);
    }
  },

  fetchDepartures: function (config) {
    const promises = config.stops.map((stop) => this.fetchStop(config, stop));

    Promise.all(promises)
      .then((results) => {
        this.sendSocketNotification("DEPARTURES_RESULT", results);
      })
      .catch((error) => {
        console.error("MMM-BKK-Futar: Error fetching departures:", error);
        this.sendSocketNotification("DEPARTURES_ERROR", { error: error.message });
      });
  },

  fetchStop: function (config, stop) {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        stopId: stop.stopId,
        onlyDepartures: "true",
        minutesBefore: "0",
        minutesAfter: String(config.minutesAfter),
        includeReferences: "true",
        key: config.apiKey,
      });

      const url = `https://futar.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json?${params}`;

      https
        .get(url, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const json = JSON.parse(data);
              const parsed = this.parseResponse(json, stop, config);
              resolve(parsed);
            } catch (e) {
              console.error("MMM-BKK-Futar: Parse error for stop", stop.stopId, e);
              resolve({
                stopId: stop.stopId,
                stopName: stop.stopName || stop.stopId,
                departures: [],
                error: e.message,
              });
            }
          });
        })
        .on("error", (e) => {
          console.error("MMM-BKK-Futar: HTTP error for stop", stop.stopId, e);
          resolve({
            stopId: stop.stopId,
            stopName: stop.stopName || stop.stopId,
            departures: [],
            error: e.message,
          });
        });
    });
  },

  parseResponse: function (json, stop, config) {
    const entry = json.data && json.data.entry;
    const references = json.data && json.data.references;

    if (!entry || !entry.stopTimes || !references) {
      return {
        stopId: stop.stopId,
        stopName: stop.stopName || stop.stopId,
        departures: [],
      };
    }

    const routes = {};
    if (references.routes) {
      Object.keys(references.routes).forEach((key) => {
        const route = references.routes[key];
        routes[route.id] = route;
      });
    }

    const trips = {};
    if (references.trips) {
      Object.keys(references.trips).forEach((key) => {
        const trip = references.trips[key];
        trips[trip.id] = trip;
      });
    }

    // Ha az API visszaadja a megálló nevét
    let stopName = stop.stopName;
    if (!stopName && references.stops) {
      const stopKeys = Object.keys(references.stops);
      for (let i = 0; i < stopKeys.length; i++) {
        const s = references.stops[stopKeys[i]];
        if (s.id === stop.stopId) {
          stopName = s.name;
          break;
        }
      }
    }
    if (!stopName) {
      stopName = stop.stopId;
    }

    const now = Date.now();
    let departures = [];

    entry.stopTimes.forEach((stopTime) => {
      const trip = trips[stopTime.tripId];
      if (!trip) return;

      const route = routes[trip.routeId];
      if (!route) return;

      // Járatszűrés
      if (stop.routeIds && stop.routeIds.length > 0) {
        if (!stop.routeIds.includes(route.id) && !stop.routeIds.includes(route.shortName)) {
          return;
        }
      }

      const departureTime = stopTime.predictedDepartureTime || stopTime.departureTime;
      if (!departureTime) return;

      // Az API másodpercekben adja az időt
      const departureMs = departureTime * 1000;
      const minutesUntil = Math.round((departureMs - now) / 60000);

      if (minutesUntil < 0) return;

      departures.push({
        routeShortName: route.shortName || "",
        routeType: this.getRouteType(route.type),
        routeColor: route.color ? `#${route.color}` : null,
        routeTextColor: route.textColor ? `#${route.textColor}` : null,
        headsign: stopTime.stopHeadsign || trip.tripHeadsign || "",
        departureTime: departureMs,
        minutesUntil: minutesUntil,
        predicted: !!stopTime.predictedDepartureTime,
      });
    });

    // Rendezés indulási idő szerint
    departures.sort((a, b) => a.departureTime - b.departureTime);

    // Limitálás
    if (config.maxResults && departures.length > config.maxResults) {
      departures = departures.slice(0, config.maxResults);
    }

    return {
      stopId: stop.stopId,
      stopName: stopName,
      departures: departures,
    };
  },

  getRouteType: function (apiType) {
    const typeMap = {
      BUS: "bus",
      TROLLEYBUS: "trolleybus",
      TRAM: "tram",
      SUBWAY: "subway",
      RAIL: "rail",
      FERRY: "ferry",
      NIGHTBUS: "bus",
    };
    return typeMap[apiType] || "bus";
  },
});
