export const hexToBytes = (hexString: string): Uint8Array => {
    // @ts-ignore
    return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
};

export const bytesToHex = (bytes: Uint8Array): string => {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};
export const bin2String = (array: any[]) => {
    if (typeof array !== 'object') return;
    return String.fromCharCode.apply(String, array);
};
