// SIMPLE FUNCTIONS

// import seedrandom from 'seedrandom';
// import crypto from 'crypto';

// const seedrandom = require('seedrandom')
// const crypto = require('crypto')

var seedrandom = require('seedrandom');

const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

const MAIN_DOMAIN = 'https://libraryofbabel.info';
const BOOK_PAGE_SUB_DOMAIN = '/book.cgi?';
const NUM_WALLS = 4;
const NUM_SHELVES = 5;
const NUM_VOLUMES = 32;
const NUM_PAGES = 410;

// const SEED_EXAMPLE = '2lz4tn06rv9axdug6kdbavpx7u9a710yn0r0i36cns2mxy82ra3cvq3o43je0ekiwkj1czpgisyu7zefk20csddtwwqwm0ha5qpyuh3ndgwoftj4b4wasxmmbgsde5r90pw5oqqsr48arpozfnai9nf75pre8nihev6rk4zw8njw29x34dcppetrbxe376hpmtmzqn0b0r70l777zj7y8yzyj0g2uw8dz1xig36sdkjexd05zi6pmgeb23hbeo2tzy9q5ip3i4n9g5t196y9vt9llboqgg0z8710lnti5rpubu546a3bg8w46zha5bfsoit60kptrzzr1gus0g8hsobo11fbs7b5jgjm5zl4n3wwvou5tdemzcv0e8qtkf1zddbgy8mxvy8524udyht7dddxpuigc248tw9ygn4hbip6tsppyabsmdph1khcaf9e9y0a4aty947gjan05zdtewbh0p5q1s5k0z6ntia3snbqitan9j54dk5wyt11ymfin36c2lxmua3n3oro48quev34qcyeuvpc7g0jp6klfcti4vlhs5t73uaxcmzgnb45mhd8a4vv1pbmq1irop9vc14x7a11nrt23cwer00i6wgecjsd6hqsg546679nh5qjb447xndmc3yom0pcmxmtiwmn215cqlyf71ng69xkkyh4ie4fu68zxb582p7hsid5tlqtd2q3ur8h278ax8ik3q5ujcabxgza9s57dtlmyt5q5i8km0jfvt5isytyd0k2qasfydwlf8z1bhr98bei7m4p4e83sjq1rdv13b54zwn2zkwv9avgp9qs3iozl0yof86k04todutgr3jozzr4y5d8pwtsjkvat3mq5ou52n7jykg90vr5so1g85l4nxcc70miv8b4jddzfbutllxcs1rvdh3mmi6ixwrc6l836bk91smkxn38us0ce1wzqki6t5y2oeuuejg9bxknq9l7xnf5dnb59tbuoea7531lsajqs0yu5qphuxybluy5ql9bjoqcvwph3ojnffbddo2jmpyo60ht3fbnjm5568mqdmoxi6xxmz9d4wwwbguafmozyl10yn90vax0k10gc6lplc7ygiynt0lerpaan99lgf6fy313n8w972jmv671j4yamvfgw95cd95xdgitmsq72ntwjjvdb897mnf8wz7dysldgtv8wbm4lkjkcblvhxobm5ckgm5ogc4mhd5scmpx5uixmswa9l729s6c05fue88g20xbeeeokpzr67ttt6x7q2dl4zbdl8z5y7wbexqiz7b1r06l8559uws6g31hx7m5tf50vmccyk2n7ivms8a02iz3e41l16mwgglm87hy7npm00h3ddn06c61gppkgezuh5d8rqt0whoog4h9hxebq8i9mu7k2sptxn0br4k43ncmfzfwxblyfwodnxxd7tfcdljxqc5074pp47rragdbpx97iuhgjrpcisol36bo6rzxzlc3kn1z480nauj7utlqi5tlmbcvnjd60nyqusxq2pvcdxmot2tszr0qb5np25c4bl6d9ke8of9sqqepmyvz2ajf3yuv4ys4ahbwpioj9ly4tm6jzex6vezbef35ec5hg3g1wi26mp6fvyngvu08gfzffrwgqo12g00kzasmysux0p8ss2xac6o07evltgue8zp0l36o2ab68g5xf0uus08hqyxglyukav2hg2kobeji6uidw1ig7gvmeoytcuzwmgtklft7t268vxgblyrdpah3a1vw3a6zu8wh5avglpfp5ocljlyrdsf2uvosjvacc1j7q4zj21anmuokv1aj6fpxaifo97ddoyhqokppkad0t4tveln86rgjkulhrlo8vllirll5xgvsd5b30oitw3yplptkqbhs4t1zrds2rcd9zxs1phl77ba63638a4c6ubn';

const DEFAULT_HEXAGON_SEED_LENGTH = 1948;

function createHash(createHmac, secret) {
  const hash = createHmac('sha256', secret).digest('hex');
  console.log(hash.length);
  return hash.slice(0, 32);
}

/**
 * Generate salt that is 32 characters long using random seed based on hashed master key
 * Recommended to be at least 16 characters long
 * @param {*} createHmac 
 * @param {*} masterPassword 
 */
function generateSalt(createHmac, masterPassword) {
  // Set the seed for the random number generator
  var rng = seedrandom(createHash(createHmac, masterPassword).substring(10, 25));
  let salt = '';
  for (let i = 0; i < 32; i++) {
    salt += charset[Math.floor(rng() * charset.length)];
  }
  return salt; 
}

/**
 * Main function used as the gateway to the library of babel location 
 * of the password string used
 * @param {*} masterPassword 
 * @param {*} length 
 * @returns 
 */
async function generateHexagonSlugFromMasterPassword(masterPassword, length = DEFAULT_HEXAGON_SEED_LENGTH, iterations = 100000) {
  const { createHmac, pbkdf2Sync } = await import('node:crypto');

  // Apply a key derivation function (e.g., HMAC-SHA256)

  // Implementing pbkdf2 with all its parameters
  // Use PBKDF2 to derive the password
  const salt = generateSalt(createHmac, masterPassword);
  const saltCharValues = Array.from(salt).map(c => c.charCodeAt(0))
  const wall = saltCharValues.slice(0, 4).reduce((acc, curr) => acc + curr, 0) % NUM_WALLS + 1;
  const shelf = saltCharValues.slice(4, 8).reduce((acc, curr) => acc + curr, 0) % NUM_SHELVES + 1;
  const volume = saltCharValues.reduce((acc, curr) => acc + curr, 0) % NUM_VOLUMES + 1;
  const textLoc = textLocation(wall, shelf, volume);
  
  const hexagonSlug = pbkdf2Sync(
      masterPassword,
      salt,
      iterations,
      length,
      'sha512')
    .toString('base64')
    .slice(0, length)
    .replace(/[+/=]/g, '')
    .toLowerCase();
  
  return hexagonSlug + textLoc;
}

/**
 * MAIN DEMO
 * @param {string} hexagonSeed 
 */
async function retrievePageContents(hexagonSlug) {
  const url = MAIN_DOMAIN + BOOK_PAGE_SUB_DOMAIN + hexagonSlug
  console.log(url, '\n');

  return fetch(url)
    .then(response => response.text())
    .then(text => text?.split('"textblock">')[1]?.split('</PRE>')[0]);
}

function main() {
  (async () => {
    const masterPassword = 'This is the password'
    console.log(await generateFromMasterPassword(masterPassword));
  })();
}

async function generateFromMasterPassword(masterPassword) {
  const slug = await generateHexagonSlugFromMasterPassword(masterPassword);
  return await retrievePageContents(slug);
}

function textLocation(wall, shelf, volume, page) {
  // ex. -w1-s1-v24:410
  page = page || 1;  // the selected page from the random operation is always 1
  return `-w${wall}-s${shelf}-v${volume}:${page}`;
}

// function randomCharNum() { return  }

// function decrypt(a, b, c) {}


main();


/* Functions for determining based on given username and service */



