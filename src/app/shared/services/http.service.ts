import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { ToastService } from './toast.service';
import { View } from '../interfaces/view';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  //TODO: fix Observable and error typing
  handleError() {
    return (error: any): Observable<any> => {
      const message = error.error;
      if (message.includes('- detailed error message -')) {
        const errorMessageParts = message.split('- detailed error message -');
        this.toastService.showDanger(errorMessageParts[0], errorMessageParts[1]);
      } else {
        this.toastService.showDanger(message, '');
      }
      return of(error);
    };
  }

  handleSuccess(message: string): void {
    this.toastService.showSuccess(message);
  }

  getViews(): Observable<Record<string, View>> {
    return this.http.get<Record<string, View>>('api/testtool/views').pipe(catchError(this.handleError()));
  }

  getMetadataReports(
    limit: number,
    regexFilter: string,
    filterHeader: string,
    metadataNames: string[],
    storage: string,
  ): Observable<Object[]> {
    return this.http.get<Object[]>('api/metadata/' + storage + '/', {
      params: {
        limit: limit,
        filterHeader: filterHeader,
        filter: regexFilter,
        metadataNames: metadataNames,
      },
    });
  }

  //TODO: fix Observable and get typing
  getUserHelp(storage: string, metadataNames: string[]): Observable<Object[]> {
    return this.http.get<Object[]>('api/metadata/' + storage + '/userHelp', {
      params: {
        metadataNames: metadataNames,
      },
    });
  }

  //TODO: fix Observable typing
  getMetadataCount(storage: string): Observable<number> {
    return this.http.get<number>('api/metadata/' + storage + '/count').pipe(catchError(this.handleError()));
  }

  //TODO: fix Observable and get typing
  getLatestReports(amount: number, storage: string): Observable<any> {
    return this.http
      .get<any>('api/report/latest/' + storage + '/' + amount)
      .pipe(tap(() => this.handleSuccess('Latest' + amount + 'reports opened!')))
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix get typing
  getReportInProgress(index: number) {
    return this.http
      .get<any>('api/testtool/in-progress/' + index)
      .pipe(tap(() => this.handleSuccess('Opened report in progress with index [' + index + ']')))
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix Observable and get typing
  deleteReportInProgress(index: number): Observable<any> {
    return this.http
      .delete<any>('api/testtool/in-progress/' + index)
      .pipe(tap(() => this.handleSuccess('Deleted report in progress with index [' + index + ']')))
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix Observable typing
  getReportsInProgressThresholdTime(): Observable<any> {
    return this.http.get<number>('api/testtool/in-progress/threshold-time').pipe(catchError(this.handleError()));
  }

  //TODO: fix Observable typing
  getTestReports(metadataNames: string[], storage: string): Observable<any> {
    return this.http.get<any>('api/metadata/' + storage + '/', {
      params: { metadataNames: metadataNames },
    });
  }

  //TODO: fix get typing
  getReport(reportId: string, storage: string) {
    return this.http
      .get<any>(
        // eslint-disable-next-line sonarjs/no-duplicate-string
        'api/report/' +
          storage +
          '/' +
          reportId +
          '/?xml=true&globalTransformer=' +
          localStorage.getItem('transformationEnabled'),
      )
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix get typing
  getReports(reportIds: string[], storage: string) {
    return this.http
      .get<any>(
        'api/report/' + storage + '/?xml=true&globalTransformer=' + localStorage.getItem('transformationEnabled'),
        { params: { storageIds: reportIds } },
      )
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix params typing
  updateReport(reportId: string, params: any, storage: string): Observable<void> {
    return this.http
      .post('api/report/' + storage + '/' + reportId, params)
      .pipe(tap(() => this.handleSuccess('Report updated!')))
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix data typing
  copyReport(data: any, storage: string): Observable<void> {
    return this.http
      .put('api/report/store/' + storage, data)
      .pipe(tap(() => this.handleSuccess('Report copied!')))
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix map typing
  updatePath(reportIds: string[], storage: string, map: any) {
    return this.http
      .put('api/report/move/' + storage, map, {
        params: { storageIds: reportIds },
      })
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix Observable typing
  uploadReport(formData: FormData): Observable<any> {
    return this.http
      .post('api/report/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .pipe(tap(() => this.handleSuccess('Report uploaded!')))
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix Observable typing
  uploadReportToStorage(formData: FormData, storage: string): Observable<any> {
    return this.http
      .post('api/report/upload/' + storage, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .pipe(tap(() => this.handleSuccess('Report uploaded to storage!')))
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix settings typing
  postSettings(settings: any): Observable<void> {
    return this.http
      .post('api/testtool', settings)
      .pipe(tap(() => this.handleSuccess('Settings saved!')))
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix transformation typing
  postTransformation(transformation: any): Observable<void> {
    return (
      this.http
        .post('api/testtool/transformation', { transformation: transformation })
        // .pipe(tap(() => this.handleSuccess('Transformation saved!')))
        .pipe(catchError(this.handleError()))
    );
  }

  //TODO: fix Observable and get typing
  getTransformation(defaultTransformation: boolean): Observable<any> {
    return this.http
      .get<any>('api/testtool/transformation/' + defaultTransformation)
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix Observable and get typing
  getSettings(): Observable<any> {
    return this.http.get<any>('api/testtool').pipe(catchError(this.handleError()));
  }

  //TODO: fix Observable typing
  resetSettings(): Observable<any> {
    return this.http.get('api/testtool/reset').pipe(catchError(this.handleError()));
  }

  //TODO: fix post typing
  reset(): Observable<void> {
    return this.http.post<any>('api/runner/reset', {}).pipe(catchError(this.handleError()));
  }

  //TODO: fix post typing
  runReport(storage: string, targetStorage: string, reportId: string): Observable<void> {
    return this.http
      .post<any>('api/runner/run/' + storage + '/' + targetStorage + '/' + reportId, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix Observable and put typing
  runDisplayReport(reportId: string, storage: string): Observable<any> {
    return this.http
      .put<any>('api/runner/replace/' + storage + '/' + reportId, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(catchError(this.handleError()));
  }

  //TODO: fix map typing
  cloneReport(storage: string, storageId: string, map: any) {
    return this.http
      .post('api/report/move/' + storage + '/' + storageId, map)
      .pipe(tap(() => this.handleSuccess('Report cloned!')))
      .pipe(catchError(this.handleError()));
  }

  deleteReport(reportIds: string[], storage: string): Observable<void> {
    return this.http
      .delete('api/report/' + storage, { params: { storageIds: reportIds } })
      .pipe(catchError(this.handleError()));
  }

  replaceReport(reportId: string, storage: string): Observable<void> {
    return this.http
      .put('api/runner/replace/' + storage + '/' + reportId, {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError()));
  }

  getUnmatchedCheckpoints(storageName: string, storageId: string, viewName: string): Observable<void> {
    return this.http
      .get('api/report/' + storageName + '/' + storageId + '/checkpoints/uids', {
        params: { view: viewName, invert: true },
      })
      .pipe(catchError(this.handleError()));
  }
}
