import { Ref, ref } from 'vue';
import { KeyPair as SodiumKeyPair } from 'libsodium-wrappers';
import { entropyToMnemonic } from '@jimber/simple-bip39';
import { IPkidV2AppWallet, IPkidV2ImportedWallet } from 'shared-types/src/interfaces/global/pkid.interfaces';

export const initializedUser = ref<string | null>();
export const appSeedPhrase: Ref<string> = ref<string>() as Ref<string>;
export const appSeed: Ref<Uint8Array> = ref<Uint8Array>() as Ref<Uint8Array>;
export const appKeyPair: Ref<SodiumKeyPair> = ref<SodiumKeyPair>() as Ref<SodiumKeyPair>;

export const getSeedPhraseFromPkidWallet = (wallet: IPkidV2ImportedWallet | IPkidV2AppWallet) => {
    const isImported = 'seed' in wallet;

    if (!isImported) {
        return appSeedPhrase.value;
    }

    // @ts-ignore
    let entropyInput = new Uint8Array((wallet as PkidV2ImportedWallet).seed?.data);
    if (entropyInput.length === 0) {
        entropyInput = (wallet as IPkidV2ImportedWallet).seed;
    }
    if (entropyInput.length === 0) {
        throw new Error('No entropy available');
    }
    return isImported ? entropyToMnemonic(entropyInput) : appSeedPhrase.value;
};
