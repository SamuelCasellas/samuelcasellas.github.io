
function getStorage(key) {
  return JSON.parse(window.localStorage.getItem(key));
}

function setStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
