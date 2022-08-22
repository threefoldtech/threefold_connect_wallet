<template>
    <div class="rounded-2xl border p-4">
        <div class="flex flex-row justify-between pb-3">
            <div class="flex items-center gap-2">
                <AssetIcon :name="'TFT'" />

                <div class="shrink-0">
                    {{ $t('currency.short.tft') }}
                    <small class="capitalize text-gray-400"> {{ $t(`chain.stellar`) }} </small>
                </div>
            </div>

            <div>
                {{ currencyUtil(totalLockedTokens) }}
            </div>
        </div>

        <div v-for="t in lockedTokens">
            <span class="text-xs">
                {{
                    $t('wallet.overview.lockedTokensDetails', {
                        amount: currencyUtil(t?.amount),
                        asset_code: t?.asset_code,
                        date: convertToString(t?.unlockFrom),
                    })
                }}
            </span>
        </div>

        <button
            v-if="lockedBalances.length > 0"
            type="button"
            class="mt-3 inline-flex items-center rounded-md border border-transparent bg-primary-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            @click="unlockTokensManually"
        >
            {{ $t('wallet.overview.unlockManually') }}
            <SwitchHorizontalIcon class="ml-2 -mr-0.5 h-4 w-4" aria-hidden="true" />
        </button>
        <hr class="my-2" v-if="$slots['actions']" />
        <slot name="actions" />
    </div>
</template>

<script lang="ts" setup>
    import { unlockTokens } from '@/modules/LockedTokens/services/lock.service.ts';
    import { computed, inject } from 'vue';
    import { currencyUtil } from '@/modules/Currency/utils/currency.util';
    import { timeStampToReadableDate } from '@/modules/Core/utils/time';
    import AssetIcon from '@/modules/Currency/components/AssetIcon.vue';
    import { SwitchHorizontalIcon } from '@heroicons/vue/outline';
    import { addNotification } from '@/modules/Core/services/notification.service';
    import { translate } from '@/modules/Core/utils/translate';
    import { NotificationType } from 'shared-types/src/enums/global/notification.enums';
    import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';
    import { ITokenItem } from 'shared-types/src/interfaces/stellar/locked.interfaces';

    interface IProps {
        lockedBalances: (ITokenItem | null)[];
    }

    const wallet: IWallet = <IWallet>inject('wallet');

    const { lockedBalances } = defineProps<IProps>();

    const lockedTokens = computed(() => {
        return lockedBalances.filter(token => token?.canBeUnlocked === false);
    });

    const convertToString = (timestamp: string | undefined) => {
        const t = timestamp as string;
        return timeStampToReadableDate(t);
    };

    const totalLockedTokens = computed(() => {
        return lockedBalances.reduce((acc, cur) => {
            if (cur) {
                return acc + cur.amount;
            }
            return acc;
        }, 0);
    });

    const unlockTokensManually = async () => {
        addNotification(NotificationType.info, translate('locking.tryingToUnlock'));
        await unlockTokens(lockedBalances as ITokenItem[], wallet.keyPair.getStellarKeyPair());
    };
</script>
