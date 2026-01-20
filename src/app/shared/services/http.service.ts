import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { View } from '../interfaces/view';
import { OptionsSettings } from '../interfaces/options-settings';
import { Report } from '../interfaces/report';
import { CompareReport } from '../interfaces/compare-reports';
import { TestListItem } from '../interfaces/test-list-item';
import { CloneReport } from '../interfaces/clone-report';
import { UploadParameters } from '../interfaces/upload-params';
import { UpdatePathSettings } from '../interfaces/update-path-settings';
import { TestResult } from '../interfaces/test-result';
import { UpdateReport } from '../interfaces/update-report';
import { UpdateCheckpoint } from '../interfaces/update-checkpoint';
import { UpdateReportResponse } from '../interfaces/update-report-response';
import { Transformation } from '../interfaces/transformation';
import { TableSettings } from '../interfaces/table-settings';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly headers: HttpHeaders = new HttpHeaders().set('Content-Type', 'application/json');
  private http = inject(HttpClient);

  // TODO: Debug tab.
  getViews(): Observable<View[]> {
    return this.http.get<Record<string, View>>('api/testtool/views').pipe(map((response) => Object.values(response)));
  }

  // TODO: Debug tab.
  getMetadataReports(settings: TableSettings, view: View): Observable<Report[]> {
    return this.http.get<Report[]>(`api/metadata/${view.storageName}`, {
      params: {
        limit: settings.displayAmount,
        filterHeader: [...settings.currentFilters.keys()],
        filter: [...settings.currentFilters.values()],
        metadataNames: view.metadataNames,
      },
    });
  }

  // TODO: Debug tab.
  getUserHelp(viewName: string, metadataNames: string[]): Observable<Report> {
    return this.http.get<Report>(`api/metadata/${viewName}/userHelp`, {
      params: {
        metadataNames: metadataNames,
      },
    });
  }

  // TODO: Debug tab.
  getMetadataCount(viewName: string): Observable<number> {
    return this.http.get<number>(`api/metadata/${viewName}/count`);
  }

  // TODO: Debug tab.
  getLatestReports(amount: number, viewName: string): Observable<Report[]> {
    return this.http.get<Report[]>(`api/report/latest/${viewName}/${amount}`);
  }

  // TODO: Deubug tab.
  getReportInProgress(index: number): Observable<Report> {
    return this.http.get<Report>(`api/testtool/in-progress/${index}`);
  }

  // TODO: Debug tab.
  deleteReportInProgress(index: number): Observable<Report> {
    return this.http.delete<Report>(`api/testtool/in-progress/${index}`);
  }

  getReportsInProgressThresholdTime(): Observable<number> {
    return this.http.get<number>('api/testtool/in-progress/threshold-time');
  }

  // TODO: Test tab.
  getTestReports(metadataNames: string[], storageName: string): Observable<TestListItem[]> {
    return this.http.get<TestListItem[]>(`api/metadata/${storageName}`, {
      params: { metadataNames: metadataNames },
    });
  }

  // TODO: Both test tab and debug tab.
  getReport(reportId: number, storage: string): Observable<Report> {
    const transformationEnabled = localStorage.getItem('transformationEnabled') === 'true';
    return this.http
      .get<
        Record<string, Report | string>
      >(`api/report/${storage}/${reportId}?xml=true&globalTransformer=${transformationEnabled}`)
      .pipe(
        map((e) => {
          const report = e['report'] as Report;
          report.storageName = storage;
          report.xml = e['xml'] as string;
          return report;
        }),
      );
  }

  // TODO: Both test tab and debug tab.
  getReports(reportIds: number[], storage: string): Observable<Record<string, CompareReport>> {
    const transformationEnabled = localStorage.getItem('transformationEnabled') === 'true';
    return this.http
      .get<
        Record<string, CompareReport>
      >(`api/report/${storage}?xml=true&globalTransformer=${transformationEnabled}`, { params: { storageIds: reportIds } })
      .pipe(
        map((data) => {
          for (const report of reportIds) {
            data[report].report.xml = data[report].xml;
            data[report].report.storageName = storage;
          }
          return data;
        }),
      );
  }

  // TODO: Opened report, can be opened from test tab or debug tab.
  updateReport(
    reportId: string,
    body: UpdateReport | UpdateCheckpoint,
    storage: string,
  ): Observable<UpdateReportResponse> {
    return this.http.post<UpdateReportResponse>(`api/report/${storage}/${reportId}`, body);
  }

  // TODO: Opened report, can be opened from test tab or debug tab.
  copyReport(data: Record<string, number[]>, storage: string): Observable<void> {
    return this.http.put<void>(`api/report/store/${storage}`, data);
  }

  // TODO: test tab.
  updatePath(reportIds: number[], storage: string, map: UpdatePathSettings): Observable<void> {
    return this.http.put<void>(`api/report/move/${storage}`, map, {
      params: { storageIds: reportIds },
    });
  }

  // TODO: Debug tab.
  uploadReport(formData: FormData): Observable<Report[]> {
    return this.http.post<Report[]>('api/report/upload', formData);
  }

  // TODO: Test tab.
  uploadReportToStorage(formData: FormData, storage: string): Observable<void> {
    return this.http.post<void>(`api/report/upload/${storage}`, formData);
  }

  // TODO: Settings of debug tab.
  postSettings(settings: UploadParameters): Observable<void> {
    return this.http.post<void>('api/testtool', settings);
  }

  // TODO: Settings of debug tab.
  postTransformation(transformation: string): Observable<void> {
    return this.http.post<void>('api/testtool/transformation', {
      transformation: transformation,
    });
  }

  // TODO: Settings of debug tab.
  getTransformation(defaultTransformation: boolean): Observable<Transformation> {
    return this.http.get<Transformation>(`api/testtool/transformation/${defaultTransformation}`);
  }

  // TODO: Both debug tab and test tab.
  getSettings(): Observable<OptionsSettings> {
    return this.http.get<OptionsSettings>('api/testtool');
  }

  // TODO: Debug tab.
  resetSettings(): Observable<OptionsSettings> {
    return this.http.get<OptionsSettings>('api/testtool/reset');
  }

  // TODO: Both debug tab and test tab.
  runReport(storage: string, reportId: number): Observable<TestResult> {
    return this.http.post<TestResult>(`api/runner/run/${storage}/${reportId}`, {
      headers: this.headers,
      observe: 'response',
    });
  }

  // TODO: Not used.
  runDisplayReport(reportId: string, storage: string): Observable<Report> {
    return this.http.put<Report>(`api/runner/replace/${storage}/${reportId}`, {
      headers: this.headers,
      observe: 'response',
    });
  }

  cloneReport(storage: string, storageId: number, map: CloneReport): Observable<void> {
    return this.http.post<void>(`api/report/move/${storage}/${storageId}`, map);
  }

  // TODO: Both debug tab and test tab.
  deleteReport(reportIds: number[], storage: string): Observable<void> {
    return this.http.delete<void>(`api/report/${storage}`, {
      params: { storageIds: reportIds },
    });
  }

  // TODO: Both debug tab and test tab.
  deleteAllReports(storage: string): Observable<void> {
    return this.http.delete<void>(`api/report/all/${storage}`);
  }

  //This endpoint never existed in the backend, so this needs to be refactored
  // replaceReport(reportId: number, storage: string): Observable<void> {
  //   return this.http.put<void>(`api/runner/replace/${storage}/${reportId}`, {
  //     headers: this.headers,
  //   });
  // }

  // TODO: Opened report, can have been opened from debug tab or test tab.
  getUnmatchedCheckpoints(storageName: string, storageId: number, viewName: string): Observable<string[]> {
    return this.http.get<string[]>(`api/report/${storageName}/${storageId}/checkpoints/uids`, {
      params: { view: viewName, invert: true },
    });
  }

  // TODO: Debug tab.
  getWarningsAndErrors(storageName: string): Observable<string | undefined> {
    const cleanStorageName: string = storageName.replaceAll(' ', '');
    return this.http.get(`api/report/warningsAndErrors/${cleanStorageName}`, {
      responseType: 'text',
    });
  }

  // TODO: Not related to tabs, initialization.
  getStubStrategies(): Observable<string[]> {
    return this.http.get<string[]>(`api/testtool/stub-strategies`, {
      headers: this.headers,
    });
  }

  // TODO: Not related to tabs, initialization.
  getBackendVersion(): Observable<string> {
    return this.http.get('api/testtool/version', {
      responseType: 'text',
    });
  }

  // TODO: Both debug tab and test tab.
  processCustomReportAction(storage: string, reportIds: number[]): Observable<void> {
    return this.http.post<void>(`api/report/customreportaction?storage=${storage}`, reportIds);
  }
}
