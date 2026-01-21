# schdup

Schedule social uploads from your phone. Capture or import video, build a backlog, and queue platform-specific posts with metadata. The app runs in a local-only mode today, using device storage and notifications to simulate scheduled uploads.

## Why it stands out
- **Product thinking**: focuses on the creator workflow (capture → backlog → schedule → notify → upload).
- **Clean architecture**: domain models and repository/service abstractions keep UI and data logic decoupled.
- **Mobile-first**: Expo Router navigation, native pickers, and local notifications.
- **Offline-ready**: AsyncStorage-backed persistence with sync-ready timestamps.

## Core features
- Capture or import video from camera, library, or files.
- Backlog view with status badges and refresh processing.
- Schedule uploads with platform, time, title, description, and hashtags.
- Local reminders via notifications when uploads are due.
- Simulated upload pipeline with status transitions.
- Account linking UI for supported platforms.

## Tech stack
- Expo SDK 54 + React Native 0.81
- TypeScript
- expo-router
- AsyncStorage
- expo-notifications, expo-image-picker, expo-document-picker

## Getting started
```bash
npm install
npm run start
```

Open the Expo dev tools and launch on iOS/Android (Expo Go or simulator).

## Scripts
- `npm run start` - start Expo dev server
- `npm run ios` - run on iOS
- `npm run android` - run on Android
- `npm run web` - run on web

## Project structure
- `app/` - expo-router screens
- `components/` - reusable UI components
- `src/domain/` - models, repositories, service contracts
- `src/data/` - local implementations (storage, scheduling, uploads)
- `src/utils/` - small utilities

## Data flow (high level)
1. **Capture** creates a media record and stores it locally.
2. **Schedule** writes a schedule item and sets a local notification.
3. **Backlog** processes due schedules and simulates uploads.

## Roadmap
- Real OAuth linking and token refresh per platform
- Server-side sync for schedules and media
- Background uploads and retries with job queue
- Media compression and upload progress

## Notes for reviewers
This project is intentionally local-first to demonstrate product flow, domain boundaries, and mobile UX. The data layer is structured to swap in real APIs without changing screen logic.
