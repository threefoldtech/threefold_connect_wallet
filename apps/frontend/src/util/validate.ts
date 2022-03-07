export const validateWalletName = (name: string) => {
    if (name.length >= 50) {
        return 'Maximum of 50 characters';
    }
};
