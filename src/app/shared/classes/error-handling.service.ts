/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandling {
  private toastService = inject(ToastService);

  handleError(): (error: HttpErrorResponse) => Observable<any> {
    return (error: HttpErrorResponse): Observable<any> => {
      // TODO: This code is temporary for debugging.
      if (error.status === undefined) {
        this.toastService.showDanger('Received error with unknown status code');
        return of(error);
      } else if (error.error === undefined || error.error === null) {
        this.toastService.showDanger(`Received HTTP response with code ${error.status} but without a message`);
        return of(error);
      }
      const message = error.error;
      if (error.status > 399 && error.status < 500) {
        this.toastService.showWarning(message);
      } else if (message && message.includes('- detailed error message -')) {
        const errorMessageParts = message.split('- detailed error message -');
        this.toastService.showDanger(errorMessageParts[0], errorMessageParts[1]);
      } else {
        this.toastService.showDanger(error.message, '');
      }
      return of(error);
    };
  }
}
