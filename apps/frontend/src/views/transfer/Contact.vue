<template>
    <div class="fixed top-0 bottom-0 left-0 right-0 z-10">
        <MainLayout>
            <template #header>
                <PageHeader>
                    <template #before>
                        <XIcon @click="emit('close')" />
                    </template>
                    <h1>Contacts</h1>
                </PageHeader>
            </template>
            <div class="p-4">
                <div>
                    <RadioGroup class="mt-2" v-model="selectedTab">
                        <div class="flex gap-3">
                            <RadioGroupOption
                                as="template"
                                v-for="option in [Tabs.OWN_WALLETS, Tabs.OTHERS]"
                                :key="option"
                                :value="option"
                                v-slot="{ active, checked }"
                            >
                                <div
                                    :class="[
                                        active ? 'ring-2 ring-primary-500 ring-offset-2' : '',
                                        checked
                                            ? 'border-transparent bg-primary-600 text-white hover:bg-primary-700'
                                            : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
                                        'flex flex-1 items-center justify-center rounded-md border py-3 px-3 text-sm font-medium uppercase',
                                    ]"
                                >
                                    <RadioGroupLabel as="p" class="capitalize">
                                        {{ option }}
                                    </RadioGroupLabel>
                                </div>
                            </RadioGroupOption>
                        </div>
                    </RadioGroup>
                </div>
                <div class="mt-4">
                    <div
                        v-if="selectedTab === Tabs.OWN_WALLETS"
                        class="text-gray-700 p-2 border-[1px] rounded-md mb-4"
                        v-for="contact in myContacts"
                        @click="selectedContact(contact)"
                    >
                        <div class="flex flex-row items-center">
                            <div class="w-10/12">
                                <div class="text-black text-left text-sm font-bold">
                                    {{ contact.name }}
                                </div>
                                <div class="truncate">
                                    {{ contact.address }}
                                </div>
                            </div>
                            <div class="w-2/12 text-right flex justify-end pr-2">
                                <ArrowRightIcon class="h-5" />
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="selectedTab === Tabs.OTHERS"
                        class="text-gray-700 p-2 border-[1px] rounded-md mb-4"
                        v-for="contact in pkidContacts"
                        @click="selectedContact(contact)"
                    >
                        <div class="flex flex-row items-center">
                            <div class="w-10/12">
                                <div class="text-black text-left text-sm font-bold">
                                    {{ contact.name }}
                                </div>
                                <div class="truncate">
                                    {{ contact.address }}
                                </div>
                            </div>
                            <div class="w-2/12 text-right flex justify-end pr-2">
                                <ArrowRightIcon class="h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #fab>
                <div v-touch:hold="enableHint" @click="showHint = false">
                    <div class="absolute bottom-8 right-7">
                        <span
                            :class="{
                                hidden: !showHint,
                            }"
                            class="inline-flex items-center rounded-full rounded-br-none bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                        >
                            Add contact
                        </span>
                    </div>
                    <FAB :title="'Add contact'" @click="showAddContact = true" />
                </div>
            </template>
        </MainLayout>
        <AddContact
            ref="completeButtonRef"
            @cancel="showAddContact = false"
            @confirm="saveNewContact"
            v-if="showAddContact"
        ></AddContact>
    </div>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import AddContact from '@/components/dialogs/wallet/AddContactModal.vue';
    import { XIcon, ArrowRightIcon } from '@heroicons/vue/outline';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
    import { computed, Ref, ref } from 'vue';
    import { useLocalStorage } from '@vueuse/core';
    import { appKeyPair } from '@/service/cryptoService';
    import { getPkidClient, savePkidContact } from '@/service/pkidService';
    import { Contact } from '@/types/contact.types';
    import { Wallet, wallets } from '@/service/walletService';
    import { ChainTypes } from '@/enums/chains.enums';
    import { onBeforeMount } from '@vue/runtime-core';

    enum Tabs {
        'OWN_WALLETS' = 'Own wallets',
        'OTHERS' = 'Others',
    }

    interface IProps {
        chain: string;
    }

    const { chain } = defineProps<IProps>();
    const emit = defineEmits(['close', 'chosenContact']);
    const selectedTab = ref<Tabs>(Tabs.OWN_WALLETS);

    const showAddContact = ref<boolean>(false);
    const pkidContacts = ref<Contact[]>([]);

    onBeforeMount(async () => {
        await getPkidContacts();
    });

    const showHint = useLocalStorage('show-add-contact-hint', true);
    const enableHint = () => {
        showHint.value = true;
    };

    const myContacts: Ref<Contact[]> = computed(() =>
        wallets.value.map((wallet: Wallet) => {
            return {
                address:
                    chain === ChainTypes.STELLAR
                        ? wallet.keyPair.stellarKeyPair.publicKey()
                        : wallet.keyPair.getSubstrateKeyring().address,
                type: chain,
                name: wallet.name,
            };
        })
    );

    const selectedContact = (contact: Contact) => {
        emit('chosenContact', contact);
    };

    const saveNewContact = async (contact: Contact) => {
        await savePkidContact(contact);
        showAddContact.value = false;

        await getPkidContacts();
    };

    const getPkidContacts = async () => {
        const pkidClient = getPkidClient();

        const contacts = await pkidClient.getDoc(appKeyPair.value.publicKey, 'contacts');
        if (!contacts.success) {
            return;
        }

        pkidContacts.value = contacts.data.filter((contact: Contact) => contact.type == chain);
    };
</script>

<style scoped></style>
