# CLAUDE.md — Sleep-Safe Root Volume Clip: MVP web prototype

Source of truth for the product: `PRD.md` (Ryann Owen and Norah McDowell). This file covers only the web prototype built for it. If the two disagree about the product, the PRD wins. If the PRD leaves something open, ask before deciding.

The app has two parts:

1. **Landing page + mock preorder**: the Instagram landing page, with a $15 vs $12 price split.
2. **Fit & spacing guide**: the class-required digital prototype. You pick hair texture, hair thickness and a use mode, and it shows the slider setting and the steps.

Out of scope for the app: tester results dashboard, launch metrics monitor, real payments, accounts, any backend.

**The 3D prototype in `3d/`.** It's its own page, and the app rules below don't apply to its code or copy, but it follows the same product rules (§2) and also opens by double-click with no libraries. **The app's Home page embeds its top section** (viewer and controls only) under the clip sketch, by loading `3d/clip-3d.html?embed=1` in an `iframe`. With `?embed=1` the 3D page hides its banner, title, intro and cards, and posts its height to the Home page (`postMessage`, type `rootclip-3d-height`), which sizes the frame to fit. Keep that embedded mode working when changing the 3D page.

- `3d/clip-model.js`: the one geometry source. The clip is a **comb clip**: a softly rounded, glossy body with a clean top (no external hinge, pin or spring) that curves along its length (a little down, `bend`, and mostly arcing back toward the head, `arc`, like a real front comb clip); **the steel spring hidden inside the body behind the slider**; **one single row of 7 tapered prongs** that curve gently back to follow the head and grip; **satin sleeves that cover each whole prong**, from the body all the way to the tip, wrapping over the end, **joined at the top by a satin band like a glove** so the satin is one piece and no single sleeve can get lost; and a rose-gold spacing slider knob on a track on the front of the body (it faces forward, over the forehead, when worn at the front of the head). Spacing is a value from 0 (narrow) to 1 (wide). Not a claw clip: no second row, no jaws. All sizes in `SIZES` are placeholders (typical comb-clip sizes) until the founder's test; change them there only.
  - `buildClip()` makes the whole clip (used for the STLs and checks). `buildClipParts()` + `layout(spacing)` make the same clip as parts built once and moved into place, so the viewer can change the spacing instantly.
  - **Not used by the viewer any more** (the user found the 3D mannequin weird and chose the drawing below for "On a model"); kept only as reference. An earlier 3D mannequin followed the user's sketch: a front view of a head with **curly hair down all round, each curl visible**, the front section going back, and the clip at the top front. `buildHead()` makes the mannequin (skin, ears, neck, stand) plus a thin dark base layer of hair (tag `hairBase`: scalp layer and hanging lengths) so there are no gaps. `buildCurls()` makes the visible curls as spiral tubes (`CURL`): ringlets hanging all round, small curls swept back over the top beside and behind the clip, and curls down the sides and back. `buildThreadCurls(spacing)` makes the curls that run back from the hairline **between the prongs** (and just outside the end prongs), lined up with the prongs for the current spacing; the viewer rebuilds them when the spacing changes. Curls come as flat arrays with exact normals (no smoothing step), about 260,000 triangles.
  - `headPlacement()` puts the clip at the front of the head, slider facing forward. `WEAR` (tilt and depth) was fitted so the prongs lie at the same height as the curls that run between them (average about 1 mm off), well clear of the scalp, with the body on top. Re-fit if the clip, head or curl sizes change.
- `3d/clip-3d.html`: interactive viewer drawn with **WebGL** (built into browsers, no library): smooth shading, glossy plastic, satin sheen and strand-like hair. The camera is a free rotation (quaternion): dragging turns the clip with no limit, all the way round in every direction; "Spin 360°" turns it like a turntable, and dragging or Reset stops it. Views: Clip, Parts apart (the internal spring slides out; the glove slides part way off) and **On a model**, which shows the concept drawing below in the viewer instead of the 3D view (the zoom buttons, hint and Spin are hidden or off there). Earlier versions used a photo the user supplied and then a 3D curly-haired mannequin; the user preferred the drawing, so those were removed from the viewer. Controls: **colour** (brown, black, red, blonde, to blend into hair; it colours the clip body and prongs), spacing buttons, and satin on/off, which animates the glove **sliding down off the prongs** in one piece. **The knob on the clip can be dragged** to set the spacing continuously; the buttons follow. Reset puts everything back to how the page opens (Clip view, brown, medium, satin on, starting camera). STL download buttons. On phones, the label and hint sit above and below the model instead of over it.
- The **"On a model" drawing**: a clean illustration redrawn from the user's hand sketch (front view: curly hair down, front section going back through the clip at the top front, rose-gold slider, satin-tipped prongs), with callouts. Drawn in code as SVG (`drawSketch()` in `clip-3d.html`), so it stays sharp and follows dark mode; colours that use CSS variables go in `style`, not SVG attributes.
  - **It's a working model**: `drawSketch()` redraws from the current state whenever a side button changes while "On a model" is showing. **Colour** sets the hair and the clip together (to show how it blends in); **spacing** sets the prong pitch and moves the slider knob along its track; **satin** on shows pink satin prongs, off shows plain prongs in the clip colour.
  - **The whole head of hair is filled with curls** (no flat colour areas): small spirals are placed on a jittered grid over every point inside the hair shapes (outside the face and neck), each with a darker edge. The prongs sit between the curl shadows and the curl highlights, so the hair crosses over them and they just peek through, as when worn.
- `3d/print/*.stl`: printable PLA parts in millimetres at medium spacing: `clip-comb.stl` (body and prongs as one piece) and `clip-slider-knob.stl`. The spring and the satin sleeves are bought or sewn, not printed. The printed body is solid and the prongs fixed; the knob is a form study: how the slider, its internal spring and the prongs connect inside the body isn't designed yet.
- After changing `clip-model.js`, regenerate the STLs with macOS's built-in JavaScript engine, from the project folder:
  `jsc` = `/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc`; for each part, run a two-line script that does `load("3d/clip-model.js")` and `print(ClipModel.toSTL(ClipModel.printParts()["<part>"], "<part>"))`, and save the output to `3d/print/<part>.stl`.

---

## 1. MVP rules

- **Opens by double-clicking `index.html`.** It must work from `file://` in current Chrome and Safari. No server, no build step, no installs, no package.json.
- **Plain HTML, CSS and JavaScript only.** No framework, no library, no CDN, no web fonts, no external images. The app must work with Wi-Fi off.
- **No ES modules and no `fetch`.** Both fail on `file://`. Load scripts with ordinary `<script src>` tags in the order listed in section 5. Files share state through one namespace: `window.RootClip`.
- **Mock data only.** Every piece of copy, every number and every option comes from `js/data.js` (`window.MOCK`). That includes headings, button labels and field labels (`MOCK.copy.ui`). Views never hard-code text. The only exception is the three nav labels in `index.html`.
- **Nothing leaves the page.** The preorder email is checked for format, then thrown away. It is never sent, stored or logged.
- **The only stored item** is the price arm (section 4), kept in `localStorage`. Every storage call is wrapped in try/catch, and the app works when storage is blocked.
- **Every page shows a prototype banner:** "Prototype. Preorders are not real: nothing is charged, sent or saved."
- **Works at phone width** (375px) with no horizontal scroll. Most visitors come from Instagram.
- **Light and dark** follow the system setting (`prefers-color-scheme`). There's no theme toggle.
- **Keep it small.** No feature goes in that this file doesn't list. Ask before adding one.

## 2. Hard product rules (from the PRD)

The app's copy, images and logic must never contradict these.

1. **One clip, worn at the front of the head.** Never show or describe back-of-head placement, or sets of several clips.
2. **No powered or heated features.** No heat, cooling, motors or batteries, and no styling products such as root-lift sprays.
3. **Night use means satin tips on; daytime use means satin tips off.** At night, only the satin caps touch the scalp.
4. **Sleep on your back or side.** Never suggest stomach sleeping.
5. **Night after washing is on damp, towel-dried hair. Day two is the same steps on dry hair.**
6. **The satin tips are removable and washable.**
7. **The clip has exactly five parts:** body and hinge, spring, prongs, spacing slider, tip caps. Use the PRD's materials and wording.
8. **The price is $15 or $12, never anything else.** $15 is the planned retail price; $12 is the test fallback. A visitor sees one price everywhere.
9. **Spacing is relative only:** narrow, medium or wide. Never show millimetres or prong counts, because the PRD hasn't settled them.
10. **No unproven results.** The clip hasn't been tested yet. Comfort, no dents and no hair damage are design goals ("designed to…"), never results ("proven", "guaranteed", "no dents"). No reviews, testimonials, star ratings or tester quotes. "Sleep-Safe Root Volume Clip" stays as the working name.
11. **Survey numbers are quoted exactly as the PRD gives them**, with the source "Instagram survey, 66 responses, Oct 2026".
12. **No hair type is excluded.** Curly and short hair can still preorder and use the guide. Marketing leans toward medium-to-long hair, but nothing blocks other types.
13. **No daytime wear time.** The PRD gives none, so the app gives none.

## 3. Navigation

One page with hash routes. A header nav (Home · Fit guide · Preorder) and the prototype banner appear on every route. The browser's back and forward buttons must work. On every route change the router scrolls to the top, sets the page `<title>` to `<route title> · <product name>`, and marks the current nav link with `aria-current="page"`. `#/thanks` has no nav link, so no link is marked there. Anything after `?` inside the hash is ignored (`#/guide?x=1` shows the guide). Any other hash that doesn't match exactly, such as `#/guide/`, is unknown and shows Home.

| Route | Shows | Leads to |
| --- | --- | --- |
| `#/` (also empty or unknown hash) | Pitch, an inline SVG drawing of the clip with the interactive 3D model underneath it in the same card (the 3D page's top section in an `iframe`, see the 3D prototype note above; its label and title come from `copy.ui`), the problem, the two survey stats, how it works (the `wash-night` steps), the five parts, the top three worries (comfort, works on my hair, dents) and how the design addresses each, price, Preorder button | `#/guide`, `#/preorder` |
| `#/guide` | Radio buttons for texture (straight, wavy, curly), thickness (fine, medium, thick) and mode (night after washing, day two, daytime). On first load no texture or thickness is selected and mode is set to night after washing. The spacing result appears once texture and thickness are both picked. The steps for the chosen mode always show. Everything updates as soon as a choice changes; there's no submit button. Choices reset when you leave the page. | `#/preorder` |
| `#/preorder` | Price for this visitor's arm, `product.pitch` as the summary, an email field, a Preorder button. A bad email shows an inline error (`copy.emailError`) and stays on the page. A good email calls `RootClip.setPreordered()` and goes to `#/thanks`. | `#/thanks` |
| `#/thanks` | `copy.thanks` with `{price}` filled in, the prototype notice repeated, a link home. The thanks view checks `RootClip.hasPreordered()` and, if it's false, sends you to `#/preorder` with `history.replaceState(null, "", "#/preorder")` followed by a `hashchange` event for the router, so the back button doesn't loop. Never navigate with a full URL (`location.replace(location.href…)`, `location.href = …`): on `file://` Chrome treats each page as its own origin and logs an "Unsafe attempt to load URL" error. Change only the `#` part. A reload on `#/thanks` therefore redirects, which is expected. | `#/` |

**Clip drawing:** an inline SVG built in `js/views/landing.js` with `document.createElementNS`, with no markup strings. It shows the front view: one body bar, a hinge with a spring coil on top, 7 comb-style prongs with rounded ends, satin tips on the prong ends, and a slider on a track on the front of the body. Strokes use `currentColor`. The satin tips carry a plain `fill` attribute as a fallback, and `css/landing.css` overrides it with `.clip-satin { fill: var(--satin); }`, because `var()` inside SVG attributes isn't reliable. The SVG has no size attributes; `css/landing.css` sizes it (`.clip`, max 320px wide). It must not show the clip on the back of a head, or more than one clip. Its `aria-label` and any caption come from `MOCK.copy.ui`.

**Email check:** valid means `something@something.something` with no spaces: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.

## 4. Data contract (`js/data.js`)

`js/data.js` defines exactly one global, `window.MOCK`, with this shape. MOCK may have fields beyond these, but every listed field must be present. `js/app.js` checks it on load with `RootClip.validateData(MOCK)`, which returns an array of error strings (empty means valid). If any errors come back, `#app` shows them as a list and nothing else renders.

```js
window.MOCK = {
  product: {
    name: "Sleep-Safe Root Volume Clip",   // working name from the PRD title
    pitch: string,                          // PRD "Pitch", one sentence
    problem: string                         // short, from PRD "Problem"
  },

  prices: {
    currency: "USD",
    arms: [15, 12],                         // exactly these two numbers
    retail: 15                              // must be one of arms
  },

  evidence: [                               // exactly these 2 items
    { stat: "82%", text: "say their hair looks flat at least a few times a week",
      source: "Instagram survey, 66 responses, Oct 2026" },
    { stat: "67%", text: "would use a sleep-in root clip a few nights a week or every night",
      source: "Instagram survey, 66 responses, Oct 2026" }
  ],

  parts: [                                  // exactly 5, in PRD order
    { id: "body" | "spring" | "prongs" | "slider" | "caps",
      name: string, material: string, job: string }
  ],

  worries: [                                // exactly 3: comfort, fit, dent
    { id: "comfort" | "fit" | "dent", question: string, answer: string }
                                            // answer says "designed to…", never claims results
  ],

  guide: {
    textures:    ["straight", "wavy", "curly"],
    thicknesses: ["fine", "medium", "thick"],
    levels:      ["narrow", "medium", "wide"],    // ordered narrow to wide
    baseByTexture: { straight: "narrow", wavy: "medium", curly: "wide" },
    thicknessShift: { fine: -1, medium: 0, thick: +1 }, // steps along levels, then clamped
    levelText: { narrow: string, medium: string, wide: string }
  },

  modes: [                                  // exactly 3, each with 3+ non-empty steps
    { id: "wash-night", label: "Night after washing", hair: "damp", satin: true,  steps: [string] },
    { id: "day-two",    label: "Day two (night)",     hair: "dry",  satin: true,  steps: [string] },
    { id: "daytime",    label: "Daytime",             hair: "dry",  satin: false, steps: [string] }
  ],

  copy: {
    banner: "Prototype. Preorders are not real: nothing is charged, sent or saved.",
    emailError: string,
    thanks: string,                         // must contain "{price}"
    ui: { [key: string]: string }           // every heading, button, field label and route title;
                                            // option names are flat keys: texture_<id>, thickness_<id>, level_<id>;
                                            // data.js holds the full key list: add a key there before a view uses it
  }
};
```

**Mode steps:** `wash-night` follows the PRD core flow (towel-dry to damp, set the slider, put on the satin tips, comb into the front roots, sleep on back or side, take it out in the morning). `day-two` is the same on dry hair. `daytime` is: set the slider, leave the satin tips off, comb into the roots at the front of the head. It gives no wear time.

**Invariants that `validateData` checks:**

- Every field above is present and has the right type. `steps` arrays have at least 3 non-empty strings.
- `prices.arms` is exactly `[15, 12]` in any order, and `retail` is in it.
- `evidence` has 2 entries. `parts` has 5 and `worries` has 3, with the ids listed above.
- Every value in `baseByTexture` is in `levels`. Every texture and every thickness has an entry.
- `wash-night` and `day-two` have `satin: true`, and at least one step mentions "satin". `daytime` has `satin: false`, and no step contains both "put on" and "satin".
- `copy.thanks` contains `{price}`.
- No string value anywhere in `MOCK` contains a banned word or phrase. Matching ignores case, treats any non-letter as a word boundary (so `10mm` and `5 mm` are caught, but `comma` isn't), lets phrases match across extra spaces, and checks values only, not object keys. The list: `back of the head`, `stomach`, `heated`, `heating`, `motor`, `battery`, `guaranteed`, `proven`, `reviews`, `stars`, `mm`. Copy can still say the clip replaces heat tools, as in the pitch.

**Spacing rule** (in `js/guide-logic.js`, `RootClip.spacingFor(texture, thickness)`): start at `baseByTexture[texture]`, move by `thicknessShift[thickness]`, and stop at the ends of `levels`. The result must match this table:

| | fine | medium | thick |
| --- | --- | --- | --- |
| straight | narrow | narrow | medium |
| wavy | narrow | medium | wide |
| curly | medium | wide | wide |

**Price arm** (in `js/state.js`, `RootClip.priceArm(search = location.search, store = RootClip.store)`). The two arguments exist so tests can pass a fake URL and a fake store and never touch the app's real storage.

1. If `search` has `price=15` or `price=12`, use it and store it. Any other `price=` value is ignored.
2. Otherwise, if storage key `rootclip.priceArm` holds 15 or 12, use that.
3. Otherwise pick one at random, 50/50, and store it.
4. If storage throws, pick at random for this page load only.

`RootClip.store` is the try/catch wrapper around `localStorage` with `get(key)` and `set(key, value)`. A fake store passed in tests has the same two methods.

**Preorder flag** (in `js/state.js`): `RootClip.setPreordered()` and `RootClip.hasPreordered()`. Held in memory only, never stored.

## 5. File layout (one owner per file)

Each file has one job. Only that file does that job, and no other file edits what it owns. If a change needs two files, change each within its own job.

**Shared rules for every JS file:**

- Start with `window.RootClip = window.RootClip || {};`. View files also add `RootClip.views = RootClip.views || {};`.
- Wrap the file in an IIFE. Add only the names this section lists to `RootClip`.
- `index.html` has these shell elements: `#banner` (the prototype banner), `#nav` (the header nav with links `#/`, `#/guide`, `#/preorder`), `main#app` (where views render). Only these three ids are shared between files. A view may create its own ids, prefixed with the view name, where `label for=` or `aria-describedby` needs them: `guide-<group>-<value>` (for example `guide-texture-curly`), `preorder-email`, `preorder-error`.
- A view receives `el` (`main#app`), clears it, and renders into it. Views build the DOM with `document.createElement`, `document.createElementNS` (for the SVG) and `textContent`. Never `innerHTML`.
- Each view file lists the class names it uses in a comment at the top. Each screen's CSS file styles its classes and nothing else (see the CSS rules below). When you add or rename a class in a view, update its comment and its CSS file together. No inline styles. Current classes:
  - Landing: `landing hero pitch clip-figure clip clip-caption clip-3d-label clip-3d actions btn link problem evidence stats stat stat-big stat-text stat-source how steps parts part part-name part-material part-job worries worry worry-q worry-a price price-amount price-note`
  - Clip SVG: `clip-body clip-hinge clip-spring clip-track clip-slider clip-prong clip-satin`
  - Guide: `guide intro choices field option result result-prompt result-level result-text steps-section tags tag steps actions btn`
  - Preorder and thanks: `preorder thanks product price note summary form field input btn error notice back`
  - Some names are shared with different meanings (`field`, `price`, `steps`), so the CSS files scope them by element or parent (`fieldset.field`, `div.field`, `.preorder .price`).
- Hidden elements use the `hidden` attribute. `css/base.css` has `[hidden] { display: none !important; }`, and no rule in any CSS file may set `display` on hidden elements.

**CSS rules:**

- There are four CSS files, linked in `index.html` in this order: `css/base.css`, `css/landing.css`, `css/guide.css`, `css/preorder.css`.
- `css/base.css` holds what more than one screen uses: colour tokens (light and dark, including `--line-strong` for control edges that need about 3:1 contrast), base elements, the shell (`#banner`, `#nav`, `main#app`), and the shared classes `actions`, `btn`, `link`, `steps`.
- Each screen file styles only its own screen. Every rule starts from that screen's own classes (for example `.hero`, `.option`, `.preorder .price`), never from a bare element or a shared class.
- Screen files use the tokens from `base.css` and never define colours of their own. A screen that needs a new token or a change to a shared class asks for it rather than overriding it locally.
- Media queries for a screen live in that screen's file.

```
index.html              shell
css/base.css            shared look: tokens, base, shell, shared classes
css/landing.css         #/ look
css/guide.css           #/guide look
css/preorder.css        #/preorder and #/thanks look
js/data.js              mock data
js/state.js             price arm, storage, preorder flag
js/guide-logic.js       spacing rule + data validation
js/views/landing.js     #/ view + clip drawing
js/views/guide.js       #/guide view
js/views/preorder.js    #/preorder and #/thanks views
js/router.js            hash routing
js/app.js               boot
tests.html              test page shell
js/tests.js             tests
PRD.md                  product source (read only)
CLAUDE.md               this file
.claude/launch.json     local preview server for checks (not part of the app)
```

| File | Owns | Must not |
| --- | --- | --- |
| `index.html` | Page skeleton: `#banner`, `#nav` with the three nav labels, `main#app`, a default `<title>` (the product name), the four stylesheet links in the order above, the `<script>` tags in this order: data, state, guide-logic, views/landing, views/guide, views/preorder, router, app | Contain other text or inline scripts |
| `css/base.css` | Shared styling: tokens, light and dark, base elements, shell, `actions btn link steps` | Style one screen's own classes |
| `css/landing.css`, `css/guide.css`, `css/preorder.css` | That screen's styling, phone-first, including its media queries | Style anything outside that screen, define colours, or override `base.css` |
| `js/data.js` | `window.MOCK`: all copy, numbers and options | Contain functions or logic |
| `js/state.js` | `RootClip.store`, `RootClip.priceArm()`, `RootClip.setPreordered()`, `RootClip.hasPreordered()` | Touch the DOM |
| `js/guide-logic.js` | `RootClip.spacingFor()`, `RootClip.validateData()` | Touch the DOM or storage |
| `js/views/landing.js` | `RootClip.views.landing(el)`, the clip SVG | Hard-code copy; read storage directly |
| `js/views/guide.js` | `RootClip.views.guide(el)` | Compute spacing itself (it calls `spacingFor`) |
| `js/views/preorder.js` | `RootClip.views.preorder(el)`, `RootClip.views.thanks(el)` with its redirect, the email check | Send, store or log the email |
| `js/router.js` | `RootClip.startRouter()`: matching hashes to views, the unknown-route fallback, scroll to top, page title, `aria-current` | Render content itself |
| `js/app.js` | Boot on `DOMContentLoaded`: validate data, render the banner, call `startRouter()` | Hold any feature logic |
| `tests.html` + `js/tests.js` | In-browser tests that load data, state, guide-logic and tests only, and print pass/fail with a total. `tests.html` may have a small inline `<style>` for pass/fail colours, since it isn't part of the app. | Be loaded by `index.html`, link any app CSS file, or touch real `localStorage` (every price test passes a fake store and an explicit search string) |

## 6. How we check it works

Run these after any change. All of them must pass.

**Where to run them.** Checks 1 and 4 (Safari part) must be done by a person, by double-clicking the files. Claude's built-in browser panel can't open `file://` pages from this folder, so Claude runs checks 2–8 through the local preview server in `.claude/launch.json` (macOS's built-in Ruby serving the folder at `http://localhost:8765`). Now that the project is under Desktop, macOS blocks that server from reading the folder ("Operation not permitted - getcwd"); serve a temporary copy from Claude's scratch folder instead. That's fine for those checks, because the code has no modules or `fetch` that would behave differently on `file://`. `node` and `python3` aren't installed on this Mac, so there are no command-line tests. `tests.html` in a browser is the test runner.

1. **Opens offline:** turn Wi-Fi off, double-click `index.html` in Chrome and in Safari. It loads with no console errors.
2. **Tests pass:** double-click `tests.html`. Everything is green: the data contract, all 9 cells of the spacing table, the price-arm cases (URL override, invalid value ignored, stored value reused, storage that throws), the banned-word scan, and `validateData` rejecting a broken copy of MOCK.
3. **Navigation:** click every nav link, then use back and forward. `#/nowhere` lands on Home. Opening `#/thanks` directly redirects to `#/preorder`. The tab title and the highlighted nav link change with the route.
4. **Price split:** `index.html?price=12` shows $12 on every route, and `?price=15` shows $15. With storage cleared, a random price appears and stays the same after reloading in Chrome. Safari may block storage on `file://`; there the price can change on reload, which is expected.
5. **Guide:** straight + fine gives narrow, curly + thick gives wide, wavy + medium gives medium. Switching to Daytime removes the satin-tip step.
6. **Preorder:** `abc` shows the inline error. `a@b.co` goes to the thanks page with the right price. The Network panel shows no requests besides the local files.
7. **Phone width:** at 375px, no route scrolls sideways.
8. **Product rules:** read through each route against section 2. Every page shows the banner, the clip drawing shows one clip with satin tips, and no copy claims tested results.
