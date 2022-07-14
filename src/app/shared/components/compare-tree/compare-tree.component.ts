import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Report } from '../../interfaces/report';
import { HelperService } from '../../services/helper.service';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';

@Component({
  selector: 'app-compare-tree',
  templateUrl: './compare-tree.component.html',
  styleUrls: ['./compare-tree.component.css'],
})
export class CompareTreeComponent {
  constructor(private helperService: HelperService) {}
  @Output() compareEvent = new EventEmitter<any>();
  @ViewChild('leftTreeReference') leftTreeReference!: jqxTreeComponent;
  @ViewChild('rightTreeReference') rightTreeReference!: jqxTreeComponent;

  nodeSelected(data: any, left: boolean) {
    let leftReport: any;
    let rightReport: any;
    if (left) {
      leftReport = data.owner.selectedItem;
      rightReport = this.rightTreeReference.getItems()[leftReport.id];
      this.rightTreeReference.selectItem(rightReport);
    } else {
      rightReport = data.owner.selectedItem;
      leftReport = this.leftTreeReference.getItems()[rightReport.id];
      this.leftTreeReference.selectItem(leftReport);
    }

    this.compareEvent.emit({ leftReport: leftReport, rightReport: rightReport });
  }

  createTrees(leftReport: Report, rightReport: Report) {
    this.leftTreeReference.createComponent({
      height: '100%',
      source: [this.helperService.convertReportToJqxTree(leftReport)],
    });
    this.rightTreeReference.createComponent({
      height: '100%',
      source: [this.helperService.convertReportToJqxTree(rightReport)],
    });

    this.leftTreeReference.selectItem(this.leftTreeReference.getItems()[0]);
    this.rightTreeReference.selectItem(this.rightTreeReference.getItems()[0]);
    this.compareEvent.emit({
      leftReport: this.leftTreeReference.getItems()[0],
      rightReport: this.rightTreeReference.getItems()[0],
    });
  }
}
