import { Component, Input, Output, ViewChild } from '@angular/core';
import { ReportDifference } from '../../shared/interfaces/report-difference';
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../shared/services/http.service';
// @ts-expect-error no default export
import DiffMatchPatch from 'diff-match-patch';
import { HelperService } from '../../shared/services/helper.service';
import { CustomEditorComponent } from '../../custom-editor/custom-editor.component';
import { Report } from '../../shared/interfaces/report';
import { DisplayTableComponent } from '../../shared/components/display-table/display-table.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgFor, NgIf, NgStyle, TitleCasePipe } from '@angular/common';
import { BooleanToStringPipe } from '../../shared/pipes/boolean-to-string.pipe';
import { Subject } from 'rxjs';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { EditFormComponent } from '../edit-form/edit-form.component';
import { ChangesAction, DifferenceModalComponent } from '../difference-modal/difference-modal.component';

@Component({
  selector: 'app-edit-display',
  templateUrl: './edit-display.component.html',
  styleUrls: ['./edit-display.component.css'],
  standalone: true,
  imports: [
    NgIf,
    ButtonComponent,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownButtonItem,
    NgbDropdownItem,
    ReactiveFormsModule,
    CustomEditorComponent,
    DisplayTableComponent,
    NgFor,
    BooleanToStringPipe,
    NgStyle,
    ClipboardModule,
    EditFormComponent,
    TitleCasePipe,
    DifferenceModalComponent,
  ],
})
export class EditDisplayComponent {
  @Input() id: string = '';
  @Input() containerHeight!: number;
  @Input() currentView: any = {};
  @Input() newTab: boolean = true;
  @Output() saveReportEvent: Subject<any> = new Subject<any>();
  @Output() closeReportEvent: Subject<void> = new Subject<void>();
  @ViewChild(CustomEditorComponent) editor!: CustomEditorComponent;
  @ViewChild(EditFormComponent) editFormComponent!: EditFormComponent;
  @ViewChild(DifferenceModalComponent) differenceModal!: DifferenceModalComponent;
  editingEnabled: boolean = false;
  editingChildNode: boolean = false;
  editingRootNode: boolean = false;
  metadataTableVisible: boolean = false;
  rerunResult: string = '';
  report: any = {};
  displayReport: boolean = false;
  rerunSuccess: boolean = false;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private helperService: HelperService,
  ) {}

  showReport(report: Report): void {
    this.disableEditing(); // For switching from editing current report to another
    this.report = report;
    report.xml
      ? this.editor.setNewReport(report.xml)
      : this.editor.setNewReport(this.helperService.convertMessage(report));
    this.rerunResult = '';
    this.displayReport = true;
  }

  changeEncoding(button: any): void {
    this.editor.setNewReport(this.helperService.changeEncoding(this.report, button));
  }

  rerunReport(): void {
    let reportId: string = this.report.storageId;
    // TODO: Fix the run report for debug tab after PR 433 of frontend project
    // this.httpService.runDisplayReport(reportId, this.currentView.storageName).subscribe((response) => {
    //   this.rerunSuccess = this.report == response;
    // });
  }

  closeReport(removeReportFromTree: boolean): void {
    this.displayReport = false;
    this.editingRootNode = false;
    this.editingRootNode = false;
    if (removeReportFromTree) {
      this.closeReportEvent.next(this.report);
    }
    this.editor.setNewReport('');
  }

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    let queryString: string = this.report.xml ? this.report.storageId.toString() : this.report.uid.split('#')[0];
    this.helperService.download(queryString + '&', this.currentView.storageName, exportBinary, exportXML);
    this.httpService.handleSuccess('Report Downloaded!');
  }

  selectStubStrategy(event: Event): void {
    this.saveChanges(true, (event.target as HTMLOptionElement).value);
  }

  openDifferenceModal(type: ChangesAction): void {
    const reportDifferences: ReportDifference[] = [];
    if (this.report.xml && this.editFormComponent) {
      reportDifferences.push(
        this.getDifference('name', this.report.name, this.editFormComponent.name),
        this.getDifference('description', this.report.description, this.editFormComponent.description),
        this.getDifference('path', this.report.path, this.editFormComponent.path),
        this.getDifference('transformation', this.report.transformation, this.editFormComponent.transformation),
        this.getDifference('variables', this.report.variables, this.editFormComponent.variables),
      );
    } else {
      reportDifferences.push(this.getDifference('message', this.report.message, this.editor?.getValue()));
    }

    this.differenceModal.open(reportDifferences, type);
  }

  getDifference(name: string, originalValue: string, newValue: string): ReportDifference {
    const difference = new DiffMatchPatch().diff_main(originalValue ?? '', newValue ?? '');
    return {
      name: name,
      originalValue: originalValue,
      difference: difference,
    };
  }

  getReportValues(checkpointId: string): any {
    return {
      name: this.editFormComponent.name ?? '',
      path: this.editFormComponent.path ?? '',
      description: this.editFormComponent.description ?? '',
      transformation: this.editFormComponent.transformation ?? '',
      checkpointId: checkpointId,
      variables: this.editFormComponent.variables ?? '',
      checkpointMessage: this.editor?.getValue() ?? '',
    };
  }

  editReport(): void {
    if (this.report.xml) {
      this.editingRootNode = true;
    } else {
      this.editingChildNode = true;
    }
    this.editingEnabled = true;
  }

  disableEditing(): void {
    if (this.editingChildNode) {
      this.editingChildNode = false;
    }
    this.editingRootNode = false;
    this.editingEnabled = false;
  }

  saveChanges(saveStubStrategy: boolean, stubStrategy: string): void {
    let checkpointId: string = '';
    let storageId: string;
    if (this.report.xml) {
      storageId = this.report.storageId;
    } else {
      storageId = this.report.uid.split('#')[0];
      checkpointId = this.report.uid.split('#')[1];
    }

    const params = saveStubStrategy
      ? { stub: stubStrategy, checkpointId: checkpointId }
      : this.getReportValues(checkpointId);

    this.httpService.updateReport(storageId, params, this.currentView.storageName).subscribe((response: any) => {
      response.report.xml = response.xml;
      this.saveReportEvent.next(response.report);
    });
  }

  toggleMetadataTable(): void {
    this.metadataTableVisible = !this.metadataTableVisible;
  }

  showEditorPossibilitiesModal(modal: any): void {
    this.modalService.open(modal, {
      backdrop: true,
      backdropClass: 'modal-backdrop',
      modalDialogClass: 'modal-window',
    });
  }

  copyReport(): void {
    const storageId = this.report.storageId ?? this.report.uid.split('#')[0];
    const data: Record<string, string[]> = {
      [this.currentView.storageName]: [storageId],
    };
    this.httpService.copyReport(data, 'Test').subscribe(); // TODO: storage is hardcoded, fix issue #196 for this
  }
}
