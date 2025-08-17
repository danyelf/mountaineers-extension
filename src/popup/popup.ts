import { logError, logMessage } from '../lib/logMessaage';
import {
  getLastError,
  onMessage,
  sendMessage,
  sendMessageWithCallback,
} from '../shared/sendMessage';
import {
  Activity_Types,
  CheckboxStateRecord,
  DEFAULT_CHECKBOXES,
  Frontend_Message,
  Frontend_Messages,
  IMessage,
  Popup_Messages,
  Popup_Response,
} from '../shared/types';

(document.querySelector('#clearLocalStorage') as HTMLButtonElement).onclick =
  clearLocalStorage;

try {
  onMessage(routeFrontendMessage);
} catch (e) {
  setText(e as string);
  logError(e);
}

// should probably ask the back-end for current status
sendMessageWithCallback(Popup_Messages.GET_STATUS, statusCallback);

// these control which sorts of activities get shown
// there are probably more I don't know about
createCheckboxes();

function statusCallback(response: any) {
  if (response) {
    logMessage('Got response: ', response);
    routeFrontendMessage(response as IMessage);
  } else {
    logError('last error: ' + getLastError());
  }
}

function routeFrontendMessage(request: IMessage) {
  logMessage('Got a message!', request);
  setText('got a message: ' + request.message);

  switch (request.message) {
    case Frontend_Messages.NO_LOGGED_IN_USER: {
      setText('User not logged in. Cannot read activities.');
      break;
    }

    // would be nice to also show how many people or activities or something
    case Frontend_Messages.GET_ACTIVITY_ROSTERS: {
      setText(
        'Reading rosters for ${request.numActivities} activities. This might take a while; please be patient.'
      );
      break;
    }

    case Frontend_Messages.GET_ACTIVITIES: {
      setText('Now reading activities');
      break;
    }

    case Frontend_Messages.PEOPLE_STATUS: {
      const r = request as Frontend_Message;
      setText(
        `${r.numActivities} activities; ${r.numPeople} people. Last checked ${r.lastActivityCheck}`
      );
      break;
    }
  }
  return true;
}

function clearLocalStorage() {
  logMessage('clear local storage');

  sendMessageWithCallback(Popup_Messages.CLEAR_LOCAL_STORAGE, (response) => {
    logMessage('response:', response);
  });
}

function setText(s: string) {
  (document.querySelector('#textblock') as HTMLDivElement).innerText = s;
}

type Activity_Record = {
  activity: Activity_Types;
  button: HTMLInputElement;
};

function checkboxCallback(response: any) {
  logMessage('got an answer to checkbox Q and its', response);
  if (response && response.length > 0) {
    checkboxState = new Map(
      (response as CheckboxStateRecord[]).map((kv) => [kv.name, kv.checked])
    );
  } else {
    checkboxState = DEFAULT_CHECKBOXES;
  }
  createCheckboxesWithState();
}

var checkboxState: Map<Activity_Types, boolean>;
// checkboxes control which activities show
function createCheckboxes() {
  sendMessageWithCallback(Frontend_Messages.QUERY_CHECKBOX, checkboxCallback);
}

// continuation from createCheckboxes
function createCheckboxesWithState() {
  const container = document.getElementById('activity_selector');
  if (container) {
    const cbs = Object.values(Activity_Types).map((s) => {
      return {
        activity: s,
        button: createCheckbox(s, container as HTMLDivElement),
      };
    });
    cbs.forEach((cbRecord) => {
      cbRecord.button.checked = checkboxState.get(cbRecord.activity)!;
      cbRecord.button.onchange = () => checkboxMessageSend(cbs);
    });
  }
}

// sends the state of all the checkboxes to the background
function checkboxMessageSend(cbs: Activity_Record[]) {
  const cbValues = cbs.map((cbRecord) => {
    return {
      name: cbRecord.activity,
      checked: cbRecord.button.checked,
    };
  });
  sendMessage(Popup_Messages.FIX_CHECKBOX, {
    checkboxes: cbValues,
  });
}

function createCheckbox(
  name: string,
  container: HTMLDivElement
): HTMLInputElement {
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'cb_' + name;
  checkbox.checked = true;
  checkbox.name = name;
  const textContent = document.createTextNode(name);

  label.appendChild(checkbox);
  label.appendChild(textContent);

  container.appendChild(label);
  return checkbox;
}
