export function getStorage() {
    // Chrome-specific check
    if (typeof chrome !== "undefined" && chrome.storage) {
      return chrome.storage.local; // Use Chrome's storage
    } else if (typeof browser !== "undefined" && browser.storage) {
      return browser.storage.local; // Use standard browser storage
    }
  }
  