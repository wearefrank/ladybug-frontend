import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { NgSimpleFileTreeModule } from 'ng-simple-file-tree';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { AngularSplitModule } from 'angular-split';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { jqxTreeModule } from 'jqwidgets-ng/jqxtree';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

function main() {
  bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(
        BrowserModule,
        AppRoutingModule,
        NgbModule,
        MatSortModule,
        ReactiveFormsModule,
        FormsModule,
        jqxTreeModule,
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
