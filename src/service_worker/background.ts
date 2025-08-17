// The BACKGROUND script is the service worker for the extension.
// It handles messages from the popup and content scripts, manages the state,
// and interacts with the browser's storage.

import {
  loadPeopleMapAndActivitiesFromLocalStorage,
  clearLocalStorage,
  loadCheckboxState,
  saveCheckboxState,
} from '../shared/storage';
import {
  CheckboxStateRecord,
  Frontend_Messages,
  IMessage,
  Popup_Messages,
} from '../shared/types';
import { logMessage } from '../lib/logMessaage';
import { onMessageWithResponse } from '../shared/sendMessage';

logMessage('background is alive');

let lastMessage: IMessage | null = null;
let checkboxState: CheckboxStateRecord[] = [];

loadCheckboxState().then((cbs) => {
  if (cbs) {
    checkboxState = cbs;
  }
});

onMessageWithResponse(actOnMessage);

async function actOnMessage(
  request: any,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  logMessage('got sent', request);

  switch (request.message) {
    case Popup_Messages.GET_STATUS: {
      logMessage('I was asked for status, I replied with', lastMessage);
      //  this one is more a question than a comment
      sendResponse(lastMessage || { message: Frontend_Messages.HELLO_WORLD });
      break;
    }

    case Popup_Messages.CLEAR_LOCAL_STORAGE: {
      lastMessage = request;
      const curStorage = await loadPeopleMapAndActivitiesFromLocalStorage();
      logMessage(curStorage);

      await clearLocalStorage();
      const response = {
        workingState: false,
        message: 'ok, should be cleared',
      } as IMessage;
      sendResponse(response);
      break;
    }

    case Frontend_Messages.NO_LOGGED_IN_USER: {
      lastMessage = request;
      showDeactivatedState();
      break;
    }

    // would be nice to also show how many people or activities or something
    case Frontend_Messages.GET_ACTIVITY_ROSTERS:
    case Frontend_Messages.GET_ACTIVITIES: {
      lastMessage = request;
      showWorkingState();
      break;
    }

    case Frontend_Messages.PEOPLE_STATUS: {
      lastMessage = request;
      showCompleteState();
      break;
    }

    case Popup_Messages.FIX_CHECKBOX: {
      checkboxState = request.checkboxes as CheckboxStateRecord[];
      saveCheckboxState(checkboxState);
    }

    case Frontend_Messages.QUERY_CHECKBOX: {
      sendResponse(checkboxState);
    }
  }
}

// we can be  fancy!
// https://developer.chrome.com/docs/extensions/reference/api/action

function showDeactivatedState() {
  chrome.action.setBadgeText({ text: ':(' });
}

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
