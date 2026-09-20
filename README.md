# React Native Gallery App - Candidate Submission

## Setup & Running Instructions
1. Clone repository: `git clone https://github.com/TheCreator8055/React-Native-Gallery-App.git`
2. Install dependencies: `npm install`
3. Run Metro Bundler: `npx expo start` or `npm start`
4. Launch Android: Press `a` (or run on physical device via Expo Go)

## Key Libraries Used
- **React Navigation:** Tab & Stack navigation flows
- **Zustand:** Centralized state persistence
- **AsyncStorage:** Local session, user-specific themes, and favorites storage
- **Expo Media Library:** Cross-platform gallery image saving
- **React Native Image Pan Zoom:** Pure JS pinch-to-zoom (No Reanimated native crashes)

## Architecture & Assumptions
- **State Management:** Auth session state syncs directly to local storage to maintain persistent logins across restarts. Theme and Favorites are tightly scoped to individual user accounts to prevent data bleeding between accounts.
- **Search & Filter:** Search and alphabet filtering run synchronously through a combined memoized filter (`useMemo`).
- **Debounced Search:** Custom hook prevents UI lag during rapid text input.
- **Pull-to-Refresh & Pagination Optimization:** The `useFetchImages` hook utilizes `useRef` to act as a strict mutex lock, cleanly resetting page states and absolutely preventing duplicate/concurrent API requests during rapid scroll or pull-to-refresh actions.

## Challenges Faced & Solutions
- **Reanimated Engine & Expo Go Compatibility:** Attempting to implement pinch-to-zoom using standard libraries caused a native JSI / `worklets` crash in the pre-compiled Expo Go client due to React Native 0.77 engine overhauls. *Solution:* Pivoted to a pure JavaScript zooming library (`react-native-image-pan-zoom`), completely removing native crash risks while perfectly retaining the strict UI requirements (disabling pan-to-move, allowing only zoom).
- **Session State Contamination:** Initially, global state (favorites and themes) persisted globally, causing data to bleed when switching accounts. *Solution:* Refactored Zustand stores to dynamically generate user-specific storage keys (e.g., `@theme_user@email.com`), ensuring perfect data isolation and graceful resets during the logout flow.
- **Concurrent API Spamming:** Aggressive user scrolling or spamming the Pull-to-Refresh component triggered overlapping API fetches, leading to duplicate items. *Solution:* Implemented a strict synchronous `useRef` mutex lock inside the fetching hook to physically block concurrent network requests.
- **Android Media Permissions in Expo Go:** Expo Go dynamically blocks media library saving capabilities on modern Android APIs. *Solution:* Implemented robust error catching to gracefully alert the user of the Expo Go limitation while ensuring the exact same code executes flawlessly in the compiled standalone APK.

## Folder Structure
- `src/components`: Generic UI components (Inputs, Buttons, Cards)
- `src/hooks`: Custom hooks for API, debounce, and state persistence
- `src/navigation`: Stack and Tab navigation configurations
- `src/screens`: App screens (Auth, Home, Favorites, Profile, Loading)
- `src/store`: Global Zustand stores (Auth, Gallery, Theme)
- `src/utils`: Reusable helper and validation logic
- `src/types`: Centralized TypeScript interfaces

## Generating the Android APK File

```bash
# Install EAS CLI globally if using Expo
npm install -g eas-cli

# Login to Expo account
eas login

# Build standalone Android APK file
eas build --platform android --profile preview
```
