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
    let leftTree = this.helperService.convertReportToJqxTree(leftReport);
    let rightTree = this.helperService.convertReportToJqxTree(rightReport);
    let both = this.iterateToMakeLabelsRed(leftTree, rightTree);

    this.leftTreeReference.createComponent({ height: '100%', source: [both.left] });
    this.rightTreeReference.createComponent({ height: '100%', source: [both.right] });

    this.selectFirstItem();
  }

  selectFirstItem() {
    this.leftTreeReference.selectItem(this.leftTreeReference.getItems()[0]);
    this.rightTreeReference.selectItem(this.rightTreeReference.getItems()[0]);
    this.compareEvent.emit({
      leftReport: this.leftTreeReference.getItems()[0],
      rightReport: this.rightTreeReference.getItems()[0],
    });
  }

  makeLabelsRed(left: any, right: any) {
    left.label = "<span style='color: red;'>" + left.label + '</span>';
    right.label = "<span style='color: red;'>" + right.label + '</span>';
  }

  iterateToMakeLabelsRed(leftItem: any, rightItem: any) {
    let result = this.checkIfLabelsDifferent(leftItem, rightItem);
    let shortestTreeLength = Math.min(leftItem.items.length, rightItem.items.length);

    for (let i = 0; i < shortestTreeLength; i++) {
      let both = this.iterateToMakeLabelsRed(leftItem.items[i], rightItem.items[i]);
      leftItem.items[i] = both.left;
      rightItem.items[i] = both.right;
    }

    return result;
  }

  checkIfLabelsDifferent(left: any, right: any): { left: any; right: any } {
    if (left.parentElement) {
      if (left.value.message !== right.value.message) this.makeLabelsRed(left, right);
    } else {
      if (left.value.xml !== right.value.xml) this.makeLabelsRed(left, right);
    }

    return { left: left, right: right };
  }
}
