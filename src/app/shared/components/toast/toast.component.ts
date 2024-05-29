import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { Toast } from '../../interfaces/toast';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  standalone: true,
  imports: [NgFor, NgIf, NgbToast, ClipboardModule],
})
export class ToastComponent implements OnInit, OnDestroy {
  toastSubscription!: Subscription;
  selectedAlert!: Toast;
  @ViewChild('modal') modal!: TemplateRef<Element>;
  toasts: Toast[] = [];
  justCopied: boolean = false;

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.toastSubscription = this.toastService.toastObservable.subscribe((toast: Toast): void => {
      this.toasts.push(toast);
    });
  }

  ngOnDestroy(): void {
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
  }

  close(alert: Toast): void {
    this.toasts.splice(this.toasts.indexOf(alert), 1);
  }

  showDetailedErrorMessages(alert: Toast): void {
    this.selectedAlert = alert;
    this.modalService.open(this.modal, { size: 'lg' });
  }

  copyToClipboard(): void {
    this.justCopied = true;
    setTimeout(() => {
      this.justCopied = false;
    }, 2000);
  }
}
