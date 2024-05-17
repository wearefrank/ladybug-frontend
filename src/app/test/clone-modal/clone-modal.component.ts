import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Report } from '../../shared/interfaces/report';
import { HttpService } from '../../shared/services/http.service';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CloneReport } from 'src/app/shared/interfaces/clone-report';
import { CompareReport } from 'src/app/shared/interfaces/compare-report';
import { TestListItem } from 'src/app/shared/interfaces/test-list-item';
import { CurrentTestView } from 'src/app/shared/interfaces/current-test-view';

@Component({
  selector: 'app-clone-modal',
  templateUrl: './clone-modal.component.html',
  styleUrls: ['./clone-modal.component.css'],
})
export class CloneModalComponent {
  @ViewChild('modal') modal!: any;
  @Output() cloneReportEvent = new EventEmitter<any>();
  report: Report = {} as Report;
  currentView: CurrentTestView = {
    metadataNames: [],
    storageName: 'Test',
    targetStorage: '',
  };
  variableForm = new UntypedFormGroup({
    variables: new UntypedFormControl(''),
    message: new UntypedFormControl(''),
  });

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
  ) {}

  open(selectedReport: TestListItem) {
    this.httpService.getReport(selectedReport.storageId, this.currentView.storageName).subscribe((response: Report) => {
      this.report = response;
      this.variableForm.get('message')?.setValue(this.report.inputCheckpoint?.message);
      this.modalService.open(this.modal);
    });
  }

  generateClones() {
    const map: CloneReport = {
      csv: this.variableForm.value.variables,
      message: this.variableForm.value.message,
    };
    this.httpService
      .cloneReport(this.currentView.storageName, this.report.storageId, map)
      .subscribe(() => this.cloneReportEvent.emit());
  }
}
