// import web3 from 'web3'
//
// export function convertBep20ToStellarMemo(address: string): string {
//     if (!web3.utils.isAddress(address)) {
//         throw Error('BEP20 Address is not valid')
//     }
//
//     return Buffer.from(address.replace('0x', ''), 'hex').toString('base64')
// }

export function convertBep20ToStellarMemo(address: string): string {
    return Buffer.from(address.replace('0x', ''), 'hex').toString('base64');
}
