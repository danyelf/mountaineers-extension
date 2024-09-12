window.goatcounter = {
  endpoint: 'https://bottle-fine-inward.goatcounter.com/count',
  no_onload: true,
  no_events: true,
};
import '../lib/count';
import { Frontend_Messages } from '../shared/types';

import {
  decorateAllContactsOnPage,
  decoratePersonPage,
  rosterClickedCallBack,
} from './decoratePage';
import { updateParticipantList } from './fetchParticipantList';
import { GlobalState } from './globalState';

const globalState: GlobalState = new GlobalState(document.URL);

// is user logged in?
const userName = checkLogin();
if (!userName) {
  console.log('User is not logged in; skipping from here.');
  chrome.runtime.sendMessage({
    message: Frontend_Messages.NO_LOGGED_IN_USER,
  });
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

  chrome.runtime.sendMessage({ message: Frontend_Messages.HELLO_WORLD });

  updateParticipantList(userName).then((peopleMap) => {
    if (peopleMap) {
      globalState.peopleMap = peopleMap;
      decorateAllContactsOnPage(globalState);
      decoratePersonPage(globalState);
    } else {
      // user is not logged in

      console.log('User is not logged in; cannot retrieve activities.');
    }
  });
}

chrome.runtime.onMessage.addListener((msgObj) => {
  console.log('I heard message ', msgObj);
});

// TODO: FRAGILE
// returns the username iflogged in, null if not
function checkLogin(): string | null {
  const userMenu = document.querySelector('li.user span');
  if (userMenu?.textContent?.includes('Log in / Join')) {
    return null;
  }
  const loggedInUserA = document.querySelector(
    'li.user li a'
  ) as HTMLLinkElement;
  const ref = loggedInUserA.href;
  const usernameArr = ref.split('/');
  return usernameArr[usernameArr.length - 1];
}

// if the user clicks on a tab, a bunch of more things may appear -- some of which might be people!
// we should annotate them
// future optimization: is it worth searching the mutations, or might it be quick enough to just do the whole page and call it?
function createRosterTabObserver(globalState: GlobalState) {
  const allTabs = document.querySelector('div.tabs'); // NOT ROBUST -- hard codes tabs
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
    console.log('this page does not have sections marked with div.tabs');
  }
}

/**  Manages the overlay sheet.
 * Looks for a plone-modal-dialog that has appeared; if so, we can fire off the decorate person code. */
function createPopupAddedObserver(globalState: GlobalState) {
  const allBody = document.querySelector('body'); // NOT ROBUST -- hard codes tabs
  const observerConfig: MutationObserverInit = {
    subtree: true,
    attributes: true,
    attributeFilter: ['style'], // visibility = true is the new style
  };
  const observer = new MutationObserver(
    (mut: MutationRecord[], o: MutationObserver) => {
      mut.forEach((m) => {
        const target = m.target as Element;
        if (target.classList.contains('plone-modal-dialog')) {
          // fires more than once, but not a big deal -- easy to skip out the second time
          decoratePersonPage(globalState);
        }
      });
    }
  );
  observer.observe(allBody!, observerConfig);
}
