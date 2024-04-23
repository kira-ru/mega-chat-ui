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
  @Input()
  public dialog: UserMessage[] = [];

  @Input()
  public typingTabsIds: number[] = [];

  @Input()
  public tabId!: number;
}
