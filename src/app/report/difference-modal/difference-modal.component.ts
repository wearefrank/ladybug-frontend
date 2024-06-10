import { Component, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ReportDifference } from '../../shared/interfaces/report-difference';
import { TitleCasePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

export const changesActionConst = ['save', 'discard'] as const;
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
  protected activeModal?: NgbModalRef | undefined;
  @Output() saveChangesEvent: Subject<void> = new Subject<void>();
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

  close(): void {
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
}
