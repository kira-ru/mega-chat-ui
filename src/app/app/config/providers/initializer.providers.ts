import { APP_INITIALIZER, Provider } from '@angular/core';
import { InitializeService } from '@app/service/initialize.service';

export const InitProviders: Provider[] = [
  {
    provide: APP_INITIALIZER,
    useFactory: init,
    deps: [InitializeService],
    multi: true,
  },
];

function init(initializeService: InitializeService) {
  return () => initializeService.initialize();
}
