import { Component, Input } from '@angular/core';
import { TreeNode } from '../../interfaces/tree-node';

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
  set report(report: TreeNode) {
    this._report = report;
  }

  public _report: TreeNode = {
    id: -1,
    ladybug: {},
    level: -1,
    root: false,
    text: '',
  };

  constructor() {}
}
