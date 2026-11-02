// Geometry for the Sleep-Safe Root Volume Clip 3D prototype.
// One source for both the viewer (clip-3d.html) and the printable STL files.
// Plain script, no libraries: works from file:// and in the jsc command-line shell.
//
// The clip is a comb clip: a softly rounded body that curves gently along its
// length to follow the head, one row of 7 tapered prongs that curve back to
// grip, a satin glove (one sleeve per prong, joined by a band at the top so no
// sleeve gets lost), and a spacing slider on the front of the body (it faces
// forward, over the forehead, when worn at the front of the head). The steel
// spring is inside the body, behind the slider, so it can't be seen.
//
// Units are centimetres. Axes: x along the body (left to right), y up (the
// prongs hang down), z toward the front (the slider side).
//
// All sizes are PLACEHOLDERS (typical comb-clip sizes). The PRD has not settled
// them yet; replace them after the founder's 3-night test.

(function (root) {
  "use strict";

  var SIZES = {
    bodyWidth: 8.0,
    bodyHeight: 1.2,
    bodyDepth: 0.9,
    bodyCorner: 0.55,       // corner radius of the body outline
    bodyEdge: 0.32,         // how soft the body edges are
    prongs: 7,
    prongRoot: 0.25,        // prong radius where it leaves the body...
    prongTip: 0.17,         // ...tapering to this at the tip
    satinExtra: 0.07,       // satin sleeve is this much thicker than the prong
    bend: 0.02,             // body curves down a little toward the ends (y -= bend * x^2)...
    arc: 0.06,              // ...and arcs back toward the head (z -= arc * x^2), like a real comb clip
    springCoilRadius: 0.16, // inside the body, behind the slider
    springWire: 0.035,
    springTurns: 9,
    springLength: 2.8
  };

  // Spacing is a value from 0 (narrow) to 1 (wide); 0.5 is medium.
  // Pitch and knob position are placeholders, relative only.
  var SPACING = { narrow: 0, medium: 0.5, wide: 1 };
  function pitchFor(s) { return s < 0.5 ? 0.92 + (1.09 - 0.92) * (s / 0.5) : 1.09 + (1.22 - 1.09) * ((s - 0.5) / 0.5); }
  function knobXFor(s) { return -1.8 + 3.6 * s; }
  function spacingValue(spacing) {
    if (typeof spacing === "number") return Math.max(0, Math.min(1, spacing));
    return SPACING.hasOwnProperty(spacing) ? SPACING[spacing] : 0.5;
  }

  // Prong centre-line in the y-z plane: starts inside the body, runs down and
  // curves gently back (toward the head) so the clip grips and stays on.
  var PRONG = [[-0.3, 0.0], [-2.7, 0.15], [-4.4, -0.85]];
  var CAP_START = 0.065;  // the satin covers each prong from where it leaves the body...
  var CAP_END = 1.04;     // ...to just past the end, so it wraps the tip
  // Satin band that joins the tops of the sleeves (the "glove").
  var GLOVE = { height: 0.45, side: 0.02, z: 0.02 };
  // Knob on the front of the body.
  var KNOB = { w: 1.15, h: 0.62, d: 0.34, edge: 0.14 };

  // Part ids match the PRD's five parts.
  var PARTS = [
    { id: "body", name: "Body and hinge", material: "Matte plastic (PLA for the prototype)", job: "Holds the clip together" },
    { id: "spring", name: "Spring", material: "Steel, lighter tension than a regular claw clip", job: "Grips without clamping" },
    { id: "prongs", name: "Prongs", material: "Comb-style, rounded ends", job: "Lift the roots" },
    { id: "slider", name: "Spacing slider", material: "Plastic, on the outside of the clip", job: "Sets prong spacing for hair texture" },
    { id: "caps", name: "Tip caps", material: "Polyester satin, removable and washable", job: "Let hair glide, protect the scalp" }
  ];

  // ---- small vector helpers ------------------------------------------------

  function v(x, y, z) { return [x, y, z]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function scale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function len(a) { return Math.sqrt(dot(a, a)); }
  function norm(a) { var l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function smoothstep(e0, e1, x) { var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
  var X = v(1, 0, 0);

  // A triangle soup that keeps every triangle facing outward: each triangle is
  // given a point inside the material, and its winding is flipped if needed.
  // An optional tangent (direction of satin weave or hair strands) is kept.
  function Mesh() { this.tris = []; }
  Mesh.prototype.tri = function (a, b, c, inside, tag, tan) {
    var n = cross(sub(b, a), sub(c, a));
    var centre = scale(add(add(a, b), c), 1 / 3);
    if (dot(n, sub(centre, inside)) < 0) { var t = b; b = c; c = t; }
    this.tris.push({ a: a, b: b, c: c, tag: tag, tan: tan || null });
  };
  Mesh.prototype.quad = function (a, b, c, d, inside, tag, tan) {
    this.tri(a, b, c, inside, tag, tan);
    this.tri(a, c, d, inside, tag, tan);
  };
  // Move every point (used to bend the clip along its length).
  Mesh.prototype.map = function (fn) {
    this.tris.forEach(function (t) { t.a = fn(t.a); t.b = fn(t.b); t.c = fn(t.c); });
    return this;
  };

  // ---- curves --------------------------------------------------------------

  // Quadratic Bezier through three [y, z] points, placed at a given x.
  function curve(pts, x) {
    return [v(x, pts[0][0], pts[0][1]), v(x, pts[1][0], pts[1][1]), v(x, pts[2][0], pts[2][1])];
  }
  function bez(c, t) {
    var u = 1 - t;
    return add(add(scale(c[0], u * u), scale(c[1], 2 * u * t)), scale(c[2], t * t));
  }
  function bezTan(c, t) {
    return norm(add(scale(sub(c[1], c[0]), 2 * (1 - t)), scale(sub(c[2], c[1]), 2 * t)));
  }

  // ---- primitives ----------------------------------------------------------

  // Outline of a rounded rectangle with a fixed number of points, so outlines
  // of different sizes can be joined point to point.
  function roundedRect(cx, cy, w, h, r, seg, nw, nh) {
    r = Math.max(0.001, Math.min(r, w / 2 - 0.001, h / 2 - 0.001));
    var pts = [], corners = [
      [cx + w / 2 - r, cy + h / 2 - r, 0], [cx - w / 2 + r, cy + h / 2 - r, Math.PI / 2],
      [cx - w / 2 + r, cy - h / 2 + r, Math.PI], [cx + w / 2 - r, cy - h / 2 + r, 3 * Math.PI / 2]
    ];
    corners.forEach(function (k, ci) {
      for (var i = 0; i <= seg; i++) {
        var a = k[2] + (i / seg) * Math.PI / 2;
        pts.push([k[0] + r * Math.cos(a), k[1] + r * Math.sin(a)]);
      }
      var nk = corners[(ci + 1) % 4], na = nk[2], from = pts[pts.length - 1];
      var to = [nk[0] + r * Math.cos(na), nk[1] + r * Math.sin(na)], n = ci % 2 === 0 ? nw : nh;
      for (var j = 1; j < n; j++) pts.push([from[0] + (to[0] - from[0]) * j / n, from[1] + (to[1] - from[1]) * j / n]);
    });
    return pts;
  }

  // A soft, pillowy block: rounded-rectangle outline in x-y, extruded along z,
  // with every edge rounded (like a moulded acetate clip).
  function softBox(m, cx, cy, cz, w, h, d, r, re, tag, tan) {
    re = Math.min(re, d / 2 - 0.001, h / 2 - 0.001);
    var seg = 6, nw = Math.max(2, Math.round((w - 2 * r) / 0.25)), nh = Math.max(2, Math.round((h - 2 * r) / 0.25));
    var K = 6, rings = [], inside = v(cx, cy, cz);
    function ring(phi, front) {
      var s = re * (1 - Math.cos(phi)), z = cz + (front ? 1 : -1) * ((d / 2 - re) + re * Math.sin(phi));
      return roundedRect(cx, cy, w - 2 * s, h - 2 * s, r - s, seg, nw, nh).map(function (p) { return v(p[0], p[1], z); });
    }
    for (var k = K; k >= 0; k--) rings.push(ring((k / K) * Math.PI / 2, false));
    for (k = 0; k <= K; k++) rings.push(ring((k / K) * Math.PI / 2, true));
    var n = rings[0].length;
    for (var i = 0; i < rings.length - 1; i++) {
      for (var j = 0; j < n; j++) {
        var j2 = (j + 1) % n;
        m.quad(rings[i][j], rings[i][j2], rings[i + 1][j2], rings[i + 1][j], inside, tag, tan);
      }
    }
    // Flat caps, built from rings toward the centre.
    [rings[0], rings[rings.length - 1]].forEach(function (rg) {
      var z = rg[0][2], c = v(cx, cy, z), steps = 4;
      for (var j = 0; j < n; j++) {
        var p = rg[j], q = rg[(j + 1) % n];
        for (var k = 0; k < steps; k++) {
          var s0 = k / steps, s1 = (k + 1) / steps;
          var p0 = v(cx + (p[0] - cx) * s0, cy + (p[1] - cy) * s0, z), q0 = v(cx + (q[0] - cx) * s0, cy + (q[1] - cy) * s0, z);
          var p1 = v(cx + (p[0] - cx) * s1, cy + (p[1] - cy) * s1, z), q1 = v(cx + (q[0] - cx) * s1, cy + (q[1] - cy) * s1, z);
          if (k === 0) m.tri(c, p1, q1, inside, tag, tan);
          else m.quad(p0, q0, q1, p1, inside, tag, tan);
        }
      }
    });
  }

  // Round tube swept along curve c from t0 to t1 (radius rFn(t)), flat at t0,
  // rounded at t1. Each piece keeps the curve direction as its tangent.
  function sweptTube(m, c, t0, t1, rFn, tag, withTan, seg, steps) {
    seg = seg || 20; steps = steps || 18;
    var rings = [], frames = [];
    for (var s = 0; s <= steps; s++) {
      var t = t0 + (t1 - t0) * (s / steps), r = rFn(t);
      var p = bez(c, t), tan = bezTan(c, t);
      var nrm = norm(cross(tan, X)), bin = norm(cross(tan, nrm));
      var ring = [];
      for (var i = 0; i < seg; i++) {
        var a = (i / seg) * 2 * Math.PI;
        ring.push(add(p, add(scale(nrm, r * Math.cos(a)), scale(bin, r * Math.sin(a)))));
      }
      rings.push(ring); frames.push({ c: p, tan: tan, nrm: nrm, bin: bin, r: r });
    }
    for (s = 0; s < steps; s++) {
      var mid = scale(add(frames[s].c, frames[s + 1].c), 0.5), tg = withTan ? frames[s].tan : null;
      for (i = 0; i < seg; i++) {
        var j = (i + 1) % seg;
        m.quad(rings[s][i], rings[s][j], rings[s + 1][j], rings[s + 1][i], mid, tag, tg);
      }
    }
    var st = frames[0];
    for (i = 0; i < seg; i++) {
      m.tri(st.c, rings[0][i], rings[0][(i + 1) % seg], add(st.c, scale(st.tan, st.r * 0.5)), tag, withTan ? st.tan : null);
    }
    var en = frames[steps], lat = 7, prev = rings[steps];
    for (var k = 1; k <= lat; k++) {
      var phi = (k / lat) * Math.PI / 2, rr = en.r * Math.cos(phi), off = en.r * Math.sin(phi);
      var ring2 = [];
      for (i = 0; i < seg; i++) {
        var a2 = (i / seg) * 2 * Math.PI;
        ring2.push(add(en.c, add(scale(en.tan, off), add(scale(en.nrm, rr * Math.cos(a2)), scale(en.bin, rr * Math.sin(a2))))));
      }
      for (i = 0; i < seg; i++) {
        var j2 = (i + 1) % seg;
        if (k === lat) m.tri(prev[i], prev[j2], ring2[0], en.c, tag, withTan ? en.tan : null);
        else m.quad(prev[i], prev[j2], ring2[j2], ring2[i], en.c, tag, withTan ? en.tan : null);
      }
      prev = ring2;
    }
  }

  // Coil spring along x.
  function coil(m, x0, x1, y, z, R, wire, turns, tag) {
    var steps = turns * 24, seg = 8, rings = [], cs = [];
    for (var s = 0; s <= steps; s++) {
      var t = s / steps, a = t * turns * 2 * Math.PI;
      var c = v(x0 + (x1 - x0) * t, y + R * Math.cos(a), z + R * Math.sin(a));
      var tan = norm(v((x1 - x0) / (turns * 2 * Math.PI), -R * Math.sin(a), R * Math.cos(a)));
      var radial = norm(v(0, Math.cos(a), Math.sin(a)));
      var bin = norm(cross(tan, radial));
      var ring = [];
      for (var i = 0; i < seg; i++) {
        var b = (i / seg) * 2 * Math.PI;
        ring.push(add(c, add(scale(radial, wire * Math.cos(b)), scale(bin, wire * Math.sin(b)))));
      }
      rings.push(ring); cs.push(c);
    }
    for (s = 0; s < steps; s++) {
      var mid = scale(add(cs[s], cs[s + 1]), 0.5);
      for (i = 0; i < seg; i++) {
        var j = (i + 1) % seg;
        m.quad(rings[s][i], rings[s][j], rings[s + 1][j], rings[s + 1][i], mid, tag);
      }
    }
  }

  // Tube along y (for the mannequin's neck and stand), with closed ends.
  function tubeY(m, y0, y1, cx, cz, rxFn, rzFn, tag, seg, steps) {
    seg = seg || 40; steps = steps || 16;
    var rings = [];
    for (var s = 0; s <= steps; s++) {
      var y = y0 + (y1 - y0) * (s / steps), t = s / steps, ring = [];
      for (var i = 0; i < seg; i++) {
        var a = (i / seg) * 2 * Math.PI;
        ring.push(v(cx + rxFn(t) * Math.sin(a), y, cz + rzFn(t) * Math.cos(a)));
      }
      rings.push(ring);
    }
    for (s = 0; s < steps; s++) {
      var mid = v(cx, y0 + (y1 - y0) * ((s + 0.5) / steps), cz);
      for (i = 0; i < seg; i++) {
        var j = (i + 1) % seg;
        m.quad(rings[s][i], rings[s][j], rings[s + 1][j], rings[s + 1][i], mid, tag);
      }
    }
    [[0, y0, 0.01], [steps, y1, -0.01]].forEach(function (e) {
      var c = v(cx, e[1], cz);
      for (var i = 0; i < seg; i++) m.tri(c, rings[e[0]][i], rings[e[0]][(i + 1) % seg], add(c, v(0, (y1 > y0 ? 1 : -1) * e[2], 0)), tag);
    });
  }

  // ---- the clip ------------------------------------------------------------

  function prongXs(count, pitch) {
    var xs = [];
    for (var i = 0; i < count; i++) xs.push((i - (count - 1) / 2) * pitch);
    return xs;
  }
  function prongRadius(t) { return SIZES.prongRoot + (SIZES.prongTip - SIZES.prongRoot) * t; }
  function bendPoint(p) { var x2 = p[0] * p[0]; return v(p[0], p[1] - SIZES.bend * x2, p[2] - SIZES.arc * x2); }

  // Build the clip. opts: { spacing: "narrow"|"medium"|"wide" or 0..1, satin: bool,
  // print: bool (printable plastic only: no satin, track or spring) }.
  // Returns meshes: comb (body, prongs, track), slider, spring, caps (the satin glove),
  // plus knob: { centre, ... } so the viewer can let you drag it.
  // The spring sits inside the body, so the viewer only shows it in "parts apart".
  function buildClip(opts) {
    opts = opts || {};
    var s = spacingValue(opts.spacing), S = SIZES;
    var out = { comb: new Mesh(), slider: new Mesh(), spring: new Mesh(), caps: new Mesh() };
    var frontZ = S.bodyDepth / 2;

    // Body: soft, rounded, curving down slightly toward the ends.
    softBox(out.comb, 0, 0, 0, S.bodyWidth, S.bodyHeight, S.bodyDepth, S.bodyCorner, S.bodyEdge, "body");

    // One row of tapered prongs, gently curved back to follow the head.
    var xs = prongXs(S.prongs, pitchFor(s));
    xs.forEach(function (x) {
      var c = curve(PRONG, x);
      sweptTube(out.comb, c, 0, 1, prongRadius, "prongs");
      if (opts.satin && !opts.print) {
        sweptTube(out.caps, c, CAP_START, CAP_END, function (t) { return prongRadius(Math.min(t, 1)) + S.satinExtra; }, "caps", true);
      }
    });

    // The satin is one piece, like a glove: a band just under the body joins
    // the tops of all the sleeves, so a single sleeve can't get lost.
    if (opts.satin && !opts.print) {
      var half = xs[xs.length - 1] + S.prongRoot + S.satinExtra + GLOVE.side;
      softBox(out.caps, 0, -S.bodyHeight / 2 - GLOVE.height / 2 + 0.02, GLOVE.z,
        2 * half, GLOVE.height, 2 * (S.prongRoot + S.satinExtra) + 0.1, 0.2, 0.16, "caps", X);
    }

    // Spacing slider on the front of the body: a slim track and the knob.
    var kx = knobXFor(s);
    if (!opts.print) {
      // Two slim bars, either side of the knob.
      [[-3.0, kx - 0.6], [kx + 0.6, 3.0]].forEach(function (seg) {
        if (seg[1] - seg[0] > 0.2) {
          softBox(out.comb, (seg[0] + seg[1]) / 2, 0, frontZ, seg[1] - seg[0], 0.1, 0.08, 0.045, 0.035, "track");
        }
      });
    }
    var knobZ = opts.print ? 0 : frontZ + KNOB.d / 2 - 0.08;
    softBox(out.slider, opts.print ? 0 : kx, 0, knobZ, KNOB.w, KNOB.h, KNOB.d, 0.28, KNOB.edge, "slider");

    // Steel spring (bought, not printed), inside the body behind the slider track.
    if (!opts.print) {
      var springZ = frontZ - S.springCoilRadius - S.springWire - 0.1;
      coil(out.spring, -S.springLength / 2, S.springLength / 2, 0, springZ, S.springCoilRadius, S.springWire, S.springTurns, "spring");
    }

    // Curve everything gently along its length, like a real comb clip.
    Object.keys(out).forEach(function (k) { out[k].map(bendPoint); });
    out.knob = { centre: bendPoint(v(opts.print ? 0 : kx, 0, knobZ)), front: frontZ, spacing: s };
    return out;
  }

  // Knob centre for a spacing value (for the viewer's drag handle).
  function knobCentre(s) { return bendPoint(v(knobXFor(spacingValue(s)), 0, SIZES.bodyDepth / 2 + KNOB.d / 2 - 0.08)); }

  // For the viewer: the same clip, but split into parts that are built once
  // and then moved into place, so changing the spacing is instant.
  //   body   - body and slider track, already curved
  //   prong  - one prong at x = 0 (copied to each position by layout())
  //   sleeve - one satin sleeve at x = 0
  //   band   - the glove band at medium width, curved (stretched by layout())
  //   knob   - the slider knob at x = 0
  //   spring - inside the body, curved
  function buildClipParts() {
    var S = SIZES, frontZ = S.bodyDepth / 2, p = {};
    ["body", "prong", "sleeve", "band", "knob", "spring"].forEach(function (k) { p[k] = new Mesh(); });
    softBox(p.body, 0, 0, 0, S.bodyWidth, S.bodyHeight, S.bodyDepth, S.bodyCorner, S.bodyEdge, "body");
    softBox(p.body, 0, 0, frontZ, 6.0, 0.1, 0.08, 0.045, 0.035, "track");
    var c = curve(PRONG, 0);
    sweptTube(p.prong, c, 0, 1, prongRadius, "prongs");
    sweptTube(p.sleeve, c, CAP_START, CAP_END, function (t) { return prongRadius(Math.min(t, 1)) + S.satinExtra; }, "caps", true);
    var half = bandHalf(0.5);
    softBox(p.band, 0, -S.bodyHeight / 2 - GLOVE.height / 2 + 0.02, GLOVE.z,
      2 * half, GLOVE.height, 2 * (S.prongRoot + S.satinExtra) + 0.1, 0.2, 0.16, "caps", X);
    softBox(p.knob, 0, 0, frontZ + KNOB.d / 2 - 0.08, KNOB.w, KNOB.h, KNOB.d, 0.28, KNOB.edge, "slider");
    var springZ = frontZ - S.springCoilRadius - S.springWire - 0.1;
    coil(p.spring, -S.springLength / 2, S.springLength / 2, 0, springZ, S.springCoilRadius, S.springWire, S.springTurns, "spring");
    ["body", "band", "spring"].forEach(function (k) { p[k].map(bendPoint); });
    return p;
  }
  function bandHalf(s) { return prongXs(SIZES.prongs, pitchFor(s))[SIZES.prongs - 1] + SIZES.prongRoot + SIZES.satinExtra + GLOVE.side; }
  // Where each part goes for a spacing value: prong offsets (each prong follows
  // the curve of the body), how much to stretch the glove band, and the knob offset.
  function layout(s) {
    s = spacingValue(s);
    var offs = prongXs(SIZES.prongs, pitchFor(s)).map(function (x) { var b = bendPoint(v(x, 0, 0)); return b; });
    var kx = knobXFor(s), k = bendPoint(v(kx, 0, 0));
    return { prongs: offs, bandScale: bandHalf(s) / bandHalf(0.5), knob: k };
  }

  // Direction the satin glove slides when it comes off: down along the prongs.
  var GLOVE_OFF = norm(v(0, -1, -0.16));

  // ---- the mannequin head --------------------------------------------------

  // A salon mannequin head (cm). Polar angle th from the crown (0) to the chin
  // (PI), azimuth ph around the vertical, 0 = facing forward (+z).
  function g2(a, b) { return Math.exp(-(a * a + b * b)); }
  function headPoint(th, ph) {
    var ux = Math.sin(th) * Math.sin(ph), uy = Math.cos(th), uz = Math.sin(th) * Math.cos(ph);
    var x = 7.8 * ux, y = 11.0 * uy, z = 9.3 * uz;
    if (uy < 0) {
      var k = uy * uy;
      x *= 1 - 0.30 * k;
      z *= uz < 0 ? 1 - 0.55 * k : 1 - 0.1 * k;
    }
    if (uy > 0 && uz < 0) z *= 1 + 0.05 * uy;
    var w = smoothstep(0.25, 0.65, uz);
    if (w > 0) {
      z += w * (
        1.6 * g2(x / 0.9, (y + 1.5) / 1.9) +                                     // nose
        0.4 * g2(x / 4.2, (y - 2.8) / 0.8) -                                     // brow
        0.7 * (g2((x - 3.1) / 1.3, (y - 1.1) / 0.9) + g2((x + 3.1) / 1.3, (y - 1.1) / 0.9)) + // eyes
        0.3 * (g2((x - 3.8) / 1.4, (y + 1.0) / 1.5) + g2((x + 3.8) / 1.4, (y + 1.0) / 1.5)) + // cheeks
        0.45 * g2(x / 1.8, (y + 5.0) / 0.55) -                                   // lips
        0.16 * g2(x / 1.6, (y + 5.25) / 0.13) +                                  // mouth line
        0.5 * g2(x / 2.1, (y + 8.3) / 1.2)                                       // chin
      );
    }
    return v(x, y, z);
  }
  function headNormal(th, ph) {
    var e = 1e-3, p = headPoint(th, ph);
    var a = sub(headPoint(th + e, ph), p), b = sub(headPoint(th, ph + e), p);
    var n = norm(cross(b, a));
    if (dot(n, p) < 0) n = scale(n, -1);
    return n;
  }
  // Hairline: further down at the back than at the front (slicked back).
  function hairline(ph) { return (50 + 68 * (1 - Math.cos(ph)) / 2) * Math.PI / 180; }
  // Hair thickness over the scalp, fading to nothing at the hairline.
  function hairThickness(th, ph) {
    var h = hairline(ph);
    if (th > h) return 0;
    // A thin base layer over the scalp; the visible hair is the curls on top of it.
    return 0.35 * smoothstep(h, h - 0.2, th) + 0.12 * Math.max(0, Math.cos(th)) * smoothstep(h, h - 0.5, th);
  }
  function hairPoint(th, ph) { return add(headPoint(th, ph), scale(headNormal(th, ph), hairThickness(th, ph))); }

  function buildHead() {
    var m = new Mesh(), NT = 90, NP = 128, centre = v(0, 0, 0);
    function grid(fn, tag, keep, tanFn) {
      for (var i = 0; i < NT; i++) {
        for (var j = 0; j < NP; j++) {
          var th0 = (i / NT) * Math.PI, th1 = ((i + 1) / NT) * Math.PI;
          var ph0 = (j / NP) * 2 * Math.PI, ph1 = ((j + 1) / NP) * 2 * Math.PI;
          if (keep && !keep((th0 + th1) / 2, (ph0 + ph1) / 2)) continue;
          var a = fn(th0, ph0), b = fn(th0, ph1), c = fn(th1, ph1), d = fn(th1, ph0);
          var tg = tanFn ? tanFn((th0 + th1) / 2, (ph0 + ph1) / 2) : null;
          if (i === 0) m.tri(a, c, d, centre, tag, tg);
          else if (i === NT - 1) m.tri(a, b, d, centre, tag, tg);
          else m.quad(a, b, c, d, centre, tag, tg);
        }
      }
    }
    grid(headPoint, "skin");
    // Hair strands on the lifted front section flow back over the head.
    function flow(th, ph) {
      var p = hairPoint(th, ph), n = headNormal(th, ph);
      var f = norm(v(0, -0.7 * Math.max(0, -Math.cos(ph)), -1));
      f = sub(f, scale(n, dot(f, n)));
      if (len(f) < 1e-3) f = v(0, -1, 0);
      return norm(f);
    }
    // The hair covers the scalp from the crown down to the hairline. Its grid
    // follows the hairline exactly (u = 0 crown, u = 1 hairline), so the edge
    // is smooth and the hair thins to nothing there.
    function hairUV(u, ph) { return hairPoint(u * hairline(ph), ph); }
    for (var hi = 0; hi < NT; hi++) {
      for (var hj = 0; hj < NP; hj++) {
        var u0 = hi / NT, u1 = (hi + 1) / NT, q0 = (hj / NP) * 2 * Math.PI, q1 = ((hj + 1) / NP) * 2 * Math.PI;
        var A = hairUV(u0, q0), B = hairUV(u0, q1), C = hairUV(u1, q1), D = hairUV(u1, q0);
        var tg = flow(((u0 + u1) / 2) * hairline((q0 + q1) / 2), (q0 + q1) / 2);
        if (hi === 0) m.tri(A, C, D, centre, "hairBase", tg);
        else m.quad(A, B, C, D, centre, "hairBase", tg);
      }
    }
    // The rest of the hair is down: long, wavy lengths that come out from under
    // the lifted front section and fall past the shoulders all round, opening
    // at the front so they frame the face.
    var LH = buildLengths();
    for (var li = 0; li < LH.rows.length - 1; li++) {
      for (var lj = 0; lj < LH.rows[li].length - 1; lj++) {
        var a = LH.rows[li][lj], b = LH.rows[li][lj + 1], c = LH.rows[li + 1][lj + 1], d = LH.rows[li + 1][lj];
        var tg = norm(sub(add(d, c), add(a, b)));
        var mid = scale(add(add(a, b), add(c, d)), 0.25);
        m.quad(a, b, c, d, v(0, mid[1], -1.0), "hairBase", tg);
      }
    }
    // Small ears.
    [-1, 1].forEach(function (sx) {
      var c = v(sx * 7.45, -0.4, -0.6);
      for (var i = 0; i < 12; i++) {
        for (var j = 0; j < 18; j++) {
          var pt = function (a, b) { return v(c[0] + sx * 0.75 * Math.sin(a) * Math.cos(b) * 0.6 + sx * 0.3, c[1] + 2.9 * Math.cos(a), c[2] + 1.6 * Math.sin(a) * Math.sin(b)); };
          var a0 = (i / 12) * Math.PI, a1 = ((i + 1) / 12) * Math.PI, b0 = (j / 18) * 2 * Math.PI, b1 = ((j + 1) / 18) * 2 * Math.PI;
          var P = pt(a0, b0), Q = pt(a0, b1), R = pt(a1, b1), T = pt(a1, b0);
          if (i === 0) m.tri(P, R, T, c, "skin");
          else if (i === 11) m.tri(P, Q, T, c, "skin");
          else m.quad(P, Q, R, T, c, "skin");
        }
      }
    });
    // Neck and a tall display stand, so the hair can hang freely.
    tubeY(m, -4, -20, 0, -1.2, function (t) { return 4.5 + 0.9 * t * t; }, function (t) { return 4.1 + 0.7 * t * t; }, "skin");
    tubeY(m, -19.8, -28.0, 0, -1.2, function () { return 3.0; }, function () { return 3.0; }, "stand");
    tubeY(m, -28.0, -29.2, 0, -1.2, function () { return 8.5; }, function () { return 8.5; }, "stand");
    return m;
  }

  // Long wavy lengths (cm). Rows run from the roots (under the lifted front
  // section) down to the ends; columns go round the head from one side of the
  // face, round the back, to the other side.
  var LENGTHS = { open: 0.95, end: -25, roots: 26, fall: 50, cols: 150 };
  function buildLengths() {
    var L = LENGTHS, rows = [];
    for (var r = 0; r <= L.roots + L.fall; r++) rows.push([]);
    for (var j = 0; j <= L.cols; j++) {
      var ph = L.open + (2 * Math.PI - 2 * L.open) * (j / L.cols);
      var hl = hairline(ph), th0 = hl - 0.45, th1 = Math.max(hl + 0.1, 1.62);
      // Roots: follow the scalp from under the top section, lifting away from it.
      var last = null;
      for (var r = 0; r <= L.roots; r++) {
        var t = r / L.roots, th = th0 + (th1 - th0) * t;
        var off = Math.max(0.7 * hairThickness(th, ph), 0.35) + 1.0 * t * t;
        last = add(headPoint(th, ph), scale(headNormal(th, ph), off));
        rows[r].push(last);
      }
      // Lengths: fall to the ends with volume, waves and curl clumps.
      var out = norm(v(last[0], 0, last[2] + 1.0));
      var yEnd = L.end + 1.4 * Math.sin(ph * 9.0) + 0.8 * Math.sin(ph * 23.0);
      for (r = 1; r <= L.fall; r++) {
        var s = r / L.fall, y = last[1] + (yEnd - last[1]) * s;
        var grow = smoothstep(0, 0.25, s);
        var vol = 2.6 * smoothstep(0, 0.55, s) + 0.6 * s;
        // Waves: clumps snake from side to side as they fall (S-shaped), with a
        // gentle in-and-out and ridges between the clumps.
        var wave = grow * (0.25 * Math.sin(y * 1.0 + ph * 5.0) + 0.3 * Math.abs(Math.sin(ph * 13.0 + 0.9 * Math.sin(y * 0.8 + ph * 3.0))));
        var sway = grow * 0.55 * Math.sin(y * 0.75 + ph * 7.0);
        var across = norm(v(out[2], 0, -out[0]));
        var p = add(add(v(last[0], y, last[2]), scale(out, vol + wave)), scale(across, sway));
        // Lengths beside the face swing a little forward, framing it.
        var side = Math.max(0, Math.cos(ph)) * 1.2 * grow;
        rows[L.roots + r].push(add(p, v(0, 0, side)));
      }
    }
    return { rows: rows };
  }

  // ---- curly hair: individual coils ------------------------------------------
  // Curls are spiral tubes wound around a path. They are built straight into
  // flat arrays (positions, normals, strand directions) with exact normals, so
  // the viewer can upload them without the slower smoothing step.
  var CURL = {
    ringlet: { R: 0.72, wire: 0.25, turn: 1.5 },  // long ringlets hanging down
    top: { R: 0.3, wire: 0.11, turn: 0.72 },       // small curls swept back over the top
    thread: { R: 0.24, wire: 0.1, turn: 0.62 }     // curls that run back between the prongs
  };
  function rnd(i) { var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function Arrays() { this.pos = []; this.nrm = []; this.tan = []; }
  Arrays.prototype.vert = function (p, n, t) { this.pos.push(p[0], p[1], p[2]); this.nrm.push(n[0], n[1], n[2]); this.tan.push(t[0], t[1], t[2]); };
  Arrays.prototype.done = function () {
    return { pos: new Float32Array(this.pos), nrm: new Float32Array(this.nrm), tan: new Float32Array(this.tan), count: this.pos.length / 3 };
  };
  // Resample a polyline every `step` cm.
  function resample(pts, step) {
    var out = [pts[0]], carry = 0;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], d = len(sub(b, a)), t = step - carry;
      while (t <= d) { out.push(add(a, scale(sub(b, a), t / d))); t += step; }
      carry = d - (t - step);
    }
    return out;
  }
  // One curl: a tube of radius `wire` spiralling with radius R around the path.
  function curl(out, path, c, phase, seg) {
    seg = seg || 6;
    var pts = resample(path, c.turn / 12);
    if (pts.length < 3) return;
    var T = [], N = [], B = [];
    for (var i = 0; i < pts.length; i++) {
      T.push(norm(sub(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)])));
    }
    var n0 = cross(T[0], Math.abs(T[0][1]) < 0.9 ? v(0, 1, 0) : v(1, 0, 0));
    N.push(norm(n0)); B.push(cross(T[0], N[0]));
    for (i = 1; i < pts.length; i++) {      // parallel transport: no twisting
      var n = sub(N[i - 1], scale(T[i], dot(N[i - 1], T[i])));
      N.push(norm(n)); B.push(cross(T[i], N[i]));
    }
    var centres = [], radials = [];
    for (i = 0; i < pts.length; i++) {
      var a = phase + (i / 12) * 2 * Math.PI, rad = add(scale(N[i], Math.cos(a)), scale(B[i], Math.sin(a)));
      var taper = Math.min(1, i / 6, (pts.length - 1 - i) / 6) * 0.7 + 0.3;
      centres.push(add(pts[i], scale(rad, c.R * taper))); radials.push(rad);
    }
    var rings = [];
    for (i = 0; i < pts.length; i++) {
      var th = norm(sub(centres[Math.min(i + 1, pts.length - 1)], centres[Math.max(i - 1, 0)]));
      var nr = norm(sub(radials[i], scale(th, dot(radials[i], th)))), br = cross(th, nr);
      var w = c.wire * (Math.min(1, i / 3, (pts.length - 1 - i) / 3) * 0.6 + 0.4), ring = [];
      for (var k = 0; k < seg; k++) {
        var b = (k / seg) * 2 * Math.PI, d = add(scale(nr, Math.cos(b)), scale(br, Math.sin(b)));
        ring.push({ p: add(centres[i], scale(d, w)), n: d, t: th });
      }
      rings.push(ring);
    }
    for (i = 0; i < rings.length - 1; i++) {
      for (k = 0; k < seg; k++) {
        var k2 = (k + 1) % seg, A = rings[i][k], Bq = rings[i][k2], C = rings[i + 1][k2], D = rings[i + 1][k];
        [A, Bq, C, A, C, D].forEach(function (q) { out.vert(q.p, q.n, q.t); });
      }
    }
  }
  // A path over the scalp in the plane x = x0, from the hairline back over the
  // top (only on the upper head, where the head shape is a plain ellipse in x).
  function scalpPathX(x0, thFrom, thTo, lift) {
    var pts = [];
    for (var i = 0; i <= 60; i++) {
      var th = thFrom + (thTo - thFrom) * (i / 60), r = 7.8 * Math.sin(th);
      if (Math.abs(x0) >= r * 0.98) continue;
      var ph = Math.asin(x0 / r);
      pts.push(add(hairPoint(th, ph), scale(headNormal(th, ph), lift)));
    }
    return pts;
  }
  // A path over the scalp along a fixed direction round the head.
  function scalpPathPh(ph, thFrom, thTo, lift) {
    var pts = [];
    for (var i = 0; i <= 60; i++) {
      var th = thFrom + (thTo - thFrom) * (i / 60);
      pts.push(add(hairPoint(th, ph), scale(headNormal(th, ph), lift)));
    }
    return pts;
  }
  var CLIP_ZONE = 4.3; // half-width of the clip on the head: curls here run through the prongs instead

  // All the curls except the ones through the prongs: ringlets hanging all round
  // and small curls swept back over the top and down the back of the head.
  function buildCurls() {
    var out = new Arrays(), LH = buildLengths(), L = LENGTHS, id = 0;
    // Ringlets on the hanging lengths, two layers so there are no gaps.
    for (var layer = 0; layer < 2; layer++) {
      for (var j = layer * 2; j <= L.cols; j += 4) {
        var path = [];
        for (var r = L.roots - 4; r < LH.rows.length; r++) {
          var p = LH.rows[r][j], o = norm(v(p[0], 0, p[2] + 1.0));
          path.push(add(p, scale(o, CURL.ringlet.R + CURL.ringlet.wire + 0.05 + layer * 0.55)));
        }
        var c = { R: CURL.ringlet.R * (0.85 + 0.3 * rnd(id)), wire: CURL.ringlet.wire, turn: CURL.ringlet.turn * (0.9 + 0.2 * rnd(id + 7)) };
        curl(out, path, c, rnd(id + 3) * 6.28); id++;
      }
    }
    var lift = CURL.top.R + CURL.top.wire;
    // Front and top: swept back from the hairline, beside the clip.
    for (var x = CLIP_ZONE + 0.5; x < 7.4; x += 0.95) {
      [-1, 1].forEach(function (sx) {
        var ph = Math.asin(Math.min(0.99, sx * x / 7.8));
        curl(out, scalpPathX(sx * x, hairline(ph) - 0.04, 0.25, lift), CURL.top, rnd(id++) * 6.28);
      });
    }
    // Behind the clip, over the crown: more swept-back curls.
    for (x = -CLIP_ZONE; x <= CLIP_ZONE; x += 0.95) curl(out, scalpPathX(x, 0.62, 0.12, lift), CURL.top, rnd(id++) * 6.28);
    // Sides and back: from the crown down towards the ringlets.
    for (var ph = 1.25; ph < 2 * Math.PI - 1.25; ph += 0.17) {
      curl(out, scalpPathPh(ph, 0.3, Math.min(hairline(ph) - 0.1, 1.75), lift), CURL.top, rnd(id++) * 6.28);
    }
    return out.done();
  }

  // The curls that run back from the hairline between the prongs (and just
  // outside the two end prongs), lined up with the prongs for a spacing value.
  // In head space, using the clip's placement on the head.
  function buildThreadCurls(spacing) {
    var out = new Arrays(), s = spacingValue(spacing), pl = headPlacement();
    var xs = prongXs(SIZES.prongs, pitchFor(s)), half = pitchFor(s) / 2, gaps = [xs[0] - half];
    xs.forEach(function (x) { gaps.push(x + half); });
    var lift = CURL.thread.R + CURL.thread.wire + 0.06;
    gaps.forEach(function (gx, i) {
      // Clip x maps to head x through the placement (the clip's x axis is ex).
      var wx = pl.origin[0] + pl.ex[0] * gx;
      var ph = Math.asin(Math.max(-0.99, Math.min(0.99, wx / 7.8)));
      curl(out, scalpPathX(wx, hairline(ph) - 0.04, 0.3, lift), CURL.thread, rnd(100 + i) * 6.28);
    });
    return out.done();
  }

  // Where the clip sits on the mannequin: at the front of the head, just behind
  // the hairline, body along the hairline (parallel to the head), prongs combed
  // back over the hair, slider facing out and forward. Returns the clip's axes
  // and origin in head space.
  // The tilt and depth were fitted so the prongs lie in the layer of curls (at
  // the same height as the curls that run between them), not touching the
  // scalp, with the body sitting on top.
  var WEAR = { th: 36 * Math.PI / 180, tilt: 6 * Math.PI / 180, depth: 0.1 };
  function rotAbout(p, axis, a) {
    var c = Math.cos(a), s = Math.sin(a), d = dot(p, axis), cr = cross(axis, p);
    return add(add(scale(p, c), scale(cr, s)), scale(axis, d * (1 - c)));
  }
  function headPlacement() {
    var th = WEAR.th, e = 1e-3;
    var P = hairPoint(th, 0), n = headNormal(th, 0);
    var back = norm(sub(hairPoint(th - e, 0), hairPoint(th + e, 0)));
    var ey = scale(back, -1);                       // clip +y points forward (prongs go back)
    var ez = norm(sub(n, scale(ey, dot(n, ey))));   // slider faces out from the head
    var ex = cross(ey, ez);
    var origin = add(P, scale(ez, 0.12 + WEAR.depth));
    return { origin: origin, ex: ex, ey: rotAbout(ey, ex, WEAR.tilt), ez: rotAbout(ez, ex, WEAR.tilt) };
  }

  // ---- STL export (millimetres) -------------------------------------------

  function f(x) { return (Math.abs(x) < 1e-9 ? 0 : x).toFixed(4); }
  function toSTL(meshes, name) {
    var lines = ["solid " + name];
    meshes.forEach(function (m) {
      m.tris.forEach(function (t) {
        var a = scale(t.a, 10), b = scale(t.b, 10), c = scale(t.c, 10);
        var n = norm(cross(sub(b, a), sub(c, a)));
        lines.push(" facet normal " + n.map(f).join(" "));
        lines.push("  outer loop");
        [a, b, c].forEach(function (p) { lines.push("   vertex " + p.map(f).join(" ")); });
        lines.push("  endloop");
        lines.push(" endfacet");
      });
    });
    lines.push("endsolid " + name);
    return lines.join("\n") + "\n";
  }

  // Printable parts at medium spacing. The comb is printed as one piece and the
  // slider knob is a form study: how the slider moves the prongs isn't designed yet.
  function printParts() {
    var clip = buildClip({ spacing: "medium", satin: false, print: true });
    return {
      "clip-comb": [clip.comb],
      "clip-slider-knob": [clip.slider]
    };
  }

  root.ClipModel = {
    SIZES: SIZES, SPACING: SPACING, PARTS: PARTS, GLOVE_OFF: GLOVE_OFF,
    pitchFor: pitchFor, spacingValue: spacingValue, knobCentre: knobCentre,
    buildClip: buildClip, buildClipParts: buildClipParts, layout: layout,
    buildHead: buildHead, headPlacement: headPlacement,
    buildCurls: buildCurls, buildThreadCurls: buildThreadCurls, CURL: CURL,
    toSTL: toSTL, printParts: printParts
  };
})(typeof window !== "undefined" ? window : this);
