import { AssetBalance } from '@/service/walletService';

export const orderAssets = (assets: AssetBalance[]) => {
    const orderedList = {};

    const sortOrder = ['TFT:STELLAR', 'TFT:SUBSTRATE', 'TFTA:STELLAR', 'FREETFT:STELLAR'];

    for (let i = 0; i < sortOrder.length; i++) {
        // @ts-ignore
        orderedList[sortOrder[i]] = i;
    }

    assets.sort((a, b) => {
        const aType = a.name.toUpperCase() + ':' + a.type.toUpperCase();
        const bType = b.name.toUpperCase() + ':' + b.type.toUpperCase();

        //@ts-ignore
        return orderedList[aType] - orderedList[bType];
    });

    return assets;
};
