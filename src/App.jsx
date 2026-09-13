import { useState, useRef, useEffect } from "react";

/* ================================================================
   Save the Date — cinematic wedding-album reveal
   Single-file React app. rAF-driven timeline (imperative, 60fps),
   React state for assets + names. Structure ported & extended from
   the HTML prototype: two page-turns, full interior content, warm
   procedural marble/paper/candlelight, cinematic grade.
   ================================================================ */

const DURATION = 18.8;

/* ---- timeline helpers ---- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const phase = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
function keyed(t, pts) {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ta, va] = pts[i], [tb, vb] = pts[i + 1];
    if (t <= tb) return lerp(va, vb, easeInOut(phase(t, ta, tb)));
  }
  return pts[pts.length - 1][1];
}

const CSS = `
:root{
  --ivory:#F3EDE3; --ivory-deep:#E8DDCB; --paper:#F6F1E7;
  --marble:#F0EBE2; --gold:#B8945A; --gold-light:#C9A86C; --ink:#2A2622; --stone:#6B5D49; --glow:#F2B968;
}
.std-root *{box-sizing:border-box;margin:0;padding:0}
.std-root{position:fixed;inset:0;display:flex;flex-direction:column;height:100vh;height:100dvh;
  background:#0e0d0c;color:#e7e2d8;font-family:"Raleway","Helvetica Neue",sans-serif;overflow:hidden;-webkit-font-smoothing:antialiased}
.std-viewport{flex:1;overflow:hidden;position:relative}
.std-stage{width:1080px;height:1920px;position:absolute;left:50%;top:50%;transform-origin:center center;background:#0e0d0c;box-shadow:0 30px 90px rgba(0,0,0,.6);overflow:hidden}
.std-cam{position:absolute;inset:0;transform-origin:center center;will-change:transform}

/* backdrop */
.bd{position:absolute;inset:-5%;
  background:
    radial-gradient(70% 48% at 50% 60%, rgba(248,226,184,.18), transparent 64%),
    radial-gradient(120% 95% at 50% 40%, #FAF7F1 0%, var(--marble) 44%, #E6E0D4 80%, #D6CFC1 100%);}
.bd::before{content:"";position:absolute;inset:0;opacity:.55;mix-blend-mode:multiply;
  background:
    radial-gradient(38% 26% at 20% 26%, rgba(150,138,118,.22), transparent 62%),
    radial-gradient(44% 30% at 82% 70%, rgba(150,138,118,.18), transparent 64%),
    radial-gradient(30% 22% at 62% 20%, rgba(120,108,90,.14), transparent 60%),
    linear-gradient(114deg, transparent 43%, rgba(110,100,84,.12) 45.2%, transparent 47.5%),
    linear-gradient(102deg, transparent 55%, rgba(110,100,84,.08) 57%, transparent 60%),
    linear-gradient(126deg, transparent 30%, rgba(110,100,84,.06) 31.5%, transparent 33%);
  filter:blur(.6px)}
.bd::after{content:"";position:absolute;inset:0;opacity:.10;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.bd.hasimg{background:#000}
.bd.hasimg::before,.bd.hasimg::after{display:none}
.bd .bd-photo{position:absolute;inset:0;background-size:cover;background-position:center;filter:saturate(.94) brightness(1.02)}

.bokeh{position:absolute;border-radius:50%;filter:blur(16px);mix-blend-mode:screen}
.candle{position:absolute;inset:0;pointer-events:none;will-change:opacity;
  background:
    radial-gradient(30% 20% at 50% 55%, rgba(255,214,150,.32), transparent 60%),
    radial-gradient(52% 40% at 50% 46%, rgba(242,175,96,.15), transparent 72%)}

/* album */
.album-wrap{position:absolute;inset:0;-webkit-perspective:2600px;perspective:2600px;perspective-origin:50% 42%}
.album{position:absolute;left:50%;top:50%;width:570px;height:900px;margin-left:-285px;margin-top:-450px;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;will-change:transform}
/* border-radius only — no overflow:hidden (breaks iOS backface-visibility) and no clip-path (flattens 3D on Android Chrome) */
.face{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden;border-radius:6px 10px 10px 6px}
.body{position:absolute;inset:0;border-radius:6px 10px 10px 6px;background:linear-gradient(90deg,#DCD1C0 0 10px,#EFE8db 10px 100%);box-shadow:inset 0 0 0 1px rgba(120,105,84,.25)}
.body::after{content:"";position:absolute;top:6px;bottom:6px;right:0;width:15px;border-radius:0 8px 8px 0;background:repeating-linear-gradient(90deg,#f0e8da,#f0e8da 1px,#e2d8c6 1px,#e2d8c6 3px)}
/* padded ivory fabric hardcover */
.cover{background:radial-gradient(130% 120% at 30% 16%, #FCF7ED 0%, var(--ivory) 42%, var(--ivory-deep) 100%);display:flex;align-items:center;justify-content:center;
  box-shadow:inset 0 0 0 1.5px rgba(150,132,104,.30), inset 0 2px 14px rgba(255,255,255,.42), inset 0 0 52px rgba(150,120,78,.16), inset 0 -10px 30px rgba(120,96,58,.14)}
.cover::before{content:"";position:absolute;inset:0;opacity:.55;mix-blend-mode:multiply;background-size:5px 5px, 140px 140px;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='5' height='5'%3E%3Cpath d='M0 1.4h5M0 3.6h5' stroke='%23c7b590' stroke-width='.7' opacity='.4'/%3E%3Cpath d='M1.4 0v5M3.6 0v5' stroke='%23b7a37e' stroke-width='.7' opacity='.32'/%3E%3C/svg%3E"),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='.5'/%3E%3C/svg%3E")}
.cover::after{content:"";position:absolute;inset:8px;border-radius:5px;pointer-events:none;
  box-shadow:inset 0 1px 2px rgba(255,255,255,.5), inset 0 0 0 1px rgba(150,128,92,.12)}
.cover .frame{position:absolute;inset:34px;border:1px solid rgba(184,148,90,.32);border-radius:3px;z-index:2}
.cover .frame::before{content:"";position:absolute;inset:6px;border:1px solid rgba(184,148,90,.16)}
.front-cover{transform-origin:left center;-webkit-backface-visibility:hidden;backface-visibility:hidden;will-change:transform;z-index:5}
.emboss{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center}
.emboss .ff-title{font-family:"Playfair Display",Georgia,serif;font-weight:500;color:var(--gold);font-size:30px;letter-spacing:.34em;padding-left:.34em;text-transform:uppercase;line-height:1;
  text-shadow:0 1px 0 rgba(255,255,255,.55), 0 -1px 1px rgba(90,64,10,.22)}
.emboss .ff-heart{color:var(--gold-light);opacity:.9;filter:drop-shadow(0 1px 0 rgba(255,255,255,.4))}

/* spread + pages */
.spread{position:absolute;left:50%;top:50%;width:980px;height:900px;margin-left:-490px;margin-top:-450px;transform:translateZ(2px);will-change:opacity}
.pagebase{position:absolute;top:0;width:490px;height:900px;
  background:
    repeating-linear-gradient(92deg, rgba(150,132,104,.045) 0 2px, transparent 2px 5px),
    linear-gradient(90deg, rgba(120,105,84,.10), transparent 8%),
    var(--paper)}
.pagebase.left{left:0;box-shadow:inset 0 0 40px rgba(150,132,104,.14), inset -8px 0 24px rgba(120,105,84,.18)}
.pagebase.right{left:490px;box-shadow:inset 0 0 40px rgba(150,132,104,.14), inset 8px 0 24px rgba(120,105,84,.18)}

/* photos printed full-bleed on the page — like a real photo-book spread */
.photo{position:absolute;left:50%;top:50%;width:478px;height:886px;transform:translate(-50%,-50%);background:#cdbfae;border:none;border-radius:2px;background-size:cover;background-position:center;overflow:hidden;
  box-shadow:0 10px 26px rgba(60,44,28,.30), inset 0 0 0 1px rgba(120,90,50,.14), inset 0 0 60px rgba(40,26,12,.10)}
.photo::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(118deg, rgba(255,238,206,.16), transparent 26%, transparent 74%, rgba(60,40,16,.14)),
    radial-gradient(120% 80% at 50% 8%, rgba(255,240,210,.12), transparent 55%)}
.photo.empty{display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#dacebe,#c2b3a0)}
.photo.empty span{font-family:"Raleway",sans-serif;font-weight:300;font-size:13px;letter-spacing:.35em;color:#7c6f5d;text-align:center;line-height:2}

.leafface{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:40px}
.amp{font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:400;font-size:104px;color:var(--stone);opacity:.6;line-height:.8}
.names{font-family:"Playfair Display",Georgia,serif;font-weight:400;font-size:40px;letter-spacing:.04em;color:var(--ink);text-align:center;line-height:1.25}
.rulevert{width:1px;height:60px;background:linear-gradient(rgba(120,105,84,.5),transparent)}
.cap{font-family:"Raleway",sans-serif;font-weight:300;font-size:12px;letter-spacing:.5em;color:#9a8b74;padding-left:.5em;text-align:center}
.vow{font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:400;font-size:40px;letter-spacing:.02em;color:var(--stone);text-align:center;line-height:1.35}
.palm-detail{color:var(--stone);opacity:.5}

/* flipping leaves */
.leaf{position:absolute;left:490px;top:0;width:490px;height:900px;transform-origin:left center;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;will-change:transform}
.leaf .f{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden;background:var(--paper);
  background-image:repeating-linear-gradient(92deg, rgba(150,132,104,.045) 0 2px, transparent 2px 5px)}
.leaf .f.front{box-shadow:inset 8px 0 24px rgba(120,105,84,.18)}
.leaf .f.back{-webkit-transform:rotateY(180deg);transform:rotateY(180deg);box-shadow:inset -8px 0 24px rgba(120,105,84,.18)}
.leaf .shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(60,44,28,.24),transparent 42%);opacity:0}

/* back cover: SAVE THE DATE */
.back-cover{transform:rotateY(180deg) translateZ(14px);background:radial-gradient(130% 120% at 32% 18%, #FCF7ED 0%, var(--ivory) 42%, var(--ivory-deep) 100%);box-shadow:inset 0 0 0 1px rgba(150,132,104,.30);display:flex;align-items:center;justify-content:center}
.std{position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 40px;z-index:2}
/* inset double frame — echoes the front cover so the reveal reads as the same album, turned over */
.std::before{content:"";position:absolute;inset:30px;border:1px solid rgba(184,148,90,.30);border-radius:3px;pointer-events:none}
.std::after{content:"";position:absolute;inset:36px;border:1px solid rgba(184,148,90,.14);border-radius:2px;pointer-events:none}
.palm{position:absolute;pointer-events:none;opacity:.06;color:#3a2f22}
.palm.tl{top:-30px;left:-60px;transform:rotate(18deg) scale(1.1)}
.palm.br{bottom:-40px;right:-70px;transform:rotate(200deg) scale(1.15)}
.std-lbl{font-family:"Raleway",sans-serif;font-weight:300;font-size:19px;letter-spacing:.48em;color:var(--stone);padding-left:.48em;white-space:nowrap;will-change:opacity,transform}
.std-rule{display:flex;align-items:center;justify-content:center;color:var(--gold);margin:22px 0;will-change:opacity,transform}
.std-date{font-family:"Playfair Display",Georgia,serif;font-weight:500;color:var(--gold);font-size:132px;letter-spacing:.03em;line-height:.9;will-change:opacity,transform}
.std-place{font-family:"Raleway",sans-serif;font-weight:300;font-size:26px;letter-spacing:.5em;color:var(--stone);padding-left:.5em;margin-top:32px;will-change:opacity,transform}
.std-sprig{margin-top:24px;color:var(--gold);will-change:opacity}
.std-rsvp{margin-top:28px;font-family:"Raleway",sans-serif;font-weight:300;font-size:13px;letter-spacing:.38em;padding-left:.38em;color:var(--stone);opacity:.75;will-change:opacity}

/* finishing */
.grade{position:absolute;inset:0;pointer-events:none;mix-blend-mode:soft-light;
  background:radial-gradient(60% 44% at 50% 46%, rgba(255,224,176,.22), transparent 66%), linear-gradient(0deg, rgba(46,30,14,.30), transparent 42%)}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.035;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(122% 100% at 50% 44%, transparent 50%, rgba(20,14,8,.30) 82%, rgba(10,7,3,.66) 100%)}
.hand{position:absolute;bottom:-2%;left:50%;width:640px;transform:translateX(-50%);pointer-events:none;filter:drop-shadow(0 12px 24px rgba(0,0,0,.35))}
.hand img{width:100%;display:block}

/* controls */
.controls{display:flex;align-items:center;gap:16px;padding:14px 22px;background:#141210;border-top:1px solid #262220}
.controls button{font-family:"Raleway",sans-serif;font-weight:400;font-size:13px;letter-spacing:.12em;color:#eee;background:#2a2521;border:1px solid #3a332d;border-radius:999px;padding:9px 20px;cursor:pointer;transition:background .2s}
.controls button:hover{background:#3a332d}
.controls button:focus-visible{outline:2px solid var(--glow);outline-offset:2px}
.scrub{flex:1;accent-color:var(--gold);cursor:pointer}
.timelbl{font-variant-numeric:tabular-nums;font-size:12px;color:#9a9086;min-width:88px;text-align:right;letter-spacing:.05em}

.atoggle{position:absolute;top:14px;right:14px;z-index:19;font-family:"Raleway",sans-serif;font-size:12px;letter-spacing:.12em;color:#eee;background:rgba(42,37,33,.85);border:1px solid #3a332d;border-radius:999px;padding:8px 16px;cursor:pointer}
.panel{position:absolute;top:14px;right:14px;width:274px;background:rgba(20,18,16,.94);border:1px solid #322c26;border-radius:12px;padding:14px;backdrop-filter:blur(6px);z-index:20}
.panel h3{font-family:"Raleway",sans-serif;font-weight:400;font-size:12px;letter-spacing:.18em;color:#c9bfb2;text-transform:uppercase;margin-bottom:4px}
.panel p{font-size:11px;color:#8a8177;line-height:1.5;margin-bottom:10px}
.panel label{display:block;font-size:11px;color:#a89e92;margin:9px 0 3px;letter-spacing:.03em}
.panel input{width:100%;font-family:"Raleway",sans-serif;font-size:12px;color:#eee;background:#0f0d0b;border:1px solid #322c26;border-radius:7px;padding:7px 9px}
.panel .row{display:flex;gap:8px}
.panel input:focus{outline:1px solid var(--glow)}
/* florals — photographic cut-outs */
.florals{position:absolute;inset:0;pointer-events:none}
.floral{position:absolute;pointer-events:none;will-change:transform;filter:blur(var(--blur,0px));
  animation:floralDrift var(--drift,11s) ease-in-out infinite alternate;animation-delay:var(--delay,0s)}
.floral img{display:block;width:100%;height:auto;
  filter:drop-shadow(0 14px 26px rgba(70,26,30,.34)) saturate(1.02)}
.floral.bloom img{filter:drop-shadow(0 18px 34px rgba(70,26,30,.38)) saturate(1.05) brightness(1.01)}
.floral.soft img{filter:drop-shadow(0 12px 22px rgba(90,40,50,.24)) saturate(.97) brightness(1.04)}

@keyframes floralDrift{
  from{transform:translate3d(0,0,0) rotate(var(--rot,0deg))}
  to{transform:translate3d(var(--dx,0px),var(--dy,-14px),0) rotate(calc(var(--rot,0deg) + var(--drot,1.5deg)))}
}

@media (prefers-reduced-motion: reduce){
  .candle{opacity:.42 !important}
  .floral{animation:none;transform:rotate(var(--rot,0deg))}
}

/* enter screen + guest chrome */
.enter{position:absolute;inset:0;z-index:40;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:radial-gradient(120% 90% at 50% 38%, #17120f 0%, #0a0908 72%);color:#efe7da;text-align:center;padding:40px;
  transition:opacity 1.3s ease;overflow:hidden}
.enter.hide{opacity:0;pointer-events:none}
.enter .enter-glow{position:absolute;width:120%;height:60%;top:8%;left:-10%;pointer-events:none;opacity:.5;
  background:radial-gradient(50% 60% at 50% 40%, rgba(242,185,104,.28), transparent 70%);filter:blur(10px)}
.enter .mono{position:relative;font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:500;
  font-size:104px;line-height:1.05;color:#f4ede1;margin:0 0 6px;text-shadow:0 2px 36px rgba(242,185,104,.30);padding-bottom:.06em}

.enter .sub{position:relative;font-family:"Playfair Display",Georgia,serif;font-size:26px;letter-spacing:.04em;color:#a2937f;margin-bottom:44px}
.enter .open{position:relative;font-family:"Raleway",sans-serif;font-weight:300;font-size:13px;letter-spacing:.34em;padding-left:.34em;
  color:#f4ede1;background:transparent;border:1px solid rgba(214,180,120,.5);border-radius:999px;padding:17px 42px;cursor:pointer;
  transition:background .4s ease,border-color .4s ease,transform .2s ease}
.enter .open:hover{background:rgba(214,180,120,.12);border-color:rgba(214,180,120,.92)}
.enter .open:active{transform:scale(.975)}
.enter .open:focus-visible{outline:2px solid var(--glow);outline-offset:3px}

.chrome-btn{position:absolute;z-index:30;font-family:"Raleway",sans-serif;font-weight:300;font-size:12px;letter-spacing:.16em;
  padding-left:.16em;color:#efe7da;background:rgba(20,16,14,.46);border:1px solid rgba(214,180,120,.32);border-radius:999px;
  padding:10px 17px;cursor:pointer;backdrop-filter:blur(7px);transition:background .3s ease,border-color .3s ease,opacity .8s ease}
.chrome-btn:hover{background:rgba(44,35,28,.7);border-color:rgba(214,180,120,.7)}
.chrome-btn:focus-visible{outline:2px solid var(--glow);outline-offset:2px}
.mute{top:18px;right:18px}
.replay-end{left:50%;bottom:56px;transform:translateX(-50%);opacity:0;pointer-events:none}
.replay-end.show{opacity:1;pointer-events:auto}
`;

const PALM_PATH =
  "M50 92 C49 70 48 55 46 42 C44 44 40 47 34 49 C40 45 44 41 46 38 C40 39 33 40 27 44 C34 38 41 36 46 35 C39 33 31 33 24 37 C32 30 40 30 47 32 C42 27 35 24 27 24 C36 22 44 25 49 31 C49 22 47 14 42 8 C50 13 52 22 51 31 C56 26 63 24 71 25 C64 27 57 31 52 37 C59 35 67 36 74 41 C66 39 58 40 51 43 C50 56 50 72 50 92 Z";

function Palm({ className, size }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d={PALM_PATH} fill="currentColor" />
    </svg>
  );
}

/* ---- florals: photographic cut-outs (curated CC0 stock, background-removed) ----
   Two asymmetric clusters (top-left, bottom-right) framing the album, with a
   scatter of loose petals. Positions in px on the 1080x1920 stage.            */
const RED1 = "/roses/rose-red-1.png";   // red rose (leaves removed)
const RED2 = "/roses/rose-red-2.png";   // pair of red roses
const PINK1 = "/roses/rose-pink-1.png"; // pink garden rose
const PINK2 = "/roses/rose-pink-2.png"; // soft blush rose
const PINK3 = "/roses/rose-pink-3.png"; // pink rose pair
const PETALS = ["/roses/petal-1.png", "/roses/petal-2.png", "/roses/petal-3.png", "/roses/petal-4.png"];

const FLORALS = [
  // cluster: top-left
  { src: RED1,  kind: "bloom", w: 560, pos: { top: -60, left: -80 },  rot: -14, blur: 0,   op: 1,    dy: -16, drot: 1.5, drift: 12, delay: 0.6 },
  { src: PINK1, kind: "bloom", w: 400, pos: { top: 180, left: -20 },  rot: 18,  blur: 0,   op: 1,    dy: -10, drot: -2,  drift: 10, delay: 1.1 },
  { src: PINK2, kind: "soft",  w: 380, pos: { top: -30, left: 200 },  rot: 6,   blur: 2,   op: 0.9,  dy: -12, drot: 2,   drift: 13, delay: 0 },
  { src: PINK3, kind: "bloom", w: 300, pos: { top: 150, left: 210 },  rot: -10, blur: 0.4, op: 0.96, dy: -9,  drot: 3,   drift: 11.5, delay: 1.8 },
  { src: RED2,  kind: "bloom", w: 300, pos: { top: -80, left: 360 },  rot: 20,  blur: 0.6, op: 0.95, flip: true, dy: -12, drot: -2, drift: 12.8, delay: 0.4 },
  // cluster: top-right
  { src: RED2,  kind: "bloom", w: 440, pos: { top: -80, right: -90 }, rot: -8,  blur: 0,   op: 1,    dy: -14, drot: 2,  drift: 12.2, delay: 0.5 },
  { src: PINK1, kind: "bloom", w: 300, pos: { top: 170, right: -10 }, rot: 22,  blur: 0.5, op: 0.95, flip: true, dy: -10, drot: -3, drift: 10.8, delay: 1.5 },
  // cluster: bottom-right
  { src: RED2,  kind: "bloom", w: 620, pos: { bottom: -60, right: -80 }, rot: 6,  blur: 0,   op: 1,    dy: 14, drot: -1.5, drift: 12.5, delay: 0.3 },
  { src: PINK1, kind: "bloom", w: 360, pos: { bottom: 220, right: 20 },  rot: -20, blur: 0,   op: 1,    flip: true, dy: 12, drot: 2,  drift: 11, delay: 1.4 },
  { src: RED1,  kind: "bloom", w: 280, pos: { bottom: 430, right: -10 }, rot: 44, blur: 0.6, op: 0.95, flip: true, dy: 10, drot: -2, drift: 14, delay: 0.9 },
  { src: PINK3, kind: "bloom", w: 320, pos: { bottom: 120, right: 200 }, rot: 12,  blur: 0.5, op: 0.95, dy: 10, drot: -3, drift: 12, delay: 1.7 },
  // cluster: bottom-left
  { src: RED1,  kind: "bloom", w: 470, pos: { bottom: -70, left: -90 }, rot: 16,  blur: 0,   op: 1,    flip: true, dy: 13, drot: 2,  drift: 12.6, delay: 0.7 },
  { src: PINK1, kind: "bloom", w: 300, pos: { bottom: 190, left: 30 },  rot: -14, blur: 0.5, op: 0.95, dy: 10, drot: -2, drift: 10.4, delay: 1.3 },
  // loose petals — scatter
  { src: PETALS[0], kind: "petal", w: 88,  pos: { top: 360, left: 150 },     rot: 28,  blur: 0.5, op: 0.95, dy: -8, drot: 6,  drift: 9,  delay: 0.2 },
  { src: PETALS[2], kind: "petal", w: 70,  pos: { top: 300, left: 380 },     rot: -22, blur: 0.6, op: 0.9,  dy: -10, drot: -5, drift: 10.5, delay: 1.6 },
  { src: PETALS[1], kind: "petal", w: 96,  pos: { bottom: 330, right: 220 }, rot: -26, blur: 0.5, op: 0.95, dy: 9,  drot: -7, drift: 9.5, delay: 0.8 },
  { src: PETALS[3], kind: "petal", w: 64,  pos: { bottom: 470, right: 140 }, rot: 16,  blur: 0.7, op: 0.9,  dy: 8,  drot: 5,  drift: 12, delay: 1.9 },
  { src: PETALS[0], kind: "petal", w: 60,  pos: { top: "46%", left: -6 },    rot: 54,  blur: 1,   op: 0.85, dy: -6, drot: 8,  drift: 11, delay: 1.2 },
  { src: PETALS[3], kind: "petal", w: 56,  pos: { bottom: "40%", right: -4 }, rot: -40, blur: 1.1, op: 0.8,  dy: 6,  drot: -6, drift: 12.5, delay: 0.5 },
  { src: PETALS[1], kind: "petal", w: 64,  pos: { top: 470, right: 70 },     rot: 34,  blur: 0.9, op: 0.82, dy: -7, drot: -6, drift: 11.8, delay: 1.0 },
];

function FloralPhoto({ item }) {
  const s = {
    ...item.pos,
    width: item.w,
    opacity: item.op ?? 1,
    "--rot": `${item.rot || 0}deg`,
    "--blur": `${item.blur || 0}px`,
    "--dy": `${item.dy ?? -12}px`,
    "--dx": `${item.dx ?? 0}px`,
    "--drot": `${item.drot ?? 1.5}deg`,
    "--drift": `${item.drift ?? 11}s`,
    "--delay": `${item.delay ?? 0}s`,
    transform: `rotate(${item.rot || 0}deg)`,
  };
  return (
    <div className={"floral " + item.kind} style={s}>
      <img src={item.src} alt="" aria-hidden="true" loading="eager" decoding="async"
        style={item.flip ? { transform: "scaleX(-1)" } : undefined} />
    </div>
  );
}

const initials = (a, b) => {
  const i = (s) => (s && s.trim() ? s.trim()[0].toUpperCase() : "");
  const x = i(a), y = i(b);
  return x && y ? `${x} & ${y}` : "&";
};

/* ================================================================
   COUPLE CONFIG — edit these to personalize.
   Drop your engagement photos into  public/photos/  and reference them
   below (leading slash = the public folder). Leave a value "" to show an
   elegant placeholder instead. Names appear on the interior title page.
   ================================================================ */
const COUPLE = {
  n1: "Gabriella",              // shown on the interior title page
  n2: "Kordell",
  p1: "/photos/engagement-1.jpg",
  p2: "/photos/engagement-2.jpg",
  p3: "/photos/engagement-3.jpg",
  p4: "/photos/engagement-4.jpg",
  p5: "/photos/engagement-5.jpg",
};

// dev/query flags parsed once (dev panel + scrubber behind ?edit, ?t= seeks a frame)
const PARAMS = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
const DEV = PARAMS.has("edit");
const SEEK = PARAMS.has("t") ? Math.max(0, Math.min(DURATION, parseFloat(PARAMS.get("t")) || 0)) : null;

export default function App() {
  const [cfg, setCfg] = useState({ bd: "", hand: "", ...COUPLE });
  const [panelOpen, setPanelOpen] = useState(false);
  // guest flow: hold on the enter screen until the visitor opens the invitation
  const [entered, setEntered] = useState(DEV || SEEK != null);
  const [playing, setPlaying] = useState(DEV && SEEK == null);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  // refs for imperative per-frame updates
  const R = {
    stage: useRef(null), viewport: useRef(null), cam: useRef(null), album: useRef(null),
    front: useRef(null), spread: useRef(null), candle: useRef(null),
    leafA: useRef(null), leafB: useRef(null), shadeA: useRef(null), shadeB: useRef(null),
    lbl: useRef(null), rule: useRef(null), date: useRef(null), place: useRef(null), sprig: useRef(null),
    rsvp: useRef(null),
    scrub: useRef(null), time: useRef(null),
  };
  const timeRef = useRef(SEEK ?? 0);
  const playingRef = useRef(DEV && SEEK == null);
  useEffect(() => { playingRef.current = playing; }, [playing]);

  function render(t) {
    const camS = keyed(t, [[0,1.00],[2.8,1.045],[4.3,1.02],[5.2,1.03],[8.0,1.022],[9.0,1.032],[11.4,1.022],[13.2,1.04],[14.5,1.062],[15.3,1.02],[16.9,1.03],[DURATION,1.10]]);
    const camY = keyed(t, [[0,10],[4.3,0],[14.5,-6],[16.9,-10],[DURATION,-28]]);
    if (R.cam.current) R.cam.current.style.transform = `translateY(${camY}px) scale(${camS})`;

    const floatY = 6 * Math.sin(t * 0.55);
    const spin = keyed(t, [[0,0],[15.3,0],[16.9,180],[DURATION,180]]);
    if (R.album.current) R.album.current.style.transform = `translateY(${floatY}px) rotateY(${spin}deg)`;

    let cover;
    if (t < 2.8) cover = 0;
    else if (t < 4.3) cover = lerp(0, -152, easeInOut(phase(t, 2.8, 4.3)));
    else if (t < 13.2) cover = -152;
    else if (t < 14.5) cover = lerp(-152, 0, easeInOut(phase(t, 13.2, 14.5)));
    else cover = 0;
    if (R.front.current) R.front.current.style.transform = `translateZ(14px) rotateY(${cover}deg)`;

    const spreadOp = clamp(phase(t, 3.2, 4.4) - phase(t, 13.2, 14.5), 0, 1);
    if (R.spread.current) { R.spread.current.style.opacity = spreadOp; }

    // leaf A: Photo 1 -> transitional (flip 1)
    const pa = easeInOut(phase(t, 6.2, 8.0));
    const za = pa < 0.5 ? 120 : 60;
    if (R.leafA.current) { R.leafA.current.style.transform = `rotateY(${lerp(0,-178,pa)}deg) translateZ(6px)`; R.leafA.current.style.zIndex = za; }
    if (R.shadeA.current) R.shadeA.current.style.opacity = Math.sin(pa * Math.PI) * 0.9;

    // leaf B: transitional -> Photo 2 (flip 2)
    const pb = easeInOut(phase(t, 9.6, 11.4));
    const zb = pb < 0.5 ? 110 : 70;
    if (R.leafB.current) { R.leafB.current.style.transform = `rotateY(${lerp(0,-178,pb)}deg) translateZ(4px)`; R.leafB.current.style.zIndex = zb; }
    if (R.shadeB.current) R.shadeB.current.style.opacity = Math.sin(pb * Math.PI) * 0.9;

    const fl = 0.80 + 0.11*Math.sin(t*6.7) + 0.05*Math.sin(t*12.9+1.7) + 0.035*Math.sin(t*22.0);
    if (R.candle.current) R.candle.current.style.opacity = clamp(fl, 0.58, 1);

    const rev = (ref, a, b, rise) => {
      if (!ref.current) return;
      const p = easeInOut(phase(t, a, b));
      ref.current.style.opacity = p;
      ref.current.style.transform = `translateY(${lerp(rise, 0, p)}px)`;
    };
    rev(R.lbl, 16.2, 16.9, 14);
    rev(R.rule, 16.5, 17.1, 10);
    if (R.date.current) {
      const dp = easeInOut(phase(t, 16.8, 17.8));
      R.date.current.style.opacity = dp;
      R.date.current.style.transform = `translateY(${lerp(18,0,dp)}px) scale(${lerp(.94,1,dp)})`;
    }
    rev(R.place, 17.4, 18.0, 12);
    if (R.sprig.current) R.sprig.current.style.opacity = easeInOut(phase(t, 17.8, 18.5)) * 0.6;
    if (R.rsvp.current) R.rsvp.current.style.opacity = easeInOut(phase(t, 18.1, 18.7));

    if (R.scrub.current) R.scrub.current.value = t;
    if (R.time.current) R.time.current.textContent = `${t.toFixed(1)} / ${DURATION.toFixed(1)}s`;
  }

  // animation loop
  useEffect(() => {
    let raf, last = null;
    const loop = (ts) => {
      if (last == null) last = ts;
      const dt = Math.min((ts - last) / 1000, 0.05); last = ts;
      if (playingRef.current) {
        let t = timeRef.current + dt;
        if (t >= DURATION) { t = DURATION; setPlaying(false); setEnded(true); }
        timeRef.current = t;
        render(t);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    render(timeRef.current);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fit stage to viewport
  useEffect(() => {
    const fit = () => {
      const vp = R.viewport.current, st = R.stage.current;
      if (!vp || !st) return;
      // cover: fill the viewport on any device (phone, tablet, desktop), no bars
      const s = Math.max(vp.clientWidth / 1080, vp.clientHeight / 1920);
      st.style.transform = `translate(-50%, -50%) scale(${s})`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ramp the track volume; optionally pause when it reaches silence
  const fadeAudio = (to, ms = 1400, thenPause = false) => {
    const a = audioRef.current;
    if (!a) return;
    const from = a.volume, steps = 24, step = (to - from) / steps;
    let i = 0;
    clearInterval(a._fade);
    a._fade = setInterval(() => {
      i += 1;
      a.volume = Math.max(0, Math.min(1, from + step * i));
      if (i >= steps) { clearInterval(a._fade); if (thenPause) a.pause(); }
    }, ms / steps);
  };
  const startAudio = () => {
    const a = audioRef.current;
    if (!a || muted) return;
    clearInterval(a._fade);
    a.currentTime = 0;
    a.volume = 0;
    a.play().then(() => fadeAudio(0.6, 1200)).catch(() => {});
  };

  const togglePlay = () => {
    if (timeRef.current >= DURATION) { timeRef.current = 0; }
    setPlaying((p) => !p);
  };
  const replay = () => { timeRef.current = 0; setEnded(false); setPlaying(true); startAudio(); };

  const beginExperience = () => {
    if (entered) return;
    timeRef.current = 0;
    setEnded(false);
    setEntered(true);
    setPlaying(true);
    startAudio();
  };

  // music ends with the presentation: fade out and stop when the film finishes
  useEffect(() => {
    if (ended) fadeAudio(0, 1500, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended]);

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      const a = audioRef.current;
      if (a) {
        a.muted = next;
        if (!next && a.paused && !ended) { a.play().catch(() => {}); }
      }
      return next;
    });
  };
  const onScrub = (e) => { setPlaying(false); timeRef.current = parseFloat(e.target.value); render(timeRef.current); };
  const upd = (k) => (e) => setCfg((c) => ({ ...c, [k]: e.target.value }));

  const photoStyle = (url) => (url ? { backgroundImage: `url("${url}")` } : {});
  const mono = initials(cfg.n1, cfg.n2);
  const namesFull = cfg.n1 && cfg.n2 ? `${cfg.n1.trim()}\n&\n${cfg.n2.trim()}` : null;

  return (
    <div className="std-root">
      <style>{CSS}</style>

      <div className="std-viewport" ref={R.viewport}>
        <div className="std-stage" ref={R.stage}>
          <div className="std-cam" ref={R.cam}>
            <div className={"bd" + (cfg.bd ? " hasimg" : "")}>
              {cfg.bd && <div className="bd-photo" style={{ backgroundImage: `url("${cfg.bd}")` }} />}
            </div>
            <div className="candle" ref={R.candle} />
            <div className="bokeh" style={{ width: 150, height: 150, top: 60, left: 70, background: "#D4BC8E", opacity: .45 }} />
            <div className="bokeh" style={{ width: 120, height: 120, top: 120, right: 90, background: "#C9A86C", opacity: .40 }} />
            <div className="bokeh" style={{ width: 180, height: 180, bottom: 120, left: 40, background: "#E8D9BB", opacity: .55 }} />
            <div className="bokeh" style={{ width: 130, height: 130, bottom: 80, right: 60, background: "#D4BC8E", opacity: .38 }} />
            <div className="bokeh" style={{ width: 90, height: 90, top: "40%", left: -20, background: "#E8D9BB", opacity: .45 }} />

            <div className="florals">
              {FLORALS.map((item, i) => (
                <FloralPhoto key={i} item={item} />
              ))}
            </div>

            <div className="album-wrap">
              <div className="album" ref={R.album}>
                <div className="body" />

                <div className="spread" ref={R.spread} style={{ opacity: 0 }}>
                  {/* base left = inside-cover title / monogram (shown first) */}
                  <div className="pagebase left">
                    <div className="leafface">
                      {namesFull ? (
                        <div className="names">{namesFull.split("\n").map((l, i) => <div key={i}>{i === 1 ? <span className="amp" style={{ fontSize: 56, display: "inline-block" }}>&amp;</span> : l}</div>)}</div>
                      ) : (
                        <div className="amp">&amp;</div>
                      )}
                    </div>
                  </div>

                  {/* base right = final photo (revealed after both flips) */}
                  <div className="pagebase right">
                    <div className={"photo" + (cfg.p5 ? "" : " empty")} style={photoStyle(cfg.p5)}>
                      {!cfg.p5 && <span>PHOTO&nbsp;5<br />engagement</span>}
                    </div>
                  </div>

                  {/* leaf A: front Photo 1 -> back Photo 3 */}
                  <div className="leaf" ref={R.leafA} style={{ zIndex: 120 }}>
                    <div className="f front">
                      <div className="leafface">
                        <div className={"photo" + (cfg.p1 ? "" : " empty")} style={photoStyle(cfg.p1)}>
                          {!cfg.p1 && <span>PHOTO&nbsp;1<br />engagement</span>}
                        </div>
                      </div>
                    </div>
                    <div className="f back">
                      <div className="leafface">
                        <div className={"photo" + (cfg.p3 ? "" : " empty")} style={photoStyle(cfg.p3)}>
                          {!cfg.p3 && <span>PHOTO&nbsp;3<br />engagement</span>}
                        </div>
                      </div>
                    </div>
                    <div className="shade" ref={R.shadeA} />
                  </div>

                  {/* leaf B: front Photo 2 -> back Photo 4 */}
                  <div className="leaf" ref={R.leafB} style={{ zIndex: 110 }}>
                    <div className="f front">
                      <div className="leafface">
                        <div className={"photo" + (cfg.p2 ? "" : " empty")} style={photoStyle(cfg.p2)}>
                          {!cfg.p2 && <span>PHOTO&nbsp;2<br />engagement</span>}
                        </div>
                      </div>
                    </div>
                    <div className="f back">
                      <div className="leafface">
                        <div className={"photo" + (cfg.p4 ? "" : " empty")} style={photoStyle(cfg.p4)}>
                          {!cfg.p4 && <span>PHOTO&nbsp;4<br />engagement</span>}
                        </div>
                      </div>
                    </div>
                    <div className="shade" ref={R.shadeB} />
                  </div>
                </div>

                {/* back cover: SAVE THE DATE */}
                <div className="face cover back-cover">
                  <div className="std">
                    <Palm className="palm tl" size={220} />
                    <Palm className="palm br" size={240} />
                    <div className="std-lbl" ref={R.lbl} style={{ opacity: 0 }}>SAVE THE DATE</div>
                    <svg className="std-rule" ref={R.rule} width="18" height="16" viewBox="0 0 18 16" aria-hidden="true" style={{ opacity: 0 }}>
                      <path d="M9 14.8C9 14.8 0.5 9 0.5 4C0.5 1.8 2.3 0 4.5 0C6.1 0 7.5 0.9 9 2.8C10.5 0.9 11.9 0 13.5 0C15.7 0 17.5 1.8 17.5 4C17.5 9 9 14.8 9 14.8Z" fill="currentColor"/>
                    </svg>
                    <div className="std-date" ref={R.date} style={{ opacity: 0 }}>27.07.27</div>
                    <div className="std-place" ref={R.place} style={{ opacity: 0 }}>ANGUILLA</div>
                    <svg className="std-sprig" ref={R.sprig} width="48" height="66" viewBox="0 0 100 115" aria-hidden="true" style={{ opacity: 0 }}>
                      <path d={PALM_PATH} fill="currentColor"/>
                      <ellipse cx="50" cy="100" rx="32" ry="8" fill="currentColor" opacity="0.55"/>
                      <path d="M18 100 Q50 93 82 100" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.35"/>
                    </svg>
                    <div className="std-rsvp" ref={R.rsvp} style={{ opacity: 0 }}>RSVPs to follow</div>
                  </div>
                </div>

                {/* front cover: OUR FOREVER (opens) */}
                <div className="face cover front-cover" ref={R.front}>
                  <div className="emboss">
                    <span className="ff-title">Our Forever</span>
                    <svg className="ff-heart" width="15" height="13" viewBox="0 0 18 16" aria-hidden="true">
                      <path d="M9 14.8C9 14.8 0.5 9 0.5 4C0.5 1.8 2.3 0 4.5 0C6.1 0 7.5 0.9 9 2.8C10.5 0.9 11.9 0 13.5 0C15.7 0 17.5 1.8 17.5 4C17.5 9 9 14.8 9 14.8Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grade" />
          <div className="grain" />
          <div className="vig" />
          {cfg.hand && <div className="hand"><img src={cfg.hand} alt="" /></div>}

          {DEV && !panelOpen && <button className="atoggle" onClick={() => setPanelOpen(true)}>✎ assets</button>}
          {DEV && panelOpen && (
            <div className="panel">
              <h3>Assets &amp; names</h3>
              <p>Paste public image URLs and names. Updates live.</p>
              <div className="row">
                <div style={{ flex: 1 }}>
                  <label>First name</label>
                  <input type="text" value={cfg.n1} onChange={upd("n1")} placeholder="—" />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Partner</label>
                  <input type="text" value={cfg.n2} onChange={upd("n2")} placeholder="—" />
                </div>
              </div>
              <label>Engagement photo 1 (URL)</label>
              <input type="url" value={cfg.p1} onChange={upd("p1")} placeholder="https://…" />
              <label>Engagement photo 2 (URL)</label>
              <input type="url" value={cfg.p2} onChange={upd("p2")} placeholder="https://…" />
              <label>Backdrop / marble scene (URL)</label>
              <input type="url" value={cfg.bd} onChange={upd("bd")} placeholder="https://…" />
              <label>Hand cutout PNG (URL, optional)</label>
              <input type="url" value={cfg.hand} onChange={upd("hand")} placeholder="https://…" />
              <div style={{ textAlign: "right", marginTop: 12 }}>
                <button className="atoggle" style={{ position: "static" }} onClick={() => setPanelOpen(false)}>done</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* soundtrack — starts on Open, fades out with the presentation (no loop) */}
      <audio ref={audioRef} src="/audio/ambient.mp3" preload="auto" playsInline />

      {/* enter screen — first tap starts the film + music */}
      <div className={"enter" + (entered ? " hide" : "")} aria-hidden={entered}>
        <div className="enter-glow" />
        <div className="mono">Our Forever</div>
        <div className="sub">Anguilla · 27 July 2027</div>
        <button className="open" onClick={beginExperience}>Open</button>
      </div>

      {/* discreet sound toggle, once inside */}
      {entered && !ended && (
        <button className="chrome-btn mute" onClick={toggleMute} aria-pressed={muted}>
          {muted ? "Sound off" : "Sound on"}
        </button>
      )}

      {/* gentle replay once the film has finished */}
      <button
        className={"chrome-btn replay-end" + (ended && entered ? " show" : "")}
        onClick={replay}
        tabIndex={ended && entered ? 0 : -1}
      >
        Replay
      </button>

      {DEV && (
        <div className="controls">
          <button onClick={togglePlay}>{playing ? "Pause" : "Play"}</button>
          <button onClick={replay}>Replay</button>
          <input className="scrub" ref={R.scrub} type="range" min="0" max={DURATION} step="0.01" defaultValue="0" onChange={onScrub} aria-label="Timeline scrubber" />
          <span className="timelbl" ref={R.time}>0.0 / {DURATION.toFixed(1)}s</span>
        </div>
      )}
    </div>
  );
}
