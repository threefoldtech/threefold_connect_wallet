<template>
    <div class="fixed top-0 bottom-0 left-0 right-0">
        <MainLayout>
            <template #header>
                <PageHeader>
                    <template #before>
                        <XIcon @click="emit('close')" />
                    </template>
                    <h1>{{ $t('contacts.title') }}</h1>
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
                        class="mb-4 rounded-md border-[1px] p-2 text-gray-700"
                        v-for="contact in myContacts"
                        @click="selectedContact(contact)"
                    >
                        <div class="flex flex-row items-center">
                            <div class="w-10/12">
                                <div class="text-left text-sm font-bold text-black">
                                    {{ contact.name }}
                                </div>
                                <div class="truncate">
                                    {{ contact.address }}
                                </div>
                            </div>
                            <div class="flex w-2/12 justify-end pr-2 text-right">
                                <ArrowRightIcon class="h-5" />
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="selectedTab === Tabs.OTHERS"
                        class="mb-4 rounded-md border-[1px] p-2 text-gray-700"
                        v-for="contact in contacts"
                        @click="selectedContact(contact)"
                    >
                        <div class="flex flex-row items-center">
                            <div class="w-10/12">
                                <div class="text-left text-sm font-bold text-black">
                                    {{ contact.name }}
                                </div>
                                <div class="truncate">
                                    {{ contact.address }}
                                </div>
                            </div>
                            <div class="flex w-2/12 justify-end pr-2 text-right">
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
    import { ContactType } from '@/types/contact.types';
    import { Wallet, wallets } from '@/service/walletService';
    import { ChainTypes } from '@/enums/chains.enums';
    import { onBeforeMount } from '@vue/runtime-core';
    import { addNotification, NotificationType } from '@/service/notificationService';
    import { translate } from '@/util/translate';
    import { getContactsFromPkid, saveContactToPkid } from '@/service/contactService';

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
    const contacts = ref<ContactType[]>([]);

    const init = async () => {
        // Load contacts related to chain
        const pkidContacts: ContactType[] = await getContactsFromPkid();
        contacts.value = pkidContacts.filter(c => c.type === chain);
    };

    const showHint = useLocalStorage('show-add-contact-hint', true);
    const enableHint = () => {
        showHint.value = true;
    };

    const myContacts: Ref<ContactType[]> = computed(() =>
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

    const selectedContact = (contact: ContactType) => {
        emit('chosenContact', contact);
    };

    const saveNewContact = async (contact: ContactType) => {
        await saveContactToPkid(contact);

        addNotification(NotificationType.success, translate('contacts.dialog.success'));
        showAddContact.value = false;

        // Refresh contacts
        const pkidContacts: ContactType[] = await getContactsFromPkid();
        contacts.value = pkidContacts.filter(c => c.type === chain);
    };

    init();
</script>

<style scoped></style>
