// Drawing only: the world's state and the current screen in, pixels out. The 1280x720
// playfield is scaled to fit the window and centred, the margin filled with the backdrop
// colour. The bakery is drawn twice, side by side: the left picture as it is, the right
// with seven small changes. Found differences get a red ring on both pictures.
import { DIFFERENCES, FIELD, FONT, PALETTE, PANEL_LEFT, PANEL_RIGHT } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const PANEL = { width: 600, top: 134, line: 34, bottom: 70 };

/** The stars in the night sky; the second one is a difference (missing on the right). */
const STARS = [
  { x: 60, y: 40 },
  { x: 150, y: 55 },
  { x: 240, y: 35 },
  { x: 330, y: 60 },
  { x: 520, y: 40 },
];

function cachedLabel(prefix) {
  let value = -1;
  let text = '';
  return function label(next) {
    if (next !== value) {
      value = next;
      text = prefix + next;
    }
    return text;
  };
}

function formatTime(seconds) {
  const whole = Math.floor(seconds);
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const foundLabel = cachedLabel('Found ');
  const timeLabel = cachedLabel('');
  const missLabel = cachedLabel('Misses ');

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  const fonts = new Map();
  function text(value, x, y, size, color, align) {
    if (!fonts.has(size)) fonts.set(size, `${size}px ${FONT}`);
    context.font = fonts.get(size);
    context.fillStyle = color;
    context.textAlign = align;
    context.fillText(value, x, y);
  }

  function circle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fill();
  }

  function ring(x, y, r, color, width) {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.stroke();
  }

  function rect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
  }

  /** One picture of the bakery, drawn in panel-local coordinates. `altered` hides the changes. */
  function drawBakery(ox, oy, altered) {
    context.save();
    context.translate(ox, oy);
    const gradient = context.createLinearGradient(0, 0, 0, 420);
    gradient.addColorStop(0, PALETTE.skyTop);
    gradient.addColorStop(1, PALETTE.skyBottom);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 560, 420);
    for (let index = 0; index < STARS.length; index += 1) {
      if (altered && index === 1) continue;
      circle(STARS[index].x, STARS[index].y, 2.5, PALETTE.star);
    }
    // The moon, high on the right: two craters on the left picture, one on the right.
    circle(470, 60, 30, PALETTE.moon);
    circle(462, 52, 5, '#d8c9a3');
    if (!altered) circle(478, 68, 4, '#d8c9a3');
    // The roof, chimney and its smoke (the smoke is a difference).
    context.fillStyle = PALETTE.roof;
    context.beginPath();
    context.moveTo(20, 150);
    context.lineTo(280, 90);
    context.lineTo(540, 150);
    context.closePath();
    context.fill();
    rect(375, 60, 30, 75, PALETTE.roof);
    if (!altered) {
      context.globalAlpha = 0.75;
      circle(390, 55, 10, PALETTE.smoke);
      circle(402, 38, 12, PALETTE.smoke);
      circle(388, 20, 9, PALETTE.smoke);
      context.globalAlpha = 1;
    }
    // The wall, the striped awning and the sign.
    rect(30, 150, 500, 270, PALETTE.wall);
    rect(30, 390, 500, 30, PALETTE.wallDark);
    for (let stripe = 0; stripe < 10; stripe += 1) {
      let color = stripe % 2 === 0 ? PALETTE.awningRed : PALETTE.awningCream;
      if (altered && stripe === 3) color = PALETTE.awningTeal;
      rect(30 + stripe * 50, 150, 50, 55, color);
    }
    rect(215, 215, 130, 30, PALETTE.awningCream);
    text('BAKERY', 280, 237, 20, PALETTE.door, 'center');
    // The door, the lantern and the window with its cakes.
    rect(250, 300, 80, 120, PALETTE.door);
    rect(258, 312, 64, 44, '#4a3626');
    rect(258, 364, 64, 44, '#4a3626');
    circle(315, 360, 5, PALETTE.accent);
    rect(352, 228, 10, 26, PALETTE.door);
    circle(357, 258, 12, PALETTE.windowGlow);
    rect(60, 230, 170, 120, '#2c2118');
    rect(70, 240, 150, 100, PALETTE.windowGlow);
    rect(70, 322, 150, 6, '#2c2118');
    for (const cakeX of [90, 145, 200]) {
      if (altered && cakeX === 145) continue;
      rect(cakeX - 12, 296, 24, 26, '#b5533c');
      circle(cakeX, 292, 10, '#f5e9c8');
      circle(cakeX, 282, 3, '#e86a9a');
    }
    // The cat on the ground (a difference) and the flower pot (its flower is one too).
    if (!altered) {
      context.fillStyle = PALETTE.cat;
      context.beginPath();
      context.ellipse(430, 398, 26, 14, 0, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(452, 378, 12, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.moveTo(444, 368);
      context.lineTo(447, 356);
      context.lineTo(452, 367);
      context.closePath();
      context.fill();
      context.beginPath();
      context.moveTo(456, 367);
      context.lineTo(461, 356);
      context.lineTo(462, 368);
      context.closePath();
      context.fill();
    }
    context.fillStyle = PALETTE.pot;
    context.beginPath();
    context.moveTo(75, 395);
    context.lineTo(115, 395);
    context.lineTo(110, 420);
    context.lineTo(80, 420);
    context.closePath();
    context.fill();
    if (!altered) {
      context.strokeStyle = '#4a7c3a';
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(95, 395);
      context.lineTo(95, 388);
      context.stroke();
      circle(95, 388, 8, PALETTE.flower);
    }
    context.restore();
  }

  function drawMarkers(state) {
    for (const panel of [PANEL_LEFT, PANEL_RIGHT]) {
      for (const difference of state.differences) {
        if (!difference.found) continue;
        ring(panel.x + difference.x, panel.y + difference.y, difference.r + 4, PALETTE.found, 4);
      }
      if (state.hint >= 0) {
        const difference = state.differences[state.hint];
        const pulse = 0.5 + 0.5 * Math.sin(state.hintTimer * 6);
        context.globalAlpha = 0.4 + 0.6 * pulse;
        ring(panel.x + difference.x, panel.y + difference.y, difference.r + 8, PALETTE.accent, 3);
        context.globalAlpha = 1;
      }
    }
  }

  function drawHeader(state) {
    rect(0, 0, FIELD.width, 72, PALETTE.header);
    context.textBaseline = 'top';
    text('Moonlit Bakery', 24, 20, 28, PALETTE.text, 'left');
    text(foundLabel(`${state.found} / ${DIFFERENCES}`), FIELD.width / 2, 20, 28, PALETTE.text, 'center');
    text(timeLabel(formatTime(state.elapsed)), FIELD.width - 200, 20, 28, PALETTE.text, 'right');
    text(missLabel(state.mistakes), FIELD.width - 24, 20, 28, PALETTE.muted, 'right');
    text('A', PANEL_LEFT.x + 12, PANEL_LEFT.y - 26, 18, PALETTE.muted, 'left');
    text('B', PANEL_RIGHT.x + 12, PANEL_RIGHT.y - 26, 18, PALETTE.muted, 'left');
  }

  function drawFooter(state) {
    context.textBaseline = 'top';
    text(
      'Click a difference on either picture. H for a hint. P to pause. Find all 7 to win.',
      FIELD.width / 2,
      540,
      20,
      PALETTE.muted,
      'center',
    );
    if (state.missTimer > 0) {
      text('Not a difference — look closer.', FIELD.width / 2, 572, 20, PALETTE.found, 'center');
    }
  }

  function drawPanel(title, lines, prompt) {
    const height = PANEL.top + lines.length * PANEL.line + PANEL.bottom;
    const x = (FIELD.width - PANEL.width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = PALETTE.panel;
    context.fillRect(x, y, PANEL.width, height);
    context.textBaseline = 'alphabetic';
    text(title, FIELD.width / 2, y + 78, 48, PALETTE.text, 'center');
    for (let index = 0; index < lines.length; index += 1) {
      text(lines[index], FIELD.width / 2, y + PANEL.top + index * PANEL.line, 22, PALETTE.muted, 'center');
    }
    text(prompt, FIELD.width / 2, y + height - 40, 24, PALETTE.accent, 'center');
  }

  const TITLE_LINES = [
    'Two pictures of the same bakery at night.',
    'Seven small things changed between them.',
    'Click each change on either picture to ring it.',
    'Mouse to play. H hints. P pauses.',
    '',
  ];
  const PAUSED_LINES = ['The bakery will wait for you.'];
  const OVER_LINES = ['', '', ''];

  /** Paint one frame: the header, both pictures, the markers, then a panel for the screen. */
  function draw(state, screen, best) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawHeader(state);
    context.strokeStyle = PALETTE.panelEdge;
    context.lineWidth = 2;
    context.strokeRect(PANEL_LEFT.x - 2, PANEL_LEFT.y - 2, PANEL_LEFT.width + 4, PANEL_LEFT.height + 4);
    context.strokeRect(PANEL_RIGHT.x - 2, PANEL_RIGHT.y - 2, PANEL_RIGHT.width + 4, PANEL_RIGHT.height + 4);
    drawBakery(PANEL_LEFT.x, PANEL_LEFT.y, false);
    drawBakery(PANEL_RIGHT.x, PANEL_RIGHT.y, true);
    drawMarkers(state);
    drawFooter(state);
    if (screen === SCREEN_TITLE) {
      TITLE_LINES[4] = best > 0 ? `Best time ${formatTime(best)}` : 'No win yet — be the first.';
      drawPanel('Moonlit Bakery', TITLE_LINES, 'Press Space or click to start');
      return;
    }
    if (screen === SCREEN_PAUSED) {
      drawPanel('Paused', PAUSED_LINES, 'Press P to resume');
      return;
    }
    if (screen === SCREEN_OVER) {
      OVER_LINES[0] = `You found all 7 in ${formatTime(state.elapsed)}.`;
      OVER_LINES[1] = `Misses ${state.mistakes} · Hints ${state.hintsUsed}.`;
      OVER_LINES[2] = best > 0 ? `Best time ${formatTime(best)}` : '';
      drawPanel('You found them all!', OVER_LINES, 'Press Space or click to play again');
    }
  }

  /** A pointer position in client pixels, mapped back onto the playfield. */
  function toField(clientX, clientY) {
    const ratio = window.devicePixelRatio || 1;
    const bounds = canvas.getBoundingClientRect();
    const x = (clientX - bounds.left) * ratio;
    const y = (clientY - bounds.top) * ratio;
    return { x: (x - view.x) / view.scale, y: (y - view.y) / view.scale };
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, toField };
}
