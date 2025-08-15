// This contians functions that are fragile and may break with changes to the DOM structure of the page.

import { RawActivity, rawToActvitiy } from '../shared/types';
import { ActivityRoster } from './fetchParticipantList';

// checks for a hyperlink to the logged-in user's profile page
export const fragile_getLoggedInUser = (): string | null => {
  const loggedInUserA = document.querySelector(
    'li.user li a'
  ) as HTMLLinkElement;
  if (!loggedInUserA) {
    return null;
  }
  const ref = loggedInUserA.href;
  const usernameArr = ref.split('/');
  return usernameArr[usernameArr.length - 1];
};

export const fragile_getTabsSection = (): Element | null => {
  return document.querySelector('div.tabs');
};

export const fragile_isRosterElement = (ele: Element): boolean => {
  return ele.classList && ele.classList.contains('roster-contact');
};

export const fragile_getRosterContacts = (): NodeListOf<Element> => {
  return document.querySelectorAll('.roster-contact');
};

export const fragile_getMemberName = (): string | null => {
  if (document.URL.includes('/members/')) {
    return document.URL.split('/').slice(-1)[0];
  }
  return null;
};

// we are called with
// https://www.mountaineers.org/members/danyel-fisher/member-activities
// but the activites we care about are at
// https://www.mountaineers.org/members/danyel-fisher/member-activity-history.json
// update URL string: change from ..../member-activities to /member-activity-history.json
function getMemberActivityHistoryUrl(memberActivitiesUrl: string): string {
  // Use a regular expression to extract the member's name
  const regex = /\/members\/([^\/]+)\/member-activities$/;
  const match = memberActivitiesUrl.match(regex);

  if (match && match[1]) {
    const memberName = match[1];
    return `https://www.mountaineers.org/members/${memberName}/member-activity-history.json`;
  } else {
    // URL doesn't match the expected format, return null or handle the error
    throw 'Invalid member activities URL format:' + memberActivitiesUrl;
  }
}

export async function fragile_getActivities(me: string) {
  const activityUrl = `https://www.mountaineers.org/members/${me}/member-activities`;

  const correctedUrl = getMemberActivityHistoryUrl(activityUrl);
  const response = await fetch(correctedUrl);
  const rawactivities = (await response.json()) as RawActivity[]; // Get the HTML content as text
  const activities = rawactivities
    .filter((a) => a.status === 'Registered')
    .map((a) => rawToActvitiy(a));
  return activities;
}

export function fragile_contactFromEntry(rosterEntry: Element): string | null {
  try {
    const url = new URL(rosterEntry.querySelector('a')!.href);
    return url.pathname.split('/')[2]; // NOT ROBUST -- ASSUMES URL
  } catch (e) {
    try {
      const url = new URL(rosterEntry.querySelector('img')!.src);
      return url.pathname.split('/')[2]; // NOT ROBUST -- ASSUMES URL
    } catch (e2) {
      // they have neither a url nor an image
      return null;
    }
  }
}

export function fragile_badgeClickCallback(fn: (name: string | null) => void) {
  return (e: MouseEvent) => {
    const clickTarget = e.target! as Element;
    const rosterEntry = clickTarget.parentElement;
    const name = fragile_contactFromEntry(rosterEntry!);
    fn(name);
  };
}

// we get an activity, and return the list of people on it by adding /roster-tab to it
export async function fragile_getRosterForActivity(
  acthref: string
): Promise<ActivityRoster> {
  const activity_roster = acthref + '/roster-tab';

  const response = await fetch(activity_roster);
  const text = await response.text(); // Get the HTML content as text

  // Parse the HTML to find the links
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');

  const rosterEntries = doc.querySelectorAll('div.roster-contact');

  const roster: string[] = [];
  rosterEntries.forEach((rosterEntry) => {
    const name = fragile_contactFromEntry(rosterEntry);
    if (name) roster.push(name);
  });

  //  console.log(act.title, act.href, 'Found ', roster);
  return { acthref, roster };
}

export function fragile_addObserverForPagePopup(fn: () => void) {
  const allBody = document.querySelector('body'); // NOT ROBUST -- hard codes tabs
  const observerConfig: MutationObserverInit = {
    subtree: true,
    attributes: true,
    attributeFilter: ['style'], // visibility = true is the new style
  };
  const observer = new MutationObserver(
    (mut: MutationRecord[], o: MutationObserver) => {
      mut.forEach((m) => {
        const target = m.target as Element;
        if (target.classList.contains('plone-modal-dialog')) {
          fn();
          o.disconnect(); // stop observing after the first popup
        }
      });
    }
  );
  observer.observe(allBody!, observerConfig);
}
