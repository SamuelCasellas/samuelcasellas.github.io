class ExternalThreatProtection {
  async verifyIsolation() {
    return (await Promise.all([
      this._checkNoExternalScripts(),
      this._checkNoExternalStyles(),
      this._checkNoExternalImages(),
      this._checkNoExternalConnections(),
      this._checkCSPEnforcement()
    ])).every(result => result === true);
  }
  
  _checkNoExternalScripts() {
    return !Array.from(document.querySelectorAll('script[src]'))
      .find(script => !script.src.startsWith(window.location.origin));
  }

  _checkNoExternalStyles() {
    return !Array.from(document.querySelectorAll('link[href]'))
      .find(style => !style.href.startsWith(window.location.origin));
  }

  _checkNoExternalImages() {
    return !Array.from(document.querySelectorAll('img[src]'))
      .find(img => !img.src.startsWith(window.location.origin));
  }
  
  _checkNoExternalConnections() {
    return ![
      /https?:\/\/[^\/]*\.(?!github\.io)[^\/]*/,
      /\/\/[^\/]*\.(?!github\.io)[^\/]*/
    ].find(pattern => pattern.test(document.documentElement.outerHTML))
  }

  async _checkCSPEnforcement() {
    const csp = document.head.querySelector('meta');

    if (!csp) {
      return false;
    }

    // Simple check: verify default-src is restricted to self or does not allow external sources
    // This is a basic heuristic and can be expanded as needed
    const defaultSrcMatch = csp.content.match(/default-src\s([^;]+)/);
    if (!defaultSrcMatch) {
      return false;
    }

    const defaultSrc = defaultSrcMatch[1];
    if (!defaultSrc.includes("'self'") && !defaultSrc.includes(window.location.origin)) {
      return false;
    }

    return true;
  }
}