window.RootClip = window.RootClip || {};

(function (RootClip) {
  "use strict";

  // Hash -> view name and route-title key in MOCK.copy.ui.
  var ROUTES = {
    "#/": { view: "landing", title: "routeHomeTitle" },
    "#/guide": { view: "guide", title: "routeGuideTitle" },
    "#/preorder": { view: "preorder", title: "routePreorderTitle" },
    "#/thanks": { view: "thanks", title: "routeThanksTitle" }
  };
  var HOME = "#/";

  // Empty or unknown hash falls back to Home. Any ?query after the hash is ignored.
  function currentRoute() {
    var hash = (window.location && window.location.hash) || "";
    var q = hash.indexOf("?");
    if (q >= 0) hash = hash.slice(0, q);
    return Object.prototype.hasOwnProperty.call(ROUTES, hash) ? hash : HOME;
  }

  function setTitle(route) {
    var mock = window.MOCK || {};
    var ui = (mock.copy && mock.copy.ui) || {};
    var name = (mock.product && mock.product.name) || "";
    var routeTitle = ui[ROUTES[route].title] || "";
    document.title = routeTitle && name ? routeTitle + " · " + name : (routeTitle || name);
  }

  function setCurrentLink(route) {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var links = nav.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      var linkHash = href.charAt(0) === "#" ? href : href.slice(href.indexOf("#"));
      if (linkHash === route) links[i].setAttribute("aria-current", "page");
      else links[i].removeAttribute("aria-current");
    }
  }

  function render() {
    var route = currentRoute();
    var viewName = ROUTES[route].view;

    window.scrollTo(0, 0);
    setTitle(route);
    setCurrentLink(route);

    var views = RootClip.views || {};
    var view = views[viewName];
    if (typeof view !== "function") {
      console.error("RootClip router: view \"" + viewName + "\" for route " + route + " is missing.");
      return;
    }
    var el = document.getElementById("app");
    if (!el) {
      console.error("RootClip router: #app element is missing.");
      return;
    }
    view(el);
  }

  var started = false;

  RootClip.startRouter = function () {
    if (started) return;
    started = true;
    window.addEventListener("hashchange", render);
    render();
  };
})(window.RootClip);
