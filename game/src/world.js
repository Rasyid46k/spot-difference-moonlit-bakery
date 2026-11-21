// The game's rules and state, with no drawing and no browser in it: the seven differences
// between the two pictures, which ones the player has found, the timer, mistakes and hints.
// step() advances the clock one fixed step and returns what happened as bit flags, so the
// caller can react without the world knowing about screens or sound. Nothing here allocates
// after createWorld returns.
import { DIFFERENCES, FIELD, HINT_SECONDS, PANEL_LEFT, PANEL_RIGHT, STEP } from './config.js';

export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_WON = 4;

// Each difference, in panel-local coordinates (the same spot in both pictures). The panel
// the player clicks does not matter: a difference found on either side counts on both.
const SPOTS = [
  { x: 470, y: 60, r: 26, name: 'moon crater' },
  { x: 200, y: 180, r: 26, name: 'awning stripe' },
  { x: 430, y: 385, r: 30, name: 'cat' },
  { x: 145, y: 300, r: 30, name: 'middle cake' },
  { x: 150, y: 55, r: 16, name: 'star' },
  { x: 395, y: 70, r: 22, name: 'chimney smoke' },
  { x: 95, y: 405, r: 22, name: 'flower' },
];

export function createWorld() {
  const differences = SPOTS.map((spot) => ({ ...spot, found: false }));
  const state = {
    differences,
    found: 0,
    mistakes: 0,
    hintsUsed: 0,
    elapsed: 0,
    won: false,
    hint: -1,
    hintTimer: 0,
    lastMiss: -1,
    missTimer: 0,
  };

  function reset() {
    for (const difference of differences) difference.found = false;
    state.found = 0;
    state.mistakes = 0;
    state.hintsUsed = 0;
    state.elapsed = 0;
    state.won = false;
    state.hint = -1;
    state.hintTimer = 0;
    state.lastMiss = -1;
    state.missTimer = 0;
  }

  function panelAt(fieldX, fieldY) {
    for (const panel of [PANEL_LEFT, PANEL_RIGHT]) {
      if (
        fieldX >= panel.x &&
        fieldX <= panel.x + panel.width &&
        fieldY >= panel.y &&
        fieldY <= panel.y + panel.height
      ) {
        return { panel, x: fieldX - panel.x, y: fieldY - panel.y };
      }
    }
    return null;
  }

  /**
   * A click in playfield coordinates. Returns EVENT_FOUND when it lands on a difference
   * not yet found, EVENT_MISS when it lands on a picture but on nothing new, and 0 when
   * it lands outside both pictures. Finding the last difference also sets EVENT_WON.
   */
  function click(fieldX, fieldY) {
    if (state.won) return 0;
    const hit = panelAt(fieldX, fieldY);
    if (hit === null) return 0;
    for (let index = 0; index < differences.length; index += 1) {
      const difference = differences[index];
      if (difference.found) continue;
      const dx = hit.x - difference.x;
      const dy = hit.y - difference.y;
      if (dx * dx + dy * dy <= difference.r * difference.r) {
        difference.found = true;
        state.found += 1;
        state.hint = -1;
        if (state.found === DIFFERENCES) {
          state.won = true;
          return EVENT_FOUND | EVENT_WON;
        }
        return EVENT_FOUND;
      }
    }
    state.mistakes += 1;
    state.lastMiss = differences.length;
    state.missTimer = 0.6;
    return EVENT_MISS;
  }

  /** Flash a ring around one difference the player has not found yet. */
  function hint() {
    if (state.won) return false;
    for (let index = 0; index < differences.length; index += 1) {
      if (!differences[index].found) {
        state.hint = index;
        state.hintTimer = HINT_SECONDS;
        state.hintsUsed += 1;
        return true;
      }
    }
    return false;
  }

  /** One fixed step: the clock runs while the game is being played and not yet won. */
  function step(dt, playing) {
    if (playing && !state.won) state.elapsed += dt;
    if (state.hintTimer > 0) {
      state.hintTimer = Math.max(0, state.hintTimer - dt);
      if (state.hintTimer === 0) state.hint = -1;
    }
    if (state.missTimer > 0) state.missTimer = Math.max(0, state.missTimer - dt);
    return 0;
  }

  reset();
  return { state, reset, step, click, hint, FIELD };
}

export { STEP };
