import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.css'],
  standalone: true,
  imports: [NgFor],
})
export class DeleteModalComponent {
  @ViewChild('modal') modal!: NgbModal;
  @Output() confirmDeleteEvent = new EventEmitter<any>();
  reports: any[] = [];
  constructor(private modalService: NgbModal) {}

  open(reportsToBeDeleted: any[]): void {
    this.reports = reportsToBeDeleted;
    const options: NgbModalOptions = {
      modalDialogClass: 'modal-window',
      backdropClass: 'modal-backdrop',
    };
    this.modalService.open(this.modal, options);
  }

  deleteReports() {
    this.confirmDeleteEvent.emit();
  }
}
