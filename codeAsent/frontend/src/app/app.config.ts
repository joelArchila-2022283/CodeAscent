import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { autenticacionInterceptor } from './core/interceptors/autenticacion-interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideHttpClient(
      withInterceptors([
        autenticacionInterceptor,
        errorInterceptor
      ])
    ),

    provideRouter(routes)
  ]
};