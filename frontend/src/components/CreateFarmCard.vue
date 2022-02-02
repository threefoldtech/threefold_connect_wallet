<template>
    <div class="relative col-span-1 mt-5 divide-y rounded-lg bg-white p-4" v-if="isLoading">
        Loading ...
        <div>
            {{ loadingSubtitle }}
        </div>
    </div>
    <div v-else class="relative col-span-1 mt-5 divide-y rounded-lg bg-white">
        <Disclosure v-slot="{ open }" as="div" class="relative col-span-1 rounded-lg bg-white">
            <DisclosureButton as="div" class="flex flex-row items-center justify-between">
                <div class="text-md max-w-90 truncate p-4 font-medium">
                    {{ farm.name }}
                </div>
                <div>
                    <ChevronUpIcon v-if="open" class="-ml-1 mr-2 h-5 w-5" />
                    <ChevronDownIcon v-if="!open" class="-ml-1 mr-2 h-5 w-5" />
                </div>
            </DisclosureButton>

            <DisclosurePanel class="px-4 pb-4" as="div">
                <form @submit.prevent.stop="validateCreatedFarm">
                    <div data-field="wallet">
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
                                        <MenuItem
                                            v-for="wallet in wallets.filter(
                                                wallet => wallet.name !== desiredWallet.name
                                            )"
                                            v-slot="{ active }"
                                        >
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
                                                                    .find(
                                                                        b => b.id === wallet.keyPair.getBasePublicKey()
                                                                    )
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

                    <div class="pt-5" data-field="farmName">
                        <h2 class="pb-2 text-sm font-semibold uppercase">Choose a farm name</h2>
                        <input
                            type="text"
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

                    <div class="pt-4">
                        <input
                            type="submit"
                            value="Submit"
                            class="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
                        />
                    </div>
                </form>
            </DisclosurePanel>
        </Disclosure>
    </div>

    <modal
        :key="showTermsAndConditionsModal"
        v-if="showTermsAndConditionsModal"
        @close="showTermsAndConditionsModal = false"
        :action="true"
    >
        <template #header> You have to accept the terms and conditions</template>
        <template #content>
            <SwitchGroup as="div" class="flex items-center justify-between px-4">
                <span class="flex flex-grow flex-col">
                    <SwitchLabel as="span" class="text-sm font-medium text-gray-900">Terms & Conditions</SwitchLabel>
                    <SwitchDescription as="span" class="text-sm text-gray-500"
                        >I have read and accept the
                        <a
                            class="inline underline decoration-primary-500 decoration-2 focus:font-semibold focus:text-primary-600 focus:outline-none"
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
                @click="createNewFarm"
                :disabled="!termsAndConditionsIsAccepted"
                class="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
            >
                Create farm
            </button>
            <button
                @click="showTermsAndConditionsModal = false"
                class="rounded-md py-2 px-4 text-sm font-medium text-orange-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
                Cancel
            </button>
        </template>
    </modal>

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
    import { AssetBalance, balances, Wallet } from '@/service/walletService';
    import {
        DisclosureButton,
        Disclosure,
        DisclosurePanel,
        Menu,
        MenuButton,
        MenuItems,
        MenuItem,
        SwitchGroup,
        Switch,
        SwitchDescription,
        SwitchLabel,
    } from '@headlessui/vue';
    import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/solid';
    import { computed, devtools, ref, watch } from 'vue';
    import {
        activationServiceForSubstrate,
        allFarmNames,
        allFarms,
        getSubstrateApi,
        getSubstrateAssetBalances,
        getTwinId,
        getUsersTermsAndConditions,
    } from '@/service/substrateService';
    import axios from 'axios';
    import Modal from '@/components/global/Modal.vue';
    import flagsmith from 'flagsmith';
    import { addNotification, NotificationType } from '@/service/notificationService';
    import { toNumber } from 'lodash';
    import { useDynamicBalance } from '@/util/useDynamicBalance';

    interface Props {
        farm: Farm;
        wallets: Wallet[];
        v2Farms: Farm[];
    }

    const { farm, wallets, v2Farms } = defineProps<Props>();

    const desiredWallet = ref<Wallet>(wallets[0]);
    const farmFormErrors = ref<any>({});
    const farmNameToValidate = ref();

    const isLoading = ref<boolean>(false);
    const loadingSubtitle = ref<string>('');

    const showTermsAndConditionsModal = ref<boolean>(false);
    const showTermsAndConditions = ref<boolean>(false);
    const termsAndConditionsUrl = <string>flagsmith.getValue('farm_terms_and_conditions_url');
    const termsAndConditionsIsAccepted = ref<boolean>(false);
    const termsAndConditions = ref<any[]>([]);

    const farms = ref<any>([]);
    const newTwinId = ref();

    watch(farmNameToValidate, value => {
        validateFarmName(value, desiredWallet.value.keyPair.getStellarKeyPair().publicKey());
    });

    const validateFarmName = async (value: string, myStellarAddress: string) => {
        const wasFound = v2Farms.find(farm => farm.name === value);

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

    const validateCreatedFarm = async (evt: Event) => {
        const formData = new FormData(evt.target as HTMLFormElement);

        const farmName = <string>formData.get('farmName');

        await validateFarmName(farmName, desiredWallet.value.keyPair.getStellarKeyPair().publicKey());
        if (farmFormErrors.value?.farmName) return;

        showTermsAndConditionsModal.value = true;
    };

    const createNewFarm = async (evt: Event) => {
        // Double check if the terms and conditions are checked
        if (!termsAndConditionsIsAccepted.value) return;

        // Farm name has already been validated, but double check to be 100% sure
        const farmName: string = farmNameToValidate.value;
        await validateFarmName(farmName, desiredWallet.value.keyPair.getStellarKeyPair().publicKey());

        if (farmFormErrors.value?.farmName) return;
        showTermsAndConditionsModal.value = false;

        isLoading.value = true;
        loadingSubtitle.value = 'Starting creation of farm';

        await acceptTermsAndConditions();
        await addFarm(farmName, []);

        isLoading.value = false;
        await init();
    };

    const addTwin = async () => {
        isLoading.value = true;
        loadingSubtitle.value = 'Creating twin';

        const api = await getSubstrateApi();
        const submittableExtrinsic = api.tx.tfgridModule.createTwin('127.0.0.1');

        await submittableExtrinsic.signAndSend(desiredWallet.value.keyPair.getSubstrateKeyring());

        while (true) {
            newTwinId.value = await getTwinId(desiredWallet.value.keyPair.getSubstrateKeyring().address);
            if (newTwinId.value !== 0) {
                console.log('twinId', newTwinId.value);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await init();
        loadingSubtitle.value = 'Refetching data';
    };

    const addFarm = async (farmName: string, publicIps: string[]) => {
        newTwinId.value = await getTwinId(desiredWallet.value.keyPair.getSubstrateKeyring().address);

        if (newTwinId.value === 0) {
            await addTwin();
        }

        isLoading.value = true;
        loadingSubtitle.value = 'Creating farm';

        const currentAmountOfFarms = farms.value.length;
        const api = await getSubstrateApi();

        const submittableExtrinsic = api.tx.tfgridModule.createFarm(farmName, publicIps);

        console.log(desiredWallet.value.keyPair.getSubstrateKeyring());

        const promise = new Promise((resolve, reject) => {
            submittableExtrinsic.signAndSend(desiredWallet.value.keyPair.getSubstrateKeyring(), result => {
                if (result.status.isFinalized) {
                    resolve(null);
                }
                if (result.dispatchError) {
                    reject();
                }
            });
        });

        console.log('Reach this part 1');

        try {
            await promise;
        } catch (e) {
            isLoading.value = false;
            loadingSubtitle.value = '';
            addNotification(
                NotificationType.error,
                'Could not create farm (name already in use)',
                'Try again with different name.'
            );
            throw e;
        }

        //while no substrateBalance is available we wait
        console.log('Reach this part 2');
        let i = 0;
        while (true) {
            // break after 20 seconds
            if (i > 20) {
                throw new Error('Timeout');
            }
            i++;

            //@ts-ignore
            farms.value = allFarms.value.filter(farm => toNumber(farm.twin_id) === newTwinId.value);

            if (farms.value.length > currentAmountOfFarms) {
                console.log('Farm created');
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        // TODO: make tis for the right farm not just the first one
        const submittableExtrinsic1 = api.tx.tfgridModule.addStellarPayoutV2address(
            farms.value[0]?.id,
            desiredWallet.value.keyPair.getStellarKeyPair().publicKey()
        );

        const res = await submittableExtrinsic1.signAndSend(desiredWallet.value.keyPair.getSubstrateKeyring());

        let j = 0;
        while (true) {
            // break after 20 seconds
            if (j > 20) {
                throw new Error('Timeout');
            }
            j++;
            //@ts-ignore
            const value = await api.query.tfgridModule.farmPayoutV2AddressByFarmID(farms.value[0].id);

            if (!!value) break;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await init();
        loadingSubtitle.value = 'Refetching data';
    };

    const init = async () => {
        const address = desiredWallet.value.keyPair.getSubstrateKeyring().address;
        termsAndConditions.value = await getUsersTermsAndConditions(address);

        newTwinId.value = await getTwinId(address);

        //@ts-ignore
        await useDynamicBalance(desiredWallet.value);

        //@ts-ignore
        farms.value = allFarms.value.filter(farm => toNumber(farm.twin_id) === newTwinId.value);

        isLoading.value = false;
        loadingSubtitle.value = '';
    };

    const signTermsAndConditions = async () => {
        const termsAndConditionsUrl = <string>flagsmith.getValue('farm_terms_and_conditions_url');

        const api = await getSubstrateApi();
        const submittableExtrinsic = api.tx.tfgridModule.userAcceptTc(termsAndConditionsUrl, 'NO_HASH');
        await submittableExtrinsic.signAndSend(desiredWallet.value.keyPair.getSubstrateKeyring());
    };

    const acceptTermsAndConditions = async () => {
        loadingSubtitle.value = 'Accepting terms and conditions';
        isLoading.value = true;

        const id = desiredWallet.value.keyPair.getSubstrateKeyring().address;

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

        loadingSubtitle.value = 'Reloading data';
        await init();
    };
</script>
