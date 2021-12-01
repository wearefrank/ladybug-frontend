import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DebugComponent } from './debug/debug.component';
import { TestComponent } from './test/test.component';
import { CompareComponent } from './compare/compare.component';
import { TableComponent } from './shared/components/table/table.component';
import { DisplayComponent } from './shared/components/display/display.component';
import { TreeComponent } from './shared/components/tree/tree.component';
import { ButtonComponent } from './shared/components/button/button.component';
import { DropdownComponent } from './shared/components/dropdown/dropdown.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { FilterPipe } from './shared/pipes/filter.pipe';
import { MonacoEditorComponent } from './shared/components/monaco-editor/monaco-editor.component';
import {MatSortModule} from "@angular/material/sort";
import { ReportComponent } from './report/report.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    DebugComponent,
    TestComponent,
    CompareComponent,
    TableComponent,
    DisplayComponent,
    TreeComponent,
    ButtonComponent,
    DropdownComponent,
    FilterPipe,
    MonacoEditorComponent,
    ReportComponent,
    ToastComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        NgbModule,
        HttpClientModule,
        MatSortModule,
        ReactiveFormsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
