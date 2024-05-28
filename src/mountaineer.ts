import {
  decorateAllContactsOnPage,
  rosterClickedCallBack,
} from './decoratePage';
import { updateParticipantList } from './fetchPartiicpantList';
import { PeopleMapHolder } from './types';

// send a "hello world" message to the background and wake it up
// this doesn't actually do anything useful here
// keeping it in case we want to communicate with the popup -- perhaps to provide stats?
// (async () => {
//   console.log("waking up background process!");
//   const response = await chrome.runtime.sendMessage({greeting: "wakeup"});
//   // do something with response here, not outside the function
//   console.log(response);
// })();

const globalPeopleMap: PeopleMapHolder = { peopleMap: null };

// is user logged in?
const isUserLoggedIn = checkLogin();
if (!isUserLoggedIn) {
  console.log('User is not logged in; skipping from here.');
} else {
  // might want to make all this async after updateParticipantList gets called
  // finds contacts on this page, even if we don't expand the roster
  decorateAllContactsOnPage(globalPeopleMap);

  createRosterTabObserver(globalPeopleMap);

  updateParticipantList().then((peopleMap) => {
    if (peopleMap) {
      globalPeopleMap.peopleMap = peopleMap;
      decorateAllContactsOnPage(globalPeopleMap);
    } else {
      // user is not logged in
      console.log('User is not logged in; cannot retrieve activities.');
    }
  });
}

function checkLogin(): boolean {
  const userMenu = document.querySelector('li.user span');
  if (userMenu?.textContent?.includes('Log in / Join')) {
    return false;
  }
  return true;
}

// this is what react is for ;)
// if the user clicks on a tab, a bunch of more things may appear -- some of which might be people!
// we should annotate them
// future optimization: is it worth searching the mutations, or might it be quick enough to just do the whole page and call it?
function createRosterTabObserver(peopleMap: PeopleMapHolder) {
  const allTabs = document.querySelector('div.tabs'); // NOT ROBUST -- hard codes tabs
  if (allTabs) {
    // I don't know how to specify that we want just the tab with "data-tab="roster_tab"
    // but I think this is ok
    const observerConfig: MutationObserverInit = {
      childList: true,
      subtree: true,
    };
    const observer = new MutationObserver(rosterClickedCallBack(peopleMap));
    observer.observe(allTabs, observerConfig);
  } else {
    console.log('Unable to find tabs');
  }
}
