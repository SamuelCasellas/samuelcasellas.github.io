const requiredCharSet = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '0123456789', '@#*'];
const alphabetChars = requiredCharSet[0].concat(requiredCharSet[1]);
const passwordIsAcceptable = (password) => !requiredCharSet.find(chars => !new Set([...chars].filter(c => password.indexOf(c) !== -1)).size);


function locateAcceptablePasswordFromChars(chars, passwordLength=12) {
  let startI = 0;
  let endI = passwordLength;
  const charsLength = chars.length;
  while (charsLength >= endI) {
    let password = chars.slice(startI, endI);
    if (passwordIsAcceptable(password)) {
      // To randomize the placement of the two special chars (the least common)
      // we will shift based on the first character, if shifted out of view
      if (startI > 0) {        
        let shift = chars[0].charCodeAt(0) % passwordLength;
        shift = (endI + shift) > charsLength ? charsLength - endI : shift
        startI += shift;
        endI += shift;
        password = chars.slice(startI, endI);
        if (passwordIsAcceptable(password)) {
          return password;
        }
        // Very rare, but we could have shifted out of position of a A-Z, a-z, or 0-9
        // pass
      } else {
        return password;
      }
    } else {
      startI++;
      endI++;
    }
  }
  return null;
}

async function PBKDF2(masterPassword, salt, iterations=100000/*OWASP recommended minimum*/, returnAll=false, numChars=200) {
  const encoder = new TextEncoder();
  // Convert to Base64 string
  const chars = btoa(String.fromCharCode(...(new Uint8Array(await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations, 
      hash: 'SHA-512'
    },
    await crypto.subtle.importKey(
      'raw',
      encoder.encode(masterPassword),
      'PBKDF2',
      false,
      ['deriveBits']
    ),
    numChars * 8
  ))))).replace(/\+/g, '#').replace(/\//g, '@').replace(/=/g, '*');

  return returnAll
    ? chars
    : locateAcceptablePasswordFromChars(chars) ||
      await PBKDF2(masterPassword, salt, iterations + totalCharValue(masterPassword) % 10)
}

const totalCharValue = (str) => Array.from(str).map(c => c.charCodeAt(0)).reduce((acc, curr) => acc + curr, 0);
 