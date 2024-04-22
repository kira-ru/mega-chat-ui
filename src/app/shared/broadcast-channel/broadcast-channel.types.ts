export interface BroadcastChannelEvent<T = unknown> {
  type: BroadcastChannelEventType;
  payload?: T;
}

export interface UserMessage {
  tabId: string | number;
  message: string;
}

export enum BroadcastChannelEventType {
  INIT = 'init',
  START_TYPING = 'start_typing_message',
  END_TYPING = 'end_typing_message',
  NEW_MESSAGE = 'new_message',
}
