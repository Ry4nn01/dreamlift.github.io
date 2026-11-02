window.RootClip = window.RootClip || {};

(function (RootClip) {
  "use strict";

  // The preorder price: $12 for everyone (the $15 vs $12 test was switched off).
  // It comes from the mock data so there's one place to change it.
  function price() {
    var m = window.MOCK;
    return m && m.prices && typeof m.prices.price === "number" ? m.prices.price : 12;
  }

  var preordered = false;

  RootClip.price = price;
  RootClip.setPreordered = function () {
    preordered = true;
  };
  RootClip.hasPreordered = function () {
    return preordered;
  };
})(window.RootClip);
