import { Keypair as StellarKeypair } from 'stellar-base';
import flagsmith from 'flagsmith';
import { buildFundedPaymentTransaction, submitFundedTransaction } from 'cryptolib';

export const bridgeToSubstrate = async (amount: number, stellarKeyPair: StellarKeypair, entityId: any) => {
    try {
        const stellarBridgeAddress: string = flagsmith.getValue('stellar-bridge-address').toString();

        if (!stellarBridgeAddress) return;
        console.info('Bridging to address', stellarBridgeAddress);

        const amountToTransfer = Number(amount);
        const memoToIncludeWithTransaction = 'entity_' + entityId;

        const fundedTransaction = await buildFundedPaymentTransaction(
            stellarKeyPair,
            stellarBridgeAddress,
            amountToTransfer,
            memoToIncludeWithTransaction,
            'TFT'
        );

        console.info('submitFundedTransaction');

        const fundedTransactionResponse = await submitFundedTransaction(fundedTransaction, stellarKeyPair);

        console.info('Receiving response: ', fundedTransactionResponse);
    } catch (e) {
        console.error('Error in bridgeToSubstrate', e);
        throw new Error();
    }
};
