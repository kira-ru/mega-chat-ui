import { InjectionToken } from '@angular/core';
import { Storage } from '@shared/core/storage.service';

export const TAB_NUMBER = new InjectionToken<number>('tab id');

export function tabCounter(storage: Storage) {
  const tabs = storage.items.activeTabs;
  const freeTab = tabs.find((tab, index) => {
    if (tab.isActive) return false;
    tabs[index].isActive = true;
    return true;
  });
  storage.setItem('activeTabs', tabs);
  return freeTab ? freeTab.id : tabs.length + 1;
}
