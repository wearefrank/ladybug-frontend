import { Component, inject, Output, TemplateRef, ViewChild } from '@angular/core';
import { ReportDifference2 } from '../../shared/interfaces/report-difference';
import { Subject } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// TODO: Remove option 'saveRerun'
export const changesActionConst = ['save', 'discard', 'saveRerun'] as const;
export type ChangesAction = (typeof changesActionConst)[number];

@Component({
  selector: 'app-difference2-modal',
  standalone: true,
  templateUrl: './difference2-modal.component.html',
  styleUrl: './difference2-modal.component.css',
})
export class Difference2ModalComponent {
  @Output() saveChangesEvent: Subject<void> = new Subject<void>();
  @ViewChild('modal') protected modal!: TemplateRef<Difference2ModalComponent>;
  protected reportDifferences?: ReportDifference2[];
  protected activeModal?: NgbModalRef;
  protected isConfirmClicked = false;

  private modalService = inject(NgbModal);

  open(differences: ReportDifference2[]): void {
    this.isConfirmClicked = false;
    this.reportDifferences = differences;
    this.activeModal = this.modalService.open(this.modal, {
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeModal(): void {
    if (this.activeModal) {
      this.activeModal.close();
    }
  }

  getChunkColorForDifferenceModal(chunk: number): string {
    switch (chunk) {
      case -1: {
        return '#ff7f7f';
      }
      case 1: {
        return '#7cfc00';
      }
      default: {
        return '';
      }
    }
  }

  onClickConfirm(): void {
    this.saveChangesEvent.next();
    this.isConfirmClicked = true;
    // Do not close so parent component can close when saving data is done.
  }
}
