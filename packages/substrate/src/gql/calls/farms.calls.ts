import {
    gqlDoesFarmExistByName,
    gqlGetAllFarms,
    gqlGetAllFarmsBasedOnStellar,
    gqlGetAllFarmsBasedOnTwinIds,
    gqlGetAllNodesOfFarms,
    gqlGetAllTwinIds,
    gqlUptimeQuery,
} from '../queries/farm.queries';
import axios from 'axios';
import { IGqlFarm, IGqlNode, IGqlTwin } from 'shared-types/src/interfaces/substrate/farm.interfaces';
import flagsmith from 'flagsmith';

const getGqlUrl = (): string => {
    return <string>flagsmith.getValue('tfchain_graphql_endpoint');
};

export const getAllNodesOfFarms = async (farmIds: number[]): Promise<IGqlNode[]> => {
    if (farmIds.length == 0) return [];

    const query = gqlGetAllNodesOfFarms;

    const response = await axios.post(getGqlUrl(), {
        query,
        variables: {
            farmIds: farmIds,
        },
    });

    const nodes = response?.data?.data?.nodes;

    if (nodes.length === 0) {
        return [];
    }

    const nodeIds = nodes.map((node: any) => node.nodeID);

    const mappedNodes = nodes.map((node: any) => {
        return {
            nodeId: node.nodeID,
            farmId: node.farmID,
        };
    });

    // Checking uptime
    const uptimeResponse = await axios.post(getGqlUrl(), {
        query: gqlUptimeQuery,
        variables: {
            nodes: nodeIds,
        },
    });

    const uptimeEvents = uptimeResponse?.data?.data?.uptimeEvents;

    if (uptimeEvents.length == 0) return mappedNodes;

    const lastSeen = uptimeEvents[0].timestamp;
    const timestamp = Math.round(new Date().getTime() / 1000);

    const isOnline = timestamp - lastSeen < 7200;
    return mappedNodes.map((node: IGqlNode) => {
        return {
            ...node,
            isOnline: isOnline,
        };
    });
};

export const getAllFarmsFromWallets = async (twinIds: number[], addresses: string[]): Promise<IGqlFarm[]> => {
    if (addresses.length == 0 && twinIds.length == 0) return [];

    let query;

    if (addresses.length != 0) {
        query = gqlGetAllFarmsBasedOnTwinIds;
    }

    if (twinIds.length != 0) {
        query = gqlGetAllFarmsBasedOnStellar;
    }

    if (twinIds.length != 0 && addresses.length != 0) {
        query = gqlGetAllFarms;
    }

    const response = await axios.post(getGqlUrl(), {
        query,
        variables: {
            twinIds: twinIds,
            stellarAddresses: addresses,
        },
    });

    const farms = response?.data?.data?.farms;

    if (!farms) {
        return [];
    }

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

    const response = await axios.post(getGqlUrl(), {
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

    const response = await axios.post(getGqlUrl(), {
        query,
        variables: {
            name: name,
        },
    });

    const farm = response?.data?.data?.farms;
    return farm.length !== 0;
};
