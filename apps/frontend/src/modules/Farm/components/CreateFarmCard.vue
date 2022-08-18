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
                        <Menu as="div" class="scrollbar relative inline-block w-full text-left">
                            <div>
                                <MenuButton
                                    class="inline-flex w-full justify-between rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
                                >
                                    {{ selectedWallet.name }}
                                    <ChevronDownIcon
                                        class="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
                                        aria-hidden="true"
                                    />
                                </MenuButton>
                            </div>

                            <MenuItems
                                class="scrollbar overflow-y-scroll absolute left-0 z-50 mt-2 w-full origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                                <div class="max-h-40 w-full divide-y overflow-y-auto">
                                    <MenuItem
                                        @click="selectedWallet = wallet"
                                        v-for="wallet in wallets"
                                        v-slot="{ active }"
                                    >
                                        <div class="flex w-full justify-between gap-2 truncate px-4 py-2 text-sm">
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
                                    @click.stop.prevent="showTermsAndConditions = true"
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
    import SiteModalFrame from '@/modules/Misc/components/SiteModalFrame.vue';
    import { balances, wallets } from '@/modules/Wallet/services/walletService';
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

    import { ref } from 'vue';
    import flagsmith from 'flagsmith';
    import { addNotification } from '@/modules/Core/services/notification.service';
    import { allSubstrateAddresses, v2Farms } from '@/modules/Farm/services/farm.service';
    import { onBeforeMount } from '@vue/runtime-core';
    import { IFarmV2, IGqlTwin } from 'shared-types/src/interfaces/substrate/farm.interfaces';

    import { validateFarmName } from '@/modules/Farm/validators/farm.validate';
    import {
        activateAccount,
        addStellarPayoutAddress,
        createFarm,
        createTwin,
        signAndAcceptTermsAndConditions,
    } from 'tf-substrate/src/services/farm.service.substrate';
    import { getFarmIdByName, getUsersTermsAndConditionsByAccountId } from 'tf-substrate/src/states/grid.state';
    import { getAllTwinIds } from 'tf-substrate/src/gql/calls/farms.calls';
    import { NotificationType } from 'shared-types/src/enums/global/notification.enums';
    import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';

    const selectedWallet = ref<IWallet>(wallets.value[0]);
    const farmFormErrors = ref<any>({});
    const farmNameToValidate = ref<string>('');

    const isLoading = ref<boolean>(false);
    const loadingSubtitle = ref<string>('');

    const showTermsAndConditions = ref<boolean>(false);
    const termsAndConditionsUrl = <string>flagsmith.getValue('farm_terms_and_conditions_url');
    const termsAndConditionsIsAccepted = ref<boolean>(false);

    const emit = defineEmits(['close']);

    onBeforeMount(() => {
        if (migrationFarm) {
            farmNameToValidate.value = migrationFarm.name;
            selectedWallet.value = migrationFarm.wallet;
        }
    });

    interface Props {
        migrationFarm?: IFarmV2;
    }

    const { migrationFarm } = defineProps<Props>();

    const listenToKeyBindsForValidation = async (e: any) => {
        farmNameToValidate.value = e.target?.value;
        const validationError = await validateFarmName(
            e.target?.value,
            selectedWallet.value.keyPair.getStellarKeyPair().publicKey()
        );

        if (!validationError) return (farmFormErrors.value = {});

        farmFormErrors.value = { farmName: validationError['farmName'] };
    };

    const createNewFarm = async () => {
        const farmName = farmNameToValidate.value;

        const validationError = await validateFarmName(
            farmName,
            selectedWallet.value.keyPair.getStellarKeyPair().publicKey()
        );
        if (validationError) return;
        if (!termsAndConditionsIsAccepted.value) return;

        isLoading.value = true;
        loadingSubtitle.value = 'Starting creation of farm';

        const isAdded = await createSubstrateFarm(farmName);

        isLoading.value = false;
        emit('close');

        if (!isAdded) {
            return addNotification(NotificationType.error, 'Farm creation failed', 'Please contact support');
        }

        if (migrationFarm) {
            v2Farms.value = [];
            return addNotification(
                NotificationType.info,
                'Farm creation on v3 successful',
                'Your farm has been created on Grid v3. Please note that it will take several days for your v2 nodes to be migrated to your v3 farm. Once they have been migrated, you will see them listed under your new v3 farm.'
            );
        }

        addNotification(NotificationType.success, 'Farm Creation Successful');
    };

    const createSubstrateFarm = async (name: string) => {
        const keyRing = selectedWallet.value.keyPair.getSubstrateKeyring();
        const stellarAddress = selectedWallet.value.keyPair.getStellarKeyPair().publicKey();
        const activationUrl = `${flagsmith.getValue('tfchain_activation_base_url')}/activation/activate`;
        const termsAndConditionsUrl = <string>flagsmith.getValue('farm_terms_and_conditions_url');

        const doesHaveTermsAndConditions = await getUsersTermsAndConditionsByAccountId(keyRing.address);
        if (doesHaveTermsAndConditions.length === 0) {
            loadingSubtitle.value = 'Activating account';

            const isActivated = await activateAccount(keyRing.address, activationUrl);
            if (!isActivated) return;

            loadingSubtitle.value = 'Signing terms and conditions';

            const isAccepted = await signAndAcceptTermsAndConditions(keyRing, termsAndConditionsUrl);
            if (!isAccepted) return;
        }

        loadingSubtitle.value = 'Checking twins';
        const twinIds = await getAllTwinIds(allSubstrateAddresses.value);
        const twinId = twinIds.find(
            (t: IGqlTwin) => t.substrateAddress === selectedWallet.value.keyPair.getSubstrateKeyring().address
        );

        if (!twinId) {
            console.info('TwinId is 0, creating twin');

            const isTwinCreated = await createTwin(keyRing);
            if (!isTwinCreated) return;
        }

        loadingSubtitle.value = 'Creating farm';

        const isFarmCreated = await createFarm(keyRing, name);
        if (!isFarmCreated) return;

        const createdFarmId = await getFarmIdByName(name);
        if (createdFarmId == 0) {
            console.error('[Cant get farmId by name]');
            return;
        }

        loadingSubtitle.value = 'Adding payout address';
        const isStellarPayoutAddressAdded = addStellarPayoutAddress(keyRing, stellarAddress, createdFarmId);
        if (!isStellarPayoutAddressAdded) return;

        return true;
    };
</script>
