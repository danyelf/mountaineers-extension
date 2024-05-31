import { contactFromEntry } from './fetchParticipantList';
import { GlobalState, start } from './types';
import tippy from 'tippy.js';

// curries the peopleMap so we can access it at runtime
export const rosterClickedCallBack =
  (globalState: GlobalState): MutationCallback =>
  (mutationList: MutationRecord[], observer: MutationObserver): void => {
    // maybe not robust -- assumes new contacts appear?
    let count = 0;
    for (const mutation of mutationList) {
      mutation.addedNodes.forEach((node) => {
        const ele = node as Element;
        if (ele.classList && ele.classList.contains('roster-contact')) {
          count += processRosterElement(ele, globalState);
        }
      });
      if (count > 0)
        window.goatcounter.count({
          path: 'decorate-roster',
          event: true,
        });
    }
  };

// looks at this page for roster-contact
// and annotates it
export function decorateAllContactsOnPage(peoplemap: GlobalState) {
  const rosterEntries = document.querySelectorAll('.roster-contact');
  let count = 0;
  rosterEntries.forEach((rosterEntry) => {
    count += processRosterElement(rosterEntry, peoplemap);
  });
  if (count > 0)
    window.goatcounter.count({
      path: 'decorate-event',
      event: true,
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
      <li><span>${start(act)} -</span> <a href="${act.href}">${
            act.title
          }</a></li>
      `
      )
      .join('\n');

    var div = document.createElement('div');
    div.classList.add('trips-in-common');

    div.innerHTML = `
      <h6>Your Activities in Common</h6>
      <ul> 
      ${htmlListItems}
      </ul>
    `;

    parent?.insertBefore(div, profile!);
  }

  window.goatcounter.count({
    path: 'personpage-annotated',
    event: true,
  });
}

export const badgeClickCallback = (globalState: GlobalState) => {
  return (e: MouseEvent) => {
    const clickTarget = e.target! as Element;
    const rosterEntry = clickTarget.parentElement;
    const name = contactFromEntry(rosterEntry!);
    globalState.mostRecentlyClickedName = name!;
  };
};

function processRosterElement(
  rosterEntry: Element,
  globalState: GlobalState
): number {
  const name = contactFromEntry(rosterEntry);

  if (!globalState.peopleMap || !name || name === globalState.me) {
    return 0;
  }

  let badge: HTMLParagraphElement;
  const existingBadge = rosterEntry.querySelector(
    `.mountaineers-annotation-participant.${name}`
  );
  if (existingBadge) return 0;

  // confirm there's a  linkable versionthere
  const profileLink = rosterEntry.querySelector('a');
  if (!profileLink) return 0;

  badge = document.createElement('p');
  badge.classList.add('mountaineers-annotation-participant');
  if (name) {
    badge.classList.add(name);
  }
  rosterEntry.appendChild(badge);

  // add a callback for the "most recently clicked" function
  profileLink!.onclick = globalState.badgeClickCallback!;

  createHoverBadge(badge, name, globalState);
  return 1;
}

function createHoverBadge(
  badge: HTMLParagraphElement,
  name: string,
  globalState: GlobalState
) {
  const allTrips = globalState.peopleMap!.get(name!);
  if (allTrips) {
    badge.textContent = `${allTrips?.size} activities together`;

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    const trips = allTrips ? [...allTrips] : [];
    trips.sort((a, b) => a.time - b.time);

    const numTrips = trips.length;
    const slicedTrips = trips.slice(0, 5);

    let contentString = slicedTrips
      .map(
        (s) =>
          `<span class="startdate">${start(s)}</span> - <span class="title">${
            s.title
          }</span>`
      )
      .join('<br/>');
    if (numTrips > 5) {
      contentString += `<br/><span> and ${numTrips - 5} others</span>`;
    }

    tippy(`.mountaineers-annotation-participant.${name}`, {
      content: contentString,
      allowHTML: true,
      maxWidth: 400,
      interactive: true,
    });
  } else {
    badge.textContent = '.';
  }
}
