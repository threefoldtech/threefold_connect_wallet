import flagsmith from 'flagsmith';
import { buildFundedPaymentTransaction, submitFundedTransaction } from 'cryptolib';
import { Keypair } from 'stellar-sdk';
import { acceptTermsAndConditions, hasAcceptedTermsAndConditions } from '@/modules/TFChain/services/toc.service';
import { KeyringPair } from '@polkadot/keyring/types';
import { addTwin, getTwinId } from '@/modules/TFChain/services/twin.service';

export const bridgeToSubstrate = async (substrateKeyRing: KeyringPair, stellarKeyPair: Keypair, amount: number) => {
    const toc = await hasAcceptedTermsAndConditions(substrateKeyRing.address);
    if (!toc) {
        await acceptTermsAndConditions(substrateKeyRing);

        const accepted = await hasAcceptedTermsAndConditions(substrateKeyRing.address);
        if (!accepted) throw new Error('Terms and conditions not accepted');
    }

    const twinId = await getTwinId(substrateKeyRing.address);
    if (twinId === 0) {
        await addTwin(substrateKeyRing);

        const newTwin = await getTwinId(substrateKeyRing.address);
        if (newTwin === 0) throw new Error('No twin id');
    }

    await bridgeTokens(stellarKeyPair, substrateKeyRing, amount);
};

export const bridgeTokens = async (stellarKeyPair: Keypair, substrateKeyRing: KeyringPair, amount: number) => {
    const twinId = await getTwinId(substrateKeyRing.address);

    const addressTo = flagsmith.getValue('stellar-bridge-address').toString();
    if (!addressTo) throw Error('No bridge address');

    const memo = 'twin_' + twinId;

    const fundedTransaction = await buildFundedPaymentTransaction(stellarKeyPair, addressTo, amount, memo, 'TFT');
    return await submitFundedTransaction(fundedTransaction, stellarKeyPair);
};
