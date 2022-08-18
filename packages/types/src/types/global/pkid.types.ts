export type PkidClient = {
    getDoc: (
        signPk: Uint8Array,
        key: string
    ) => Promise<{
        status: String;
        error?: String;
        success?: any;
        data: any;
        verified?: boolean;
        decrypted?: boolean;
        data_version?: number;
    }>;
    setDoc: (key: string, payload: any, willEncrypt: boolean, publicKey?: Uint8Array) => Promise<any>;
};
