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
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { MatSortModule } from '@angular/material/sort';
import { ReportComponent } from './report/report.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestSettingsModalComponent } from './test/test-settings-modal/test-settings-modal.component';
import { CloneModalComponent } from './test/clone-modal/clone-modal.component';
import { DisplayTableComponent } from './shared/components/display-table/display-table.component';
import { TableSettingsModalComponent } from './debug/table/table-settings-modal/table-settings-modal.component';
import { jqxTreeModule } from 'jqwidgets-ng/jqxtree';
import { CompareTreeComponent } from './compare/compare-tree/compare-tree.component';
import { EditDisplayComponent } from './report/edit-display/edit-display.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DebugTreeComponent } from './debug/debug-tree/debug-tree.component';
import { ToggleComponent } from './shared/components/toggle/toggle.component';
import { AngularSplitModule } from 'angular-split';
import { DeleteModalComponent } from './test/delete-modal/delete-modal.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { TableCellShortenerPipe } from './shared/pipes/table-cell-shortener.pipe';
import { CustomEditorComponent } from './custom-editor/custom-editor.component';
import { CheckpointTypePipe } from './shared/pipes/checkpoint-type.pipe';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ActiveFiltersComponent } from './debug/active-filters/active-filters.component';
import { DictionaryPipe } from './shared/pipes/dictionary.pipe';
import { ReportDisplayComponent } from './report-display/report-display.component';
import { FilterSideDrawerComponent } from './debug/filter-side-drawer/filter-side-drawer.component';
import { NgSimpleFileTreeModule } from 'ng-simple-file-tree';
import { TestFolderTreeComponent } from './test/test-folder-tree/test-folder-tree.component';

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
    CompareTreeComponent,
    EditDisplayComponent,
    DebugTreeComponent,
    ToggleComponent,
    DeleteModalComponent,
    CustomEditorComponent,
    ActiveFiltersComponent,
    DictionaryPipe,
    ReportDisplayComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgbModule,
    HttpClientModule,
    MatSortModule,
    ReactiveFormsModule,
    FormsModule,
    jqxTreeModule,
    MatProgressSpinnerModule,
    AngularSplitModule,
    MonacoEditorModule.forRoot(),
    TableCellShortenerPipe,
    MatAutocompleteModule,
    CheckpointTypePipe,
    ClipboardModule,
    NgSimpleFileTreeModule,
    FilterSideDrawerComponent,
    TestFolderTreeComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
