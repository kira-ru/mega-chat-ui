import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BroadcastChannelService} from "@shared/broadcast-channel/broadcast-channel.service";
import {map, tap} from "rxjs";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgForOf, AsyncPipe, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  //todo delete after test
  public messages$ = this.broadcastChannelService.messageStream$.pipe(
    tap(event => {
      this.history = [...this.history, (event.payload as string)]
    }),
    map(() => this.history),
  )

  private history: string[] = [];

  constructor(private broadcastChannelService: BroadcastChannelService) {}
}
