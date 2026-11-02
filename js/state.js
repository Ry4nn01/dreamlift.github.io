window.RootClip = window.RootClip || {};

(function (RootClip) {
  "use strict";

  var PRICE_KEY = "rootclip.priceArm";
  var ARMS = [15, 12];

  // Try/catch wrapper around localStorage. get returns null on any failure;
  // set returns true on success and false when storage is missing or throws.
  var store = {
    get: function (key) {
      try {
        if (typeof localStorage === "undefined" || !localStorage) return null;
        var value = localStorage.getItem(key);
        return value === undefined ? null : value;
      } catch (e) {
        return null;
      }
    },
    set: function (key, value) {
      try {
        if (typeof localStorage === "undefined" || !localStorage) return false;
        localStorage.setItem(key, String(value));
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  // Only the exact strings "15" and "12" count (so "0xF" or "15.0" are ignored).
  function toArm(value) {
    if (value === null || value === undefined) return null;
    var s = String(value);
    return s === "15" ? 15 : s === "12" ? 12 : null;
  }

  // Returns the first price= value in the query string that is 15 or 12.
  function armFromSearch(search) {
    if (typeof search !== "string" || !search) return null;
    var query = search.charAt(0) === "?" ? search.slice(1) : search;
    var pairs = query.split("&");
    for (var i = 0; i < pairs.length; i++) {
      var eq = pairs[i].indexOf("=");
      if (eq < 0) continue;
      var name;
      var value;
      try {
        name = decodeURIComponent(pairs[i].slice(0, eq).replace(/\+/g, " "));
        value = decodeURIComponent(pairs[i].slice(eq + 1).replace(/\+/g, " "));
      } catch (e) {
        continue;
      }
      if (name === "price") {
        var arm = toArm(value);
        if (arm !== null) return arm;
      }
    }
    return null;
  }

  function randomArm() {
    return Math.random() < 0.5 ? ARMS[0] : ARMS[1];
  }

  // Random arm cached for this page load, used only with the default store
  // when storage is blocked, so the real app shows one price per load.
  var pageLoadFallback = null;

  function priceArm(search, storeArg) {
    if (search === undefined) {
      search = typeof location !== "undefined" && location ? location.search : "";
    }
    var s = storeArg === undefined ? RootClip.store : storeArg;
    var isDefaultStore = s === store;
    var storageOk = !!(s && typeof s.get === "function" && typeof s.set === "function");

    function save(arm) {
      if (!storageOk) return false;
      try {
        return s.set(PRICE_KEY, String(arm)) !== false;
      } catch (e) {
        return false;
      }
    }

    // 1. URL override wins and is stored.
    var fromUrl = armFromSearch(search);
    if (fromUrl !== null) {
      save(fromUrl);
      return fromUrl;
    }

    // 2. Stored value is reused.
    if (storageOk) {
      try {
        var stored = toArm(s.get(PRICE_KEY));
        if (stored !== null) return stored;
      } catch (e) {
        storageOk = false;
      }
    }

    // 4. (already failed this load) reuse the page-load fallback.
    if (isDefaultStore && pageLoadFallback !== null) return pageLoadFallback;

    // 3. Random 50/50, stored. If storing fails, it holds for this load only.
    var arm = randomArm();
    if (!save(arm) && isDefaultStore) pageLoadFallback = arm;
    return arm;
  }

  var preordered = false;

  RootClip.store = store;
  RootClip.priceArm = priceArm;
  RootClip.setPreordered = function () {
    preordered = true;
  };
  RootClip.hasPreordered = function () {
    return preordered;
  };
})(window.RootClip);
