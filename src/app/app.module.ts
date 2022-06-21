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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { FilterPipe } from './shared/pipes/filter.pipe';
import { MonacoEditorComponent } from './shared/components/monaco-editor/monaco-editor.component';
import { MatSortModule } from '@angular/material/sort';
import { ReportComponent } from './report/report.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestSettingsModalComponent } from './shared/components/modals/test-settings-modal/test-settings-modal.component';
import { CloneModalComponent } from './shared/components/modals/clone-modal/clone-modal.component';
import { DisplayTableComponent } from './shared/components/display-table/display-table.component';
import { TableSettingsModalComponent } from './shared/components/modals/table-settings-modal/table-settings-modal.component';
import { TestFolderTreeComponent } from './test-folder-tree/test-folder-tree.component';
import { CookieService } from 'ngx-cookie-service';
import { EnumToArrayPipe } from './shared/pipes/enum-to-array.pipe';
import { DatePipe } from '@angular/common';

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
    FilterPipe,
    MonacoEditorComponent,
    ReportComponent,
    ToastComponent,
    TestSettingsModalComponent,
    CloneModalComponent,
    DisplayTableComponent,
    TableSettingsModalComponent,
    TestFolderTreeComponent,
    EnumToArrayPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgbModule,
    NgbNavModule,
    HttpClientModule,
    MatSortModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [CookieService, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
