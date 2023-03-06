import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChangeNodeLinkStrategyService {
  changeNodeLinkStrategy = new Subject<void>();
  constructor() {}
}
