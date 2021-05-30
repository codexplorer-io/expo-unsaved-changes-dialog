import { act } from 'react-dom/test-utils';
import { BackHandler, Keyboard } from 'react-native';
import { injectable } from 'react-magnetic-di';
import {
    Dialog,
    Button,
    Paragraph,
    Portal
} from 'react-native-paper';
import { runHookWithDi, createMockComponent, mountWithDi } from '@codexporer.io/react-test-utils';
import { useUnsavedChangesDialog } from './index';

jest.mock('react-native/Libraries/Utilities/BackHandler', () => ({
    addEventListener: jest.fn()
}));

jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
    dismiss: jest.fn()
}));

const DialogContent = Dialog.Content;
const DialogActions = Dialog.Actions;

describe('useUnsavedChangesDialog', () => {
    const removeBackHandler = jest.fn();
    const defaultProps = {
        navigation: { goBack: jest.fn() },
        isFocused: true,
        hasUnsavedChanges: true,
        onDialogOpen: jest.fn(),
        onContinueEditing: jest.fn(),
        onDiscardChanges: jest.fn()
    };

    const defaultDeps = [
        injectable(Button, createMockComponent('Button', { hasChildren: true })),
        injectable(Dialog, createMockComponent('Dialog', { hasChildren: true })),
        injectable(DialogContent, createMockComponent('DialogContent', { hasChildren: true })),
        injectable(DialogActions, createMockComponent('DialogActions', { hasChildren: true })),
        injectable(Paragraph, createMockComponent('Paragraph', { hasChildren: true })),
        injectable(Portal, createMockComponent('Portal', { hasChildren: true }))
    ];

    beforeEach(() => {
        BackHandler.addEventListener.mockReturnValue({ remove: removeBackHandler });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('openUnsavedChangesDialog', () => {
        it('should open unsaved changes dialog when hasUnsavedChanges is true', () => {
            const hookRunner = runHookWithDi(
                () => useUnsavedChangesDialog(defaultProps),
                { deps: defaultDeps }
            );
            const renderUnsavedChangesDialog = () => mountWithDi(
                hookRunner.hookResult.renderUnsavedChangesDialog(),
                { deps: defaultDeps }
            );

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(renderUnsavedChangesDialog().find('Dialog').props().visible).toBe(false);
            expect(defaultProps.navigation.goBack).not.toHaveBeenCalled();
            expect(Keyboard.dismiss).not.toHaveBeenCalled();
            expect(defaultProps.onDialogOpen).not.toHaveBeenCalled();

            act(() => {
                hookRunner.hookResult.openUnsavedChangesDialog();
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(renderUnsavedChangesDialog().find('Dialog').props().visible).toBe(true);
            expect(defaultProps.navigation.goBack).not.toHaveBeenCalled();
            expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
            expect(defaultProps.onDialogOpen).toHaveBeenCalledTimes(1);
        });

        it('should not call onDialogOpen callback if not passed', () => {
            const hookRunner = runHookWithDi(
                () => useUnsavedChangesDialog({
                    ...defaultProps,
                    onDialogOpen: undefined
                }),
                { deps: defaultDeps }
            );
            const renderUnsavedChangesDialog = () => mountWithDi(
                hookRunner.hookResult.renderUnsavedChangesDialog(),
                { deps: defaultDeps }
            );

            act(() => {
                hookRunner.hookResult.openUnsavedChangesDialog();
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(renderUnsavedChangesDialog().find('Dialog').props().visible).toBe(true);
            expect(defaultProps.navigation.goBack).not.toHaveBeenCalled();
            expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
            expect(defaultProps.onDialogOpen).not.toHaveBeenCalled();
        });

        it('should not open unsaved changes dialog when hasUnsavedChanges is false', () => {
            const hookRunner = runHookWithDi(
                () => useUnsavedChangesDialog({
                    ...defaultProps,
                    hasUnsavedChanges: false
                }),
                { deps: defaultDeps }
            );
            const renderUnsavedChangesDialog = () => mountWithDi(
                hookRunner.hookResult.renderUnsavedChangesDialog(),
                { deps: defaultDeps }
            );

            act(() => {
                hookRunner.hookResult.openUnsavedChangesDialog();
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(renderUnsavedChangesDialog().find('Dialog').props().visible).toBe(false);
            expect(defaultProps.navigation.goBack).toHaveBeenCalledTimes(1);
            expect(Keyboard.dismiss).not.toHaveBeenCalled();
            expect(defaultProps.onDialogOpen).not.toHaveBeenCalled();
        });
    });

    describe('Hardware back handler', () => {
        it('should be attached when isFocused is true and detached when isFocused is false', () => {
            const hookProps = { ...defaultProps };
            const hookRunner = runHookWithDi(
                () => useUnsavedChangesDialog(hookProps),
                { deps: defaultDeps }
            );

            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
            expect(BackHandler.addEventListener).toHaveBeenCalledWith(
                'hardwareBackPress',
                expect.any(Function)
            );
            expect(removeBackHandler).not.toHaveBeenCalled();

            act(() => {
                hookRunner.update();
            });

            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
            expect(removeBackHandler).not.toHaveBeenCalled();

            act(() => {
                hookProps.isFocused = false;
                hookRunner.update();
            });

            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
            expect(removeBackHandler).toHaveBeenCalledTimes(1);

            act(() => {
                hookProps.isFocused = true;
                hookRunner.update();
            });

            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(2);
            expect(removeBackHandler).toHaveBeenCalledTimes(1);
        });

        it('should not be attached when isFocused is false and attached when isFocused is true', () => {
            const hookProps = {
                ...defaultProps,
                isFocused: false
            };
            const hookRunner = runHookWithDi(
                () => useUnsavedChangesDialog(hookProps),
                { deps: defaultDeps }
            );

            expect(BackHandler.addEventListener).not.toHaveBeenCalled();
            expect(removeBackHandler).not.toHaveBeenCalled();

            act(() => {
                hookRunner.update();
            });

            expect(BackHandler.addEventListener).not.toHaveBeenCalled();
            expect(removeBackHandler).not.toHaveBeenCalled();

            act(() => {
                hookProps.isFocused = true;
                hookRunner.update();
            });

            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
            expect(removeBackHandler).not.toHaveBeenCalled();
        });

        it('should open unsaved changes dialog', () => {
            const hookRunner = runHookWithDi(
                () => useUnsavedChangesDialog(defaultProps),
                { deps: defaultDeps }
            );
            const renderUnsavedChangesDialog = () => mountWithDi(
                hookRunner.hookResult.renderUnsavedChangesDialog(),
                { deps: defaultDeps }
            );

            expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);

            const onBack = BackHandler.addEventListener.mock.calls[0][1];

            act(() => {
                onBack();
            });

            // eslint-disable-next-line lodash/prefer-lodash-method
            expect(renderUnsavedChangesDialog().find('Dialog').props().visible).toBe(true);
            expect(defaultProps.navigation.goBack).not.toHaveBeenCalled();
            expect(Keyboard.dismiss).toHaveBeenCalledTimes(1);
            expect(defaultProps.onDialogOpen).toHaveBeenCalledTimes(1);
        });
    });

    describe('Dialog', () => {
        const openUnsavedChangesDialog = ({
            shouldOverrideContineEditing = false,
            shouldOverrideDiscardChanges = false
        }) => {
            const hookRunner = runHookWithDi(
                () => useUnsavedChangesDialog({
                    ...defaultProps,
                    ...(
                        shouldOverrideContineEditing ? {
                            onContinueEditing: undefined
                        } : {}
                    ),
                    ...(
                        shouldOverrideDiscardChanges ? {
                            onDiscardChanges: undefined
                        } : {}
                    )
                }),
                { deps: defaultDeps }
            );

            act(() => {
                hookRunner.hookResult.openUnsavedChangesDialog();
            });

            return hookRunner;
        };

        const renderUnsavedChangesDialog = hookRunner => mountWithDi(
            hookRunner.hookResult.renderUnsavedChangesDialog(),
            { deps: defaultDeps }
        );

        it('should be closed without navigation when dialog is dismissed', () => {
            const hookRunner = openUnsavedChangesDialog({});
            // eslint-disable-next-line lodash/prefer-lodash-method
            const dialog = renderUnsavedChangesDialog(hookRunner).find('Dialog');

            expect(dialog.props().visible).toBe(true);

            act(() => {
                dialog.props().onDismiss();
                hookRunner.update();
            });

            expect(
                // eslint-disable-next-line lodash/prefer-lodash-method
                renderUnsavedChangesDialog(hookRunner).find('Dialog').props().visible
            ).toBe(false);
            expect(defaultProps.navigation.goBack).not.toHaveBeenCalled();
            expect(defaultProps.onContinueEditing).toHaveBeenCalledTimes(1);
            expect(defaultProps.onDiscardChanges).not.toHaveBeenCalled();
        });

        it('should be should be closed without navigation and not call onContinueEditing callback when not passed', () => {
            const hookRunner = openUnsavedChangesDialog({ shouldOverrideContineEditing: true });
            // eslint-disable-next-line lodash/prefer-lodash-method
            const dialog = renderUnsavedChangesDialog(hookRunner).find('Dialog');

            expect(dialog.props().visible).toBe(true);

            act(() => {
                dialog.props().onDismiss();
                hookRunner.update();
            });

            expect(
                // eslint-disable-next-line lodash/prefer-lodash-method
                renderUnsavedChangesDialog(hookRunner).find('Dialog').props().visible
            ).toBe(false);
            expect(defaultProps.navigation.goBack).not.toHaveBeenCalled();
            expect(defaultProps.onContinueEditing).not.toHaveBeenCalled();
            expect(defaultProps.onDiscardChanges).not.toHaveBeenCalled();
        });

        it('should be closed without navigation when cancel button is clicked', () => {
            const hookRunner = openUnsavedChangesDialog({});
            // eslint-disable-next-line lodash/prefer-lodash-method
            const dialog = renderUnsavedChangesDialog(hookRunner).find('Dialog');
            // eslint-disable-next-line lodash/prefer-lodash-method
            const noButton = dialog.find('Button').at(0);

            expect(dialog.props().visible).toBe(true);

            act(() => {
                noButton.props().onPress();
                hookRunner.update();
            });

            expect(
                // eslint-disable-next-line lodash/prefer-lodash-method
                renderUnsavedChangesDialog(hookRunner).find('Dialog').props().visible
            ).toBe(false);
            expect(defaultProps.navigation.goBack).not.toHaveBeenCalled();
            expect(defaultProps.onContinueEditing).toHaveBeenCalledTimes(1);
            expect(defaultProps.onDiscardChanges).not.toHaveBeenCalled();
        });

        it('should be closed with navigation when confirm button is clicked', () => {
            const hookRunner = openUnsavedChangesDialog({});
            // eslint-disable-next-line lodash/prefer-lodash-method
            const dialog = renderUnsavedChangesDialog(hookRunner).find('Dialog');
            // eslint-disable-next-line lodash/prefer-lodash-method
            const noButton = dialog.find('Button').at(1);

            expect(dialog.props().visible).toBe(true);

            act(() => {
                noButton.props().onPress();
                hookRunner.update();
            });

            expect(
                // eslint-disable-next-line lodash/prefer-lodash-method
                renderUnsavedChangesDialog(hookRunner).find('Dialog').props().visible
            ).toBe(false);
            expect(defaultProps.navigation.goBack).toHaveBeenCalledTimes(1);
            expect(defaultProps.onDiscardChanges).toHaveBeenCalledTimes(1);
            expect(defaultProps.onContinueEditing).not.toHaveBeenCalled();
        });

        it('should be closed with navigation and not call onContinueEditing callback when not passed', () => {
            const hookRunner = openUnsavedChangesDialog({ shouldOverrideDiscardChanges: true });
            // eslint-disable-next-line lodash/prefer-lodash-method
            const dialog = renderUnsavedChangesDialog(hookRunner).find('Dialog');
            // eslint-disable-next-line lodash/prefer-lodash-method
            const noButton = dialog.find('Button').at(1);

            expect(dialog.props().visible).toBe(true);

            act(() => {
                noButton.props().onPress();
                hookRunner.update();
            });

            expect(
                // eslint-disable-next-line lodash/prefer-lodash-method
                renderUnsavedChangesDialog(hookRunner).find('Dialog').props().visible
            ).toBe(false);
            expect(defaultProps.navigation.goBack).toHaveBeenCalledTimes(1);
            expect(defaultProps.onDiscardChanges).not.toHaveBeenCalled();
            expect(defaultProps.onContinueEditing).not.toHaveBeenCalled();
        });
    });
});
