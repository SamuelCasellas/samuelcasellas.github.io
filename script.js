(async () => {
  // Override XMLHttpRequest
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    xhr.open = function(method, url) {
      console.warn('Blocked XHR request:', url);
      throw new Error('External requests disabled');
    };
    return xhr;
  };

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

  var masterPasswordField = document.getElementById('masterpassword');
  var websiteField = document.getElementById('website');
  var usernameField = document.getElementById('username')
  var generatedPasswordField = document.getElementById('generated-password');

  var generatePasswordButton = document.getElementById('generate-password');
  generatePasswordButton.addEventListener('click', generatePassword);

  var numTimesGenerated = 0;

  function isMasterPasswordAcceptable(password) {
    return password?.length >= 10;
  }

  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function generatePasswordImage(encryptedPassword) {
    const length = 200;
    var canvas = document.getElementById('myCanvas');

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

  var passwordTimeoutID;
  masterPasswordField.addEventListener('input', () => {
    if (typeof passwordTimeoutID === 'number') clearTimeout(passwordTimeoutID);
    passwordTimeoutID = setTimeout(() => {
      drawCanvas();
    }, 1000);
  });

  var showMasterPasswordButton = document.getElementById('toggle-master-password-visible');
  showMasterPasswordButton.addEventListener('click', () => {
    togglePasswordVisibilityAction(masterPasswordField, showMasterPasswordButton);
  });

  var showGeneratedPasswordButton = document.getElementById('toggle-generated-password-visible');
  showGeneratedPasswordButton.addEventListener('click', () => {
    togglePasswordVisibilityAction(generatedPasswordField, showGeneratedPasswordButton);
  });

  var regeneratePasswordButton = document.getElementById('regenerate-password');
  var copyButton = document.getElementById('copy-to-clipboard');
  var clearButton = document.getElementById('clear-password');
  var numTimesGeneratedField = document.getElementById('num-times-generated');
  hideAll(showGeneratedPasswordButton, regeneratePasswordButton, copyButton, numTimesGeneratedField);

  clearButton.addEventListener('click', () => {
    clearCanvas();
    numTimesGenerated = 0;
    clearAll(masterPasswordField, websiteField, usernameField, generatedPasswordField);
    hideAll(showGeneratedPasswordButton, regeneratePasswordButton, copyButton, numTimesGeneratedField);
  });

  regeneratePasswordButton.addEventListener('click', () => {
    generatePasswordInternal(generatedPasswordField.value);
  })

  async function generatePassword(event) {
    event.preventDefault();  // prevent form submission
    numTimesGenerated = 0;
    generatePasswordInternal(masterPasswordField.value);
  }

  function retrieveTruncatedWebsite(website) {
    const domainRegex = /^(net|info|org|com|edu|gov|co|me|io|app|fi|fr|tw)$/i;
    if (!website.trim().length) {
      alert('Please enter a website name.');
      return;
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
      return;
    }
    if (!isMasterPasswordAcceptable(masterpassword)) {
      alert('You master password is recommended to be at least 10 characters long.');
      return;
    }
    let website = retrieveTruncatedWebsite(websiteField.value || '');
    if (!website) {
      return;
    }
    let username = usernameField.value || '';
    generatedPasswordField.value = await PBKDF2(masterpassword, website + username);
    numTimesGeneratedField.textContent = numTimesGeneratedField.textContent.replace(/\d+/g, ++numTimesGenerated);
    showAll(showGeneratedPasswordButton, regeneratePasswordButton, copyButton, numTimesGeneratedField);
  }

  var timeoutID;
  copyButton.addEventListener('click', () => {
    // Use the Clipboard API to write the text to the clipboard
    navigator.clipboard.writeText(generatedPasswordField.value)
      .then(() => {
        if (typeof timeoutID === 'number') clearTimeout(timeoutID);
        copyButton.style.backgroundColor = 'lightgreen';
        copyButton.textContent = 'Copied!';
        timeoutID = setTimeout(() => {
          copyButton.textContent = 'Copy Password';
          copyButton.style.backgroundColor = '';
        }, 3000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  });

  function togglePasswordVisibilityAction(passwordField, passwordButton) {
    passwordField.getAttribute('type') === 'password'
      ? (passwordField.setAttribute('type', 'text'), passwordButton.textContent = 'Hide Password')
      : (passwordField.setAttribute('type', 'password'), passwordButton.textContent = 'Show Password');
  }
})();
