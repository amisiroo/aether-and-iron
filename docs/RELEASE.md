# Chapter 1 release checklist

## Required checks

```sh
npm ci
npm test
npm run build
npm audit --omit=dev
```

The GitHub Actions `ci.yml` workflow runs tests, the production build, and the production dependency audit. `security.yml` repeats the audit on pushes, pull requests, and a weekly schedule. A clean audit must report no high/critical production vulnerability; review any advisory that remains before release.

## Browser smoke strategy

This project deliberately has no fragile browser automation dependency. The static/domain smoke harness is `npm test`: it exercises deterministic combat, boss transitions, arena damage, persistence migration, replayability, and pathfinding. For a release candidate, serve the built `dist` with `npm run preview` and manually verify:

1. character creation starts Chapter 1;
2. movement and the `^` hazard show a telegraph and resolve a saving throw;
3. the Iron Warden telegraphs a pulse, summons once, and the pulse damages a hero who remains in range;
4. NG+ opens from the in-game HUD and selected modifiers are carried into the next run;
5. reload restores the autosaved checkpoint and no uncaught console error appears.

## Performance baseline

The production build prints the generated asset sizes. Keep the largest JavaScript asset below 300 kB gzip-equivalent as a review trigger and investigate regressions over 10% from the last recorded build. React effects clean up keyboard listeners/timers, floating text animation only runs while text exists, and the root error boundary provides a safe production fallback without exposing stack traces or user state.

## Chapter 1 definition of done

- `npm test`, `npm run build`, and `npm audit --omit=dev` pass.
- CI runs test before build/deploy.
- Chapter 1 can be started, saved, resumed, and completed; remaining balance and manual coverage risks are recorded rather than hidden.
- Chapter 2 is intentionally out of scope.
