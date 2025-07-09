// SIMPLE FUNCTIONS

const sum = (arr) => arr.reduce((acc, curr) => acc + curr, 0);

var seedrandom = require('seedrandom');

const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

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
    key += String.fromCharCode((thisSum % 125) + 33);
    index = (index + jumpAmount) % passwordLen;
    jumpAmount += c.charCodeAt(0) % 3;
  }
  console.log('my key!', key);
  return key;
}


/**
 * Return a portion of the 64 characters in length
 * @param {*} createHmacFunc 
 * @param {*} secret 
 * @returns 
 */
const createHash = (createHmacFunc, key) => createHmacFunc('sha256', key).digest('hex');

/**
 * Generate salt that is 32 characters long using random seed based on hashed master key
 * Recommended to be at least 16 characters long
 * @param {*} createHmacFunc 
 * @param {*} key 
 */
function generateSalt(createHmacFunc, key) {
  // Set the seed for the random number generator
  var rng = seedrandom(createHash(createHmacFunc, key));
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
  const { createHmac, pbkdf2Sync } = await import('node:crypto');

  // Apply a key derivation function (e.g., HMAC-SHA256)

  // Implementing pbkdf2 with all its parameters
  // Use PBKDF2 to derive the password
  const key = scrambleKeyFromMasterPasswordBasedOnWebsite(masterPassword, website);
  const salt = generateSalt(createHmac, key);
  console.log('salt', salt);

  return pbkdf2Sync(
    masterPassword,
    salt,
    iterations,
    length,
    'sha512')
    .toString('ascii')
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
    .replace(/[+/=]/g, '')
    .toLowerCase();
}

function main() {
  (async () => {
    const masterPassword = 'what is the meaning of this'
    const website = 'n.com'
    console.log(await generateFromMasterPassword(masterPassword, website));
  })();
}

async function generateFromMasterPassword(masterPassword, website) {
  return await generateUniquePassword(masterPassword, website);
}

main();
