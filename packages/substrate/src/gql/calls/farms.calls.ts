import {
    gqlDoesFarmExistByName,
    gqlGetAllFarms,
    gqlGetAllNodesOfFarms,
    gqlGetAllTwinIds,
} from '../queries/farm.queries';
import axios from 'axios';
import { IGqlFarm, IGqlNode, IGqlTwin } from 'shared-types/src/interfaces/substrate/farm.interfaces';

const gqlEndpoint = 'https://graph.grid.tf/graphql';

export const getAllNodesOfFarms = async (farmIds: number[]): Promise<IGqlNode[]> => {
    if (farmIds.length == 0) return [];

    const query = gqlGetAllNodesOfFarms;

    const response = await axios.post(gqlEndpoint, {
        query,
        variables: {
            farmIds: farmIds,
        },
    });

    const nodes = response?.data?.data?.nodes;

    if (nodes.length === 0) {
        return [];
    }

    return nodes.map((nodes: any) => {
        return {
            nodeId: nodes.nodeID,
            farmId: nodes.farmID,
        };
    });
};

export const getAllFarmsFromWallets = async (twinIds: number[], addresses: string[]): Promise<IGqlFarm[]> => {
    if (addresses.length == 0 || twinIds.length == 0) return [];

    const query = gqlGetAllFarms;

    const response = await axios.post(gqlEndpoint, {
        query,
        variables: {
            twinIds: twinIds,
            stellarAddresses: addresses,
        },
    });

    const farms = response?.data?.data?.farms;
    return farms.map((farm: any) => {
        return {
            name: farm.name,
            farmId: farm.farmID,
            twinId: farm.twinID,
            stellarAddress: farm.stellarAddress,
        };
    });
};

export const getAllTwinIds = async (substrateAddresses: string[]): Promise<IGqlTwin[]> => {
    if (substrateAddresses.length == 0) return [];

    const query = gqlGetAllTwinIds;

    const response = await axios.post(gqlEndpoint, {
        query,
        variables: {
            substrateAddresses: substrateAddresses,
        },
    });

    const twins = response?.data?.data?.twins;

    if (twins.length === 0) {
        return [];
    }

    return twins.map((twin: any) => {
        return {
            substrateAddress: twin.accountID,
            twinId: twin.twinID,
        };
    });
};

export const doesFarmExistByName = async (name: string): Promise<boolean> => {
    if (!name) return true;

    const query = gqlDoesFarmExistByName;

    const response = await axios.post(gqlEndpoint, {
        query,
        variables: {
            name: name,
        },
    });

    const farm = response?.data?.data?.farms;
    return farm.length !== 0;
};
