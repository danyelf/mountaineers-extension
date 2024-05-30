import { contactFromEntry } from './fetchParticipantList';
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
          processRosterElement(ele, globalState);
        }
      });
    }
  };

// looks at this page for roster-contact
// and annotates it
export function decorateAllContactsOnPage(peoplemap: GlobalState) {
  const rosterEntries = document.querySelectorAll('.roster-contact');
  rosterEntries.forEach((rosterEntry) => {
    processRosterElement(rosterEntry, peoplemap);
  });
}

export function decoratePersonPage(globalState: GlobalState) {
  const existingAnnotation = document.querySelector('.trips-in-common');
  if (existingAnnotation) return;

  if (!globalState.peopleMap) {
    return;
  }

  let person: string | null;
  if (document.URL.includes('/members/')) {
    person = document.URL.split('/').slice(-1)[0];
  } else {
    person = globalState.mostRecentlyClickedName;
  }

  if (!person) return;

  // find the email
  const profile = document.querySelector('.profile-details');
  const parent = profile?.parentNode;

  const activities = globalState.peopleMap.get(person!);
  if (activities) {
    const htmlListItems = [...activities]
      .map(
        (act) =>
          `
      <li><span>${act.start} -</span> <a href="${act.href}">${act.title}</a></li>
      `
      )
      .join('\n');

    var div = document.createElement('div');
    div.classList.add('trips-in-common');

    div.innerHTML = `
      <h6>Your Trips in Common</h6>
      <ul> 
      ${htmlListItems}
      </ul>
    `;

    parent?.insertBefore(div, profile!);
  }

  // add activities statically blow it.
}

export const badgeClickCallback = (globalState: GlobalState) => {
  return (e: MouseEvent) => {
    const clickTarget = e.target! as Element;
    const rosterEntry = clickTarget.parentElement;
    const name = contactFromEntry(rosterEntry!);
    globalState.mostRecentlyClickedName = name!;
    console.log(name);
  };
};

function processRosterElement(rosterEntry: Element, globalState: GlobalState) {
  const name = contactFromEntry(rosterEntry);

  if (!globalState.peopleMap || !name || name === globalState.me) {
    return;
  }

  let badge: HTMLParagraphElement;
  const existingBadge = rosterEntry.querySelector(
    `.mountaineers-annotation-participant.${name}`
  );
  if (existingBadge) return;

  badge = document.createElement('p');
  badge.classList.add('mountaineers-annotation-participant');
  if (name) {
    badge.classList.add(name);
  }
  rosterEntry.appendChild(badge);

  // add a callback for the "most recently clicked" function
  const profileLink = rosterEntry.querySelector('a');
  profileLink!.onclick = globalState.badgeClickCallback!;

  createHoverBadge(badge, name, globalState);
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
      .filter((f) => f.href != globalState.thisPage)
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
