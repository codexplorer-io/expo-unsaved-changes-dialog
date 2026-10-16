# AGENTS.md — `@codexporer.io/expo-unsaved-changes-dialog`

## Package Overview
Custom React hook (`useUnsavedChangesDialog`) protecting user edits against accidental loss during back navigation. Integrates Android hardware back button interception via React Native's `BackHandler`, keyboard dismissal, and `<Portal>` modal rendering.

## Peer Dependencies
```json
{
  "react": "*",
  "react-native": "*",
  "@codexporer.io/expo-app-theme": "*",
  "@codexporer.io/expo-button": "*",
  "@codexporer.io/expo-dialog": "*",
  "@codexporer.io/expo-portal": "*"
}
```

## API Contracts (`src/index.js`)

```javascript
export const useUnsavedChangesDialog = ({
    goBack,
    isFocused,
    hasUnsavedChanges,
    onDialogOpen = null,
    onContinueEditing = null,
    onDiscardChanges = null
}) => {
    // Returns:
    // {
    //   renderUnsavedChangesDialog: () => React.ReactNode,
    //   openUnsavedChangesDialog: () => void
    // }
};
```

## Key Exports
- `useUnsavedChangesDialog`: Custom hook.
  - Arguments:
    - `goBack`: `() => void` (Required). Callback invoked when no changes exist or discard is confirmed.
    - `isFocused`: `boolean` (Required). Focus status gating the Android `BackHandler` listener.
    - `hasUnsavedChanges`: `boolean` (Required). State flag indicating whether uncommitted modifications exist.
    - `onDialogOpen`: `(() => void) | null` (Optional). Callback invoked when the modal dialog is shown.
    - `onContinueEditing`: `(() => void) | null` (Optional). Callback invoked when user clicks "No" (or dismisses dialog).
    - `onDiscardChanges`: `(() => void) | null` (Optional). Callback invoked when user clicks "Yes" (discards changes and calls `goBack()`).
  - Returns:
    - `renderUnsavedChangesDialog`: Function returning the modal JSX rendered inside `<Portal>`.
    - `openUnsavedChangesDialog`: Function that triggers navigation: if `!hasUnsavedChanges`, calls `goBack()` immediately; if `hasUnsavedChanges`, dismisses keyboard and opens confirmation dialog.

## Component Behavior & Defaults
- **Android Back Handling**: While `isFocused` is true, registers a `hardwareBackPress` event listener. When pressed, triggers `openUnsavedChangesDialog` and prevents default native back action. Listener is automatically cleaned up when `isFocused` changes or unmounts.
- **Keyboard Dismissal**: Calls `Keyboard.dismiss()` automatically when opening the unsaved changes dialog.
- **Dialog Options**:
  - "No" (`ButtonSize.Small`): invokes `onContinueEditing?.()` and closes dialog.
  - "Yes" (`ButtonSize.Small`): invokes `onDiscardChanges?.()`, closes dialog, and invokes `goBack()`.
- **Theming**: Injects `theme.text` for the prompt text and inherits modal/button theming from `@codexporer.io/expo-dialog` and `@codexporer.io/expo-button`.

## Critical Guidelines for AI Agents
- **Back Navigation Binding**: Always bind header back buttons (e.g. `AppbarBackAction`) to `openUnsavedChangesDialog` instead of calling `navigation.goBack()` directly.
- **Mount Portal**: Always render `{renderUnsavedChangesDialog()}` in the screen's component tree.
- **Focus Guard**: Always supply `isFocused` (e.g., from `useIsFocused()` in `@codexporer.io/expo-navigation-bridge`) so hardware back listeners only intercept events when the screen is focused.
- **Do Not Duplicate**: If the screen already auto-persists all state or changes are non-destructive, do not use `useUnsavedChangesDialog`.
