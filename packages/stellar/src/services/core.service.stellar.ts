import { Server } from 'stellar-sdk';
import flagsmith from 'flagsmith';

let serverCache;

export const getStellarClient = () => {
    if (serverCache) return serverCache;

    const stellarUrl = <string>flagsmith.getValue('stellar-url');

    serverCache = new Server(stellarUrl);
    return serverCache;
};
