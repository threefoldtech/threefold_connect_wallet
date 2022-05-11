<template>
    <div class="space-y-4 px-4 pb-4">
        <div data-field="stellarAddress" v-if="payoutAddress">
            <div class="flex flex-row items-center">
                <h2 class="text-sm font-medium uppercase">Stellar Payout address</h2>
                <ClipboardCopyIcon @click="copyToClipboard(payoutAddress || '')" class="ml-2 h-4 text-black" />
            </div>

            <div class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500">
                {{ payoutAddress }}
            </div>
            <div class="mt-1 text-xs font-light text-orange-500">Note: This address will be used for payout</div>
        </div>

        <Disclosure as="div" class="w-full" v-slot="{ open }" v-if="showSecrets">
            <DisclosureButton class="flex w-full flex-row items-center justify-between text-sm font-medium uppercase">
                <div>
                    <span>TFCHAIN SECRET</span>
                </div>
                <ChevronUpIcon :class="open ? 'rotate-180 transform' : ''" class="h-5 w-5" />
            </DisclosureButton>
            <DisclosurePanel class="text-sm text-gray-500">
                <div>
                    <div
                        @click="copyToClipboard('0x' + farm.wallet.keyPair.getSeed())"
                        class="flex items-center rounded-md border border-transparent py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Copy secret
                        <ClipboardCopyIcon class="ml-2 h-4 text-black" />
                    </div>
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
            <div
                class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500"
                v-if="farm?.nodes.length === 0"
            >
                No nodes
            </div>
            <div v-for="node in farm?.nodes">
                <div class="flex flex-row justify-between whitespace-normal text-sm text-gray-500">
                    <div>Connected node id:</div>
                    <div>{{ node.nodeID }}</div>
                </div>
            </div>
        </div>
        <div class="border-t border-gray-200" v-if="!payoutLoading && !payoutAddress">
            <div class="-pt-px flex divide-x divide-gray-200">
                <button
                    v-if="!payoutAddress"
                    @click="addPayoutAddress"
                    class="flex inline-flex w-0 w-0 flex-1 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                    <DocumentAddIcon class="h-5 w-5 text-gray-400" />
                    Add Payout Address
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { Farm } from '@/modules/Farm/types/farms.types';
    import { ClipboardCopyIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/solid';
    import { DocumentAddIcon } from '@heroicons/vue/outline';
    import { getSubstrateApi, submitExtrensic } from '@/modules/TFChain/services/tfchainService';
    import { ref } from 'vue';
    import { addNotification, NotificationType } from '@/modules/Core/services/notificationService';

    interface Props {
        farm: Farm;
        showSecrets: boolean;
    }

    const { farm, showSecrets } = defineProps<Props>();

    const payoutAddress = ref<string | undefined>();
    const payoutLoading = ref<boolean>(true);

    const fetchStellarPayoutAddress = async () => {
        payoutLoading.value = true;
        const api = await getSubstrateApi();
        const result = await api.query.tfgridModule.farmPayoutV2AddressByFarmID(farm.farmId);
        payoutAddress.value = <string>result.toHuman();
        payoutLoading.value = false;
    };

    const addPayoutAddress = async () => {
        const api = await getSubstrateApi();
        addNotification(NotificationType.info, 'Adding payout address...', 'Please wait', 5000);

        const submittableExtrinsic = api.tx.tfgridModule.addStellarPayoutV2address(
            farm.farmId,
            farm.wallet.keyPair.getStellarKeyPair().publicKey()
        );
        await submitExtrensic(submittableExtrinsic, farm.wallet.keyPair.getSubstrateKeyring());
        await fetchStellarPayoutAddress();
        addNotification(NotificationType.success, 'Payout address added', '', 5000);
    };
    fetchStellarPayoutAddress();
    const copyToClipboard = (text: string) => {
        //@ts-ignore
        globalThis?.flutter_inappwebview.callHandler('COPY', text).then(function () {
            console.log('Copied');
        });
        addNotification(NotificationType.info, 'Text has been copied to clipboard', text, 2000);
    };
</script>
