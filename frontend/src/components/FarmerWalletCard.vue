<template>
    <li
        :key="wallet.keyPair.getBasePublicKey()"
        class="relative col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
    >
        <div
            v-if="loading"
            class="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-slate-600/80 text-2xl text-white"
        >
            <div class="flex flex-col items-center justify-center text-center">
                <svg
                    class="h-32 animate-spin text-white"
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
                <h3 class="text-sm" v-if="subtitle">{{ subtitle }}</h3>
            </div>
        </div>
        <div
            v-if="!loading && termsAndConditions.length === 0"
            class="absolute inset-0 z-20 flex flex-col rounded-lg bg-white p-4"
        >
            <form @submit.prevent.stop="createFarmFormSubmit">
                <div class="flex flex-col gap-2">
                    <div class="text-2xl text-black">
                        {{ wallet.name }}
                    </div>
                    <hr class="border-gray-300" />
                    <label>
                        <p class="block text-sm font-medium text-gray-700">Farm name</p>
                        <div class="mt-1">
                            <input
                                type="text"
                                name="farmName"
                                id="email"
                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                :class="{ 'border-red-500': farmFormErrors.farmName }"
                                placeholder="Enter Farm Name"
                                v-model="farmNameToValidate"
                                required
                            />
                        </div>

                        <p class="mt-2 text-sm text-red-600" v-if="farmFormErrors.farmName">
                            {{ farmFormErrors.farmName }}
                        </p>
                        <p class="mt-2 text-sm text-gray-500" v-if="!farmFormErrors.farmName">
                            No spaces or special characters
                        </p>
                    </label>
                    <Menu as="div" class="relative inline-block text-left" v-if="possibleNames.length > 1">
                        <div>
                            <MenuButton
                                class="inline-flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                            >
                                Other Possibilities
                                <ChevronDownIcon
                                    class="ml-2 -mr-1 h-5 w-5 text-primary-200 hover:text-primary-100"
                                    aria-hidden="true"
                                />
                            </MenuButton>
                        </div>

                        <MenuItems
                            class="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                            <div class="divide-y divide-primary-300 px-1 py-2">
                                <MenuItem v-for="name in possibleNames" v-slot="{ active }">
                                    <button
                                        class="group flex w-full items-center px-2 py-2 text-sm text-gray-800 hover:bg-primary-200"
                                        @click="farmNameToValidate = name"
                                    >
                                        {{ name }}
                                    </button>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </Menu>

                    <p class="mt-4">You have to accept to the terms and conditions</p>
                    <SwitchGroup as="div" class="flex items-center justify-between">
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
                    <input
                        type="submit"
                        :disabled="!termsAndConditionsIsAccepted"
                        class="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
                        value="Create Farm"
                    />
                </div>
            </form>
        </div>

        <div class="flex w-full items-center justify-between space-x-6 p-4">
            <div class="flex-1 truncate">
                <div class="flex items-center space-x-3">
                    <h3 class="overflow-x-auto text-sm font-medium font-semibold uppercase text-gray-900">
                        {{ wallet.name }}
                    </h3>
                    <span
                        class="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                        >{{ wallet.meta.type }}</span
                    >
                </div>
                <div class="mt-4">
                    <h2 class="">Stellar address</h2>
                    <div
                        class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500"
                        @click="copyToClipboard(wallet.keyPair.getStellarKeyPair().publicKey())"
                    >
                        {{ wallet.keyPair.getStellarKeyPair().publicKey() }}
                    </div>
                </div>
                <div class="mt-4">
                    <h2 class="">TFChain address</h2>
                    <span
                        class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500"
                        @click="copyToClipboard(wallet.keyPair.getSubstrateKeyring().address)"
                        >{{ wallet.keyPair.getSubstrateKeyring().address }}</span
                    >
                </div>
            </div>
        </div>
        <div class="p-4">
            <div class="space-y-2">
                <div class="py-2">
                    {{ farms.length === 0 ? 'No farms' : farms.length === 1 ? 'Farm:' : `Farms:` }}
                    <div role="list" class="space-y-4 sm:px-6 lg:px-8">
                        <template v-for="(farm, index) in farms">
                            <Disclosure v-slot="{ open }">
                                <DisclosureButton
                                    class="no-scrollbar flex w-full justify-between overflow-x-auto rounded-lg bg-primary-100 px-4 py-2 text-left text-sm font-medium text-primary-900 hover:bg-primary-200 focus:outline-none focus-visible:ring focus-visible:ring-primary-500 focus-visible:ring-opacity-75"
                                >
                                    {{ farm.name }}
                                    <ChevronUpIcon
                                        :class="open ? 'rotate-180 transform' : ''"
                                        class="h-5 w-5 text-primary-500"
                                    />
                                </DisclosureButton>
                                <DisclosurePanel class="ml-4 rounded-lg bg-white bg-primary-100 px-2 py-4">
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
                                    </div>
                                </DisclosurePanel>
                            </Disclosure>
                        </template>
                    </div>
                </div>
                <div class="p-2">
                    Balance:
                    <div class="mt-2 space-y-2">
                        <BalanceCard
                            v-for="assetBalance in walletBalances?.assets"
                            :balance="assetBalance"
                        ></BalanceCard>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <div v-if="!loading" class="-mt-px flex divide-x divide-gray-200">
                <div v-if="termsAndConditions.length === 0" class="flex w-0 flex-1">
                    <button
                        class="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                        @click="activate()"
                    >
                        <DocumentAddIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                        <span class="ml-3">activate</span>
                    </button>
                </div>
                <div v-if="termsAndConditions.length === 0" class="flex w-0 flex-1">
                    <button
                        class="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                        @click="signTermsAndConditions()"
                    >
                        <DocumentAddIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                        <span class="ml-3">i accept everything</span>
                    </button>
                </div>
                <div v-if="false" class="flex w-0 flex-1">
                    <button
                        class="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                        @click="addTwin()"
                    >
                        <DocumentAddIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                        <span class="ml-3">Add Twin</span>
                    </button>
                </div>
                <div class="flex w-0 flex-1">
                    <button
                        class="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                        @click="showFarmDialog = true"
                        v-if="farms.length === 0"
                    >
                        <DocumentAddIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                        <span class="ml-3" v-if="farms.length === 0">Add initial farm</span>
                        <span class="ml-3" v-if="farms.length > 0">Add farm</span>
                    </button>

                    <Dialog v-if="showFarmDialog" :open="true" as="div" class="fixed inset-0 z-30">
                        <MainLayout>
                            <template #header>
                                <PageHeader>
                                    <h1>Add Farm</h1>
                                    <template #after>
                                        <XIcon class="text-orange-600" @click="showFarmDialog = false" />
                                    </template>
                                </PageHeader>
                            </template>
                            <div class="p-4">
                                <form class="space-y-4 divide-y divide-gray-200" @submit.prevent="farmFormSubmit">
                                    <div class="space-y-4 divide-y divide-gray-200">
                                        <div>
                                            <div>
                                                <h3 class="text-lg font-medium leading-6 text-gray-900">Add Farm</h3>
                                                <p class="mt-1 text-sm text-gray-500">
                                                    This information will be used for farm creation on grid v3.
                                                </p>
                                            </div>
                                        </div>

                                        <div class="pt-4">
                                            <div>
                                                <h3 class="text-lg font-medium leading-6 text-gray-900">
                                                    Farm Information
                                                </h3>
                                            </div>
                                            <div class="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                                <div class="sm:col-span-3">
                                                    <label
                                                        for="farmName"
                                                        class="block text-sm font-medium text-gray-700"
                                                    >
                                                        Farm name
                                                    </label>
                                                    <div class="mt-1">
                                                        <input
                                                            type="text"
                                                            name="farmName"
                                                            id="farmName"
                                                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                                            v-model="farmNameToValidate"
                                                        />
                                                    </div>
                                                    <p class="mt-2 text-sm text-red-600" v-if="farmFormErrors.farmName">
                                                        {{ farmFormErrors.farmName }}
                                                    </p>
                                                </div>
                                            </div>
                                            <Menu
                                                as="div"
                                                class="relative mt-2 inline-block text-left"
                                                v-if="possibleNames.length > 1"
                                            >
                                                <div>
                                                    <MenuButton
                                                        class="inline-flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                                                    >
                                                        Other Possibilities
                                                        <ChevronDownIcon
                                                            class="ml-2 -mr-1 h-5 w-5 text-primary-200 hover:text-primary-100"
                                                            aria-hidden="true"
                                                        />
                                                    </MenuButton>
                                                </div>

                                                <MenuItems
                                                    class="absolute left-0 z-50 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                                >
                                                    <div class="divide-y divide-primary-300 px-1 py-2">
                                                        <MenuItem v-for="name in possibleNames" v-slot="{ active }">
                                                            <button
                                                                class="group flex w-full items-center px-2 py-2 text-sm text-gray-800 hover:bg-primary-200"
                                                                @click="farmNameToValidate = name"
                                                            >
                                                                {{ name }}
                                                            </button>
                                                        </MenuItem>
                                                    </div>
                                                </MenuItems>
                                            </Menu>
                                        </div>

                                        <div class="pt-8" v-if="false">
                                            <div>
                                                <h3 class="text-lg font-medium leading-6 text-gray-900">Public IP's</h3>
                                                <p class="mt-1 text-sm text-gray-500">
                                                    lorem ipsum dolor sit amet consectetur adipisicing elit.
                                                </p>
                                            </div>
                                            <div class="mt-6">
                                                <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                                    <label class="sm:col-span-3" v-for="n in ipAmount">
                                                        <span class="block text-sm font-medium text-gray-700">
                                                            Public IP
                                                        </span>
                                                        <div class="mt-1">
                                                            <input
                                                                type="text"
                                                                name="publicIP"
                                                                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                                            />
                                                        </div>
                                                    </label>

                                                    <div class="flex gap-2">
                                                        <button
                                                            type="button"
                                                            class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                            v-if="ipAmount >= 1"
                                                            @click="ipAmount--"
                                                        >
                                                            <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                                            Remove Ip
                                                        </button>
                                                        <button
                                                            type="button"
                                                            class="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                            @click="ipAmount++"
                                                        >
                                                            <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                                            Add Ip
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="pt-5">
                                        <div class="flex justify-end">
                                            <button
                                                type="button"
                                                class="rounded-md bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                                @click="showFarmDialog = false"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            >
                                                Create
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </MainLayout>
                    </Dialog>
                </div>
            </div>
            <div v-else class="animate-pulse p-4">loading ...</div>
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
    import { AssetBalance, balances, Wallet } from '@/service/walletService';
    import {
        Dialog,
        Disclosure,
        DisclosureButton,
        DisclosurePanel,
        Switch,
        SwitchDescription,
        SwitchGroup,
        SwitchLabel,
        Menu,
        MenuButton,
        MenuItems,
        MenuItem,
    } from '@headlessui/vue';
    import { DocumentAddIcon } from '@heroicons/vue/outline';
    import { ChevronUpIcon, PlusIcon, XIcon, ChevronDownIcon } from '@heroicons/vue/solid';
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

            console.log(res.data?.canuse);
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

    const createFarmFormSubmit = async (evt: Event) => {
        if (!termsAndConditionsIsAccepted.value) return;

        const formData = new FormData(evt.target as HTMLFormElement);
        const value = <string>formData.get('farmName');

        await validateFarmName(value, wallet.keyPair.getStellarKeyPair().publicKey());
        if (farmFormErrors.value?.farmName) return;

        loading.value = true;
        subtitle.value = 'starting creation of farm';

        await acceptTermsAndConditions();

        await addFarm(value, []);

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
