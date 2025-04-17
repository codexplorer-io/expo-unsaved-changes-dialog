import React, { useState, useEffect, useRef } from 'react';
import { BackHandler, Keyboard } from 'react-native';
import { di } from 'react-magnetic-di';
import {
    Dialog,
    Button,
    Paragraph,
    Portal
} from 'react-native-paper';

const DialogContent = Dialog.Content;
const DialogActions = Dialog.Actions;

export const useUnsavedChangesDialog = ({
    goBack,
    isFocused,
    hasUnsavedChanges,
    onDialogOpen = null,
    onContinueEditing = null,
    onDiscardChanges = null
}) => {
    di(Button, Dialog, DialogActions, DialogContent, Paragraph, Portal, useEffect, useState);

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
                    <Paragraph>
                        Closing the screen will discard any unsaved changes.
                        {' '}
                        Do you want to continue and discard any unsaved changes?
                    </Paragraph>
                </DialogContent>
                <DialogActions>
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
                </DialogActions>
            </Dialog>
        </Portal>
    );

    return {
        renderUnsavedChangesDialog,
        openUnsavedChangesDialog: openUnsavedChangesDialogRef.current
    };
};
