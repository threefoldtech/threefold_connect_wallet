const INT_UPPERLIMIT = 18446744073709552000; // don't worry

const bytesFromInt = (num: any, order: 'little' | 'big' = 'little') => {
    const buf = [
        num & 0x00000000000000ff,
        (num & 0x000000000000ff00) >> 8,
        (num & 0x0000000000ff0000) >> 16,
        (num & 0x00000000ff000000) >> 24,
        (num & 0x000000ff00000000) >> 32,
        (num & 0x0000ff0000000000) >> 40,
        (num & 0x00ff000000000000) >> 48,
        (num & 0xff00000000000000) >> 56,
    ];

    if (order == 'big') {
        return new Uint8Array(buf.reverse());
    }
    return new Uint8Array(buf);
};

const concat = (a: Uint8Array, b: Uint8Array) => {
    const c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
};

export class SiaBinaryEncoder {
    public data = new Uint8Array();

    public reset() {
        this.data = new Uint8Array();
    }

    public addInt(value: number) {
        if (value < 0) {
            throw Error('integer is out of lower range of 0');
        }
        if (value > INT_UPPERLIMIT) {
            throw Error('integer is out of upper range');
        }
        const bytes = bytesFromInt(value);

        this.data = concat(this.data, bytes);
    }

    public addArray(value: Uint8Array) {
        this.data = concat(this.data, value);
    }
}
