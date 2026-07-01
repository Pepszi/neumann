// Scroll-driven WebGL hero: raymarched SDF logo animation scrubbed by scroll position.
const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl2', { antialias:true, premultipliedAlpha:false });
if (!gl){ document.body.innerHTML = '<p style="color:#fff;padding:2rem">WebGL2 not available.</p>'; }

const VERT = `#version 300 es
void main(){
  vec2 p = vec2((gl_VertexID == 1) ? 3.0 : -1.0, (gl_VertexID == 2) ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

function compile(type, src){
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, document.getElementById('frag').textContent));
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
gl.useProgram(prog);

const U = {};
['uRes','uTCam','uTBrep','uTExt','uTSlice','uSliceAng','uExtH','uLeg','uBar','uHalfH','uSpacing','uFade','uCamDist','uFovTan','uOrthoBase','uShift','uViewScale','uTint','uHero','uHeroSpacing','uDpr','uDock','uHeader','uTime']
  .forEach(n => U[n] = gl.getUniformLocation(prog, n));

const params = { leg:0.42, bar:0.42, hh:1.0, spacing:0.145, fade:0.7 };
const CAM_DIST = 3.6, FOV_TAN = Math.tan(45 * Math.PI / 360);
const MAX_EXT = 0.6;   // extrusion half-height (slab spans [-MAX_EXT, +MAX_EXT])

let curP = 0;
const start = performance.now();

function smoothstep(a, b, x){ x = Math.min(Math.max((x - a) / (b - a), 0), 1); return x * x * (3 - 2 * x); }
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const mobileMQ = matchMedia('(max-width: 859px), (orientation: portrait)');

// touch devices get a lower resolution cap (the raymarch is heavy on mobile GPUs)
const isCoarse = matchMedia('(pointer: coarse)').matches;
const DPR_CAP = isCoarse ? 1.25 : 1.5;
const SMOOTH = isCoarse ? 0.20 : 0.35;   // ease curP toward the scroll target (absorbs snap jumps)
const VFIT = 2.0 / 0.70;   // mark (2 units) fills ~70% of the shorter viewport axis

// visible world-height at the opening view, widened on portrait so the mark fits the width too
function orthoBase(){
  const aspect = innerWidth / innerHeight;
  return VFIT / Math.min(1.0, aspect);
}

const wordmark = document.getElementById('wordmark');
const WORDMARK_AR = 1835 / 200;   // svg aspect ratio (width / height)
const copyEls = document.querySelectorAll('#copy .stagecopy');
const heroEl = document.getElementById('hero');
const scrollHint = document.getElementById('scrollhint');
const scrollerEl = document.getElementById('scroller');
const hrule = document.getElementById('hrule');

// stable viewport height for all scroll math (stage size, snap targets, dock boundary). it is re-baselined
// only on a real orientation/window change -- NOT when the mobile address bar shows/hides (height-only,
// small delta). the spacers are 7*VH, so the dock boundary stays put while you scroll into the text instead
// of sliding 7x the address-bar delta and yanking the mark. visual layout still tracks live innerHeight.
let VH = innerHeight, VW = innerWidth;
// top safe-area inset (Dynamic Island / status bar). with viewport-fit=cover the page extends under it,
// so we read its height and push the docked header band down by it while the black strip fills behind it.
let SAFE_TOP = 0;
const safeProbe = document.createElement('div');
safeProbe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top, 0px);visibility:hidden;pointer-events:none;';
document.body.appendChild(safeProbe);
function syncViewport(){
  VH = innerHeight; VW = innerWidth;
  SAFE_TOP = safeProbe.getBoundingClientRect().height;
  const sh = VH + 'px';
  for (const d of scrollerEl.children){ d.style.height = sh; }
}
const HEADER_H = 60;       // docked header strip height in CSS px (matches --header)
const DOCK_UNIT = 9.5;     // px per world unit for the docked "n" (small enough the wordmark still fits mobile)
const DOCK_X = 44;         // docked logo center, px from the left edge
let curDock = 0;           // 0 = hero lockup, 1 = shrunk + docked into the sticky header

// Align the wordmark under the logo from the logo's current on-screen center/size (CSS px), so it
// tracks the logo wherever it goes. It swipes out during the first transition and fades back in at the hero.
function placeWordmark(cx, cy, half){
  // at the hero the field shows 3 rings whose outer ring sits at the notch half-width (1-leg) beyond
  // the mark; grow the wordmark out to that outer ring's span + bottom edge as the hero forms
  const fieldHero = Math.max(1.0 - smoothstep(0.0, 0.13, curP), smoothstep(0.80, 1.0, curP));
  const lwHeroW = ((1.0 - params.leg) / 3.0) * 0.15;      // hero contour half-width (mark units; sp = (1-leg)/3)
  const ext = 1.0 + ((1.0 - params.leg) + lwHeroW) * fieldHero;   // span to the outer contour's outer edge
  const w = 2.0 * half * ext;                             // span the outer ring's width
  const restTop = cy + half * ext + 0.5 * (w / WORDMARK_AR);   // gap below outer ring = half the wordmark height
  const exit = (innerHeight - restTop) + w / WORDMARK_AR + innerHeight * 0.18;
  const swipe = smoothstep(0.01, 0.13, curP) * (1.0 - smoothstep(0.88, 0.93, curP));  // out, then back for the hero
  const heroFade = smoothstep(0.93, 1.0, curP);

  // dock: shrink the wordmark down beside the small "n", matched to the logo's full height
  // (the "n" body plus its 2 contour lines)
  const t = curDock;
  const ringExtent = 1.0 - params.leg;                      // outer ring = notch half-width beyond the body
  const logoHalfH = DOCK_UNIT * (params.hh + ringExtent);   // docked logo half-height incl. contour lines (px)
  const logoHalfW = DOCK_UNIT * (1.0 + ringExtent);         // docked logo half-width incl. contour lines (px)
  const WM_H = 2.0 * logoHalfH;                             // wordmark height == logo height (with contour lines)
  const dockW = WM_H * WORDMARK_AR;
  const dockLeft = (DOCK_X + logoHalfW + 16) + dockW * 0.5; // logo right edge + gap, then half the wordmark
  const dockTop = SAFE_TOP + (HEADER_H - WM_H) * 0.5;
  const heroTop = restTop + swipe * exit;
  wordmark.style.width = (w + (dockW - w) * t) + 'px';
  wordmark.style.left = (cx + (dockLeft - cx) * t) + 'px';
  wordmark.style.transform = `translateX(-50%) translateY(${heroTop + (dockTop - heroTop) * t}px)`;
  wordmark.style.opacity = Math.max(Math.max(1.0 - smoothstep(0.13, 0.20, curP), heroFade), t);
}

function resize(){
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h){ canvas.width = w; canvas.height = h; }
}

function render(){
  resize();
  gl.viewport(0, 0, canvas.width, canvas.height);

  // four staged beats with holds between them:
  //  stage 1 logo (0 - .05)  ->  stage 2 turned (.16 - .24)
  //  stage 3 extruded (.44 - .50)  ->  stage 4 section spin (.54 - 1)
  // hero (.80-1.0): one combined motion -- the field returns to front, the extrusion collapses, the
  // logo tints to accent, and it moves + resizes into the centered lockup, all together
  const tCam   = smoothstep(0.03, 0.13, curP) - smoothstep(0.80, 0.94, curP);
  const tBrep  = smoothstep(0.20, 0.30, curP) - smoothstep(0.80, 0.90, curP);
  const tExt   = smoothstep(0.18, 0.32, curP) - smoothstep(0.80, 0.94, curP);
  const tSlice = smoothstep(0.35, 0.41, curP) - smoothstep(0.80, 0.90, curP);
  // spin 0 -> 270 over .40-.80; the hero unwinds the last 90 (horizontal tilt) back to the z=0 plane
  // (180), which the symmetric "n" renders identical to 0 -- so no extra full turn
  const spin = (curP <= 0.80) ? Math.min(Math.max((curP - 0.40) / 0.40, 0), 1)
                              : 1.0 - Math.min(Math.max((curP - 0.80) / 0.14, 0), 1) / 3.0;
  const sliceAng = spin * (Math.PI * 1.5);
  const toHero = smoothstep(0.80, 1.0, curP);   // move + resize, running together with the transformation
  const intro  = 1.0 - smoothstep(0.0, 0.13, curP);  // 1 at the very start: the same 3-ring logo, but white
  const fieldHero = Math.max(intro, toHero);         // 3 crisp rings at both bookends; faded field between

  gl.uniform2f(U.uRes, canvas.width, canvas.height);
  gl.uniform1f(U.uDpr, canvas.width / innerWidth);   // effective device pixels per CSS pixel
  gl.uniform1f(U.uTCam, tCam);
  gl.uniform1f(U.uTBrep, tBrep);
  gl.uniform1f(U.uTExt, tExt);
  gl.uniform1f(U.uTSlice, tSlice);
  gl.uniform1f(U.uSliceAng, sliceAng);
  gl.uniform1f(U.uExtH, MAX_EXT * tExt);
  gl.uniform1f(U.uLeg, params.leg);
  gl.uniform1f(U.uBar, params.bar);
  gl.uniform1f(U.uHalfH, params.hh);
  gl.uniform1f(U.uSpacing, params.spacing);
  gl.uniform1f(U.uFade, params.fade);
  gl.uniform1f(U.uCamDist, CAM_DIST);
  gl.uniform1f(U.uFovTan, FOV_TAN);
  const ob = orthoBase();
  gl.uniform1f(U.uOrthoBase, ob);

  // layout: logo slides out for the stage copy, then settles into the centered hero lockup
  const wide = innerWidth >= 860 && innerWidth > innerHeight;
  const ls = smoothstep(0.03, 0.15, curP);
  const aspect = innerWidth / innerHeight;
  const lerp = (a, b, t) => a + (b - a) * t;
  const framing = 1.0 + 0.14 * tCam + 0.42 * tExt;   // the shader's camera pull-back term
  let sx, sy, vs;
  if (curP < 0.80){
    sx = wide ? -0.23 * aspect * ls : 0.0;            // stages: slide out for the copy
    sy = wide ? 0.0 : -0.24 * ls;
    const stageVs = wide ? lerp(1.0, 1.45, ls) : lerp(1.0, 1.20, ls);
    const introM  = wide ? 2.05 : 1.60;               // start centered at the 3-ring (hero) size
    vs = lerp(stageVs, introM / framing, intro);      // intro: rings fit on screen; else the stage size
  } else {
    // hero: hold the logo's on-screen size constant through step A (cancel the collapsing framing
    // term via a fixed total scale M), then resize + move into the lockup over step B -> smooth
    const Mstart = 1.56 * (wide ? 1.45 : 1.20);       // total scale entering the hero (= stage size)
    const Mhero  = wide ? 2.05 : 1.60;
    vs = lerp(Mstart, Mhero, toHero) / framing;
    sx = wide ? lerp(-0.23 * aspect, -0.17 * aspect, toHero) : 0.0;
    sy = wide ? lerp(0.0, 0.06, toHero) : lerp(-0.24, 0.16, toHero);
  }
  // wordmark anchor uses the pre-dock (hero) logo geometry so its slide into the header is a straight,
  // monotonic move -- decoupled from the logo's own shrink, which would otherwise compound into a curved
  // path and a scale up-then-down wobble
  const heroHalf = innerHeight / (ob * vs);
  const heroCx = innerWidth / 2 + sx * innerHeight;
  const heroCy = innerHeight / 2 - sy * innerHeight;

  // dock: shrink + move the hero mark into the top-left of the sticky header strip
  if (curDock > 0){
    const dk = curDock;                                       // move the mark in lockstep with the page sliding up
    const dockVs = innerHeight / (ob * DOCK_UNIT);
    const dockSx = (DOCK_X - innerWidth * 0.5) / innerHeight;  // mark center DOCK_X px from the left edge
    const dockSy = 0.5 - (SAFE_TOP + HEADER_H * 0.5) / innerHeight;  // centered in the strip, below the safe area
    sx = lerp(sx, dockSx, dk);
    sy = lerp(sy, dockSy, dk);
    vs = lerp(vs, dockVs, dk);
  }

  gl.uniform2f(U.uShift, sx, sy);
  gl.uniform1f(U.uViewScale, vs);
  gl.uniform1f(U.uTint, smoothstep(0.80, 0.94, curP));   // keep the accent through the dock
  gl.uniform1f(U.uDock, curDock);
  gl.uniform1f(U.uHeader, SAFE_TOP + HEADER_H);
  gl.uniform1f(U.uHero, fieldHero);
  // hero: 3*sp = notch half-width (ring 3 merges at center). docked: 2*sp = notch half-width
  // (ring 2 merges at center), so the two rings are evenly spaced.
  gl.uniform1f(U.uHeroSpacing, (1.0 - params.leg) / lerp(3.0, 2.0, curDock));

  gl.uniform1f(U.uTime, (performance.now() - start) / 1000);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  placeWordmark(heroCx, heroCy, heroHalf);
  placeCopy();
  heroEl.style.opacity = smoothstep(0.93, 1.0, curP) * (1.0 - curDock);   // hero text fades in last, out as it docks
  scrollHint.style.opacity = 1.0 - smoothstep(0.0, 0.07, curP);           // only on the opening screen; gone as you scroll
  hrule.style.opacity = smoothstep(0.55, 1.0, curDock);
}

// fade each stage's copy in around its rest point (only the nearest stage shows)
function placeCopy(){
  for (const el of copyEls){
    const c = STAGE_P[+el.dataset.i];
    el.style.opacity = 1.0 - smoothstep(0.0, 0.08, Math.abs(curP - c));
  }
}

// MARK: navigation — free scroll scrubs the mark; a directional snap settles on the adjacent stage
const STAGE_P = [0.0, 0.15, 0.32, 0.533, 0.667, 0.80, 1.0]; // logo·turned·extruded·sec90·sec180·sec270·hero

// scrollY at which the experience reaches the hero (the white page scrolls past this point)
function expEnd(){ return Math.max(scrollerEl.offsetHeight - VH, 1); }

// map the scroll fraction over the experience (0..1) to curP, piecewise-linear through the stage values
function curPFromScroll(){
  const f = Math.min(Math.max(window.scrollY / expEnd(), 0), 1);
  const n = STAGE_P.length - 1;                 // number of segments between stages
  const x = f * n;
  const i = Math.min(Math.floor(x), n - 1);
  return STAGE_P[i] + (STAGE_P[i + 1] - STAGE_P[i]) * (x - i);
}

// the dock is a single snap step, not a free scrub: scrolling past the hero commits to here
function dockEnd(){ return expEnd() + VH; }

// docking progress: 0 at the hero, 1 one viewport later (logo shrinks into the sticky header)
function dockFromScroll(){
  return Math.min(Math.max((window.scrollY - expEnd()) / VH, 0), 1);
}

let forceP = null;                               // test hook: pin curP regardless of scroll
let forceDock = null;                            // test hook: pin the dock progress
let snapAnim = null;                             // mobile snap-on-lift scroll animation
let pinTop = false;                              // desktop: hard-hold scrollY at the text top (no overshoot)
function loop(){
  if (pinTop){
    // hold the text top exactly: upward momentum out of the text can't push above it, so the dark experience
    // never peeks over the white page (no flash) and nothing springs against the momentum (no shake).
    const dEnd = dockEnd();
    if (Math.abs(window.scrollY - dEnd) > 0.5){ window.scrollTo(0, dEnd); }
  } else if (snapAnim){
    const e = Math.min((performance.now() - snapAnim.t0) / snapAnim.dur, 1);
    window.scrollTo(0, snapAnim.from + (snapAnim.to - snapAnim.from) * (snapAnim.ease || easeOutCubic)(e));
    if (e >= 1){ const done = snapAnim.onDone; snapAnim = null; if (done) done(); }
  }
  if (forceP !== null){
    curP = forceP;
  } else {
    const target = curPFromScroll();
    curP += (target - curP) * SMOOTH;            // light easing: tracks the finger, absorbs snap jerks
    if (Math.abs(target - curP) < 1e-4) curP = target;
  }
  curDock = (forceDock !== null) ? forceDock : dockFromScroll();
  render();
  requestAnimationFrame(loop);
}


// mobile: drive the experience scroll with the finger (no native momentum). the mark scrubs within the
// current->adjacent transition as you drag, and on lift it commits to the adjacent stage in the drag
// direction -- regardless of how far you dragged. the white text page below the dock scrolls natively.
let dragging = false, dragStartY = 0, dragStage = 0, dragDir = 0, touchActive = false;

window.addEventListener('touchstart', e => {
  if (!mobileMQ.matches) return;
  touchActive = true;                               // a finger is down (even over the text) -> suppress the barrier
  if (window.scrollY > dockEnd()) return;           // inside the white page: native scrolling owns it
  snapAnim = null;                                  // cancel any in-flight snap (incl. a dock-zone settle)
  dragging = true;
  dragStartY = e.touches[0].clientY;
  dragStage = Math.max(0, Math.min(7, Math.round(window.scrollY / VH)));
  dragDir = 0;
}, { passive: true });

window.addEventListener('touchmove', e => {
  if (!dragging) return;
  const vh = VH, dy = dragStartY - e.touches[0].clientY;            // forward (toward text) positive
  if (dragStage >= 7 && dy > 0){                    // at the dock, a forward swipe enters the text
    dragging = false;                               // hand off to native scroll (don't preventDefault)
    return;
  }
  e.preventDefault();                               // block native scroll/momentum; we drive it
  if (dy > 2) dragDir = 1; else if (dy < -2) dragDir = -1;
  const lo = Math.max(0, dragStage - 1) * vh, hi = Math.min(7, dragStage + 1) * vh;
  window.scrollTo(0, Math.min(Math.max(dragStage * vh + dy, lo), hi));   // scrub within the adjacent transition
}, { passive: false });

window.addEventListener('touchend', () => {
  touchActive = false;                              // finger lifted -> the barrier may now stop inertia at the top
  if (!dragging) return;
  dragging = false;
  const target = Math.max(0, Math.min(7, dragStage + dragDir));   // lift -> commit to the adjacent stage by direction
  snapAnim = { from: window.scrollY, to: target * VH, t0: performance.now(), dur: 340, ease: easeInOutCubic };
}, { passive: true });

window.addEventListener('touchcancel', () => { touchActive = false; dragging = false; }, { passive: true });

// desktop: capture the wheel inside the stage region so the experience never scrolls natively -- there is no
// inertia and no momentum overshoot to fight. the moment a gesture is detected we trigger the transition to
// the adjacent stage in the scroll direction (an animation, not a 1:1 scrub of the scroll). the rest of that
// flick -- including its momentum tail -- is absorbed, so one flick advances exactly one stage. a second stage
// only follows a *genuine* new flick (see the handler): a sharp re-acceleration after the wheel has clearly
// decelerated, which a swipe that merely starts slow and ends fast never produces. the white text body
// (scrollY >= dockEnd) keeps scrolling natively.
const GESTURE_QUIET = 140;   // ms of wheel silence that ends a gesture (the trackpad/wheel "lift")
const PEAK_MIN   = 30;       // px: a gesture must push at least this hard before a *second* flick can register
const DECAY_FRAC = 0.5;      // the wheel enters its decelerating tail once it falls to half its peak
const FLICK_MIN  = 40;       // px: a renewed flick must be at least this strong...
const FLICK_JUMP = 3.0;      // ...and jump to this many times the decelerating lull (a real push, not a ripple)
const STEP_COOLDOWN = 200;   // ms: ignore re-accelerations this soon after a step
let gActive = false, gPeak = 0, gDecaying = false, gValley = Infinity, gLastStep = 0, gQuiet = null, gInText = false;
let restStage = Math.round(window.scrollY / VH);

const STEP_DUR = 750;                              // ms per stage transition (slow enough to read the morph)
function stepStage(dir){
  const target = Math.max(0, Math.min(7, restStage + dir));
  if (target === restStage) return;                // already at an end
  restStage = target;
  snapAnim = { from: window.scrollY, to: target * VH, t0: performance.now(), dur: STEP_DUR, ease: easeInOutCubic };
}

function endGestureSoon(){
  clearTimeout(gQuiet);
  gQuiet = setTimeout(() => { gActive = false; gInText = false; pinTop = false; }, GESTURE_QUIET);
}

window.addEventListener('wheel', e => {
  if (mobileMQ.matches) return;
  const y = window.scrollY, dE = dockEnd(), dir = Math.sign(e.deltaY);
  if (!dir) return;
  // in the text body: native scroll. remember the motion came from the text so we recognize it crossing the top.
  if (y > dE){ gInText = true; gActive = false; pinTop = false; endGestureSoon(); return; }
  // at/just below the text top, a downward push -> the user wants into the text: release the pin, go native.
  if (dir > 0 && y >= dE - 0.5){ pinTop = false; gInText = false; return; }
  // text-origin upward motion crossing the top -> hard-hold the top so momentum can't sweep into a stage (no
  // overshoot -> no black flash, no shake). a fresh upward gesture (after the wheel goes quiet, gInText cleared)
  // undocks instead.
  if (gInText && dir < 0){
    e.preventDefault();
    snapAnim = null;
    pinTop = true;
    if (y < dE){ window.scrollTo(0, dE); }            // correct the crossing overshoot immediately
    restStage = Math.round(dE / VH);
    endGestureSoon();
    return;
  }
  e.preventDefault();                               // stage region (and a fresh undock at the top) -> we own it
  const mag = Math.abs(e.deltaY), now = performance.now();
  if (!gActive){
    gActive = true; gPeak = mag; gDecaying = false; gValley = Infinity; gInText = false; pinTop = false;
    if (!snapAnim){ restStage = Math.round(y / VH); }            // re-anchor when at rest (e.g. back from text)
    gLastStep = now;
    stepStage(dir);                                              // start the transition immediately
  } else {
    gPeak = Math.max(gPeak, mag);
    // decelerate-then-jump = a new flick. require a real peak (PEAK_MIN) so a slow start can't arm it, then a
    // fall into the momentum tail (half the peak), then a jump well above that lull. a swipe that just starts
    // slow and ends fast rises monotonically (mag tracks the peak) -> never enters the decelerating state.
    if (gDecaying){ gValley = Math.min(gValley, mag); }
    else if (gPeak > PEAK_MIN && mag < gPeak * DECAY_FRAC){ gDecaying = true; gValley = mag; }
    if (gDecaying && mag > FLICK_MIN && mag > gValley * FLICK_JUMP && now - gLastStep > STEP_COOLDOWN){
      gPeak = mag; gDecaying = false; gValley = Infinity;
      gLastStep = now;
      stepStage(dir);                                            // advance another stage
    }
  }
  endGestureSoon();
}, { passive: false });

// desktop: while pinning the top, clamp any momentum scroll synchronously (extra coverage on top of the loop
// pin). otherwise, if a native upward scroll from the text body coasts to a rest inside the dock zone with no
// wheel event for the barrier to catch, stop at the text top -- same one-way rule: a fresh gesture undocks.
let dsSettle = null;
window.addEventListener('scroll', () => {
  if (mobileMQ.matches) return;
  // hold the text top synchronously: a text-origin scroll (not a deliberate undock, which sets gActive) that
  // dips above the top gets clamped right here -- one step earlier than the wheel handler, so a fast fling
  // can't paint the dark experience over the page before we catch it.
  if ((pinTop || (gInText && !gActive)) && window.scrollY < dockEnd()){ window.scrollTo(0, dockEnd()); pinTop = true; return; }
  if (gActive || snapAnim) return;
  const eE = expEnd(), dE = dockEnd(), y = window.scrollY;
  if (y <= eE || y >= dE) return;
  clearTimeout(dsSettle);
  dsSettle = setTimeout(() => {
    if (gActive || snapAnim || pinTop) return;
    const yy = window.scrollY;
    if (yy > eE && yy < dE){
      restStage = Math.round(dE / VH);
      snapAnim = { from: yy, to: dE, t0: performance.now(), dur: 300, ease: easeOutCubic };
    }
  }, 100);
});

// mobile only: the text top (dockEnd) is a one-way barrier for upward scrolling. when a native fling in the
// text coasts up past the top into the dock zone -- after the finger has lifted (touchActive false) and not
// during our own snap -- smoothly pull back to the top so inertia can't sweep into the experience. crossing
// it is deliberate: a fresh upward gesture from the top undocks, which runs through the touch handler
// (dragging/touchActive set) and so is skipped here.
window.addEventListener('scroll', () => {
  if (!mobileMQ.matches || dragging || touchActive || snapAnim) return;
  const eE = expEnd(), dE = dockEnd(), y = window.scrollY;
  if (y <= eE || y >= dE) return;                  // only a text-fling overshoot into the dock zone
  snapAnim = { from: y, to: dE, t0: performance.now(), dur: 280, ease: easeOutCubic };
});

window.addEventListener('resize', () => {
  // re-baseline the scroll math on a real viewport change (orientation / window resize), but ignore the
  // mobile address bar showing/hiding -- a height-only change keeps VH (and the stage boundaries) fixed.
  if (innerWidth !== VW || !mobileMQ.matches){ syncViewport(); }
  render();
});

// test hook: pin curP directly (pass null to resume scroll control)
window.__p = v => { forceP = v; if (v !== null) curP = v; render(); };
// test hook: pin the dock progress directly (pass null to resume scroll control)
window.__d = v => { forceDock = v; if (v !== null) curDock = v; render(); };

syncViewport();
render();
requestAnimationFrame(loop);
