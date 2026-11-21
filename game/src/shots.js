// The screenshot scenes behind ?shot=start|play|end. Each one plays the real rules from a
// fresh world: start is the title over an untouched pair of pictures, play has three
// differences already ringed and four still to find, and end has all seven found and the
// win panel up. The same seed always gives the same frame.
import { PANEL_LEFT, STEP } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const PLAY_SECONDS = 26;

/**
 * Set `world` to the named scene (start, play or end; any other name is start) and return the
 * screen to draw over it and the best time to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end') {
    return { screen: SCREEN_TITLE, best: 0 };
  }
  const found = name === 'end' ? world.state.differences.length : 3;
  for (let index = 0; index < found; index += 1) {
    const difference = world.state.differences[index];
    world.click(PANEL_LEFT.x + difference.x, PANEL_LEFT.y + difference.y);
  }
  for (let index = 0; index < PLAY_SECONDS / STEP; index += 1) {
    world.step(STEP, !world.state.won);
  }
  if (world.state.won) return { screen: SCREEN_OVER, best: world.state.elapsed };
  return { screen: SCREEN_PLAY, best: 0 };
}
