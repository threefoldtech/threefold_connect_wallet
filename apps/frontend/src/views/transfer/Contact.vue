<template>
    <div class="fixed top-0 bottom-0 left-0 right-0 z-10">
        <MainLayout>
            <template #header>
                <PageHeader>
                    <template #before>
                        <XIcon @click="closeDialog" />
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
                        v-for="contact in ownedContacts"
                        @click="selectedContact(contact)"
                    >
                        <div class="flex flex-row items-center">
                            <div class="w-10/12">
                                <div class="text-black text-left text-sm font-bold">
                                    {{ contact.name }}
                                </div>
                                <div class="truncate" v-if="chain === ChainTypes.STELLAR">
                                    {{ contact.stellarAddress }}
                                </div>
                                <div class="truncate" v-else-if="chain === ChainTypes.SUBSTRATE">
                                    {{ contact.substrateAddress }}
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
            @cancel="closeModal"
            @confirm="saveNewContact"
            v-if="showAddContact"
        ></AddContact>
    </div>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import { XIcon, ArrowRightIcon } from '@heroicons/vue/outline';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { RadioGroup, RadioGroupLabel, RadioGroupOption } from '@headlessui/vue';
    import { computed, onMounted, ref } from 'vue';
    import { useLocalStorage } from '@vueuse/core';
    import { appKeyPair } from '@/service/cryptoService';
    import { getPkidClient, savePkidContact } from '@/service/pkidService';
    import { Contact, PkidContact } from '@/types/conctact.types';
    import { Wallet, wallets } from '@/service/walletService';
    import { ChainTypes } from '@/enums/chains.enums';

    import AddContact from '@/components/dialogs/wallet/AddContactModal.vue';

    enum Tabs {
        'OWN_WALLETS' = 'Own wallets',
        'OTHERS' = 'Others',
    }

    const completeButtonRef = ref(null);

    const router = useRouter();
    const route = useRoute();

    const selectedTab = ref<Tabs>(Tabs.OWN_WALLETS);

    const showHint = useLocalStorage('show-add-contact-hint', true);
    const enableHint = () => {
        showHint.value = true;
    };

    interface IProps {
        chain: string;
    }

    const emit = defineEmits(['close', 'chosenContact']);

    const showAddContact = ref<boolean>(false);

    const { chain } = defineProps<IProps>();

    const pkidContacts = ref<Contact[]>([]);
    const ownedContacts = wallets.value.map((wallet: Wallet) => {
        return {
            stellarAddress: wallet.keyPair.stellarKeyPair.publicKey(),
            substrateAddress: wallet.keyPair.getSubstrateKeyring().address,
            name: wallet.name,
        };
    });

    const selectedContact = (contact: Contact) => {
        emit('chosenContact', contact);
    };

    const saveNewContact = async (contact: PkidContact) => {
        await savePkidContact(contact);
        showAddContact.value = false;

        await getPkidContacts();
    };

    const closeModal = () => {
        showAddContact.value = false;
    };

    const getPkidContacts = async () => {
        const pkidClient = getPkidClient();

        const contacts = await pkidClient.getDoc(appKeyPair.value.publicKey, 'contacts');
        if (!contacts.success) {
            return;
        }

        pkidContacts.value = contacts.data.filter((contact: Contact) => contact.type == chain);
    };

    onMounted(async () => {
        await getPkidContacts();
    });

    const closeDialog = () => {
        emit('close');
    };
</script>

<style scoped></style>
