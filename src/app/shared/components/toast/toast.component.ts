import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { Toast } from '../../interfaces/toast';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgClass } from '@angular/common';
import { FilterService } from '../../../debug/filter-side-drawer/filter.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  standalone: true,
  imports: [NgbToast, ClipboardModule, NgClass],
})
export class ToastComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modal!: TemplateRef<Element>;
  selected!: Toast;
  toasts: Toast[] = [];
  justCopied: boolean = false;
  filterPanelVisible: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService,
    private filterService: FilterService,
  ) {}

  ngOnInit(): void {
    const toastSubscription = this.toastService.toastObservable.subscribe((toast: Toast): void => {
      this.toasts.push(toast);
    });
    this.subscriptions.add(toastSubscription);
    const filterSubscription = this.filterService.filterSidePanel$.subscribe((value) => {
      this.filterPanelVisible = value;
    });
    this.subscriptions.add(filterSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  close(alert: Toast): void {
    this.toasts.splice(this.toasts.indexOf(alert), 1);
  }

  showDetailedErrorMessages(alert: Toast): void {
    this.selected = alert;
    this.modalService.open(this.modal, { size: 'lg' });
  }

  copyToClipboard(): void {
    this.justCopied = true;
    setTimeout(() => {
      this.justCopied = false;
    }, 2000);
  }
}
