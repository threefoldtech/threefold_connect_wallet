import axios from 'axios';
import { getConfig } from './stellarService';
import { Asset, Keypair, Operation, TransactionBuilder } from 'stellar-sdk';
import { fundTrustLine } from './trustlineService';
import { closeTradeOffer, getOpenTradeOffers, sellAssetForTft, sellTft } from './tradeService';

const friendBot = async (address: string) => {
    await axios.get('https://friendbot.stellar.org/?addr=' + address);
};

const timeout = (timeout: number) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(), timeout);
    });
};

const { server } = getConfig();

const testAccountSecretWithTftAndBtc = 'SB5UP6KAFNVYIRZ7M3CUUHHWOA6BCO3VFWEBL4HCM44SNHUBR76I72WP';

const asset_code = 'BTC';

// beforeAll(async () => {
//     const kp = Keypair.fromSecret(testAccountSecretWithTftAndBtc);
//
//     const openTradeOffers = await getOpenTradeOffers(kp);
//
//     for (const openTradeOffer of openTradeOffers) {
//         await closeTradeOffer(kp, Number(openTradeOffer.id));
//     }
// }, 60000);
// beforeEach(async () => {
//     const kp = Keypair.fromSecret(testAccountSecretWithTftAndBtc);
//
//     const openTradeOffers = await getOpenTradeOffers(kp);
//
//     for (const openTradeOffer of openTradeOffers) {
//         await closeTradeOffer(kp, Number(openTradeOffer.id));
//     }
// }, 60000);
// afterAll(async () => {
//     const kp = Keypair.fromSecret(testAccountSecretWithTftAndBtc);
//
//     const openTradeOffers = await getOpenTradeOffers(kp);
//
//     for (const openTradeOffer of openTradeOffers) {
//         await closeTradeOffer(kp, Number(openTradeOffer.id));
//     }
// }, 60000);

describe.skip('trading', () => {
    it('should submit trade Offer', async () => {
        const kp = Keypair.fromSecret(testAccountSecretWithTftAndBtc);

        const { offerId } = await sellAssetForTft(kp, 'BTC', 0.00000239, 0.00099995);

        expect(offerId).not.toBe(0);
        expect(typeof offerId).toBe('number');
    }, 60000);

    it('should get open trade Offers', async () => {
        const kp = Keypair.fromSecret(testAccountSecretWithTftAndBtc);

        await sellAssetForTft(kp, 'BTC', 0.00000234, 1);

        const openTradeOffers = await getOpenTradeOffers(kp);

        // const existingTradeOffer = openTradeOffers.find(openTradeOffer => Number(openTradeOffer.id) === offerId);
        //
        // expect(existingTradeOffer).toBeTruthy();
        // expect(Number(existingTradeOffer.id)).toBe(offerId);
    }, 60000);

    it('should close trade Offer', async () => {
        const kp = Keypair.fromSecret(testAccountSecretWithTftAndBtc);

        const account = await server.loadAccount(kp.publicKey());

        const { offerId: originalOfferId } = await sellAssetForTft(kp, 'BTC', 10, 1);

        const openTradeOffers = await getOpenTradeOffers(kp);

        const existingTradeOffer = openTradeOffers.find(
            openTradeOffer => Number(openTradeOffer.id) === originalOfferId
        );

        expect(existingTradeOffer).toBeTruthy();
        expect(Number(existingTradeOffer.id)).toBe(originalOfferId);

        await closeTradeOffer(kp, Number(existingTradeOffer.id));
        const newTradeOffers = await getOpenTradeOffers(kp);
        const newTradeOffer = newTradeOffers.find(openTradeOffer => Number(openTradeOffer.id) === originalOfferId);

        expect(newTradeOffer).toBeUndefined();

        console.log(openTradeOffers);
    }, 60000);

    it('should close all trade Offer (just for dev)', async () => {
        const kp = Keypair.fromSecret(testAccountSecretWithTftAndBtc);

        const openTradeOffers = await getOpenTradeOffers(kp);

        for (const openTradeOffer of openTradeOffers) {
            await closeTradeOffer(kp, Number(openTradeOffer.id));
        }
    }, 60000);

    it.skip('test if sale goes through', async () => {
        const kp1 = Keypair.fromSecret('SB5UP6KAFNVYIRZ7M3CUUHHWOA6BCO3VFWEBL4HCM44SNHUBR76I72WP');
        const kp2 = Keypair.fromSecret('SBG6Y47FAPHIBVD6MK37BBCBDW3MXCTODJG6SGJXYUGSZLTVULNJM6WQ');

        const assetCode = 'BTC';
        await sellAssetForTft(kp1, assetCode, 10, 1);
        await sellTft(kp2, assetCode, 0.02, 1);
    }, 60000);
});
