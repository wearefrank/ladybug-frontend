import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DynamicService {
  private output = new Subject<any>();
  constructor() {}

  getObservable(): any {
    return this.output.asObservable();
  }
  outputFromDynamicComponent(data: any): void {
    this.output.next(data);
  }
}
