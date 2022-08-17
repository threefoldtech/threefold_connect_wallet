export const gqlGetAllFarms = `query MyQuery($twinIds: [Int!], $stellarAddresses: [String!]) {
  farms(where: {twinID_in: $twinIds, OR:  { stellarAddress_in: $stellarAddresses} }) {
    name
    farmID
    stellarAddress
    twinID
  }
}`;

export const gqlGetAllNodesOfFarms = `query MyQuery($farmIds: [Int!]) {
  nodes(where: {farmID_in: $farmIds}) {
    nodeID
    farmID
  }
}
`;

export const gqlGetAllTwinIds = `query MyQuery($substrateAddresses: [String!]) {
  twins(where: {accountID_in: $substrateAddresses}) {
    twinID
    accountID
  }
}`;

export const gqlDoesFarmExistByName = `query MyQuery($name: String) {
  farms(where: {name_eq: $name}) {
    id
    name
  }
}`;

export const gqlUptimeQuery = `query MyQuery($nodes: [Int!]) {
  uptimeEvents(where: {nodeID_in: $nodes}, limit: 1, orderBy: timestamp_DESC) {
    nodeID
    timestamp
  }
}`;
