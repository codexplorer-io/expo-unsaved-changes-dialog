---
name: expo-unsaved-changes-dialog
description: Instructions and guidelines for using @codexporer.io/expo-unsaved-changes-dialog (Expo Unsaved Changes Dialog) in React Native and Expo applications.
---

# `@codexporer.io/expo-unsaved-changes-dialog` Skill

## Overview
`@codexporer.io/expo-unsaved-changes-dialog` provides a confirmation modal hook preventing users from losing uncommitted edits when navigating away or pressing the Android hardware back button. Features automatic keyboard dismissal, Android back press interception, and `<Portal>` mounting.

---

## When to Use
- Multi-step editors (photo editors, collage creators, form screens) where state has not yet been saved.
- Intercepting back navigation safely without duplicating back listener boilerplate.

---

## Usage Example

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUnsavedChangesDialog } from '@codexporer.io/expo-unsaved-changes-dialog';
import { useIsFocused } from '@codexporer.io/expo-navigation-bridge';
import { Appbar, AppbarBackAction, AppbarContent } from '@codexporer.io/expo-appbar';

export function EditScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [hasChanges, setHasChanges] = useState(false);

  const { renderUnsavedChangesDialog, openUnsavedChangesDialog } = useUnsavedChangesDialog({
    goBack: () => navigation.goBack(),
    isFocused,
    hasUnsavedChanges: hasChanges,
    onDiscardChanges: () => {
      // Clean up temp edits
    }
  });

  return (
    <View style={{ flex: 1 }}>
      <Appbar>
        <AppbarBackAction onPress={openUnsavedChangesDialog} />
        <AppbarContent title="Edit Photo" />
      </Appbar>

      {/* Screen contents */}

      {renderUnsavedChangesDialog()}
    </View>
  );
}
```

---

## API Reference

### `useUnsavedChangesDialog(options)`

| Option | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `goBack` | `() => void` | Yes | — | Navigation back callback executed when discard is confirmed or no changes exist |
| `isFocused` | `boolean` | Yes | — | Screen focus status gating Android `hardwareBackPress` listener |
| `hasUnsavedChanges` | `boolean` | Yes | — | Flag indicating whether uncommitted modifications exist |
| `onDialogOpen` | `(() => void) \| null` | No | `null` | Optional callback fired when dialog opens |
| `onContinueEditing` | `(() => void) \| null` | No | `null` | Optional callback when user taps "No" (continues editing) |
| `onDiscardChanges` | `(() => void) \| null` | No | `null` | Optional callback when user taps "Yes" (discards changes) |

#### Return Value
- `renderUnsavedChangesDialog`: `() => React.ReactNode` (renders dialog modal inside `<Portal>`).
- `openUnsavedChangesDialog`: `() => void` (checks `hasUnsavedChanges`; calls `goBack()` immediately if false, dismisses keyboard and opens modal if true).

---

## Critical Rules & Guidelines
1. **Always Connect Back Action**: Use `openUnsavedChangesDialog` for header back buttons (e.g. `AppbarBackAction`) instead of raw `navigation.goBack()`.
2. **Mount Render Function**: Always place `{renderUnsavedChangesDialog()}` in the JSX tree.
3. **Guard with `isFocused`**: Pass `isFocused` (e.g. from `useIsFocused()`) so the hardware back listener only triggers when the screen is in the foreground.
4. **Keyboard Dismissal**: `Keyboard.dismiss()` is called automatically whenever the confirmation dialog is opened.
5. **Theming**: Injects `theme.text` for the prompt text and inherits modal/button theming from `@codexporer.io/expo-dialog` and `@codexporer.io/expo-button`.
