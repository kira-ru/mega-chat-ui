import { FormControl, FormGroup } from '@angular/forms';

export interface MessageForm
  extends FormGroup<{
    message: FormControl<string>;
  }> {}
