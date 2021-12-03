<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.back()" />
                </template>
                <h1>Receive</h1>
            </PageHeader>
        </template>
        <img v-if="imageUrl" :src="imageUrl" alt="qr-code" crossorigin="anonymous" />
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import ArrowLeftIcon from '@heroicons/vue/outline/ArrowLeftIcon';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { useRouter } from 'vue-router';
    import { defineAsyncComponent, ref } from 'vue';

    const router = useRouter();

    import QRCodeStyling from 'qrcode-vue3/src/core/QRCodeStyling';

    interface IProps {
        assetCode: string;
        toAddress: string;
        amount?: number;
        message?: string;
    }

    const { assetCode, toAddress } = defineProps<IProps>();
    const qrValue = `${assetCode}:${toAddress}`;

    const imageUrl = ref();

    const qr = new QRCodeStyling({
        data: qrValue,
        width: 300,
        height: 300,
        qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'M' },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.6, margin: 4 },
        dotsOptions: {
            type: 'dots',
            color: '#2f3093',
        },
        backgroundOptions: { color: '#ffffff' },
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOYAAAD4CAMAAADPaGpiAAAAmVBMVEVHcEwiHiMdHRukMeFxKrt6LsIdHRsdHhwdHRsdHRuENc5ALZwdHRsdHRsdHRsdHRu3NvBaK6yvNuuFI8QdHRviCfLmHP80MJVFXLsdHRs1L5Y9LZpNKaJwIbRFK54vMJNmI69WJ6d6H7qOGsTjBvGEHL9eJauYGMnuBPehFs7ZCez6Afy2EdmvE9XRC+eoFNK9D93JDOPDDuBaxrvRAAAAGXRSTlMAD9mNijidIr72Zo5t6UKIusU+slWEo/tUuJa8oAAACi5JREFUeNrtXQtb4jwTpVVLWUvr58uuC8giINIVL7v7/3/c1za3STJpg2Csu3OQ59HShh5O5pKQjIMBgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBcBKc/+9t+I89UFyJhxNnX66joDT/W+qY1ZjX+FHjtsaqwkOFuxqLGuvqh2FbYVNjV+FnhdfX1/r5/Pz8VD+fnn79+vPn9+/fLy8vj4+P9zXK+7K8/312EVJNjCHnyEjerhqeDVHOlHGFTBuqu5rrT0H2lbGsaFY8a6I104rqfcO1LPf3Z8Pgas4AyR+CpeDZsGSCPkhFK0klSSZoo2jDEtD8JWkylopnuX/5HljNGcd8pvFE1VxAObemmg1P0W+fETVZzy0bnvsvIdWc1Q/FUtgll3Ol1LzT7BNYJ7TPHVPz2ey0kCWjGY7nOac5A732h5CTi3kr+6yu5prJiagpOq2lptZpa5rlRUDbVGLOoAdSjlZ2Wss2ua/dQm8rOy1um6rTVjyveqKmiCgrW811l5pPqG0qNSuaYbqtpqZum8I0b5Wa0DaFp13rtik9rYdt7mtchVRTc0G6pwViMpZcTdBpzbjp9LSPiqdQc38R0NPKTqsiCve0UM1GThFOQKfdHBQ3NdsM02vPkU4rxNTiprJNTnSt5QdbaZsioDht8163zf1ZSDWXwDQ5US0LgknQXZeadad12iZMD8pAxqmryYhiaj7YOW2LbbbFzXvTNq+C2+YcZrV6FqTHzTsjPTg4pwW2eRXY085nuqN1xE1MzY1umyA9cOS0H6GmkbnrtukTNzE1feNmcDU9bVPPgkw1W23z0fS0ZVg19QFKt212qOmb0wZXs8XTunJaZZsbmNN2xk0jpw3qaZczV9x02iZM3d9om2E97bJVTStuIlmQYZsH5bTB46afbS781PSyzbI/nvYWz2nb4uZBOe0HZ0FO21xAV+v0tD2MmzNt9mBuqLky5mm1TgtnMLFO2w9Pe3EaXLPntXjUP94IM7kXgSeBQCAQCAQC4d9DdH5ZPfiPB87EwwdfekPzWl9uMoPradRqGjXUFl+qiKUIr/VgRa6cYWMUMUDZf+sNzYsbneIcXTMkR2fVGHQj5sDExJBcIaQWCHGifaQpv7W/VVquwNIoNtQGalo0JU8xsu4ZTTXwVmqueJ9Vc0RiTpMPs5uvGkya/VbTWOmGdlo12yd44jTFUq+yn2qqOTE17Scmidi8plJzh3baF+iDyj67oLneaVemmtsONV/6rObSmOFkKxPAlN8C2Ob2s9rmrFPNO2CbmzZP+yg9bf/VtGxzgan56eKmW80HQ80tV3PXbZvl57HN1RG2uf98trkwbXO36bTN8vPYZqun/YtsE8tpN35xs9epO26bWk4r44nbNstP6mkXZtz8lDnt8pCc9i+2zYURNz/neJNyWjyn3f2Vtkk5rdM29/9GTlv+BTmtR9zsV0573bm5Uy6k8bfNsncjlOjLu+Br87weEAgEAoFAIBAIR+D7ZRfO6x/+8Fwoo+MrezgRIqe9rAYeNwDzG6Pwir4P5UHb8meVmBEr+n/qe8TqkckfUN8BTNKGWdIfXYoFPzdg4wK2dcGxHRfWJNl0V7FQOzQU0W+B1FzeqM1TN87KKytjt41dYWa3gxsb3ftQ1JR7sA0al8YeMW3z1A+rwsxDW70gUBvpZ8v+TbbnOLyazfTHUtUkUWpaFWbA3uo1XE6hVo6Ym6dce8Q+wDZnUs753FXGwlZzbdYL2nTvlMe2ygezTXOPmFZ5xVHdQds8tZHfJXjv3wyqJu+01lY46GlXSFEStF7Qxqr+9ITu33z8IE8rqljohXSMIhYrq2KZWWFmp1V/8rDNMnDcNMoi4TXL7Li5dtYs64qb3NPuy9CeFtnYqO3fBJ5Wj5trZDNuP+Mm2EI+s6s/rdo8Laww42ubH5UFAVfbUZlNeKA7rMLM7pC91R8SN2e4baq4+WCpuXbUE4QuqFdxc4ar6bRN105535zWUDNcp9XV/KGXRTJtc4Hk7pstmtM64+YH5bTL2dK5hRyzTTQ7ODinDbZBA7VNQ832uLk9OKdVnnYfPgvyt80FUjVxuzkgp31UaoZ1QXrclGHTMd501cDcWDVJ+hU3HWoi5WntWh3OEYp33Axpm0gWdKvltHr5J7Ms0qFxs+ydmmjcNCqzHWab4T1ta0576zUXtH37eHPfO9u04+ZaLnXCRyhecbMMaZv25J5eMmhlulpbTny8iRYbvv8AT/vd5zuFS98vFdq3335Fv2f4RgtmCAQCgUAgEAgEAoFAIBAIhH8JQxTVC1HzC6wRHYmXtMsirYx0hDV10FF5Y3k+meS58Y8aI+s8vR1XTet4hGBcNVQ0v+XgVHakeY/hWJ0bp4U6K7PaGsor4RvUt5OaR1PFsYhH0wajNIOskvq8WCcD2xnHSYb9C8t4iqC+t6L5TaPZHGE0R/oFsTgvs9qqz0/Mg4ymeTQWJFOt+VGibjyRV7spjJL8nWhOp9lBNEdtNDOr8XHWRjO1CSSRo9PytwedtpvmKK4gWs4BzXGsMJRXgqOppDkCp6aKCX9pLH4vOtVkTYgL4iHugpr3HANf4EEzaew/i4EUGZRW72pTsys1bxlH6LnTcVJ7H9m6aNKpJvMZgygvGNMx/k9mU/N6T5r1H7E6tY3mEKVpHJwwVqk8OSqm4GqnmiN5AVPMavhomvzWJm6aRQtN/ZYjpkVqX516qQmMtTg1zWEXTf9Om02dxpd7qinubhy9i5pv7LSY10ywjpx4q8nfLzsxTXC/h3da3SGOMN3Z0dRbzUGOfVhtNJNCIcVpDhNgCoxmnHJM4KebGkfZW1YJXYNJLu9vNMSCe3NzfmoObQNvpzlFw734fKubyxLuNCIsPcgGeijUjqZ2ZpRPUatSevmpyW4vPhFNAM7SQbM4kmaq51OdajJ/fXKaaTYYDE6nJt5p31PNDAxyEhfNcW4EhILbmxhGcc9nHDWSvbpDDKeYswLivJNttnraNMtYaqXGa0emBzw7MK4Hd+2nZnaop+0MKBM9gzw22UswHQrlyv3UTNF05Ki4qd/YsVlQPrUb4MOhobea7KOPT5oF6f3s2JyWCwFnLfjIoPDOafOxMwk6IguawBs7NtkbDPmIseBnR9kYasNoYn5YtBPxUXl66hFKMjWTvWSiEClPC466x5s5d+LjtKg8XDrWnXnT0qh6hWMi1WStZ0msB/LT0YzYx5m4J0kK9ySJbUH52A7WcjLAnG5J8UkSe5bkBKk79xuTt0x5IY5imLhvGqNpT2fFmWu+NtU6uCQ1wS1sqAemQiYvh0x5xc5RYQ6n9sZwos5oaYTRjDP3fyAskhrg9UlzALoNcGTYjDTUZ1aIv/PURH1+Zh5s3qi5KHHMkmdJmlaZUVpMtHs2W8rkm/OG8WlaAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCwcT/AdO9CRWiQMdGAAAAAElFTkSuQmCC',
        cornersSquareOptions: { type: 'extra-rounded', color: '#000000' },
        cornersDotOptions: { type: undefined, color: '#000000' },
    });

    qr.getImageUrl('png').then(url => (imageUrl.value = url));
</script>

<style scoped></style>
