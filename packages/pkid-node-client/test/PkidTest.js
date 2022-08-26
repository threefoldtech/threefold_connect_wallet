const { expect, assert } = require('chai')
const Pkid = require('../src')
const Util = require('../src/util')

const testUrl = 'http://localhost:8080'

describe('Pkid', () => {

  let client
  let secondClient
  let keyPair
  let secondKeyPair
  let primaryKey
  let value

  beforeEach(async () => {
    keyPair = await Util.generateKeypair()
    secondKeyPair = await Util.generateKeypair()
    client = new Pkid(testUrl, keyPair)
    secondClient = new Pkid(testUrl, secondKeyPair)

    primaryKey = [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
    value = [...Array(64)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
  })

  it('should be able to be instantiated', () => {
    const pkid = new Pkid()
    expect(pkid).to.be.an('object')
  })
  it('should be able to set document', async () => {
    const result = await client.setDoc(primaryKey, value)
    expect(result).to.be.an('object').that.includes.keys('status', 'data')
    expect(result.status).to.be.equal(200)
    expect(result.data.message).to.be.equal('succes')
  })
  it('should be able to get a previously set value', async () => {
    await client.setDoc(primaryKey, value)
    const result = await client.getDoc(keyPair.publicKey, primaryKey)

    expect(result).to.be.an('object').that.includes.keys('verified', 'data')
    expect(result.verified).to.be.equal(true)
    expect(result.data).to.be.equal(value)
  })
  it('should be able to set and encrypt a document', async () => {
    const result = await client.setDoc(primaryKey, value,true)
    expect(result).to.be.an('object').that.includes.keys('status', 'data')
    expect(result.status).to.be.equal(200)
    expect(result.data.message).to.be.equal('succes')
  })
  it('should be able to get and decrypt a previously set and encrypted value', async () => {
    await client.setDoc(primaryKey, value,true)
    const result = await client.getDoc(keyPair.publicKey, primaryKey)

    expect(result).to.be.an('object').that.includes.keys('decrypted','verified', 'data')
    expect(result.verified).to.be.equal(true)
    expect(result.decrypted).to.be.equal(true)
    expect(result.data).to.be.equal(value)
  })
  it('should be able to set and encrypte a value with a diffrent keypair', async () => {
    expect(keyPair.privateKey).to.not.be.equal(secondKeyPair.privateKey)

    const result = await client.setDoc(primaryKey, value,true, secondKeyPair.publicKey)
    expect(result).to.be.an('object').that.includes.keys('status', 'data')
    expect(result.status).to.be.equal(200)
    expect(result.data.message).to.be.equal('succes')
  })
  it('should be able to get and decrypt a previously set and encrypted value by another keypair by that pair', async () => {
    await client.setDoc(primaryKey, value,true, secondKeyPair.publicKey)
    const result = await secondClient.getDoc(keyPair.publicKey, primaryKey)

    expect(result).to.be.an('object').that.includes.keys('decrypted','verified', 'data')
    expect(result.verified).to.be.equal(true)
    expect(result.decrypted).to.be.equal(true)
    expect(result.data).to.be.equal(value)
  })
  it('should not be able to get and decrypt a previously set and encrypted value by another keypair by another pair', async () => {
    await client.setDoc(primaryKey, value,true)
    const result = await secondClient.getDoc(keyPair.publicKey, primaryKey)

    expect(result).to.be.an('object').that.includes.keys('decrypted','verified')
    expect(result).to.not.include.key('data')
    expect(result.verified).to.be.equal(true)
    expect(result.decrypted).to.be.equal(false)
  })
  it('should not be able to get a value which is not yet set', async () => {
    const result = await client.getDoc(keyPair.publicKey, primaryKey)

    expect(result).to.be.an('object').that.not.includes.keys('success','data')
    expect(result.success).to.not.be.equal(true)
  })
  it('should be able to get a previously set array value', async () => {
    value = [{
      test: value
    }]
    await client.setDoc(primaryKey, value)
    const result = await client.getDoc(keyPair.publicKey, primaryKey)

    expect(result).to.be.an('object').that.includes.keys('verified', 'data')
    expect(result.verified).to.be.equal(true)
    expect(result.data[0].test).to.be.equal(value[0].test)
  })
  it('should be able to get and decrypt a previously set and encrypted array value by another keypair by that pair', async () => {
    value = [{
      test: value
    }]
    await client.setDoc(primaryKey, value,true, secondKeyPair.publicKey)
    const result = await secondClient.getDoc(keyPair.publicKey, primaryKey)

    expect(result).to.be.an('object').that.includes.keys('decrypted','verified', 'data')
    expect(result.verified).to.be.equal(true)
    expect(result.decrypted).to.be.equal(true)
    expect(result.data).to.eql(value)
  })
})