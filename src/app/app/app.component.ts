import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {BroadcastChannelService} from "@shared/broadcast-channel/broadcast-channel.service";
import {map, tap} from "rxjs";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {PanelComponent} from "@shared/panel/panel.component";
import {LayoutComponent} from "@shared/layout/layout.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgForOf, AsyncPipe, NgIf, MatSlideToggleModule, PanelComponent, LayoutComponent],
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
