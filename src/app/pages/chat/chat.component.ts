import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
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

  private _isUserTyping = false;

  private _startTyping$ = this.messageControl.valueChanges.pipe(
    throttleTime(2000),
    tap(() => {
      if (this._isUserTyping) return;
      this.broadcastChannelService.postMessage({
        type: BroadcastChannelEventType.START_TYPING,
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
      });
    })
  );

  constructor(
    @Inject(TAB_NUMBER) private tab: number,
    private broadcastChannelService: BroadcastChannelService,
    private formBuilder: NonNullableFormBuilder,
    private storage: Storage<{ dialog: UserMessage[] }>,
    private cdr: ChangeDetectorRef
  ) {
    if (!this.storage.getItem('dialog')) {
      this.storage.setItem('dialog', []);
    }
    this.messageControl.valueChanges.pipe();
    this._startTyping$.subscribe();
    this._endTyping$.subscribe();
    this.dialog$.subscribe();
  }

  public get messageControl(): AbstractControl<string, string> {
    return this.form.controls['message'];
  }

  onSubmit() {
    const payload = {
      message: this.messageControl.value,
      userId: `TAB ${this.tab}`,
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
