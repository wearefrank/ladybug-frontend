import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastComponent } from '../components/toast/toast.component';
import { catchError, Observable, of, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ChangeNodeLinkStrategyService } from './node-link-strategy.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  toastComponent!: ToastComponent;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private changeNodeLinkStrategyService: ChangeNodeLinkStrategyService
  ) {}

  initializeToastComponent(toastComponent: ToastComponent) {
    this.toastComponent = toastComponent;
  }

  handleError() {
    return (error: any): Observable<any> => {
      const message = error.error;
      if (message.includes('- detailed error message -')) {
        const errorMessageParts = message.split('- detailed error message -');
        this.toastComponent.addAlert({ type: 'danger', message: errorMessageParts[0], detailed: errorMessageParts[1] });
      } else {
        this.toastComponent.addAlert({ type: 'danger', message: message, detailed: '' });
      }
      return of(error);
    };
  }

  handleSuccess(message: string) {
    this.toastComponent.addAlert({ type: 'success', message: message });
  }

  getViews(): Observable<any> {
    return this.http.get('api/testtool/views').pipe(catchError(this.handleError()));
  }

  getMetadataReports(
    limit: number,
    regexFilter: string,
    filterHeader: string,
    metadataNames: string[],
    storage: string
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

  getTestReports(metadataNames: string[], storage: string): Observable<any> {
    return this.http.get<any>('api/metadata/' + storage + '/', {
      params: { metadataNames: metadataNames },
    });
  }

  getReport(reportId: string, storage: string) {
    return this.http
      .get<any>(
        'api/report/' +
          storage +
          '/' +
          reportId +
          '/?xml=true&globalTransformer=' +
          this.cookieService.get('transformationEnabled')
      )
      .pipe(catchError(this.handleError()));
  }

  getReports(reportIds: string[], storage: string) {
    return this.http
      .get<any>(
        'api/report/' + storage + '/?xml=true&globalTransformer=' + this.cookieService.get('transformationEnabled'),
        { params: { storageIds: reportIds } }
      )
      .pipe(catchError(this.handleError()));
  }

  postReport(reportId: string, report: any, storage: string): Observable<void> {
    return this.http
      .post('api/report/' + storage + '/' + reportId, report)
      .pipe(tap(() => this.handleSuccess('Report updated!')))
      .pipe(catchError(this.handleError()));
  }

  copyReport(data: any, storage: string): Observable<void> {
    return this.http
      .put('api/report/store/' + storage, data)
      .pipe(tap(() => this.handleSuccess('Report copied!')))
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

  deleteReport(reportId: string, storage: string): Observable<void> {
    return this.http.delete('api/report/' + storage + '/' + reportId).pipe(catchError(this.handleError()));
  }

  replaceReport(reportId: string, storage: string): Observable<void> {
    return this.http
      .put('api/runner/replace/' + storage + '/' + reportId, {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError()));
  }

  changeNodeLinkStrategy(viewName: string, nodeLinkStrategy: string) {
    return this.http
      .put('api/testtool/views/' + nodeLinkStrategy, { headers: this.headers }, { params: { viewName: viewName } })
      .pipe(
        tap(() => {
          this.changeNodeLinkStrategyService.changeNodeLinkStrategy.next();
        })
      ) // Notify table of change in view settings
      .pipe(catchError(this.handleError()));
  }
}
