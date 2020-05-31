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

    const onContinueEditing = () => {
        closeUnsavedChangesDialog();
    };

    const onDiscardUnsavedChanges = () => {
        onDiscardChanges && onDiscardChanges();
        closeUnsavedChangesDialog();
        navigation.goBack();
    };

    const renderUnsavedChangesDialog = () => (
        <Portal>
            <Dialog
                visible={isUnsavedChangesDialogVisible}
                onDismiss={onContinueEditing}
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
                        onPress={onContinueEditing}
                    >
                        No
                    </Button>
                    <Button
                        onPress={onDiscardUnsavedChanges}
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
