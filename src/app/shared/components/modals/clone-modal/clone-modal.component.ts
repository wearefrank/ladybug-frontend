import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Report } from '../../../interfaces/report';
import { HttpService } from '../../../services/http.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-clone-modal',
  templateUrl: './clone-modal.component.html',
  styleUrls: ['./clone-modal.component.css'],
})
export class CloneModalComponent {
  @ViewChild('modal') modal!: any;
  @Output() cloneReportEvent = new EventEmitter<any>();
  report: Report = {} as Report;
  variableForm = new FormGroup({
    variables: new FormControl(''),
    message: new FormControl(''),
  });

  constructor(private modalService: NgbModal, private httpService: HttpService) {}

  open(selectedReport: any) {
    this.httpService.getReport(selectedReport.storageId, 'Test').subscribe((response) => {
      // TODO: storage is hardcoded for now
      this.report = response.report;
      this.variableForm.get('message')?.setValue(this.report.inputCheckpoint?.message);
      this.modalService.open(this.modal);
    });
  }

  generateClones() {
    let map: any = {
      csv: this.variableForm.value.variables,
      message: this.variableForm.value.message,
    };
    this.httpService.cloneReport(this.report.storageId.toString(), map).subscribe(() => {
      this.cloneReportEvent.emit();
    });
  }
}
