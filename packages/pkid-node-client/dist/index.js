'use strict';

var axios = require('axios');
var tweetnacl = require('tweetnacl');
var tweetnaclUtil = require('tweetnacl-util');
var libsodiumWrappers = require('libsodium-wrappers');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var encrypt = function (json, publicKey) { return __awaiter(void 0, void 0, void 0, function () {
    var message, encryptedMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, libsodiumWrappers.ready];
            case 1:
                _a.sent();
                message = tweetnaclUtil.decodeUTF8(JSON.stringify(json));
                publicKey = libsodiumWrappers.crypto_sign_ed25519_pk_to_curve25519(publicKey);
                encryptedMessage = libsodiumWrappers.crypto_box_seal(message, publicKey);
                return [2 /*return*/, tweetnaclUtil.encodeBase64(encryptedMessage)];
        }
    });
}); };
var decrypt = function (ciphertext, publicKey, privateKey) { return __awaiter(void 0, void 0, void 0, function () {
    var decodedCiphertext, curvePublicKey, curvePrivateKey, decrypted;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, libsodiumWrappers.ready];
            case 1:
                _a.sent();
                decodedCiphertext = tweetnaclUtil.decodeBase64(ciphertext);
                curvePublicKey = libsodiumWrappers.crypto_sign_ed25519_pk_to_curve25519(publicKey);
                curvePrivateKey = libsodiumWrappers.crypto_sign_ed25519_sk_to_curve25519(privateKey);
                decrypted = libsodiumWrappers.crypto_box_seal_open(decodedCiphertext, curvePublicKey, curvePrivateKey);
                if (!decrypted) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, tweetnaclUtil.encodeUTF8(decrypted)];
        }
    });
}); };
var sign = function (message, privateKey) {
    return libsodiumWrappers.crypto_sign(message, privateKey);
};
var signEncode = function (payload, privateKey) {
    var message = tweetnaclUtil.decodeUTF8(JSON.stringify(payload));
    return tweetnaclUtil.encodeBase64(sign(message, privateKey));
};
var encodeHex = function (byteArray) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xff).toString(16)).slice(-2);
    }).join('');
};

var ApiVersion = "v1";
var dataVersion = 1;
var Pkid = /** @class */ (function () {
    function Pkid(nodeUrl, keyPair) {
        this.nodeUrl = nodeUrl;
        this.keyPair = keyPair;
    }
    Pkid.prototype.getDoc = function (signPk, requestKey) {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_1, status, verified, data, decryptedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios__default["default"]({
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                url: "".concat(this.nodeUrl, "/v1/documents/").concat(encodeHex(signPk), "/").concat(requestKey),
                            })];
                    case 1:
                        res = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        status = 'no_status';
                        if (e_1.response && e_1.response.status) {
                            status = e_1.response.status;
                        }
                        return [2 /*return*/, {
                                status: status,
                                error: e_1.message,
                            }];
                    case 3:
                        verified = tweetnacl.sign.open(tweetnaclUtil.decodeBase64(res.data.data), signPk);
                        if (!verified) {
                            return [2 /*return*/, {
                                    error: 'could not verify data',
                                    verified: false,
                                }];
                        }
                        data = JSON.parse(tweetnaclUtil.encodeUTF8(verified));
                        if (!data.is_encrypted) {
                            return [2 /*return*/, {
                                    success: true,
                                    data: data.payload,
                                    verified: true,
                                    data_version: data.data_version,
                                }];
                        }
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, decrypt(data.payload, this.keyPair.publicKey, this.keyPair.privateKey)];
                    case 5:
                        decryptedData = _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        if (!decryptedData) {
                            return [2 /*return*/, {
                                    error: 'could not decrypt data',
                                    verified: true,
                                    decrypted: false,
                                    data_version: data.data_version,
                                }];
                        }
                        return [2 /*return*/, {
                                success: true,
                                data: JSON.parse(decryptedData),
                                verified: true,
                                decrypted: true,
                                data_version: data.data_version,
                            }];
                }
            });
        });
    };
    Pkid.prototype.setDoc = function (requestKey, payload, willEncrypt, publicKey) {
        if (willEncrypt === void 0) { willEncrypt = false; }
        return __awaiter(this, void 0, void 0, function () {
            var header, encryptionPublicKey, handledPayload, _a, payloadContainer, e_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        header = {
                            intent: 'pkid.store',
                            timestamp: new Date().getTime(),
                        };
                        encryptionPublicKey = publicKey ? publicKey : this.keyPair.publicKey;
                        if (!willEncrypt) return [3 /*break*/, 2];
                        return [4 /*yield*/, encrypt(payload, encryptionPublicKey)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = payload;
                        _b.label = 3;
                    case 3:
                        handledPayload = _a;
                        payloadContainer = {
                            is_encrypted: Boolean(willEncrypt),
                            payload: handledPayload,
                            data_version: dataVersion,
                        };
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, axios__default["default"]({
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: signEncode(header, this.keyPair.privateKey),
                                },
                                data: JSON.stringify(signEncode(payloadContainer, this.keyPair.privateKey)),
                                url: "".concat(this.nodeUrl, "/").concat(ApiVersion, "/documents/").concat(encodeHex(this.keyPair.publicKey), "/").concat(requestKey),
                            })];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6:
                        e_3 = _b.sent();
                        return [2 /*return*/, e_3];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Pkid.prototype.getNamespace = function (requestNamespace, namespacePubKey) {
        return __awaiter(this, void 0, void 0, function () {
            var res, e_4, status, verified, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios__default["default"]({
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                url: "".concat(this.nodeUrl, "/v1/name-service/").concat(requestNamespace),
                            })];
                    case 1:
                        res = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_4 = _a.sent();
                        status = 'no_status';
                        if (e_4.response && e_4.response.status) {
                            status = e_4.response.status;
                        }
                        return [2 /*return*/, {
                                status: status,
                                error: e_4.message,
                            }];
                    case 3:
                        verified = tweetnacl.sign.open(tweetnaclUtil.decodeBase64(res.data.data), namespacePubKey);
                        if (!verified) {
                            return [2 /*return*/, {
                                    error: 'could not verify data',
                                    verified: false,
                                }];
                        }
                        data = JSON.parse(tweetnaclUtil.encodeUTF8(verified));
                        return [2 /*return*/, {
                                success: true,
                                verified: true,
                                data: data,
                            }];
                }
            });
        });
    };
    Pkid.prototype.setNamespace = function (requestNamespace, signedPayload) {
        return __awaiter(this, void 0, void 0, function () {
            var payloadContainer, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payloadContainer = {
                            payload: signedPayload,
                            data_version: dataVersion,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios__default["default"]({
                                method: 'PUT',
                                data: payloadContainer,
                                url: "".concat(this.nodeUrl, "/").concat(ApiVersion, "/name-service/").concat(requestNamespace),
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_5 = _a.sent();
                        return [2 /*return*/, e_5];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Pkid;
}());

module.exports = Pkid;
//# sourceMappingURL=index.js.map
