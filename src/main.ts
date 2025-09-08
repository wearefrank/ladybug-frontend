import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { NgSimpleFileTreeModule } from 'ng-simple-file-tree';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AngularSplitModule } from 'angular-split';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRouteReuseStrategy, AppRoutingModule } from './app/app-routing.module';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

if (environment.production) {
  enableProdMode();
}

function main(): void {
  bootstrapApplication(AppComponent, {
    providers: [
      {
        provide: RouteReuseStrategy,
        useClass: AppRouteReuseStrategy,
      },
      importProvidersFrom(
        BrowserModule,
        AppRoutingModule,
        NgbModule,
        MatSortModule,
        ReactiveFormsModule,
        FormsModule,
        MatProgressSpinnerModule,
        AngularSplitModule,
        MatAutocompleteModule,
        ClipboardModule,
        NgSimpleFileTreeModule,
      ),
      provideAnimations(),
      provideHttpClient(withInterceptorsFromDi()),
    ],
  }).catch((error) => console.error(error));
}

main();
