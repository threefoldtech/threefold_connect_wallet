# PKID

## Concept
PKID is a public Key Indexed Datastore. You can save plain or encrypted data in a public key index; as long as you are the owner of the secret corresponding to that public key.

# install

```
npm install @jimber/pkid
```

# initialize

```
const pkid = require('pkid')
const client = new pkid(url, publicKey, privateKey)
```

# Routes

## Document storage
### Set document

```
client.setDoc(key, document)
```

Set the value of a document corresponding to {key} indexed by the public key {pk}.


### Get document

```
client.getDoc(pk, key)
```

Get the value of a document corresponding to {key} indexed by the public key {pk}. There is no requirement for a security header

