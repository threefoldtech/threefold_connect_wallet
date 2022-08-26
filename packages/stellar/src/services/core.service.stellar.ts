import { Server } from 'stellar-sdk';

const stellarUrl = 'https://horizon.stellar.org';

let serverCache;

export const getStellarClient = () => {
    if (serverCache) return serverCache;

    serverCache = new Server(stellarUrl);
    return serverCache;
};
