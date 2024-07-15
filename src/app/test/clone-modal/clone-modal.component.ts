import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Report } from '../../shared/interfaces/report';
import { HttpService } from '../../shared/services/http.service';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { CloneReport } from 'src/app/shared/interfaces/clone-report';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-clone-modal',
  templateUrl: './clone-modal.component.html',
  styleUrls: ['./clone-modal.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class CloneModalComponent {
  @ViewChild('modal') modal!: any;
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
    private toastService: ToastService,
  ) {}

  handleError(): (error: HttpErrorResponse) => Observable<any> {
    return (error: HttpErrorResponse): Observable<any> => {
      const message = error.error;
      if (message && message.includes('- detailed error message -')) {
        const errorMessageParts = message.split('- detailed error message -');
        this.toastService.showDanger(errorMessageParts[0], errorMessageParts[1]);
      } else {
        this.toastService.showDanger(error.message, '');
      }
      return of(error);
    };
  }

  open(selectedReport: any) {
    this.httpService.getReport(selectedReport.storageId, this.currentView.storageName).subscribe({
      next: (report: Report) => {
        this.report = report;
        this.variableForm.get('message')?.setValue(this.report.inputCheckpoint?.message);
        this.modalService.open(this.modal);
      },
      error: () => catchError(this.handleError()),
    });
  }

  generateClones() {
    let map: CloneReport = {
      csv: this.variableForm.value.variables,
      message: this.variableForm.value.message,
    };
    this.httpService.cloneReport(this.currentView.storageName, this.report.storageId, map).subscribe({
      next: () => this.cloneReportEvent.emit(),
      error: () => catchError(this.handleError()),
    });
  }
}
