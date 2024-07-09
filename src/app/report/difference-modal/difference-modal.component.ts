import { Component, Output, TemplateRef, ViewChild } from '@angular/core';
import { ReportDifference } from '../../shared/interfaces/report-difference';
import { TitleCasePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

export const changesActionConst = ['save', 'discard', 'saveRerun'] as const;
export type ChangesAction = (typeof changesActionConst)[number];

@Component({
  selector: 'app-difference-modal',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './difference-modal.component.html',
  styleUrl: './difference-modal.component.css',
})
export class DifferenceModalComponent {
  protected saveOrDiscardType!: ChangesAction;
  protected reportDifferences?: ReportDifference[];
  protected activeModal?: NgbModalRef;
  @Output() saveChangesEvent: Subject<void> = new Subject<void>();
  @Output() discardChangesEvent: Subject<void> = new Subject<void>();
  @Output() rerunEvent: Subject<void> = new Subject<void>();
  @ViewChild('modal') protected modal!: TemplateRef<DifferenceModalComponent>;

  constructor(private modalService: NgbModal) {}

  open(differences: ReportDifference[], saveOrDiscardType: ChangesAction): void {
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

  onClickSave(): void {
    if (this.saveOrDiscardType === 'save') {
      this.saveChangesEvent.next();
    } else if (this.saveOrDiscardType === 'discard') {
      this.discardChangesEvent.next();
    }
    this.closeModal();
  }

  onClickRerun(): void {
    this.rerunEvent.next();
    this.closeModal();
  }
}
