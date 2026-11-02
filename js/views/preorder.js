// #/preorder and #/thanks views.
// Class names used: preorder, thanks, product, price, note, summary, form,
// field, input, btn, error, notice, back
// The email is checked for format inside the submit handler, then thrown away.
// It is never stored, sent, logged or put in the URL.
window.RootClip = window.RootClip || {};
RootClip.views = RootClip.views || {};

(function (RootClip) {
  "use strict";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var INPUT_ID = "preorder-email";
  var ERROR_ID = "preorder-error";

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function priceText() {
    return "$" + RootClip.price();
  }

  function preorder(el) {
    var MOCK = window.MOCK;
    var ui = MOCK.copy.ui;
    clear(el);

    var wrap = make("section", "preorder");
    wrap.appendChild(make("h1", null, ui.preorderHeading));
    wrap.appendChild(make("p", "product", MOCK.product.name));
    wrap.appendChild(make("p", "price", priceText()));
    wrap.appendChild(make("p", "note", ui.priceNote));
    wrap.appendChild(make("p", "summary", MOCK.product.pitch));

    var form = make("form", "form");
    form.noValidate = true;
    form.setAttribute("novalidate", "");

    var field = make("div", "field");
    var label = make("label", null, ui.emailLabel);
    label.htmlFor = INPUT_ID;
    var input = make("input", "input");
    input.type = "email";
    input.id = INPUT_ID;
    input.name = "email";
    input.autocomplete = "email";
    input.setAttribute("autocomplete", "email");
    input.placeholder = ui.emailPlaceholder;
    field.appendChild(label);
    field.appendChild(input);

    var error = make("p", "error");
    error.id = ERROR_ID;
    error.setAttribute("role", "alert");
    error.hidden = true;
    field.appendChild(error);

    var button = make("button", "btn", ui.preorderButton);
    button.type = "submit";

    form.appendChild(field);
    form.appendChild(button);
    wrap.appendChild(form);
    el.appendChild(wrap);

    function hideError() {
      error.hidden = true;
      error.textContent = "";
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }

    input.addEventListener("input", function () {
      if (!error.hidden) hideError();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!EMAIL_RE.test(input.value.trim())) {
        error.textContent = MOCK.copy.emailError;
        error.hidden = false;
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", ERROR_ID);
        input.focus();
        return;
      }
      input.value = "";
      hideError();
      RootClip.setPreordered();
      location.hash = "#/thanks";
    });
  }

  // Send the visitor to #/preorder, replacing the history entry so the back
  // button does not bounce into #/thanks again. Only the fragment is rewritten:
  // on file:// Chrome treats each page as its own origin and logs an "Unsafe
  // attempt to load URL" error for location.replace() with a full URL.
  // replaceState fires no hashchange, so we announce one for the router.
  function redirectToPreorder() {
    try {
      history.replaceState(null, "", "#/preorder");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      return;
    } catch (e) {
      // fall through to plain hash assignment
    }
    location.hash = "#/preorder";
  }

  function thanks(el) {
    if (!RootClip.hasPreordered()) {
      redirectToPreorder();
      return;
    }
    var MOCK = window.MOCK;
    var ui = MOCK.copy.ui;
    clear(el);

    var wrap = make("section", "thanks");
    wrap.appendChild(make("h1", null, ui.thanksHeading));
    wrap.appendChild(make("p", null, MOCK.copy.thanks.split("{price}").join(priceText())));
    wrap.appendChild(make("p", "notice", MOCK.copy.banner));

    var back = make("a", "back", ui.backHome);
    back.href = "#/";
    wrap.appendChild(back);
    el.appendChild(wrap);
  }

  RootClip.views.preorder = preorder;
  RootClip.views.thanks = thanks;
})(window.RootClip);
