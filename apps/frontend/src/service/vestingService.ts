import { Horizon } from 'stellar-sdk';
import flagsmith from 'flagsmith';
import { AllowedAsset, AssetBalance, Wallet } from '@/service/walletService';
import { checkVesting as stellarCryptocheckVesting } from '@jimber/stellar-crypto';
import BalanceLine = Horizon.BalanceLine;
import BalanceLineAsset = Horizon.BalanceLineAsset;

export const checkVesting = async (wallet: Wallet): Promise<AssetBalance[]> => {
    const publicKey = wallet.keyPair.getStellarKeyPair().publicKey();

    const account = await stellarCryptocheckVesting(publicKey);

    if (!account) {
        return [];
    }
    const allowedAssets: AllowedAsset[] = JSON.parse(<string>flagsmith.getValue('currencies'));
    return account.balances
        .map((balance: BalanceLine): AssetBalance => {
            const assetCode =
                balance.asset_type === 'native'
                    ? 'xlm'
                    : (<BalanceLineAsset<'credit_alphanum4'> | BalanceLineAsset<'credit_alphanum12'>>balance)
                          ?.asset_code;
            return {
                name: assetCode,
                amount: Number(balance.balance),
                type: 'stellar',
                issuer: (<BalanceLineAsset<'credit_alphanum4'> | BalanceLineAsset<'credit_alphanum12'>>balance)
                    ?.asset_issuer,
            };
        })
        .filter(a =>
            allowedAssets.find(allowedAsset => allowedAsset.asset_code === a.name && allowedAsset.issuer === a.issuer)
        );
};
