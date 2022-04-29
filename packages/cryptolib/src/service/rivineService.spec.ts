import {
    calculateWalletEntropyFromAccount,
    keypairFromAccount,
} from './cryptoService';
import { convertStellarAddressToRivine } from './rivineService';

const seedPhrase: string =
    'virus fantasy scout lake sort street pigeon mother behave soldier move bus clap finish enough lonely exercise onion art rhythm dizzy comfort tribe best';

const actualAddress =
    '015bfdcf061198127a57d39afea40adc8d1527249f93dfda384f7274098d213e45e2bf55bdf5e7';

const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 0);
const keypair = keypairFromAccount(walletEntropy);

describe('rivine', () => {
    it.skip('should convert adress from stellar to rivine', () => {
        const address = convertStellarAddressToRivine(keypair);
        expect(address).toBe(actualAddress);
    });
});
