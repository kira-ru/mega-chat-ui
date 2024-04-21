import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { BroadcastChannelEvent, BroadcastChannelEventType } from '@shared/broadcast-channel/broadcast-channel.types';
import { runInZone } from '@shared/operators/run-in-zone.operator';

@Injectable({
  providedIn: 'root',
})
export class BroadcastChannelService implements OnDestroy {
  public messageStream$ = new Subject<BroadcastChannelEvent>();

  private _broadCastChannel = new BroadcastChannel('message-chat');

  constructor(private ngZone: NgZone) {
    this._broadCastChannel.onmessage = (event) => {
      this.messageStream$.next(event.data);
    };
  }

  ngOnDestroy(): void {
    this._broadCastChannel.close();
  }

  public postMessage<T>(message: BroadcastChannelEvent<T>): void {
    this._broadCastChannel.postMessage(message);
  }

  public messagesByType(type: BroadcastChannelEventType): Observable<BroadcastChannelEvent> {
    return this.messageStream$.pipe(
      runInZone(this.ngZone),
      filter((message) => message.type === type)
    );
  }
}
