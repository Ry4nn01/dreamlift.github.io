window.RootClip = window.RootClip || {};

(function (RootClip) {
  "use strict";

  // Hash -> view name, route-title key in MOCK.copy.ui, and whether the sticky
  // Preorder bar shows (not on the preorder and thanks pages themselves).
  var ROUTES = {
    "#/": { view: "landing", title: "routeHomeTitle", cta: true },
    "#/why": { view: "why", title: "routeWhyTitle", cta: true },
    "#/how": { view: "how", title: "routeHowTitle", cta: true },
    "#/about": { view: "about", title: "routeAboutTitle", cta: true },
    "#/guide": { view: "guide", title: "routeGuideTitle", cta: true },
    "#/preorder": { view: "preorder", title: "routePreorderTitle", cta: false },
    "#/thanks": { view: "thanks", title: "routeThanksTitle", cta: false }
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
    setMenuOpen(false);
    var bar = document.getElementById("cta-bar");
    if (bar) bar.hidden = !ROUTES[route].cta;

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

  // Phone menu: the Menu button opens and closes the nav list (css/base.css
  // shows it inline on wider screens). It closes on every route change and on Escape.
  function setMenuOpen(open) {
    var header = document.getElementById("header");
    var toggle = document.getElementById("menu-toggle");
    if (!header || !toggle) return;
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setupMenu() {
    var toggle = document.getElementById("menu-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        toggle.focus();
      }
    });
  }

  var started = false;

  RootClip.startRouter = function () {
    if (started) return;
    started = true;
    setupMenu();
    window.addEventListener("hashchange", render);
    render();
  };
})(window.RootClip);
