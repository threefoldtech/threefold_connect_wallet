import axios from 'axios';
import flagsmith from 'flagsmith';
import { toNumber } from 'lodash';

export interface NodeRecord {
    timestamp: string;
    uptime: string;
    nodeId: number;
}

export const getNodeStatus = async (nodeId: number): Promise<NodeRecord | null> => {
    const query = `query NodeQuery($nodeId: Int) {
  uptimeEvents(where: {nodeID_eq: $nodeId, timestamp_lte: "1656675880", timestamp_gte: "1654044640"}, orderBy: timestamp_DESC, limit: 1) {
    timestamp
    uptime
    nodeID
  }
}
`;

    const response = await axios.post(<string>flagsmith.getValue('tfchain_graphql_endpoint'), {
        query,
        variables: {
            nodeId: nodeId,
        },
    });

    const record = response?.data?.data?.uptimeEvents[0];

    return record ? record : null;
};

export const isNodeOnline = async (eventTimestamp: string): Promise<boolean> => {
    const ts = toNumber(eventTimestamp);
    const currentTimestamp = toNumber(new Date().getTime() / 1000).toFixed(0);

    console.log(ts);
    console.log(currentTimestamp);
    return false;
};
