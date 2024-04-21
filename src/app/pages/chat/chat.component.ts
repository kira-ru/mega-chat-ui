import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from '@shared/dialog/dialog.component';
import { LayoutComponent } from '@pages/layout/layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PanelComponent } from '@shared/panel/panel.component';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BroadcastChannelEventType, UserMessage } from '@shared/broadcast-channel/broadcast-channel.types';
import { debounceTime, map, Observable, tap, throttleTime } from 'rxjs';
import { BroadcastChannelService } from '@shared/broadcast-channel/broadcast-channel.service';
import { MessageForm } from '@app/app.component';

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

  public history: UserMessage[] = [];

  public dialog$: Observable<UserMessage[]> = this.broadcastChannelService
    .messagesByType(BroadcastChannelEventType.NEW_MESSAGE)
    .pipe(
      tap((newMessage) => {
        this.history = [...this.history, newMessage.payload as UserMessage];
      }),
      map(() => this.history)
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
    private broadcastChannelService: BroadcastChannelService,
    private formBuilder: NonNullableFormBuilder
  ) {
    this.messageControl.valueChanges.pipe();
    this._startTyping$.subscribe();
    this._endTyping$.subscribe();
  }

  public get messageControl(): AbstractControl<string, string> {
    return this.form.controls['message'];
  }

  onSubmit() {
    this.broadcastChannelService.postMessage<UserMessage>({
      type: BroadcastChannelEventType.NEW_MESSAGE,
      payload: {
        message: this.messageControl.value,
        userId: 'Вкладка 1',
      },
    });
    this.messageControl.reset();
  }
}
