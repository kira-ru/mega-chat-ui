import { InjectionToken } from '@angular/core';
import { Storage } from '@shared/services/storage.service';

export const TAB_NUMBER = new InjectionToken<number>('tab id');

export function tabCounter(storage: Storage) {
  const tabs = storage.items.activeTabs ?? [];
  const currentTabNumber = tabs.length + 1;
  tabs.push(currentTabNumber);
  storage.setItem('activeTabs', tabs);
  return currentTabNumber;
}
