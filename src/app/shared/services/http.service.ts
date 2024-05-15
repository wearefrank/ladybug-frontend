import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { ToastService } from './toast.service';
import { View } from '../interfaces/view';
import { OptionsSettings } from '../interfaces/options-settings';
import { Report } from '../interfaces/report';
import { CompareReport } from '../interfaces/compare-report';
import { TestListItem } from '../interfaces/test-list-item';
import { CloneReport } from '../interfaces/clone-report';
import { UploadParams } from '../interfaces/upload-params';
import { UpdatePathSettings } from '../interfaces/update-path-settings';
import { TestResult } from '../interfaces/test-result';
import { MetaData } from '../interfaces/metadata';
import { DebugVariables } from '../interfaces/debug-variables';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  handleError(): (error: HttpErrorResponse) => Observable<any> {
    return (error: HttpErrorResponse): Observable<any> => {
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
  ): Observable<DebugVariables[]> {
    return this.http.get<DebugVariables[]>('api/metadata/' + storage + '/', {
      params: {
        limit: limit,
        filterHeader: filterHeader,
        filter: regexFilter,
        metadataNames: metadataNames,
      },
    });
  }

  getUserHelp(storage: string, metadataNames: string[]): Observable<Report[]> {
    return this.http.get<Report[]>('api/metadata/' + storage + '/userHelp', {
      params: {
        metadataNames: metadataNames,
      },
    });
  }

  getMetadataCount(storage: string): Observable<number> {
    return this.http.get<number>('api/metadata/' + storage + '/count').pipe(catchError(this.handleError()));
  }

  getLatestReports(amount: number, storage: string): Observable<Report[]> {
    return this.http
      .get<Report[]>('api/report/latest/' + storage + '/' + amount)
      .pipe(tap(() => this.handleSuccess('Latest' + amount + 'reports opened!')))
      .pipe(catchError(this.handleError()));
  }

  getReportInProgress(index: number): Observable<Report> {
    return this.http
      .get<Report>('api/testtool/in-progress/' + index)
      .pipe(tap(() => this.handleSuccess('Opened report in progress with index [' + index + ']')))
      .pipe(catchError(this.handleError()));
  }

  deleteReportInProgress(index: number): Observable<Report> {
    return this.http
      .delete<Report>('api/testtool/in-progress/' + index)
      .pipe(tap(() => this.handleSuccess('Deleted report in progress with index [' + index + ']')))
      .pipe(catchError(this.handleError()));
  }

  getReportsInProgressThresholdTime(): Observable<number> {
    return this.http.get<number>('api/testtool/in-progress/threshold-time').pipe(catchError(this.handleError()));
  }

  getTestReports(metadataNames: string[], storage: string): Observable<TestListItem[]> {
    return this.http.get<TestListItem[]>('api/metadata/' + storage + '/', {
      params: { metadataNames: metadataNames },
    });
  }

  getReport(reportId: string, storage: string): Observable<CompareReport> {
    return this.http
      .get<CompareReport>(
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

  getReports(reportIds: string[], storage: string): Observable<Record<string, CompareReport>> {
    return this.http
      .get<
        Record<string, CompareReport>
      >('api/report/' + storage + '/?xml=true&globalTransformer=' + localStorage.getItem('transformationEnabled'), { params: { storageIds: reportIds } })
      .pipe(catchError(this.handleError()));
  }

  updateReport(reportId: string, params: Report, storage: string): Observable<CompareReport> {
    return this.http
      .post<CompareReport>('api/report/' + storage + '/' + reportId, params)
      .pipe(tap(() => this.handleSuccess('Report updated!')))
      .pipe(catchError(this.handleError()));
  }

  copyReport(data: Record<string, number[]>, storage: string): Observable<void> {
    return this.http
      .put('api/report/store/' + storage, data)
      .pipe(tap(() => this.handleSuccess('Report copied!')))
      .pipe(catchError(this.handleError()));
  }

  updatePath(reportIds: string[], storage: string, map: UpdatePathSettings): Observable<void> {
    return this.http
      .put('api/report/move/' + storage, map, {
        params: { storageIds: reportIds },
      })
      .pipe(catchError(this.handleError()));
  }

  uploadReport(formData: FormData): Observable<Report[]> {
    return this.http
      .post<Report[]>('api/report/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .pipe(tap(() => this.handleSuccess('Report uploaded!')))
      .pipe(catchError(this.handleError()));
  }

  uploadReportToStorage(formData: FormData, storage: string): Observable<void> {
    return this.http
      .post('api/report/upload/' + storage, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .pipe(tap(() => this.handleSuccess('Report uploaded to storage!')))
      .pipe(catchError(this.handleError()));
  }

  postSettings(settings: UploadParams): Observable<void> {
    return this.http
      .post('api/testtool', settings)
      .pipe(tap(() => this.handleSuccess('Settings saved!')))
      .pipe(catchError(this.handleError()));
  }

  postTransformation(transformation: string): Observable<void> {
    return (
      this.http
        .post('api/testtool/transformation', { transformation: transformation })
        // .pipe(tap(() => this.handleSuccess('Transformation saved!')))
        .pipe(catchError(this.handleError()))
    );
  }

  getTransformation(defaultTransformation: boolean): Observable<Record<string, string>> {
    return this.http
      .get<Record<string, string>>('api/testtool/transformation/' + defaultTransformation)
      .pipe(catchError(this.handleError()));
  }

  getSettings(): Observable<OptionsSettings> {
    return this.http.get<OptionsSettings>('api/testtool').pipe(catchError(this.handleError()));
  }

  resetSettings(): Observable<OptionsSettings> {
    return this.http.get<OptionsSettings>('api/testtool/reset').pipe(catchError(this.handleError()));
  }

  reset(): Observable<void> {
    return this.http.post<void>('api/runner/reset', {}).pipe(catchError(this.handleError()));
  }

  runReport(storage: string, targetStorage: string, reportId: string): Observable<TestResult> {
    return this.http
      .post<void>('api/runner/run/' + storage + '/' + targetStorage + '/' + reportId, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(catchError(this.handleError()));
  }

  runDisplayReport(reportId: string, storage: string): Observable<Report> {
    return this.http
      .put<Report>('api/runner/replace/' + storage + '/' + reportId, {
        headers: this.headers,
        observe: 'response',
      })
      .pipe(catchError(this.handleError()));
  }

  cloneReport(storage: string, storageId: string, map: CloneReport): Observable<void> {
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

  getUnmatchedCheckpoints(storageName: string, storageId: string, viewName: string): Observable<string[]> {
    return this.http
      .get<string[]>('api/report/' + storageName + '/' + storageId + '/checkpoints/uids', {
        params: { view: viewName, invert: true },
      })
      .pipe(catchError(this.handleError()));
  }
}
