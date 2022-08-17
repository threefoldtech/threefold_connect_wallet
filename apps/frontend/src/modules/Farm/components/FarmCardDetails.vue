<template>
    <div class="space-y-4 px-4 pb-4">
        <div data-field="stellarAddress" v-if="farm.farm.stellarAddress">
            <div class="flex flex-row items-center">
                <h2 class="text-sm font-medium uppercase">Stellar Payout address</h2>
                <ClipboardCopyIcon
                    @click="copyToClipboard(farm.farm.stellarAddress || '')"
                    class="ml-2 h-4 text-black"
                />
            </div>

            <div class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500">
                {{ farm.farm.stellarAddress }}
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
                {{ walletName }}
            </div>
        </div>

        <div data-field="twinId">
            <h2 class="text-sm font-medium uppercase">Twin Id</h2>
            <div class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500">
                {{ farm.farm.twinId }}
            </div>
        </div>

        <div data-field="farmId">
            <h2 class="text-sm font-medium uppercase">Farm Id</h2>
            <div class="no-scrollbar overflow-x-auto whitespace-normal text-sm text-gray-500">
                {{ farm.farm.farmId }}
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
                    <div>Node: {{ node.nodeId }}</div>
                    <div class="inline-flex items-center">
                        <div class="mr-2">Status:</div>
                        <div class="h-2 w-2 bg-green-600 rounded-full" v-if="node.isOnline"></div>
                        <div class="h-2 w-2 bg-red-600 rounded-full" v-else></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="border-t border-gray-200" v-if="!farm.farm.stellarAddress && farm.wallet">
            <div class="-pt-px flex divide-x divide-gray-200">
                <button
                    @click="addPayoutAddress"
                    v-if="!farm.farm.stellarAddress"
                    class="flex inline-flex w-0 w-0 flex-1 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                    <DocumentAddIcon class="h-5 w-5 text-gray-400" />
                    Add Payout Address
                </button>
            </div>
        </div>

        <Disclosure as="div" class="w-full" v-slot="{ open }">
            <DisclosureButton class="flex w-full flex-row items-center justify-between text-sm font-medium uppercase">
                <div>
                    <span>ACTIONS</span>
                </div>
                <ChevronUpIcon :class="open ? 'rotate-180 transform' : ''" class="h-5 w-5" />
            </DisclosureButton>
            <DisclosurePanel class="text-sm text-gray-500">
                <div
                    @click="showDeleteFarm = true"
                    class="mt-4 text-center p-2 bg-red-600 text-white font-semibold uppercase"
                >
                    Delete farm
                </div>
            </DisclosurePanel>
        </Disclosure>
    </div>

    <DeleteFarmDialog
        v-if="showDeleteFarm"
        :farmName="farm.farm.name"
        @confirm="removeFarm"
        @close="showDeleteFarm = false"
    ></DeleteFarmDialog>
</template>

<script lang="ts" setup>
    import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
    import { ChevronUpIcon, ClipboardCopyIcon, TrashIcon } from '@heroicons/vue/solid';
    import { DocumentAddIcon } from '@heroicons/vue/outline';
    import { computed, ref } from 'vue';
    import { addNotification } from '@/modules/Core/services/notification.service';
    import { NotificationType } from '@/modules/Core/enums/notification.enum';
    import { IFarm } from 'shared-types/src/interfaces/substrate/farm.interfaces';
    import { Wallet, wallets } from '@/modules/Wallet/services/walletService';
    import { deleteFarmOnSubstrate } from 'tf-substrate/src/extrinsics/grid.extrinsics';
    import { addStellarPayoutAddress } from 'tf-substrate/src/services/farm.service.substrate';
    import DeleteFarmDialog from '@/modules/Farm/components/dialogs/DeleteFarmDialog.vue';

    interface Props {
        farm: IFarm;
        showSecrets: boolean;
    }

    const { farm, showSecrets } = defineProps<Props>();

    const showDeleteFarm = ref<boolean>(false);

    const walletName = computed(() => {
        if (farm.wallet?.name) {
            return farm.wallet.name;
        }

        const wallet = wallets.value.find(
            (w: Wallet) => w.keyPair.getStellarKeyPair().publicKey() === farm.farm.stellarAddress
        );

        return wallet?.name || '';
    });

    const removeFarm = async () => {
        const farmId = farm.farm.farmId;
        const keyRing = farm.wallet?.keyPair.getSubstrateKeyring();

        if (!keyRing) return;

        addNotification(NotificationType.info, 'Deleting farm ' + farmId, 'Please wait');

        const isDeleted = await deleteFarmOnSubstrate(keyRing, farmId);
        if (!isDeleted) {
            addNotification(NotificationType.error, 'Could not delete farm ' + farmId);
        }

        showDeleteFarm.value = false;
    };

    const addPayoutAddress = async () => {
        if (!farm.wallet) return;

        const stellarAddress = farm.wallet.keyPair.getStellarKeyPair().publicKey();
        const keyRing = farm.wallet.keyPair.getSubstrateKeyring();
        const farmId = farm.farm.farmId;

        addNotification(NotificationType.info, 'Adding payout address...', 'Please wait', 5000);

        const isStellarAddressAdded = await addStellarPayoutAddress(keyRing, stellarAddress, farmId);
        if (!isStellarAddressAdded) {
            return addNotification(NotificationType.error, 'Could not add address', 'Please contact support', 5000);
        }

        addNotification(NotificationType.success, 'Payout address added', '', 5000);
    };

    const copyToClipboard = (text: string) => {
        globalThis?.flutter_inappwebview.callHandler('COPY', text).then(function () {
            console.log('Copied');
        });
        addNotification(NotificationType.info, 'Text has been copied to clipboard', text, 2000);
    };
</script>
