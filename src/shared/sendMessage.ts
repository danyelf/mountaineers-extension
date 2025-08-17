// wrapper around chrome.runtime so that I can move off Chrome someday
import { logMessage } from '../lib/logMessaage';
import { Frontend_Messages, MessageBody, Popup_Messages } from './types';

export function sendMessage(
  message: Frontend_Messages | Popup_Messages,
  data?: MessageBody
): void {
  logMessage('Sending message wo callback:', message, JSON.stringify(data));
  chrome.runtime.sendMessage({
    message,
    ...data,
  });
}

export function sendMessageWithCallback(
  message: Frontend_Messages | Popup_Messages,
  callback: (response: any) => void,
  data?: MessageBody
): void {
  logMessage('Sending message w callback:', message, JSON.stringify(data));

  chrome.runtime.sendMessage(
    {
      message,
      ...data,
    },
    callback
  );
}

export function onMessage<T extends Frontend_Messages | Popup_Messages>(
  callback: (msgObj: { message: T; [key: string]: any }) => void
): void {
  logMessage('registering callback for onMessage:');
  chrome.runtime.onMessage.addListener((msgObj) => {
    logMessage('Received message:', msgObj);
    callback(msgObj);
  });
}

export function onMessageWithResponse(
  actOnMessage: (
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => void
) {
  logMessage('registering callback for OnMessageWResponse:');
  chrome.runtime.onMessage.addListener((msgObj, sender, responsecb) => {
    logMessage('Received message with response:', msgObj);
    actOnMessage(msgObj, sender, responsecb);
  });
}

export function getLastError(): any {
  return chrome.runtime.lastError ? chrome.runtime.lastError.message : null;
}
