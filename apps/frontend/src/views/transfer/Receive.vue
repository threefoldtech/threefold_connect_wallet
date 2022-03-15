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
                    <span v-if="selectedChain === 'stellar'" class="ml-2 truncate text-gray-500">{{
                        selectedWallet?.keyPair.getStellarKeyPair().publicKey()
                    }}</span>
                    <span v-if="selectedChain === 'substrate'" class="ml-2 truncate text-gray-500">{{
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
                <div v-if="isValidAmount === false" class="text-xs text-red-500">Please enter a valid amount</div>
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
                Maximum length of message is 29 characters
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
                <div class="flex h-screen w-screen flex-col justify-center p-4">
                    <div class="z-50">
                        <img
                            class="z-50 h-full w-full bg-white object-contain p-8"
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
    import MainLayout from '@/layouts/MainLayout.vue';
    import ArrowLeftIcon from '@heroicons/vue/outline/ArrowLeftIcon';
    import PageHeader from '@/components/header/PageHeader.vue';
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
    import { XIcon, SelectorIcon, CheckIcon } from '@heroicons/vue/solid';

    const router = useRouter();

    import QRCodeStyling from 'qrcode-vue3/src/core/QRCodeStyling';
    import { balances, Wallet, wallets } from '@/service/walletService';
    import uniq from 'lodash/uniq';
    import flagsmith from 'flagsmith';
    import { isValidMemoOfTransaction } from '@/util/validate';
    import { ChainTypes } from '@/enums/chains.enums';

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
    const selectedWallet = ref<Wallet>(
        wallets.value?.find(w => w.keyPair.getStellarKeyPair().publicKey() === toAddress) || wallets.value[0]
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

        const qr = new QRCodeStyling({
            data: data,
            width: 600,
            height: 600,
            qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'L' },
            imageOptions: { hideBackgroundDots: true, imageSize: 1, margin: 2 },
            dotsOptions: {
                type: 'dots',
                color: '#020054',
            },
            backgroundOptions: { color: '#ffffff' },
            image: 'data:image/png;base64,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',
            cornersSquareOptions: { type: 'extra-rounded', color: '#020054' },
            cornersDotOptions: { type: 'dot', color: '#020054' },
        });

        qr.getImageUrl('png').then(url => (imageUrl.value = url));
        showImage.value = true;
    };
</script>

<style scoped></style>
