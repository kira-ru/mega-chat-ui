export interface BroadcastChannelEvent {
  type: BroadcastChannelEventType,
  userId: string,
}

export interface MessageEvent extends BroadcastChannelEvent {
  payload: Record<string, unknown> | string | number,
}

export enum BroadcastChannelEventType {
  INIT='init',
  START_TYPING='start_typing_message',
  END_TYPING='end_typing_message',
  NEW_MESSAGE='new_message',
}
