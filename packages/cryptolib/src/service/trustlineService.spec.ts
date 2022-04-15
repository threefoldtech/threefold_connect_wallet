import { checkVesting, generateVestingAccount } from './vestingService';
import { Horizon, Keypair } from 'stellar-sdk';
import { fundTrustLine, selfFundTrustLine } from './trustlineService';
import axios from 'axios';
import { getConfig } from './stellarService';

const friendBot = async (address: string) => {
    try {
        await axios.get('https://friendbot.stellar.org/?addr=' + address);
    } catch (e) {
        return;
    }
};

const { server, currencies } = getConfig();

const asset_code = 'BTC';

describe('funding', () => {
    it('should fundTrustLine', async () => {
        const kp = Keypair.random();

        await friendBot(kp.publicKey());

        await fundTrustLine(kp, asset_code);

        const account = await server.loadAccount(kp.publicKey());

        const btcBalance = <Horizon.BalanceLineAsset<'credit_alphanum4'>>account.balances.find(b => {
            if (b.asset_type === 'native') return false;
            if (b.asset_type === 'credit_alphanum12') return false;

            return b.asset_code === asset_code;
        });
        //
        expect(btcBalance).toBeTruthy();
        expect(btcBalance.asset_code).toEqual(asset_code);
        expect(btcBalance.asset_issuer).toEqual(currencies[asset_code].issuer);
    }, 60000);

    it('should selfFundTrustLine', async () => {
        // const kp = Keypair.random();

        const kp = Keypair.fromSecret('SBG6Y47FAPHIBVD6MK37BBCBDW3MXCTODJG6SGJXYUGSZLTVULNJM6WQ');

        await friendBot(kp.publicKey());

        await selfFundTrustLine(kp, asset_code);

        const account = await server.loadAccount(kp.publicKey());

        const btcBalance = <Horizon.BalanceLineAsset<'credit_alphanum4'>>account.balances.find(b => {
            if (b.asset_type === 'native') return false;
            if (b.asset_type === 'credit_alphanum12') return false;

            return b.asset_code === asset_code;
        });
        //
        expect(btcBalance).toBeTruthy();
        expect(btcBalance.asset_code).toEqual(asset_code);
        expect(btcBalance.asset_issuer).toEqual(currencies[asset_code].issuer);
    }, 60000);
});
