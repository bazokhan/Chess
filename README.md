# Chess Engine Playground

A board-games playground centered on a chess engine I originally wrote years ago,
now rewritten with a modern bitboards approach.

This repository is where I keep evolving the engine architecture, testing
algorithms, and exposing smaller interactive demos that help validate ideas
quickly.

## Engine story

- **Legacy engine**: the original implementation with the first generation of
  move generation and search ideas.
- **Bitboards engine**: the rewrite focused on performance, cleaner
  representation, and better extensibility.
- **Current direction**: continue improving search depth, evaluation quality,
  telemetry, and analysis tooling.

## Available pages

- `/` Home page with project context and navigation.
- `/chess` Main chess playground (board interaction, analysis views, telemetry,
  and engine mode switching).
- `/tictactoe` Small game sandbox for quick AI/algorithm feedback loops.

## Tech stack

- [Vite](https://vitejs.dev)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [TailwindCSS](https://tailwindcss.com)
- [Vitest](https://vitest.dev)
- [React Router](https://reactrouter.com)

## Getting started

### 1) Install dependencies

```bash
pnpm install
```

### 2) Create required local folders

Create these folders at the repository root:

- `logs`
- `data_sets`

### 3) Generate hash data

```bash
pnpm run hashing
```

This command generates `proximityTable.json` in `data_sets`.

### 4) Run the app

```bash
pnpm run dev
```

Open <http://localhost:5173>.

## Useful scripts

- `pnpm run dev` - start development server
- `pnpm run build` - typecheck and build
- `pnpm run typecheck` - run TypeScript checks only
- `pnpm run lint` - run eslint
- `pnpm run test` - run Vitest in terminal
- `pnpm run test:ui` - run Vitest UI
- `pnpm run solvePuzzle` - run puzzle-solving script
- `pnpm run readChessPuzzles` - parse/read chess puzzle data
- `pnpm run botMatch` - run bot-vs-bot script

## Notes

- This project intentionally combines product-like UI with algorithm
  experimentation.

## Other projects

- [mo-baz.com](https://mo-baz.com) - personal site with portfolio links, product
  experiments, and developer profiles.
- [MyGameEngine](https://my-game-engine-zeta.vercel.app/) - playful game engine
  lab with multiple experiment modules.
- [Gamercury Studio](https://gamercury.lovable.app/) - indie portfolio for
  mobile apps and games.

## License

MIT
