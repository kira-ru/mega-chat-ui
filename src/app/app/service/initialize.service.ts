import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Storage } from '@shared/core/storage.service';
import { Title } from '@angular/platform-browser';
import { TAB_NUMBER } from '@app/config/providers/tab.provider';

@Injectable({
  providedIn: 'root',
})
export class InitializeService {
  constructor(
    private storage: Storage,
    private title: Title,
    @Inject(TAB_NUMBER) private tab: number
  ) {}

  public initialize(): Observable<void> {
    return new Observable<void>((observer) => {
      this.storageInitialize();
      this.titleInitialize();

      observer.complete();
    });
  }

  private storageInitialize(): void {
    const { dialog, activeTabs } = this.storage.items;
    if (!dialog) this.storage.setItem('dialog', []);
    if (!activeTabs) this.storage.setItem('activeTabs', []);
  }

  private titleInitialize(): void {
    this.title.setTitle(`TAB-${this.tab}`);
  }
}
