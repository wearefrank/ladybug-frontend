import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TestListItem } from '../../interfaces/test-list-item';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css',
})
export class DeleteModalComponent {
  @ViewChild('modal') modal!: NgbModal;
  protected activeModal?: NgbModalRef;
  @Output() confirmDeleteEvent = new EventEmitter<boolean>();
  reports: TestListItem[] = [];
  deleteQuestion!: string;
  deleteAllReports!: boolean;
  constructor(private modalService: NgbModal) {}

  open(reportsToBeDeleted: TestListItem[], deleteAllReports: boolean): void {
    this.deleteAllReports = deleteAllReports;
    this.deleteQuestion = deleteAllReports
      ? 'Are you sure you want to delete all reports?'
      : 'Are you sure you want to delete the following reports?';
    this.reports = reportsToBeDeleted;
    const options: NgbModalOptions = {
      modalDialogClass: 'modal-window',
      backdropClass: 'modal-backdrop',
    };
    this.activeModal = this.modalService.open(this.modal, options);
  }

  deleteReports() {
    this.confirmDeleteEvent.emit(this.deleteAllReports);
    this.closeModal();
  }

  closeModal(): void {
    if (this.activeModal) {
      this.activeModal.close();
    }
  }
}
