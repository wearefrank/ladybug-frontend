import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastComponent } from '../components/toast/toast.component';
import { catchError, Observable, of, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  toastComponent!: ToastComponent;
  REPORT_DEBUG_STORAGE: string = 'api/report/debugStorage/';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  initializeToastComponent(toastComponent: ToastComponent) {
    this.toastComponent = toastComponent;
  }

  handleError() {
    return (error: any): Observable<any> => {
      const errorMessages = error.error.split('::');
      this.toastComponent.addAlert({ type: 'danger', message: errorMessages[0], detailed: errorMessages[1] });
      return of(error);
    };
  }

  handleSuccess(message: string) {
    this.toastComponent.addAlert({ type: 'success', message: message });
  }

  getReports(limit: number, regexFilter: string): Observable<any> {
    return this.http.get('api/metadata/debugStorage/', {
      params: { limit: limit, filter: regexFilter },
    });
  }

  getLatestReports(amount: number): Observable<any> {
    return this.http
      .get<any>('api/report/latest/debugStorage/' + amount)
      .pipe(tap(() => this.handleSuccess('Latest' + amount + 'reports opened!')))
      .pipe(catchError(this.handleError()));
  }

  getReportInProgress(index: number) {
    return this.http
      .get<any>('api/testtool/in-progress/' + index)
      .pipe(tap(() => this.handleSuccess('Opened report in progress with index [' + index + ']')))
      .pipe(catchError(this.handleError()));
  }

  getTestReports(): Observable<any> {
    return this.http.get<any>('api/metadata/testStorage/');
  }

  getReport(reportId: string): Observable<any> {
    return this.http.get<any>(this.REPORT_DEBUG_STORAGE + reportId).pipe(catchError(this.handleError()));
  }

  getTestReport(reportId: string): Observable<any> {
    return this.http.get<any>('api/report/testStorage/' + reportId).pipe(catchError(this.handleError()));
  }

  getMonacoCode(reportId: string): Observable<any> {
    const xmlTransformationEnabled: string = this.cookieService.get('xmlTransformationEnabled')
      ? this.cookieService.get('xmlTransformationEnabled')
      : 'false';
    return this.http
      .get<any>(this.REPORT_DEBUG_STORAGE + reportId + '/?xml=true&globalTransformer=' + xmlTransformationEnabled)
      .pipe(catchError(this.handleError()));
  }

  postReport(reportId: string, report: any): Observable<void> {
    return this.http
      .post(this.REPORT_DEBUG_STORAGE + reportId, report)
      .pipe(tap(() => this.handleSuccess('Report updated!')))
      .pipe(catchError(this.handleError()));
  }

  copyReport(data: any): Observable<void> {
    return this.http
      .put('api/report/store/testStorage', data)
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

  uploadReportToStorage(formData: FormData): Observable<any> {
    return this.http
      .post('api/report/upload/testStorage', formData, {
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
    return this.http
      .post('api/testtool/transformation', { transformation: transformation })
      .pipe(tap(() => this.handleSuccess('Transformation saved!')))
      .pipe(catchError(this.handleError()));
  }

  getTransformation(): Observable<any> {
    return this.http.get<any>('api/testtool/transformation').pipe(catchError(this.handleError()));
  }

  getSettings(): Observable<any> {
    return this.http.get<any>('api/testtool').pipe(catchError(this.handleError()));
  }

  reset(): Observable<void> {
    return this.http.post<any>('api/runner/reset', {}).pipe(catchError(this.handleError()));
  }

  runReport(report: any): Observable<void> {
    return this.http
      .post<any>('api/runner/run/debugStorage', report, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(catchError(this.handleError()));
  }

  runDisplayReport(reportId: string): Observable<any> {
    return this.http
      .put<any>('/api/runner/replace/debugStorage/' + reportId, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(catchError(this.handleError()));
  }

  queryResults(): Observable<any> {
    return this.http
      .get('api/runner/result/debugStorage', { headers: this.headers })
      .pipe(catchError(this.handleError()));
  }

  deleteReport(reportId: string): Observable<void> {
    return this.http.delete('api/report/testStorage/' + reportId).pipe(catchError(this.handleError()));
  }

  replaceReport(reportId: string): Observable<void> {
    return this.http
      .put('api/runner/replace/testStorage/' + reportId, {
        headers: this.headers,
      })
      .pipe(catchError(this.handleError()));
  }
}
