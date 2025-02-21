import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
// The idea of this service is to fetch fixed variables from the backend and store them in the service.
export class AppVariablesService {
  private variables: Record<string, string> = {};

  constructor(private http: HttpClient) {}

  fetchCustomReportActionButtonText(): Observable<Record<string, string> | null> {
    return Object.keys(this.variables).length > 0 ? of(this.variables) : this.http.get<Record<string, string>>('api/report/variables/').pipe(
      tap((data: Record<string, string>) => (this.variables = data)),
      catchError((error) => {
        console.error('Error fetching custom report action button text', error);
        return of(null);
      }),
    );
  }

  getVariable(name: string): string {
    return this.variables[name];
  }
}
