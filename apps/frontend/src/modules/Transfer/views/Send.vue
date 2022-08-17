<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.back()" />
                </template>
                <h1>Send</h1>
            </PageHeader>
        </template>
        <div class="flex h-full flex-col p-4">
            <div class="absolute right-4 flex items-center space-x-1" @click="scanQr">
                <QrcodeIcon class="h-5" />
                <p class="text-sm font-medium">SCAN QR</p>
            </div>
            <div class="mt-1">
                <div class="flex items-center justify-between">
                    <h2 class="text-sm font-medium text-gray-900">Chain</h2>
                </div>
                <RadioGroup class="mt-2" v-model="selectedChain">
                    <div class="flex gap-3">
                        <RadioGroupOption
                            as="template"
                            v-for="option in [ChainTypes.STELLAR, ChainTypes.SUBSTRATE]"
                            :key="option"
                            :value="option"
                            v-slot="{ active, checked }"
                        >
                            <div
                                :class="[
                                    active ? 'ring-2 ring-primary-500 ring-offset-2' : '',
                                    checked
                                        ? 'border-transparent bg-primary-600 text-white hover:bg-primary-700'
                                        : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
                                    'flex flex-1 items-center justify-center rounded-md border py-3 px-3 text-sm font-medium uppercase',
                                ]"
                            >
                                <RadioGroupLabel as="p" class="capitalize">
                                    {{ $t(`chain.${option}`) }}
                                </RadioGroupLabel>
                            </div>
                        </RadioGroupOption>
                    </div>
                </RadioGroup>
            </div>

            <Listbox v-model="selectedWallet" as="div" class="mt-2" disabled>
                <ListboxLabel class="block text-sm font-medium text-gray-700">From</ListboxLabel>
                <div class="relative">
                    <ListboxButton
                        class="relative w-full cursor-default bg-white py-1 text-left focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
                    >
                        <div class="w-full truncate">
                            <div class="shrink-0 truncate">{{ selectedWallet?.name }}</div>

                            <div v-if="selectedChain === ChainTypes.STELLAR" class="truncate text-gray-500">
                                {{ selectedWallet?.keyPair.getStellarKeyPair().publicKey() }}
                            </div>
                            <div v-if="selectedChain === ChainTypes.SUBSTRATE" class="truncate text-gray-500">
                                {{ selectedWallet?.keyPair.getSubstrateKeyring().address }}
                            </div>
                        </div>
                    </ListboxButton>
                </div>
            </Listbox>
            <div class="mt-4">
                <div>
                    <label for="to" class="block text-sm font-medium text-gray-700">To</label>
                    <div class="mt-1 flex rounded-md shadow-sm">
                        <div class="relative flex w-full items-stretch focus-within:z-10">
                            <input
                                id="to"
                                v-model="toAddress"
                                :disabled="relevantAssets.length <= 0"
                                class="block w-full rounded-l-md border-gray-300 pl-3 focus:border-primary-500 focus:ring-primary-500 disabled:border-gray-300 disabled:bg-gray-50 sm:text-sm"
                                name="to"
                                placeholder="..."
                                type="text"
                            />
                        </div>
                        <button
                            type="button"
                            @click="showContacts = true"
                            class="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <span>
                                <UserIcon class="h-5" />
                            </span>
                        </button>
                    </div>
                </div>
                <div class="text-sm text-red-500" v-if="isValidToAddress === false">Please enter a valid address</div>
            </div>
            <div class="mt-4">
                <div class="block text-sm">
                    <span class="pr-2">Amount</span>
                    <span class="text-xs text-gray-400" @click="setCorrectBalance"
                        >({{ formatCurrency(selectedAssetBalance) }})</span
                    >
                </div>
                <div class="relative mt-1 rounded-md shadow-sm">
                    <input
                        id="amount"
                        v-model="amount"
                        :disabled="relevantAssets.length <= 0"
                        :placeholder="relevantAssets.length <= 0 ? 'No funds available' : '0.00'"
                        class="block w-full rounded-md border-gray-300 pl-4 pr-20 focus:border-primary-500 focus:ring-primary-500 disabled:border-gray-300 disabled:bg-gray-50 sm:text-sm"
                        name="amount"
                        type="number"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center">
                        <label class="sr-only" for="currency">Currency</label>
                        <select
                            id="currency"
                            v-model="selectedAsset"
                            :disabled="relevantAssets.length === 0"
                            class="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-8 text-right text-gray-500 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            name="currency"
                            :key="`${selectedAsset?.asset_code}-${selectedAsset?.type}`"
                        >
                            <option v-for="asset in relevantAssets" :value="asset">{{ asset.asset_code }}</option>
                        </select>
                    </div>
                </div>
                <div class="text-sm text-red-500" v-if="isValidAmount === false">{{ $t('errors.balanceTooLow') }}</div>
                <div class="mt-4 flex space-x-4">
                    <button class="flex-1 rounded-md border border-gray-300 p-1" @click="setAmount(0.25)">25%</button>
                    <button class="flex-1 rounded-md border border-gray-300 p-1" @click="setAmount(0.5)">50%</button>
                    <button class="flex-1 rounded-md border border-gray-300 p-1" @click="setAmount(0.75)">75%</button>
                    <button class="flex-1 rounded-md border border-gray-300 p-1" @click="setAmount(1)">100%</button>
                </div>
            </div>
            <div class="mt-4">
                <div class="block text-sm">
                    <span class="pr-2">Fee</span>
                </div>
                <div class="text-gray-500">Max {{ assetFee?.toFixed(2) }} {{ selectedAsset?.asset_code }}</div>
            </div>
            <div v-if="selectedChain === ChainTypes.STELLAR" class="mt-4">
                <label class="block text-sm font-medium text-gray-700" for="message">Memo</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                    <div class="relative flex grow items-stretch focus-within:z-10">
                        <input
                            id="message"
                            v-model="transactionMessage"
                            class="block w-full rounded-md border-gray-300 pl-3 focus:border-primary-500 focus:ring-primary-500 disabled:border-gray-300 disabled:bg-gray-50 sm:text-sm"
                            name="to"
                            type="text"
                        />
                    </div>
                </div>
                <div class="text-sm text-red-500" v-if="isValidMessage === false">
                    Maximum length of message is 28 characters
                </div>
            </div>
            <div class="grow"></div>
            <div class="mt-4 flex">
                <button
                    :disabled="!selectedWallet || !toAddress || !amount || amount <= 0 || !selectedAsset"
                    class="flex-1 rounded-md bg-blue-600 px-4 py-2 uppercase text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:animate-wiggle"
                    @click="goToConfirm"
                >
                    Send Tokens
                </button>
            </div>
        </div>
    </MainLayout>

    <div v-if="showContacts">
        <Contact @chosenContact="chosenContact" @close="showContacts = false" :chain="selectedChain"></Contact>
    </div>
</template>

<script lang="ts" setup>
    import MainLayout from '@/modules/Misc/layouts/MainLayout.vue';
    import { ArrowLeftIcon, QrcodeIcon, UserIcon } from '@heroicons/vue/outline';
    import PageHeader from '@/modules/Misc/components/header/PageHeader.vue';
    import { useRouter } from 'vue-router';
    import {
        Listbox,
        ListboxButton,
        ListboxLabel,
        RadioGroup,
        RadioGroupLabel,
        RadioGroupOption,
    } from '@headlessui/vue';
    import { computed, nextTick, ref, watch } from 'vue';
    import flagsmith from 'flagsmith';
    import { balances, Wallet, wallets } from '@/modules/Wallet/services/walletService';
    import uniq from 'lodash/uniq';
    import {
        isValidMemoOfTransaction,
        validateStellarAddress,
        validateSubstrateAddress,
        validateWalletAddress,
    } from '@/modules/Wallet/validate/wallet.validate';
    import { toNumber } from 'lodash';
    import { formatCurrency } from '@/modules/Currency/utils/formatCurrency';
    import Contact from '@/modules/Contact/views/Contact.vue';
    import { useDynamicBalance } from '@/modules/Currency/utils/useDynamicBalance';
    import { IContactType } from '@/modules/Contact/interfaces/contact.interface';
    import { addNotification } from '@/modules/Core/services/notification.service';
    import { translate } from '@/modules/Core/utils/translate';
    import { NotificationType } from '@/modules/Core/enums/notification.enum';
    import { ChainTypes, IAssetBalance, IBalance } from 'shared-types';

    const router = useRouter();
    type Asset = { asset_code: string; type: string; fee?: number };
    const allowedAssets: Asset[] = uniq<Asset>(
        <any[]>JSON.parse(<string>flagsmith.getValue('supported-currencies')).map((a: any) => ({
            asset_code: a.asset_code,
            type: a.type.toUpperCase(),
            fee: a?.fee,
        }))
    );

    interface IProps {
        from?: string;
        to?: string;
        amount?: number;
        asset?: Asset;
    }

    const showContacts = ref<boolean>(false);

    const { from, to, amount: initialAmount, asset } = defineProps<IProps>();

    const selectedWallet = ref<Wallet>();
    selectedWallet.value =
        wallets.value?.find(w => w.keyPair.getStellarKeyPair().publicKey() === from) || wallets.value[0];

    const dynamicBalanceCleanUp = ref<() => void>(() => {});

    watch(
        selectedWallet,
        () => {
            if (!selectedWallet.value) return;

            dynamicBalanceCleanUp.value();
            dynamicBalanceCleanUp.value = useDynamicBalance(selectedWallet.value).cleanUp;
        },
        { immediate: true }
    );

    const selectedBalance = computed(() =>
        balances.value.find(t => t.id === selectedWallet?.value?.keyPair.getBasePublicKey())
    );

    const selectedAssetBalance = computed(() => {
        if (!selectedAsset.value) return;
        return selectedBalance.value?.assets.find(
            a => a.name === selectedAsset.value.asset_code && a.type === selectedAsset.value.type
        )?.amount;
    });

    const selectedBalanceWithoutFee = computed(() => {
        if (assetFee.value == undefined) return;
        if (selectedAssetBalance.value == undefined || selectedAssetBalance.value <= 0) return 0;
        return selectedAssetBalance.value - assetFee.value;
    });

    const setCorrectBalance = () => {
        if (selectedBalanceWithoutFee.value == 0 || selectedBalanceWithoutFee.value == undefined) return;
        amount.value = Math.floor(selectedBalanceWithoutFee.value * 100) / 100;
    };

    const selectedChain = ref(ChainTypes.STELLAR);

    const chosenContact = (c: IContactType) => {
        toAddress.value = c.address;
        showContacts.value = false;
    };
    const relevantAssets = computed(() => {
        const selectedAssets = selectedBalance.value?.assets;
        if (!selectedAssets) return [];

        return allowedAssets.filter(asset => {
            const foundBalance = selectedAssets.find(
                sa => sa.name === asset.asset_code && sa.type === asset.type && sa.type === selectedChain.value
            );
            const amount = foundBalance?.amount;
            return amount && amount > 0;
        });
    });

    console.log('Relevant assets', relevantAssets.value);
    console.log('Balance', balances.value);
    console.log('Selected balance', selectedBalance.value);

    const selectedAsset = ref(asset || relevantAssets.value[0]);

    const assetFee = computed(() => {
        console.log(allowedAssets);
        return allowedAssets?.find(
            asset => asset?.asset_code === selectedAsset.value?.asset_code && asset?.type === selectedChain.value
        )?.fee;
    });

    watch(selectedChain, _ => {
        toAddress.value = '';
        amount.value = undefined;
        transactionMessage.value = '';

        isValidToAddress.value = true;
        isValidMessage.value = true;
        isValidAmount.value = true;
    });

    watch(relevantAssets, (newAssets: Asset[], oldAssets: Asset[]) => {
        if (newAssets.length === 0) {
            return;
        }
        if (
            newAssets.findIndex(
                v => v.type === selectedAsset.value?.type && v.asset_code === selectedAsset?.value.type
            ) !== -1
        ) {
            return;
        }

        if (
            newAssets.every(v => oldAssets.findIndex(v2 => v2.type === v.type && v2.asset_code === v.asset_code) !== -1)
        ) {
            return;
        }

        selectedAsset.value = newAssets[0];
    });

    const toAddress = ref(to);
    const amount = ref<number | undefined>(initialAmount);
    const isValidToAddress = ref<boolean>();
    const isValidAmount = ref<boolean>();
    const isValidMessage = ref<boolean>();
    const transactionMessage = ref<string | null>('');

    const setAmount = (multiplier: number) => {
        const assetBalance = selectedBalance.value?.assets.find(
            a => a.name === selectedAsset.value.asset_code && a.type === selectedAsset.value.type
        )?.amount;

        if (!assetBalance) return;
        if (!assetFee.value) return;

        const availableBalanceWithoutFee = assetBalance - assetFee.value;
        const newAmount = availableBalanceWithoutFee * multiplier;
        if (newAmount <= 0) {
            return;
        }
        amount.value = Math.floor(newAmount * 100) / 100;
    };

    const validateAddress = () => {
        if (selectedChain.value === ChainTypes.STELLAR) {
            return (isValidToAddress.value = validateStellarAddress(toAddress.value));
        }

        if (selectedChain.value === ChainTypes.SUBSTRATE) {
            return (isValidToAddress.value = validateSubstrateAddress(toAddress.value));
        }

        return (isValidToAddress.value = false);
    };

    const validateAmount = () => {
        if (assetFee.value == undefined) return (isValidAmount.value = false);

        if (
            amount.value == undefined ||
            amount.value <= 0 ||
            amount.value > toNumber(selectedAssetBalance.value) - assetFee.value
        ) {
            return (isValidAmount.value = false);
        }

        return (isValidAmount.value = true);
    };

    const validateMessage = () => {
        if (transactionMessage.value === null) {
            return (isValidMessage.value = true);
        }
        if (isValidMemoOfTransaction(transactionMessage.value)) {
            return (isValidMessage.value = true);
        }

        return (isValidMessage.value = false);
    };

    const goToConfirm = async () => {
        const isValidAddress = validateAddress();
        const isValidAmount = validateAmount();
        const isValidMessage = validateMessage();

        if (!isValidAmount || !isValidAddress || !isValidMessage) return;

        await router.replace({
            name: 'confirmSend',
            params: {
                from: selectedWallet.value?.keyPair.getStellarKeyPair().publicKey(),
                to: toAddress.value,
                amount: amount.value?.toString(),
                asset: selectedAsset.value.asset_code,
                chainName: selectedChain.value,
                message: transactionMessage.value,
            },
        });
    };
    const scanQr = async () => {
        if (!(<any>window).flutter_inappwebview) alert('Not supported in this browser');

        const code = await (<any>window).flutter_inappwebview?.callHandler('SCAN_QR');
        const url = new URL(code);

        console.log('Received QR Data');
        console.log(url);
        const address = url.hostname === '' ? url.pathname.replace('//', '') : url.hostname;

        const validatedAddress = await validateWalletAddress(address);
        if (validatedAddress.valid && validatedAddress.type != ChainTypes.UNKNOWN) {
            selectedChain.value = validatedAddress.type;
        }

        await new Promise(resolve =>
            nextTick(() => {
                resolve(true);
            })
        );

        const currency: string | undefined = url.protocol.match(/[a-zA-Z]+/g)?.[0].toUpperCase();
        if (currency && relevantAssets.value.findIndex(ra => ra.asset_code === currency) !== -1) {
            selectedAsset.value.asset_code = currency.toUpperCase();
        }

        if (currency && relevantAssets.value.findIndex(ra => ra.asset_code === currency) === -1) {
            const firstBalance = balances.value.find((b: IBalance) =>
                b.assets.find((a: IAssetBalance) => a.name === currency?.toUpperCase() && a.amount > 0)
            );

            selectedWallet.value =
                wallets.value.find(w => w.keyPair.getBasePublicKey() === firstBalance?.id) || selectedWallet.value;
            selectedAsset.value = { asset_code: currency.toUpperCase(), type: 'stellar' };
        }

        amount.value = toNumber(url.searchParams.get('amount'));
        transactionMessage.value = url.searchParams.get('message');
        toAddress.value = address;

        if (selectedBalance.value?.assets.find(a => a.name === selectedAsset.value.asset_code)?.amount === 0) {
            addNotification(
                NotificationType.error,
                translate('errors.noWalletsWithBalance', { asset: selectedAsset.value.asset_code })
            );
        }
    };
</script>

<style scoped></style>
