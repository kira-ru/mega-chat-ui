import { InjectionToken } from '@angular/core';
import { Storage } from '@shared/core/storage.service';

export const TAB_NUMBER = new InjectionToken<number>('tab id');

export function tabCounter(storage: Storage) {
  const tabs = storage.items.activeTabs ?? [];
  const freeTab = tabs.find((tab) => !tab.isActive);
  let tabId: number;
  if (freeTab) {
    freeTab.isActive = true;
    tabId = freeTab.id;
  } else {
    tabId = tabs.length + 1;
    tabs.push({ isActive: true, id: tabId });
  }
  storage.setItem('activeTabs', tabs);
  return tabId;
}
