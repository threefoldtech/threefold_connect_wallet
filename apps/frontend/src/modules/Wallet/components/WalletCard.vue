<template>
    <div>
        <div class="flex flex-row items-center">
            <h2 class="truncate mr-1">{{ name }}</h2>
            <div class="flex flex-row">
                <span class="border text-sm border-gray-300 rounded-xl px-4 flex items-center">{{
                    isPublic ? 'Public' : 'Private'
                }}</span>
                <div class="relative ml-2 cursor-pointer select-none" @click.stop="showToolTip = !showToolTip">
                    <question-mark-circle-icon class="h-5 w-5" />
                    <span
                        :class="{
                            hidden: !showToolTip,
                        }"
                        class="absolute left-5 top-5 items-center w-56 rounded-full rounded-tl-none bg-blue-100 px-5 py-1 text-xs font-medium text-blue-800"
                    >
                        {{ $t('dialog.wallet.namespace.information') }}
                    </span>
                </div>
            </div>
        </div>
        <div class="mt-2 flex flex-col rounded-2xl border p-4">
            <div v-if="!balance">
                <div class="flex animate-pulse justify-between text-transparent">
                    <span>
                        <small class="rounded-xl bg-slate-200 px-1">TFT</small>
                        <small class="ml-2 rounded-xl bg-slate-200">{{ $t(`chain.substrate`) }}</small>
                    </span>
                    <span class="rounded-xl bg-slate-200 px-1">100.12</span>
                </div>
            </div>

            <div class="">
                <small v-if="balance && balance.assets && balance?.assets.filter(a => a.amount > 0).length === 0">{{
                    $t('walletCard.noBalance')
                }}</small>
            </div>

            <div>
                <div
                    v-for="assetBalance in balance?.assets"
                    :class="{ hidden: assetBalance.amount <= 0 }"
                    class="flex justify-between p-1"
                >
                    <div class="flex flex-row items-center">
                        <AssetIcon
                            :key="assetBalance.name"
                            :height="6"
                            :width="6"
                            :name="assetBalance.name"
                        ></AssetIcon>
                        <span class="pl-2"> {{ assetBalance.name }}</span>
                        <span class="pl-2 text-sm capitalize text-gray-400">{{
                            $t(`chain.${assetBalance.type}`)
                        }}</span>
                    </div>
                    {{ currencyUtil(assetBalance.amount) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import AssetIcon from '@/modules/Currency/components/AssetIcon.vue';
    import { currencyUtil } from '@/modules/Currency/utils/currency.util';
    import { IBalance } from 'shared-types';
    import { ref } from 'vue';

    import { QuestionMarkCircleIcon } from '@heroicons/vue/outline';

    interface IProps {
        name: string;
        isPublic: boolean;
        balance?: IBalance;
    }

    const { name, balance, isPublic } = defineProps<IProps>();

    const showToolTip = ref<boolean>(false);
</script>

<style scoped></style>
