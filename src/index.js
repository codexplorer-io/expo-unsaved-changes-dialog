import React, { useState, useEffect, useRef } from 'react';
import {
    BackHandler,
    Keyboard,
    StyleSheet,
    Text
} from 'react-native';
import {
    Dialog,
    DialogContent,
    DialogActions
} from '@codexporer.io/expo-dialog';
import { Button, ButtonSize } from '@codexporer.io/expo-button';
import { useAppTheme } from '@codexporer.io/expo-app-theme';
import { Portal } from '@codexporer.io/expo-portal';

export const useUnsavedChangesDialog = ({
    goBack,
    isFocused,
    hasUnsavedChanges,
    onDialogOpen = null,
    onContinueEditing = null,
    onDiscardChanges = null
}) => {
    const theme = useAppTheme();
    const [isUnsavedChangesDialogVisible, setIsUnsavedChangesDialogVisible] = useState(false);
    const openUnsavedChangesDialogRef = useRef();

    const openUnsavedChangesDialogDependenciesRef = useRef();
    openUnsavedChangesDialogDependenciesRef.current = { hasUnsavedChanges };

    openUnsavedChangesDialogRef.current = () => {
        const { hasUnsavedChanges } = openUnsavedChangesDialogDependenciesRef.current;

        if (!hasUnsavedChanges) {
            goBack();
            return;
        }

        Keyboard.dismiss();
        setIsUnsavedChangesDialogVisible(true);
        onDialogOpen?.();
    };

    const closeUnsavedChangesDialog = () => {
        setIsUnsavedChangesDialogVisible(false);
    };

    useEffect(() => {
        const handler = isFocused && BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                openUnsavedChangesDialogRef.current();
                return true;
            }
        );

        return () => handler && handler.remove();
    }, [isFocused]);

    const onContinueEditingClick = () => {
        onContinueEditing?.();
        closeUnsavedChangesDialog();
    };

    const onDiscardChangesClick = () => {
        onDiscardChanges?.();
        closeUnsavedChangesDialog();
        goBack();
    };

    const renderUnsavedChangesDialog = () => (
        <Portal>
            <Dialog
                visible={isUnsavedChangesDialogVisible}
                onDismiss={onContinueEditingClick}
            >
                <DialogContent>
                    <Text style={[styles.message, { color: theme.text }]}>
                        Closing the screen will discard any unsaved changes.
                        {' '}
                        Do you want to continue and discard any unsaved changes?
                    </Text>
                </DialogContent>
                <DialogActions style={styles.actions}>
                    <Button
                        title='No'
                        size={ButtonSize.Small}
                        onPress={onContinueEditingClick}
                    />
                    <Button
                        title='Yes'
                        size={ButtonSize.Small}
                        onPress={onDiscardChangesClick}
                    />
                </DialogActions>
            </Dialog>
        </Portal>
    );

    return {
        renderUnsavedChangesDialog,
        openUnsavedChangesDialog: openUnsavedChangesDialogRef.current
    };
};

const styles = StyleSheet.create({
    actions: {
        gap: 8
    },
    message: {
        fontSize: 16,
        lineHeight: 24
    }
});
