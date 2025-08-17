window.goatcounter = {
  endpoint: 'https://bottle-fine-inward.goatcounter.com/count',
  no_onload: true,
  no_events: true,
};
import '../lib/count';
import { logMessage } from '../lib/logMessaage';
import {
  onMessage,
  sendMessage,
  sendMessageWithCallback,
} from '../shared/sendMessage';
import { Frontend_Messages } from '../shared/types';

import {
  decorateAllContactsOnPage,
  decoratePersonPage,
  rosterClickedCallBack,
} from './decoratePage';
import { updateParticipantList } from './fetchParticipantList';
import {
  fragile_getTabsSection,
  fragile_getLoggedInUser,
  fragile_addObserverForPagePopup,
} from './fragile';
import { GlobalState } from './globalState';

const globalState: GlobalState = new GlobalState(document.URL);

// is user logged in?
const userName = checkLogin();
if (!userName) {
  logMessage('User is not logged in; skipping from here.');
  sendMessage(Frontend_Messages.NO_LOGGED_IN_USER);
} else {
  globalState.me = userName;

  window.goatcounter.count({
    path: 'extension-initialized',
    event: true,
  });

  // might want to make all this async after updateParticipantList gets called
  // finds contacts on this page, even if we don't expand the roster
  createRosterTabObserver(globalState);
  createPopupAddedObserver(globalState);

  sendMessage(Frontend_Messages.HELLO_WORLD);

  updateParticipantList(userName).then((peopleMap) => {
    if (peopleMap) {
      globalState.peopleMap = peopleMap;
      queryCheckboxState(globalState);
      redecorate(globalState);
    } else {
      // user is not logged in

      logMessage('User is not logged in; cannot retrieve activities.');
    }
  });
}

onMessage((msgObj) => {
  logMessage('I heard message ', msgObj);
});

// asks the back end for the checkbox state
// and then updates the global state and redecorates the page
function queryCheckboxState(globalState: GlobalState) {
  logMessage('asked for checkbox state');
  sendMessageWithCallback(Frontend_Messages.QUERY_CHECKBOX, (response: any) => {
    logMessage('got an answer and its', response);
    globalState.checkboxState = response;
    redecorate(globalState);
  });
}

function checkLogin(): string | null {
  return fragile_getLoggedInUser();
}

// if the user clicks on a tab, a bunch of more things may appear -- some of which might be people!
// we should annotate them
// future optimization: is it worth searching the mutations, or might it be quick enough to just do the whole page and call it?
function createRosterTabObserver(globalState: GlobalState) {
  const allTabs = fragile_getTabsSection();
  if (allTabs) {
    // I don't know how to specify that we want just the tab with "data-tab="roster_tab"
    // but I think this is ok
    const observerConfig: MutationObserverInit = {
      childList: true,
      subtree: true,
    };
    const observer = new MutationObserver(rosterClickedCallBack(globalState));
    observer.observe(allTabs, observerConfig);
  } else {
    logMessage('this page does not have sections marked with div.tabs');
  }
}

/**  Manages the overlay sheet.
 * Looks for a plone-modal-dialog that has appeared; if so, we can fire off the decorate person code. */
function createPopupAddedObserver(globalState: GlobalState) {
  fragile_addObserverForPagePopup(() => decoratePersonPage(globalState));
}

function redecorate(globalState: GlobalState) {
  decorateAllContactsOnPage(globalState);
  decoratePersonPage(globalState);
}
