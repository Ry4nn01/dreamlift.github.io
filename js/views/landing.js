/*
 * #/ view: the home page. Short and visual: name, one-line value statement,
 * the hair types it's designed for, the interactive 3D model and the call to action.
 *
 * Class names used (for css/landing.css):
 *   Sections:   landing, hero, tagline
 *   Hair types: hair-types, hair-types-note, hair-type-list, hair-type, hair-icon,
 *               hair-name, hair-spacing
 *   3D model:   model, clip-3d-label, clip-3d
 *   Shared:     actions, btn, link
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

  // ---- Hair-type icons: three strands drawn in the texture -------------------
  // Straight: plain lines. Wavy: gentle S-waves. Curly: loops. Coily: small tight loops.

  function strand(type, x0) {
    var pts = [], n = 60;
    for (var i = 0; i <= n; i++) {
      var t = i / n, x = x0, y = 7 + 26 * t;
      if (type === "wavy") x = x0 + 3 * Math.sin(t * Math.PI * 3);
      if (type === "curly" || type === "coily") {
        // A loop-the-loop: a circle rolling down the strand.
        var r = type === "curly" ? 3.4 : 2.2, turns = type === "curly" ? 2.5 : 4.5;
        var a = t * turns * 2 * Math.PI;
        x = x0 + r * Math.sin(a);
        y = 9 + 22 * t - r * Math.cos(a) + r;
      }
      pts.push((i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2));
    }
    return pts.join(" ");
  }

  function hairIcon(type) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 40 40");
    svg.setAttribute("class", "hair-icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    [11, 20, 29].forEach(function (x0) {
      var p = document.createElementNS(SVG_NS, "path");
      p.setAttribute("d", strand(type, x0));
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", "currentColor");
      p.setAttribute("stroke-width", type === "coily" ? "1.8" : "2.2");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      svg.appendChild(p);
    });
    return svg;
  }

  // ---- View ---------------------------------------------------------------

  function landing(el) {
    var M = window.MOCK;
    var ui = M.copy.ui;

    while (el.firstChild) el.removeChild(el.firstChild);
    var wrap = make("div", "landing");

    // Name and value statement
    var hero = make("section", "hero");
    hero.appendChild(make("h1", null, M.product.name));
    hero.appendChild(make("p", "tagline", ui.tagline));
    wrap.appendChild(hero);

    // Designed for every hair type: one icon per texture, with its starting spacing.
    var types = make("section", "hair-types");
    types.appendChild(make("h2", null, ui.hairTypesHeading));
    var list = make("ul", "hair-type-list");
    M.guide.textures.forEach(function (t) {
      var li = make("li", "hair-type");
      li.appendChild(hairIcon(t));
      li.appendChild(make("span", "hair-name", ui["texture_" + t]));
      li.appendChild(make("span", "hair-spacing", ui["hairSpacing_" + M.guide.baseByTexture[t]]));
      list.appendChild(li);
    });
    types.appendChild(list);
    types.appendChild(make("p", "hair-types-note", ui.hairTypesNote));
    wrap.appendChild(types);

    // The interactive 3D model: the 3D page's viewer and controls, in embedded
    // mode. Its height comes from the page itself.
    var model = make("section", "model");
    model.appendChild(make("p", "clip-3d-label", ui.clip3dLabel));
    var frame = make("iframe", "clip-3d");
    frame.setAttribute("src", "3d/clip-3d.html?embed=1");
    frame.setAttribute("title", ui.clip3dTitle);
    frame.setAttribute("height", "900");
    model.appendChild(frame);
    wrap.appendChild(model);

    var actions = make("p", "actions");
    actions.appendChild(link("#/preorder", "btn", ui.heroCta + " · $" + RootClip.price()));
    actions.appendChild(link("#/guide", "link", ui.guideLink));
    wrap.appendChild(actions);

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
