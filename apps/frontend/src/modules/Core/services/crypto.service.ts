import { Ref, ref } from 'vue';
import { KeyPair as SodiumKeyPair } from 'libsodium-wrappers';
import { PkidV2AppWallet, PkidV2ImportedWallet } from '@/modules/Pkid/interfaces/pkid.interfaces';
import { entropyToMnemonic } from '@jimber/simple-bip39';

export const initializedUser = ref<string | null>();
export const appSeedPhrase: Ref<string> = ref<string>() as Ref<string>;
export const appSeed: Ref<Uint8Array> = ref<Uint8Array>() as Ref<Uint8Array>;
export const appKeyPair: Ref<SodiumKeyPair> = ref<SodiumKeyPair>() as Ref<SodiumKeyPair>;

export const getSeedPhraseFromPkidWallet = (wallet: PkidV2ImportedWallet | PkidV2AppWallet) => {
    const isImported = 'seed' in wallet;

    if (!isImported) {
        return appSeedPhrase.value;
    }

    // @ts-ignore
    let entropyInput = new Uint8Array((wallet as PkidV2ImportedWallet).seed?.data);
    if (entropyInput.length === 0) {
        entropyInput = (wallet as PkidV2ImportedWallet).seed;
    }
    if (entropyInput.length === 0) {
        throw new Error('No entropy available');
    }
    return isImported ? entropyToMnemonic(entropyInput) : appSeedPhrase.value;
};
