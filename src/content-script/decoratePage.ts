import tippy from 'tippy.js';
import { GlobalState } from './globalState';
import { activityStartDate } from '../shared/types';
import { contactFromEntry } from './fetchParticipantList';
import { getSortedFilteredActivityList } from './peopleList';

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
export function decorateAllContactsOnPage(globalState: GlobalState) {
  const rosterEntries = document.querySelectorAll('.roster-contact');
  let count = 0;
  rosterEntries.forEach((rosterEntry) => {
    count += processRosterElement(rosterEntry, globalState);
  });
  if (count > 0)
    window.goatcounter.count({
      path: 'decorate-event',
      event: true,
    });
}

export function decoratePersonPage(globalState: GlobalState) {
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

  const activities = getSortedFilteredActivityList(globalState, name!);

  if (activities.length > 0) {
    const htmlListItems = [...activities]
      .map(
        (act) =>
          `
      <li><span>${activityStartDate(act)} -</span> <a href="${act.href}">${
            act.title
          }</a></li>
      `
      )
      .join('\n');

    var div = document.querySelector('.trips-in-common');
    if (!div) {
      div = document.createElement('div');
      div.classList.add('trips-in-common');
      parent?.insertBefore(div, profile!);
    } else {
      console.log('updating existing div');
    }

    div.innerHTML = `
      <h6>Your Activities in Common</h6>
      <ul>
      ${htmlListItems}
      </ul>
    `;
  }

  window.goatcounter.count({
    path: 'personpage-annotated',
    event: true,
  });
}

// enables you to click on the entries in the poopup list
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

  let badge = rosterEntry.querySelector(
    `.mountaineers-annotation-participant.${name}`
  ) as HTMLParagraphElement | null;
  //  if (existingBadge) return 0;

  // confirm there's a  linkable versionthere
  const profileLink = rosterEntry.querySelector('a');
  if (!profileLink) return 0;

  if (!badge) {
    badge = document.createElement('p');
    badge.classList.add('mountaineers-annotation-participant');
    if (name) {
      badge.classList.add(name);
    }
    rosterEntry.appendChild(badge);

    // add a callback for the "most recently clicked" function
    profileLink!.onclick = globalState.badgeClickCallback!;
  }

  createUpdateHoverBadge(badge, name, globalState);
  return 1;
}

function createUpdateHoverBadge(
  badge: HTMLParagraphElement,
  name: string,
  globalState: GlobalState
) {
  const trips = getSortedFilteredActivityList(globalState, name!);
  console.log(trips.length);

  if (trips.length > 0) {
    badge.textContent = `${trips.length} activities together`;

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');

    const numTrips = trips.length;
    const slicedTrips = trips.slice(0, 5);

    let contentString = slicedTrips
      .map(
        (act) =>
          `
      <span>${activityStartDate(act)} -</span> <a href="${act.href}">${
            act.title
          }</a>
      `
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
