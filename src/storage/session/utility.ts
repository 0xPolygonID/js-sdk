import crypto from 'crypto' // Node.js crypto module
import { encodeBase64url, utf8Decoder, utf8Encoder } from '../../utils'
import { base64UrlToBytes, bytesToBase64url } from '../../utils/encoding';
import { decodeBase64url } from 'did-jwt/lib/util';

const randomBytes = (length: number): Uint8Array => {
  if (typeof window === 'undefined') {
    return crypto.randomBytes(length)
  } else {
    return window.crypto.getRandomValues(new Uint8Array(length))
  }
}

export const split = (secret: string): string[] => {
  const buff = utf8Encoder(secret)
  const rand1 = randomBytes(buff.length)
  const rand2 = new Uint8Array(rand1) // Make a copy
  for (let i = 0; i < buff.length; i++) {
    rand2[i] = rand2[i] ^ buff[i]
  }
  return [encodeBase64url(bytesToBase64url(rand1)), encodeBase64url(bytesToBase64url(rand2))]
}

export const join = (a: string, b: string) => {
  if (a.length !== b.length) {
    return null
  }
  const aBuff = base64UrlToBytes(decodeBase64url(a))
  const bBuff = base64UrlToBytes(decodeBase64url(b))
  const output = new Uint8Array(aBuff.length)
  for (const i in output) {
    output[i] = aBuff[i] ^ bBuff[i]
  }
  return utf8Decoder(output)
}

// --

const loadObjectFromWindowName = (): { [key: string]: string } => {
  if (!window.top || !window.top.name || window.top.name === '') {
    return {}
  }
  try {
    return JSON.parse(window.top.name)
  } catch { /* empty */ }
  return {}
}

export const saveToWindowName = (name: string, data: string) => {
  const obj = loadObjectFromWindowName()
  obj[name] = data
  if (window.top) {
    window.top.name = JSON.stringify(obj)
  }
}

export const loadFromWindowName = (name: string) => {
  const saved = loadObjectFromWindowName()
  if (!(name in saved)) {
    return null
  }
  const { [name]: out, ...safe } = saved
  const json = JSON.stringify(safe)
  if (window.top) {
    window.top.name = json === '{}' ? '' : json
  }
  return out || null
}