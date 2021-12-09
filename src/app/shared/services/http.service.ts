import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ToastComponent} from "../components/toast/toast.component";
import {catchError, finalize, Observable, of, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  headers = new HttpHeaders().set(
    'Content-Type', 'application/json'
  )
  toastComponent!: ToastComponent;

  constructor(private http: HttpClient) { }

  initializeToastComponent(toastComponent: ToastComponent) {
    this.toastComponent = toastComponent;
  }

  handleError(message: string) {
    return (error: any): Observable<any> => {
      this.toastComponent.addAlert({type: 'danger', message: message})
      return of(error)
    }
  }

  handleSuccess(message: string) {
    this.toastComponent.addAlert({type: 'success', message: message})
  }

  getReports(limit: number): Observable<any> {
    return this.http.get('api/metadata/debugStorage/', {params: {"limit": limit}})
  }

  getTestReports(): Observable<any> {
    return this.http.get<any>('api/metadata/testStorage/')
  }

  getReport(reportId: string): Observable<any> {
    return this.http.get<any>('api/report/debugStorage/' + reportId)
      .pipe(tap(() => this.handleSuccess('Report opened!')))
      .pipe(catchError(this.handleError('Could not retrieve data for report!')))
  }

  getMonacoCode(reportId: string): Observable<any> {
    return this.http.get<any>('api/report/debugStorage/' + reportId + '/?xml=true&globalTransformer=true')
      .pipe(catchError(this.handleError('Could not retrieve monaco code!')))
  }

  postReport(reportId: string, report: any): Observable<any> {
    return this.http.post('api/report/debugStorage/' + reportId, report)
      .pipe(tap(() => this.handleSuccess('Report updated!')))
      .pipe(catchError(this.handleError('Could not retrieve data for report!')))
  }

  copyReport(data: any): Observable<void> {
    return this.http.put("api/report/store/testStorage", data)
      .pipe(tap(() => this.handleSuccess('Report copied!')))
      .pipe(catchError(this.handleError('Could not copy report into test tab!')))
  }

  uploadReport(formData: FormData): Observable<void> {
    return this.http.post('api/report/upload', formData, {headers: {'Content-Type': 'multipart/form-data'}})
      .pipe(tap(() => this.handleSuccess('Report uploaded!')))
      .pipe(catchError(this.handleError('Could not copy report into test tab!')))
  }

  postSettings(settings: any): Observable<void> {
    return this.http.post('api/testtool', settings)
      .pipe(catchError(this.handleError('Could not save settings!')))
  }

  postTransformation(transformation: any): Observable<void> {
    return this.http.post('api/testtool/transformation', transformation)
      .pipe(catchError(this.handleError('Could not save transformation!')))
  }

  getTransformation(): Observable<any> {
    return this.http.get<any>('api/testtool/transformation')
      .pipe(catchError(this.handleError('Could not retrieve transformation!')))
  }

  reset(): Observable<void> {
    return this.http.post<any>('api/runner/reset', {})
      .pipe(catchError(this.handleError('Could not reset runner!')))
  }

  runReport(report: any): Observable<void> {
    return this.http.post<any>('api/runner/run/debugStorage', report, {headers: this.headers, observe: "response"})
      .pipe(catchError(this.handleError('Could not correctly run report(s)!')))
  }

  queryResults(): Observable<any> {
    return this.http.get('api/runner/result/debugStorage', {headers: this.headers})
      .pipe(tap(() => this.handleSuccess('Test run(s) completed!')))
      .pipe(catchError(this.handleError('Could not retrieve runner results!')))
  }

  deleteReport(reportId: string): Observable<void> {
    return this.http.delete('api/report/testStorage/' + reportId)
      .pipe(tap(() => this.handleSuccess('Report deleted!')))
      .pipe(catchError(this.handleError('Could not delete report!')))
  }

  replaceReport(reportId: string): Observable<void> {
    return this.http.put('api/runner/replace/testStorage/' + reportId, {headers: this.headers})
      .pipe(catchError(this.handleError('Could not update report!')))
  }
}
