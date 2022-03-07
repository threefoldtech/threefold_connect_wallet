import { Ref, ref } from 'vue';
import { KeyPair as SodiumKeyPair } from 'libsodium-wrappers';

export const userInitialized = ref<string | null>();
export const appSeedPhrase: Ref<string> = ref<string>() as Ref<string>;
export const appSeed: Ref<Uint8Array> = ref<Uint8Array>() as Ref<Uint8Array>;
export const appKeyPair: Ref<SodiumKeyPair> = ref<SodiumKeyPair>() as Ref<SodiumKeyPair>;
