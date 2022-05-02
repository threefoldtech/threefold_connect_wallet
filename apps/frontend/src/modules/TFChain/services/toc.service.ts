// Method to check if a specific user by substrateId has their terms and conditions accepted
// Returns a boolean
import { KeyringPair } from '@polkadot/keyring/types';
import flagsmith from 'flagsmith';
import { isSubstrateBalanceAvailable } from '@/modules/Currency/services/currencyService';
import {
    activationServiceForSubstrate,
    getSubstrateApi,
    submitExtrensic,
} from '@/modules/TFChain/services/tfchainService';

export const hasAcceptedTermsAndConditions = async (id: string): Promise<boolean> => {
    const api = await getSubstrateApi();

    const listTermsAndConditions = (await api.query.tfgridModule.usersTermsAndConditions(id)).toJSON();

    return Object.keys(listTermsAndConditions as Object).length > 0;
};

// Method to check if a specific user by substrateId has their terms and conditions accepted
// Returns a boolean
export const checkIfTermsAndConditionsAreAccepted = async (id: string, retries = 0): Promise<boolean> => {
    const api = await getSubstrateApi();

    while (retries < 10) {
        const listTermsAndConditions = (await api.query.tfgridModule.usersTermsAndConditions(id)).toJSON();

        if (Object.keys(listTermsAndConditions as Object).length > 0) {
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        await checkIfTermsAndConditionsAreAccepted(id, (retries += 1));
    }

    return false;
};

// Sign terms and condition to blockchain
// Returns a boolean for success
export const signTermsAndConditions = async (keyRing: KeyringPair): Promise<boolean> => {
    const termsAndConditionsUrl = <string>flagsmith.getValue('farm_terms_and_conditions_url');
    const api = await getSubstrateApi();

    try {
        const submittableExtrinsic = api.tx.tfgridModule.userAcceptTc(termsAndConditionsUrl, 'NO_HASH');
        await submitExtrensic(submittableExtrinsic, keyRing);
        return true;
    } catch {
        console.error('Unable to sign terms and conditions');
        return false;
    }
};

// Accept terms and conditions for a specific user by substrateId
export const acceptTermsAndConditions = async (keyRing: KeyringPair) => {
    // Using activation service to make sure we have balance available
    await activationServiceForSubstrate(keyRing.address);

    // Check if balance is available => if no throw error
    const isBalanceAvailable = isSubstrateBalanceAvailable(keyRing.address);
    if (!isBalanceAvailable) throw new Error('Unable to load substrate balance');

    // Sign terms and conditions to blockchain
    const signed = await signTermsAndConditions(keyRing);
    if (!signed) throw new Error('Unable to sign terms and conditions');

    // Getting terms and conditions
    const accepted = await checkIfTermsAndConditionsAreAccepted(keyRing.address);
    if (!accepted) throw new Error("Can't fetch signed terms and conditions");
};
