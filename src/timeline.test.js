import assert from "node:assert/strict";
import test from "node:test";
import { getTimelineStyles, soundtrackVolume, VIDEO_DURATION } from "./timeline.js";

test("renders the same frame after seeking backward or forward", () => {
  const first = getTimelineStyles(7);
  getTimelineStyles(18.8);
  getTimelineStyles(0);
  assert.deepEqual(getTimelineStyles(7), first);
  assert.notDeepEqual(first, getTimelineStyles(0));
});

test("holds the fully revealed invitation while the soundtrack finishes", () => {
  const end = getTimelineStyles(18.8);
  assert.equal(end.rsvp.opacity, 1);
  assert.equal(end.date.opacity, 1);
  assert.equal(end.spread.opacity, 0);
  assert.deepEqual(getTimelineStyles(VIDEO_DURATION), end);
});

test("music fades in, stays quiet, then fades out over the extended ending", () => {
  assert.equal(VIDEO_DURATION, 25.3);
  assert.equal(soundtrackVolume(0), 0);
  assert.equal(soundtrackVolume(0.6), 0.125);
  assert.equal(soundtrackVolume(1.2), 0.25);
  assert.equal(soundtrackVolume(23.8), 0.25);
  assert.equal(soundtrackVolume(24.55), 0.125);
  assert.equal(soundtrackVolume(25.3), 0);
});
