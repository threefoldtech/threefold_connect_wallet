export const gqlGetAllFarms = `query MyQuery($stellarAddresses: [String!]) {
  farms(where: {stellarAddress_in: $stellarAddresses}) {
    name
    farmID
    stellarAddress
    twinID
  }
}`;

export const gqlGetNodesByFarmId = `query MyQuery($farmId: Int ) { nodes(where: {farmID_eq: $farmId}) {
    nodeID
  }
}`;

export const gqlGetAllFarmsByPayoutAddress = `query farmQuery($stellarAddresses: [String!]) {
  farms(where: {stellarAddress_in: $stellarAddresses}) {
    name
    twin_id: twinID
    id: farmID
  }
}`;

export const gqlGetAllTwinIds = `query MyQuery($substrateAddresses: [String!]) {
  twins(where: {accountID_in: $substrateAddresses}) {
    twinID
  }
}`;
