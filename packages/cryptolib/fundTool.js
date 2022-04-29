const { generateMnemonic } = require("bip39");
const { keypairFromAccount, calculateWalletEntropyFromAccount } = require("./dist/service/cryptoService");
const { addTrustLine } = require("./dist/service/stellarService");
const axios = require('axios')

async function name() {
  const testSeedPhrase = generateMnemonic(256);
  console.log(testSeedPhrase);
  const entropy = calculateWalletEntropyFromAccount(testSeedPhrase, 0)
  const kp = keypairFromAccount(entropy);
  await axios.get("https://friendbot.stellar.org", {
    params: {
      addr: kp.publicKey()
    }
  });
  await addTrustLine(kp);
}

name().then(() => console.log("done"));
