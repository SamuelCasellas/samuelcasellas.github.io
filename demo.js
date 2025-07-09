/**
 * DEMO ONLY
 */
function getRandomCharOrDigit() {
  // Define the pool of characters and digits

  // Generate a random index within the pool
  const randomIndex = Math.floor(Math.random() * charset.length);

  // Return the character or digit at the random index
  return charset[randomIndex];
}

function randInt(low, high) {
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function generateRandomSeed() {
  let seed = '';
  for (let i = 0; i < DEFAULT_HEXAGON_SEED_LENGTH; i++) {
    seed += getRandomCharOrDigit();
  }

  return seed;
}
