import { type ApplicationConfig, ENVIRONMENT_INITIALIZER, inject, makeEnvironmentProviders, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideExperimentalZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(routes),
    makeEnvironmentProviders([
      {
        provide: ENVIRONMENT_INITIALIZER,
        multi: true,
        useValue: () => {
          const matIconRegistry = inject(MatIconRegistry);
          const domSanitizer = inject(DomSanitizer);
          matIconRegistry.addSvgIcon(
            'github',
            domSanitizer.bypassSecurityTrustResourceUrl('./icons/github.svg')
          );
        }
      }
    ])
  ]
};
