import { IKeyringPair } from '@polkadot/types/types/interfaces';
import {
    addStellarPayoutAddressOnSubstrate,
    createFarmOnSubstrate,
    createTwinOnSubstrate,
    signUsersTermsAndConditionsOnSubstrate,
} from '../extrinsics/grid.extrinsics';
import { activateSubstrateAccount } from './balance.service.substrate';
import {
    isAccountActivated,
    isFarmCreated,
    isTermsAndConditionsAccepted,
    isTwinCreated,
} from './check.service.substrate';

// Activation for account to provide small amount of TFT to post data to the chain
export const activateAccount = async (accountId: string, activationUrl: string): Promise<boolean> => {
    const couldActivate = await activateSubstrateAccount(accountId, activationUrl);
    console.log('Can activate account: ', couldActivate);
    if (!couldActivate) {
        console.error('[Could not activate account]');
        return false;
    }

    const isActivated = await isAccountActivated(accountId);
    console.log('Is the account activated: ', isActivated);
    if (!isActivated) {
        console.error('[Account is not activated]');
        return false;
    }

    return true;
};

export const signAndAcceptTermsAndConditions = async (
    keyRing: IKeyringPair,
    termsAndConditionsUrl: string
): Promise<boolean> => {
    const signProceed = await signUsersTermsAndConditionsOnSubstrate(keyRing, termsAndConditionsUrl);
    console.log('Is the sign proceed: ', signProceed);
    if (!signProceed) {
        console.error('[Sign TAC did not proceed]');
        return false;
    }

    const isAccepted = await isTermsAndConditionsAccepted(keyRing.address, termsAndConditionsUrl, 0);
    console.log('Are the TAC accepted: ', isAccepted);
    if (!isAccepted) {
        console.error('TAC not accepted');
        return false;
    }

    return true;
};

export const createTwin = async (keyRing: IKeyringPair): Promise<boolean> => {
    const isTwinAdded = await createTwinOnSubstrate(keyRing);
    console.log('Is twin added: ', isTwinAdded);
    if (!isTwinAdded) {
        console.error('[Could not add twin]');
        return false;
    }

    const isCreated = await isTwinCreated(keyRing);
    console.log('Is twin created: ', isCreated);
    if (!isCreated) {
        console.error('[Twin is not created]');
        return false;
    }

    return true;
};

export const createFarm = async (keyRing: IKeyringPair, name: string): Promise<boolean> => {
    const createSuccess = await createFarmOnSubstrate(keyRing, name);
    console.log('Could create farm: ', createSuccess);
    if (!createSuccess) {
        console.error('[The farm is not created on chain]');
        return false;
    }

    const isCreated = await isFarmCreated(name, 0);
    console.log('Is the farm created: ', isCreated);
    if (!isCreated) {
        console.error('[The farm is not created]');
        return false;
    }

    return true;
};

export const addStellarPayoutAddress = async (
    keyRing: IKeyringPair,
    stellarAddress: string,
    farmId: number
): Promise<boolean> => {
    const addressSuccess = await addStellarPayoutAddressOnSubstrate(keyRing, stellarAddress, farmId);

    console.log('Added address with success: ', addressSuccess);
    if (!addressSuccess) {
        console.error('[Could not add stellar address]');
        return false;
    }

    return true;
};
