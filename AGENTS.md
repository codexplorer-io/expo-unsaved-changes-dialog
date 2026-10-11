# AGENTS.md — `@codexporer.io/expo-unsaved-changes-dialog`

## Package Overview
Unsaved changes dialog hook protecting user work on back navigation, with built-in Android hardware back press listener and `<Portal>` mounting.

## Key Exports
- `useUnsavedChangesDialog({ goBack, isFocused, hasUnsavedChanges, onDialogOpen?, onContinueEditing?, onDiscardChanges? })`
  - Returns `{ renderUnsavedChangesDialog, openUnsavedChangesDialog }`.

## Critical Guidelines for AI Agents
- Bind the header back action (e.g. `AppbarBackAction`) to `openUnsavedChangesDialog`, NOT directly to `goBack()`.
- Always render `{renderUnsavedChangesDialog()}` in the component JSX.
- Pass `isFocused` (e.g. from `useIsFocused()`) so Android back button events are only intercepted when the screen is actually active.
- If an editor automatically auto-saves (or persists state instantly), do not mount this dialog unnecessarily.
- **Theming**: Dialog containers and buttons inherit styling directly from `useAppTheme()` via `@codexporer.io/expo-dialog` and `@codexporer.io/expo-button`.
