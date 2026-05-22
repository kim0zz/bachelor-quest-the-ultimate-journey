# AGENTS.md

## Project context

This is a one-off party web app for a bachelor party.

The app is called “Bachelor Quest: Droga do Małżeństwa”.

The groom plays using a phone as a controller. The main game screen is displayed on a laptop connected to a TV through HDMI.

The goal is not to build a polished SaaS product. The goal is to build a stable, funny, easy-to-run party game that works reliably during one event.

## Core priorities

1. Stability during the party.
2. Simple code that is easy to edit quickly.
3. Clear TV experience visible from a few meters away.
4. Very simple mobile controller UX.
5. Easy editing of locations, quests, questions, answers, rewards, and penalties.
6. Avoid overengineering.

## Important rule

Do not rewrite the app unless explicitly asked.

Prefer small, safe patches over large refactors.

Before making broad architectural changes, explain the issue and propose a minimal plan.

## Tech assumptions

The project is a React + TypeScript web app, initially generated in Lovable.

It likely uses:
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- local React state and/or localStorage

Do not add a backend, database, authentication, payments, or complex infrastructure unless explicitly requested.

Realtime sync between TV and phone may be added later, but do not introduce it unless specifically asked.

## App modes

The app should have these modes:

- TV Mode: main visual game screen for laptop/TV.
- Controller Mode: simple phone controller for the groom.
- Admin / Operator Mode: emergency control panel for the host.

## TV Mode principles

TV Mode is the main show.

It should:
- be readable from a distance,
- use large typography,
- use large buttons/cards,
- show the map, groom avatar, current quest, points, shot counters, and big result messages,
- use animations for movement, success, failure, timers, and finale screens,
- avoid dense UI and small controls.

## Controller Mode principles

Controller Mode should be extremely simple.

Assume the user may be distracted, drunk, and holding the phone one-handed.

It should:
- show only the current relevant action,
- use huge buttons,
- avoid tiny controls,
- avoid complex navigation,
- never require precision.

## Admin / Operator Mode principles

Admin Mode is the safety net.

It should allow the host to:
- reset the game,
- add/remove Mąż Points,
- add groom shots,
- add team shots,
- mark current quest as completed,
- mark current quest as failed,
- skip to another location,
- show the final verdict.

Admin Mode can be ugly but must be reliable.

## Game data principles

Quest and location content should live in a dedicated data file, for example:

- `src/data/gameData.ts`

Do not hardcode quest text inside UI components.

Locations should be easy to add, remove, and edit.

Each location should have fields similar to:

- id
- name
- shortName
- description
- x
- y
- type
- locked
- pointsForSuccess
- rewardText
- penaltyText

Quest types may include:

- quiz
- challenge
- risk
- final

Risk quests are “HIGH RISK / HIGH REWARD” timed quests.

## Quest type behavior

### quiz

A normal A/B/C/D question.

Correct answer:
- add Mąż Points,
- show success animation,
- show reward text.

Wrong answer:
- add groom shot or configured penalty,
- show failure animation,
- show penalty text.

### challenge

A task performed physically or socially.

The operator/controller confirms success or failure.

Success:
- add Mąż Points.

Failure:
- add groom shot or configured penalty.

### risk

A timed “HIGH RISK / HIGH REWARD” quest.

Flow:
1. Show warning screen.
2. Player chooses “Wchodzę w to” or “Uciekam”.
3. If player escapes, do not mark completed and do not apply penalty.
4. If player accepts, show countdown 3, 2, 1.
5. Show timed A/B/C/D question.
6. Correct before timeout gives large reward.
7. Wrong answer or timeout gives penalty.

### final

Final verdict based on points and shots.

The verdict should be funny, theatrical, and visible on TV.

## Style and copy

The tone should be party/game-show/RPG.

Good phrases:
- Mąż Points
- Shot Counter
- Team Shots
- HIGH RISK / HIGH REWARD
- Boss finałowy
- Certyfikowany Mąż
- Pan młody pije
- Wszyscy piją
- Gotowy do ślubu

Avoid generic corporate copy.

## Coding guidelines

Use TypeScript carefully.

Keep components focused and readable.

Prefer clear names over clever abstractions.

Do not introduce heavy dependencies unless needed.

When adding features:
1. Inspect existing files first.
2. Make the smallest working change.
3. Preserve existing behavior.
4. Avoid unrelated cleanup.
5. Do not rename files or components without a strong reason.
6. Keep game content data-driven.

## Git workflow

After each working feature, the user should commit.

Do not bundle unrelated changes.

Good patch sizes:
- add more locations,
- improve risk quest timer,
- improve map layout,
- add admin controls,
- add localStorage persistence,
- add realtime sync later.

Bad patch sizes:
- rewrite the whole state system and redesign all screens at once,
- replace routing and UI library in one go,
- add backend while changing quest logic and redesigning the map.

## Current development strategy

The app started in Lovable to create the visual prototype.

Cursor should now be used for:
- understanding and stabilizing the code,
- adding more locations and quests,
- improving data structure,
- adding admin safety controls,
- later adding realtime sync if needed.

Do not treat Lovable-generated code as perfect, but do not aggressively rewrite it unless necessary.

## First task recommendation for any coding agent

Before implementing new features, inspect the project and summarize:

1. Where game data lives.
2. Where quest types are defined.
3. How game state is stored.
4. How TV, Controller, and Admin views communicate.
5. How locations are rendered.
6. How completed/locked quests work.
7. What is fragile and should be fixed before adding more content.

Then propose a minimal patch plan.
