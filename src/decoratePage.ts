import {  contactFromEntry } from './fetchPartiicpantList';
import { PeopleActivityMap, PeopleMapHolder } from './types';


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
export function decorateAllContactsOnPage( peoplemap: PeopleMapHolder) {
  const rosterEntries = document.querySelectorAll('div.roster-contact');
  rosterEntries.forEach((rosterEntry) => {
    processRosterElement(rosterEntry, peoplemap);
  });
}

function processRosterElement(
  rosterEntry: Element,
  peopleMapHolder: PeopleMapHolder
) {
  const name = contactFromEntry(rosterEntry);
  console.log('Decorating ', name);

  let badge: HTMLParagraphElement;
  const maybeBadge = rosterEntry.querySelector(
    `div.mountaineers-annotation-participant.${name}`
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
    createHoverBadge(badge, name, peopleMapHolder.peopleMap);
  } else {
    badge.textContent = 'checking trips in common';
  }
}

function createHoverBadge(
  badge: HTMLParagraphElement,
  name: string,
  peopleMap: PeopleActivityMap
) {
  const allTrips = peopleMap!.get(name!);
  if (allTrips) {
    badge.textContent = `${allTrips?.size} trips in commmon`;

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    const trips = allTrips ? [...allTrips] : [];
    tooltip.textContent = trips.map((s) => `${s.title}, ${s.start}`).join('\n');

    badge.appendChild(tooltip);
  } else {
    badge.textContent = 'no trips in common';
  }
}
