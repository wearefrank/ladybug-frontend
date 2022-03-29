import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Metadata } from '../../../interfaces/metadata';
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
  report: Report = {} as Report;
  variableForm = new FormGroup({
    variables: new FormControl(''),
    message: new FormControl(''),
  });

  constructor(private modalService: NgbModal, private httpService: HttpService) {}

  open(selectedReport: Metadata) {
    this.httpService.getReport(selectedReport.storageId, 'testStorage').subscribe((response) => {
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
    this.httpService.cloneReport(this.report.storageId.toString(), map).subscribe();
    console.log(map);
    // console.log(this.variableForm.value.variables)
    // console.log(this.variableForm.value.message)
  }
}
