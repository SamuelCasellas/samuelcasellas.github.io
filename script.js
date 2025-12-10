(async () => {
  // Override XMLHttpRequest
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    const xhr = new originalXHR();
    xhr.open = function (method, url) {
      console.warn('Blocked XHR request:', url);
      throw new Error('External requests disabled');
    };
    return xhr;
  };

  const gEBI = (id) => document.getElementById(id);

  if (!await new ExternalThreatProtection().verifyIsolation()) {
    // Block PWA functionality
    document.body.innerHTML = `
      <div style="color:red; font-weight:bold; padding: 2rem; text-align:center;">
        Security verification failed. The app cannot run. Please make sure chrome extensions are disabled for this page.
      </div>
    `;
    // Optionally disable service workers or other scripts here
    return; // Stop further execution
  }

  function clearAll(...params) {
    params.forEach(p => p.value = '');
  }

  function hideAll(...params) {
    params.forEach(p => p.style.display = 'none');
  }

  function showAll(...params) {
    params.forEach(p => p.style.display = 'inline');
  }

  const USERNAME_PREFERENCE = 'username-preference';
  const GENERATE_USERNAME_PREFERENCE = 'generate-username-preference';

  var passwordForm = gEBI('password-form');

  var masterPasswordField = gEBI('masterpassword');
  var websiteField = gEBI('website');
  var usernameField = gEBI('username')

  // var generateUsernameLabel = gEBI('generate-username-label');
  var generateUsernameCheckbox = gEBI('generate-username-action');  // always visible
  generateUsernameCheckbox.checked = JSON.parse(getStorage(GENERATE_USERNAME_PREFERENCE)) || false;

  var generatedUsernameLabel = gEBI('generated-username-label');
  var generatedUsernameField = gEBI('generated-username');

  var generatedPasswordLabel = gEBI('generated-password-label');
  var generatedPasswordField = gEBI('generated-password');

  const selectedUsernameOptionButton = gEBI('selected-username-option');

  const usernameOptions = ['a1b2c3', 'User123', 'words'];
  selectedUsernameOptionButton.innerText = getStorage(USERNAME_PREFERENCE) || usernameOptions[0];

  var regeneratePasswordButton = gEBI('regenerate-password');
  var passwordCopyButton = gEBI('copy-password-to-clipboard');
  var clearButton = gEBI('clear-password');

  var usernameCopyButton = gEBI('copy-username-to-clipboard');

  selectedUsernameOptionButton.addEventListener('click', async () => {
    const usernameOption = usernameOptions[(usernameOptions.indexOf(selectedUsernameOptionButton.innerText) + 1) % usernameOptions.length];
    selectedUsernameOptionButton.innerText = usernameOption;
    setStorage(USERNAME_PREFERENCE, usernameOption);

    generatedUsernameField.value = await generateUsername();
  });

  const randomWords = [
    'Apple',
    'Book',
    'Cat',
    'Dog',
    'Eat',
    'Fish',
    'Goat',
    'Hat',
    'Ice',
    'Jar',
    'Car',
    'Lamp',
    'Moon',
    'Nest',
    'Owl',
    'Pear',
    'Bench',
    'Rain',
    'Sun',
    'Tree',
    'Ball',
    'Chair',
    'Door',
    'Egg',
    'Flag',
    'Bear',
    'Yard',
    'Ink',
    'Jet',
    'Key',
    'Bike',
    'Ocean',
    'Fire',
    'Bird',
    'Banana',
    'Queen',
    'Shine',
    'Star',
    'Bowl',
    'Umbrella'
  ];

  generateUsernameCheckbox.addEventListener('click', async () => {
    setStorage(GENERATE_USERNAME_PREFERENCE, generateUsernameCheckbox.checked);
    if (generateUsernameCheckbox.checked) {
      const generatedUsername = await generateUsername();
      // This gen username element is always on screen, so the form may not be valid yet
      if (generatedUsername.length) {
        showAll(generatedUsernameLabel, generatedUsernameField, selectedUsernameOptionButton, usernameCopyButton);
        generatedUsernameField.value = generatedUsername;
      }
    } else {
      hideAll(generatedUsernameLabel, generatedUsernameField, selectedUsernameOptionButton, usernameCopyButton);
    }
  });

  async function generateUsername() {
    let generatedUsername = '';
    let website = retrieveTruncatedWebsite();
    if (website && isMasterPasswordAcceptable(masterPasswordField.value)) {
      const chars = await PBKDF2(
        await PBKDF2(masterPasswordField.value, website, 10000, true, 200),
        'USERNAME-GENERATION', 10000, true, 200
      );

      const numbers = '1234567890';
      switch (selectedUsernameOptionButton.innerText) {
        case 'a1b2c3':
          generatedUsername = chars.substr(0, 12).replaceAll('@', '1').replaceAll('#', '2').replaceAll('*', '3');
          break;

        case 'User123':
          generatedUsername = 'User';
          for (let i = 0; i < 8; i++) {
            generatedUsername += numbers[chars[i].charCodeAt(0) % numbers.length];
          }
          break;

        case 'words':
          for (let i = 0; i < 6; i++) {
            generatedUsername += i < 3
              ? randomWords[chars[i].charCodeAt(0) % randomWords.length]
              : numbers[chars[i].charCodeAt(0) % numbers.length];
          }
          break;

        default:
          console.error('Unknown username type: ' + selectedUsernameOptionButton.innerText);
          break;
      }
    }

    return generatedUsername;
  }


  var numTimesGenerated = 0;

  function isMasterPasswordAcceptable(password) {
    return password?.length >= 10;
  }

  const canvas = gEBI('myCanvas');
  const ctx = canvas.getContext('2d');

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function generatePasswordImage(encryptedPassword) {
    const length = 200;
    var canvas = gEBI('myCanvas');

    // Draw a blue sky
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the grass
    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height);

    // Draw the sun
    const xOffset = totalCharValue(encryptedPassword.slice(0, 2)) % length;
    const yOffset = totalCharValue(encryptedPassword.slice(4, 6)) % (length / 5);
    drawSun(xOffset, yOffset);

    // Draw mountains

    let i = 10;
    while (i < 100) {
      const thisCharCodeAmount = totalCharValue(encryptedPassword.slice(i, i + 2));
      if (i < 50) {
        if ((thisCharCodeAmount + i) % 5 === 0) {
          drawMountain(
            20 + thisCharCodeAmount % (length - 40),             // x
            thisCharCodeAmount % (length / 6) + (length / 3),    // y
            thisCharCodeAmount % 20 + 15,                        // width 
            thisCharCodeAmount % 30 + 30                         // height
          );
        }
      } else if ((thisCharCodeAmount + i) % 4 === 0) {
        drawTree(
          20 + thisCharCodeAmount % (length - 40),             // x
          thisCharCodeAmount % (length / 6) + (length / 1.5),  // y
        );
      }

      i += encryptedPassword[i - 1].charCodeAt(0) % 4 + 2;
    }


    // Function to draw the sun
    function drawSun(x, y) {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'yellow';
      ctx.fill();
      ctx.closePath();
    }

    // Function to draw a tree
    function drawTree(x, y) {
      // Trunk
      ctx.fillStyle = 'saddlebrown';
      ctx.fillRect(x, y, 5, 12);

      // Leaves
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 15, y);
      ctx.lineTo(x + 3, y - 20);
      ctx.fillStyle = 'forestgreen';
      ctx.fill();
      ctx.closePath();
    }

    // Function to draw a mountain
    function drawMountain(x, y, width, height) {
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.fillStyle = 'grey';
      ctx.fill();
      ctx.closePath();
    }
  }

  async function drawCanvas() {
    clearCanvas();
    if (isMasterPasswordAcceptable(masterPasswordField.value)) {
      generatePasswordImage(await PBKDF2(masterPasswordField.value, 'PASSWORD-IMAGE', 10000, true, 400));
    }
  }

  var typingPasswordTimeoutID;
  masterPasswordField.addEventListener('input', () => {
    if (typeof typingPasswordTimeoutID === 'number') clearTimeout(typingPasswordTimeoutID);
    typingPasswordTimeoutID = setTimeout(() => {
      drawCanvas();
    }, 1000);
  });

  var showMasterPasswordButton = gEBI('toggle-master-password-visible');
  showMasterPasswordButton.addEventListener('click', () => {
    togglePasswordVisibilityAction(masterPasswordField, showMasterPasswordButton);
  });

  var showGeneratedPasswordButton = gEBI('toggle-generated-password-visible');
  showGeneratedPasswordButton.addEventListener('click', () => {
    togglePasswordVisibilityAction(generatedPasswordField, showGeneratedPasswordButton);
  });

  function init() {
    hideAll(generatedPasswordLabel, generatedPasswordField,
      showGeneratedPasswordButton, regeneratePasswordButton, generatedUsernameLabel,
      generatedUsernameField, selectedUsernameOptionButton, passwordCopyButton, usernameCopyButton);
  }

  clearButton.addEventListener('click', async() => {
    // Don't clear something else the user may have copied to their clipboard
    if ([generatedPasswordField.value, generatedUsernameField.value].includes(await navigator.clipboard.readText())) {
      navigator.clipboard.writeText('').then(() => {
        console.log('Cleared the clipboard.')
      }).catch(err => {
        console.error('Failed to clear the clipboard: ' + err);
      });
    }

    clearCanvas();
    numTimesGenerated = 0;
    clearAll(masterPasswordField, websiteField, usernameField, generatedPasswordField, generatedUsernameField);
    hideAll(showGeneratedPasswordButton, regeneratePasswordButton,
      passwordCopyButton, usernameCopyButton, selectedUsernameOptionButton,
      generatedUsernameLabel, generatedUsernameField,
      generatedPasswordLabel, generatedPasswordField);
  });

  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();  // prevent form submission
    numTimesGenerated = 0;
    
    if ((await generatePasswordInternal(masterPasswordField.value))
         && generateUsernameCheckbox.checked) {
      showAll(generatedUsernameLabel, generatedUsernameField, selectedUsernameOptionButton, usernameCopyButton);
      generatedUsernameField.value = await generateUsername();
    }
  });

  regeneratePasswordButton.addEventListener('click', () => {
    generatePasswordInternal(generatedPasswordField.value);
  })

  function retrieveTruncatedWebsite() {
    let website = websiteField.value || '';
    const domainRegex = /^(net|info|org|com|edu|gov|co|me|io|app|fi|fr|de|tw)$/i;
    if (!website.trim().length) {
      alert('Please enter a website name.');
      return null;
    }
    let parts = website.split('.');
    const domain = parts.at(-1).split('/')[0];
    if (parts.length === 1 || !domainRegex.test(domain)) {
      alert('Please enter website with domain ending, like .com or .org.');
      return null;
    }

    // e.g. google.com.tw
    if (domainRegex.test(parts.at(-2))) {
      if (parts.length === 2) {
        debugger
        alert('Please enter a valid website. website.com and website.com.tw both work.')
        return null;
      }
      return `${parts.at(-3)}.${parts.at(-2)}.${domain}`.toLowerCase();
    } else {
      return `${parts.at(-2)}.${domain}`.toLowerCase();
    }
  }

  async function generatePasswordInternal(masterpassword) {
    if (!masterpassword) {
      alert('Please enter your master password.');
      return false;
    }
    if (!isMasterPasswordAcceptable(masterpassword)) {
      alert('You master password is recommended to be at least 10 characters long.');
      return false;
    }
    let website = retrieveTruncatedWebsite();
    if (!website) {
      return false;
    }
    let username = usernameField.value || '';
    generatedPasswordField.value = await PBKDF2(masterpassword, website + username);
    regeneratePasswordButton.textContent = regeneratePasswordButton.textContent.replace(/\d+/g, ++numTimesGenerated);
    showAll(generatedPasswordLabel, generatedPasswordField,
      showGeneratedPasswordButton, regeneratePasswordButton,
      passwordCopyButton);
    return true;
  }

  var usernameTimeoutID, passwordTimeoutID;

  function copyText(copyButton, textField, textName, timeoutID) {
    // Use the Clipboard API to write the text to the clipboard
    navigator.clipboard.writeText(textField.value)
      .then(() => {
        if (typeof timeoutID === 'number') clearTimeout(timeoutID);
        copyButton.style.backgroundColor = 'lightgreen';
        copyButton.textContent = 'Copied!';
        timeoutID = setTimeout(() => {
          copyButton.textContent = `Copy ${textName}`;
          copyButton.style.backgroundColor = '';
        }, 3000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }

  usernameCopyButton.addEventListener('click', () => copyText(usernameCopyButton, generatedUsernameField, 'Username', usernameTimeoutID));
  passwordCopyButton.addEventListener('click', () => copyText(passwordCopyButton, generatedPasswordField, 'Password', passwordTimeoutID));

  function togglePasswordVisibilityAction(passwordField, passwordButton) {
    passwordField.getAttribute('type') === 'password'
      ? (passwordField.setAttribute('type', 'text'), passwordButton.textContent = 'Hide Password')
      : (passwordField.setAttribute('type', 'password'), passwordButton.textContent = 'Show Password');
  }

  init();
})();
