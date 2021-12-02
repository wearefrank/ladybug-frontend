import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ToastComponent} from "../components/toast/toast.component";
import {catchError, Observable, of, shareReplay} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  headers = new HttpHeaders().set(
    'Content-Type', 'application/json'
  )

  constructor(private http: HttpClient) { }

  handleError(toast: ToastComponent, message: string) {
    return (error: any): Observable<any> => {
      toast.addAlert({type: 'danger', message: message})
      return of(error)
    }
  }

  getReport(reportId: string, toastComponent: ToastComponent): Observable<any> {
    return this.http.get<any>('api/report/debugStorage/' + reportId)
      .pipe(catchError(this.handleError(toastComponent, 'Could not retrieve data for report!')))
  }

  getReports(limit: number): Observable<any> {
    return this.http.get('api/metadata/debugStorage/', {params: {"limit": limit}}).pipe(shareReplay(1))
  }

  getTestReports(): Observable<any> {
    return this.http.get<any>('api/metadata/testStorage/')
  }

  getMonacoCode(reportId: string, toastComponent: ToastComponent): Observable<any> {
    return this.http.get<any>('api/report/debugStorage/' + reportId + '/?xml=true&globalTransformer=true')
      .pipe(catchError(this.handleError(toastComponent, 'Could not save report!')))
  }

  postReport(reportId: string, toastComponent: ToastComponent, report: any): Observable<any> {
    return this.http.post('api/report/debugStorage/' + reportId, report)
      .pipe(catchError(this.handleError(toastComponent, 'Could not retrieve data for report!')))
  }

  copyReport(data: any, toastComponent: ToastComponent): Observable<void> {
    return this.http.put("api/report/store/testStorage", data)
      .pipe(catchError(this.handleError(toastComponent, 'Could not copy report into test tab!')))
  }

  uploadReport(formData: FormData, toastComponent: ToastComponent): Observable<any> {
    return this.http.post('api/report/upload', formData, {headers: {'Content-Type': 'multipart/form-data'}})
      .pipe(catchError(this.handleError(toastComponent, 'Could not copy report into test tab!')))
  }

  postSettings(settings: any, toastComponent: ToastComponent): Observable<void> {
    return this.http.post('api/testtool', settings)
      .pipe(catchError(this.handleError(toastComponent, 'Could not save settings!')))
  }

  postTransformation(transformation: any, toastComponent: ToastComponent): Observable<void> {
    return this.http.post('api/testtool/transformation', transformation)
      .pipe(catchError(this.handleError(toastComponent, 'Could not save transformation!')))
  }

  getTransformation(toastComponent: ToastComponent): Observable<any> {
    return this.http.get<any>('api/testtool/transformation')
      .pipe(catchError(this.handleError(toastComponent, 'Could not retrieve transformation!')))
  }

  reset(toastComponent: ToastComponent): Observable<void> {
    return this.http.post<any>('api/runner/reset', {})
      .pipe(catchError(this.handleError(toastComponent, 'Could not reset runner!')))
  }

  runReport(report: any, toastComponent: ToastComponent): Observable<void> {
    return this.http.post<any>('api/runner/run/debugStorage', report, {headers: this.headers, observe: "response"})
      .pipe(catchError(this.handleError(toastComponent, 'Could not correctly run report(s)!')))
  }

  queryResults(toastComponent: ToastComponent): Observable<any> {
    return this.http.get('api/runner/result/debugStorage', {headers: this.headers})
      .pipe(catchError(this.handleError(toastComponent, 'Could not retrieve runner results!')))
  }

  deleteReport(reportId: string, toastComponent: ToastComponent): Observable<void> {
    return this.http.delete('api/report/testStorage/' + reportId)
      .pipe(catchError(this.handleError(toastComponent, 'Could not delete report!')))
  }

  replaceReport(reportId: string, toastComponent: ToastComponent): Observable<void> {
    return this.http.put('api/runner/replace/testStorage/' + reportId, {headers: this.headers})
      .pipe(catchError(this.handleError(toastComponent, 'Could not update report!')))
  }
}
