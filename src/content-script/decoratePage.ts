import tippy from 'tippy.js';
import { GlobalState } from './globalState';
import { activityStartDate } from '../shared/types';
import { getSortedFilteredActivityList, getTrueCheckboxes } from './peopleList';
import { logError, logEvent, logMessage } from '../lib/logMessaage';
import {
  fragile_badgeClickCallback,
  fragile_contactFromEntry,
  fragile_getMemberName,
  fragile_getRosterContacts,
  fragile_isRosterElement,
} from './fragile';

const PAGE_LIMIT = 30;

// listens for changes to the tabs section
export const rosterClickedCallBack =
  (globalState: GlobalState): MutationCallback =>
  (mutationList: MutationRecord[], observer: MutationObserver): void => {
    // maybe not robust -- assumes new contacts appear?
    let count = 0;
    for (const mutation of mutationList) {
      mutation.addedNodes.forEach((node) => {
        const ele = node as Element;
        if (fragile_isRosterElement(ele)) {
          count += processRosterElement(ele, globalState);
        }
      });
      if (count > 0) {
        logEvent('decorate-roster');
      }
    }
  };

// looks at this page for roster-contact
// and annotates it
export function decorateAllContactsOnPage(globalState: GlobalState) {
  const rosterEntries = fragile_getRosterContacts();
  let count = 0;
  rosterEntries.forEach((rosterEntry) => {
    count += processRosterElement(rosterEntry, globalState);
  });
  if (count > 0) logEvent('decorate-event');
}

export function decoratePersonPage(globalState: GlobalState) {
  if (!globalState.peopleMap) {
    return;
  }

  // mostRecentlyClickedName happens when you hover a badge
  const person = fragile_getMemberName() || globalState.mostRecentlyClickedName;

  if (!person) {
    logError('No person found on page.');
    return;
  }

  // find profile section

  const activities = getSortedFilteredActivityList(globalState, person!);
  const numTrips = activities.length;

  // FRAGILE SECTION
  const profile = document.querySelector('.profile-details');
  const parent = profile?.parentNode;

  if (numTrips > 0) {
    const slicedTrips = activities.slice(0, PAGE_LIMIT);

    const htmlListItems = [...slicedTrips]
      .map(
        (act) =>
          `
      <li><span>${activityStartDate(act)} -</span> <a href="${act.href}">${
        act.title
      }</a></li>
      `
      )
      .join('\n');

    const otherString =
      numTrips - PAGE_LIMIT > 0
        ? `<span> and ${numTrips - PAGE_LIMIT} others</span>`
        : '';

    var div = document.querySelector('.trips-in-common');
    if (!div) {
      logMessage('new div');
      div = document.createElement('div');
      div.classList.add('trips-in-common');
      parent?.insertBefore(div, profile!);
    } else {
      logMessage('updating existing div');
    }

    div.innerHTML = `
      <h6 class="your-activities-in-common">Your Activities in Common</h6>
      <ul>
      ${htmlListItems}
      </ul>
      ${otherString}
    `;
  }

  const trueCheckboxes = getTrueCheckboxes(globalState);
  let contentString = `Showing most recent ${PAGE_LIMIT} activities.`;
  if (trueCheckboxes) {
    contentString = `Showing only the most recent ${trueCheckboxes.join(
      ', '
    )} activities`;
  }

  tippy('.your-activities-in-common', {
    content: contentString,
  });

  logEvent('personpage-annotated');
}

// enables you to click on the entries in the poopup list
export const badgeClickCallback = (globalState: GlobalState) => {
  return fragile_badgeClickCallback((name: string | null) => {
    globalState.mostRecentlyClickedName = name;
    logEvent('badge-clicked');
  });
};

// FRAGILE FUNCTION
// looks at the roster entry and adds a badge to it
// returns 1 if it added a badge, 0 otherwise
function processRosterElement(
  rosterEntry: Element,
  globalState: GlobalState
): number {
  const name = fragile_contactFromEntry(rosterEntry);

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

// FRAGILE FUNCTION
function createUpdateHoverBadge(
  badge: HTMLParagraphElement,
  name: string,
  globalState: GlobalState
) {
  const trips = getSortedFilteredActivityList(globalState, name!);

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
