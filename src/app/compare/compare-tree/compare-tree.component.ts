import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { HelperService } from '../../shared/services/helper.service';
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
      let index = this.leftTreeReference.getItems().findIndex((item: any) => item.id == leftReport.id);
      rightReport = this.rightTreeReference.getItems()[index];
      this.rightTreeReference.selectItem(rightReport);
    } else {
      rightReport = data.owner.selectedItem;
      let index = this.rightTreeReference.getItems().findIndex((item: any) => item.id == rightReport.id);
      leftReport = this.leftTreeReference.getItems()[index];
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
    this.redLabel(left);
    this.redLabel(right);
  }

  redLabel(item: any) {
    item.label = "<span style='color: red;'>" + item.label + '</span>';
  }

  iterateToMakeLabelsRed(leftItem: any, rightItem: any) {
    let result = this.checkIfLabelsDifferent(leftItem, rightItem);
    let shortestTreeLength = Math.min(leftItem.items.length, rightItem.items.length);
    this.makeRestOfTreesRed(shortestTreeLength, rightItem.items, leftItem.items);

    for (let i = 0; i < shortestTreeLength; i++) {
      let both = this.iterateToMakeLabelsRed(leftItem.items[i], rightItem.items[i]);
      leftItem.items[i] = both.left;
      rightItem.items[i] = both.right;
    }

    return result;
  }

  makeRestOfTreesRed(startPoint: number, leftItems: any[], rightItems: any[]) {
    let items = leftItems;
    if (rightItems.length > leftItems.length) items = rightItems;
    for (let i = startPoint; i < items.length; i++) {
      this.redLabel(items[i]);
    }
  }

  checkIfLabelsDifferent(left: any, right: any): { left: any; right: any } {
    if (left.level > -1) {
      if (left.value.message !== right.value.message) this.makeLabelsRed(left, right);
    } else {
      if (left.value.xml !== right.value.xml) this.makeLabelsRed(left, right);
    }

    return { left: left, right: right };
  }
}
