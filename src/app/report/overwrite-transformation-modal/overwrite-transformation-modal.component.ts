import { Component, inject, output, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-overwrite-transformation-modal',
  standalone: true,
  templateUrl: './overwrite-transformation-modal.component.html',
  styleUrl: './overwrite-transformation-modal.component.css',
})
export class OverwriteTransformationComponent {
  @ViewChild('modal') protected modal!: TemplateRef<OverwriteTransformationComponent>;
  confirm = output<void>();
  protected activeModal?: NgbModalRef;
  private modalService = inject(NgbModal);

  open(): void {
    this.activeModal = this.modalService.open(this.modal, {
      backdrop: 'static',
      keyboard: false,
    });
  }

  onConfirm(): void {
    this.confirm.emit();
    this.closeModal();
  }

  closeModal(): void {
    if (this.activeModal) {
      this.activeModal.close();
    }
  }
}
