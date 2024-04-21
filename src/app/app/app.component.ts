import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe, NgForOf } from '@angular/common';

export interface MessageForm
  extends FormGroup<{
    message: FormControl<string>;
  }> {}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, NgForOf],
  templateUrl: './app.component.html',
})
export class AppComponent {}
