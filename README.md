# `@codexporer.io/expo-unsaved-changes-dialog`

Modal confirmation dialog hook protecting users from accidental data loss on screen exit, with automatic Android hardware back button interception and theme integration.

## Installation & Peer Dependencies

```bash
yarn add @codexporer.io/expo-unsaved-changes-dialog
```

Peer dependencies:
- `react` (`*`)
- `react-native` (`*`)
- `@codexporer.io/expo-app-theme` (`*`)
- `@codexporer.io/expo-dialog` (`*`)
- `@codexporer.io/expo-button` (`*`)
- `@codexporer.io/expo-portal` (`*`)

## Quick Start

```tsx
import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUnsavedChangesDialog } from '@codexporer.io/expo-unsaved-changes-dialog';
import { Appbar, AppbarBackAction, AppbarContent } from '@codexporer.io/expo-appbar';
import { useIsFocused } from '@codexporer.io/expo-navigation-bridge';

export function EditScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [dirty, setDirty] = useState(false);

  const { renderUnsavedChangesDialog, openUnsavedChangesDialog } = useUnsavedChangesDialog({
    goBack: () => navigation.goBack(),
    isFocused,
    hasUnsavedChanges: dirty,
    onDiscardChanges: () => {
      console.log('Changes discarded by user');
    }
  });

  return (
    <View style={{ flex: 1 }}>
      <Appbar>
        <AppbarBackAction onPress={openUnsavedChangesDialog} />
        <AppbarContent title="Edit Document" />
      </Appbar>

      <TextInput
        placeholder="Type here..."
        onChangeText={() => setDirty(true)}
      />

      {/* Render dialog portal */}
      {renderUnsavedChangesDialog()}
    </View>
  );
}
```

## API Reference

### `useUnsavedChangesDialog(options)`

#### Options

| Option | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `goBack` | `() => void` | Yes | — | Navigation back action to perform when no changes exist or when discard is confirmed |
| `isFocused` | `boolean` | Yes | — | Whether current screen is active (gates Android hardware back button handler) |
| `hasUnsavedChanges` | `boolean` | Yes | — | Flag indicating whether uncommitted modifications exist |
| `onDialogOpen` | `(() => void) \| null` | No | `null` | Optional callback fired when dialog opens |
| `onContinueEditing` | `(() => void) \| null` | No | `null` | Optional callback when user taps "No" (dismisses dialog) |
| `onDiscardChanges` | `(() => void) \| null` | No | `null` | Optional callback when user taps "Yes" (discards changes) |

#### Return Value

| Property | Type | Description |
| :--- | :--- | :--- |
| `renderUnsavedChangesDialog` | `() => React.ReactNode` | Function returning the dialog JSX wrapped inside `<Portal>` |
| `openUnsavedChangesDialog` | `() => void` | Back button click handler. If `hasUnsavedChanges` is false, runs `goBack()` immediately; if true, shows confirmation modal |

## How It Works

1. **Android Hardware Back**: When `isFocused` is true, registers a `hardwareBackPress` listener via `BackHandler`. If unsaved changes exist, prevents native back and displays the prompt.
2. **Immediate Passthrough**: If `hasUnsavedChanges` is false, calling `openUnsavedChangesDialog()` bypasses the modal completely and executes `goBack()` instantly.
3. **Keyboard Dismissal**: Automatically dismisses software keyboard when the confirmation modal is triggered.
4. **Themed Styling**: Leverages `@codexporer.io/expo-app-theme` and `@codexporer.io/expo-button` for seamless dark and light mode adaptation.

## License

MIT
