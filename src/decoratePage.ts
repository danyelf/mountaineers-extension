import { contactFromEntry } from './fetchPartiicpantList';
import { PeopleActivityMap, GlobalState } from './types';
import tippy from 'tippy.js';

// curries the peopleMNap so we can access it at runtime
export const rosterClickedCallBack =
  (globalState: GlobalState): MutationCallback =>
  (mutationList: MutationRecord[], observer: MutationObserver): void => {
    // maybe not robust -- assumes new contacts appear?
    for (const mutation of mutationList) {
      mutation.addedNodes.forEach((node) => {
        const ele = node as Element;
        if (ele.classList && ele.classList.contains('roster-contact')) {
          // NOT ROBUST -- HARD CODES ROSTER-CONTACT
          processRosterElement(ele, globalState);
        }
      });
    }
  };

// looks at this page for roster-contact
// and annotates it
export function decorateAllContactsOnPage(peoplemap: GlobalState) {
  const rosterEntries = document.querySelectorAll('div.roster-contact');
  rosterEntries.forEach((rosterEntry) => {
    processRosterElement(rosterEntry, peoplemap);
  });
}


export function decoratePersonPage(peopleMap: GlobalState) {
  if( ! peopleMap.peopleMap) {
    return;
  }

  let person: string | null ;
  if( document.URL.includes('/members/')) {
    person = document.URL.split('/').slice(-1)[0];
  } else {
    person = peopleMap.mostRecentlyClickedName;
  }

  if( ! person ) {
    console.log("No person; returning");
  }
  // find the email
  const profile = document.querySelector('.profile-details');
  const parent = profile?.parentNode;

  const activities = peopleMap.peopleMap.get( person! );
  if( activities ) {
    var div = document.createElement('div');
    div.classList.add('trips-in-common');
    var header = document.createElement('h6');
    header.textContent = "Your Trips in Common"
    div.appendChild(header);
    var list = document.createElement('ul');
    activities.forEach( act => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.innerText = act.start + " - " ;
      const ahref = document.createElement('a');
      ahref.href = act.href;
      ahref.innerText = act.title;
      li.appendChild( span );
      li.appendChild( ahref );
      list.appendChild(li);
    });
    div.appendChild(list);
    parent?.insertBefore( div, profile! );
  }

  // add activities statically blow it.
}


function processRosterElement(
  rosterEntry: Element,
  globalState: GlobalState
) {
  const name = contactFromEntry(rosterEntry);

  if (name === globalState.me) {
    return;
  }

  let badge: HTMLParagraphElement;
  const maybeBadge = rosterEntry.querySelector(
    `.mountaineers-annotation-participant.${name}`
  );
  if (maybeBadge) {
    // we have an existing badge
    badge = maybeBadge as HTMLParagraphElement;
  } else {
    // this is the first time we've looked at this
    badge = document.createElement('p');
    badge.classList.add('mountaineers-annotation-participant');
    if (name) {
      badge.classList.add(name);
    }
    rosterEntry.appendChild(badge);

    // we're also adding a callback here
    const profileLink = rosterEntry.querySelector('a');
    profileLink!.onclick =  e => { 
      globalState.mostRecentlyClickedName = name;
      console.log("set recently clicked name to ", name );

    };

  }

  if (globalState.peopleMap && name) {
    createHoverBadge(badge, name, globalState);
  } else {
    badge.textContent = 'checking trips in common';
  }
}

function createHoverBadge(
  badge: HTMLParagraphElement,
  name: string,
  globalState: GlobalState
) {
  const allTrips = globalState.peopleMap!.get(name!);
  if (allTrips) {
    badge.textContent = `${allTrips?.size} trips together`;

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    const trips = allTrips ? [...allTrips] : [];

    const contentString = trips
    .filter( f=> f.href != globalState.thisPage)
      .map(
        (s) =>
          `<span class="title">${s.title}</span><span class="startdate">${s.start}</span>`
      )
      .join('<br>');

    tippy(`.mountaineers-annotation-participant.${name}`, {
      content: contentString,
      allowHTML: true,
    });
  } else {
    badge.textContent = '-';
  }
}
