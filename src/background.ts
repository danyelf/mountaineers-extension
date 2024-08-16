import {
  loadPeopleMapAndActivitiesFromLocalStorage,
  clearLocalStorage,
} from './storage';
import { Popup_Messages, Popup_Response } from './types';

let workingState = false;

console.log('hello, world from background!');

async function actOnMessage(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  console.log('got sent', request);

  switch (request.message) {
    case Popup_Messages.CLEAR_LOCAL_STORAGE: {
      const curStorage = await loadPeopleMapAndActivitiesFromLocalStorage();
      console.log(curStorage);

      await clearLocalStorage();
      sendResponse({ farewell: 'ok, should be cleared' });
    }

    case Popup_Messages.UPDATE_ICON: {
      console.log('update icon');
      if (!workingState) {
        showWorkingState();
      } else {
        showCompleteState();
      }

      workingState = !workingState;

      const response: Popup_Response = {
        workingState,
        message: 'working state',
      };

      sendResponse(response);
    }
  }
}

chrome.runtime.onMessage.addListener(actOnMessage);

// we can be  fancy!
// https://developer.chrome.com/docs/extensions/reference/api/action

function showCompleteState() {
  chrome.action.setBadgeText({
    text: '',
  });
}

function showWorkingState() {
  chrome.action.setBadgeText({
    text: '🕒',
  });
}
