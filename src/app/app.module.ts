import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DebugComponent } from './debug/debug.component';
import { TestComponent } from './test/test.component';
import { CompareComponent } from './compare/compare.component';
import { TableComponent } from './debug/table/table.component';
import { DisplayComponent } from './debug/display/display.component';
import { ButtonComponent } from './shared/components/button/button.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { MatSortModule } from '@angular/material/sort';
import { ReportComponent } from './report/report.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestSettingsModalComponent } from './test/test-settings-modal/test-settings-modal.component';
import { CloneModalComponent } from './test/clone-modal/clone-modal.component';
import { DisplayTableComponent } from './shared/components/display-table/display-table.component';
import { TableSettingsModalComponent } from './debug/table/table-settings-modal/table-settings-modal.component';
import { TestFolderTreeComponent } from './test/test-folder-tree/test-folder-tree.component';
import { CookieService } from 'ngx-cookie-service';
import { EnumToArrayPipe } from './shared/pipes/enum-to-array.pipe';
import { jqxTreeModule } from 'jqwidgets-ng/jqxtree';
import { NgxTextDiffModule } from 'ngx-text-diff';
import { CompareTreeComponent } from './compare/compare-tree/compare-tree.component';
import { EditDisplayComponent } from './report/edit-display/edit-display.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DebugTreeComponent } from './debug/debug-tree/debug-tree.component';
import { ToggleComponent } from './shared/components/toggle/toggle.component';
import { EditorComponent } from './shared/components/editor/editor.component';

@NgModule({
  declarations: [
    AppComponent,
    DebugComponent,
    TestComponent,
    CompareComponent,
    TableComponent,
    DisplayComponent,
    ButtonComponent,
    ReportComponent,
    ToastComponent,
    TestSettingsModalComponent,
    CloneModalComponent,
    DisplayTableComponent,
    TableSettingsModalComponent,
    TestFolderTreeComponent,
    EnumToArrayPipe,
    CompareTreeComponent,
    EditDisplayComponent,
    DebugTreeComponent,
    ToggleComponent,
    EditorComponent,
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
    jqxTreeModule,
    NgxTextDiffModule,
    MatProgressSpinnerModule,
  ],
  providers: [CookieService],
  bootstrap: [AppComponent],
})
export class AppModule {}
