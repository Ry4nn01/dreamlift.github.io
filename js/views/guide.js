/*
 * #/guide view: fit and spacing guide.
 *
 * Class names used (for css/guide.css):
 *   guide, intro, choices, field, option, result, result-level, result-text,
 *   result-prompt, steps-section, tags, tag, steps, actions, btn
 */
window.RootClip = window.RootClip || {};
RootClip.views = RootClip.views || {};

(function (RootClip) {
  "use strict";

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  // A radio fieldset. options: [{ value, label }]. checked: value or null.
  function radioGroup(name, legendText, options, checked, onPick) {
    var fs = make("fieldset", "field");
    fs.appendChild(make("legend", null, legendText));
    options.forEach(function (opt) {
      var id = "guide-" + name + "-" + opt.value;
      var row = make("div", "option");
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "guide-" + name;
      input.id = id;
      input.value = opt.value;
      if (opt.value === checked) input.checked = true;
      input.addEventListener("change", function () {
        if (input.checked) onPick(opt.value);
      });
      var label = make("label", null, opt.label);
      label.setAttribute("for", id);
      row.appendChild(input);
      row.appendChild(label);
      fs.appendChild(row);
    });
    return fs;
  }

  function guide(el) {
    var M = window.MOCK;
    var ui = M.copy.ui;

    // View-local state; a fresh render (route change) resets it.
    var state = { texture: null, thickness: null, mode: "wash-night" };

    clear(el);
    var wrap = make("div", "guide");
    wrap.appendChild(make("h1", null, ui.guideHeading));
    wrap.appendChild(make("p", "intro", ui.guideIntro));

    var choices = make("div", "choices");
    choices.appendChild(radioGroup(
      "texture", ui.textureLabel,
      M.guide.textures.map(function (t) { return { value: t, label: ui["texture_" + t] }; }),
      null,
      function (v) { state.texture = v; renderResult(); }
    ));
    choices.appendChild(radioGroup(
      "thickness", ui.thicknessLabel,
      M.guide.thicknesses.map(function (t) { return { value: t, label: ui["thickness_" + t] }; }),
      null,
      function (v) { state.thickness = v; renderResult(); }
    ));
    choices.appendChild(radioGroup(
      "mode", ui.modeLabel,
      M.modes.map(function (m) { return { value: m.id, label: m.label }; }),
      state.mode,
      function (v) { state.mode = v; renderSteps(); }
    ));
    wrap.appendChild(choices);

    // Result
    var result = make("section", "result");
    result.appendChild(make("h2", null, ui.resultHeading));
    var resultBody = make("div");
    resultBody.setAttribute("aria-live", "polite");
    result.appendChild(resultBody);
    wrap.appendChild(result);

    // Steps
    var stepsSection = make("section", "steps-section");
    stepsSection.appendChild(make("h2", null, ui.stepsHeading));
    var stepsBody = make("div");
    stepsSection.appendChild(stepsBody);
    wrap.appendChild(stepsSection);

    var actions = make("p", "actions");
    var cta = make("a", "btn", ui.heroCta);
    cta.setAttribute("href", "#/preorder");
    actions.appendChild(cta);
    wrap.appendChild(actions);

    function renderResult() {
      clear(resultBody);
      if (!state.texture || !state.thickness) {
        resultBody.appendChild(make("p", "result-prompt", ui.resultPrompt));
        return;
      }
      var level = RootClip.spacingFor(state.texture, state.thickness);
      if (!level) {
        resultBody.appendChild(make("p", "result-prompt", ui.resultPrompt));
        return;
      }
      resultBody.appendChild(make("p", "result-level", ui["level_" + level]));
      resultBody.appendChild(make("p", "result-text", M.guide.levelText[level]));
    }

    function renderSteps() {
      clear(stepsBody);
      var mode = null;
      M.modes.forEach(function (m) { if (m.id === state.mode) mode = m; });
      if (!mode) return;
      var tags = make("ul", "tags");
      tags.appendChild(make("li", "tag", mode.satin ? ui.satinOn : ui.satinOff));
      tags.appendChild(make("li", "tag", mode.hair === "damp" ? ui.hairDamp : ui.hairDry));
      stepsBody.appendChild(tags);
      var ol = make("ol", "steps");
      mode.steps.forEach(function (s) { ol.appendChild(make("li", null, s)); });
      stepsBody.appendChild(ol);
    }

    renderResult();
    renderSteps();
    el.appendChild(wrap);
  }

  RootClip.views.guide = guide;
})(window.RootClip);
