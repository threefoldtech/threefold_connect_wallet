import { Server } from 'stellar-sdk';
import flagsmith from 'flagsmith';

export const getStellarClient = () => {
    return new Server('https://horizon.stellar.org/');
    // return new Server(<string>flagsmith.getValue('stellar-url'));
};
