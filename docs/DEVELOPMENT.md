# Development

From the repository root (`D:/agent-workspace/repos/aether-and-iron`):

```bash
npm install
npm run build
npm test
```

`npm run build` runs TypeScript checks and creates the Vite production bundle in `dist/`.
`npm test` runs the Vitest suite once. Use `npm run test:watch` for an interactive watch run.

## UX flow (Chapter 1)

The intended first-run flow is **Main menu → New Expedition → Identity → Origin & Background → Class → Attributes → Skills & Gear → Review → Embark**. Identity, origin, class, and point-buy attributes must be valid before advancing; the final entity is created only at Embark. A draft may be kept locally while the player moves between steps.

Continue and Load Game use the validated primary/legacy persistence model. Settings are limited to existing audio, reduced-motion, and UI scale preferences. Exploration-to-combat transitions should present one accessible encounter briefing for the room, live enemy counts, hazards, and objectives before combat actions are available.

