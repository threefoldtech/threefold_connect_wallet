<template>
    <div class="space-y-4 px-4 pb-4">
        <div data-field="stellarAddress">
            <div class="flex flex-row items-center">
                <h2 class="text-sm font-medium uppercase">Stellar address</h2>
                <ClipboardCopyIcon
                    @click="copyToClipboard(farm.wallet.keyPair.getStellarKeyPair().publicKey())"
                    class="ml-2 h-4 text-black"
                />
            </div>

            <div class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500">
                {{ farm.wallet.keyPair.getStellarKeyPair().publicKey() }}
            </div>
            <div class="mt-1 text-xs font-light text-orange-500">Note: This address will be used for payout</div>
        </div>

        <Disclosure as="div" class="w-full" v-slot="{ open }">
            <DisclosureButton class="flex w-full flex-row items-center justify-between text-sm font-medium uppercase">
                <div>
                    <span>TFCHAIN SECRET</span>
                </div>
                <ChevronUpIcon :class="open ? 'rotate-180 transform' : ''" class="h-5 w-5" />
            </DisclosureButton>
            <DisclosurePanel class="text-sm text-gray-500">
                <div>
                    <button @click="copyToClipboard('0x' + farm.wallet.keyPair.getSeed())">Copy secret</button>
                </div>
                <div class="no-scrollbar overflow-x-auto whitespace-normal">0x{{ farm.wallet.keyPair.getSeed() }}</div>
            </DisclosurePanel>
        </Disclosure>
        <div data-field="walletName">
            <h2 class="text-sm font-medium uppercase">Wallet name</h2>
            <div class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500">
                {{ farm.wallet.name }}
            </div>
        </div>

        <div data-field="twinId">
            <h2 class="text-sm font-medium uppercase">Twin Id</h2>
            <div class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500">
                {{ farm?.twinId }}
            </div>
        </div>

        <div data-field="farmId">
            <h2 class="text-sm font-medium uppercase">Farm Id</h2>
            <div class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500">
                {{ farm?.farmId }}
            </div>
        </div>

        <div data-field="nodes">
            <h2 class="text-sm font-medium uppercase">Nodes</h2>
            <div class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500">No nodes</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { Farm } from '@/types/farms.types';
    import { ClipboardCopyIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/solid';

    interface Props {
        farm: Farm;
    }

    const { farm } = defineProps<Props>();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };
</script>
