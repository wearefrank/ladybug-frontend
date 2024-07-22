import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
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
    );
  }

  getMetadataReports(
    limit: number,
    regexFilter: string[],
    filterHeader: string[],
    metadataNames: string[],
    storage: string,
  ): Observable<Report[]> {
    return this.http.get<Report[]>(`api/metadata/${storage}/`, {
      params: {
        limit: limit,
        filterHeader: filterHeader,
        filter: regexFilter,
        metadataNames: metadataNames,
      },
    });
  }

  getUserHelp(storage: string, metadataNames: string[]): Observable<Report> {
    return this.http.get<Report>(`api/metadata/${storage}/userHelp`, {
      params: {
        metadataNames: metadataNames,
      },
    });
  }

  getMetadataCount(storage: string): Observable<number> {
    return this.http.get<number>(`api/metadata/${storage}/count`);
  }

  getLatestReports(amount: number, storage: string): Observable<Report[]> {
    return this.http
      .get<Report[]>(`api/report/latest/${storage}/${amount}`)
      .pipe(tap(() => this.handleSuccess('Latest' + amount + 'reports opened!')));
  }

  getReportInProgress(index: number): Observable<Report> {
    return this.http
      .get<Report>(`api/testtool/in-progress/${index}`)
      .pipe(tap(() => this.handleSuccess(`Opened report in progress with index [${index}]`)));
  }

  deleteReportInProgress(index: number): Observable<Report> {
    return this.http
      .delete<Report>('api/testtool/in-progress/' + index)
      .pipe(tap(() => this.handleSuccess(`Deleted report in progress with index [${index}]`)));
  }

  getReportsInProgressThresholdTime(): Observable<number> {
    return this.http.get<number>('api/testtool/in-progress/threshold-time');
  }

  getTestReports(metadataNames: string[], storage: string): Observable<TestListItem[]> {
    return this.http.get<TestListItem[]>(`api/metadata/${storage}/`, {
      params: { metadataNames: metadataNames },
    });
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
      );
  }

  getReports(reportIds: number[], storage: string): Observable<Record<string, CompareReport>> {
    return this.http.get<Record<string, CompareReport>>(
      `api/report/${storage}/?xml=true&globalTransformer=${localStorage.getItem('transformationEnabled')}`,
      { params: { storageIds: reportIds } },
    );
  }

  updateReport(reportId: string, body: UpdateReport | UpdateCheckpoint, storage: string): Observable<void> {
    return this.http
      .post<void>(`api/report/${storage}/${reportId}`, body)
      .pipe(tap(() => this.handleSuccess('Report updated!')));
  }

  copyReport(data: Record<string, number[]>, storage: string): Observable<void> {
    return this.http
      .put<void>(`api/report/store/${storage}`, data)
      .pipe(tap(() => this.handleSuccess('Report copied!')));
  }

  updatePath(reportIds: number[], storage: string, map: UpdatePathSettings): Observable<void> {
    return this.http.put<void>(`api/report/move/${storage}`, map, {
      params: { storageIds: reportIds },
    });
  }

  uploadReport(formData: FormData): Observable<Report[]> {
    return this.http
      .post<Report[]>('api/report/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .pipe(tap(() => this.handleSuccess('Report uploaded!')));
  }

  uploadReportToStorage(formData: FormData, storage: string): Observable<void> {
    return this.http
      .post<void>(`api/report/upload/${storage}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .pipe(tap(() => this.handleSuccess('Report uploaded to storage!')));
  }

  postSettings(settings: UploadParams): Observable<void> {
    return this.http.post<void>('api/testtool', settings).pipe(tap(() => this.handleSuccess('Settings saved!')));
  }

  postTransformation(transformation: string): Observable<void> {
    return this.http.post<void>('api/testtool/transformation', { transformation: transformation });
    // .pipe(tap(() => this.handleSuccess('Transformation saved!')))
  }

  getTransformation(defaultTransformation: boolean): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`api/testtool/transformation/${defaultTransformation}`);
  }

  getSettings(): Observable<OptionsSettings> {
    return this.http.get<OptionsSettings>('api/testtool');
  }

  resetSettings(): Observable<OptionsSettings> {
    return this.http.get<OptionsSettings>('api/testtool/reset');
  }

  runReport(storage: string, reportId: number): Observable<TestResult> {
    return this.http.post<TestResult>(`api/runner/run/${storage}/${reportId}`, {
      headers: this.headers,
      observe: 'response',
    });
  }

  runDisplayReport(reportId: string, storage: string): Observable<Report> {
    return this.http.put<Report>(`api/runner/replace/${storage}/${reportId}`, {
      headers: this.headers,
      observe: 'response',
    });
  }

  cloneReport(storage: string, storageId: number, map: CloneReport): Observable<void> {
    return this.http
      .post<void>(`api/report/move/${storage}/${storageId}`, map)
      .pipe(tap(() => this.handleSuccess('Report cloned!')));
  }

  deleteReport(reportIds: number[], storage: string): Observable<void> {
    return this.http.delete<void>(`api/report/${storage}`, { params: { storageIds: reportIds } });
  }

  replaceReport(reportId: string, storage: string): Observable<void> {
    return this.http.put<void>(`api/runner/replace/${storage}/${reportId}`, {
      headers: this.headers,
    });
  }

  getUnmatchedCheckpoints(storageName: string, storageId: number, viewName: string): Observable<void> {
    return this.http.get<void>(`api/report/${storageName}/${storageId}/checkpoints/uids`, {
      params: { view: viewName, invert: true },
    });
  }

  getWarningsAndErrors(storageName: string): Observable<string | undefined> {
    const cleanStorageName = storageName.replaceAll(' ', '');
    return this.http.get(`api/report/warningsAndErrors/${cleanStorageName}`, { responseType: 'text' });
  }
}
