import {
  decorateAllContactsOnPage,
  decoratePersonPage,
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

const globalPeopleMap: PeopleMapHolder = {
  peopleMap: null,
  me: '',
  thisPage: document.URL,
  mostRecentlyClickedName: null,
};

// is user logged in?
const userName = checkLogin();
if (!userName) {
  console.log('User is not logged in; skipping from here.');
} else {
  globalPeopleMap.me = userName;

  // might want to make all this async after updateParticipantList gets called
  // finds contacts on this page, even if we don't expand the roster
  decorateAllContactsOnPage(globalPeopleMap);

  createRosterTabObserver(globalPeopleMap);
  createPopupAddedObserver(globalPeopleMap);

  updateParticipantList().then((peopleMap) => {
    if (peopleMap) {
      globalPeopleMap.peopleMap = peopleMap;
      decorateAllContactsOnPage(globalPeopleMap);
      decoratePersonPage(globalPeopleMap);
    } else {
      // user is not logged in
      console.log('User is not logged in; cannot retrieve activities.');
    }
  });
}

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

function createPopupAddedObserver(peopleMap: PeopleMapHolder) {
  const allBody = document.querySelector('body'); // NOT ROBUST -- hard codes tabs
  const observerConfig: MutationObserverInit = {
    childList: true, // when you add a child to the tree,
  };
  const observer = new MutationObserver(
    (mut: MutationRecord[], o: MutationObserver) => {
      // HERE is the problem
      // the popup doesn't give a username for who its popped up.
      // I could:
      //   - half ass it (search my list of people?)
      //   - add another field to my list of people?
      //   - instrument the fact that they clicked the name?
      //   maybe the name they clicked gives us enough?
      // ignore Tippy muts
      mut.forEach((r) => {
        r.addedNodes.forEach((n) => {
          const nEle = n as Element;
          // the lifecycle is that the poopup gets added here ..
          if (nEle.classList.contains('plone-modal-wrapper')) {
            // we now need to set a NEW observer to  watch for the wrapper to be made visible
            createPopupVisibleObserver(nEle, peopleMap);
          }
        });
        //    decoratePersonPage( peopleMap);
      });
    }
  );
  observer.observe(allBody!, observerConfig);
}

function createPopupVisibleObserver(nEle: Element, peopleMap: PeopleMapHolder) {
  // the wrapper should currently be set to display:none
  // we want to see it true

  const observerConfig: MutationObserverInit = {
    attributes: true,
    attributeFilter: ['style'], // visibility = true is the new style
  };

  const observer = new MutationObserver(
    (mut: MutationRecord[], o: MutationObserver) => {
      decoratePersonPage( peopleMap);
    });

  observer.observe( nEle, observerConfig );

}
