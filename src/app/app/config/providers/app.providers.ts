import { Provider } from '@angular/core';
import { Storage } from '@shared/services/storage.service';
import { TAB_NUMBER, tabCounter } from '@app/config/providers/tab.provider';
import { InitProviders } from '@app/config/providers/initializer.providers';

export const AppProviders: Provider[] = [
  InitProviders,
  {
    provide: TAB_NUMBER,
    useFactory: tabCounter,
    deps: [Storage],
  },
];
