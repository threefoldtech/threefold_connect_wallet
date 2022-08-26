import {
  crypto_box_seal,
  crypto_box_seal_open,
  crypto_sign,
  crypto_sign_ed25519_pk_to_curve25519,
  crypto_sign_ed25519_sk_to_curve25519,
  crypto_sign_keypair,
  ready,
} from 'libsodium-wrappers';

import {
  decodeBase64,
  decodeUTF8,
  encodeBase64,
  encodeUTF8,
} from 'tweetnacl-util';

export const encrypt = async <T>(json: T, publicKey: Uint8Array) => {
  await ready;
  const message = decodeUTF8(JSON.stringify(json));

  publicKey = crypto_sign_ed25519_pk_to_curve25519(publicKey);
  const encryptedMessage = crypto_box_seal(message, publicKey);

  return encodeBase64(encryptedMessage);
};

export const decrypt = async (
  ciphertext: string,
  publicKey: Uint8Array,
  privateKey: Uint8Array,
) => {
  await ready;

  const decodedCiphertext: Uint8Array = decodeBase64(ciphertext);

  const curvePublicKey: Uint8Array =
    crypto_sign_ed25519_pk_to_curve25519(publicKey);
  const curvePrivateKey: Uint8Array =
    crypto_sign_ed25519_sk_to_curve25519(privateKey);

  const decrypted = crypto_box_seal_open(
    decodedCiphertext,
    curvePublicKey,
    curvePrivateKey,
  );

  if (!decrypted) {
    return null;
  }

  return encodeUTF8(decrypted);
};

export const sign = (message: string | Uint8Array, privateKey: Uint8Array) => {
  return crypto_sign(message, privateKey);
};

export const signEncode = <T>(payload: T, privateKey: Uint8Array) => {
  const message = decodeUTF8(JSON.stringify(payload));

  return encodeBase64(sign(message, privateKey));
};

export const encodeHex = (byteArray) =>
  Array.from(byteArray, (byte: any) =>
    ('0' + (byte & 0xff).toString(16)).slice(-2),
  ).join('');

export const generateKeypair = async () => {
  await ready;
  return crypto_sign_keypair();
};
