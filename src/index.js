import React, { useState, useEffect } from 'react';
import { BackHandler, Keyboard } from 'react-native';
import {
    Dialog,
    Button,
    Paragraph,
    Portal
} from 'react-native-paper';

export const useUnsavedChangesDialog = ({
    navigation,
    isFocused,
    hasUnsavedChanges,
    onDialogOpen,
    onContinueEditing,
    onDiscardChanges
}) => {
    const [isUnsavedChangesDialogVisible, setIsUnsavedChangesDialogVisible] = useState(false);

    const openUnsavedChangesDialog = () => {
        if (!hasUnsavedChanges) {
            navigation.goBack();
            return;
        }

        Keyboard.dismiss();
        setIsUnsavedChangesDialogVisible(true);
        onDialogOpen && onDialogOpen();
    };

    const closeUnsavedChangesDialog = () => {
        setIsUnsavedChangesDialogVisible(false);
    };

    useEffect(() => {
        const handler = isFocused && BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                openUnsavedChangesDialog();
                return true;
            }
        );

        return () => handler && handler.remove();
    }, [
        openUnsavedChangesDialog,
        isFocused
    ]);

    const onContinueEditingClick = () => {
        onContinueEditing && onContinueEditing();
        closeUnsavedChangesDialog();
    };

    const onDiscardChangesClick = () => {
        onDiscardChanges && onDiscardChanges();
        closeUnsavedChangesDialog();
        navigation.goBack();
    };

    const renderUnsavedChangesDialog = () => (
        <Portal>
            <Dialog
                visible={isUnsavedChangesDialogVisible}
                onDismiss={onContinueEditingClick}
            >
                <Dialog.Content>
                    <Paragraph>
                        Closing the screen will discard any unsaved changes.
                        {' '}
                        Do you want to continue and discard any unsaved changes?
                    </Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button
                        onPress={onContinueEditingClick}
                    >
                        No
                    </Button>
                    <Button
                        onPress={onDiscardChangesClick}
                    >
                        Yes
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );

    return {
        renderUnsavedChangesDialog,
        openUnsavedChangesDialog
    };
};
