import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.css'],
})
export class DeleteModalComponent {
  @ViewChild('modal') modal!: any;
  @Output() confirmDeleteEvent = new EventEmitter<any>();
  reports: any[] = [];
  constructor(private modalService: NgbModal) {}

  open(reportsToBeDeleted: any[]): void {
    this.reports = reportsToBeDeleted;
    this.modalService.open(this.modal);
  }

  deleteReports() {
    this.confirmDeleteEvent.emit();
  }
}
