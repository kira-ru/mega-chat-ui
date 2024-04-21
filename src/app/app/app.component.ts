import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BroadcastChannelService } from '@shared/broadcast-channel/broadcast-channel.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { PanelComponent } from '@shared/panel/panel.component';
import { LayoutComponent } from '@shared/layout/layout.component';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BroadcastChannelEventType } from '@shared/broadcast-channel/broadcast-channel.types';
import { debounceTime, tap, throttleTime } from 'rxjs';

export interface MessageForm
  extends FormGroup<{
    message: FormControl<string>;
  }> {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgForOf,
    MatInputModule,
    AsyncPipe,
    NgIf,
    PanelComponent,
    LayoutComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  //todo delete after test
  // public messages$ = this.broadcastChannelService.messageStream$.pipe(
  //   tap(event => {
  //     this.history = [...this.history, (event.payload as string)]
  //   }),
  //   map(() => this.history),
  // )
  //
  // private history: string[] = [];

  public form: MessageForm = this.formBuilder.group({
    message: ['', { validators: [Validators.required] }],
  });

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

  get messageControl(): AbstractControl<string, string> {
    return this.form.controls['message'];
  }

  onSubmit() {
    this.broadcastChannelService.postMessage<string>({
      type: BroadcastChannelEventType.NEW_MESSAGE,
      payload: this.messageControl.value,
    });
    this.messageControl.reset();
  }
}
