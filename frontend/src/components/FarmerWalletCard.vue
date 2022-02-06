<template>
    <div v-if="farms.length <= 0">
        <div v-for="possibleName in possibleNames" class="mb-5">
            <div class="relative z-20 w-full rounded-lg bg-white">
                <div class="flex flex-row items-center justify-between">
                    <div class="max-w-[60%] truncate p-4 font-medium">
                        {{ possibleName }}
                    </div>
                    <div>
                        <button
                            class="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
                        >
                            Migrate to v3
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="relative col-span-1 min-h-[56px] divide-y divide-gray-200 rounded-lg bg-slate-600/60 shadow">
            <div v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center rounded-lg text-white">
                <div class="flex flex-col items-center justify-center text-center">
                    <h2 class="mt-4 text-sm">
                        <span class="animate-pulse">Loading</span> <span class="animate-bounce">...</span>
                    </h2>
                    <h3 class="text-sm" v-if="subtitle">{{ subtitle }}</h3>
                </div>
            </div>
            <div v-else-if="termsAndConditions.length === 0" class="relative z-20 w-full rounded-lg bg-white">
                <form @submit.prevent.stop="validateFarmNameForm">
                    <div class="flex flex-col gap-2">
                        <div
                            @click="showCreateFarmDetails = !showCreateFarmDetails"
                            class="flex flex-row items-center justify-between"
                        >
                            <div class="max-w-[90%] truncate p-4 font-medium">
                                {{ wallet.name }} {{ wallet.keyPair.getStellarKeyPair().publicKey() }}
                            </div>
                            <div>
                                <ChevronUpIcon v-if="showCreateFarmDetails" class="-ml-1 mr-2 h-5 w-5" />
                                <ChevronDownIcon v-if="!showCreateFarmDetails" class="-ml-1 mr-2 h-5 w-5" />
                            </div>
                        </div>
                        <div v-if="showCreateFarmDetails">
                            <div class="px-4 pb-4">
                                <div>
                                    <h2 class="text-sm font-semibold uppercase">Choose a wallet</h2>
                                    <Menu as="div" class="relative inline-block w-full pt-2 text-left">
                                        <div>
                                            <MenuButton
                                                class="inline-flex w-full justify-between rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
                                            >
                                                <div class="flex-0 truncate">
                                                    {{ pickedWallet.name }}
                                                </div>
                                                <div class="shrink-0">
                                                    ({{
                                                        walletBalances?.assets.filter(asset => (asset.name = 'TFT'))[0]
                                                            ?.amount
                                                    }}
                                                    TFT)
                                                </div>
                                                <ChevronDownIcon
                                                    class="ml-2 -mr-1 h-5 w-5 text-primary-200 hover:text-primary-100"
                                                    aria-hidden="true"
                                                />
                                            </MenuButton>
                                        </div>

                                        <MenuItems
                                            class="absolute left-0 z-50 mt-2 w-full origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        >
                                            <div class="max-h-28 w-full divide-y overflow-y-auto">
                                                <MenuItem
                                                    v-for="wallet in allWallets.filter(
                                                        wallet => wallet.name !== pickedWallet.name
                                                    )"
                                                    v-slot="{ active }"
                                                >
                                                    <div
                                                        class="flex w-full justify-between gap-2 truncate px-4 py-2 text-sm"
                                                        @click="pickedWallet = wallet"
                                                    >
                                                        <div class="flex items-center truncate">
                                                            {{ wallet.name }} <br />
                                                        </div>
                                                        <div class="flex items-center justify-center gap-2">
                                                            {{
                                                                walletBalances?.assets.filter(
                                                                    asset => (asset.name = 'TFT')
                                                                )[0]?.amount
                                                            }}
                                                            <AssetIcon />
                                                        </div>
                                                    </div>
                                                </MenuItem>
                                            </div>
                                        </MenuItems>
                                    </Menu>
                                </div>

                                <div>
                                    <h2 class="pt-4 text-sm font-semibold uppercase">Farm name</h2>
                                    <label>
                                        <div class="pt-2">
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

                                        <div class="mt-1 text-sm text-red-600" v-if="farmFormErrors.farmName">
                                            {{ farmFormErrors.farmName }}
                                        </div>
                                        <div class="mt-1 text-xs text-gray-500" v-else>
                                            No spaces or special characters
                                        </div>
                                    </label>

                                    <Menu
                                        as="div"
                                        class="relative inline-block text-left"
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
                                </div>

                                <div class="pt-4">
                                    <input
                                        type="submit"
                                        value="Submit"
                                        class="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <template :key="farm.name + index" v-for="(farm, index) in farms">
        <Disclosure as="div" class="relative col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
            <DisclosureButton as="div" class="flex flex-row items-center justify-between">
                <div class="text-md max-w-90 truncate p-4 font-medium">
                    {{ wallet.keyPair.getStellarKeyPair().publicKey() }}
                    {{ farm.name }}
                </div>
                <div>
                    <ChevronUpIcon v-if="showDetails" class="-ml-1 mr-2 h-5 w-5" />
                    <ChevronDownIcon v-if="!showDetails" class="-ml-1 mr-2 h-5 w-5" />
                </div>
            </DisclosureButton>

            <DisclosurePanel>
                <div class="p-4">
                    <div class="space-y-2">
                        <div>
                            <div role="list" class="space-y-4 sm:px-6 lg:px-8">
                                <div class="space-y-1 sm:flex sm:items-baseline sm:justify-between">
                                    <div>
                                        <div class="flex flex-row items-center">
                                            <h2 class="text-sm font-semibold uppercase">Stellar address</h2>
                                            <ClipboardCopyIcon
                                                @click="copyToClipboard(wallet.keyPair.getStellarKeyPair().publicKey())"
                                                class="ml-2 h-4 text-black"
                                            />
                                        </div>

                                        <div
                                            class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500"
                                        >
                                            {{ wallet.keyPair.getStellarKeyPair().publicKey() }}
                                        </div>

                                        <div
                                            class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500"
                                        >
                                            {{ farm.wallet.keyPair.getSubstrateKeyring().address }}
                                        </div>
                                        <div class="mt-1 text-xs font-light text-orange-500">
                                            Note: This address will be used for payout
                                        </div>
                                    </div>

                                    <!--                                    <div class="pt-4">-->
                                    <!--                                        <h2 class="text-sm font-semibold uppercase">Balances</h2>-->
                                    <!--                                        <div class="mt-2 space-y-2">-->
                                    <!--                                            <BalanceCard-->
                                    <!--                                                v-for="assetBalance in walletBalances?.assets"-->
                                    <!--                                                :balance="assetBalance"-->
                                    <!--                                            ></BalanceCard>-->
                                    <!--                                        </div>-->
                                    <!--                                    </div>-->

                                    <div class="pt-4">
                                        <h2 class="text-sm font-semibold uppercase">Wallet name</h2>
                                        <span class="text-sm text-gray-500"> {{ wallet.name }}</span>
                                    </div>

                                    <div class="pt-4">
                                        <h2 class="text-sm font-semibold uppercase">Farm id</h2>
                                        <span class="text-sm text-gray-500"> {{ farm.id }}</span>
                                    </div>

                                    <div class="pt-4">
                                        <h2 class="text-sm font-semibold uppercase">Twin id</h2>
                                        <span class="text-sm text-gray-500"> {{ farm.twin_id }}</span>
                                    </div>

                                    <div class="pt-4">
                                        <h2 class="text-sm font-semibold uppercase">Nodes</h2>
                                        <div class="text-sm text-gray-500">
                                            <p
                                                class="mt-1 whitespace-nowrap text-gray-600 sm:mt-0 sm:ml-3"
                                                v-if="nodes && nodes.length > 0"
                                            >
                                                {{ nodes.map((node:any) => node.id).join(', ') }}
                                            </p>
                                            <p
                                                class="mt-1 whitespace-nowrap text-sm text-gray-600 sm:mt-0 sm:ml-3"
                                                v-if="nodes && nodes.length === 0"
                                            >
                                                No nodes connected with this farm
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DisclosurePanel>
        </Disclosure>
    </template>

    <!--    <modal-->
    <!--        :key="showTermsAndConditionsModal"-->
    <!--        v-if="showTermsAndConditionsModal"-->
    <!--        @close="showTermsAndConditionsModal = false"-->
    <!--        :action="true"-->
    <!--    >-->
    <!--        <template #header> You have to accept the terms and conditions </template>-->
    <!--        <template #content>-->
    <!--            <SwitchGroup as="div" class="flex items-center justify-between px-4">-->
    <!--                <span class="flex flex-grow flex-col">-->
    <!--                    <SwitchLabel as="span" class="text-sm font-medium text-gray-900">Terms & Conditions</SwitchLabel>-->
    <!--                    <SwitchDescription as="span" class="text-sm text-gray-500"-->
    <!--                        >I have read and accept the-->
    <!--                        <a-->
    <!--                            class="inline underline decoration-primary-500 decoration-2 focus:font-semibold focus:text-primary-600 focus:outline-none"-->
    <!--                            tabindex="0"-->
    <!--                            @click.stop.prevent="showTerms()"-->
    <!--                        >-->
    <!--                            terms and conditions-->
    <!--                        </a>-->
    <!--                    </SwitchDescription>-->
    <!--                </span>-->
    <!--                <Switch-->
    <!--                    v-model="termsAndConditionsIsAccepted"-->
    <!--                    :class="[-->
    <!--                        termsAndConditionsIsAccepted ? 'bg-primary-600' : 'bg-gray-200',-->
    <!--                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',-->
    <!--                    ]"-->
    <!--                >-->
    <!--                    <span-->
    <!--                        :class="[-->
    <!--                            termsAndConditionsIsAccepted ? 'translate-x-5' : 'translate-x-0',-->
    <!--                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',-->
    <!--                        ]"-->
    <!--                        aria-hidden="true"-->
    <!--                    />-->
    <!--                </Switch>-->
    <!--            </SwitchGroup>-->
    <!--        </template>-->
    <!--        <template #actions>-->
    <!--            <button-->
    <!--                @click="createFarmFormSubmit"-->
    <!--                :disabled="!termsAndConditionsIsAccepted"-->
    <!--                class="rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-500"-->
    <!--            >-->
    <!--                Create farm-->
    <!--            </button>-->
    <!--            <button-->
    <!--                @click="showTermsAndConditionsModal = false"-->
    <!--                class="rounded-md py-2 px-4 text-sm font-medium text-orange-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"-->
    <!--            >-->
    <!--                Cancel-->
    <!--            </button>-->
    <!--        </template>-->
    <!--    </modal>-->

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
        submitExtrensic,
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
    import { ClipboardCopyIcon } from '@heroicons/vue/outline';
    import AssetIcon from '@/components/AssetIcon.vue';

    const v2farms: {
        id: number;
        name: string;
        stellar_wallet_addres: string;
    }[] = [];

    interface IProps {
        wallet: Wallet;
        allWallets: Wallet[];
    }

    const possibleNames = ref<string[]>([]);

    const { wallet, allWallets } = defineProps<IProps>();

    const loading = ref(true);
    const twinId = ref();
    const ipAmount = ref(1);
    const farmNameToValidate = ref();
    const pickedWallet = ref<Wallet>(allWallets[0]);
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

        await validateFarmName(farmName, pickedWallet.value.keyPair.getStellarKeyPair().publicKey());
        if (farmFormErrors.value?.farmName) return;

        showTermsAndConditionsModal.value = true;
    };

    const validateFarmName = async (value: string, myStellarAddress: string) => {
        const wasFound = v2farms.find(farm => farm.name === value);

        if (wasFound && wasFound.stellar_wallet_addres === pickedWallet.value.keyPair.getStellarKeyPair().publicKey()) {
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
        validateFarmName(value, pickedWallet.value.keyPair.getStellarKeyPair().publicKey());
    });

    const farmFormSubmit = async (evt: Event) => {
        showFarmDialog.value = false;

        const formData = new FormData(evt.target as HTMLFormElement);

        const farmName = <string>formData.get('farmName');
        await validateFarmName(farmName, pickedWallet.value.keyPair.getStellarKeyPair().publicKey());
        if (farmFormErrors.value?.farmName) return;

        const publicIps = <string[]>formData.getAll('publicIP') || [];

        await addFarm(farmName, publicIps);
    };

    const acceptTermsAndConditions = async () => {
        subtitle.value = 'could take some time to go through';
        loading.value = true;

        const id = pickedWallet.value.keyPair.getSubstrateKeyring().address;

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
        return balances.value.find(t => t.id === pickedWallet.value.keyPair.getBasePublicKey());
    });

    const termsAndConditionsUrl = <string>flagsmith.getValue('farm_terms_and_conditions_url');

    const addFarm = async (farmName: string, publicIps: string[]) => {
        twinId.value = await getTwinId(pickedWallet.value.keyPair.getSubstrateKeyring().address);
        if (twinId.value === 0) {
            await addTwin();
        }
        loading.value = true;
        subtitle.value = 'Creating farm';

        const currentAmountOfFarms = farms.value.length;
        const api = await getSubstrateApi();

        const submittableExtrinsic = api.tx.tfgridModule.createFarm(farmName, publicIps);

        try {
            await submitExtrensic(submittableExtrinsic, pickedWallet.value.keyPair.getSubstrateKeyring());
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
            pickedWallet.value.keyPair.getStellarKeyPair().publicKey()
        );

        await submitExtrensic(submittableExtrinsic1, pickedWallet.value.keyPair.getSubstrateKeyring());

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
        await submitExtrensic(submittableExtrinsic, pickedWallet.value.keyPair.getSubstrateKeyring());
    };

    const addTwin = async () => {
        loading.value = true;
        subtitle.value = 'creating twin';
        const api = await getSubstrateApi();
        const submittableExtrinsic = api.tx.tfgridModule.createTwin('127.0.0.1');
        await submitExtrensic(submittableExtrinsic, pickedWallet.value.keyPair.getSubstrateKeyring());

        while (true) {
            twinId.value = await getTwinId(pickedWallet.value.keyPair.getSubstrateKeyring().address);
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
        activationServiceForSubstrate(pickedWallet.value.keyPair.getSubstrateKeyring().address);
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
        await validateFarmName(farmName, pickedWallet.value.keyPair.getStellarKeyPair().publicKey());

        if (farmFormErrors.value?.farmName) return;

        loading.value = true;
        subtitle.value = 'Starting creation of farm';

        await acceptTermsAndConditions();

        showTermsAndConditionsModal.value = false;

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

<style scoped></style>
