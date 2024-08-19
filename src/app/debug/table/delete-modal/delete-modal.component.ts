import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css',
})
export class DeleteModalComponent {
  @ViewChild('modal') modal!: NgbModal;
  @Output() confirmDeleteAllEvent = new EventEmitter<void>();
  constructor(private modalService: NgbModal) {}

  open(): void {
    const options: NgbModalOptions = {
      modalDialogClass: 'modal-window',
      backdropClass: 'modal-backdrop',
    };
    this.modalService.open(this.modal, options);
  }

  deleteAllReports(): void {
    this.confirmDeleteAllEvent.emit();
  }
}
