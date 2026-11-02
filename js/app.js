window.RootClip = window.RootClip || {};

(function (RootClip) {
  "use strict";

  function showErrors(errors) {
    var app = document.getElementById("app");
    if (!app) return;
    var ui = window.MOCK && window.MOCK.copy && window.MOCK.copy.ui;
    var heading = ui && typeof ui.validationHeading === "string" && ui.validationHeading
      ? ui.validationHeading
      : "Data errors";

    while (app.firstChild) app.removeChild(app.firstChild);
    var h1 = document.createElement("h1");
    h1.textContent = heading;
    app.appendChild(h1);
    var ul = document.createElement("ul");
    errors.forEach(function (msg) {
      var li = document.createElement("li");
      li.textContent = msg;
      ul.appendChild(li);
    });
    app.appendChild(ul);
  }

  function boot() {
    var errors = RootClip.validateData(window.MOCK);
    if (errors.length) {
      showErrors(errors);
      return;
    }
    var banner = document.getElementById("banner");
    if (banner) banner.textContent = window.MOCK.copy.banner;
    RootClip.startRouter();
  }

  document.addEventListener("DOMContentLoaded", boot);
})(window.RootClip);
