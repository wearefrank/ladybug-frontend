import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Report } from '../../shared/interfaces/report';
import { HttpService } from '../../shared/services/http.service';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CloneReport } from 'src/app/shared/interfaces/clone-report';
import { catchError } from 'rxjs';
import { ErrorHandling } from '../../shared/classes/error-handling.service';
import { ToastService } from '../../shared/services/toast.service';
import { TestListItem } from '../../shared/interfaces/test-list-item';

@Component({
  selector: 'app-clone-modal',
  templateUrl: './clone-modal.component.html',
  styleUrls: ['./clone-modal.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class CloneModalComponent {
  @ViewChild('modal') modal?: any;
  activeModal?: NgbActiveModal;
  @Output() cloneReportEvent = new EventEmitter<any>();
  report: Report = {} as Report;
  currentView = {
    storageName: 'Test',
  };
  variableForm = new UntypedFormGroup({
    variables: new UntypedFormControl(''),
    message: new UntypedFormControl(''),
  });

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private errorHandler: ErrorHandling,
    private toastService: ToastService,
  ) {}

  open(selectedReport: TestListItem) {
    this.httpService
      .getReport(selectedReport.storageId, this.currentView.storageName)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: (report: Report) => {
          this.report = report;
          this.variableForm.get('message')?.setValue(this.report.inputCheckpoint?.message);
          this.activeModal = this.modalService.open(this.modal);
        },
      });
  }

  generateClones() {
    const map: CloneReport = {
      csv: this.variableForm.value.variableCsv,
      message: this.variableForm.value.message,
    };
    this.httpService
      .cloneReport(this.currentView.storageName, this.report.storageId, map)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: (): void => {
          this.cloneReportEvent.emit();
          this.toastService.showSuccess('Report cloned!');
          this.activeModal?.dismiss();
        },
      });
  }
}
