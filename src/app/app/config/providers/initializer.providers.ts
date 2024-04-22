import { Storage } from '@shared/core/storage.service';
import { Observable } from 'rxjs';
import { APP_INITIALIZER, Provider } from '@angular/core';

export const InitProviders: Provider[] = [
  {
    provide: APP_INITIALIZER,
    useFactory: init,
    deps: [Storage],
    multi: true,
  },
];

function init(storage: Storage) {
  return () =>
    new Observable<void>((observer) => {
      storage.initialize();
      const activeTabs = storage.items.activeTabs;
      const freeTab = activeTabs.find((tab) => !tab.isActive);
      if (!freeTab) {
        storage.setItem('activeTabs', [...activeTabs, { isActive: false, id: activeTabs.length + 1 }]);
      }
      observer.complete();
    });
}
