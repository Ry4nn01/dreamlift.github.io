window.RootClip = window.RootClip || {};

(function (RootClip) {
  "use strict";

  function isObject(v) {
    return v !== null && typeof v === "object" && !Array.isArray(v);
  }

  function has(obj, key) {
    return isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key);
  }

  function isNonEmptyString(v) {
    return typeof v === "string" && v.trim().length > 0;
  }

  // ---- Spacing rule -------------------------------------------------------

  function spacingFor(texture, thickness, guide) {
    if (guide === undefined) guide = window.MOCK && window.MOCK.guide;
    if (!isObject(guide) || !Array.isArray(guide.levels) || guide.levels.length === 0) return null;
    if (!has(guide.baseByTexture, texture) || !has(guide.thicknessShift, thickness)) return null;

    var levels = guide.levels;
    var start = levels.indexOf(guide.baseByTexture[texture]);
    var shift = guide.thicknessShift[thickness];
    if (start < 0 || typeof shift !== "number" || !isFinite(shift)) return null;

    var index = Math.round(start + shift);
    if (index < 0) index = 0;
    if (index > levels.length - 1) index = levels.length - 1;
    return levels[index];
  }

  // ---- Data validation ----------------------------------------------------

  var BANNED = [
    "back of the head", "stomach", "heated", "heating", "motor", "battery",
    "guaranteed", "proven", "reviews", "stars", "mm"
  ];

  // Word boundaries are letters only, so "10mm" is caught but "comma" is not.
  var BANNED_PATTERNS = BANNED.map(function (phrase) {
    var body = phrase
      .split(" ")
      .map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); })
      .join("\\s+");
    return { phrase: phrase, re: new RegExp("(^|[^A-Za-z])" + body + "(?![A-Za-z])", "i") };
  });

  function sameMembers(actual, expected) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false;
    var a = actual.slice().map(String).sort();
    var e = expected.slice().map(String).sort();
    for (var i = 0; i < a.length; i++) if (a[i] !== e[i]) return false;
    return true;
  }

  function validateData(mock) {
    var errors = [];
    function err(msg) { errors.push(msg); }

    function checkString(obj, key, path) {
      if (!has(obj, key)) { err(path + "." + key + " is missing."); return false; }
      if (!isNonEmptyString(obj[key])) { err(path + "." + key + " must be a non-empty string."); return false; }
      return true;
    }

    function section(key, wantArray) {
      if (!has(mock, key)) { err("MOCK." + key + " is missing."); return null; }
      var v = mock[key];
      if (wantArray ? !Array.isArray(v) : !isObject(v)) {
        err("MOCK." + key + " must be " + (wantArray ? "an array." : "an object."));
        return null;
      }
      return v;
    }

    function checkIdList(arr, path, ids, fields) {
      if (arr.length !== ids.length) err(path + " must have exactly " + ids.length + " entries (has " + arr.length + ").");
      var seen = [];
      arr.forEach(function (item, i) {
        var p = path + "[" + i + "]";
        if (!isObject(item)) { err(p + " must be an object."); return; }
        if (checkString(item, "id", p)) seen.push(item.id);
        fields.forEach(function (f) { checkString(item, f, p); });
      });
      if (!sameMembers(seen, ids)) err(path + " ids must be exactly: " + ids.join(", ") + ".");
    }

    if (!isObject(mock)) {
      err("MOCK is missing or is not an object.");
      return errors;
    }

    // product
    var product = section("product");
    if (product) {
      ["name", "pitch", "problem"].forEach(function (k) { checkString(product, k, "MOCK.product"); });
    }

    // prices
    var prices = section("prices");
    if (prices) {
      checkString(prices, "currency", "MOCK.prices");
      if (!has(prices, "price")) err("MOCK.prices.price is missing.");
      else if (prices.price !== 12) err("MOCK.prices.price must be 12 (the price for everyone).");
    }

    // evidence
    var evidence = section("evidence", true);
    if (evidence) {
      if (evidence.length !== 2) err("MOCK.evidence must have exactly 2 entries (has " + evidence.length + ").");
      evidence.forEach(function (item, i) {
        var p = "MOCK.evidence[" + i + "]";
        if (!isObject(item)) { err(p + " must be an object."); return; }
        ["stat", "text", "source"].forEach(function (k) { checkString(item, k, p); });
      });
    }

    // parts
    var parts = section("parts", true);
    if (parts) checkIdList(parts, "MOCK.parts", ["body", "spring", "prongs", "slider", "caps"], ["name", "material", "job"]);

    // worries
    var worries = section("worries", true);
    if (worries) checkIdList(worries, "MOCK.worries", ["comfort", "fit", "dent"], ["question", "answer"]);

    // guide
    var guide = section("guide");
    if (guide) {
      var lists = {};
      ["textures", "thicknesses", "levels"].forEach(function (k) {
        if (!has(guide, k)) { err("MOCK.guide." + k + " is missing."); return; }
        var v = guide[k];
        if (!Array.isArray(v) || v.length === 0 || !v.every(isNonEmptyString)) {
          err("MOCK.guide." + k + " must be a non-empty array of strings.");
          return;
        }
        lists[k] = v;
      });
      if (lists.textures && !sameMembers(lists.textures, ["straight", "wavy", "curly", "coily"])) {
        err("MOCK.guide.textures must be straight, wavy, curly, coily.");
      }
      if (lists.thicknesses && !sameMembers(lists.thicknesses, ["fine", "medium", "thick"])) {
        err("MOCK.guide.thicknesses must be fine, medium, thick.");
      }
      if (lists.levels && lists.levels.join(",") !== "narrow,medium,wide") {
        err("MOCK.guide.levels must be [\"narrow\", \"medium\", \"wide\"] in that order.");
      }

      if (!has(guide, "baseByTexture")) err("MOCK.guide.baseByTexture is missing.");
      else if (!isObject(guide.baseByTexture)) err("MOCK.guide.baseByTexture must be an object.");
      else if (lists.textures) {
        lists.textures.forEach(function (t) {
          if (!has(guide.baseByTexture, t)) err("MOCK.guide.baseByTexture has no entry for \"" + t + "\".");
          else if (!lists.levels || lists.levels.indexOf(guide.baseByTexture[t]) < 0) {
            err("MOCK.guide.baseByTexture." + t + " must be one of guide.levels.");
          }
        });
      }

      if (!has(guide, "thicknessShift")) err("MOCK.guide.thicknessShift is missing.");
      else if (!isObject(guide.thicknessShift)) err("MOCK.guide.thicknessShift must be an object.");
      else if (lists.thicknesses) {
        lists.thicknesses.forEach(function (t) {
          if (!has(guide.thicknessShift, t)) err("MOCK.guide.thicknessShift has no entry for \"" + t + "\".");
          else {
            var n = guide.thicknessShift[t];
            if (typeof n !== "number" || !isFinite(n) || Math.round(n) !== n) {
              err("MOCK.guide.thicknessShift." + t + " must be a whole number.");
            }
          }
        });
      }

      if (!has(guide, "levelText")) err("MOCK.guide.levelText is missing.");
      else if (!isObject(guide.levelText)) err("MOCK.guide.levelText must be an object.");
      else {
        (lists.levels || ["narrow", "medium", "wide"]).forEach(function (l) {
          checkString(guide.levelText, l, "MOCK.guide.levelText");
        });
      }
    }

    // modes
    var modes = section("modes", true);
    if (modes) {
      var modeIds = ["wash-night", "day-two", "daytime"];
      var expected = {
        "wash-night": { hair: "damp", satin: true },
        "day-two": { hair: "dry", satin: true },
        "daytime": { hair: "dry", satin: false }
      };
      if (modes.length !== 3) err("MOCK.modes must have exactly 3 entries (has " + modes.length + ").");
      var seenModes = [];
      modes.forEach(function (m, i) {
        var p = "MOCK.modes[" + i + "]";
        if (!isObject(m)) { err(p + " must be an object."); return; }
        if (checkString(m, "id", p)) { seenModes.push(m.id); p = "MOCK.modes \"" + m.id + "\""; }
        checkString(m, "label", p);
        checkString(m, "hair", p);
        if (!has(m, "satin")) err(p + ".satin is missing.");
        else if (typeof m.satin !== "boolean") err(p + ".satin must be true or false.");

        var stepsOk = false;
        if (!has(m, "steps")) err(p + ".steps is missing.");
        else if (!Array.isArray(m.steps) || m.steps.length < 3 || !m.steps.every(isNonEmptyString)) {
          err(p + ".steps must be an array of at least 3 non-empty strings.");
        } else stepsOk = true;

        var rule = expected[m.id];
        if (!rule) return;
        if (typeof m.hair === "string" && m.hair !== rule.hair) err(p + ".hair must be \"" + rule.hair + "\".");
        if (typeof m.satin === "boolean" && m.satin !== rule.satin) err(p + ".satin must be " + rule.satin + ".");
        if (!stepsOk) return;
        if (rule.satin) {
          var mentions = m.steps.some(function (s) { return /satin/i.test(s); });
          if (!mentions) err(p + " must have at least one step that mentions \"satin\".");
        } else {
          m.steps.forEach(function (s, j) {
            if (/put\s+on/i.test(s) && /satin/i.test(s)) {
              err(p + ".steps[" + j + "] must not tell you to put on the satin tips.");
            }
          });
        }
      });
      if (!sameMembers(seenModes, modeIds)) err("MOCK.modes ids must be exactly: " + modeIds.join(", ") + ".");
    }

    // copy
    var copy = section("copy");
    if (copy) {
      checkString(copy, "banner", "MOCK.copy");
      checkString(copy, "emailError", "MOCK.copy");
      if (checkString(copy, "thanks", "MOCK.copy") && copy.thanks.indexOf("{price}") < 0) {
        err("MOCK.copy.thanks must contain \"{price}\".");
      }
      if (!has(copy, "ui")) err("MOCK.copy.ui is missing.");
      else if (!isObject(copy.ui)) err("MOCK.copy.ui must be an object.");
      else {
        Object.keys(copy.ui).forEach(function (k) {
          if (typeof copy.ui[k] !== "string") err("MOCK.copy.ui." + k + " must be a string.");
        });
      }
    }

    // banned words, every string anywhere in MOCK
    var seenObjects = [];
    (function scan(value, path) {
      if (typeof value === "string") {
        BANNED_PATTERNS.forEach(function (b) {
          if (b.re.test(value)) err(path + " contains the banned word \"" + b.phrase + "\".");
        });
        return;
      }
      if (value === null || typeof value !== "object") return;
      if (seenObjects.indexOf(value) >= 0) return;
      seenObjects.push(value);
      if (Array.isArray(value)) {
        value.forEach(function (v, i) { scan(v, path + "[" + i + "]"); });
      } else {
        Object.keys(value).forEach(function (k) {
          scan(value[k], path + "." + k);
        });
      }
    })(mock, "MOCK");

    return errors;
  }

  RootClip.spacingFor = spacingFor;
  RootClip.validateData = function (mock) {
    try {
      return validateData(mock);
    } catch (e) {
      return ["MOCK could not be checked: " + (e && e.message ? e.message : String(e))];
    }
  };
})(window.RootClip);
