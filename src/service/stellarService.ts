import { Server } from 'stellar-sdk';
import flagsmith from 'flagsmith';

export const getStellarClient = () => {
    return new Server('https://horizon.stellar.org/');
};
