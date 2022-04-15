/*
Test scenario
Generated seed: treat gloom wrong topple learn device stable orchard essay bitter brand cattle amateur beach bulk build cluster quit survey news physical hole tower glass
Private key (1st one generated from the seed): 1698405035c751f9cfb42089ce71345a03fa9a7ae66976e21299bfb3ebf37272
Generated address: 015c403d0bcf9b889c81a78cd4b93fbb27b6f31ef9c45ae73ed9c7ea3a01c938023160920f3d0b
Stellar Seed: SALJQQCQGXDVD6OPWQQITTTRGRNAH6U2PLTGS5XCCKM37M7L6NZHF7HN
Stellar address: GBTJEFDDMA5N4TDBFLJGA6K3MQFNHR2KUUFYAKYCOAEE43JD4CP3UTQC
Rivine address from Stellar address: 015c403d0bcf9b889c81a78cd4b93fbb27b6f31ef9c45ae73ed9c7ea3a01c938023160920f3d0b
*/

import {
    calculateWalletEntropyFromAccount,
    keypairFromAccount,
    revineAddressFromSeed,
} from './cryptoService';

const seedPhrase: string =
    'treat gloom wrong topple learn device stable orchard essay bitter brand cattle amateur beach bulk build cluster quit survey news physical hole tower glass';
const seedPhrase25words: string =
    'puzzle jar fiber ahead cause vote bus mobile junior hundred evoke top ribbon omit idea web oil bus wall holiday day joke rude this stellar';
const seedPhrase29words: string =
    'fully mobile shyness pixels sapling match yacht shipped aisle angled olive awful volcano dented knuckle jostle aching yodel austere peeled fowls punch cedar owls lumber ascend noted oyster acumen';

describe('crypto', () => {
    it('should generate correct first stellar keypair', () => {
        const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 0);
        const keypair = keypairFromAccount(walletEntropy);

        expect(keypair.secret()).toBe(
            'SALJQQCQGXDVD6OPWQQITTTRGRNAH6U2PLTGS5XCCKM37M7L6NZHF7HN'
        );
        expect(keypair.publicKey()).toBe(
            'GBTJEFDDMA5N4TDBFLJGA6K3MQFNHR2KUUFYAKYCOAEE43JD4CP3UTQC'
        );
    });
    it('should generate correct stellar keypair from 25 words ', () => {
        // If we have a 25 word seed we import using -1.
        const walletEntropy = calculateWalletEntropyFromAccount(
            seedPhrase25words,
            -1
        );
        const keypair = keypairFromAccount(walletEntropy);

        expect(keypair.secret()).toBe(
            'SCXO52KWQKJET26HXRZXSLPFHBZHXEJU3QP4NGOD37NLMY4A6CXT6VXL'
        );
        expect(keypair.publicKey()).toBe(
            'GA62DWANAI5KBY3JJNMPVYPKI5AWILP2WQTJU63Q3JVHUPSC6Y7AATEP'
        );
        //GA62DWANAI5KBY3JJNMPVYPKI5AWILP2WQTJU63Q3JVHUPSC6Y7AATEP
    });
    it('should generate correct second stellar keypair', () => {
        const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 1);
        const keypair = keypairFromAccount(walletEntropy);

        expect(keypair.secret()).toBe(
            'SCIPCPF2BWIY6HCHVYYTOUX7YEJIKPDZJJQOS52LA6YOEITYVWUN4BBQ'
        ); // don't worry about it
        expect(keypair.publicKey()).toBe(
            'GCSXHYFBX5JVLOFTWDUIPRQRU23AF5C35C35WT7ADZ4QKOUXPNHK5RHC'
        );
    });
    it('should generate correct stellar keypair from "deprecated" 29 word mnemonic', () => {
        const walletEntropy = calculateWalletEntropyFromAccount(
            seedPhrase29words,
            0
        );
        const keypair = keypairFromAccount(walletEntropy);

        expect(keypair.secret()).toBe(
            'SBEK3DEGEK3CAS5HQJ5Z4IN7KQCSMU2RMHWT4BXJ2NYMZGFVYJ7HLO3K'
        );
        expect(keypair.publicKey()).toBe(
            'GBQB5QGEVLAKFBSJUXGNCK4RAL5P74UDTTY2IXKXKSO55SWIBRFWBDCE'
        );
    });
    it('should generate correct revine address from  mnemonic', () => {
        const address = revineAddressFromSeed(seedPhrase, 0);

        expect(address).toBe(
            '015c403d0bcf9b889c81a78cd4b93fbb27b6f31ef9c45ae73ed9c7ea3a01c938023160920f3d0b'
        );
    });
    it('should generate correct revine address from  mnemonic 2', () => {
        const address = revineAddressFromSeed(
            'hat nose involve faint auction liquid sting ability minute clap road urge focus shrug net vote solution innocent industry vintage rescue voice embody idea',
            0
        );
        expect(address).toBe(
            '013d67775c28979bf351bea7a53b57a8b7ce5068d69663cd14e3b3b6ddaf05a3f5b44379f88bbe'
        );
    });
});
