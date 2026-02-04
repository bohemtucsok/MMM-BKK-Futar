Module.register("MMM-BKK-Futar", {
  defaults: {
    apiKey: "",
    stops: [],
    updateInterval: 60000,
    minutesAfter: 30,
    maxResults: 5,
    showRouteType: true,
    showMinutesOnly: true,
    language: "hu",
    coloredRoutes: true,
    fadePoint: 0.25,
  },

  getStyles: function () {
    return ["MMM-BKK-Futar.css"];
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    this.departureData = null;
    this.loaded = false;
    this.errorMessage = null;
    this.getData();
    this.scheduleUpdate();
  },

  getData: function () {
    this.sendSocketNotification("GET_DEPARTURES", this.config);
  },

  scheduleUpdate: function () {
    var self = this;
    setInterval(function () {
      self.getData();
    }, this.config.updateInterval);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "DEPARTURES_RESULT") {
      this.departureData = payload;
      this.loaded = true;
      this.errorMessage = null;
      this.updateDom();
    } else if (notification === "DEPARTURES_ERROR") {
      this.errorMessage = payload.error;
      this.updateDom();
    }
  },

  getDom: function () {
    var wrapper = document.createElement("div");
    wrapper.className = "mmm-bkk-futar";

    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className += " dimmed light small";
      return wrapper;
    }

    if (this.errorMessage) {
      wrapper.innerHTML = "Hiba: " + this.errorMessage;
      wrapper.className += " dimmed light small";
      return wrapper;
    }

    if (!this.departureData || this.departureData.length === 0) {
      wrapper.innerHTML = this.getTranslation("NO_DATA");
      wrapper.className += " dimmed light small";
      return wrapper;
    }

    for (var s = 0; s < this.departureData.length; s++) {
      var stopData = this.departureData[s];
      var stopSection = this.createStopSection(stopData, s);
      wrapper.appendChild(stopSection);
    }

    return wrapper;
  },

  createStopSection: function (stopData, index) {
    var section = document.createElement("div");
    section.className = "stop-section";

    if (index > 0) {
      section.className += " stop-separator";
    }

    // Megálló neve
    var header = document.createElement("div");
    header.className = "stop-header light small dimmed";
    header.textContent = stopData.stopName;
    section.appendChild(header);

    if (!stopData.departures || stopData.departures.length === 0) {
      var noData = document.createElement("div");
      noData.className = "dimmed light xsmall";
      noData.textContent = this.getTranslation("NO_DEPARTURES");
      section.appendChild(noData);
      return section;
    }

    // Indulási táblázat
    var table = document.createElement("table");
    table.className = "departure-table small";

    var totalDepartures = stopData.departures.length;

    for (var i = 0; i < totalDepartures; i++) {
      var departure = stopData.departures[i];
      var row = this.createDepartureRow(departure, i, totalDepartures);
      table.appendChild(row);
    }

    section.appendChild(table);
    return section;
  },

  createDepartureRow: function (departure, index, total) {
    var row = document.createElement("tr");
    row.className = "departure-row";

    // Fade effekt
    if (this.config.fadePoint < 1) {
      var startFade = total * this.config.fadePoint;
      if (index >= startFade) {
        var fadeStep = 1 / (total - startFade);
        var opacity = 1 - (index - startFade) * fadeStep;
        row.style.opacity = Math.max(opacity, 0.2);
      }
    }

    // Hamarosan induló kiemelés
    if (departure.minutesUntil <= 2) {
      row.className += " departure-soon";
    }

    // Járat típus ikon
    if (this.config.showRouteType) {
      var iconCell = document.createElement("td");
      iconCell.className = "route-icon";
      iconCell.textContent = this.getRouteIcon(departure.routeType);
      row.appendChild(iconCell);
    }

    // Járatszám
    var numberCell = document.createElement("td");
    numberCell.className = "route-number bright";
    numberCell.textContent = departure.routeShortName;

    if (this.config.coloredRoutes && departure.routeColor) {
      numberCell.style.backgroundColor = departure.routeColor;
      numberCell.style.color = departure.routeTextColor || "#FFFFFF";
      numberCell.className += " route-badge";
    }

    row.appendChild(numberCell);

    // Végállomás
    var destCell = document.createElement("td");
    destCell.className = "destination light";
    destCell.textContent = departure.headsign;
    row.appendChild(destCell);

    // Indulási idő
    var timeCell = document.createElement("td");
    timeCell.className = "departure-time light";

    if (departure.minutesUntil === 0) {
      timeCell.textContent = this.getTranslation("NOW");
      timeCell.className += " departure-now";
    } else if (this.config.showMinutesOnly) {
      timeCell.textContent = departure.minutesUntil + " " + this.getTranslation("MIN");
    } else {
      var date = new Date(departure.departureTime);
      var hours = String(date.getHours()).padStart(2, "0");
      var mins = String(date.getMinutes()).padStart(2, "0");
      timeCell.textContent = hours + ":" + mins;
    }

    // Valós idejű jelző
    if (departure.predicted) {
      timeCell.className += " predicted";
    }

    row.appendChild(timeCell);

    return row;
  },

  getRouteIcon: function (routeType) {
    var icons = {
      bus: "🚍",
      trolleybus: "🚎",
      tram: "🚊",
      subway: "🚇",
      rail: "🚆",
      ferry: "⛴️",
    };
    return icons[routeType] || "🚍";
  },

  getTranslation: function (key) {
    var translations = {
      hu: {
        LOADING: "Betöltés...",
        NO_DATA: "Nincs adat",
        NO_DEPARTURES: "Nincs induló járat",
        NOW: "most",
        MIN: "perc",
      },
      en: {
        LOADING: "Loading...",
        NO_DATA: "No data",
        NO_DEPARTURES: "No departures",
        NOW: "now",
        MIN: "min",
      },
    };

    var lang = this.config.language || "hu";
    var t = translations[lang] || translations["hu"];
    return t[key] || key;
  },
});
