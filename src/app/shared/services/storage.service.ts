import { Injectable, OnDestroy } from '@angular/core';
import { UserMessage } from '@shared/services/broadcast-channel/broadcast-channel.types';

type StorageType = { dialog: UserMessage[]; activeTabs: { isActive: boolean; id: number }[] } | Record<string, never>;

const STORAGE_PREFIX = 'dialog-storage';

@Injectable({
  providedIn: 'root',
})
export class Storage implements OnDestroy {
  protected storageKey = `${STORAGE_PREFIX}`;
  protected storage = localStorage;

  public get items(): StorageType {
    const storedValues = this.storage.getItem(this.storageKey) || '{}';
    let parsedValues: StorageType;
    try {
      parsedValues = JSON.parse(storedValues);
    } catch (e) {
      parsedValues = {};
    }
    return parsedValues;
  }

  public set items(data: StorageType) {
    this.wrappedSetItem(this.storageKey, JSON.stringify(data));
  }

  ngOnDestroy(): void {}

  public setItem(key: keyof StorageType, value: unknown): void {
    const parsedValues = { ...this.items, [key]: value } as StorageType;
    this.wrappedSetItem(this.storageKey, JSON.stringify(parsedValues));
  }

  public getItem<K extends keyof StorageType>(key: K): StorageType[K] {
    const parsedValues = this.items;
    return parsedValues[key];
  }

  public removeItem(key: keyof StorageType): void {
    const parsedValues = this.items;
    delete parsedValues[key];
    this.wrappedSetItem(this.storageKey, JSON.stringify(parsedValues));
  }

  public clear(): void {
    this.storage.removeItem(this.storageKey);
  }

  private wrappedSetItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (e) {
      this.storage.clear();
      this.storage.setItem(key, value);
    }
  }
}
