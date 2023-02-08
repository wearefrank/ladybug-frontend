import { Component, Input } from '@angular/core';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-display-table',
  templateUrl: './display-table.component.html',
  styleUrls: ['./display-table.component.css'],
})
export class DisplayTableComponent {
  @Input()
  get report() {
    return this._report;
  }
  set report(report: any) {
    this._report = report;
  }

  public _report: any = {};

  constructor(private helperService: HelperService) {}

  getCheckpointType(type: number) {
    return this.helperService.getCheckpointType(type);
  }
}
