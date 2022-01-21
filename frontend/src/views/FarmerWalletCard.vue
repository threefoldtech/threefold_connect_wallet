<template>
    <li
        :key="wallet.keyPair.getBasePublicKey()"
        class="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200 relative"
    >
        <div
            v-if="loading"
            class="bg-slate-600/80 absolute rounded-lg inset-0 z-50 flex items-center justify-center text-white text-2xl"
        >
            <div class="text-center">
                <svg
                    class="animate-spin h-32 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path
                        class="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        fill="currentColor"
                    ></path>
                </svg>
                <h2 class="mt-4">loading</h2>
                <h3 v-if="subtitle">{{ subtitle }}</h3>
            </div>
        </div>
        <div
            v-if="!loading && termsandcondition.length === 0"
            class="bg-white absolute rounded-lg inset-0 z-50 flex flex-col text-2xl p-4"
        >
            <div class="flex flex-col gap-2">
                <div class="text-black">
                    {{ wallet.name }}
                </div>
                <pre>{{ termsandcondition }}</pre>
                <hr class="border-gray-300" />
                <h2 class="mt-4">You have to accept to the terms and conditions</h2>
                <SwitchGroup as="div" class="flex items-center justify-between">
                    <span class="flex-grow flex flex-col">
                        <SwitchLabel as="span" class="text-sm font-medium text-gray-900"
                            >Terms & Conditions</SwitchLabel
                        >
                        <SwitchDescription as="span" class="text-sm text-gray-500"
                            >I have read and accept the
                            <a
                                class="inline underline decoration-primary-600 decoration-2 focus:outline-none focus:text-primary-600 focus:font-semibold"
                                tabindex="0"
                                @click.stop.prevent="showTerms()"
                            >
                                terms and conditions
                            </a>
                        </SwitchDescription>
                    </span>
                    <Switch
                        v-model="termsAndConditionsIsAccepted"
                        :class="[
                            termsAndConditionsIsAccepted ? 'bg-primary-600' : 'bg-gray-200',
                            'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
                        ]"
                    >
                        <span
                            :class="[
                                termsAndConditionsIsAccepted ? 'translate-x-5' : 'translate-x-0',
                                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                            ]"
                            aria-hidden="true"
                        />
                    </Switch>
                </SwitchGroup>
                <button
                    :disabled="!termsAndConditionsIsAccepted"
                    class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-500"
                    type="button"
                    @click="acceptTermsAndConditions()"
                >
                    Confirm
                </button>
            </div>
        </div>

        <div class="w-full flex items-center justify-between p-6 space-x-6">
            <div class="flex-1 truncate">
                <div class="flex items-center space-x-3">
                    <h3 class="text-gray-900 text-sm font-medium truncate font-semibold uppercase">
                        {{ wallet.name }}
                    </h3>
                    <span
                        class="flex-shrink-0 inline-block px-2 py-0.5 text-green-800 text-xs font-medium bg-green-100 rounded-full"
                        >{{ wallet.meta.type }}</span
                    >
                </div>
                <div class="mt-4">
                    <h2 class="">Stellar address</h2>
                    <div class="text-gray-500 text-sm break-all whitespace-normal">
                        {{ wallet.keyPair.getStellarKeyPair().publicKey() }}
                    </div>
                </div>
                <div class="mt-4">
                    <h2 class="">Substrate address</h2>
                    <span class="text-gray-500 text-sm break-all whitespace-normal">{{
                        wallet.keyPair.getSubstrateKeyring().address
                    }}</span>
                </div>
            </div>
        </div>
        <div class="p-6">
            <h2>Status</h2>

            <div>
                terms and conditions:
                <pre class="whitespace-pre-wrap break-all">{{ termsandcondition }}</pre>
            </div>
            <div>
                farms:
                <pre class="whitespace-pre-wrap break-all">{{ farms }}</pre>
            </div>
            <div>
                balance:
                <pre class="whitespace-pre-wrap break-all">{{ balance }}</pre>
            </div>
            <div>
                nodes:
                <pre class="whitespace-pre-wrap break-all">{{ nodes }}</pre>
            </div>
            <div v-if="isNumeric(twinId)">twinId: {{ twinId }}</div>
        </div>
        <div>
            <div v-if="!loading" class="-mt-px flex divide-x divide-gray-200">
                <div v-if="termsandcondition.length === 0" class="w-0 flex-1 flex">
                    <button
                        class="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                        @click="activate()"
                    >
                        <DocumentAddIcon aria-hidden="true" class="w-5 h-5 text-gray-400" />
                        <span class="ml-3">activate</span>
                    </button>
                </div>
                <div v-if="termsandcondition.length === 0" class="w-0 flex-1 flex">
                    <button
                        class="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                        @click="signTermsAndConditions()"
                    >
                        <DocumentAddIcon aria-hidden="true" class="w-5 h-5 text-gray-400" />
                        <span class="ml-3">i accept everything</span>
                    </button>
                </div>
                <div v-if="false" class="w-0 flex-1 flex">
                    <button
                        class="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                        @click="addTwin()"
                    >
                        <DocumentAddIcon aria-hidden="true" class="w-5 h-5 text-gray-400" />
                        <span class="ml-3">Add Twin</span>
                    </button>
                </div>
                <div class="w-0 flex-1 flex">
                    <button
                        class="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                        @click="addFarm()"
                    >
                        <DocumentAddIcon aria-hidden="true" class="w-5 h-5 text-gray-400" />
                        <span class="ml-3">addFarm</span>
                    </button>
                </div>
            </div>
            <div v-else class="p-6 animate-pulse">loading ...</div>
        </div>
    </li>

    <SiteModalFrame
        v-if="showTermsAndConditions"
        :src="termsAndConditionsUrl"
        title="Terms & Conditions"
        @close="showTermsAndConditions = false"
    />
</template>
<script lang="ts" setup>
    import { AssetBalance, Wallet } from '@/service/walletService';

    import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from '@headlessui/vue';
    import { DocumentAddIcon } from '@heroicons/vue/outline';
    import { ref } from 'vue';
    import {
        getSubstrateApi,
        getSubstrateAssetBalances,
        getTwinId,
        getUsersTermsAndConditions,
    } from '@/service/substrateService';
    import axios from 'axios';
    import { nanoid } from 'nanoid';
    import SiteModalFrame from '@/components/SiteModalFrame.vue';
    import flagsmith from 'flagsmith';
    import { bin2String } from '@/util/crypto';
    import { Horizon } from 'stellar-sdk';
    import AssetBalances = Horizon.AssetBalances;
    import { values } from 'lodash';

    interface IProps {
        wallet: Wallet;
    }

    const { wallet } = defineProps<IProps>();

    const loading = ref(true);
    const twinId = ref();
    const termsAndConditionsIsAccepted = ref(false);
    const termsandcondition = ref<any[]>([]);
    const showTermsAndConditions = ref(false);
    const farms = ref<any>([]);
    const subtitle = ref<string | undefined>();

    const acceptTermsAndConditions = async () => {
        subtitle.value = 'could take up to 10 seconds to go through';
        loading.value = true;

        const id = wallet.keyPair.getSubstrateKeyring().address;
        await activationServiceForSubstrate(id);

        //while no balance is available we wait
        while (true) {
            const balance = await getSubstrateAssetBalances(id);
            if (
                balance.filter((assetBalance: AssetBalance) => {
                    return assetBalance.amount >= 0;
                }).length > 0
            ) {
                console.log('balance is available');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        while (true) {
            try {
                await signTermsAndConditions();
                break;
            } catch (e) {
                console.error(e);
            }
        }

        do {
            await new Promise(resolve => setTimeout(resolve, 1000));
            termsandcondition.value = await getUsersTermsAndConditions(id);
        } while (termsandcondition.value.filter(t => t.document_link === termsAndConditionsUrl).length === 0);

        subtitle.value = 'refetching data';

        await init();
        subtitle.value = undefined;
    };

    const showTerms = () => {
        console.log('showTerms');
        showTermsAndConditions.value = true;
    };
    const isNumeric = (n: any) => !isNaN(parseFloat(n)) && isFinite(n);

    const termsAndConditionsUrl = flagsmith.getValue('farm_terms_and_conditions_url');
    const addFarm = async () => {
        await addTwin();
        loading.value = true;
        subtitle.value = 'creating farm';

        const currentAmountOfFarms = farms.value.length;
        const api = await getSubstrateApi();
        const submittableExtrinsic = api.tx.tfgridModule.createFarm(`testFarm-${nanoid()}`, []);
        const result = await submittableExtrinsic.signAndSend(wallet.keyPair.getSubstrateKeyring());

        //while no balance is available we wait

        while (true) {
            const allFarms = await api.query.tfgridModule.farms.entries();
            //@ts-ignore
            const tempFarm = allFarms.filter(([, farm]) => farm.twin_id.words[0] === twinId.value);
            //@ts-ignore
            farms.value = tempFarm.map(([, farm]) => {
                const newFarm = JSON.parse(JSON.stringify(farm));
                //@ts-ignore
                newFarm.name = bin2String(farm.name);
                return newFarm;
            });
            if (farms.value.length > currentAmountOfFarms) {
                console.log('farm created');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(result);
        subtitle.value = 'refetching data';

        await init();
    };

    const signTermsAndConditions = async () => {
        const api = await getSubstrateApi();
        const submittableExtrinsic = api.tx.tfgridModule.userAcceptTc(termsAndConditionsUrl, 'NO_HASH');
        const result = await submittableExtrinsic.signAndSend(wallet.keyPair.getSubstrateKeyring());
    };

    const addTwin = async () => {
        loading.value = true;
        subtitle.value = 'creating twin';
        const api = await getSubstrateApi();
        const submittableExtrinsic = api.tx.tfgridModule.createTwin(nanoid());
        const result = await submittableExtrinsic.signAndSend(wallet.keyPair.getSubstrateKeyring());

        while (true) {
            twinId.value = await getTwinId(wallet.keyPair.getSubstrateKeyring().address);
            if (twinId.value !== 0) {
                console.log('twinId', twinId.value);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        subtitle.value = 'refetching data';

        await init();
    };

    const activate = () => {
        activationServiceForSubstrate(wallet.keyPair.getSubstrateKeyring().address);
    };
    const activationServiceForSubstrate = async (id: string) => {
        const headers = {
            'Content-Type': 'application/json',
        };

        const url = 'https://activation.test.grid.tf/activation/activate';
        const data = { substrateAccountID: id };

        const response = await axios.post(url, data, { headers });

        return response;
    };

    const balance = ref();
    const nodes = ref();
    const init = async () => {
        const address = wallet.keyPair.getSubstrateKeyring().address;
        balance.value = await getSubstrateAssetBalances(address);

        const api = await getSubstrateApi();
        console.log(api.tx.tfgridModule);

        termsandcondition.value = await getUsersTermsAndConditions(address);

        const allFarms = await api.query.tfgridModule.farms.entries();

        // termsandcondition.value = await api.query.tfgridModule.usersTermsAndConditions(address);

        twinId.value = await getTwinId(address);

        console.log(allFarms);
        //@ts-ignore
        const tempFarm = allFarms.filter(([, farm]) => farm.twin_id.words[0] === twinId.value);
        //@ts-ignore
        farms.value = tempFarm.map(([, farm]) => {
            const newFarm = JSON.parse(JSON.stringify(farm));
            //@ts-ignore
            newFarm.name = bin2String(farm.name);
            return newFarm;
        });

        // get array of id's from farms
        const farmIds = JSON.parse(JSON.stringify(farms.value.map((farm: any) => farm.id)));
        const allNodes = await api.query.tfgridModule.nodes.entries();

        console.log(allNodes);

        //filter nodes by farm id
        nodes.value = allNodes
            .filter(([, node]) => farmIds.includes(node.farm_id.words[0]))
            .map(([, node]) => {
                const newNode = JSON.parse(JSON.stringify(node));
                //@ts-ignore
                newNode.name = bin2String(node.name);
                return newNode;
            });

        console.log(farmIds);

        console.log(farms.value);

        loading.value = false;
        subtitle.value = undefined;
    };
    init();
</script>
