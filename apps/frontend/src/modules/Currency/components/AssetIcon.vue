<template>
    <svg
        :class="`h-${height} w-${width}`"
        v-if="name === 'TFT' || name === 'TFTA' || name === 'FreeTFT'"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 31 31"
    >
        <path
            d="M27.3583 27.8796H0v-6.3653h31v3.0908c0 1.8209-1.6372 3.2745-3.6417 3.2745 2.0045 0 3.6264-1.4689 3.6264-3.2745v-3.0908H0v6.3653h27.3583Z"
            fill="url(#a)"
        />
        <path d="M24.6194 3H0v6.3652h30.9847C30.9847 5.8498 28.1349 3 24.6194 3Z" fill="#286AB8" />
        <path d="M30.9847 12.2572H9.0736v6.3652h21.9111v-6.3652Z" fill="#16A085" />
        <path d="M30.9847 21.499H0v6.3653l24.7725-.1224c3.4359-.0169 6.2122-2.807 6.2122-6.2429Z" fill="#CFCFCF" />
        <path
            d="M31 9.3652H0V3h27.3889c2.0045 0 3.5958 1.4383 3.5958 3.2438v3.1214H31V6.2439C31 4.4383 29.3781 3 27.4042 3H.0153v6.3652H31Z"
            fill="url(#b)"
        />
        <path
            d="M27.3889 3H0v6.3652h31V6.2439C31 4.469 29.3934 3 27.3889 3c2.0045 0 3.5958 1.4383 3.5958 3.2438v3.1214H0V3h27.3889Z"
            fill="url(#c)"
        />
        <path d="M31 18.6224H9.0735v-6.3652H31v6.3652-6.3652H9.0735v6.3652H31Z" fill="url(#d)" />
        <defs>
            <linearGradient id="a" x1="-.0821" y1="24.6104" x2="31.1693" y2="24.6104" gradientUnits="userSpaceOnUse">
                <stop stop-color="#DB00E9" />
                <stop offset="1" stop-color="#15FBFF" />
            </linearGradient>
            <linearGradient id="b" x1="-.0821" y1="6.0996" x2="31.1693" y2="6.0996" gradientUnits="userSpaceOnUse">
                <stop stop-color="#DB00E9" />
                <stop offset="1" stop-color="#15FBFF" />
            </linearGradient>
            <linearGradient id="c" x1="-.0821" y1="6.0996" x2="31.1693" y2="6.0996" gradientUnits="userSpaceOnUse">
                <stop stop-color="#DB00E9" />
                <stop offset="1" stop-color="#15FBFF" />
            </linearGradient>
            <linearGradient id="d" x1="8.96" y1="15.4065" x2="31.1242" y2="15.4065" gradientUnits="userSpaceOnUse">
                <stop stop-color="#DB00E9" />
                <stop offset="1" stop-color="#15FBFF" />
            </linearGradient>
        </defs>
    </svg>
    <svg
        :class="`h-${height} w-${width}`"
        v-if="name === 'BTC'"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 31 31"
    >
        <g clip-path="url(#a)">
            <path
                d="M30.5125 19.273c-2.0702 8.3036-10.4804 13.3571-18.7851 11.2864C3.4263 28.4892-1.6272 20.0785.4439 11.7755 2.513 3.4709 10.9234-1.5829 19.2254.4873c8.3041 2.07 13.3572 10.4818 11.2868 18.7858l.0002-.0001h.0001Z"
                fill="#F7931A"
            />
            <path
                d="M22.3349 13.2917c.3085-2.0627-1.2619-3.1715-3.4093-3.9112l.6966-2.7941-1.7008-.4238-.6782 2.7205c-.4471-.1115-.9063-.2166-1.3627-.3208l.6831-2.7385L14.8637 5.4l-.697 2.7932c-.37-.0842-.7334-.1675-1.086-.2552l.0019-.0088-2.3455-.5857-.4524 1.8166s1.2619.2893 1.2353.307c.6887.172.8133.6279.7926.9893l-.7935 3.1832c.0474.012.1089.0295.1768.0567-.0568-.0141-.1171-.0294-.1798-.0444l-1.1123 4.4591c-.0841.2093-.2978.5233-.7793.4041.017.0247-1.2363-.3085-1.2363-.3085l-.8444 1.9469 2.2134.5518c.4118.1032.8153.2113 1.2127.3129l-.7039 2.8261 1.6989.4239.697-2.7962c.4642.126.9146.2422 1.3555.3518l-.6947 2.7829 1.701.4239.7037-2.8209c2.9004.5489 5.0812.3276 5.9991-2.2958.7397-2.1121-.0368-3.3303-1.5626-4.1248 1.1113-.2563 1.9484-.9872 2.1716-2.4972l-.0005-.0004-.0001.0002Zm-3.8861 5.4493c-.5256 2.1121-4.0818.9703-5.2347.684l.934-3.7441c1.1529.2878 4.8501.8574 4.3008 3.0601h-.0001Zm.5261-5.4799c-.4796 1.9212-3.4394.9451-4.3995.7058l.8468-3.3958c.9601.2394 4.0522.6861 3.5528 2.69h-.0001Z"
                fill="#fff"
            />
        </g>
        <defs>
            <clipPath id="a">
                <path fill="#fff" d="M0 0h31v31H0z" />
            </clipPath>
        </defs>
    </svg>
</template>
<script lang="ts" setup>
    interface IProps {
        name?: string;
        height?: number;
        width?: number;
    }

    const { name, height, width } = withDefaults(defineProps<IProps>(), { name: 'TFT', height: 8, width: 8 });
</script>
