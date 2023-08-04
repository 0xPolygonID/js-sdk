"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToHex = exports.decodeBase64url = exports.encodeBase64url = exports.hexToBytes = exports.bytesToBase58 = exports.base58ToBytes = exports.bytesToBase64 = exports.base64ToBytes = exports.bytesToBase64url = exports.byteDecoder = exports.byteEncoder = void 0;
// Copyright 2023 Veramo.io.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const u8a = __importStar(require("uint8arrays"));
exports.byteEncoder = new TextEncoder();
exports.byteDecoder = new TextDecoder();
function bytesToBase64url(b) {
    return u8a.toString(b, 'base64url');
}
exports.bytesToBase64url = bytesToBase64url;
function base64ToBytes(s) {
    const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return u8a.fromString(inputBase64Url, 'base64url');
}
exports.base64ToBytes = base64ToBytes;
function bytesToBase64(b) {
    return u8a.toString(b, 'base64pad');
}
exports.bytesToBase64 = bytesToBase64;
function base58ToBytes(s) {
    return u8a.fromString(s, 'base58btc');
}
exports.base58ToBytes = base58ToBytes;
function bytesToBase58(b) {
    return u8a.toString(b, 'base58btc');
}
exports.bytesToBase58 = bytesToBase58;
function hexToBytes(s) {
    const input = s.startsWith('0x') ? s.substring(2) : s;
    return u8a.fromString(input.toLowerCase(), 'base16');
}
exports.hexToBytes = hexToBytes;
function encodeBase64url(s) {
    return bytesToBase64url(u8a.fromString(s));
}
exports.encodeBase64url = encodeBase64url;
function decodeBase64url(s) {
    return u8a.toString(base64ToBytes(s));
}
exports.decodeBase64url = decodeBase64url;
function bytesToHex(b) {
    return u8a.toString(b, 'base16');
}
exports.bytesToHex = bytesToHex;
//# sourceMappingURL=encoding.js.map