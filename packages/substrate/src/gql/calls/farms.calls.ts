import { gqlGetAllFarms, gqlGetAllTwinIds, gqlGetNodesByFarmId } from '../queries/farm.queries';
import axios from 'axios';
import { IGqlFarm, IGqlNode } from 'shared-types/src/interfaces/substrate/farm.interfaces';

const gqlEndpoint = 'https://graph.grid.tf/graphql';

export const getNodesByFarmId = async (farmId: number): Promise<IGqlNode[]> => {
    const query = gqlGetNodesByFarmId;
    const response = await axios.post(gqlEndpoint, {
        query,
        variables: {
            farmId: farmId,
        },
    });

    const nodes = response?.data?.data?.nodes;

    if (nodes.length === 0) {
        return [];
    }

    return nodes.map((node: any) => {
        return {
            nodeId: node.nodeID,
        };
    });
};

export const getAllFarmsFromWallets = async (stellarAddresses: string[]): Promise<IGqlFarm[]> => {
    const query = gqlGetAllFarms;

    const response = await axios.post(gqlEndpoint, {
        query,
        variables: {
            stellarAddresses: stellarAddresses,
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

export const getAllTwinIds = async (substrateAddresses: string[]): Promise<number[]> => {
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

    return twins.map((twin: any) => twin.twinID);
};
