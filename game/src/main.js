// Boot and the one loop: clicks and keys are read every frame, the clock advances in fixed
// 1/60 s steps, and the renderer paints what is there. The game moves between four screens:
// title, play, paused and won. A click on a picture tests the spot it lands on; a click on
// the title or the win panel starts (or restarts) the game.
// ?shot=start|play|end stages that scene instead of running the loop, paints it twice and
// sets window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createWorld, EVENT_FOUND, EVENT_MISS, EVENT_WON } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);

/** Tiny WebAudio chimes, made on first use: a bright pair for a find, a low buzz for a miss. */
let audio = null;
function chime(found) {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    const now = audio.currentTime;
    const notes = found ? [880, 1318] : [160];
    notes.forEach((frequency, index) => {
      const tone = audio.createOscillator();
      const gain = audio.createGain();
      tone.type = 'sine';
      tone.frequency.value = frequency;
      gain.gain.setValueAtTime(0.12, now + index * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + 0.25);
      tone.connect(gain).connect(audio.destination);
      tone.start(now + index * 0.09);
      tone.stop(now + index * 0.09 + 0.3);
    });
  } catch {
    // No audio device, or the browser refused it: the game plays on silently.
  }
}

function readBest() {
  try {
    return Number.parseFloat(window.localStorage.getItem(BEST_KEY) ?? '0') || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best time then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let click = null;

  canvas.addEventListener('pointerdown', (event) => {
    click = renderer.toField(event.clientX, event.clientY);
  });

  // Screen readers (and anyone watching the page's text) hear the screen changes and finds.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Find 7 differences.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (best === 0 || world.state.elapsed < best) {
      best = world.state.elapsed;
      saveBest(best);
    }
    announce(
      `You found all 7 in ${Math.round(world.state.elapsed)} seconds, with ${world.state.mistakes} misses.`,
    );
  }

  function handleClick() {
    if (click === null) return;
    const point = click;
    click = null;
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
      startGame();
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    const events = world.click(point.x, point.y);
    if (events & EVENT_FOUND) {
      chime(true);
      if (events & EVENT_WON) endGame();
      else announce(`Found ${world.state.found} of 7.`);
    } else if (events & EVENT_MISS) {
      chime(false);
      announce('Not a difference.');
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    } else if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      if (world.hint()) announce('Hint: a gold ring marks one difference.');
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleClick();
    handleActions();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        world.step(STEP, true);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
      world.step(0, false);
    }
    renderer.draw(world.state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Moonlit Bakery. Press Space or click to start. Find 7 differences.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
