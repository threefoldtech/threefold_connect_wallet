<template>
    <template :key="farm.name" v-for="(farm, index) in farms">
        <div class="relative col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
            <div
                v-if="loading"
                class="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-slate-600/80 text-2xl text-white"
            >
                <div class="flex flex-col items-center justify-center text-center">
                    <svg
                        class="h-8 animate-spin text-white text-primary-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        ></circle>
                        <path
                            class="opacity-75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            fill="currentColor"
                        ></path>
                    </svg>
                    <h2 class="mt-4 text-sm">Loading ...</h2>
                    <h3 class="text-sm" v-if="subtitle">{{ subtitle }}</h3>
                </div>
            </div>

            <div @click="showDetails = !showDetails" class="flex flex-row items-center justify-between">
                <div class="max-w-80 truncate text-2xl text-black">
                    {{ farm.name }}
                </div>
                <div>
                    <ChevronUpIcon v-if="showCreateFarmDetails" class="-ml-1 mr-2 h-5 w-5" />
                    <ChevronDownIcon v-if="!showCreateFarmDetails" class="-ml-1 mr-2 h-5 w-5" />
                </div>
            </div>

            <div v-show="showDetails">
                <div class="p-4">
                    <div class="space-y-2">
                        <div class="py-2">
                            <div role="list" class="space-y-4 sm:px-6 lg:px-8">
                                <div class="space-y-1 sm:flex sm:items-baseline sm:justify-between">
                                    <h3 class="">
                                        <span class="text-gray-600">Farm id: {{ farm.id }}</span>
                                    </h3>
                                    <p class="mt-1 whitespace-nowrap text-gray-600 sm:mt-0 sm:ml-3">
                                        Twin Id: {{ farm.twin_id }}
                                    </p>
                                    <hr class="border-primary-300" />
                                    <p
                                        class="mt-1 whitespace-nowrap text-gray-600 sm:mt-0 sm:ml-3"
                                        v-if="nodes.length > 0"
                                    >
                                        node Ids: {{ nodes.map((node:any) => node.id).join(', ') }}
                                    </p>
                                    <p
                                        class="mt-1 whitespace-nowrap text-sm text-gray-600 sm:mt-0 sm:ml-3"
                                        v-if="nodes.length === 0"
                                    >
                                        No nodes connected with this farm
                                    </p>
                                    <div class="flex w-full items-center justify-between space-x-6 px-4 pb-4">
                                        <div class="flex-1 truncate">
                                            <div class="mt-4">
                                                <div class="flex flex-row items-center">
                                                    <h2 class="font-semibold">Stellar address</h2>
                                                    <ClipboardCopyIcon
                                                        @click="
                                                            copyToClipboard(
                                                                wallet.keyPair.getStellarKeyPair().publicKey()
                                                            )
                                                        "
                                                        class="ml-2 h-4 text-black"
                                                    />
                                                </div>
                                                <div
                                                    class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500"
                                                >
                                                    {{ wallet.keyPair.getStellarKeyPair().publicKey() }}
                                                </div>
                                                <div class="mt-1 text-xs font-light">
                                                    Note: This address will be used for payout
                                                </div>
                                            </div>
                                            <div class="mt-4">
                                                <div class="flex flex-row items-center">
                                                    <div class="font-semibold">Balance</div>
                                                </div>
                                                <div class="mt-2 space-y-2">
                                                    <BalanceCard
                                                        v-for="assetBalance in walletBalances?.assets"
                                                        :balance="assetBalance"
                                                    ></BalanceCard>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <modal v-if="showTermsAndConditionsModal" @close="showTermsAndConditionsModal = false" :action="true">
            <template #header> You have to accept the terms and conditions </template>
            <template #content>
                <SwitchGroup as="div" class="flex items-center justify-between px-4">
                    <span class="flex flex-grow flex-col">
                        <SwitchLabel as="span" class="text-sm font-medium text-gray-900"
                            >Terms & Conditions</SwitchLabel
                        >
                        <SwitchDescription as="span" class="text-sm text-gray-500"
                            >I have read and accept the
                            <a
                                class="inline underline decoration-primary-600 decoration-2 focus:font-semibold focus:text-primary-600 focus:outline-none"
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
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                        ]"
                    >
                        <span
                            :class="[
                                termsAndConditionsIsAccepted ? 'translate-x-5' : 'translate-x-0',
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                            ]"
                            aria-hidden="true"
                        />
                    </Switch>
                </SwitchGroup>
            </template>
            <template #actions>
                <button
                    @click="createFarmFormSubmit"
                    :disabled="!termsAndConditionsIsAccepted"
                    class="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
                >
                    Create farm
                </button>
                <button
                    @click="showTermsAndConditionsModal = false"
                    class="rounded-md bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                    Cancel
                </button>
            </template>
        </modal>
    </template>

    <SiteModalFrame
        v-if="showTermsAndConditions"
        :src="termsAndConditionsUrl"
        title="Terms & Conditions"
        @close="showTermsAndConditions = false"
    />
</template>

<script lang="ts" setup>
    import { AssetBalance, balances, Wallet } from '@/service/walletService';
    import {
        Dialog,
        Disclosure,
        DisclosureButton,
        DisclosurePanel,
        Popover,
        PopoverButton,
        PopoverPanel,
        Switch,
        SwitchDescription,
        SwitchGroup,
        SwitchLabel,
        Menu,
        MenuButton,
        MenuItems,
        MenuItem,
        DialogTitle,
    } from '@headlessui/vue';
    import { DocumentAddIcon } from '@heroicons/vue/outline';
    import { ChevronUpIcon, PlusIcon, XIcon, ChevronDownIcon, InformationCircleIcon } from '@heroicons/vue/solid';
    import { computed, ref, watch } from 'vue';
    import {
        allFarmNames,
        allFarms,
        getSubstrateApi,
        getSubstrateAssetBalances,
        getTwinId,
        getUsersTermsAndConditions,
    } from '@/service/substrateService';
    import axios from 'axios';
    import SiteModalFrame from '@/components/SiteModalFrame.vue';
    import flagsmith from 'flagsmith';
    import BalanceCard from '@/components/BalanceCard.vue';
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { useDynamicBalance } from '@/util/useDynamicBalance';
    import { addNotification, NotificationType } from '@/service/notificationService';
    import { toNumber } from 'lodash';
    import { ClipboardCopyIcon } from '@heroicons/vue/solid';
    import Modal from '@/components/global/Modal.vue';

    const v2farms: {
        id: number;
        name: string;
        stellar_wallet_addres: string;
    }[] = [];

    interface IProps {
        wallet: Wallet;
    }

    const possibleNames = ref<string[]>([]);

    const { wallet } = defineProps<IProps>();

    const loading = ref(true);
    const twinId = ref();
    const ipAmount = ref(1);
    const farmNameToValidate = ref();
    const farmFormErrors = ref<any>({});
    const termsAndConditionsIsAccepted = ref(false);
    const termsAndConditions = ref<any[]>([]);
    const showTermsAndConditions = ref(false);
    const showFarmDialog = ref(false);
    const farms = ref<any>([]);
    const subtitle = ref<string | undefined>();
    const showTermsAndConditionsModal = ref<boolean>(false);
    const showDetails = ref<boolean>(false);
    const showCreateFarmDetails = ref<boolean>(false);

    const validateFarmNameForm = async (evt: Event) => {
        showFarmDialog.value = false;

        const formData = new FormData(evt.target as HTMLFormElement);

        const farmName = <string>formData.get('farmName');
        await validateFarmName(farmName, wallet.keyPair.getStellarKeyPair().publicKey());
        if (farmFormErrors.value?.farmName) return;

        showTermsAndConditionsModal.value = true;
    };

    const validateFarmName = async (value: string, myStellarAddress: string) => {
        const wasFound = v2farms.find(farm => farm.name === value);

        if (wasFound && wasFound.stellar_wallet_addres === wallet.keyPair.getStellarKeyPair().publicKey()) {
            delete farmFormErrors.value.farmName;
            return;
        }

        if (wasFound) {
            farmFormErrors.value = {
                ...farmFormErrors.value,

                farmName: 'This name is already taken',
            };
            return;
        }

        if (!value) {
            farmFormErrors.value = {
                ...farmFormErrors.value,

                farmName: 'Farm name is required',
            };
            return;
        }

        if (value.length > 50) {
            farmFormErrors.value = {
                ...farmFormErrors.value,

                farmName: 'Farm name must be less than 50 characters',
            };
            return;
        }

        // if name found in all farms show error
        if (allFarmNames.value.includes(value)) {
            farmFormErrors.value = {
                ...farmFormErrors.value,

                farmName: 'This name is already taken',
            };
            return;
        }

        try {
            const res = await axios.get(`/api/v1/farms/${encodeURIComponent(value)}/${myStellarAddress}`);

            if (res.data?.canuse !== true) {
                farmFormErrors.value = {
                    ...farmFormErrors.value,
                    farmName: 'This name is already taken',
                };
                return;
            }
        } catch (e) {
            farmFormErrors.value = {
                ...farmFormErrors.value,
                farmName: 'Try again later',
            };
            return;
        }

        delete farmFormErrors.value.farmName;
    };

    watch(farmNameToValidate, value => {
        validateFarmName(value, wallet.keyPair.getStellarKeyPair().publicKey());
    });

    const farmFormSubmit = async (evt: Event) => {
        showFarmDialog.value = false;

        const formData = new FormData(evt.target as HTMLFormElement);

        const farmName = <string>formData.get('farmName');
        await validateFarmName(farmName, wallet.keyPair.getStellarKeyPair().publicKey());
        if (farmFormErrors.value?.farmName) return;
        const publicIps = <string[]>formData.getAll('publicIP') || [];

        await addFarm(farmName, publicIps);
    };

    const acceptTermsAndConditions = async () => {
        subtitle.value = 'could take some time to go through';
        loading.value = true;

        const id = wallet.keyPair.getSubstrateKeyring().address;
        await activationServiceForSubstrate(id);

        //while no substrateBalance is available we wait
        while (true) {
            const substrateBalance = await getSubstrateAssetBalances(id);
            if (
                substrateBalance.filter((assetBalance: AssetBalance) => {
                    return assetBalance.amount >= 0;
                }).length > 0
            ) {
                console.log('substrateBalance is available');
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
            termsAndConditions.value = await getUsersTermsAndConditions(id);
        } while (termsAndConditions.value.filter(t => t.document_link === termsAndConditionsUrl).length === 0);

        subtitle.value = 'refetching data';

        await init();
        subtitle.value = undefined;
    };

    const showTerms = () => {
        showTermsAndConditions.value = true;
    };

    const isNumeric = (n: any) => !isNaN(parseFloat(n)) && isFinite(n);

    const walletBalances = computed(() => {
        return balances.value.find(t => t.id === wallet.keyPair.getBasePublicKey());
    });

    const termsAndConditionsUrl = <string>flagsmith.getValue('farm_terms_and_conditions_url');

    const addFarm = async (farmName: string, publicIps: string[]) => {
        if (twinId.value === 0) {
            await addTwin();
        }
        loading.value = true;
        subtitle.value = 'creating farm';

        const currentAmountOfFarms = farms.value.length;
        const api = await getSubstrateApi();
        const submittableExtrinsic = api.tx.tfgridModule.createFarm(farmName, publicIps);
        const promise = new Promise((resolve, reject) => {
            submittableExtrinsic.signAndSend(wallet.keyPair.getSubstrateKeyring(), result => {
                if (result.status.isFinalized) {
                    resolve(null);
                }
                if (result.dispatchError) {
                    reject();
                }
            });
        });

        try {
            await promise;
        } catch (e) {
            loading.value = false;
            subtitle.value = undefined;
            addNotification(
                NotificationType.error,
                'Could not create farm (name already in use)',
                'Try again with diffrent name.'
            );
            throw e;
        }

        //while no substrateBalance is available we wait

        let i = 0;
        while (true) {
            // break after 20 seconds
            if (i > 20) {
                throw new Error('Timeout');
            }
            i++;
            //@ts-ignore

            farms.value = allFarms.value.filter(farm => toNumber(farm.twin_id) === twinId.value);

            if (farms.value.length > currentAmountOfFarms) {
                console.log('farm created');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        // TODO: make tis for the right farm not just the first one
        const submittableExtrinsic1 = api.tx.tfgridModule.addStellarPayoutV2address(
            farms.value[0]?.id,
            wallet.keyPair.getStellarKeyPair().publicKey()
        );

        const res = await submittableExtrinsic1.signAndSend(wallet.keyPair.getSubstrateKeyring());

        let j = 0;
        while (true) {
            // break after 20 seconds
            if (j > 20) {
                break;
                throw new Error('Timeout');
            }
            j++;
            //@ts-ignore
            const value = await api.query.tfgridModule.farmPayoutV2AddressByFarmID(farms.value[0].id);

            if (!!value) break;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

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
        const submittableExtrinsic = api.tx.tfgridModule.createTwin('127.0.0.1');
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

        const url = `${flagsmith.getValue('tfchain_activation_base_url')}/activation/activate`;
        const data = { substrateAccountID: id };

        const response = await axios.post(url, data, { headers });

        return response;
    };

    const substrateBalance = ref();
    const stellarBalance = ref();

    const nodes = ref();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const createFarmFormSubmit = async () => {
        // Double check if the terms and conditions are checked
        if (!termsAndConditionsIsAccepted.value) return;

        // Farm name has already been validated, but double check to be 100% sure
        const farmName: string = farmNameToValidate.value;
        await validateFarmName(farmName, wallet.keyPair.getStellarKeyPair().publicKey());

        if (farmFormErrors.value?.farmName) return;

        loading.value = true;
        subtitle.value = 'Starting creation of farm';

        await acceptTermsAndConditions();

        await addFarm(farmName, []);

        await init();
    };

    const init = async () => {
        const address = wallet.keyPair.getSubstrateKeyring().address;

        const stellarAddress = wallet.keyPair.getStellarKeyPair().publicKey();
        const res = await axios.get(`/api/v1/farms/address/${stellarAddress}`);

        if (res?.data.length > 0) {
            farmNameToValidate.value = res.data[0];
            possibleNames.value = res.data;
        }

        substrateBalance.value = await getSubstrateAssetBalances(address);
        await useDynamicBalance(wallet);

        const api = await getSubstrateApi();

        termsAndConditions.value = await getUsersTermsAndConditions(address);
        // termsAndConditions.value = await api.query.tfgridModule.usersTermsAndConditions(address);

        twinId.value = await getTwinId(address);
        //@ts-ignore
        farms.value = allFarms.value.filter(farm => toNumber(farm.twin_id) === twinId.value);

        // get array of id's from farms
        const farmIds = JSON.parse(JSON.stringify(farms.value.map((farm: any) => farm.id)));
        const allNodes = await api.query.tfgridModule.nodes.entries(); //@TODO: optimize by moving this to Farmer

        //filter nodes by farm id
        nodes.value = allNodes
            //@ts-ignore
            .filter(([, node]) => farmIds.includes(node.farm_id.words[0]))
            .map(([, node]) => node.toHuman(true));

        loading.value = false;
        subtitle.value = undefined;
    };

    init();
</script>

<style scoped>
    .max-w-80 {
        max-width: 80%;
    }
</style>
