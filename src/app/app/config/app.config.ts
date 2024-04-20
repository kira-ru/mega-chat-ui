import { importProvidersFrom } from '@angular/core';
import { ApplicationConfig } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from '@app/config/app.routes';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(HttpClientModule, BrowserAnimationsModule)],
};
