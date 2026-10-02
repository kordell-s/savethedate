export const DURATION = 18.8;
export const AUDIO_VOLUME = 0.25;
export const AUDIO_FADE_IN = 1.2;
export const AUDIO_HOLD = 5;
export const AUDIO_FADE_OUT = 1.5;
export const VIDEO_DURATION = DURATION + AUDIO_HOLD + AUDIO_FADE_OUT;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
const phase = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
function keyed(t, pts) {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ta, va] = pts[i], [tb, vb] = pts[i + 1];
    if (t <= tb) return lerp(va, vb, easeInOut(phase(t, ta, tb)));
  }
  return pts[pts.length - 1][1];
}

// Pure styles let the website play in real time and Remotion seek in any order.
export function getTimelineStyles(seconds) {
  const t = clamp(seconds, 0, DURATION);
  const camS = keyed(t, [[0,1],[2.8,1.045],[4.3,1.02],[5.2,1.03],[8,1.022],[9,1.032],[11.4,1.022],[13.2,1.04],[14.5,1.062],[15.3,1.02],[16.9,1.03],[DURATION,1.10]]);
  const camY = keyed(t, [[0,10],[4.3,0],[14.5,-6],[16.9,-10],[DURATION,-28]]);
  const spin = keyed(t, [[0,0],[15.3,0],[16.9,180],[DURATION,180]]);
  const cover = keyed(t, [[0,0],[2.8,0],[4.3,-152],[13.2,-152],[14.5,0],[DURATION,0]]);
  const pa = easeInOut(phase(t, 6.2, 8));
  const pb = easeInOut(phase(t, 9.6, 11.4));
  const dp = easeInOut(phase(t, 16.8, 17.8));
  const reveal = (a, b, rise) => {
    const p = easeInOut(phase(t, a, b));
    return { opacity: p, transform: `translateY(${lerp(rise, 0, p)}px)` };
  };
  return {
    cam: { transform: `translateY(${camY}px) scale(${camS})` },
    album: { transform: `translateY(${6 * Math.sin(t * 0.55)}px) rotateY(${spin}deg)` },
    front: { transform: `translateZ(14px) rotateY(${cover}deg)` },
    spread: { opacity: clamp(phase(t, 3.2, 4.4) - phase(t, 13.2, 14.5), 0, 1) },
    leafA: { transform: `rotateY(${lerp(0, -178, pa)}deg) translateZ(6px)`, zIndex: pa < 0.5 ? 120 : 60 },
    leafB: { transform: `rotateY(${lerp(0, -178, pb)}deg) translateZ(4px)`, zIndex: pb < 0.5 ? 110 : 70 },
    shadeA: { opacity: Math.sin(pa * Math.PI) * 0.9 },
    shadeB: { opacity: Math.sin(pb * Math.PI) * 0.9 },
    candle: { opacity: clamp(0.80 + 0.11 * Math.sin(t * 6.7) + 0.05 * Math.sin(t * 12.9 + 1.7) + 0.035 * Math.sin(t * 22), 0.58, 1) },
    lbl: reveal(16.2, 16.9, 14),
    rule: reveal(16.5, 17.1, 10),
    date: { opacity: dp, transform: `translateY(${lerp(18, 0, dp)}px) scale(${lerp(.94, 1, dp)})` },
    place: reveal(17.4, 18, 12),
    sprig: { opacity: easeInOut(phase(t, 17.8, 18.5)) * 0.6 },
    rsvp: { opacity: easeInOut(phase(t, 18.1, 18.7)) },
  };
}

export function soundtrackVolume(seconds) {
  return AUDIO_VOLUME * Math.min(
    phase(seconds, 0, AUDIO_FADE_IN),
    1 - phase(seconds, DURATION + AUDIO_HOLD, VIDEO_DURATION),
  );
}

// Matches CSS ease-in-out (cubic-bezier(.42, 0, .58, 1)).
function cssEaseInOut(x) {
  let low = 0, high = 1;
  for (let i = 0; i < 20; i++) {
    const u = (low + high) / 2;
    const px = 3 * (1 - u) ** 2 * u * .42 + 3 * (1 - u) * u ** 2 * .58 + u ** 3;
    if (px < x) low = u;
    else high = u;
  }
  const u = (low + high) / 2;
  return 3 * (1 - u) * u ** 2 + u ** 3;
}

export function floralTransform(item, seconds) {
  const elapsed = Math.max(0, seconds - (item.delay ?? 0));
  const cycle = elapsed / (item.drift ?? 11);
  const fraction = cycle % 1;
  const progress = cssEaseInOut(Math.floor(cycle) % 2 ? 1 - fraction : fraction);
  return `translate3d(${(item.dx ?? 0) * progress}px,${(item.dy ?? -12) * progress}px,0) rotate(${(item.rot || 0) + (item.drot ?? 1.5) * progress}deg)`;
}
