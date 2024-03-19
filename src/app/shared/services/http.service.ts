import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

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

  getViews(): Observable<any> {
    return this.http.get('api/testtool/views').pipe(catchError(this.handleError()));
  }

  getMetadataReports(
    limit: number,
    regexFilter: string,
    filterHeader: string,
    metadataNames: string[],
    storage: string,
  ): Observable<any> {
    return this.http.get('api/metadata/' + storage + '/', {
      params: {
        limit: limit,
        filterHeader: filterHeader,
        filter: regexFilter,
        metadataNames: metadataNames,
      },
    });
  }

  getUserHelp(storage: string, metadataNames: string[]): Observable<any> {
    return this.http.get<any>('api/metadata/' + storage + '/userHelp', {
      params: {
        metadataNames: metadataNames,
      },
    });
  }

  getMetadataCount(storage: string): Observable<any> {
    return this.http.get('api/metadata/' + storage + '/count').pipe(catchError(this.handleError()));
  }

  getLatestReports(amount: number, storage: string): Observable<any> {
    return this.http
      .get<any>('api/report/latest/' + storage + '/' + amount)
      .pipe(tap(() => this.handleSuccess('Latest' + amount + 'reports opened!')))
      .pipe(catchError(this.handleError()));
  }

  getReportInProgress(index: number) {
    return this.http
      .get<any>('api/testtool/in-progress/' + index)
      .pipe(tap(() => this.handleSuccess('Opened report in progress with index [' + index + ']')))
      .pipe(catchError(this.handleError()));
  }

  deleteReportInProgress(index: number): Observable<any> {
    return this.http
      .delete<any>('api/testtool/in-progress/' + index)
      .pipe(tap(() => this.handleSuccess('Deleted report in progress with index [' + index + ']')))
      .pipe(catchError(this.handleError()));
  }

  getReportsInProgressThresholdTime(): Observable<any> {
    return this.http.get<number>('api/testtool/in-progress/threshold-time').pipe(catchError(this.handleError()));
  }

  getTestReports(metadataNames: string[], storage: string): Observable<any> {
    return this.http.get<any>('api/metadata/' + storage + '/', {
      params: { metadataNames: metadataNames },
    });
  }

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

  getReports(reportIds: string[], storage: string) {
    return this.http
      .get<any>(
        'api/report/' + storage + '/?xml=true&globalTransformer=' + localStorage.getItem('transformationEnabled'),
        { params: { storageIds: reportIds } },
      )
      .pipe(catchError(this.handleError()));
  }

  updateReport(reportId: string, params: any, storage: string): Observable<void> {
    return this.http
      .post('api/report/' + storage + '/' + reportId, params)
      .pipe(tap(() => this.handleSuccess('Report updated!')))
      .pipe(catchError(this.handleError()));
  }

  copyReport(data: any, storage: string): Observable<void> {
    return this.http
      .put('api/report/store/' + storage, data)
      .pipe(tap(() => this.handleSuccess('Report copied!')))
      .pipe(catchError(this.handleError()));
  }

  updatePath(reportIds: string[], storage: string, map: any) {
    return this.http
      .put('api/report/move/' + storage, map, {
        params: { storageIds: reportIds },
      })
      .pipe(catchError(this.handleError()));
  }

  uploadReport(formData: FormData): Observable<any> {
    return this.http
      .post('api/report/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .pipe(tap(() => this.handleSuccess('Report uploaded!')))
      .pipe(catchError(this.handleError()));
  }

  uploadReportToStorage(formData: FormData, storage: string): Observable<any> {
    return this.http
      .post('api/report/upload/' + storage, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .pipe(tap(() => this.handleSuccess('Report uploaded to storage!')))
      .pipe(catchError(this.handleError()));
  }

  postSettings(settings: any): Observable<void> {
    return this.http
      .post('api/testtool', settings)
      .pipe(tap(() => this.handleSuccess('Settings saved!')))
      .pipe(catchError(this.handleError()));
  }

  postTransformation(transformation: any): Observable<void> {
    return (
      this.http
        .post('api/testtool/transformation', { transformation: transformation })
        // .pipe(tap(() => this.handleSuccess('Transformation saved!')))
        .pipe(catchError(this.handleError()))
    );
  }

  getTransformation(defaultTransformation: boolean): Observable<any> {
    return this.http
      .get<any>('api/testtool/transformation/' + defaultTransformation)
      .pipe(catchError(this.handleError()));
  }

  getSettings(): Observable<any> {
    return this.http.get<any>('api/testtool').pipe(catchError(this.handleError()));
  }

  resetSettings(): Observable<any> {
    return this.http.get('api/testtool/reset').pipe(catchError(this.handleError()));
  }

  reset(): Observable<void> {
    return this.http.post<any>('api/runner/reset', {}).pipe(catchError(this.handleError()));
  }

  runReport(storage: string, targetStorage: string, reportId: string): Observable<void> {
    return this.http
      .post<any>('api/runner/run/' + storage + '/' + targetStorage + '/' + reportId, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(catchError(this.handleError()));
  }

  runDisplayReport(reportId: string, storage: string): Observable<any> {
    return this.http
      .put<any>('api/runner/replace/' + storage + '/' + reportId, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(catchError(this.handleError()));
  }

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
