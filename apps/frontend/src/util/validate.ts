import { wallets } from '@/service/walletService';

export function validateWalletName(name: string, selectedWalletName: string): string | null {
    // Case when they just click change without changing the name
    if (name.toLowerCase() == selectedWalletName.toLowerCase()) {
        return null;
    }

    if (name.length >= 50) {
        return 'Maximum of 50 characters';
    }

    if (name.length <= 0) {
        return 'This field can not be empty';
    }

    const walletNames: string[] = wallets.value.map(wallet => wallet.name.toLowerCase());

    if (walletNames.includes(name.toLowerCase())) {
        return 'Name already in use';
    }

    return null;
}
