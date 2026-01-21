---
name: Schedule Heads-Up Calendar
overview: Replace the current scheduling form with a heads-up calendar view that uses dot colors to communicate upload readiness, driven by backlog items and user-defined intervals.
todos:
  - id: add-calendar
    content: Add react-native-calendars and render calendar view
    status: completed
  - id: interval-settings
    content: Add interval UI and persistence for days/times
    status: completed
  - id: tentative-scheduling
    content: Compute tentative dates and dot statuses
    status: completed
  - id: dot-legend
    content: Add dot legend and heads-up messaging
    status: completed
---

# Schedule Heads-Up Calendar Plan

## Goals

- Surface a calendar in `app/schedule.tsx` with colored dots per date: green (uploaded), red (failed), grey (ready/complete metadata), yellow (missing metadata but scheduled).
- Introduce user-configurable upload intervals (days/times) and use them to compute tentative schedule dates for backlog items.

## Key files

- `[app/schedule.tsx](/Users/Doug/Library/Mobile Documents/com~apple~CloudDocs/Development/ai-dev/schdup/app/schedule.tsx)`: replace current schedule form with calendar + legend + interval controls.
- `[app/backlog.tsx](/Users/Doug/Library/Mobile Documents/com~apple~CloudDocs/Development/ai-dev/schdup/app/backlog.tsx)`: source of backlog items; reuse media + schedule status logic where possible.
- `[src/domain/models.ts](/Users/Doug/Library/Mobile Documents/com~apple~CloudDocs/Development/ai-dev/schdup/src/domain/models.ts)`: add interval model and optional schedule metadata completeness helpers.
- `[src/data/localScheduleRepository.ts](/Users/Doug/Library/Mobile Documents/com~apple~CloudDocs/Development/ai-dev/schdup/src/data/localScheduleRepository.ts)`: persist interval settings and derived tentative schedules if needed.
- `[src/utils/date.ts](/Users/Doug/Library/Mobile Documents/com~apple~CloudDocs/Development/ai-dev/schdup/src/utils/date.ts)`: add utilities to generate next occurrences for interval patterns.

## Implementation outline

- Add dependency on `react-native-calendars` and render a month calendar in `app/schedule.tsx` with marked dates and dots.
- Add an interval settings section on the schedule screen:
- Day-of-week selection and one or more time slots.
- Preset examples (e.g., 3/week or 2/day) to speed setup.
- Persist settings in AsyncStorage via `localScheduleRepository` (or a new `localIntervalRepository`).
- Compute tentative schedule dates:
- Load backlog media from `localMediaRepository` and existing schedules from `localScheduleRepository`.
- For unscheduled backlog items, generate next available occurrences from the user interval (or a default interval when missing).
- Assign tentative dates in-memory for display (do not auto-create schedule items unless confirmed).
- Dot color rules on each calendar date:
- Green if any schedule on that date has status `uploaded`.
- Red if any schedule on that date has status `failed`.
- Grey if all tentative/real schedules on that date have complete metadata.
- Yellow if any tentative/real schedule on that date is missing metadata (title/description/hashtags).
- Add a legend under the calendar explaining dot colors and the “heads up” intent.

## Notes and assumptions

- “Missing metadata” = empty title or description or zero hashtags (can be adjusted later).
- Default interval will be set if the user hasn’t configured one (e.g., Mon/Wed/Sat at 10:00am).
- Tentative schedule dates are computed from backlog items and shown visually; actual scheduling still requires explicit confirmation.

## Future plans

- Add a tutorial/app walkthrough that guides users through setting intervals, scheduling a video, and completing basic app flows.