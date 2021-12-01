import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ToastComponent} from "../components/toast/toast.component";
import {catchError, lastValueFrom, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  headers = new HttpHeaders().set(
    'Content-Type', 'application/json'
  )

  constructor(private http: HttpClient) { }

  async getReport(reportId: string, toastComponent: ToastComponent): Promise<any> {
    const request = this.http.get<any>('api/report/debugStorage/' + reportId)
    return await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not retrieve data for report!'})
    });
  }

  getReports(limit: number): Observable<any> {
    return this.http.get('api/metadata/debugStorage/', {params: {"limit": limit}})
  }

  getTestReports(): Observable<any> {
    return this.http.get<any>('api/metadata/testStorage/')
  }

  async getMonacoCode(reportId: string, toastComponent: ToastComponent): Promise<any> {
    const request = this.http.get<any>('api/report/debugStorage/' + reportId + '/?xml=true&globalTransformer=true');
    return await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not retrieve data for report!'})
    })
  }

  /**
   * Save an updated version of a report
   *
   * @param reportId - the report ID
   * @param toastComponent - toast to display error message if needed
   * @param report - the updated report
   */
  async postReport(reportId: string, toastComponent: ToastComponent, report: any): Promise<any> {
    const request = this.http.post('api/report/debugStorage/' + reportId, report);
    return await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: "danger", message: 'Could not save report!'})
    })
  }

  async copyReport(data: any, toastComponent: ToastComponent) {
    const request = this.http.put("api/report/store/testStorage", data);
    await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not copy report into test tab'})
    })
  }

  async uploadReport(formData: FormData, toastComponent: ToastComponent): Promise<any> {
    const request = this.http.post('api/report/upload', formData, {headers: {'Content-Type': 'multipart/form-data'}});
    return await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not upload report!'})
    })
  }

  async postSettings(settings: any, toastComponent: ToastComponent) {
    const request = this.http.post('api/testtool', settings);
    await lastValueFrom(request).catch(() => {
      toastComponent.addAlert( {type: 'danger', message: 'Could not save settings!'})
    })
  }

  async postTransformation(transformation: any, toastComponent: ToastComponent) {
    const request = this.http.post('api/testtool/transformation', transformation);
    await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not save transformation!'})
    })
  }

  async getTransformation(toastComponent: ToastComponent): Promise<any> {
    const request = this.http.get<any>('api/testtool/transformation');
    return await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not retrieve transformation!'})
    })
  }

  async reset(toastComponent: ToastComponent) {
    // @ts-ignore
    const request = this.http.post<any>('api/runner/reset');
    await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not reset runner!'})
    })
  }

  async runReport(report: any, toastComponent: ToastComponent) {
    const request = this.http.post<any>('api/runner/run/debugStorage', report, {headers: this.headers, observe: "response"})
    await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not correctly run report(s)!'})
    })
  }

  async queryResults(toastComponent: ToastComponent): Promise<any> {
    const request = this.http.get('api/runner/result/debugStorage', {headers: this.headers});
    return await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not retrieve runner results!'})
    })
  }

  async deleteReport(reportId: string, toastComponent: ToastComponent) {
    const request = this.http.delete('api/report/testStorage/' + reportId);
    await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not deconste report!'})
    })
  }

  async replaceReport(reportId: string, toastComponent: ToastComponent) {
    const request = this.http.put('api/runner/replace/testStorage/' + reportId, {headers: this.headers});
    await lastValueFrom(request).catch(() => {
      toastComponent.addAlert({type: 'danger', message: 'Could not deconste report!'})
    })
  }
}
