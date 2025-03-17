/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandling {
  constructor(private toastService: ToastService) {}

  handleError(): (error: HttpErrorResponse) => Observable<any> {
    return (error: HttpErrorResponse): Observable<any> => {
      const message = error.error;
      if (error.status > 399 && error.status < 500) {
        this.toastService.showWarning(message);
      } else if (message && message.includes('- detailed error message -')) {
        const errorMessageParts = message.split('- detailed error message -');
        this.toastService.showDanger(
          errorMessageParts[0],
          errorMessageParts[1],
        );
      } else {
        this.toastService.showDanger(error.message, '');
      }
      return of(error);
    };
  }
}
