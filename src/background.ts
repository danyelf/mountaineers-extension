console.log('hello, world from background!');


function actOnMessage(
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  console.log('got sent', request);
  if (request.greeting === 'wakeup') {    
    sendResponse({ farewell: 'ok, getting to work' });
  }
}

chrome.runtime.onMessage.addListener(actOnMessage);
