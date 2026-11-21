// Moonlit Bakery: every tuning number and colour in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule below depends on
// the screen size. Two picture panels sit side by side; the left shows the bakery as it is,
// the right hides seven small changes.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** The two picture panels: same size, a gap between them. */
export const PANEL_LEFT = { x: 40, y: 96, width: 560, height: 420 };
export const PANEL_RIGHT = { x: 680, y: 96, width: 560, height: 420 };

/** How many differences the pictures hide, and how long a hint flash lasts. */
export const DIFFERENCES = 7;
export const HINT_SECONDS = 2.5;

/** Where the best (fastest) win is kept between visits (this browser only). */
export const BEST_KEY = 'moonlit-bakery.best';

export const PALETTE = {
  backdrop: '#0e1424',
  skyTop: '#1a2340',
  skyBottom: '#2c3a5e',
  header: '#141b30',
  text: '#f2ead8',
  muted: '#9aa3b8',
  accent: '#f2c94c',
  found: '#ff5a5a',
  panelEdge: '#3a4560',
  wall: '#7a5230',
  wallDark: '#5d3d22',
  roof: '#4a2c1a',
  awningRed: '#c0392b',
  awningCream: '#f5e9c8',
  awningTeal: '#2e7d7b',
  door: '#3d2b1f',
  windowGlow: '#ffd98a',
  moon: '#f5e9c8',
  star: '#ffffff',
  cat: '#22242e',
  pot: '#a8542f',
  flower: '#e86a9a',
  smoke: '#c8ccd8',
  panel: '#252b38',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
