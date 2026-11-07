window.RootClip = window.RootClip || {};

(function (RootClip) {
  "use strict";

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
    curly: { fine: "medium", medium: "wide", thick: "wide" },
    coily: { fine: "medium", medium: "wide", thick: "wide" }
  };
  Object.keys(TABLE).forEach(function (texture) {
    Object.keys(TABLE[texture]).forEach(function (thickness) {
      var want = TABLE[texture][thickness];
      test("spacingFor(" + texture + ", " + thickness + ") = " + want, function () {
        eq(RootClip.spacingFor(texture, thickness), want);
      });
    });
  });

  // ---- Price: $12 for everyone ----

  test("price() is 12", function () {
    eq(RootClip.price(), 12);
  });

  test("price() is the same every time (no random price, nothing stored)", function () {
    for (var i = 0; i < 50; i++) eq(RootClip.price(), 12, "call " + i);
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

  test("validateData rejects a guide without coily hair", function () {
    expectRejected(function (m) {
      m.guide.textures = ["straight", "wavy", "curly"];
    }, "no coily");
  });

  test("validateData rejects a copy missing product.pitch", function () {
    expectRejected(function (m) { delete m.product.pitch; }, "missing pitch");
  });

  test("validateData rejects a price other than 12", function () {
    expectRejected(function (m) { m.prices.price = 15; }, "price 15");
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
