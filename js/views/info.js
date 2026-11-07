/*
 * The content pages: #/why (Why DreamLift), #/how (How it works) and #/about
 * (About us), plus the clip drawing shown on How it works. Short points and
 * cards rather than long paragraphs.
 *
 * Class names used (for css/info.css):
 *   Page:      info, lede, info-section, points, actions, btn, link
 *   Survey:    stats, stat, stat-big, stat-text, stat-source
 *   Routine:   step-cards, step-card
 *   Modes:     modes, mode, mode-name, mode-text, mode-tags, mode-tag
 *   Parts:     part-figure, clip, clip-caption, part-list, part, part-name, part-job, part-material
 *   Clip SVG:  clip-body, clip-hinge, clip-spring, clip-track, clip-slider, clip-prong, clip-satin
 *   Questions: faq, faq-item, is-open, faq-q, faq-icon, faq-panel, faq-inner
 *   About:     source
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

  function section(headingText) {
    var s = make("section", "info-section");
    s.appendChild(make("h2", null, headingText));
    return s;
  }

  function points(items) {
    var ul = make("ul", "points");
    items.forEach(function (text) { ul.appendChild(make("li", null, text)); });
    return ul;
  }

  // Starts a page: clears el and adds the title and a one-line intro.
  function page(el, title, lede) {
    while (el.firstChild) el.removeChild(el.firstChild);
    var wrap = make("div", "info");
    wrap.appendChild(make("h1", null, title));
    if (lede) wrap.appendChild(make("p", "lede", lede));
    el.appendChild(wrap);
    return wrap;
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

  // ---- Questions: each one opens and closes ----------------------------------

  function faqItem(question, answer, n) {
    var item = make("div", "faq-item");
    var panelId = "how-faq-" + n;
    var h3 = make("h3");
    var btn = make("button", "faq-q");
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-controls", panelId);
    btn.setAttribute("aria-expanded", "false");
    btn.appendChild(document.createTextNode(question));
    var icon = make("span", "faq-icon");
    icon.setAttribute("aria-hidden", "true");
    btn.appendChild(icon);
    h3.appendChild(btn);
    item.appendChild(h3);

    var panel = make("div", "faq-panel");
    panel.id = panelId;
    var inner = make("div", "faq-inner");
    inner.appendChild(make("p", null, answer));
    panel.appendChild(inner);
    item.appendChild(panel);

    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      item.classList.toggle("is-open", open);
    });
    return item;
  }

  // ---- #/why ----------------------------------------------------------------

  function why(el) {
    var M = window.MOCK, ui = M.copy.ui;
    var wrap = page(el, ui.routeWhyTitle, M.product.problem);

    var problem = section(ui.problemHeading);
    problem.appendChild(points(M.problemPoints));
    wrap.appendChild(problem);

    var evidence = section(ui.evidenceHeading);
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

    var fix = section(ui.fixHeading);
    fix.appendChild(points(M.fixPoints));
    wrap.appendChild(fix);

    var actions = make("p", "actions");
    actions.appendChild(link("#/how", "btn", ui.howLink));
    wrap.appendChild(actions);
  }

  // ---- #/how ----------------------------------------------------------------

  function how(el) {
    var M = window.MOCK, ui = M.copy.ui;
    var wrap = page(el, ui.routeHowTitle, ui.howIntro);

    // The night routine as numbered cards with short captions.
    var night = section(ui.nightHeading);
    var cards = make("ol", "step-cards");
    M.quickSteps.forEach(function (s) { cards.appendChild(make("li", "step-card", s)); });
    night.appendChild(cards);
    wrap.appendChild(night);

    // Three ways to wear it.
    var modesSec = section(ui.modesHeading);
    var modes = make("ul", "modes");
    M.modes.forEach(function (m) {
      var li = make("li", "mode");
      li.appendChild(make("h3", "mode-name", m.label));
      li.appendChild(make("p", "mode-text", m.summary));
      var tags = make("ul", "mode-tags");
      tags.appendChild(make("li", "mode-tag", m.satin ? ui.satinOn : ui.satinOff));
      tags.appendChild(make("li", "mode-tag", m.hair === "damp" ? ui.hairDamp : ui.hairDry));
      li.appendChild(tags);
      modes.appendChild(li);
    });
    modesSec.appendChild(modes);
    wrap.appendChild(modesSec);

    // Five parts: the drawing beside a short list.
    var parts = section(ui.partsHeading);
    var fig = make("figure", "part-figure");
    fig.appendChild(clipSvg(ui.clipAlt));
    fig.appendChild(make("figcaption", "clip-caption", ui.clipCaption));
    parts.appendChild(fig);
    var list = make("ul", "part-list");
    M.parts.forEach(function (p) {
      var li = make("li", "part");
      li.appendChild(make("span", "part-name", p.name));
      li.appendChild(make("span", "part-job", p.job));
      li.appendChild(make("span", "part-material", p.material));
      list.appendChild(li);
    });
    parts.appendChild(list);
    wrap.appendChild(parts);

    // Top questions, each opening to a short answer.
    var faq = section(ui.worriesHeading);
    var faqList = make("div", "faq");
    M.worries.forEach(function (w, n) { faqList.appendChild(faqItem(w.question, w.answer, n)); });
    faq.appendChild(faqList);
    wrap.appendChild(faq);

    var actions = make("p", "actions");
    actions.appendChild(link("#/guide", "btn", ui.guideLink));
    wrap.appendChild(actions);
  }

  // ---- #/about --------------------------------------------------------------

  function about(el) {
    var M = window.MOCK, ui = M.copy.ui;
    var wrap = page(el, ui.routeAboutTitle, M.about.intro);

    var whySec = section(ui.aboutWhyHeading);
    whySec.appendChild(make("p", null, M.about.why));
    wrap.appendChild(whySec);

    var heard = section(ui.aboutHeardHeading);
    heard.appendChild(points(M.about.heard));
    var src = make("p", "source");
    src.appendChild(make("small", null, M.evidence[0].source));
    heard.appendChild(src);
    wrap.appendChild(heard);

    var testing = section(ui.aboutTestingHeading);
    testing.appendChild(points(M.about.testing));
    wrap.appendChild(testing);
  }

  RootClip.views.why = why;
  RootClip.views.how = how;
  RootClip.views.about = about;
})(window.RootClip);
