module.exports = {
    removeRange: true,
    upgrade: true,
    color: true,
    packageManager: 'yarn',
    reject: [
        '@polkadot/api', //@todo: upgrade polkadot api
        '@polkadot/extension-dapp',
        'stellar-sdk', // @todo: upgrade stellar-sdk
    ],
};
