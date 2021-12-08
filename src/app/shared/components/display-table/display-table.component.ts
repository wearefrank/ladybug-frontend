import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-display-table',
  templateUrl: './display-table.component.html',
  styleUrls: ['./display-table.component.css']
})
export class DisplayTableComponent {
  @Input()
  get report() { return this._report}
  set report(report: string) { this._report = report}
  public _report: any = {};

  constructor() { }

}
