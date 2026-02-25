import { ApplicationConfig, ErrorHandler, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { TitleStrategy as NgTitleStrategy, PreloadAllModules, provideRouter, Router, withPreloading, withViewTransitions } from '@angular/router';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { createErrorHandler, TraceService } from '@sentry/angular';
import { routes } from './app.routes';
import { TitleStrategy } from './strategies/title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideRouter(routes, withPreloading(PreloadAllModules), withViewTransitions()), { provide: NgTitleStrategy, useClass: TitleStrategy }, provideClientHydration(withEventReplay()),
  {
    provide: ErrorHandler,
    useValue: createErrorHandler(),
  },
  {
    provide: TraceService,
    deps: [Router],
  },
  {
    provide: provideAppInitializer,
    useFactory: () => () => { },
    deps: [TraceService],
    multi: true,
  },
  ]
};
