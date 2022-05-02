# Threefold wallet

Project to manage cryptographic currency from **[Threefold](https://threefold.io/)** on the [Stellar blockchain](https://www.stellar.org/) and on [Substrate(TFChain)](https://substrate.io/).

[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/tterb/atomic-design-ui/blob/master/LICENSEs)

[![Build Badge](https://img.shields.io/github/workflow/status/threefoldtech/wallet-next/next-production?label=prod-build)](https://github.com/threefoldtech/wallet-next/actions/workflows/next_production.yml)

## Tech Stack

**Client:** Vue, Vite, TailwindCSS

**Server:** Node, Fastify

**Repo:** Turborepo

**Package manager:** yarn

## Run Locally

Clone the project

```bash
  git clone git@github.com:threefoldtech/threefold_wallet.git
```

Go to the project directory

```bash
  cd threefold_wallet
```

Install dependencies

```bash
  yarn install
```

Start the client andserver

```bash
  yarn run dev
```

## Deployment

To deploy this project you will need to tag then a github action will do the rest

### Deploy wallet to production

tag with `next-vx.x.x`

### Deploy farmer util to production

tag with `farmer-vx.x.x`

## Support

For support, got to support in the threefold connect app.

## Related

[wallet v2](https://github.com/threefoldtech/threefold_wallet)

## License

[MIT](https://choosealicense.com/licenses/mit/)

![Threefold](https://threefold.io/assets/static/footer_logo2.7a5182b.f5242b4436c182c40f7f53a060a6422e.png)

## Acceptance testing

- Fully new 3bot account => Open wallet, create daily wallet.
- Fully new 3bot account => Open wallet, import wallet, then create daily wallet.
- Delete 3bot account with wallets, recover account. => Same state.
- Open farmers tab without openings wallet tab => Clear error telling me I need to open wallet tab first.
- Send each token available.
- Generate QR code for each token available.
- Scan QR code for each token available.
- Use max length message for a transfer.
- Use no message.
- Attempt to send more currency than you have.
- Have 10 TFT, send 9.9999 TFT ( with fee it goes over your max amount, without fee it doesn't ).
- Be on shitty 3g internet, open wallet after clearing the app cache (make sure bundle isn't cached).
- Test copy/paste functionality in various fields in the wallet.
- Test back buttons both on wallet menu and on device back button itself.
- Have a wallet with some locked tokens, see if locked tokens appear.
- Have a wallet with tokens to unlock, see if they actually unlock.
- Have vested tokens, see if they appear.
- Have a wallet with vasted tokens to unvest, see if they actually unvest.
- Test copy buttons for Stellar/TFChain address.
- Test display secret, also try to import each secret in another 3bot account.
- Rename wallet to max length.
- Rename wallet to weird characters.
- Rename wallet to existing wallet name.
- See transaction history.
- Filter transaction history.
- Import using invalid secret.
- Import using invalid seed phrase.
- Import with address index (advanced).
