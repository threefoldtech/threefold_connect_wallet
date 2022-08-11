import { ref } from 'vue';
import flagsmith from 'flagsmith';
import axios from 'axios';
import { SubstrateFarmDto } from '@/modules/Core/types/substrate.types';
import { getSubstrateApi } from 'tf-substrate/src/services/core.substrate';
import { ChainTypes, IAssetBalance } from 'shared-types';

export const getSubstrateAssetBalances = async (publicKey: string): Promise<IAssetBalance[]> => {
    const api = await getSubstrateApi();

    const { data: balances }: any = await api.query.system.account(publicKey);
    const balance = balances.free.toJSON() / 1e7;

    const substrateBalance: IAssetBalance = {
        amount: Number(balance),
        name: 'TFT',
        type: ChainTypes.SUBSTRATE,
    };

    return [substrateBalance];
};

export const hex2a = (hex: string) => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
};

export const allFarms = ref<SubstrateFarmDto[]>([]);
export const twinIds = ref<Set<number>>(new Set());

export const fetchAllFarms = async () => {
    // const api = await getSubstrateApi();
    // const farmEntries = await api.query.tfgridModule.farms.entries();

    const query = `query farmQuery($twinIds: [Int!]) {
  farms(where: {twinID_in: $twinIds}) {
    name
    twin_id: twinID
    public_ips: publicIPs {
      ip
    }
    pricing_policy_id: pricingPolicyID
    id: farmID
    certification: certification
  }
}
`;
    const ids = [...twinIds.value.values()];

    const response = await axios.post(<string>flagsmith.getValue('tfchain_graphql_endpoint'), {
        query,
        variables: {
            twinIds: ids,
        },
    });

    const farms = response?.data?.data?.farms.map((farm: any) => {
        const newFarm = JSON.parse(JSON.stringify(farm));
        newFarm.public_ips = farm.public_ips.map((ip: any) => ip.ip);
        return newFarm;
    });
    // const farms = farmEntries.map(([, farm]) => {
    //     const newFarm = JSON.parse(JSON.stringify(farm));
    //     newFarm.name = bin2String((<any>farm)?.name);
    //     return <SubstrateFarmDto>newFarm;
    // });
    allFarms.value = farms;
};

export const activationServiceForSubstrate = async (id: string) => {
    const headers = { 'Content-Type': 'application/json' };

    const url = `${flagsmith.getValue('tfchain_activation_base_url')}/activation/activate`;
    const data = { substrateAccountID: id };

    await axios.post(url, data, { headers });

    while (true) {
        const balances = await getSubstrateAssetBalances(id);
        if (balances[0].amount > 0) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};

export const doesFarmExistByName = async (name: string): Promise<boolean> => {
    const api = await getSubstrateApi();
    const farm = await api.query.tfgridModule.farmIdByName(name);

    const readableFarm = farm.toJSON();
    return readableFarm != 0;
};
