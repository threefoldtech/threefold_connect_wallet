<template>
    <div v-if="operation">
        <div class="p-4">
            <div class="text-xl font-bold">
                <div class="flex flex-row items-center">
                    <ArrowLeftIcon class="h-6 w-6" @click="router.back()" />
                    <div class="pl-4">Transaction details</div>
                </div>
            </div>
            <div v-if="!isAssetAddedTx">
                <p class="mt-4 text-sm font-semibold">From</p>
                <div class="mb-2 truncate text-gray-500">
                    <div>
                        {{ getWalletName(operation.from) ? getWalletName(operation.from) : '' }}
                    </div>
                    <div class="truncate">
                        {{ operation.from }}
                    </div>
                </div>
                <hr />
            </div>
            <div v-if="!isAssetAddedTx">
                <p class="mt-4 text-sm font-semibold">To</p>
                <div class="mb-2 truncate text-gray-500">
                    <div>
                        {{ getWalletName(operation.to) ? getWalletName(operation.to) : '' }}
                    </div>
                    <div class="truncate">
                        {{ operation.to }}
                    </div>
                </div>
                <hr />
            </div>
            <div v-if="!isAssetAddedTx">
                <p class="mt-4 text-sm font-semibold">Type</p>
                <div class="mb-2 mt-2" v-if="wallet.keyPair.getStellarKeyPair().publicKey() === operation.from">
                    <Badge :type="BadgeType.NEGATIVE" :text="'Payment'"></Badge>
                </div>
                <div class="mb-2 mt-2" v-else-if="wallet.keyPair.getStellarKeyPair().publicKey() === operation.to">
                    <Badge :type="BadgeType.POSITIVE" :text="'Receive'"></Badge>
                </div>
                <div class="mb-2 mt-2" v-else>
                    <Badge :type="BadgeType.NEUTRAL" :text="'Unknown'"></Badge>
                </div>
                <hr />
            </div>
            <div v-if="!isAssetAddedTx">
                <p class="mt-4 text-sm font-semibold">Amount</p>
                <p class="mb-2 truncate text-gray-500">
                    {{ operation.amount }}
                </p>
                <hr />
            </div>

            <div>
                <p class="mt-4 text-sm font-semibold">Asset</p>
                <p class="mb-2 truncate text-gray-500">
                    {{ operation.asset_code }}
                </p>
                <hr />
            </div>

            <div>
                <p class="mt-4 text-sm font-semibold">Date</p>
                <p class="mb-2 truncate text-gray-500">
                    {{ formattedDate }}
                </p>
                <hr />
            </div>
            <div v-if="!isAssetAddedTx">
                <p class="mt-4 text-sm font-semibold">Memo</p>
                <p v-if="isMemoLoading" class="mb-2 truncate text-gray-500">...</p>
                <p class="truncate text-gray-500" v-else-if="transactionMemo">
                    {{ transactionMemo }}
                </p>
                <p class="truncate text-gray-500" v-else>&nbsp;</p>
                <hr />
            </div>

            <div>
                <p class="mt-4 text-sm font-semibold">Transaction hash</p>
                <p class="mb-2 truncate text-gray-500">
                    {{ operation.transaction_hash }}
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { wallets } from '@/modules/Wallet/services/wallet.service';
    import { computed, inject, Ref, ref } from 'vue';
    import { ServerApi } from 'stellar-sdk';
    import Badge from '@/modules/Misc/components/global/Badge.vue';
    import { useRouter } from 'vue-router';
    import { ArrowLeftIcon } from '@heroicons/vue/solid';
    import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';
    import { BadgeType } from 'shared-types/src/enums/global/badge.enums';
    import { obtainMemoFromTransactionUrl } from 'tf-stellar';
    import { selectedTransaction } from '@/modules/Transfer/services/transaction.service';

    const router = useRouter();

    const wallet: IWallet = <IWallet>inject('wallet');
    const transactionMemo = ref<string | null>();

    const isMemoLoading = ref<boolean>(true);

    let operation = ref();

    const init = async () => {
        operation.value = JSON.parse(selectedTransaction.value) as ServerApi.OperationRecord;
        if (!operation.value) return;

        transactionMemo.value = await obtainMemoFromTransactionUrl(operation.value._links.transaction.href);
        isMemoLoading.value = false;
    };

    const formattedDate = computed(() => {
        if (!operation.value) return;
        return new Date(operation.value.created_at).toLocaleString();
    });

    const isAssetAddedTx = computed(() => {
        // @ts-ignore
        return operation.value.trustor != undefined;
    });

    const getWalletName = (address: string) => {
        const wallet = wallets.value.find(
            (wallet: IWallet) => wallet.keyPair.getStellarKeyPair().publicKey() === address
        );

        if (!wallet) {
            return null;
        }

        return wallet.name;
    };

    init();
</script>
