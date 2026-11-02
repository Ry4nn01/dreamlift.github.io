window.RootClip = window.RootClip || {};

(function (RootClip) {
  "use strict";

  var KEY = "rootclip.priceArm";
  var tests = [];

  function test(name, fn) { tests.push({ name: name, fn: fn }); }

  function assert(cond, msg) { if (!cond) throw new Error(msg || "assertion failed"); }

  function eq(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error((msg ? msg + ": " : "") + "expected " + JSON.stringify(expected) +
        ", got " + JSON.stringify(actual));
    }
  }

  function copyMock() { return JSON.parse(JSON.stringify(window.MOCK)); }

  // Fake store with the same get/set shape as RootClip.store. Never touches localStorage.
  function fakeStore(initial) {
    var data = {};
    if (initial !== undefined) data[KEY] = initial;
    return {
      data: data,
      get: function (k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
      set: function (k, v) { data[k] = String(v); return true; }
    };
  }

  function throwingStore() {
    return {
      get: function () { throw new Error("storage blocked"); },
      set: function () { throw new Error("storage blocked"); }
    };
  }

  function isArm(n) { return n === 15 || n === 12; }

  function bannedErrors(errors) {
    return errors.filter(function (e) { return e.indexOf("banned word") >= 0; });
  }

  function expectRejected(mutate, label) {
    var m = copyMock();
    mutate(m);
    var errors = RootClip.validateData(m);
    assert(errors.length > 0, label + " should produce at least one error");
  }

  // ---- Data contract ----

  test("validateData(MOCK) returns []", function () {
    var errors = RootClip.validateData(window.MOCK);
    assert(Array.isArray(errors), "result is not an array");
    eq(errors.length, 0, "errors: " + errors.join(" | "));
  });

  // ---- Spacing table (CLAUDE.md section 4) ----

  var TABLE = {
    straight: { fine: "narrow", medium: "narrow", thick: "medium" },
    wavy: { fine: "narrow", medium: "medium", thick: "wide" },
    curly: { fine: "medium", medium: "wide", thick: "wide" }
  };
  Object.keys(TABLE).forEach(function (texture) {
    Object.keys(TABLE[texture]).forEach(function (thickness) {
      var want = TABLE[texture][thickness];
      test("spacingFor(" + texture + ", " + thickness + ") = " + want, function () {
        eq(RootClip.spacingFor(texture, thickness), want);
      });
    });
  });

  // ---- Price arm (fake stores only, search always explicit) ----

  test("priceArm: ?price=12 gives 12 and stores it", function () {
    var s = fakeStore();
    eq(RootClip.priceArm("?price=12", s), 12);
    eq(s.data[KEY], "12", "stored value");
  });

  test("priceArm: ?price=15 gives 15 and stores it", function () {
    var s = fakeStore("12");
    eq(RootClip.priceArm("?price=15", s), 15);
    eq(s.data[KEY], "15", "stored value");
  });

  test("priceArm: ?price=10 is ignored and the stored value is reused", function () {
    var s = fakeStore("12");
    eq(RootClip.priceArm("?price=10", s), 12);
    eq(s.data[KEY], "12", "stored value unchanged");
  });

  test("priceArm: stored \"12\" is reused with an empty search", function () {
    var s = fakeStore("12");
    eq(RootClip.priceArm("", s), 12);
  });

  test("priceArm: empty store gives 15 or 12 and stores it", function () {
    var s = fakeStore();
    var arm = RootClip.priceArm("", s);
    assert(isArm(arm), "got " + arm);
    eq(s.data[KEY], String(arm), "stored value");
  });

  test("priceArm: store whose get/set throw gives 15 or 12", function () {
    var arm = RootClip.priceArm("", throwingStore());
    assert(isArm(arm), "got " + arm);
    var arm2 = RootClip.priceArm("?price=12", throwingStore());
    eq(arm2, 12, "URL override with throwing store");
  });

  // ---- Banned words ----

  test("real MOCK has zero banned-word errors", function () {
    var found = bannedErrors(RootClip.validateData(window.MOCK));
    eq(found.length, 0, found.join(" | "));
  });

  test("validateData flags a banned word injected into a copy (\"proven\" in a worry answer)", function () {
    var m = copyMock();
    m.worries[0].answer += " It is proven to work.";
    var found = bannedErrors(RootClip.validateData(m));
    assert(found.length > 0, "no banned-word error");
    assert(found.join(" ").indexOf("proven") >= 0, "error does not name \"proven\"");
  });

  // ---- validateData rejects broken copies ----

  test("validateData rejects a copy missing product.pitch", function () {
    expectRejected(function (m) { delete m.product.pitch; }, "missing pitch");
  });

  test("validateData rejects prices.arms [15, 10]", function () {
    expectRejected(function (m) { m.prices.arms = [15, 10]; }, "arms [15, 10]");
  });

  test("validateData rejects copy.thanks without {price}", function () {
    expectRejected(function (m) { m.copy.thanks = "Thanks for preordering."; }, "thanks without {price}");
  });

  test("validateData rejects a daytime step \"Put on the satin tips.\"", function () {
    expectRejected(function (m) {
      m.modes.forEach(function (mode) {
        if (mode.id === "daytime") mode.steps.push("Put on the satin tips.");
      });
    }, "daytime satin step");
  });

  test("validateData rejects null", function () {
    var errors = RootClip.validateData(null);
    assert(Array.isArray(errors) && errors.length > 0, "null should produce an error");
  });

  // ---- Preorder flag ----

  test("setPreordered flips hasPreordered to true", function () {
    eq(RootClip.hasPreordered(), false, "before");
    RootClip.setPreordered();
    eq(RootClip.hasPreordered(), true, "after");
  });

  // ---- Runner ----

  function run() {
    var list = document.getElementById("results");
    var totalEl = document.getElementById("total");
    var passed = 0;
    var failed = 0;

    tests.forEach(function (t) {
      var li = document.createElement("li");
      var ok = true;
      var message = "";
      try {
        t.fn();
      } catch (e) {
        ok = false;
        message = e && e.message ? e.message : String(e);
      }
      if (ok) passed++; else failed++;
      li.className = ok ? "pass" : "fail";
      li.textContent = (ok ? "PASS " : "FAIL ") + t.name;
      if (!ok) {
        var pre = document.createElement("pre");
        pre.textContent = message;
        li.appendChild(pre);
      }
      if (list) list.appendChild(li);
    });

    if (totalEl) {
      totalEl.textContent = passed + " passed, " + failed + " failed";
      totalEl.className = "total " + (failed === 0 ? "pass" : "fail");
    }
    document.body.className = failed === 0 ? "all-pass" : "has-fail";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})(window.RootClip);
