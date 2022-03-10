<template>
    <div class="space-y-2 p-4">
        <div class="flex justify-around">
            <RouterLink :to="{ name: 'send', params: { from: wallet.keyPair.getStellarKeyPair().publicKey() } }">
                <div class="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-gray-300 bg-gray-200">
                    <svg fill="none" height="30" viewBox="0 0 20 30" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M9.40452 0.271386L6.2431 3.71681C5.91718 4.0708 5.91718 4.64897 6.25396 5.00295C6.57988 5.35693 7.11222 5.35693 7.43814 5.00295L9.16552 3.11504L9.16552 9.66347C9.16552 10.1255 9.54004 10.5 10.002 10.5C10.464 10.5 10.8386 10.1255 10.8386 9.66347L10.8386 3.11504L12.566 5.00295C12.8919 5.35693 13.4242 5.35693 13.7501 5.00295C13.9131 4.82596 14 4.58997 14 4.35398C14 4.12979 13.9131 3.8938 13.7501 3.71681L10.5887 0.271386C10.4366 0.0943945 10.2193 -1.84433e-07 10.002 -1.74935e-07C9.7739 -1.64962e-07 9.56748 0.0943945 9.40452 0.271386Z"
                            fill="#60708F"
                        />
                        <path
                            clip-rule="evenodd"
                            d="M15.7689 17.3818H20C20 13.9846 17.9644 12 14.5156 12H5.48444C2.03556 12 0 13.9846 0 17.3385V24.6615C0 28.0154 2.03556 30 5.48444 30H14.5156C17.9644 30 20 28.0154 20 24.6615V24.3495H15.7689C13.8052 24.3495 12.2133 22.7975 12.2133 20.883C12.2133 18.9685 13.8052 17.4165 15.7689 17.4165V17.3818ZM15.7689 18.8724H19.2533C19.6657 18.8724 20 19.1983 20 19.6004V22.131C19.9952 22.5311 19.6637 22.8543 19.2533 22.8589H15.8489C14.8548 22.872 13.9855 22.2084 13.76 21.2643C13.6471 20.6783 13.8056 20.0736 14.1931 19.6122C14.5805 19.1509 15.1573 18.8801 15.7689 18.8724ZM15.92 21.533H16.2489C16.6711 21.533 17.0133 21.1993 17.0133 20.7877C17.0133 20.3761 16.6711 20.0424 16.2489 20.0424H15.92C15.7181 20.0401 15.5236 20.1166 15.38 20.255C15.2364 20.3934 15.1555 20.5821 15.1556 20.779C15.1555 21.1921 15.4964 21.5282 15.92 21.533ZM4.73778 17.3818H10.3822C10.8044 17.3818 11.1467 17.0481 11.1467 16.6365C11.1467 16.2249 10.8044 15.8912 10.3822 15.8912H4.73778C4.31903 15.8912 3.9782 16.2196 3.97333 16.6278C3.97331 17.0409 4.31415 17.3771 4.73778 17.3818Z"
                            fill="#60708F"
                            fill-rule="evenodd"
                        />
                    </svg>
                </div>
                <div class="font-sm mt-2 w-px min-w-fit text-center font-semibold tracking-wide text-gray-600">
                    {{ $t('wallet.overview.sendCoins') }}
                </div>
            </RouterLink>
            <RouterLink
                :to="{ name: 'receive', params: { toAddress: wallet?.keyPair.getStellarKeyPair().publicKey() } }"
            >
                <div class="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-gray-300 bg-gray-200">
                    <svg fill="none" height="30" viewBox="0 0 20 30" width="20" xmlns="http://www.w3.org/2000/svg">
                        <path
                            clip-rule="evenodd"
                            d="M15.7689 17.3818H20C20 13.9846 17.9644 12 14.5156 12H5.48444C2.03556 12 0 13.9846 0 17.3385V24.6615C0 28.0154 2.03556 30 5.48444 30H14.5156C17.9644 30 20 28.0154 20 24.6615V24.3495H15.7689C13.8052 24.3495 12.2133 22.7975 12.2133 20.883C12.2133 18.9685 13.8052 17.4165 15.7689 17.4165V17.3818ZM15.7689 18.8724H19.2533C19.6657 18.8724 20 19.1983 20 19.6004V22.131C19.9952 22.5311 19.6637 22.8543 19.2533 22.8589H15.8489C14.8548 22.872 13.9855 22.2084 13.76 21.2643C13.6471 20.6783 13.8056 20.0736 14.1931 19.6122C14.5805 19.1509 15.1573 18.8801 15.7689 18.8724ZM15.92 21.533H16.2489C16.6711 21.533 17.0133 21.1993 17.0133 20.7877C17.0133 20.3761 16.6711 20.0424 16.2489 20.0424H15.92C15.7181 20.0401 15.5236 20.1166 15.38 20.255C15.2364 20.3934 15.1555 20.5821 15.1556 20.779C15.1555 21.1921 15.4964 21.5282 15.92 21.533ZM4.73778 17.3818H10.3822C10.8044 17.3818 11.1467 17.0481 11.1467 16.6365C11.1467 16.2249 10.8044 15.8912 10.3822 15.8912H4.73778C4.31903 15.8912 3.9782 16.2196 3.97333 16.6278C3.97331 17.0409 4.31415 17.3771 4.73778 17.3818Z"
                            fill="#60708F"
                            fill-rule="evenodd"
                        />
                        <path
                            d="M10.5955 10.2286L13.7569 6.78319C14.0828 6.4292 14.0828 5.85103 13.746 5.49705C13.4201 5.14307 12.8878 5.14307 12.5619 5.49705L10.8345 7.38496L10.8345 0.836529C10.8345 0.374527 10.46 4.46617e-09 9.99795 9.9755e-09C9.53595 1.54848e-08 9.16143 0.374527 9.16143 0.836529L9.16143 7.38496L7.43405 5.49705C7.10813 5.14307 6.57579 5.14307 6.24987 5.49705C6.08691 5.67404 6 5.91003 6 6.14602C6 6.37021 6.08691 6.6062 6.24987 6.78319L9.4113 10.2286C9.56339 10.4056 9.78067 10.5 9.99795 10.5C10.2261 10.5 10.4325 10.4056 10.5955 10.2286Z"
                            fill="#60708F"
                        />
                    </svg>
                </div>
                <div class="font-sm mt-2 w-px min-w-fit text-center font-semibold tracking-wide text-gray-600">
                    <p>
                        {{ $t('wallet.overview.receiveCoins') }}
                    </p>
                </div>
            </RouterLink>
        </div>
        <hr />
        <div class="py-2">
            <h2>{{ $t('wallet.overview.assets') }}</h2>
            <div class="mt-4 space-y-2">
                <template v-for="assetBalance in assets">
                    <BalanceCard
                        :balance="assetBalance"
                        @click="router.push({ name: 'walletTransactions', params: { assetCode: assetBalance.name } })"
                    >
                        <template v-if="assetBalance.type === 'substrate' && assetBalance.name === 'TFT'" #actions>
                            <button
                                type="button"
                                class="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                @click.stop="
                                    $router.push({
                                        name: 'bridge',
                                        params: { basePublicKey: wallet?.keyPair.getBasePublicKey() },
                                    })
                                "
                            >
                                {{ $t('wallet.overview.transferFromStellar') }}
                                <SwitchHorizontalIcon class="ml-2 -mr-0.5 h-4 w-4" aria-hidden="true" />
                            </button>
                        </template>
                    </BalanceCard>
                </template>
                <template v-if="assets.length === 0">
                    <div class="text-center">
                        <p class="text-gray-600">{{ $t('wallet.overview.noAssetsFound') }}</p>
                    </div>
                </template>
            </div>
        </div>
        <div class="py-2" v-if="vestedAssetBalance.length >= 1 || vestedAssetBalanceIsLoading">
            <h2>Vested Tokens</h2>
            <div class="mt-4 space-y-2">
                <template v-for="assetBalance in vestedAssetBalance">
                    <BalanceCard :balance="assetBalance"> </BalanceCard>
                </template>
            </div>
        </div>
        <div v-if="vestedAssetBalanceIsLoading && vestedAssetBalance.length === 0">
            <div class="text-center">
                <p class="animate-pulse text-gray-600">{{ $t('wallet.overview.checkVesting') }}</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import BalanceCard from '@/components/BalanceCard.vue';
    import { useRouter } from 'vue-router';
    import { AssetBalance, balances, Wallet } from '@/service/walletService';
    import { inject, ref } from 'vue';
    import { useAssets } from '@/util/useAssets';
    import { SwitchHorizontalIcon } from '@heroicons/vue/outline';
    import { checkVesting } from '@/service/vestingService';
    import { useLocalStorage } from '@vueuse/core';
    import { translate } from '@/util/translate';
    const router = useRouter();
    const wallet: Wallet = <Wallet>inject('wallet');

    const vestedAssetBalance = useLocalStorage<AssetBalance[]>(
        `vested_asset_balance_${wallet.keyPair.getBasePublicKey()}`,
        []
    );
    const vestedAssetBalanceIsLoading = ref(true);

    checkVesting(wallet).then(balances => {
        vestedAssetBalance.value = balances;
        vestedAssetBalanceIsLoading.value = false;
    });
    const assets = useAssets(wallet);
</script>

<style scoped></style>
