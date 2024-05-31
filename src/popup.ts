(document.querySelector('#clearLocalStorage') as HTMLButtonElement).onclick =
  clearLocalStorage;

function clearLocalStorage() {
  console.log('clear local storage');

  chrome.runtime.sendMessage({ message: 'clearLocalStroage' }, (response) => {
    console.log('response:', response);
  });
}
