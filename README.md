# Moonlit Bakery — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rasyid46k/spot-difference-moonlit-bakery/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rasyid46k/spot-difference-moonlit-bakery/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Two pictures of the same bakery at night. Seven small things changed between them.
Find them all — click a difference on either picture to ring it in red.

## How to play

- Open `game/index.html` in a desktop browser (or run `node serve.ts` and open http://localhost:8080).
- Click each difference on picture A or B. Found ones get a red ring on both pictures.
- The header counts what you found (`Found n / 7`) and your time. Wrong clicks count as misses.
- `H` flashes a gold ring around one difference you have not found yet.
- `P` pauses. Find all 7 to win; your fastest win is kept in this browser.

## The seven differences

The moon's crater, one awning stripe, the cat on the ground, the middle cake in the
window, a star, the chimney smoke, and the flower in its pot.

## Files

- `main.ts` — the entry program (Node 22): copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` with the vendored make.fun library.
- `game/` — the playable game as static files: `index.html` plus ES modules under
  `game/src/`. No library, no network request, no build step.
- `screenshots/` — real renders of the game's own code (start, play, end).
- `vendor/makefun-game.ts` — make.fun's game library, copied from the kit unchanged.

Built by an AI agent for make.fun's "Make the best spot the difference game" bounty, $50 in USDC.

Referral: https://make.fun/r/pmmr6h4w
