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
        <div class="p-4 flex flex-col h-full">
            <div class="absolute right-4 flex items-center space-x-1" @click="scanQr">
                <QrcodeIcon class="h-5" />
                <p class="font-medium text-sm">SCAN QR</p>
            </div>

            <div class="mt-1">
                <div class="flex items-center justify-between">
                    <h2 class="text-sm font-medium text-gray-900">Chain</h2>
                </div>
                <RadioGroup class="mt-2" v-model="selectedChain">
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
                                    active ? 'ring-2 ring-offset-2 ring-primary-500' : '',
                                    checked
                                        ? 'bg-primary-600 border-transparent text-white hover:bg-primary-700'
                                        : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50',
                                    'border rounded-md py-3 px-3 flex items-center justify-center text-sm font-medium uppercase flex-1',
                                ]"
                            >
                                <RadioGroupLabel as="p">
                                    {{ option }}
                                </RadioGroupLabel>
                            </div>
                        </RadioGroupOption>
                    </div>
                </RadioGroup>
            </div>
            <Listbox v-model="selectedWallet" as="div" class="mt-2">
                <ListboxLabel class="block text-sm font-medium text-gray-700">From</ListboxLabel>
                <div class="mt-1 relative">
                    <ListboxButton
                        class="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                        <span class="w-full inline-flex truncate">
                            <span class="truncate shrink-0">{{ selectedWallet?.name }}</span>
                            <span v-if="selectedChain === 'stellar'" class="ml-2 truncate text-gray-500">{{
                                selectedWallet?.keyPair.getStellarKeyPair().publicKey()
                            }}</span>
                            <span v-if="selectedChain === 'substrate'" class="ml-2 truncate text-gray-500">{{
                                selectedWallet?.keyPair.getSubstrateKeyring().address
                            }}</span>
                        </span>
                        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <SelectorIcon aria-hidden="true" class="h-5 w-5 text-gray-400" />
                        </span>
                    </ListboxButton>

                    <transition
                        leave-active-class="transition ease-in duration-100"
                        leave-from-class="opacity-100"
                        leave-to-class="opacity-0"
                    >
                        <ListboxOptions
                            class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                        >
                            <ListboxOption
                                v-for="wallet in wallets"
                                v-slot="{ active, selected }"
                                :value="wallet"
                                as="template"
                            >
                                <li
                                    :class="[
                                        active ? 'text-white bg-primary-600' : 'text-gray-900',
                                        'cursor-default select-none relative py-2 pl-3 pr-9',
                                    ]"
                                >
                                    <div class="flex">
                                        <span
                                            :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']"
                                            class="shrink-0"
                                        >
                                            {{ wallet?.name }}
                                        </span>
                                        <span
                                            v-if="selectedChain === 'stellar'"
                                            :class="[active ? 'text-primary-200' : 'text-gray-500', 'ml-2 truncate']"
                                        >
                                            {{ wallet?.keyPair.getStellarKeyPair().publicKey() }}
                                        </span>

                                        <span
                                            v-if="selectedChain === 'substrate'"
                                            :class="[active ? 'text-primary-200' : 'text-gray-500', 'ml-2 truncate']"
                                        >
                                            {{ wallet?.keyPair.getSubstrateKeyring().address }}
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
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700" for="to">To</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                    <div class="relative flex items-stretch grow focus-within:z-10">
                        <input
                            id="to"
                            v-model="toAddress"
                            :disabled="relevantAssets.length <= 0"
                            class="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md pl-3 sm:text-sm border-gray-300 disabled:border-gray-300 disabled:bg-gray-50"
                            name="to"
                            placeholder="..."
                            type="text"
                        />
                    </div>
                    <!--<button
                        class="-ml-px relative inline-flex items-center space-x-2 px-2 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        type="button"
                    >
                        <UserIcon class="w-6 text-primary-600"></UserIcon>
                    </button>-->
                </div>
            </div>
            <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700" for="amount">Amount</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                    <input
                        id="amount"
                        v-model="amount"
                        :disabled="relevantAssets.length <= 0"
                        :placeholder="relevantAssets.length <= 0 ? 'no funds on this wallet' : '0.00'"
                        class="focus:ring-primary-500 focus:border-primary-500 block w-full pl-4 pr-20 sm:text-sm border-gray-300 rounded-md disabled:border-gray-300 disabled:bg-gray-50"
                        name="amount"
                        type="number"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center">
                        <label class="sr-only" for="currency">Currency</label>
                        <select
                            id="currency"
                            v-model="selectedAsset"
                            :disabled="relevantAssets.length === 0"
                            class="focus:ring-primary-500 focus:border-primary-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                            name="currency"
                            :key="`${selectedAsset?.asset_code}-${selectedAsset?.type}`"
                        >
                            <option v-for="asset in relevantAssets" :value="asset">{{ asset.asset_code }}</option>
                        </select>
                    </div>
                </div>
                <div class="flex mt-4 space-x-4">
                    <button class="p-1 flex-1 border border-gray-300 rounded-md" @click="setAmount(0.25)">25%</button>
                    <button class="p-1 flex-1 border border-gray-300 rounded-md" @click="setAmount(0.5)">50%</button>
                    <button class="p-1 flex-1 border border-gray-300 rounded-md" @click="setAmount(0.75)">75%</button>
                    <button class="p-1 flex-1 border border-gray-300 rounded-md" @click="setAmount(1)">100%</button>
                </div>
            </div>
            <div class="mt-4">
                <p>Fee {{ fee.toFixed(7) }} {{ asset?.asset_code }}</p>
            </div>
            <div class="grow"></div>
            <div class="mt-4 flex">
                <button
                    :disabled="!selectedWallet || !toAddress || !amount || amount <= 0 || !selectedAsset"
                    class="px-4 py-2 text-white bg-blue-600 rounded-md flex-1 disabled:bg-gray-300 disabled:text-gray-600 disabled:hover:animate-wiggle"
                    @click="goToConfirm"
                >
                    send tokens
                </button>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import { UserIcon, CheckIcon, SelectorIcon, ArrowLeftIcon, QrcodeIcon } from '@heroicons/vue/outline';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { useRoute, useRouter } from 'vue-router';
    import {
        Listbox,
        ListboxButton,
        ListboxLabel,
        ListboxOption,
        ListboxOptions,
        RadioGroup,
        RadioGroupLabel,
        RadioGroupOption,
    } from '@headlessui/vue';
    import { computed, ref, watch } from 'vue';
    import flagsmith from 'flagsmith';
    import { AssetBalance, Balance, balances, Wallet, wallets } from '@/service/walletService';
    import uniq from 'lodash/uniq';

    const router = useRouter();
    type Asset = { asset_code: string; type: string };
    const allowedAssets: Asset[] = uniq<Asset>(
        <any[]>JSON.parse(<string>flagsmith.getValue('currencies')).map((a: any) => ({
            asset_code: a.asset_code,
            type: a.type,
        }))
    );

    interface IProps {
        from?: string;
        to?: string;
        amount?: number;
        asset?: Asset;
    }

    const { from, to, amount: initialAmount, asset } = defineProps<IProps>();

    const selectedWallet = ref<Wallet>();
    selectedWallet.value =
        wallets.value?.find(w => w.keyPair.getStellarKeyPair().publicKey() === from) || wallets.value[0];

    const selectedBalance = computed(() =>
        balances.value.find(t => t.id === selectedWallet?.value.keyPair.getStellarKeyPair().publicKey())
    );

    const selectedChain = ref('stellar');

    const relevantAssets = computed(() => {
        return allowedAssets
            .filter(asset => {
                return (
                    (selectedBalance.value?.assets.find(balance => balance.name === asset.asset_code)?.amount || 0) > 0
                );
            })
            .filter(asset => {
                return asset.type === selectedChain.value;
            });
    });

    const selectedAsset = ref(asset || relevantAssets.value[0]);

    watch(relevantAssets, (value: Asset[]) => {
        if (value.length === 0) {
            return;
        }
        if (
            value.findIndex(v => v.type === selectedAsset.value?.type && v.asset_code === selectedAsset?.value.type) !==
            -1
        ) {
            return;
        }
        selectedAsset.value = value[0];
    });

    const toAddress = ref(to);
    const amount = ref(initialAmount);
    const fee = Number(flagsmith.getValue('fee-amount'));

    const setAmount = (multiplier: number) => {
        console.log(Number());
        const assetBalance = selectedBalance.value?.assets.find(
            a => a.name === selectedAsset.value.asset_code && a.type === selectedAsset.value.type
        )?.amount;

        if (!assetBalance) return;

        const availableBalanceWithoutfee = assetBalance - fee;
        console.log(availableBalanceWithoutfee);
        const newAmount = availableBalanceWithoutfee * multiplier;
        if (newAmount <= 0) {
            return;
        }
        amount.value = newAmount;
    };

    const goToConfirm = async () => {
        await router.replace({
            name: 'confirmSend',
            params: {
                from: selectedWallet.value.keyPair.getStellarKeyPair().publicKey(),
                to: toAddress.value,
                amount: Number(amount.value),
                asset: selectedAsset.value.asset_code,
            },
        });
    };
    const scanQr = async () => {
        if (!(<any>window).flutter_inappwebview) alert('not supported in this browser');

        const code = await (<any>window).flutter_inappwebview?.callHandler('SCAN_QR');

        const url = new URL(code);
        const address = url.hostname === '' ? url.pathname.replace('//', '') : url.hostname;
        const currency: string | undefined = url.protocol.match(/[a-zA-Z]+/g)?.[0];

        toAddress.value = address;
        if (currency && relevantAssets.value.findIndex(ra => ra.asset_code === currency) !== -1) {
            selectedAsset.value.asset_code = currency.toUpperCase();
        }

        if (currency && relevantAssets.value.findIndex(ra => ra.asset_code === currency) === -1) {
            const firstBalance = balances.value.find((b: Balance) =>
                b.assets.find((a: AssetBalance) => a.name === currency?.toUpperCase() && a.amount > 0)
            );

            selectedWallet.value =
                wallets.value.find(w => w.keyPair.getBasePublicKey() === firstBalance?.id) || selectedWallet.value;
            selectedAsset.value = { asset_code: currency.toUpperCase(), type: 'stellar' };
        }

        if (selectedBalance.value?.assets.find(a => a.name === selectedAsset.value.asset_code)?.amount === 0) {
            alert(`no wallets with balance for ${selectedAsset.value}`); /// @todo: change to notification
        }

        alert(`Scanned ${currency} address: ${address}`);
    };
</script>

<style scoped></style>
