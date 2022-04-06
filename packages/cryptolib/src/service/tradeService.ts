import { Asset, Keypair, Operation, OperationOptions, TransactionBuilder, xdr } from 'stellar-sdk';
import { Currencies, getConfig, loadAccount, submitFundedTransaction } from './stellarService';

const getTradeOperation = (
    currencies: Currencies,
    sellAssetCode: string,
    buyAssetCode: string,
    amount: number,
    price: number,
    offerId: number
) => {
    const sellAsset = new Asset(currencies[sellAssetCode].asset_code, currencies[sellAssetCode].issuer);
    const buyAsset = new Asset(currencies[buyAssetCode].asset_code, currencies[buyAssetCode].issuer);
    const sellOfferOptions: OperationOptions.ManageSellOffer = {
        amount: amount.toFixed(7),
        buying: buyAsset,
        price: price.toFixed(7),
        selling: sellAsset,
        offerId,
    };
    return Operation.manageSellOffer(sellOfferOptions);
};

export const helloWorld = () => {
    console.log('helloWorld');
};

export const sellAssetForTft = async (
    keyPair: Keypair,
    sellAssetCode: string,
    price: number,
    amount: number,
    offerId: number = 0
): Promise<{ closed: boolean; offerId?: number }> => {
    const account = await loadAccount(keyPair);
    const { currencies, server, network } = getConfig();

    const fee = await server.fetchBaseFee();
    const transactionBuilder = new TransactionBuilder(account, {
        fee: '0',
        networkPassphrase: network,
    });
    const buyAssetCode = 'TFT';
    const operation = getTradeOperation(currencies, sellAssetCode, buyAssetCode, amount, price, offerId);
    transactionBuilder.addOperation(operation);

    transactionBuilder.setTimeout(3000);

    const transaction = transactionBuilder.build();

    // fee_bump
    const data = await submitFundedTransaction(transaction, keyPair);

    if (amount === 0) {
        return {
            closed: true,
        };
    }

    const transactionhash = data?.transactionhash;

    if (!transactionhash) {
        throw new Error('transaction not found');
    }

    if (amount === 0) {
        return {
            closed: true,
        };
    }

    const submittedTransactionCallBuilder = server.transactions().includeFailed(true).transaction(transactionhash);

    const submittedTransaction = await submittedTransactionCallBuilder.call();

    const resultXdr = submittedTransaction.result_xdr;
    const result = xdr.TransactionResult.fromXDR(resultXdr, 'base64');

    const manageOfferSuccessResult = result
        ?.result()
        ?.innerResultPair()
        ?.result()
        ?.result()
        ?.results()?.[0]
        ?.tr()
        ?.manageSellOfferResult()
        ?.success();

    const submitedOfferId = manageOfferSuccessResult?.offer()?.offer()?.offerId()?.low;

    if (!submitedOfferId && manageOfferSuccessResult?.offersClaimed().length >= 1) {
        return {
            closed: true,
        };
    }
    if (!submitedOfferId) throw new Error('no offer id found');

    return { closed: false, offerId: submitedOfferId };
};

export const sellTft = async (
    keyPair: Keypair,
    buyAssetCode: string,
    price: number,
    amount: number,
    offerId: number = 0
) => {
    // @todo
    throw new Error('not yet implemented');
};

export const getOpenTradeOffers = async (keyPair: Keypair) => {
    const account = await loadAccount(keyPair);
    const tradeOffers = await account.offers();
    return tradeOffers.records;
};

export const closeTradeOffer = async (keyPair: Keypair, offerid: number) => {
    const openTradeOffers = await getOpenTradeOffers(keyPair);

    const existingTradeOffer = openTradeOffers.find(openTradeOffer => Number(openTradeOffer.id) === offerid);

    if (!existingTradeOffer) {
        throw new Error(`offerid not found: ${offerid}`);
    }

    await sellAssetForTft(
        keyPair,
        <string>existingTradeOffer.selling?.asset_code,
        Number(existingTradeOffer.price),
        0,
        offerid
    );
};
