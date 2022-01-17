<template>
    <div class="rounded-2xl border p-4 flex flex-col">
        <div class="">
            <p class="font-semibold">{{ name }}</p>
            <small v-if="balance && balance.assets && balance?.assets.filter(a => a.amount > 0).length === 0"
                >no balance found for this wallet</small
            >
        </div>
        <hr
            class="border-gray-300 my-2"
            v-if="balance && balance.assets && balance?.assets.filter(asset => asset.amount > 0)?.length >= 1"
        />
        <div>
            <div
                v-for="assetBalance in balance?.assets"
                :class="{ hidden: assetBalance.amount <= 0 }"
                class="flex justify-between"
            >
                <span>
                    {{ assetBalance.name }} <small class="text-gray-400">{{ assetBalance.type }}</small>
                </span>
                {{
                    assetBalance.amount.toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                        minimumSignificantDigits: 4,
                    })
                }}
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { Balance } from '../service/walletService';

    interface IProps {
        name: string;
        balance?: Balance;
    }

    const { name, balance } = defineProps<IProps>();
</script>

<style scoped></style>
