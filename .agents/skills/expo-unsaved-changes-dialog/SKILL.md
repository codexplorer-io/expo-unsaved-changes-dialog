---
name: expo-unsaved-changes-dialog
description: Instructions and guidelines for using @codexporer.io/expo-unsaved-changes-dialog (Expo Unsaved Changes Dialog) in React Native and Expo applications.
---

# `@codexporer.io/expo-unsaved-changes-dialog` Skill

## Overview
`@codexporer.io/expo-unsaved-changes-dialog` provides a confirmation modal hook preventing users from losing uncommitted edits when navigating away or pressing the Android hardware back button.

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
| `goBack` | `() => void` | Yes | — | Navigation back callback |
| `isFocused` | `boolean` | Yes | — | Focus status for Android back listener |
| `hasUnsavedChanges` | `boolean` | Yes | — | Whether dirty edits exist |
| `onDialogOpen` | `() => void` | No | `null` | Called when dialog appears |
| `onContinueEditing` | `() => void` | No | `null` | Called when user chooses "No" |
| `onDiscardChanges` | `() => void` | No | `null` | Called when user chooses "Yes" |

#### Return Value
- `renderUnsavedChangesDialog`: `() => ReactNode` (renders dialog inside Portal).
- `openUnsavedChangesDialog`: `() => void` (checks `hasUnsavedChanges`; calls `goBack()` immediately if clean, opens modal if dirty).

---

## Critical Rules & Guidelines
1. **Always Connect Back Action**: Use `openUnsavedChangesDialog` for the header back button instead of raw `navigation.goBack()`.
2. **Mount Render Function**: Always place `{renderUnsavedChangesDialog()}` in the JSX tree.
3. **Guard with `isFocused`**: Pass `isFocused` so the hardware back listener only triggers when the screen is in the foreground.
