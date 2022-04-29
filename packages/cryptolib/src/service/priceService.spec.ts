import axios from 'axios';
import { getConfig } from './stellarService';
import { getPairPrice } from './priceService';

const friendBot = async (address: string) => {
    try {
        await axios.get('https://friendbot.stellar.org/?addr=' + address);
    } catch (e) {
        return;
    }
};

const { server, currencies } = getConfig();

// btc -> usd
const assetPair = 'XBTUSDC';

describe('priceService', () => {
    it('it shouldget BTC price', async () => {
        const tickerPairBTCUSD = 'XBTUSDC';
        const message = await getPairPrice(tickerPairBTCUSD);
        console.log(message);
    }, 60000);
});
