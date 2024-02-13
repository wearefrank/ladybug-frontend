import { Injectable, TemplateRef } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { Toast } from '../interfaces/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject: Subject<Toast> = new ReplaySubject(1);
  toastObservable: Observable<Toast> = this.toastSubject.asObservable();

  constructor() {}

  public showDanger(body: string, detailedInfo?: string): void {
    this.toastSubject.next({
      type: 'danger',
      message: body,
      detailed: detailedInfo,
    } as Toast);
  }

  public showWarning(body: string): void {
    this.toastSubject.next({ type: 'warning', message: body } as Toast);
  }

  public showSuccess(body: string): void {
    this.toastSubject.next({ type: 'success', message: body } as Toast);
  }

  public showInfo(body: string): void {
    this.toastSubject.next({ type: 'info', message: body } as Toast);
  }
}
