import {
  ActivityTypes,
  Frontend_Message,
  Frontend_Messages,
  IMessage,
  Popup_Messages,
  Popup_Response,
} from './types';

(document.querySelector('#clearLocalStorage') as HTMLButtonElement).onclick =
  clearLocalStorage;

try {
  chrome.runtime.onMessage.addListener(actOnMessage);
} catch (e) {
  setText(e as string);
  console.log(e);
}

// should probably ask the back-end for current status
chrome.runtime.sendMessage(
  { message: Popup_Messages.GET_STATUS },
  statusCallback
);

// createCheckboxes();

function statusCallback(response: any) {
  if (response) {
    console.log('Got response: ', response);
    gotMessage(response as IMessage);
  } else {
    console.log('last error: ' + chrome.runtime.lastError);
  }
}

async function actOnMessage(
  request: IMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: Popup_Response) => void
) {
  console.log('Got a message!', request);
  setText('got a message: ' + request.message);
  return gotMessage(request);
}

function gotMessage(request: IMessage) {
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
  console.log('clear local storage');

  chrome.runtime.sendMessage(
    { message: Popup_Messages.CLEAR_LOCAL_STORAGE },
    (response) => {
      console.log('response:', response);
    }
  );
}

function setText(s: string) {
  (document.querySelector('#textblock') as HTMLDivElement).innerText = s;
}

// checkboxes control which activities show
function createCheckboxes() {
  const container = document.getElementById('activity_selector');
  if (container) {
    const cbs = ActivityTypes.map((s) =>
      createCheckbox(s, container as HTMLDivElement)
    );
    // this is the sort of task that React is designed for
    cbs.forEach((box) => {
      box.onchange = () => checkboxMessageSend(cbs);
    });
  }
}

function checkboxMessageSend(cbs: HTMLInputElement[]) {
  const cbValues = cbs.map((cb) => {
    return {
      name: cb.name,
      checked: cb.checked,
    };
  });
  chrome.runtime.sendMessage({
    message: Popup_Messages.FIX_CHECKBOX,
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
