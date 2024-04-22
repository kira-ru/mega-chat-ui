import { InjectionToken } from '@angular/core';
import { Storage } from '@shared/core/storage.service';
import { UserMessage } from '@shared/broadcast-channel/broadcast-channel.types';

export const TAB_NUMBER = new InjectionToken<number>('tab id');

export function tabCounter(
  storage: Storage<{
    dialog: UserMessage[];
    activeTabs: { isActive: boolean; id: number }[];
  }>
) {
  const tabs = storage.items.activeTabs;
  const freeTab = tabs.find((tab, index) => {
    if (tab.isActive) return false;
    tabs[index].isActive = true;
    return true;
  });
  storage.setItem('activeTabs', tabs);
  return freeTab?.id;
}
