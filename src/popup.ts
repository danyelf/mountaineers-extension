import { Popup_Messages, Popup_Response } from './types';

(document.querySelector('#clearLocalStorage') as HTMLButtonElement).onclick =
  clearLocalStorage;

(document.querySelector('#updateIcon') as HTMLButtonElement).onclick =
  updateIcon;

function clearLocalStorage() {
  console.log('clear local storage');

  chrome.runtime.sendMessage(
    { message: Popup_Messages.CLEAR_LOCAL_STORAGE },
    (response) => {
      console.log('response:', response);
    }
  );
}

function updateIcon() {
  console.log('update icon');

  chrome.runtime.sendMessage(
    { message: Popup_Messages.UPDATE_ICON },
    (response: Popup_Response) => {
      console.log('response:', response);
      (document.querySelector('#textblock') as HTMLDivElement).innerText =
        response.workingState + response.message;
    }
  );
}
