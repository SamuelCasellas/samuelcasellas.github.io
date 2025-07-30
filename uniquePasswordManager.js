// SIMPLE FUNCTIONS

// https://anonymousoverflow.privacyredirect.com/questions/40459020/angular-js-cryptography-pbkdf2-and-iteration
// See more examples at https://github.com/diafygi/webcrypto-examples
async function PBKDF2(password, salt, iterations, length, hash) {
  // First, create a PBKDF2 "key" containing the password
  try {
    const name = "PBKDF2";
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      stringToArrayBuffer(password),
      { name },
      false,
      ["deriveKey"]);
    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name,
        "salt": stringToArrayBuffer(salt),
        iterations,
        hash // the algorithm used
      },
      baseKey,
      { "name": "AES-CBC", length }, // Key we want. Can be any AES algorithm ("AES-CTR", "AES-CBC", "AES-CMAC", "AES-GCM", "AES-CFB", "AES-KW", "ECDH", "DH", or "HMAC")
      true, // Extractable
      ["encrypt", "decrypt"] // For new key
    );
    const keyBytes = await window.crypto.subtle.exportKey("raw", aesKey);
    // Display key in Base64 format
    var keyS = arrayBufferToString(keyBytes);
    var keyB64 = btoa(keyS);
    console.log(keyB64);
    return keyB64
  } catch (err) {
    alert("Key derivation failed: " + err.message);
  }
}

async function createHmac(website, secret) {
  // attempt 1
//   key = await window.crypto.subtle.generateKey(
//   { name: 'HMAC', hash: { name: 'SHA-256' } },
//   true,
//   ['sign', 'verify']
// );

// const signature = await window.crypto.subtle.sign(
//   { name: 'HMAC' },
//   key,
//   new TextEncoder().encode('message')
// );
// return signature;

// attempt 2
  // try {
  //   //returns the symmetric key
  //   return await window.crypto.subtle.importKey(
  //     "jwk", // can be "jwk" or "raw"
  //     {
  //       kty: "oct",
  //       k: key,
  //       alg: "HS256",
  //       ext: true,
  //     },
  //     {
  //       name: "HMAC",
  //       hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
  //     },
  //     true, // whether the key is extractable (i.e. can be used in exportKey)
  //     ["sign", "verify"] // can be any combination of "sign" and "verify"
  //   ).then((key) => window.crypto.subtle.exportKey(
  //     "jwk", //can be "jwk" or "raw"
  //     key //extractable must be true
  //   ));
  // } catch (err) {
  //   console.error(err);
  // }


  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(website);

  const algorithm = { name: 'HMAC', hash: 'SHA-256' };
  const signature = crypto.subtle.sign(algorithm, key, data);

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function stringToArrayBuffer(byteString) {
  var byteArray = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.codePointAt(i);
  }
  return byteArray;
}

function arrayBufferToString(buffer){
    var byteArray = new Uint8Array(buffer);
  var byteString = '';
  for (var i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCodePoint(byteArray[i]);
  }
  return byteString;
}

const sum = (arr) => arr.reduce((acc, curr) => acc + curr, 0);

const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function scrambleKeyFromMasterPasswordBasedOnWebsite(masterPassword, website) {
  let key = '';
  const charValues = Array.from(website).map(c => c.charCodeAt(0));
  const totalCharValue = sum(charValues);
  const passwordLen = masterPassword.length;
  let index = totalCharValue % passwordLen;
  let jumpAmount = sum(charValues.slice(4, 8));
  let thisSum = 0;
  for (let i = 0; i < 32; i++) {
    let [a, b, c] = [masterPassword.at(index), masterPassword.at(index - 1), masterPassword.at(index - 2)];
    thisSum += a.charCodeAt(0) + b.charCodeAt(0);
    key += charset[thisSum % charset.length];
    index = (index + jumpAmount) % passwordLen;
    jumpAmount += (c?.charCodeAt(0) || 0) % 3;
  }
  console.log('my key!', key);
  return key;
}

/**
 * Generate salt that is 32 characters long using random seed based on hashed master key
 * Recommended to be at least 16 characters long
 * @param {*} createHmacFunc 
 * @param {*} key 
 */
async function generateSalt(masterPassword, key) {
  // Set the seed for the random number generator
  debugger;
  console.log('before', key);
  key = await createHmac(key);
  console.log('after', key);
  console.assert(key.length);
  var rng = seedrandom(key);
  let salt = '';
  for (let i = 0; i < 32; i++) {
    salt += charset[Math.floor(rng() * charset.length)];
  }
  return salt;
}

/**
 * Main function used as the gateway to the library of babel location 
 * of the password string used
 * Username bases that I use:
 * chopinator
 * epicsam123
 * @param {*} masterPassword 
 * @param {*} length password length
 * @returns 
 */
async function generateUniquePassword(masterPassword, website, length = 25, iterations = 100000) {
  // Not running from a server so sync version is fine

  // Apply a key derivation function (e.g., HMAC-SHA256)

  // Implementing pbkdf2 with all its parameters
  // Use PBKDF2 to derive the password
  const key = scrambleKeyFromMasterPasswordBasedOnWebsite(masterPassword, website);
  const salt = await generateSalt(masterPassword, key);
  console.log('salt', salt);

  return 'ff'
  await PBKDF2(
    masterPassword,
    salt,
    iterations,
    length,
    'sha512')

    // .toString('ascii')
    /* 
    "ascii"
            | "utf8"
            | "utf-8"
            | "utf16le"
            | "utf-16le"
            | "ucs2"
            | "ucs-2"
            | "base64"
            | "base64url"
            | "latin1"
            | "binary"
            | "hex";
    */
    .slice(0, length)
    // .replace(/[+/=]/g, '')
    // .toLowerCase();
}

// function main() {
//   (async () => {
//     const masterPassword = 'what is the meaning of this'
//     const website = 'n.com'
//     console.log(await generateFromMasterPassword(masterPassword, website));
//   })();
// }

async function generateFromMasterPassword(masterPassword, website) {
  return await generateUniquePassword(masterPassword, website);
}

// main();