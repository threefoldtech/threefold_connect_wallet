<template>
    <div class="relative col-span-1 mt-5 w-full divide-y rounded-lg bg-white pt-4">
        <div class="w-full" v-if="isLoading">
            <div class="flex flex-row items-center justify-center pb-3">
                {{ loadingSubtitle }} <span class="pl-1"> ...</span>
            </div>
            <div class="flex justify-center pb-3">
                <svg
                    class="h-6 animate-spin text-primary-600"
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
            </div>
        </div>
        <div v-else class="px-4 pb-4">
            <div class="flex flex-row items-center justify-between pb-4">
                <div class="text-lg font-semibold" v-if="migrationFarm">MIGRATE FARM</div>
                <div class="text-lg font-semibold" v-else>CREATE A NEW FARM ON TF GRID V3 MAIN NET</div>
                <div>
                    <XIcon class="h-4 w-4 text-black" @click="emit('close')"></XIcon>
                </div>
            </div>

            <form @submit.prevent.stop="createNewFarm" class="space-y-4">
                <div v-if="!migrationFarm" data-field="wallet">
                    <h2 class="pb-2 text-sm font-semibold uppercase">Choose a wallet</h2>
                    <div class="w-full">
                        <Menu as="div" class="relative inline-block w-full text-left">
                            <div>
                                <MenuButton
                                    class="inline-flex w-full justify-between rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
                                >
                                    {{ desiredWallet.name }}
                                    <ChevronDownIcon
                                        class="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
                                        aria-hidden="true"
                                    />
                                </MenuButton>
                            </div>

                            <MenuItems
                                class="absolute left-0 z-50 mt-2 w-full origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                                <div class="max-h-28 w-full divide-y overflow-y-auto">
                                    <MenuItem v-for="wallet in wallets" v-slot="{ active }">
                                        <div
                                            class="flex w-full justify-between gap-2 truncate px-4 py-2 text-sm"
                                            @click="desiredWallet = wallet"
                                        >
                                            <div class="flex w-full flex-col justify-start truncate">
                                                <div class="flex flex-row justify-between">
                                                    <div class="font-semibold">Name</div>
                                                    <div>{{ wallet.name }}</div>
                                                </div>
                                                <div class="flex flex-row justify-between">
                                                    <div class="font-semibold">Balance</div>
                                                    <div>
                                                        {{
                                                            balances
                                                                .find(b => b.id === wallet.keyPair.getBasePublicKey())
                                                                ?.assets.filter(asset => asset.name === 'TFT')[0]
                                                                ?.amount
                                                        }}
                                                        TFT
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </MenuItem>
                                </div>
                            </MenuItems>
                            <transition
                                enter-active-class="transition duration-100 ease-out"
                                enter-from-class="transform scale-95 opacity-0"
                                enter-to-class="transform scale-100 opacity-100"
                                leave-active-class="transition duration-75 ease-in"
                                leave-from-class="transform scale-100 opacity-100"
                                leave-to-class="transform scale-95 opacity-0"
                            >
                            </transition>
                        </Menu>
                    </div>
                </div>

                <div data-field="farmName">
                    <h2 v-if="migrationFarm !== undefined" class="pb-2 text-sm font-semibold uppercase">
                        Migrating farm with name: {{ farmNameToValidate }}
                    </h2>
                    <h2 v-else class="pb-2 text-sm font-semibold uppercase">Choose a farm name</h2>
                    <input
                        @keyup="listenToKeyBindsForValidation"
                        :type="migrationFarm !== undefined ? 'hidden' : 'text'"
                        name="farmName"
                        id="farmName"
                        placeholder="Enter Farm Name"
                        required
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        :class="{ 'border-red-500': farmFormErrors.farmName }"
                        v-model="farmNameToValidate"
                    />

                    <div class="mt-1 text-sm text-red-600" v-if="farmFormErrors.farmName">
                        {{ farmFormErrors.farmName }}
                    </div>
                    <div class="mt-1 text-xs text-gray-500" v-else>No spaces or special characters</div>
                </div>

                <div>
                    <SwitchGroup as="div" class="flex items-center justify-between">
                        <span class="flex flex-grow flex-col">
                            <SwitchLabel as="span" class="pb-2 text-sm font-semibold uppercase text-gray-900"
                                >Terms & Conditions</SwitchLabel
                            >
                            <SwitchDescription as="span" class="text-sm text-gray-500"
                                >I have read and accept the
                                <a
                                    class="inline text-primary-600 decoration-primary-500 decoration-2 focus:font-semibold focus:text-primary-600 focus:outline-none"
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
                </div>

                <div>
                    <input
                        :disabled="
                            !termsAndConditionsIsAccepted || farmFormErrors.farmName || farmNameToValidate.length === 0
                        "
                        type="submit"
                        value="Submit"
                        class="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
                    />
                </div>
            </form>
        </div>
    </div>

    <SiteModalFrame
        v-if="showTermsAndConditions"
        :src="termsAndConditionsUrl"
        title="Terms & Conditions"
        @close="showTermsAndConditions = false"
    />
</template>

<script lang="ts" setup>
    import SiteModalFrame from '@/components/SiteModalFrame.vue';
    import { Farm } from '@/types/farms.types';
    import { AssetBalance, balances, Wallet, wallets } from '@/service/walletService';
    import {
        Menu,
        MenuButton,
        MenuItem,
        MenuItems,
        Switch,
        SwitchDescription,
        SwitchGroup,
        SwitchLabel,
    } from '@headlessui/vue';
    import { ChevronDownIcon, XIcon } from '@heroicons/vue/solid';

    import { ref, watch } from 'vue';
    import {
        activationServiceForSubstrate,
        allFarmNames,
        allFarms,
        getSubstrateApi,
        getSubstrateAssetBalances,
        getTwinId,
        getUsersTermsAndConditions,
        submitExtrensic,
    } from '@/service/substrateService';
    import axios from 'axios';
    import flagsmith from 'flagsmith';
    import { addNotification, NotificationType } from '@/service/notificationService';
    import { fetchFarms, v2Farms } from '@/service/farmService';
    import { onBeforeMount } from '@vue/runtime-core';
    import { toNumber } from 'lodash';

    const desiredWallet = ref<Wallet>(wallets.value[0]);
    const farmFormErrors = ref<any>({});
    const farmNameToValidate = ref<string>('');

    const isLoading = ref<boolean>(false);
    const loadingSubtitle = ref<string>('');

    const showTermsAndConditions = ref<boolean>(false);
    const termsAndConditionsUrl = <string>flagsmith.getValue('farm_terms_and_conditions_url');
    const termsAndConditionsIsAccepted = ref<boolean>(false);
    const termsAndConditions = ref<any[]>([]);

    const farms = ref<any>([]);
    const newTwinId = ref();

    const emit = defineEmits(['close']);

    onBeforeMount(() => {
        if (migrationFarm) {
            farmNameToValidate.value = migrationFarm?.name;
            desiredWallet.value = migrationFarm?.wallet as Wallet;
        }
    });

    // Defining props
    interface Props {
        migrationFarm?: Farm;
    }

    const { migrationFarm } = defineProps<Props>();

    watch(farmNameToValidate, value => {
        validateFarmName(value, desiredWallet.value.keyPair.getStellarKeyPair().publicKey());
    });

    const listenToKeyBindsForValidation = async (e: any) => {
        farmNameToValidate.value = e.target?.value;
        await validateFarmName(e.target?.value, desiredWallet.value.keyPair.getStellarKeyPair().publicKey());
    };

    const showTerms = () => {
        showTermsAndConditions.value = true;
    };

    const validateFarmName = async (value: string, myStellarAddress: string) => {
        value = value.toLowerCase();
        if (migrationFarm) {
            farmFormErrors.value = {}; //tem
            return;
        } // temp fix for migration farm

        const wasFound = v2Farms.value.find(farm => farm.name.toLowerCase() === value.toLowerCase());
        // console.log({ wasFound: !!wasFound, value, myStellarAddress });

        if (
            wasFound &&
            wasFound.wallet?.keyPair.getStellarKeyPair().publicKey() ===
                desiredWallet.value.keyPair.getStellarKeyPair().publicKey()
        ) {
            delete farmFormErrors.value.farmName;
            return;
        }

        if (wasFound) {
            farmFormErrors.value = {
                ...farmFormErrors.value,

                farmName: 'This name is already taken (1)',
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

                farmName: 'This name is already taken (2)',
            };
            return;
        }

        try {
            const res = await axios.get(`/api/v1/farms/${encodeURIComponent(value)}/${myStellarAddress}`);

            if (res.data?.canuse !== true) {
                farmFormErrors.value = {
                    ...farmFormErrors.value,
                    farmName: 'This name is already taken (3)',
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

    // const validateCreatedFarm = async (evt: Event) => {
    //     const formData = new FormData(evt.target as HTMLFormElement);
    //
    //     const farmName = <string>formData.get('farmName');
    //
    //     await validateFarmName(farmName, desiredWallet.value.keyPair.getStellarKeyPair().publicKey());
    //     if (farmFormErrors.value?.farmName) return;
    // };

    const createNewFarm = async (evt: Event) => {
        const formData = new FormData(evt.target as HTMLFormElement);

        const farmName = !migrationFarm ? <string>formData.get('farmName') : farmNameToValidate.value;
        console.log(farmName);

        await validateFarmName(farmName, desiredWallet.value.keyPair.getStellarKeyPair().publicKey());
        if (migrationFarm) farmFormErrors.value = {}; //temporary fix for migration farm

        if (farmFormErrors.value?.farmName) return;

        if (!termsAndConditionsIsAccepted.value) return;

        isLoading.value = true;
        loadingSubtitle.value = 'Starting creation of farm';

        console.log('Going to accept terms and cs');

        const termsAndConditions = await getUsersTermsAndConditions(
            desiredWallet.value.keyPair.getSubstrateKeyring().address
        );
        console.log('These are the terms and conditions', termsAndConditions);

        if (termsAndConditions.length === 0) {
            await acceptTermsAndConditions();
        }

        console.log('going to add the farm');
        await addFarm(farmName, []);

        isLoading.value = false;
        emit('close');

        if (migrationFarm) {
            addNotification(
                NotificationType.info,
                'Farm creation on v3 successful',
                'Your farm has been created on Grid v3. Please note that it will take several days for your v2 nodes to be migrated to your v3 farm. Once they have been migrated, you will see them listed under your new v3 farm.'
            );

            v2Farms.value = [];
            await fetchFarms();
            return;
        }

        addNotification(NotificationType.success, 'Farm creation successful');
    };

    const addTwin = async () => {
        isLoading.value = true;
        loadingSubtitle.value = 'Creating twin';

        const api = await getSubstrateApi();
        const submittableExtrinsic = api.tx.tfgridModule.createTwin('127.0.0.1');

        await submitExtrensic(submittableExtrinsic, desiredWallet.value.keyPair.getSubstrateKeyring());

        while (true) {
            newTwinId.value = await getTwinId(desiredWallet.value.keyPair.getSubstrateKeyring().address);
            if (newTwinId.value !== 0) {
                console.log('twinId', newTwinId.value);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        loadingSubtitle.value = 'Refetching data';
    };

    const addFarm = async (farmName: string, publicIps: string[]) => {
        console.log('getting twinId');
        newTwinId.value = await getTwinId(desiredWallet.value.keyPair.getSubstrateKeyring().address);
        console.log('twinId', newTwinId.value);

        console.debug('this is the twinid, ', newTwinId.value);
        if (newTwinId.value === 0) {
            console.debug('the twin id was 0');
            await addTwin();
        }

        isLoading.value = true;
        loadingSubtitle.value = 'Creating farm';
        const api = await getSubstrateApi();

        console.debug('this is the provided info', farmName, publicIps);
        console.log(desiredWallet.value.keyPair.getSubstrateKeyring());

        const submittableExtrinsic = api.tx.tfgridModule.createFarm(farmName, publicIps);

        console.debug(
            'signing and sending substate address ',
            desiredWallet.value.keyPair.getSubstrateKeyring().address
        );
        try {
            const res = await submitExtrensic(submittableExtrinsic, desiredWallet.value.keyPair.getSubstrateKeyring());
            console.log('this is the response', res);
        } catch (e) {
            isLoading.value = false;
            loadingSubtitle.value = '';
            addNotification(
                NotificationType.error,
                'Could not create farm (name already in use)',
                'Try again with different name.'
            );
            emit('close');
            throw e;
        }

        console.log('farm created');
        await new Promise(resolve => setTimeout(resolve, 1000));
        let i = 0;
        while (true) {
            // break after 20 seconds
            if (i > 20) {
                throw new Error('Timeout');
            }
            i++;
            //@ts-ignore

            farms.value = allFarms.value.filter(farm => toNumber(farm.twin_id) === newTwinId.value);

            //@ts-ignore
            const myFarm = farms.value.find(farm => farm.toHuman().name === farmName);

            if (myFarm) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        //@ts-ignore
        const myFarm = farms.value.find(farm => farm.toHuman().name === farmName);

        loadingSubtitle.value = 'Adding stellar payout address';

        const submittableExtrinsic1 = api.tx.tfgridModule.addStellarPayoutV2address(
            myFarm.id,
            desiredWallet.value.keyPair.getStellarKeyPair().publicKey()
        );

        await submitExtrensic(submittableExtrinsic1, desiredWallet.value.keyPair.getSubstrateKeyring());

        await new Promise(resolve => setTimeout(resolve, 1000));

        addNotification(NotificationType.success, 'Farm created');
        loadingSubtitle.value = 'Refetching data';
    };

    const signTermsAndConditions = async () => {
        const termsAndConditionsUrl = <string>flagsmith.getValue('farm_terms_and_conditions_url');

        const api = await getSubstrateApi();
        const submittableExtrinsic = api.tx.tfgridModule.userAcceptTc(termsAndConditionsUrl, 'NO_HASH');
        await submitExtrensic(submittableExtrinsic, desiredWallet.value.keyPair.getSubstrateKeyring());
    };

    const acceptTermsAndConditions = async () => {
        loadingSubtitle.value = 'Accepting terms and conditions';
        isLoading.value = true;

        const id = desiredWallet.value.keyPair.getSubstrateKeyring().address;

        console.log('Activating service for substrate');
        await activationServiceForSubstrate(id);

        //While there is no substrate balance, we need to wait
        while (true) {
            const substrateBalance = await getSubstrateAssetBalances(id);
            if (
                substrateBalance.filter((assetBalance: AssetBalance) => {
                    return assetBalance.amount >= 0;
                }).length > 0
            ) {
                console.log('Substrate balance is available');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        while (true) {
            try {
                loadingSubtitle.value = 'Signing terms and conditions';
                console.log('Signging terms and conditions');
                await signTermsAndConditions();
                break;
            } catch (e) {
                isLoading.value = false;
                emit('close');
                addNotification(NotificationType.error, 'Failed', 'Failed signing terms and conditions');
                console.error(e);
            }
        }

        do {
            await new Promise(resolve => setTimeout(resolve, 1000));
            loadingSubtitle.value = 'Getting terms and conditions';
            termsAndConditions.value = await getUsersTermsAndConditions(id);
        } while (termsAndConditions.value.filter(t => t.document_link === termsAndConditionsUrl).length === 0);

        console.log('these are the terms and conditions');
        console.log(termsAndConditions.value);
        loadingSubtitle.value = 'Reloading data';
    };
</script>
