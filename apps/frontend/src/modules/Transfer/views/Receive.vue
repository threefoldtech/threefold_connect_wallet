<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.back()" />
                </template>
                <h1>{{ $t('transfer.receive.title') }}</h1>
            </PageHeader>
        </template>
        <div class="mx-4 mt-2">
            <div class="flex items-center justify-between">
                <h2 class="text-sm font-medium text-gray-900">{{ $t('transfer.receive.chain') }}</h2>
            </div>
            <RadioGroup v-model="selectedChain" class="mt-2">
                <div class="flex gap-3">
                    <RadioGroupOption
                        as="template"
                        v-for="option in ['stellar', 'substrate']"
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
        <div class="mx-4 mt-4">
            <div>
                <label class="block text-sm font-medium text-gray-700"> {{ $t(`transfer.receive.to`) }}</label>
                <div class="relative mt-1 truncate">
                    <span class="shrink-0 truncate">{{ selectedWallet?.name }}</span>
                    <span v-if="selectedChain === ChainTypes.STELLAR" class="ml-2 truncate text-gray-500">{{
                        selectedWallet?.keyPair.getStellarKeyPair().publicKey()
                    }}</span>
                    <span v-if="selectedChain === ChainTypes.SUBSTRATE" class="ml-2 truncate text-gray-500">{{
                        selectedWallet?.keyPair.getSubstrateKeyring().address
                    }}</span>
                </div>
            </div>
            <div class="w-2/12"></div>
        </div>

        <div class="mx-4 mt-4 flex flex-row">
            <div class="w-7/12">
                <label class="block text-sm font-medium text-gray-700" for="amount">{{
                    $t('transfer.receive.amount')
                }}</label>
                <div class="relative mt-1 rounded-md shadow-sm">
                    <input
                        v-model="receiveAmount"
                        id="amount"
                        class="block w-full rounded-md border-gray-300 pl-4 pr-4 focus:border-primary-500 focus:ring-primary-500 disabled:border-gray-300 disabled:bg-gray-50 sm:text-sm"
                        name="amount"
                        type="number"
                    />
                </div>
                <div v-if="isValidAmount === false" class="text-xs text-red-500">{{ $t('errors.validAmount') }}</div>
            </div>
            <div class="w-1/12"></div>
            <div class="w-5/12">
                <Listbox as="div" v-model="selectedAsset">
                    <ListboxLabel class="block text-sm font-medium text-gray-700">{{
                        $t('transfer.receive.asset')
                    }}</ListboxLabel>
                    <div class="relative mt-1">
                        <ListboxButton
                            class="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
                        >
                            <span class="inline-flex w-full truncate">
                                {{ $t(`currency.short.${selectedAsset.asset_code}`) }}
                            </span>
                            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <SelectorIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                            </span>
                        </ListboxButton>

                        <transition
                            leave-active-class="transition ease-in duration-100"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0"
                        >
                            <ListboxOptions
                                class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                            >
                                <ListboxOption
                                    v-for="asset in relevantChainAssets"
                                    v-slot="{ active, selected }"
                                    :value="asset"
                                    as="template"
                                >
                                    <li
                                        :class="[
                                            active ? 'bg-primary-600 text-white' : 'text-gray-900',
                                            'relative cursor-default select-none py-2 pl-3 pr-9',
                                        ]"
                                    >
                                        <div class="flex">
                                            <span
                                                :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']"
                                                class="shrink-0"
                                            >
                                                {{ $t(`currency.short.${asset.asset_code}`) }}
                                            </span>
                                        </div>

                                        <span
                                            v-if="selected"
                                            :class="[
                                                active ? 'text-white' : 'text-primary-600',
                                                'absolute inset-y-0 right-0 flex items-center pr-4',
                                            ]"
                                        >
                                            <CheckIcon aria-hidden="true" class="h-5 w-5" />
                                        </span>
                                    </li>
                                </ListboxOption>
                            </ListboxOptions>
                        </transition>
                    </div>
                </Listbox>
            </div>
        </div>

        <div class="mx-4 mt-4" v-if="selectedChain === 'stellar'">
            <label class="block text-sm font-medium text-gray-700" for="message">{{
                $t('transfer.receive.message')
            }}</label>
            <div class="relative mt-1 rounded-md shadow-sm">
                <input
                    v-model="receiveMessage"
                    id="message"
                    class="block w-full rounded-md border-gray-300 pl-4 pr-20 focus:border-primary-500 focus:ring-primary-500 disabled:border-gray-300 disabled:bg-gray-50 sm:text-sm"
                    name="message"
                    type="text"
                />
            </div>
            <div v-if="isValidMemo === false" class="text-xs text-red-500">
                Maximum length of message is 28 characters
            </div>
        </div>
        <div class="mx-4 mt-4 flex">
            <button
                @click="generateQRCode"
                class="flex-1 rounded-md bg-blue-600 px-4 py-2 uppercase text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:animate-wiggle"
            >
                {{ $t('transfer.receive.generateQRButton') }}
            </button>
        </div>

        <Dialog as="div" class="fixed inset-0 overflow-y-auto" v-if="showImage" open>
            <DialogOverlay class="pointer-events-none fixed inset-0 bg-gray-700/90"></DialogOverlay>
            <div class="flex min-h-screen text-center md:block md:px-2 lg:px-4" @click="showImage = false">
                <span class="hidden md:inline-block md:h-screen md:align-middle" aria-hidden="true">&#8203;</span>
                <div class="flex h-screen w-full flex-col justify-center p-4">
                    <div class="z-50 flex flex-row justify-center">
                        <img
                            class="z-50 h-full w-4/5 bg-white object-contain p-8 text-center"
                            v-if="imageUrl"
                            :src="imageUrl"
                            alt="qr-code"
                            crossorigin="anonymous"
                            @click="showImage = true"
                        />
                    </div>
                </div>
            </div>
            <div class="fixed top-4 right-4">
                <XIcon class="h-6 w-6 text-white" @click="showImage = false" />
            </div>
        </Dialog>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/modules/Misc/layouts/MainLayout.vue';
    import ArrowLeftIcon from '@heroicons/vue/outline/ArrowLeftIcon';
    import PageHeader from '@/modules/Misc/components/header/PageHeader.vue';
    import { useRouter } from 'vue-router';
    import { computed, ref, watch } from 'vue';
    import {
        Dialog,
        Listbox,
        ListboxButton,
        ListboxOption,
        ListboxLabel,
        ListboxOptions,
        RadioGroup,
        RadioGroupLabel,
        RadioGroupOption,
        DialogOverlay,
    } from '@headlessui/vue';
    import { wallets } from '@/modules/Wallet/services/wallet.service';
    import uniq from 'lodash/uniq';
    import flagsmith from 'flagsmith';
    import { isValidMemoOfTransaction } from '@/modules/Wallet/validate/wallet.validate';
    import { XIcon, SelectorIcon, CheckIcon } from '@heroicons/vue/solid';
    import { ChainTypes } from 'shared-types';
    import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';

    const router = useRouter();

    interface IProps {
        assetCode?: string;
        toAddress: string;
        amount?: number;
        message?: string;
    }

    const { toAddress } = defineProps<IProps>();

    const isValidAmount = ref<boolean>();
    const selectedChain = ref('stellar');
    const receiveAmount = ref<Number>(0);
    const receiveMessage = ref<string>('');
    const imageUrl = ref();
    const showImage = ref(false);
    const isValidMemo = ref<boolean>();
    const selectedWallet = ref<IWallet>(
        wallets.value?.find((w: IWallet) => w.keyPair.getStellarKeyPair().publicKey() === toAddress) || wallets.value[0]
    );

    type Asset = { asset_code: string; type: string };

    const allowedAssets: Asset[] = uniq<Asset>(
        <any[]>JSON.parse(<string>flagsmith.getValue('supported-currencies')).map((a: any) => ({
            asset_code: a.asset_code,
            type: a.type,
        }))
    );

    const relevantChainAssets = computed(() => allowedAssets.filter(asset => asset.type === selectedChain.value));
    const selectedAsset = ref<Asset>(relevantChainAssets.value[0]);

    const withdrawToAddress = computed(() =>
        selectedChain.value === 'stellar'
            ? selectedWallet.value?.keyPair.getStellarKeyPair().publicKey()
            : selectedWallet.value?.keyPair.getSubstrateKeyring().address
    );

    watch(relevantChainAssets, () => (selectedAsset.value = <Asset>relevantChainAssets.value[0]));

    const validateMemoAddress = () => {
        const isValidTransactionMemo = isValidMemoOfTransaction(receiveMessage.value);

        if (!isValidTransactionMemo && selectedChain.value === ChainTypes.STELLAR) {
            return (isValidMemo.value = false);
        }

        return (isValidMemo.value = true);
    };

    const validateReceiveAmount = () => {
        if (receiveAmount.value <= 0) {
            return (isValidAmount.value = false);
        }

        return (isValidAmount.value = true);
    };

    // selectedCurrency:selectedAccountId?amount=givenAmount.tofixed(7)&message=encodeURIComponent(message)&sender=me
    const generateQRCode = () => {
        const isValidMemo = validateMemoAddress();
        const isValidReceiveAmount = validateReceiveAmount();

        if (!isValidMemo || !isValidReceiveAmount) {
            return;
        }

        const data = `${selectedAsset.value.asset_code}:${withdrawToAddress.value}?amount=${receiveAmount.value.toFixed(
            7
        )}&message=${encodeURIComponent(receiveMessage.value.trim())}&sender=me`;

        // Needed to make transpiling the qr code possible
        const QRCode = require('qrcode');
        QRCode.toDataURL(data, { errorCorrectionLevel: 'M', type: 'svg' }, (err: any, url: string) => {
            imageUrl.value = url;
            showImage.value = true;
        });
    };
</script>

<style scoped></style>
