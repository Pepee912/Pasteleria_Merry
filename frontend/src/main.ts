import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';

// ⬇️ Importes para locale ES
import { LOCALE_ID, importProvidersFrom } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// Registrar español ANTES del bootstrap
registerLocaleData(localeEs);

// Registrar iconos
addIcons({ 'search-outline': searchOutline });

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // ⬇️ Forzar español como locale global
    { provide: LOCALE_ID, useValue: 'es' },

    // (Opcional) si usas IonicStorageModule en modo standalone:
    // importProvidersFrom(IonicStorageModule.forRoot()),
  ],
});
