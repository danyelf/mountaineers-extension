import { contactFromEntry, updateParticipantList } from './fetchPartiicpantList';


function processRosterElement(rosterEntry: Element) {
  const name = contactFromEntry(rosterEntry);
  console.log('Processing ', name);
  const badge = document.createElement('p');
  badge.textContent = 'foo ${name}';
  rosterEntry.appendChild(badge);
}

// looks at this page for roster-contact
// and annotates it
function processAllContactsOnPage() {
  const rosterEntries = document.querySelectorAll('div.roster-contact');
  rosterEntries.forEach((rosterEntry) => {
    processRosterElement(rosterEntry);
  });
}

// does that also for the roster page
const rosterClickedCallBack = (
  mutationList: MutationRecord[],
  observer: MutationObserver
): void => {
  // maybe not robust -- assumes new contacts appear?
  for (const mutation of mutationList) {
    mutation.addedNodes.forEach((node) => {
      const ele = node as Element;
      if (ele.classList && ele.classList.contains('roster-contact')) {
        // NOT ROBUST -- HARD CODES ROSTER-CONTACT
        processRosterElement(ele);
      }
    });
  }
};


// send a "hello world" message to the background and wake it up
// we're in business!
(async () => {
  console.log("waking up background process!");
  const response = await chrome.runtime.sendMessage({greeting: "wakeup"});
  // do something with response here, not outside the function
  console.log(response);
})();


updateParticipantList();


// might want to make all this async after updateParticipantList gets called
// finds contacts on this page, even if we don't expand the roster
processAllContactsOnPage();

const allTabs = document.querySelector('div.tabs'); // NOT ROBUST -- hard codes tabs
if (allTabs) {
  // I don't know how to specify that we want just the tab with "data-tab="roster_tab"
  // but I think this is ok
  const observerConfig: MutationObserverInit = {
    childList: true,
    subtree: true,
  };
  const observer = new MutationObserver(rosterClickedCallBack);
  observer.observe(allTabs, observerConfig);
} else {
  console.log('Unable to find tabs');
}






function annotatePageWithReadingTime() {
  // this just confirms the document is being read
  const mountainArticle = document.querySelector('article');
  // `document.querySelector` may return null if the selector doesn't match anything.
  if (mountainArticle) {
    const article = mountainArticle;

    const text = article.textContent!;
    const wordMatchRegExp = /[^\s]+/g; // Regular expression
    const words = text.matchAll(wordMatchRegExp);
    // matchAll returns an iterator, convert to array to get word count
    const wordCount = [...words].length;
    const readingTime = Math.round(wordCount / 200);
    const badge = document.createElement('p');
    // Use the same styling as the publish information in an article's header
    badge.classList.add('color-secondary-text', 'type--caption');
    badge.textContent = `⏱️ ${readingTime} min read -- danyel was here`;

    // Support for API reference docs
    const heading = article.querySelector('h1');

    if (heading) {
      heading.insertAdjacentElement('afterend', badge);
    } else {
      console.log('no heading');
    }
  }
}

annotatePageWithReadingTime();
