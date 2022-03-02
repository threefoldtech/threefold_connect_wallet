import { wallets } from '@/service/walletService';

export function validateWalletName(name: string): string | null {
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
