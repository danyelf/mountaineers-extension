import { PeopleActivityMap, contactFromEntry, updateParticipantList } from './fetchPartiicpantList';


function processRosterElement(rosterEntry: Element, peopleMap: PeopleActivityMap | null) {
  const name = contactFromEntry(rosterEntry);
  console.log('Decorating ', name);

  let badge : HTMLParagraphElement;
  const maybeBadge = rosterEntry.querySelector(`div.mountaineers-annotation-participant.${name}`);
  if( maybeBadge ) {
    badge = maybeBadge as HTMLParagraphElement;
  } else {
    badge = document.createElement('p');
    badge.classList.add("mountaineers-annotation-participant");
    if( name)  { 
      badge.classList.add( name ); 
    }  
    rosterEntry.appendChild(badge);
  }

  if(peopleMap  && name ) {
      createHoverBadge( badge, name, peopleMap);
  } else {
    badge.textContent = 'checking trips in common';
  }
}
 

function createHoverBadge(badge: HTMLParagraphElement, name: string, peopleMap: PeopleActivityMap) {
  const allTrips = peopleMap!.get( name! );
  if ( allTrips ) {
    badge.textContent = `${allTrips?.size} trips in commmon`;

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    const trips = allTrips ? [... allTrips] : [];
    tooltip.textContent =  trips.map( s => `${s.title}, ${s.start}`).join('\n');
  
    badge.appendChild(tooltip);

  } else {
    badge.textContent = "no trips in common";
  }



}


// looks at this page for roster-contact
// and annotates it
function processAllContactsOnPage( peoplemap: PeopleActivityMap | null) {
  const rosterEntries = document.querySelectorAll('div.roster-contact');
  rosterEntries.forEach((rosterEntry) => {
    processRosterElement(rosterEntry, peoplemap);
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
        processRosterElement(ele, globalPeopleMap);
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


let globalPeopleMap : PeopleActivityMap | null 

updateParticipantList().then( peopleMap => {
  globalPeopleMap = peopleMap;
  processAllContactsOnPage( peopleMap);
})


// might want to make all this async after updateParticipantList gets called
// finds contacts on this page, even if we don't expand the roster
processAllContactsOnPage( null );

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

