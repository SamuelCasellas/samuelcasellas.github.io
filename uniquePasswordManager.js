// SIMPLE FUNCTIONS

var seedrandom = require('seedrandom');

const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomizeKeyFromMasterPasswordBasedOnWebsite(masterPassword, website) {
  
}


function createHash(createHmac, secret) {
  const hash = createHmac('sha256', secret).digest('hex');
  return hash.slice(17, 49);
}

/**
 * Generate salt that is 32 characters long using random seed based on hashed master key
 * Recommended to be at least 16 characters long
 * @param {*} createHmac 
 * @param {*} masterPassword 
 */
function generateSalt(createHmac, masterPassword) {
  // Set the seed for the random number generator
  var rng = seedrandom(createHash(createHmac, masterPassword.substring(6)).substring(10, 25));
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
async function generateUniquePassword(masterPassword, website, length = 16, iterations = 100000) {
  const { createHmac, pbkdf2Sync } = await import('node:crypto');

  // Apply a key derivation function (e.g., HMAC-SHA256)

  // Implementing pbkdf2 with all its parameters
  // Use PBKDF2 to derive the password
  const salt = generateSalt(createHmac, website);
  console.log(salt);

  return pbkdf2Sync(
    masterPassword,
    salt,
    iterations,
    length,
    'sha512')
    .toString('hex')
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
    const masterPassword = 'Pancreatic cancer'
    const website = 'twitter'
    console.log(await generateFromMasterPassword(masterPassword, website));
  })();
}

async function generateFromMasterPassword(masterPassword, website) {
  await generateUniquePassword(masterPassword, website);
}

main();
