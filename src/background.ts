import {
  loadPeopleMapAndActivitiesFromLocalStorage,
  clearLocalStorage,
} from './storage';

console.log('hello, world from background!');

async function actOnMessage(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  console.log('got sent', request);
  if (request.message === 'clearLocalStroage') {
    const curStorage = await loadPeopleMapAndActivitiesFromLocalStorage();
    console.log(curStorage);

    await clearLocalStorage();
    sendResponse({ farewell: 'ok, should be done' });
  }
}

chrome.runtime.onMessage.addListener(actOnMessage);
