/*
 * #/ view: landing page and the clip drawing.
 *
 * Class names used (for css/landing.css):
 *   Sections: landing, hero, pitch, problem, evidence, how, parts, worries, price
 *   Hero:     clip-figure, clip, clip-caption, clip-3d-label, clip-3d, actions, btn, link
 *   Clip SVG: clip-body, clip-hinge, clip-spring, clip-track, clip-slider,
 *             clip-prong, clip-satin
 *   Stats:    stats, stat, stat-big, stat-text, stat-source
 *   Steps:    steps
 *   Parts:    part, part-name, part-material, part-job
 *   Worries:  worry, worry-q, worry-a
 *   Price:    price-amount, price-note
 */
window.RootClip = window.RootClip || {};
RootClip.views = RootClip.views || {};

(function (RootClip) {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function link(href, className, text) {
    var a = make("a", className, text);
    a.setAttribute("href", href);
    return a;
  }

  function section(className, headingText) {
    var s = make("section", className);
    if (headingText !== undefined) s.appendChild(make("h2", null, headingText));
    return s;
  }

  // ---- Clip drawing (static shapes, front view of ONE clip) -------------

  function svgEl(tag, attrs) {
    var node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function clipSvg(label) {
    var svg = svgEl("svg", {
      viewBox: "0 0 240 150",
      "class": "clip",
      role: "img",
      focusable: "false"
    });
    svg.setAttribute("aria-label", label);

    // Spring coil on top of the hinge.
    var spring = svgEl("g", {
      "class": "clip-spring", fill: "none", stroke: "currentColor", "stroke-width": "2"
    });
    for (var i = 0; i < 5; i++) {
      spring.appendChild(svgEl("ellipse", { cx: String(106 + i * 7), cy: "13", rx: "4", ry: "7" }));
    }
    svg.appendChild(spring);

    // Hinge pin running through the coil.
    svg.appendChild(svgEl("line", {
      "class": "clip-hinge", x1: "96", y1: "13", x2: "144", y2: "13",
      stroke: "currentColor", "stroke-width": "3", "stroke-linecap": "round"
    }));

    // Prongs: comb-style, rounded ends, hanging from the body.
    var prongs = svgEl("g", {
      "class": "clip-prong", fill: "currentColor", "fill-opacity": "0.25",
      stroke: "currentColor", "stroke-width": "2"
    });
    var satin = svgEl("g", {
      "class": "clip-satin", fill: "#d9a5b3", stroke: "currentColor", "stroke-width": "1.5"
    });
    for (var p = 0; p < 7; p++) {
      var cx = 45 + p * 25;
      prongs.appendChild(svgEl("rect", {
        x: String(cx - 5), y: "40", width: "10", height: "92", rx: "5"
      }));
      satin.appendChild(svgEl("rect", {
        x: String(cx - 7), y: "120", width: "14", height: "24", rx: "7"
      }));
    }
    svg.appendChild(prongs);
    svg.appendChild(satin);

    // Body and hinge bar.
    svg.appendChild(svgEl("rect", {
      "class": "clip-body", x: "28", y: "20", width: "184", height: "28", rx: "9",
      fill: "currentColor", "fill-opacity": "0.15", stroke: "currentColor", "stroke-width": "3"
    }));

    // Spacing slider on the outside of the body: a track and a knob.
    svg.appendChild(svgEl("line", {
      "class": "clip-track", x1: "52", y1: "34", x2: "188", y2: "34",
      stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round",
      "stroke-dasharray": "2 5"
    }));
    svg.appendChild(svgEl("rect", {
      "class": "clip-slider", x: "126", y: "26", width: "26", height: "16", rx: "5",
      fill: "currentColor", "fill-opacity": "0.45", stroke: "currentColor", "stroke-width": "2"
    }));

    return svg;
  }

  // ---- View ---------------------------------------------------------------

  function landing(el) {
    var M = window.MOCK;
    var ui = M.copy.ui;
    var priceText = "$" + RootClip.price();

    while (el.firstChild) el.removeChild(el.firstChild);
    var wrap = make("div", "landing");

    // Hero
    var hero = section("hero");
    hero.appendChild(make("h1", null, M.product.name));
    hero.appendChild(make("p", "pitch", M.product.pitch));
    var fig = make("figure", "clip-figure");
    fig.appendChild(clipSvg(ui.clipAlt));
    fig.appendChild(make("figcaption", "clip-caption", ui.clipCaption));
    // The interactive 3D model, under the sketch: the 3D page's viewer and
    // controls, shown in embedded mode. Its height comes from the page itself.
    fig.appendChild(make("p", "clip-3d-label", ui.clip3dLabel));
    var frame = make("iframe", "clip-3d");
    frame.setAttribute("src", "3d/clip-3d.html?embed=1");
    frame.setAttribute("title", ui.clip3dTitle);
    frame.setAttribute("height", "900");
    fig.appendChild(frame);
    hero.appendChild(fig);
    var actions = make("p", "actions");
    actions.appendChild(link("#/preorder", "btn", ui.heroCta));
    actions.appendChild(link("#/guide", "link", ui.guideLink));
    hero.appendChild(actions);
    wrap.appendChild(hero);

    // Problem
    var problem = section("problem", ui.problemHeading);
    problem.appendChild(make("p", null, M.product.problem));
    wrap.appendChild(problem);

    // Evidence
    var evidence = section("evidence", ui.evidenceHeading);
    var stats = make("ul", "stats");
    M.evidence.forEach(function (e) {
      var li = make("li", "stat");
      li.appendChild(make("p", "stat-big", e.stat));
      li.appendChild(make("p", "stat-text", e.text));
      var src = make("p", "stat-source");
      src.appendChild(make("small", null, e.source));
      li.appendChild(src);
      stats.appendChild(li);
    });
    evidence.appendChild(stats);
    wrap.appendChild(evidence);

    // How it works (wash-night steps)
    var how = section("how", ui.howHeading);
    var washNight = null;
    M.modes.forEach(function (m) { if (m.id === "wash-night") washNight = m; });
    var ol = make("ol", "steps");
    (washNight ? washNight.steps : []).forEach(function (step) {
      ol.appendChild(make("li", null, step));
    });
    how.appendChild(ol);
    wrap.appendChild(how);

    // Parts
    var parts = section("parts", ui.partsHeading);
    var partList = make("ul");
    M.parts.forEach(function (part) {
      var li = make("li", "part");
      li.appendChild(make("h3", "part-name", part.name));
      li.appendChild(make("p", "part-material", part.material));
      li.appendChild(make("p", "part-job", part.job));
      partList.appendChild(li);
    });
    parts.appendChild(partList);
    wrap.appendChild(parts);

    // Worries
    var worries = section("worries", ui.worriesHeading);
    M.worries.forEach(function (w) {
      var item = make("div", "worry");
      item.appendChild(make("h3", "worry-q", w.question));
      item.appendChild(make("p", "worry-a", w.answer));
      worries.appendChild(item);
    });
    wrap.appendChild(worries);

    // Price
    var price = section("price", ui.priceHeading);
    price.appendChild(make("p", "price-amount", priceText));
    price.appendChild(make("p", "price-note", ui.priceNote));
    var priceActions = make("p", "actions");
    priceActions.appendChild(link("#/preorder", "btn", ui.heroCta));
    price.appendChild(priceActions);
    wrap.appendChild(price);

    el.appendChild(wrap);
  }

  // The embedded 3D page reports its height; size the frame to fit it.
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.type !== "rootclip-3d-height" || typeof d.height !== "number") return;
    var frame = document.querySelector("iframe.clip-3d");
    if (frame && frame.contentWindow === e.source) frame.setAttribute("height", String(Math.max(300, Math.min(3000, d.height))));
  });

  RootClip.views.landing = landing;
})(window.RootClip);
