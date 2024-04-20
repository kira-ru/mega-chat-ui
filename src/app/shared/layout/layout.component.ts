import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PanelComponent} from "@shared/panel/panel.component";

@Component({
  selector: 'layout',
  standalone: true,
  imports: [CommonModule, PanelComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {

}
