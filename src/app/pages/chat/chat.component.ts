import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from '@shared/dialog/dialog.component';
import { LayoutComponent } from '@pages/layout/layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PanelComponent } from '@shared/panel/panel.component';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BroadcastChannelEventType, UserMessage } from '@shared/services/broadcast-channel/broadcast-channel.types';
import { debounceTime, filter, map, merge, Observable, startWith, Subject, takeUntil, tap, throttleTime } from 'rxjs';
import { BroadcastChannelService } from '@shared/services/broadcast-channel/broadcast-channel.service';
import { Storage } from '@shared/services/storage.service';
import { TAB_NUMBER } from '@app/config/providers/tab.provider';
import { ProfileComponent } from '@shared/profile/profile.component';
import { MessageForm } from '@pages/chat/chat.types';

@Component({
  selector: 'chat',
  standalone: true,
  imports: [
    CommonModule,
    DialogComponent,
    LayoutComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PanelComponent,
    ReactiveFormsModule,
    ProfileComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnDestroy {
  public form: MessageForm = this.formBuilder.group({
    message: ['', { validators: [Validators.required] }],
  });

  public typingTabsIds: number[] = [];

  public history: UserMessage[] = this.storage.getItem('dialog') ?? [];

  public dialog$: Observable<UserMessage[]> = this.broadcastChannelService
    .messagesByType([BroadcastChannelEventType.NEW_MESSAGE, BroadcastChannelEventType.MESSAGE])
    .pipe(
      map((event) => {
        const history = this.storage.getItem('dialog');
        if (event.type === BroadcastChannelEventType.NEW_MESSAGE) {
          this.typingTabsIds = this.typingTabsIds.filter((tab) => tab !== (event.payload as UserMessage).tabId);
          this.history = history;
        }
        return history;
      }),
      startWith(this.history)
    );

  private _inputTypingState$ = this.broadcastChannelService
    .messagesByType([BroadcastChannelEventType.START_TYPING, BroadcastChannelEventType.END_TYPING])
    .pipe(
      tap((event) => {
        if (event.type === BroadcastChannelEventType.START_TYPING) {
          this.typingTabsIds = [...this.typingTabsIds, event.payload as number];
        } else {
          this.typingTabsIds = this.typingTabsIds.filter((tab) => tab !== event.payload);
        }
        this.cdr.markForCheck();
      })
    );

  private _isUserTyping = false;

  private _startTyping$ = this.messageControl.valueChanges.pipe(
    throttleTime(2000),
    filter(() => !this._isUserTyping),
    tap(() => {
      this.broadcastChannelService.postMessage({
        type: BroadcastChannelEventType.START_TYPING,
        payload: this.CURRENT_TAB,
      });
      this._isUserTyping = true;
    })
  );

  private _endTyping$ = this.messageControl.valueChanges.pipe(
    debounceTime(2000),
    tap(() => {
      this._isUserTyping = false;
      this.broadcastChannelService.postMessage({
        type: BroadcastChannelEventType.END_TYPING,
        payload: this.CURRENT_TAB,
      });
    })
  );

  private unsub: Subject<void> = new Subject();

  private allMessages$ = merge(this._startTyping$, this._endTyping$, this._inputTypingState$).pipe(
    takeUntil(this.unsub)
  );

  constructor(
    @Inject(TAB_NUMBER) private readonly CURRENT_TAB: number,
    private broadcastChannelService: BroadcastChannelService,
    private formBuilder: NonNullableFormBuilder,
    private storage: Storage,
    private cdr: ChangeDetectorRef
  ) {
    this.allMessages$.subscribe();
  }

  public get tabId(): number {
    return this.CURRENT_TAB;
  }

  public get messageControl(): AbstractControl<string, string> {
    return this.form.controls['message'];
  }

  ngOnDestroy(): void {
    this.unsub.next();
    this.unsub.complete();
  }

  onSubmit() {
    if (this.form.invalid) return;
    const payload = {
      message: this.messageControl.value,
      tabId: this.CURRENT_TAB,
    } as UserMessage;

    this.history.push(payload);
    this.storage.setItem('dialog', this.history);

    this.broadcastChannelService.postMessage<UserMessage>({
      type: BroadcastChannelEventType.NEW_MESSAGE,
      payload,
    });
    this.broadcastChannelService.postMessage<number>({
      type: BroadcastChannelEventType.END_TYPING,
      payload: this.CURRENT_TAB,
    });
    this._isUserTyping = false;
    this.broadcastChannelService.messageStream$.next({ type: BroadcastChannelEventType.MESSAGE, payload });
    this.messageControl.reset();
  }
}
