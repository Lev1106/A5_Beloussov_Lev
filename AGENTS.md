# Agent instructions — Smart Campus Room Availability Checker

## Purpose and limits
This is a small, read-only React/TypeScript/Vite demonstration for checking fictional campus-room availability. Do not turn it into a real booking or authentication service. Sample rooms and bookings are fictional.

## Repository map
- `src/App.tsx`: UI state, selection, and availability-check button.
- `src/utils/time.ts`: time formatting and core AC1–AC5 availability rules.
- `src/utils/roomFilters.ts`: capacity/equipment filtering and booking lookup.
- `src/data/sampleData.ts` / `src/types.ts`: demo data and TypeScript types.
- `src/components/`: room controls, bookings, timeline, result banner.
- `tests/*.test.mjs`: Node's built-in test runner; check both positive and negative cases.

## Setup and safe commands
Use Node.js 22+ and npm; from the repository root:
```
npm ci
npm test
npm run typecheck
npx tsc -p tsconfig.logic.json
npm run lint
npm run build
npm run dev
```
`npm run dev` is for local manual checks only. Do not present a command as passing unless its actual output was recorded. Internet/package cache access is needed for `npm ci`.

## Coding rules and review gates
1. Keep the current A4 features and five fictional rooms. Preserve AC1–AC5 and F1–F5. A room can satisfy filters but remain blocked and unavailable.
2. Keep availability checks read-only. Never alter shared sample booking records during an availability check.
3. Prefer minimal changes and pure functions. If a new pattern has no clear benefit, do not add one. Keep any structural refactoring limited to one focused change.
4. Add a targeted regression test for each verified bug, including rejected input and an unaffected valid case.
5. Inspect the proposed diff before accepting it. Verify baseline and final results; require human approval before merge or release.

## Prohibited actions without explicit owner approval
- Never read, generate, print, commit, or upload credentials, API tokens, real private data, or secret `.env` values.
- No production/staging deployment, hosted database writes, or real reservations.
- No destructive shell commands (`rm -rf`, resets, force pushes), history rewrites, automated merges, or changes outside the project/worktree.
- No dependency additions, removals, upgrades, lockfile regeneration, or network installs without the owner's review.
- No claiming a passing CI, browser test, audit, or manual review without actual evidence.

## If work is delegated to an agent
Use an isolated branch or worktree. Limit writes to the approved repository files. Report a summary, patch/diff, checks, and remaining risks to the reviewer. Stop on failed checks and request human review before merge or deployment.
