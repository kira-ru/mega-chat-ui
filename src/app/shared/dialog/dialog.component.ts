import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserMessage } from '@shared/broadcast-channel/broadcast-channel.types';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  @Input() dialog: UserMessage[] = [];

  @Input() typingTabsIds: number[] = [];
}
