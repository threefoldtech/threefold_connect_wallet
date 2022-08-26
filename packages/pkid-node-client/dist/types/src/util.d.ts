export declare const encrypt: <T>(json: T, publicKey: Uint8Array) => Promise<string>;
export declare const decrypt: (ciphertext: string, publicKey: Uint8Array, privateKey: Uint8Array) => Promise<string>;
export declare const sign: (message: string | Uint8Array, privateKey: Uint8Array) => Uint8Array;
export declare const signEncode: <T>(payload: T, privateKey: Uint8Array) => string;
export declare const encodeHex: (byteArray: any) => string;
export declare const generateKeypair: () => Promise<import("libsodium-wrappers").KeyPair>;
