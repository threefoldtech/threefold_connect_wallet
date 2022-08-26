import axios from 'axios';
import { sign } from 'tweetnacl';
import { encodeUTF8, decodeBase64 } from 'tweetnacl-util';
import { decrypt, encodeHex, encrypt, signEncode } from './util';
import { KeyPair } from 'libsodium-wrappers';

const ApiVersion = `v1`;
const dataVersion = 1;

export default class Pkid {
  constructor(private readonly nodeUrl: string, private readonly keyPair: KeyPair) {}

  async getDoc<T>(signPk: Uint8Array, requestKey: string) {
    let res;
    try {
      res = await axios({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        url: `${this.nodeUrl}/v1/documents/${encodeHex(signPk)}/${requestKey}`,
      });
    } catch (e) {
      let status = 'no_status';
      if (e.response && e.response.status) {
        status = e.response.status;
      }
      return {
        status: status,
        error: e.message,
      };
    }

    const verified = sign.open(decodeBase64(res.data.data), signPk);
    if (!verified) {
      return {
        error: 'could not verify data',
        verified: false,
      };
    }

    const data = JSON.parse(encodeUTF8(verified));

    if (!data.is_encrypted) {
      return {
        success: true,
        data: data.payload,
        verified: true,
        data_version: data.data_version,
      };
    }

    let decryptedData;
    try {
      decryptedData = await decrypt(data.payload, this.keyPair.publicKey, this.keyPair.privateKey);
    } catch (e) {}
    if (!decryptedData) {
      return {
        error: 'could not decrypt data',
        verified: true,
        decrypted: false,
        data_version: data.data_version,
      };
    }

    return {
      success: true,
      data: JSON.parse(decryptedData),
      verified: true,
      decrypted: true,
      data_version: data.data_version,
    };
  }

  async setDoc<T>(requestKey: string, payload: T, willEncrypt: boolean = false, publicKey?: Uint8Array) {
    const header = {
      intent: 'pkid.store',
      timestamp: new Date().getTime(),
    };

    const encryptionPublicKey = publicKey ? publicKey : this.keyPair.publicKey;

    const handledPayload = willEncrypt ? await encrypt<T>(payload, encryptionPublicKey) : payload;

    const payloadContainer = {
      is_encrypted: Boolean(willEncrypt),
      payload: handledPayload,
      data_version: dataVersion,
    };

    try {
      return await axios({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: signEncode(header, this.keyPair.privateKey),
        },
        data: JSON.stringify(signEncode(payloadContainer, this.keyPair.privateKey)),
        url: `${this.nodeUrl}/${ApiVersion}/documents/${encodeHex(this.keyPair.publicKey)}/${requestKey}`,
      });
    } catch (e) {
      return e;
    }
  }

  async getNamespace<T>(requestNamespace: string, namespacePubKey: Uint8Array) {
    let res;
    try {
      res = await axios({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        url: `${this.nodeUrl}/v1/name-service/${requestNamespace}`,
      });
    } catch (e) {
      let status = 'no_status';
      if (e.response && e.response.status) {
        status = e.response.status;
      }
      return {
        status: status,
        error: e.message,
      };
    }

    const verified = sign.open(decodeBase64(res.data.data), namespacePubKey);
    if (!verified) {
      return {
        error: 'could not verify data',
        verified: false,
      };
    }

    const data = JSON.parse(encodeUTF8(verified)) as T;

    return {
      success: true,
      verified: true,
      data,
    };
  }

  async setNamespace(requestNamespace: string, signedPayload: string) {
    //const header = {
    //  intent: 'pkid.store',
    //  timestamp: new Date().getTime(),
    //};

    const payloadContainer = {
      payload: signedPayload,
      data_version: dataVersion,
    };

    try {
      return await axios({
        method: 'PUT',
        data: payloadContainer,
        url: `${this.nodeUrl}/${ApiVersion}/name-service/${requestNamespace}`,
      });
    } catch (e) {
      return e;
    }
  }
}
