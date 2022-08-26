const { expect, assert } = require('chai')
const Util = require('../src/util')

describe('Util', () => {
  it('should generate a keypair', async () => {
    const keyPair = await Util.generateKeypair()
    expect(keyPair).to.be.an('object').that.includes.keys('privateKey', 'publicKey')
    expect(keyPair.privateKey).to.be.an('Uint8Array')
    expect(keyPair.publicKey).to.be.an('Uint8Array')
  })
  it('should encrypt', async () => {
    Util.encrypt()
  })
})