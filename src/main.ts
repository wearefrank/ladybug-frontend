import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { NgSimpleFileTreeModule } from 'ng-simple-file-tree';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { AngularSplitModule } from 'angular-split';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  AppRouteReuseStrategy,
  AppRoutingModule,
} from './app/app-routing.module';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

if (environment.production) {
  enableProdMode();
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function main() {
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
        MonacoEditorModule.forRoot(),
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
