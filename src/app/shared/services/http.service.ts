import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, tap } from 'rxjs';
import { ToastService } from './toast.service';
import { View } from '../interfaces/view';
import { OptionsSettings } from '../interfaces/options-settings';
import { Report } from '../interfaces/report';
import { CompareReport } from '../interfaces/compare-reports';
import { TestListItem } from '../interfaces/test-list-item';
import { CloneReport } from '../interfaces/clone-report';
import { UploadParams } from '../interfaces/upload-params';
import { UpdatePathSettings } from '../interfaces/update-path-settings';
import { TestResult } from '../interfaces/test-result';
import { UpdateReport } from '../interfaces/update-report';
import { UpdateCheckpoint } from '../interfaces/update-checkpoint';
import { UpdateReportResponse } from '../interfaces/update-report-response';
import { Transformation } from '../interfaces/transformation';
import { TableSettings } from '../interfaces/table-settings';
import { ErrorHandling } from '../classes/error-handling.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private errorHandler: ErrorHandling,
  ) {}

  handleSuccess(message: string): void {
    this.toastService.showSuccess(message);
  }

  getViews(): Observable<View[]> {
    return this.http.get<View[]>('api/testtool/views').pipe(
      map((data: View[]) => {
        const views: View[] = [];
        for (let [key, value] of Object.entries(data)) {
          views.push({ ...value, name: key });
        }
        return views;
      }),
      catchError(this.errorHandler.handleError()),
    );
  }

  getMetadataReports(settings: TableSettings, view: View): Observable<Report[]> {
    return this.http
      .get<Report[]>(`api/metadata/${view.storageName}/`, {
        params: {
          limit: settings.displayAmount,
          filterHeader: [...settings.currentFilters.keys()],
          filter: [...settings.currentFilters.values()],
          metadataNames: view.metadataNames,
        },
      })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  getUserHelp(storage: string, metadataNames: string[]): Observable<Report> {
    return this.http
      .get<Report>(`api/metadata/${storage}/userHelp`, {
        params: {
          metadataNames: metadataNames,
        },
      })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  getMetadataCount(storage: string): Observable<number> {
    return this.http.get<number>(`api/metadata/${storage}/count`).pipe(catchError(this.errorHandler.handleError()));
  }

  getLatestReports(amount: number, storage: string): Observable<Report[]> {
    return this.http.get<Report[]>(`api/report/latest/${storage}/${amount}`).pipe(
      tap(() => this.handleSuccess('Latest' + amount + 'reports opened!')),
      catchError(this.errorHandler.handleError()),
    );
  }

  getReportInProgress(index: number): Observable<Report> {
    return this.http.get<Report>(`api/testtool/in-progress/${index}`).pipe(
      tap(() => this.handleSuccess(`Opened report in progress with index [${index}]`)),
      catchError(this.errorHandler.handleError()),
    );
  }

  deleteReportInProgress(index: number): Observable<Report> {
    return this.http.delete<Report>('api/testtool/in-progress/' + index).pipe(
      tap(() => this.handleSuccess(`Deleted report in progress with index [${index}]`)),
      catchError(this.errorHandler.handleError()),
    );
  }

  getReportsInProgressThresholdTime(): Observable<number> {
    return this.http
      .get<number>('api/testtool/in-progress/threshold-time')
      .pipe(catchError(this.errorHandler.handleError()));
  }

  getTestReports(metadataNames: string[], storage: string): Observable<TestListItem[]> {
    return this.http
      .get<TestListItem[]>(`api/metadata/${storage}/`, {
        params: { metadataNames: metadataNames },
      })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  getReport(reportId: number, storage: string): Observable<Report> {
    return this.http
      .get<
        Record<string, Report | string>
      >(`api/report/${storage}/${reportId}/?xml=true&globalTransformer=${localStorage.getItem('transformationEnabled')}`)
      .pipe(
        map((e) => {
          const report = e['report'] as Report;
          report.xml = e['xml'] as string;
          return report;
        }),
        catchError(this.errorHandler.handleError()),
      );
  }

  getReports(reportIds: number[], storage: string): Observable<Record<string, CompareReport>> {
    return this.http
      .get<
        Record<string, CompareReport>
      >(`api/report/${storage}/?xml=true&globalTransformer=${localStorage.getItem('transformationEnabled')}`, { params: { storageIds: reportIds } })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  updateReport(
    reportId: string,
    body: UpdateReport | UpdateCheckpoint | { stub: string | number; checkpointId: string },
    storage: string,
  ): Observable<UpdateReportResponse> {
    return this.http.post<UpdateReportResponse>(`api/report/${storage}/${reportId}`, body).pipe(
      tap(() => this.handleSuccess('Report updated!')),
      catchError(this.errorHandler.handleError()),
    );
  }

  copyReport(data: Record<string, number[]>, storage: string): Observable<void> {
    return this.http.put<void>(`api/report/store/${storage}`, data).pipe(
      tap(() => this.handleSuccess('Report copied!')),
      catchError(this.errorHandler.handleError()),
    );
  }

  updatePath(reportIds: number[], storage: string, map: UpdatePathSettings): Observable<void> {
    return this.http
      .put<void>(`api/report/move/${storage}`, map, {
        params: { storageIds: reportIds },
      })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  uploadReport(formData: FormData): Observable<Report[]> {
    return this.http
      .post<Report[]>('api/report/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .pipe(
        tap(() => this.handleSuccess('Report uploaded!')),
        catchError(this.errorHandler.handleError()),
      );
  }

  uploadReportToStorage(formData: FormData, storage: string): Observable<void> {
    return this.http
      .post<void>(`api/report/upload/${storage}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .pipe(
        tap(() => this.handleSuccess('Report uploaded to storage!')),
        catchError(this.errorHandler.handleError()),
      );
  }

  postSettings(settings: UploadParams): Observable<void> {
    return this.http.post<void>('api/testtool', settings).pipe(
      tap(() => this.handleSuccess('Settings saved!')),
      catchError(this.errorHandler.handleError()),
    );
  }

  postTransformation(transformation: string): Observable<void> {
    return this.http
      .post<void>('api/testtool/transformation', { transformation: transformation })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  getTransformation(defaultTransformation: boolean): Observable<Transformation> {
    return this.http
      .get<Transformation>(`api/testtool/transformation/${defaultTransformation}`)
      .pipe(catchError(this.errorHandler.handleError()));
  }

  getSettings(): Observable<OptionsSettings> {
    return this.http.get<OptionsSettings>('api/testtool').pipe(catchError(this.errorHandler.handleError()));
  }

  resetSettings(): Observable<OptionsSettings> {
    return this.http.get<OptionsSettings>('api/testtool/reset').pipe(catchError(this.errorHandler.handleError()));
  }

  runReport(storage: string, reportId: number): Observable<TestResult> {
    return this.http
      .post<TestResult>(`api/runner/run/${storage}/${reportId}`, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  runDisplayReport(reportId: string, storage: string): Observable<Report> {
    return this.http
      .put<Report>(`api/runner/replace/${storage}/${reportId}`, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  cloneReport(storage: string, storageId: number, map: CloneReport): Observable<void> {
    return this.http.post<void>(`api/report/move/${storage}/${storageId}`, map).pipe(
      tap(() => this.handleSuccess('Report cloned!')),
      catchError(this.errorHandler.handleError()),
    );
  }

  deleteReport(reportIds: number[], storage: string): Observable<void> {
    return this.http
      .delete<void>(`api/report/${storage}`, { params: { storageIds: reportIds } })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  //This endpoint never existed in the backend, so this needs to be refactored
  // replaceReport(reportId: number, storage: string): Observable<void> {
  //   return this.http.put<void>(`api/runner/replace/${storage}/${reportId}`, {
  //     headers: this.headers,
  //   });
  // }

  getUnmatchedCheckpoints(storageName: string, storageId: number, viewName: string): Observable<string[]> {
    return this.http
      .get<string[]>(`api/report/${storageName}/${storageId}/checkpoints/uids`, {
        params: { view: viewName, invert: true },
      })
      .pipe(catchError(this.errorHandler.handleError()));
  }

  getWarningsAndErrors(storageName: string): Observable<string | undefined> {
    const cleanStorageName: string = storageName.replaceAll(' ', '');
    return this.http
      .get(`api/report/warningsAndErrors/${cleanStorageName}`, { responseType: 'text' })
      .pipe(catchError(this.errorHandler.handleError()));
  }
}
