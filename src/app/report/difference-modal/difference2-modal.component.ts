import { Component, inject, Output, TemplateRef, ViewChild } from '@angular/core';
import { ReportDifference2 } from '../../shared/interfaces/report-difference';
import { TitleCasePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../shared/services/toast.service';

// TODO: Remove option 'saveRerun'
export const changesActionConst = ['save', 'discard', 'saveRerun'] as const;
export type ChangesAction = (typeof changesActionConst)[number];

@Component({
  selector: 'app-difference2-modal',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './difference2-modal.component.html',
  styleUrl: './difference2-modal.component.css',
})
export class Difference2ModalComponent {
  @Output() saveChangesEvent: Subject<void> = new Subject<void>();
  @Output() discardChangesEvent: Subject<void> = new Subject<void>();
  @ViewChild('modal') protected modal!: TemplateRef<Difference2ModalComponent>;
  protected saveOrDiscardType!: ChangesAction;
  protected reportDifferences?: ReportDifference2[];
  protected activeModal?: NgbModalRef;

  private modalService = inject(NgbModal);
  private toastService = inject(ToastService);

  open(differences: ReportDifference2[], saveOrDiscardType: ChangesAction): void {
    this.reportDifferences = differences;
    this.saveOrDiscardType = saveOrDiscardType;
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
    if (this.saveOrDiscardType === 'save') {
      this.saveChangesEvent.next();
    } else if (this.saveOrDiscardType === 'discard') {
      this.discardChangesEvent.next();
    } else {
      this.toastService.showWarning('Something went wrong.');
    }
    this.closeModal();
  }
}
