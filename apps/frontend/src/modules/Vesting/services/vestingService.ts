import { Horizon } from 'stellar-sdk';
import flagsmith from 'flagsmith';
import { Wallet } from '@/modules/Wallet/services/walletService';
import { checkVesting as stellarCryptocheckVesting } from 'cryptolib';
import BalanceLine = Horizon.BalanceLine;
import BalanceLineAsset = Horizon.BalanceLineAsset;
import { ChainTypes, IAllowedAsset, IAssetBalance } from 'shared-types';

export const checkVesting = async (wallet: Wallet): Promise<IAssetBalance[]> => {
    const publicKey = wallet.keyPair.getStellarKeyPair().publicKey();

    const account = await stellarCryptocheckVesting(publicKey);

    if (!account) {
        return [];
    }
    const allowedAssets: IAllowedAsset[] = JSON.parse(<string>flagsmith.getValue('currencies'));
    return account.balances
        .map((balance: BalanceLine): IAssetBalance => {
            const assetCode =
                balance.asset_type === 'native'
                    ? 'xlm'
                    : (<BalanceLineAsset<'credit_alphanum4'> | BalanceLineAsset<'credit_alphanum12'>>balance)
                          ?.asset_code;
            return {
                name: assetCode,
                amount: Number(balance.balance),
                type: ChainTypes.STELLAR,
                issuer: (<BalanceLineAsset<'credit_alphanum4'> | BalanceLineAsset<'credit_alphanum12'>>balance)
                    ?.asset_issuer,
            };
        })
        .filter(a =>
            allowedAssets.find(allowedAsset => allowedAsset.asset_code === a.name && allowedAsset.issuer === a.issuer)
        );
};
