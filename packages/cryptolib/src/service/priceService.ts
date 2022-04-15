import axios from 'axios';
import { getConfig } from './stellarService';
import { Asset } from 'stellar-sdk';

type TickerData = {
    error: string[];
    result: {
        [key: string]: {
            p: [string, string];
        };
    };
};
export const getPairPrice = async (assetPair: string): Promise<number> => {
    //@todo: should be moved to config
    const krakenAPIEndpoint = 'https://api.kraken.com/';
    const response = await axios.get(krakenAPIEndpoint + '0/public/Ticker?pair=' + assetPair);

    const data: TickerData = response.data;
    if (data.error.length >= 1) {
        throw new Error(data.error[0]);
    }

    const number = Number(data?.result?.[assetPair]?.p[0]);

    if (!number) {
        throw new Error('no price found');
    }

    return number;
};

export const getPairOfferAveragePrice = async (sellAssetCode: string, buyAssetCode: string): Promise<number> => {
    //@todo: should average something like https://laboratory.stellar.org/#explorer?resource=trade_aggregations&endpoint=all&values=eyJiYXNlX2Fzc2V0Ijp7InR5cGUiOiJuYXRpdmUiLCJjb2RlIjoiIiwiaXNzdWVyIjoiIn0sImNvdW50ZXJfYXNzZXQiOnsidHlwZSI6ImNyZWRpdF9hbHBoYW51bTQiLCJjb2RlIjoiQlRDIiwiaXNzdWVyIjoiR0NOU0dIVUNHNVZNR0xUNVJJWVlaU083VlFVTFFLQUo2MlFBMzNEQkM1UFBCU081N0xGV1ZWNlAifSwiZW5kX3RpbWUiOiIxNjE4MzAwOTQwMDAwIiwic3RhcnRfdGltZSI6IjE2MTgyMTQ1NDAwMDAiLCJyZXNvbHV0aW9uIjoiNjAwMDAifQ%3D%3D&network=public
    throw new Error('not implemented yet');
    // const { server, currencies } = getConfig();
    // const sellAsset = new Asset(currencies[sellAssetCode].asset_code, currencies[sellAssetCode].issuer);
    // const buyAsset = new Asset(currencies[buyAssetCode].asset_code, currencies[buyAssetCode].issuer);
    // server.tradeAggregation().selling(sellAsset).buying(buyAsset);
};
