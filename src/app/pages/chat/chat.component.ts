import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from '@shared/dialog/dialog.component';
import { LayoutComponent } from '@pages/layout/layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PanelComponent } from '@shared/panel/panel.component';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BroadcastChannelEvent,
  BroadcastChannelEventType,
  UserMessage,
} from '@shared/broadcast-channel/broadcast-channel.types';
import { debounceTime, Observable, tap, throttleTime } from 'rxjs';
import { BroadcastChannelService } from '@shared/broadcast-channel/broadcast-channel.service';
import { MessageForm } from '@app/app.component';
import { Storage } from '@shared/core/storage.service';
import { TAB_NUMBER } from '@app/config/providers/tab.provider';

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
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent {
  public form: MessageForm = this.formBuilder.group({
    message: ['', { validators: [Validators.required] }],
  });
  public history: UserMessage[] = (this.storage.getItem('dialog') as UserMessage[]) ?? [];

  public dialog$: Observable<BroadcastChannelEvent> = this.broadcastChannelService
    .messagesByType(BroadcastChannelEventType.NEW_MESSAGE)
    .pipe(
      tap(() => {
        this.history = this.storage.items.dialog;
        this.cdr.markForCheck();
      })
    );

  public typingTabsIds: number[] = [];
  public typingStream$ = this.broadcastChannelService
    .messagesByType([BroadcastChannelEventType.START_TYPING, BroadcastChannelEventType.END_TYPING])
    .pipe(
      tap((event) => {
        if (event.type === BroadcastChannelEventType.START_TYPING) {
          this.typingTabsIds = [...this.typingTabsIds, event.payload as number];
        } else {
          this.typingTabsIds = this.typingTabsIds.filter((tab) => tab !== event.payload);
        }
        console.log(this.typingTabsIds);
        this.cdr.markForCheck();
      })
    );

  private _isUserTyping = false;

  private _startTyping$ = this.messageControl.valueChanges.pipe(
    throttleTime(2000),
    tap(() => {
      if (this._isUserTyping) return;
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

  constructor(
    @Inject(TAB_NUMBER) private CURRENT_TAB: number,
    private broadcastChannelService: BroadcastChannelService,
    private formBuilder: NonNullableFormBuilder,
    private storage: Storage,
    private cdr: ChangeDetectorRef
  ) {
    if (!this.storage.getItem('dialog')) {
      this.storage.setItem('dialog', []);
    }
    this.messageControl.valueChanges.pipe();
    this._startTyping$.subscribe();
    this._endTyping$.subscribe();
    this.dialog$.subscribe();
    this.typingStream$.subscribe();
  }

  public get messageControl(): AbstractControl<string, string> {
    return this.form.controls['message'];
  }

  @HostListener('window:beforeunload', ['$event'])
  handleTabClose(event: BeforeUnloadEvent) {
    this.storage.setItem(
      'activeTabs',
      this.storage.items.activeTabs.map((tab) => {
        if (tab.id !== this.CURRENT_TAB) return tab;
        tab.isActive = false;
        return tab;
      })
    );
    console.log(event);
  }

  onSubmit() {
    const payload = {
      message: this.messageControl.value,
      tabId: `TAB ${this.CURRENT_TAB}`,
    } as UserMessage;

    this.history = [...this.history, payload];
    this.storage.setItem('dialog', this.history);

    this.broadcastChannelService.postMessage<UserMessage>({
      type: BroadcastChannelEventType.NEW_MESSAGE,
      payload,
    });
    this.messageControl.reset();
  }
}
