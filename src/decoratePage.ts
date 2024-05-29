import { contactFromEntry } from './fetchPartiicpantList';
import { PeopleActivityMap, PeopleMapHolder } from './types';
import tippy from 'tippy.js';

// curries the peopleMNap so we can access it at runtime
export const rosterClickedCallBack =
  (peopleMapHolder: PeopleMapHolder): MutationCallback =>
  (mutationList: MutationRecord[], observer: MutationObserver): void => {
    // maybe not robust -- assumes new contacts appear?
    for (const mutation of mutationList) {
      mutation.addedNodes.forEach((node) => {
        const ele = node as Element;
        if (ele.classList && ele.classList.contains('roster-contact')) {
          // NOT ROBUST -- HARD CODES ROSTER-CONTACT
          processRosterElement(ele, peopleMapHolder);
        }
      });
    }
  };

// looks at this page for roster-contact
// and annotates it
export function decorateAllContactsOnPage(peoplemap: PeopleMapHolder) {
  const rosterEntries = document.querySelectorAll('div.roster-contact');
  rosterEntries.forEach((rosterEntry) => {
    processRosterElement(rosterEntry, peoplemap);
  });
}


export function decoratePersonPage(peopleMap: PeopleMapHolder) {
  if( ! peopleMap.peopleMap) {
    return;
  }

  const person = document.URL.split('/').slice(-1)[0];
  // find the email
  const profile = document.querySelector('.profile-details');
  const parent = profile?.parentNode;

  const activities = peopleMap.peopleMap.get( person );
  if( activities ) {
    var div = document.createElement('div');
    div.classList.add('trips-in-common');
    var header = document.createElement('h6');
    header.textContent = "Your Trips in Common"
    div.appendChild(header);
    var list = document.createElement('ul');
    activities.forEach( act => {
      const li = document.createElement('li');
      const ahref = document.createElement('a');
      ahref.href = act.href;
      ahref.innerText = act.title;
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
  peopleMapHolder: PeopleMapHolder
) {
  const name = contactFromEntry(rosterEntry);

  if (name === peopleMapHolder.me) {
    return;
  }

  let badge: HTMLParagraphElement;
  const maybeBadge = rosterEntry.querySelector(
    `.mountaineers-annotation-participant.${name}`
  );
  if (maybeBadge) {
    badge = maybeBadge as HTMLParagraphElement;
  } else {
    badge = document.createElement('p');
    badge.classList.add('mountaineers-annotation-participant');
    if (name) {
      badge.classList.add(name);
    }
    rosterEntry.appendChild(badge);
  }

  if (peopleMapHolder.peopleMap && name) {
    createHoverBadge(badge, name, peopleMapHolder);
  } else {
    badge.textContent = 'checking trips in common';
  }
}

function createHoverBadge(
  badge: HTMLParagraphElement,
  name: string,
  peopleMapHolder: PeopleMapHolder
) {
  const allTrips = peopleMapHolder.peopleMap!.get(name!);
  if (allTrips) {
    badge.textContent = `${allTrips?.size} trips together`;

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    const trips = allTrips ? [...allTrips] : [];

    const contentString = trips
    .filter( f=> f.href != peopleMapHolder.thisPage)
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
